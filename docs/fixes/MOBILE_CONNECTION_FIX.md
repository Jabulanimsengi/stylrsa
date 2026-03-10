# Mobile Connection Fix - ERR_CONNECTION_REFUSED

## Problem
Mobile devices can hit `ERR_CONNECTION_REFUSED` in the live environment when:
1. backend CORS does not allow the live domain,
2. auth cookies are scoped to the wrong domain,
3. frontend-to-backend traffic is routed to the wrong origin.

## Hetzner / Docker configuration

### 1. Backend CORS and cookie domain
Set these values in the production `.env` used by `docker-compose.prod.yml`:

```bash
CORS_ORIGIN="http://localhost:3001,http://localhost:3000,https://www.stylrsa.co.za,https://stylrsa.co.za"
COOKIE_DOMAIN=".stylrsa.co.za"
```

### 2. Frontend runtime environment
Use internal Docker routing for server-to-server traffic and public HTTPS URLs for browser traffic:

```bash
INTERNAL_BACKEND_URL=http://backend:3001
NEXT_PUBLIC_API_ORIGIN=http://backend:3001
NEXT_PUBLIC_API_URL=https://www.stylrsa.co.za/api
NEXT_PUBLIC_SITE_URL=https://www.stylrsa.co.za
NEXTAUTH_URL=https://www.stylrsa.co.za
```

### 3. Redeploy on Hetzner

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

## Testing
After redeploying:
1. Test `https://www.stylrsa.co.za` on desktop and mobile.
2. Verify `POST /api/auth/login` succeeds.
3. Verify `GET /api/auth/status` returns authenticated after login.
4. Inspect cookies in the browser and confirm `access_token` is set for the live domain.

## Notes
- `.env.local` is only for local development.
- Production auth and proxy traffic should use the Hetzner Docker network, not public fallback hosts.
- Backend and frontend env changes require rebuilding the Docker stack.
