#!/bin/bash
# =============================================================================
# Quick Deploy - Fast rebuild without reinstalling dependencies
# Usage:  sudo bash quick-deploy.sh
# Only rebuilds app and restarts services
# =============================================================================

set -euo pipefail

APP_DIR="/opt/aether-holdings"

log()     { echo -e "\033[1;34m[quick-deploy]\033[0m $*"; }
success() { echo -e "\033[1;32m[ok]\033[0m $*"; }
error()   { echo -e "\033[1;31m[error]\033[0m $*"; exit 1; }

# Check if app directory exists
if [ ! -d "$APP_DIR" ]; then
  error "App directory not found. Run full deploy.sh first."
fi

cd "$APP_DIR"

# Pull latest code
log "Pulling latest code..."
git pull

# Install npm deps (fast if already installed)
log "Installing npm deps..."
npm install --no-audit --no-fund

# Build app
log "Building app..."
npm run build
success "Build complete"

# Restart service
log "Restarting aether service..."
systemctl restart aether
sleep 2

if systemctl is-active --quiet aether; then
  success "Aether service running"
else
  error "Aether failed to start — run: journalctl -u aether -n 50"
fi

echo ""
success "Quick deploy complete."
echo "  → http://aetherholdings.org"
echo ""
echo "View logs: journalctl -u aether -f"
