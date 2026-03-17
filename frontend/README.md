# Stylr SA Frontend

Next.js frontend for Stylr SA.

## Development

1. Install dependencies:
```bash
npm install
```

2. Create a local env file:
```bash
cp .env.example .env.local
```

3. Start the dev server:
```bash
npm run dev
```

The frontend expects the NestJS backend to be available locally, usually at `http://localhost:5000`.

## Production

This frontend is built for the app's Hetzner deployment flow:
- Next.js standalone output
- Docker container runtime
- Nginx reverse proxy
- Backend API routed through the same stack

See the root deployment files for production setup:
- `docker-compose.prod.yml`
- `nginx/nginx.prod.conf`
- `.env.production.template`
