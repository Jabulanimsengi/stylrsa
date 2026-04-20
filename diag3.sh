#!/bin/bash
echo "=== Test problematic chunks from browser console ==="

# Extract actual chunk filenames from the HTML to test
CHUNKS=$(curl -s https://stylrsa.co.za/ --max-time 10 | grep -oE '/_next/static/[^"]+\.(js|css)' | head -10)
echo "Referenced chunks in HTML:"
echo "$CHUNKS"
echo ""

echo "=== Testing first 5 ==="
for url in $(echo "$CHUNKS" | head -5); do
  STATUS=$(curl -sI "https://stylrsa.co.za${url}" --max-time 5 | head -1)
  echo "$url -> $STATUS"
done

echo ""
echo "=== Test CSS files ==="
CSS=$(curl -s https://stylrsa.co.za/ --max-time 10 | grep -oE '/_next/static/css/[^"]+\.css' | head -5)
for url in $CSS; do
  STATUS=$(curl -sI "https://stylrsa.co.za${url}" --max-time 5 | head -1)
  echo "$url -> $STATUS"
done

echo ""
echo "=== Backend health ==="
curl -s http://backend:3001/api/health --max-time 5 2>/dev/null || curl -s http://localhost:3001/api/health --max-time 5 2>/dev/null || echo "backend health check failed (expected from host)"
docker exec stylrsa-release-backend-1 wget -qO- http://localhost:3001/api/health --timeout=5 2>/dev/null || echo "backend health via docker exec"
docker logs stylrsa-release-backend-1 --tail 5 2>&1
