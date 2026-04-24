#!/bin/bash
# =============================================================================
# Fix Port 3000 Binding Issue
# Usage:  sudo bash fix-port-binding.sh
# =============================================================================

set -euo pipefail

APP_DIR="/opt/aether-holdings"

echo "=========================================="
echo "  FIXING PORT 3000 BINDING"
echo "=========================================="
echo ""

# Update systemd service to bind to 0.0.0.0
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

echo "✓ Updated systemd service to bind to 0.0.0.0"

# Reload and restart
systemctl daemon-reload
echo "✓ Reloaded systemd"

systemctl restart aether
echo "✓ Restarted aether service"

sleep 3

# Check status
echo ""
echo "Checking service status..."
if systemctl is-active --quiet aether; then
    echo "✓ Service is running"
else
    echo "✗ Service failed to start"
    journalctl -u aether -n 20 --no-pager
    exit 1
fi

echo ""
echo "Checking port 3000..."
if ss -tlnp 2>/dev/null | grep -q ':3000' || netstat -tlnp 2>/dev/null | grep -q ':3000'; then
    echo "✓ Port 3000 is now listening!"
    ss -tlnp 2>/dev/null | grep ':3000' || netstat -tlnp | grep ':3000'
else
    echo "✗ Port 3000 still not listening"
    echo ""
    echo "Recent logs:"
    journalctl -u aether -n 30 --no-pager
    exit 1
fi

echo ""
echo "Testing local connection..."
sleep 2
if curl -s http://localhost:3000 | head -20 | grep -iq "<!DOCTYPE\|<html"; then
    echo "✓ App responds on http://localhost:3000"
else
    echo "⚠ App might not be responding correctly"
fi

echo ""
echo "=========================================="
echo "✓ PORT BINDING FIXED"
echo "=========================================="
echo ""
echo "Next step: Test nginx proxy"
echo "  curl http://localhost"
echo ""
