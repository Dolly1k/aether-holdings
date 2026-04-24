#!/bin/bash
# =============================================================================
# Aether Holdings — Idempotent Production Deploy Script
# Ubuntu 22.04 / 24.04
# Usage:  sudo bash deploy.sh
# Safe to re-run anytime.
# =============================================================================

set -euo pipefail

# ---- CONFIG — edit these before running ----
DOMAIN="aetherholdings.org"
BITCART_SUBDOMAIN="bitcart.aetherholdings.org"
REPO_URL="https://github.com/Dolly1k/aether-holdings.git"
APP_DIR="/opt/aether-holdings"
BITCART_DIR="/opt/bitcart"
LETSENCRYPT_EMAIL="noreply@aetherholdings.org"

# ---- Cloudflare Origin Certificate (optional - if using Cloudflare proxy) ----
# Set to "true" to use Cloudflare Origin Certificate instead of Let's Encrypt
USE_CLOUDFLARE_CERT="true"
CLOUDFLARE_CERT="/etc/ssl/certs/cloudflare-origin.pem"
CLOUDFLARE_KEY="/etc/ssl/private/cloudflare-origin.key"

# ---- SMTP (ZeptoMail) ----
SMTP_HOST="smtp.zeptomail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="emailapikey"
SMTP_PASS="wSsVR61y/kSiC/x/mTKpLrpsmV8HB16jRkQsjFGo6H/4Fq/K9sc9xEzLBAGuFaIcGGA9EjsS9e4qm0pV1WBfjYgtwlhUDCiF9mqRe1U4J3x17qnvhDzPXWVckBOAL4sNxgRommJpEckr+g=="
SMTP_FROM_EMAIL="noreply@aetherholdings.org"

# ---- BITCART ----
BITCART_ADMIN_TOKEN="Dl0o_Gsh1gnPBj4UFZiy7RgAAhw1QutgvSyE_Kklu9A"

# ================================================================
#  Functions
# ================================================================
log()     { echo -e "\033[1;34m[deploy]\033[0m $*"; }
success() { echo -e "\033[1;32m[ok]\033[0m $*"; }
warn()    { echo -e "\033[1;33m[warn]\033[0m $*"; }
error()   { echo -e "\033[1;31m[error]\033[0m $*"; exit 1; }

ensure_pkg() {
  for pkg in "$@"; do
    if ! dpkg -s "$pkg" >/dev/null 2>&1; then
      log "Installing $pkg..."
      apt-get install -y "$pkg"
    fi
  done
}

# ================================================================
#  1. System prep
# ================================================================
log "Updating apt cache..."
apt-get update

ensure_pkg curl wget git nginx certbot python3-certbot-nginx docker.io docker-compose ufw

# Node 20
if ! command -v node >/dev/null 2>&1 || [[ "$(node -v)" != v20* ]]; then
  log "Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
success "Node: $(node -v)"

# ================================================================
#  2. Clone / update Aether
# ================================================================
if [ ! -d "$APP_DIR/.git" ]; then
  log "Cloning Aether repo..."
  git clone "$REPO_URL" "$APP_DIR"
else
  log "Pulling latest Aether code..."
  cd "$APP_DIR" && git pull
fi

cd "$APP_DIR"

log "Installing npm deps..."
npm install --no-audit --no-fund

log "Building app..."
npm run build
success "Build complete"

# ================================================================
#  3. Write .env.local (idempotent)
# ================================================================
ENV_FILE="$APP_DIR/.env.local"
log "Writing $ENV_FILE..."
cat > "$ENV_FILE" <<EOF
PORT=3000
NEXT_PUBLIC_BASE_URL=https://$DOMAIN

# Bitcart
BITCART_URL=https://$BITCART_SUBDOMAIN
BITCART_API_KEY=$BITCART_ADMIN_TOKEN
BITCART_STORE_ID=1
NEXT_PUBLIC_BITCART_URL=https://$BITCART_SUBDOMAIN

# SMTP (ZeptoMail)
SMTP_HOST=$SMTP_HOST
SMTP_PORT=$SMTP_PORT
SMTP_SECURE=$SMTP_SECURE
SMTP_USER=$SMTP_USER
SMTP_PASS=$SMTP_PASS
SMTP_FROM=Aether <$SMTP_FROM_EMAIL>
EOF
chmod 600 "$ENV_FILE"
success ".env.local written"

# ================================================================
#  4. systemd service for Aether
# ================================================================
NEXT_BIN="$APP_DIR/node_modules/.bin/next"
cat > /etc/systemd/system/aether.service <<EOF
[Unit]
Description=Aether Holdings
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$APP_DIR
EnvironmentFile=$APP_DIR/.env.local
ExecStart=$NEXT_BIN start -p 3000 -H 0.0.0.0
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable aether >/dev/null
systemctl restart aether
sleep 2
if systemctl is-active --quiet aether; then
  success "Aether service running"
else
  error "Aether failed to start — run: journalctl -u aether -n 50"
fi

# ================================================================
#  5. Bitcart (Docker)
# ================================================================
if [ ! -d "$BITCART_DIR/.git" ]; then
  log "Cloning Bitcart..."
  git clone https://github.com/bitcart/bitcart-docker.git "$BITCART_DIR"
fi
cd "$BITCART_DIR"

# Set environment variables for setup.sh
export BITCART_HOST=$BITCART_SUBDOMAIN
export BITCART_ADMIN_TOKEN=$BITCART_ADMIN_TOKEN
export BITCART_REVERSEPROXY=nginx

log "Running Bitcart setup..."
./setup.sh

# ================================================================
#  6. SSL (certbot or Cloudflare Origin) - MUST be before nginx config
# ================================================================
if [ "$USE_CLOUDFLARE_CERT" = "true" ]; then
  log "Installing Cloudflare Origin Certificate..."
  mkdir -p /etc/ssl/certs /etc/ssl/private
  
  # Write certificate in PEM format
  cat > "$CLOUDFLARE_CERT" <<'EOF'
-----BEGIN CERTIFICATE-----
MIIEsDCCA5igAwIBAgIUNH4N5HeWnY0DapUa1yAMNqwLCKYwDQYJKoZIhvcNAQEL
BQAwgYsxCzAJBgNVBAYTAlVTMRkwFwYDVQQKExBDbG91ZEZsYXJlLCBJbmMuMTQw
MgYDVQQLEytDbG91ZEZsYXJlIE9yaWdpbiBTU0wgQ2VydGlmaWNhdGUgQXV0aG9y
aXR5MRYwFAYDVQQHEw1TYW4gRnJhbmNpc2NvMRMwEQYDVQQIEwpDYWxpZm9ybmlh
MB4XDTI2MDQyNDExNDEwMFoXDTQxMDQyMDExNDEwMFowYjEZMBcGA1UEChMQQ2xv
dWRGbGFyZSwgSW5jLjEdMBsGA1UECxMUQ2xvdWRGbGFyZSBPcmlnaW4gQ0ExJjAk
BgNVBAMTHUNsb3VkRmxhcmUgT3JpZ2luIENlcnRpZmljYXRlMIIBIjANBgkqhkiG
9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtAkfv2TWYUTeQV1W2ReEt4Gnj+MQX0EK858j
imUCHNWjKIiQMnMzcadxvReE/1zmGNRKgXE8uYvJjO2Bwtu9KcQsyuazP5Vpv1kN
W1eOn+i4AxTrw97dJXZanVCcR1DJT9YBAUDCJsJzDKqBxWB5BYwsbaR7TKhDRXyV
w2yhCc0iqlGakODHL9jUxGpCMWCssW10Rv4q1v5L1yWxi4i/a1jFnMPPM8vUNUOZ
ktL4nt05RlIl5lg4SED8Vb3CJfFGD0ObtpdVDRVnnh1c9hSI3apRCE5orR4RoXBF
e033CiMI1JH5iKGUdMgDt1V65pc1cdI8UqvPPUNMjiOKm5T8awIDAQABo4IBMjCC
AS4wDgYDVR0PAQH/BAQDAgWgMB0GA1UdJQQWMBQGCCsGAQUFBwMCBggrBgEFBQcD
ATAMBgNVHRMBAf8EAjAAMB0GA1UdDgQWBBRhRlo3wLr7McMq8J7g0azXp6VX2TAf
BgNVHSMEGDAWgBQk6FNXXXw0QIep65TbuuEWePwppDBABggrBgEFBQcBAQQ0MDIw
MAYIKwYBBQUHMAGGJGh0dHA6Ly9vY3NwLmNsb3VkZmxhcmUuY29tL29yaWdpbl9j
YTAzBgNVHREELDAqghQqLmFldGhlcmhvbGRpbmdzLm9yZ4ISYWV0aGVyaG9sZGlu
Z3Mub3JnMDgGA1UdHwQxMC8wLaAroCmGJ2h0dHA6Ly9jcmwuY2xvdWRmbGFyZS5j
b20vb3JpZ2luX2NhLmNybDANBgkqhkiG9w0BAQsFAAOCAQEAJ3nA0inxiBx/JXvU
L8YbhcqWQfM2kDkqcPMjIcLYKrZieqRMyDHEvCJtvc/GxFfs61vop8DBa8i0qiFV
xCcbNR7kY2gbCfoFkw91b/qhLr8Iv1JwgAI2C7fzNb+FZSgvyiJAOUVZun0O/2Mg
hQe+lgb5lXfNd8gLM735yNj/TfU6B5/WQ/drJoO2S0CaI7YjYRiNq0aBQ5frJU6v
yGzC5lnq7Raa+3SeXxs4TaxKCYXjUbCa7gGbsHgC+rt0jx/ZLVu/JpH0PaHLjB0E
zpH9mzTo163DcGi0Ia0KIPihPtWHTvfjZz3egoHyZnLkUo1h7ACnRQAq9h4VqHdx
SRX49Q==
-----END CERTIFICATE-----
EOF
  
  # Write private key in PEM format
  cat > "$CLOUDFLARE_KEY" <<'EOF'
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC0CR+/ZNZhRN5B
XVbZF4S3gaeP4xBfQQrznyOKZQIc1aMoiJAyczNxp3G9F4T/XOYY1EqBcTy5i8mM
7YHC270pxCzK5rM/lWm/WQ1bV46f6LgDFOvD3t0ldlqdUJxHUMlP1gEBQMImwnMM
qoHFYHkFjCxtpHtMqENFfJXDbKEJzSKqUZqQ4Mcv2NTEakIxYKyxbXRG/irW/kvX
JbGLiL9rWMWcw88zy9Q1Q5mS0vie3TlGUiXmWDhIQPxVvcIl8UYPQ5u2l1UNFWee
HVz2FIjdqlEITmitHhGhcEV7TfcKIwjUkfmIoZR0yAO3VXrmlzVx0jxSq889Q0yO
I4qblPxrAgMBAAECggEAB754uh/ZRNfUg5VDPhVP5SDTl1HaC27dzLrkqXhMzfa2
jPDK2xCvfs0IDG0tkFprn1fKWKUJSqXjpoc01K/lBB3nG1cvEKYZpVxsQaiTfvdg
qulEduloM8tSfH/SKRMlhaSb6HTjpQ0qK7pN2LKcogt0gcbYcuSt+BgyzPQoPSae
LX695PldFVq1VXYHnoYo2HWh3bp63SFvoWVMKbWHrXG8mMYJB3jBxns0Wq+d4OsI
DL+ZhyPiFSZoV7z0+wAZb6lqM6AuaefDg3JfVQKdL4m/IdtuIucFjpOsKbnP7ECh
ZK8CsBDGWXUBfaowLWb0K6if1o0oDUiH56Z1F9ODSQKBgQDtsqvgyikqlCQUk3jn
RAFXQAtbqgCaIC0ey5Pw6VyA5aWMdZ/lrscObAkzzC6uCA/9jqo/8ykq3mwRQGu0
m/2n6YL63LVBJvcFGS0TIeH0tZxAF+TSIovWs+iFI8sGSKQ2rfUEfSUmOE7N6gwP
5YxHR6bvVfiEEGGTDXJmPgLFtQKBgQDB5dr/RgNA0pNcMQAmemyPDXI7LhPCsj/O
nZoltP+2CJ0m8a9q+NLk6b2i5xB9CDwG+bVQOVgrj2ItdDE0UdKFvZquYOLkNuzx
5JMLULTJLVQFiGGY30jnJP7rtsagp0qLj6V1uBQMrsYiCOOKdlw/BdzicsHE0uyy
IWWcB8oNnwKBgHj8rrvWaqm/ibXncmzUkpIkiSN5HqFUq2K3YHAJeAor2d3qqR6x
naRbnTt+PGxcsjbvfPzb+iJV4E/PqILfu3bSRtcFrESjXqx7qhPI9UgngIanItNK
vj7kh//svhROuTcTyFkmkdgoZQQuk0EsKADIGdJMwhgGdoPxHj+oZKTZAoGABT+h
k/NjNyf8ESzKYkBCHAUzKGLw6f5FN+SQPaEOovDMwDcelnixzLx/A5/ZlGjapx2v
SMKknlk9QRm6Ez57wl8Fht7chWzvMQUM7et7WU6+zX+JlMfGg2s+80Z5TfP5UpnK
0sru0AETH+y5rA/UI2iXOBH/KMLE4XWB+J1FXOUCgYEA4ttDL1D3UVvmEn1RQBlu
kHWNc6e6xUXXxl60+QZHg7okPuWi6T0nPeFOR+FwZ+WmUSMCL4ydpQfza12+oLiz
UjEYImesxD6RoeuPa/zU/T5CYUeDYgDsyGZDcuu7GAApD0KjRvplSprTfGGtW0Qo
DmaCQbgEMpkMlL3/h2+W2IU=
-----END PRIVATE KEY-----
EOF
  
  chmod 644 "$CLOUDFLARE_CERT"
  chmod 600 "$CLOUDFLARE_KEY"
  success "Cloudflare Origin Certificate installed"
fi

# ================================================================
#  7. Nginx configs
# ================================================================
log "Writing Nginx configs..."

# Remove default site first
rm -f /etc/nginx/sites-enabled/default

if [ "$USE_CLOUDFLARE_CERT" = "true" ]; then
  cat > /etc/nginx/sites-available/aether <<EOF
server {
    listen 80 default_server;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2 default_server;
    server_name $DOMAIN www.$DOMAIN;

    ssl_certificate $CLOUDFLARE_CERT;
    ssl_certificate_key $CLOUDFLARE_KEY;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

  cat > /etc/nginx/sites-available/bitcart <<EOF
server {
    listen 80;
    server_name $BITCART_SUBDOMAIN;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $BITCART_SUBDOMAIN;

    ssl_certificate $CLOUDFLARE_CERT;
    ssl_certificate_key $CLOUDFLARE_KEY;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
else
  cat > /etc/nginx/sites-available/aether <<EOF
server {
    listen 80 default_server;
    server_name $DOMAIN www.$DOMAIN;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

  cat > /etc/nginx/sites-available/bitcart <<EOF
server {
    listen 80;
    server_name $BITCART_SUBDOMAIN;
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
fi

ln -sf /etc/nginx/sites-available/aether /etc/nginx/sites-enabled/aether
ln -sf /etc/nginx/sites-available/bitcart /etc/nginx/sites-enabled/bitcart
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
success "Nginx reloaded"

# ================================================================
#  8. Firewall
# ================================================================
ufw allow 'Nginx Full' >/dev/null 2>&1 || true
ufw allow OpenSSH     >/dev/null 2>&1 || true
ufw --force enable    >/dev/null 2>&1 || true

# ================================================================
#  DONE
# ================================================================
echo ""
success "Deployment complete."
echo "  → https://$DOMAIN"
echo "  → https://$BITCART_SUBDOMAIN   (Bitcart admin)"
echo ""
echo "Restart app:         systemctl restart aether"
echo "View logs:           journalctl -u aether -f"
echo "Bitcart logs:        cd $BITCART_DIR && docker-compose logs -f"
