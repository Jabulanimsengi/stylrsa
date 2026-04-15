# Deploying hairprosdirectory

This project is deployed directly using Docker Compose on a Linux VPS (e.g., Hetzner).

## Prerequisites

1.  A server (VPS) with Docker and Docker Compose installed.
2.  SSH access to the server.
3.  Your domain names pointing to the server's IP address (A Record).

## Deployment Steps

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/YourUsername/YourRepo.git app
    cd app
    ```

2.  **Environment Variables**:
    Create a `.env` file from the template and fill it out:
    ```bash
    cp .env.production.template .env
    nano .env
    ```
    Ensure you set strong passwords for the database, correct API keys for Cloudinary/SendGrid/Google, and accurately set `DOMAIN_NAME`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_URL`, and `NEXTAUTH_URL`.
    `NEXT_PUBLIC_SITE_URL` and `NEXTAUTH_URL` must be your live HTTPS domain, never `localhost`.
    If you want interactive maps and geocoding in production, also set `NEXT_PUBLIC_MAPBOX_TOKEN` and `MAPBOX_ACCESS_TOKEN`.

3.  **Start Services**:
    ```bash
    docker-compose -f docker-compose.prod.yml up -d --build
    ```
    This will build the NestJS backend and Next.js frontend, then start PostgreSQL, Redis, and NGINX.

4.  **SSL Configuration (Certbot)**:
    Ensure you run Certbot manually on the host server to generate the Let's Encrypt SSL certificates for the NGINX container to use.
    ```bash
    apt install certbot
    certbot certonly --webroot -w /var/www/certbot -d yourdomain.com -d www.yourdomain.com
    ```
    Then restart the stack to apply the new certificates.
