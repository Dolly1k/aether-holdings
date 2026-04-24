#!/bin/bash
# =============================================================================
# Fix Database Initialization Issue
# Usage:  sudo bash fix-database.sh
# =============================================================================

set -euo pipefail

APP_DIR="/opt/aether-holdings"
DB_FILE="$APP_DIR/aether.db"

echo "=========================================="
echo "  FIXING DATABASE"
echo "=========================================="
echo ""

cd "$APP_DIR"

# Check if database exists
if [ -f "$DB_FILE" ]; then
    echo "✓ Database file exists: $DB_FILE"
    ls -lah "$DB_FILE"
else
    echo "⚠ Database file does not exist, will create it"
fi

# Ensure proper permissions
echo ""
echo "Setting database permissions..."
touch "$DB_FILE"
chmod 666 "$DB_FILE"
chown root:root "$DB_FILE"
echo "✓ Permissions set"
ls -lah "$DB_FILE"

# Initialize database schema
echo ""
echo "Initializing database schema..."
if node init-db.js; then
    echo "✓ Database initialized successfully"
else
    echo "✗ Database initialization failed"
    exit 1
fi

# Restart service
echo ""
echo "Restarting aether service..."
systemctl restart aether
sleep 3

if systemctl is-active --quiet aether; then
    echo "✓ Service is running"
else
    echo "✗ Service failed"
    journalctl -u aether -n 20 --no-pager
    exit 1
fi

# Test connection
echo ""
echo "Testing app connection..."
sleep 2
if curl -s http://localhost:3000 | head -20 | grep -iq "<!DOCTYPE\|<html"; then
    echo "✓ App responds successfully!"
else
    echo "⚠ App response might be incorrect"
    echo ""
    echo "Response preview:"
    curl -s http://localhost:3000 | head -30
fi

echo ""
echo "=========================================="
echo "✓ DATABASE FIXED"
echo "=========================================="
echo ""
echo "Next: Test your site"
echo "  curl http://localhost"
echo ""
