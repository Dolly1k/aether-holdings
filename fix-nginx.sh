#!/bin/bash
# =============================================================================
# Quick Fix for "Welcome to Nginx" Issue
# Usage:  sudo bash fix-nginx.sh
# =============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
NC='\033[0m' # No Color

log()     { echo -e "${BLUE}[fix]${NC} $*"; }
success() { echo -e "${GREEN}[ok]${NC} $*"; }
warn()    { echo -e "${YELLOW}[warn]${NC} $*"; }
error()   { echo -e "${RED}[error]${NC} $*"; exit 1; }

echo "=========================================="
echo "  FIXING NGINX CONFIGURATION"
echo "=========================================="
echo ""

# ================================================================
# 1. Remove default nginx site
# ================================================================
log "Removing default nginx site..."
if [ -f /etc/nginx/sites-enabled/default ]; then
    rm -f /etc/nginx/sites-enabled/default
    success "Removed /etc/nginx/sites-enabled/default"
else
    success "Default site already removed"
fi

if [ -f /etc/nginx/sites-enabled/default.dpkg-dist ]; then
    rm -f /etc/nginx/sites-enabled/default.dpkg-dist
    success "Removed default.dpkg-dist"
fi

# ================================================================
# 2. Check if aether site exists
# ================================================================
log "Checking aether site configuration..."
if [ ! -f /etc/nginx/sites-available/aether ]; then
    error "Aether site config not found. Run deploy.sh first."
fi

if [ ! -L /etc/nginx/sites-enabled/aether ]; then
    log "Enabling aether site..."
    ln -sf /etc/nginx/sites-available/aether /etc/nginx/sites-enabled/aether
    success "Aether site enabled"
else
    success "Aether site already enabled"
fi

# ================================================================
# 3. Verify nginx config
# ================================================================
log "Testing nginx configuration..."
if nginx -t 2>&1; then
    success "Nginx configuration is valid"
else
    error "Nginx configuration has errors. Check the output above."
fi

# ================================================================
# 4. Restart services
# ================================================================
log "Restarting aether service..."
systemctl restart aether
sleep 2

if systemctl is-active --quiet aether; then
    success "Aether service is running"
else
    error "Aether service failed to start. Check logs: journalctl -u aether -n 50"
fi

log "Reloading nginx..."
systemctl reload nginx
success "Nginx reloaded"

# ================================================================
# 5. Test connections
# ================================================================
log "Testing local connection to app..."
sleep 2
if curl -s http://127.0.0.1:3000 | grep -iq "<!DOCTYPE\|<html"; then
    success "App responds on port 3000"
else
    warn "App might not be responding correctly on port 3000"
    echo "Try: curl http://127.0.0.1:3000"
fi

log "Testing nginx proxy..."
if curl -s http://localhost | grep -iq "<!DOCTYPE\|<html"; then
    success "Nginx is proxying to the app"
else
    warn "Nginx might not be proxying correctly"
    echo "Try: curl http://localhost"
fi

# ================================================================
# 6. Show status
# ================================================================
echo ""
echo "=========================================="
echo "  STATUS"
echo "=========================================="
echo ""
echo "Aether service:"
systemctl status aether --no-pager -l | head -10
echo ""
echo "Nginx:"
systemctl status nginx --no-pager -l | head -5
echo ""
echo "Listening ports:"
netstat -tlnp | grep -E ':(80|443|3000|8080)' || true
echo ""

echo "=========================================="
success "Fix complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Test in browser: http://$(curl -s ifconfig.me)"
echo "  2. Test domain: http://aetherholdings.org"
echo "  3. If still seeing 'Welcome to nginx':"
echo "     - Clear browser cache (Ctrl+Shift+R)"
echo "     - Try incognito mode"
echo "     - Purge Cloudflare cache"
echo ""
echo "View logs:"
echo "  journalctl -u aether -f"
echo "  tail -f /var/log/nginx/error.log"
echo ""
