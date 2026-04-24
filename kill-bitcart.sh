#!/bin/bash
# =============================================================================
# Stop and Remove Bitcart - Free up server resources
# Usage:  sudo bash kill-bitcart.sh
# =============================================================================

set -euo pipefail

BITCART_DIR="/opt/bitcart"

echo "=========================================="
echo "  REMOVING BITCART TO FREE RESOURCES"
echo "=========================================="
echo ""

# Check current memory usage
echo "Current memory usage:"
free -h
echo ""

# Stop Bitcart containers
if [ -d "$BITCART_DIR" ]; then
    cd "$BITCART_DIR"
    echo "Stopping Bitcart Docker containers..."
    docker-compose down 2>/dev/null || docker compose down 2>/dev/null || echo "No containers running"
    echo "✓ Bitcart stopped"
else
    echo "✓ Bitcart directory not found"
fi

# Remove Bitcart nginx config
echo ""
echo "Removing Bitcart nginx config..."
rm -f /etc/nginx/sites-enabled/bitcart
rm -f /etc/nginx/sites-available/bitcart
echo "✓ Bitcart nginx config removed"

# Reload nginx
echo ""
echo "Reloading nginx..."
nginx -t && systemctl reload nginx
echo "✓ Nginx reloaded"

# Optional: Remove Bitcart directory completely
read -p "Remove Bitcart directory completely? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Removing $BITCART_DIR..."
    rm -rf "$BITCART_DIR"
    echo "✓ Bitcart directory removed"
else
    echo "⚠ Bitcart directory kept (just stopped)"
fi

# Show freed memory
echo ""
echo "Memory after cleanup:"
free -h
echo ""

# Show running containers
echo "Remaining Docker containers:"
docker ps -a

echo ""
echo "=========================================="
echo "✓ BITCART REMOVED"
echo "=========================================="
echo ""
echo "Resources freed up! Your Aether app should be faster now."
echo ""
