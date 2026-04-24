#!/bin/bash
# Idempotent setup script for Aether Holdings on Ubuntu 22.04/24.04
# Run as non-root user with sudo privileges.
# Usage: chmod +x setup.sh && ./setup.sh

set -euo pipefail

# ── Configuration ──
APP_DIR="$HOME/aether-holdings"
REPO_URL="https://github.com/YOUR_USERNAME/aether-holdings.git"  # <-- change to your repo
PORT=${PORT:-3000}
NODE_VERSION="20"
ENV_FILE="$APP_DIR/.env.local"

# ── Helper Functions ──
log() { echo -e "\033[1;34m[setup]\033[0m $*"; }
success() { echo -e "\033[1;32m[ok]\033[0m $*"; }
warn() { echo -e "\033[1;33m[warn]\033[0m $*"; }
error() { echo -e "\033[1;31m[error]\033[0m $*"; exit 1; }

# ── System Prep ──
log "Updating system..."
sudo apt-get update -qq && sudo apt-get upgrade -y -qq

# ── Install Core Deps ──
log "Installing core dependencies..."
sudo apt-get install -y -qq \
  curl wget git build-essential gnupg2 \
  ufw certbot python3-pip nginx

# ── Node.js (via nodesource) ──
if ! command -v node &>/dev/null || [[ "$(node --version)" != *"v$NODE_VERSION"* ]]; then
  log "Installing Node.js $NODE_VERSION..."
  curl -fsSL https://deb.nodesource.com/setup_$NODE_VERSION.x | sudo -E bash -
  sudo apt-get install -y -qq nodejs
  success "Node $(node --version) installed"
else
  success "Node $(node --version) already installed"
fi

# ── Clone / Update Repository ──
if [ ! -d "$APP_DIR" ]; then
  log "Cloning repository into $APP_DIR..."
  git clone "$REPO_URL" "$APP_DIR"
else
  log "Repository found. Pulling latest changes..."
  cd "$APP_DIR" && git pull
fi

cd "$APP_DIR"

# ── Install Dependencies ──
log "Installing npm dependencies..."
npm ci || npm install

# ── Environment File ──
if [ ! -f "$ENV_FILE" ]; then
  log "Creating .env.local template..."
  cat > "$ENV_FILE" <<-EOF
	# ── Server ──
	PORT=$PORT
	NEXT_PUBLIC_BASE_URL=http://localhost:$PORT

	# ── Bitcart (optional, for deposits) ──
	# BITCART_URL=https://your-bitcart-instance.com
	# BITCART_API_KEY=your_api_key
	# BITCART_STORE_ID=1
	# NEXT_PUBLIC_BITCART_URL=\$BITCART_URL

	# ── SMTP (for OTP emails) ──
	# Example Gmail:
	# SMTP_HOST=smtp.gmail.com
	# SMTP_PORT=587
	# SMTP_SECURE=false
	# SMTP_USER=your-email@gmail.com
	# SMTP_PASS=your-app-password
	# SMTP_FROM="Aether <your-email@gmail.com>"

	# Example ZeptoMail:
	# SMTP_HOST=smtp.zeptomail.com
	# SMTP_PORT=587
	# SMTP_SECURE=false
	# SMTP_USER=apikey
	# SMTP_PASS=your-zeptomail-api-key
	# SMTP_FROM="Aether <sender@yourdomain.com>"
EOF
  warn ".env.local created — please configure SMTP/Bitcart before production use"
else
  success ".env.local already exists"
fi

# ── Build Application ──
log "Building application (this may take a minute)..."
npm run build
success "Build complete"

# ── Systemd Service ──
SERVICE_NAME="aether-holdings"
SERVICE_FILE="/etc/systemd/system/$SERVICE_NAME.service"

log "Installing systemd service..."
sudo bash -c "cat > $SERVICE_FILE" <<-EOF
	[Unit]
	Description=Aether Holdings - Next.js App
	After=network.target

	[Service]
	Type=simple
	User=$(whoami)
	WorkingDirectory=$APP_DIR
	Environment=NODE_ENV=production
	EnvironmentFile=$ENV_FILE
	ExecStart=/usr/bin/node server.js
	Restart=on-failure
	RestartSec=5
	StandardOutput=journal
	StandardError=journal

	[Install]
	WantedBy=multi-user.target
EOF

# Because Next.js doesn’t output server.js by default, we’ll use PM2 instead for dev-like prod
# (You can use `next start` via pm2 or systemd with `ExecStart=npm run start`)

# ── PM2 Process Manager (Recommended) ──
if ! command -v pm2 &>/dev/null; then
  log "Installing PM2..."
  sudo npm install -g pm2
fi

# Stop existing instance if any
pm2 delete "$SERVICE_NAME" 2>/dev/null || true

log "Starting app with PM2..."
cd "$APP_DIR"
pm2 start npm --name "$SERVICE_NAME" -- start
pm2 save
pm2 startup systemd -u $(whoami) --hp /home/$(whoami) | sudo bash

success "PM2 process started and enabled on boot"

# ── Firewall (UFW) ──
log "Configuring firewall..."
sudo ufw allow OpenSSH
sudo ufw allow "$PORT"
sudo ufw --force enable
success "Firewall enabled"

# ── Nginx Reverse Proxy (Optional but recommended) ──
log "Setting up Nginx reverse proxy..."
sudo bash -c "cat > /etc/nginx/sites-available/aether" <<-EOF
	server {
		listen 80;
		server_name _;

		location / {
			proxy_pass http://127.0.0.1:$PORT;
			proxy_http_version 1.1;
			proxy_set_header Upgrade \$http_upgrade;
			proxy_set_header Connection 'upgrade';
			proxy_set_header Host \$host;
			proxy_set_header X-Real-IP \$remote_addr;
			proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
			proxy_set_header X-Forwarded-Proto \$scheme;
			proxy_cache_bypass \$http_upgrade;
		}
	}
EOF

sudo ln -sf /etc/nginx/sites-available/aether /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
success "Nginx configured and reloaded"

# ── Done ──
echo ""
success "Setup complete!"
echo "App is running on http://<your-server-ip>:$PORT"
echo "Nginx proxy active on port 80"
echo ""
echo "Next steps:"
echo "  • Point your domain to this server (A record)"
echo "  • Configure SMTP in $ENV_FILE for OTP emails"
echo "  • Configure Bitcart credentials for automatic deposit tracking"
echo "  • Set up SSL with: sudo certbot --nginx"
