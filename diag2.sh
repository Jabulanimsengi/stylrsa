#!/bin/bash
echo "=== HTML BUILD ID ==="
curl -s https://stylrsa.co.za/ --max-time 10 | grep -oP 'buildId":"[^"]+' | head -1

echo "=== CONTAINER BUILD ID ==="
docker exec stylrsa-release-frontend-1 cat /app/app/.next/BUILD_ID
echo ""

echo "=== required-server-files.json (first 500 chars) ==="
docker exec stylrsa-release-frontend-1 head -c 500 /app/app/.next/required-server-files.json
echo ""

echo "=== Files in /app/app/.next/static/ ==="
docker exec stylrsa-release-frontend-1 ls /app/app/.next/static/
echo ""

echo "=== Files in /app/app/.next/static/chunks/ (first 15) ==="
docker exec stylrsa-release-frontend-1 ls /app/app/.next/static/chunks/ | head -15
echo ""

echo "=== Does /app/app/public exist? ==="
docker exec stylrsa-release-frontend-1 ls /app/app/public/ | head -5
echo ""

echo "=== Test specific failing chunks from browser console ==="
# Test exact URLs that the browser shows as 404
curl -sI "https://stylrsa.co.za/_next/static/chunks/0ed449401590f9.js" --max-time 5 | head -2
curl -sI "https://stylrsa.co.za/_next/static/css/7c74985bf2ed95e6.css" --max-time 5 | head -2
echo ""

echo "=== FULL chunk list (search for the failing ones) ==="
docker exec stylrsa-release-frontend-1 find /app -path "*/static/chunks/*0ed449*" 2>/dev/null
docker exec stylrsa-release-frontend-1 find /app -path "*/static/chunks/*bc32f026*" 2>/dev/null
docker exec stylrsa-release-frontend-1 find /app -path "*/static/css/*7c74985*" 2>/dev/null
echo ""

echo "=== How is server.js being run (CWD matters) ==="
docker exec stylrsa-release-frontend-1 cat /proc/1/cmdline 2>/dev/null | tr '\0' ' '
echo ""
docker exec stylrsa-release-frontend-1 ls -la /proc/1/cwd 2>/dev/null
echo ""

echo "=== What dir is the node process working from ==="
docker exec stylrsa-release-frontend-1 readlink /proc/1/cwd 2>/dev/null || echo "cannot read"
echo ""

echo "=== Check server.js __dirname references ==="
docker exec stylrsa-release-frontend-1 head -50 /app/app/server.js 2>/dev/null
