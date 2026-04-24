#!/bin/bash
# =============================================================================
# Diagnostic Script - Check deployment status and identify issues
# Usage:  sudo bash diagnose.sh
# =============================================================================

set -euo pipefail

APP_DIR="/opt/aether-holdings"
DOMAIN="aetherholdings.org"
BITCART_SUBDOMAIN="bitcart.aetherholdings.org"

echo "=========================================="
echo "  AETHER HOLDINGS - DEPLOYMENT DIAGNOSTICS"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

pass() { echo -e "${GREEN}✓${NC} $*"; }
fail() { echo -e "${RED}✗${NC} $*"; }
warn() { echo -e "${YELLOW}⚠${NC} $*"; }
section() { echo ""; echo "=== $* ==="; }

# ================================================================
# 1. Check if app directory exists
# ================================================================
section "App Directory"
if [ -d "$APP_DIR" ]; then
    pass "App directory exists: $APP_DIR"
    ls -lah "$APP_DIR" | head -10
else
    fail "App directory not found: $APP_DIR"
    exit 1
fi

# ================================================================
# 2. Check Aether service status
# ================================================================
section "Aether Service Status"
if systemctl is-active --quiet aether; then
    pass "Aether service is running"
    systemctl status aether --no-pager -l | head -20
else
    fail "Aether service is NOT running"
    systemctl status aether --no-pager -l || true
    echo ""
    warn "Recent logs:"
    journalctl -u aether -n 50 --no-pager
fi

# ================================================================
# 3. Check if port 3000 is listening
# ================================================================
section "Port 3000 (Aether App)"
if netstat -tlnp 2>/dev/null | grep -q ':3000'; then
    pass "Port 3000 is listening"
    netstat -tlnp | grep ':3000'
else
    fail "Port 3000 is NOT listening"
    warn "This means the Next.js app is not running"
fi

# ================================================================
# 4. Test local connection to app
# ================================================================
section "Local App Connection Test"
if curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000 | grep -q "200\|301\|302"; then
    pass "App responds locally on http://127.0.0.1:3000"
    echo "Response:"
    curl -s http://127.0.0.1:3000 | head -20
else
    fail "App does NOT respond on http://127.0.0.1:3000"
    warn "Trying to connect..."
    curl -v http://127.0.0.1:3000 || true
fi

# ================================================================
# 5. Check Nginx status
# ================================================================
section "Nginx Status"
if systemctl is-active --quiet nginx; then
    pass "Nginx is running"
else
    fail "Nginx is NOT running"
    systemctl status nginx --no-pager -l || true
fi

# ================================================================
# 6. Check Nginx configuration
# ================================================================
section "Nginx Configuration"
echo "Testing nginx config..."
if nginx -t 2>&1; then
    pass "Nginx configuration is valid"
else
    fail "Nginx configuration has errors"
fi

echo ""
echo "Enabled sites:"
ls -la /etc/nginx/sites-enabled/

echo ""
echo "Aether site config:"
if [ -f /etc/nginx/sites-available/aether ]; then
    cat /etc/nginx/sites-available/aether
else
    fail "Aether nginx config not found"
fi

echo ""
echo "Default site (should be disabled):"
if [ -f /etc/nginx/sites-enabled/default ]; then
    fail "Default nginx site is STILL ENABLED - this is the problem!"
    echo "Content:"
    cat /etc/nginx/sites-enabled/default
else
    pass "Default site is disabled"
fi

# ================================================================
# 7. Check port 80 and 443
# ================================================================
section "Nginx Ports"
if netstat -tlnp 2>/dev/null | grep -q ':80'; then
    pass "Port 80 is listening"
    netstat -tlnp | grep ':80'
else
    fail "Port 80 is NOT listening"
fi

if netstat -tlnp 2>/dev/null | grep -q ':443'; then
    pass "Port 443 is listening"
    netstat -tlnp | grep ':443'
else
    warn "Port 443 is NOT listening (might be using HTTP only)"
fi

# ================================================================
# 8. Test Nginx -> App connection
# ================================================================
section "Nginx -> App Connection"
echo "Testing HTTP request through nginx..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/)
echo "HTTP Status Code: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    pass "Nginx is proxying correctly"
    echo "Response preview:"
    curl -s http://localhost/ | head -30
else
    fail "Nginx response is not OK"
    echo "Full response:"
    curl -v http://localhost/ || true
fi

# ================================================================
# 9. Check which process is handling HTTP
# ================================================================
section "Process Handling Port 80"
NGINX_PID=$(netstat -tlnp 2>/dev/null | grep ':80' | awk '{print $7}' | cut -d'/' -f1 | head -1)
if [ -n "$NGINX_PID" ]; then
    echo "PID: $NGINX_PID"
    ps aux | grep "$NGINX_PID" | grep -v grep || true
fi

# ================================================================
# 10. Check DNS resolution
# ================================================================
section "DNS Resolution"
echo "Resolving $DOMAIN..."
dig +short $DOMAIN || nslookup $DOMAIN || host $DOMAIN || warn "DNS tools not available"

echo "Resolving $BITCART_SUBDOMAIN..."
dig +short $BITCART_SUBDOMAIN || nslookup $BITCART_SUBDOMAIN || host $BITCART_SUBDOMAIN || warn "DNS tools not available"

# ================================================================
# 11. Check firewall
# ================================================================
section "Firewall (UFW)"
if command -v ufw >/dev/null 2>&1; then
    ufw status verbose
else
    warn "UFW not installed"
fi

# ================================================================
# 12. Check Bitcart
# ================================================================
section "Bitcart Status"
if [ -d "/opt/bitcart" ]; then
    pass "Bitcart directory exists"
    cd /opt/bitcart
    if command -v docker-compose >/dev/null 2>&1; then
        docker-compose ps || docker compose ps || true
    fi
else
    warn "Bitcart not installed"
fi

# ================================================================
# 13. Recent logs
# ================================================================
section "Recent Application Logs"
echo "Last 30 lines from aether service:"
journalctl -u aether -n 30 --no-pager || true

# ================================================================
# 14. Environment check
# ================================================================
section "Environment File"
if [ -f "$APP_DIR/.env.local" ]; then
    pass ".env.local exists"
    echo "PORT setting:"
    grep "^PORT=" "$APP_DIR/.env.local" || warn "PORT not set in .env.local"
else
    fail ".env.local not found"
fi

# ================================================================
# SUMMARY
# ================================================================
section "SUMMARY & RECOMMENDATIONS"

HAS_ISSUES=0

# Check critical issues
if ! systemctl is-active --quiet aether; then
    fail "CRITICAL: Aether service is not running"
    echo "    → Run: journalctl -u aether -n 50"
    echo "    → Run: systemctl restart aether"
    HAS_ISSUES=1
fi

if ! netstat -tlnp 2>/dev/null | grep -q ':3000'; then
    fail "CRITICAL: Port 3000 not listening (app not running)"
    echo "    → Check: journalctl -u aether -n 50"
    echo "    → The Next.js app failed to start"
    HAS_ISSUES=1
fi

if [ -f /etc/nginx/sites-enabled/default ]; then
    fail "CRITICAL: Default nginx site still enabled"
    echo "    → Run: rm /etc/nginx/sites-enabled/default"
    echo "    → Run: systemctl reload nginx"
    HAS_ISSUES=1
fi

if ! systemctl is-active --quiet nginx; then
    fail "CRITICAL: Nginx is not running"
    echo "    → Run: systemctl start nginx"
    HAS_ISSUES=1
fi

HTTP_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/ || echo "000")
if [ "$HTTP_TEST" != "200" ] && [ "$HTTP_TEST" != "301" ] && [ "$HTTP_TEST" != "302" ]; then
    fail "CRITICAL: HTTP request returns $HTTP_TEST"
    echo "    → Check nginx logs: tail -f /var/log/nginx/error.log"
    HAS_ISSUES=1
fi

if [ $HAS_ISSUES -eq 0 ]; then
    echo ""
    pass "All critical checks passed!"
    echo ""
    echo "If you still see 'Welcome to nginx' it might be:"
    echo "  1. Browser cache - try incognito/private mode"
    echo "  2. Cloudflare cache - purge cache in Cloudflare dashboard"
    echo "  3. DNS propagation - wait a few minutes"
    echo ""
else
    echo ""
    fail "Issues found - fix the items above"
    echo ""
fi

echo "=========================================="
echo "  END OF DIAGNOSTICS"
echo "=========================================="
