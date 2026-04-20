#!/bin/bash
echo "=== NGINX STATUS ==="
systemctl status nginx --no-pager
echo ""
echo "=== NGINX SITES ENABLED ==="
ls -la /etc/nginx/sites-enabled/ 2>/dev/null
echo ""
echo "=== NGINX CONF ==="
cat /etc/nginx/sites-enabled/* 2>/dev/null
echo ""
echo "=== PM2 LIST ==="
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
pm2 list 2>/dev/null || echo "pm2 not found in PATH"
echo ""
echo "=== NODE PROCESSES ==="
ps aux | grep -E "node|next|pm2" | grep -v grep
echo ""
echo "=== PORTS IN USE ==="
ss -tlnp
echo ""
echo "=== JOURNAL NGINX (last 30 lines) ==="
journalctl -u nginx -n 30 --no-pager 2>/dev/null
echo ""
echo "=== NGINX ACCESS LOG (last 20) ==="
cat /var/log/nginx/access.log 2>/dev/null | tail -20
echo ""
echo "=== NGINX ERROR LOG (last 30) ==="
cat /var/log/nginx/error.log 2>/dev/null | tail -30
echo ""
echo "=== APP DIRECTORY ==="
ls -la /var/www/ 2>/dev/null
ls -la /home/ 2>/dev/null
echo ""
echo "=== DOCKER CONTAINERS ==="
docker ps -a 2>/dev/null || echo "docker not running or not installed"
echo ""
echo "=== SYSTEMD SERVICES FAILED ==="
systemctl --failed --no-pager
