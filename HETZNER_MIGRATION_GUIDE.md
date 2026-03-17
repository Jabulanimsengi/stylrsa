# Hetzner CX23 Migration Guide

This guide will help you migrate your full-stack application and data to your new Hetzner CX23 server.

## Prerequisites
- access to the Hetzner Cloud Console
- SSH access to your new server (`ssh root@<YOUR_SERVER_IP>`)
- Your current database connection string (from Supabase, another hosted Postgres provider, or local development)

## Phase 1: Server Setup (One-Time)

### 1. Connect to your Server
Open your terminal (PowerShell or Command Prompt) and SSH into your server:
```bash
ssh root@89.167.76.156
# You might need to accept the fingerprint by typing 'yes'
```

### 2. Update and Install Docker
Run these commands on the server to install Docker and Git:
```bash
apt update && apt upgrade -y
apt install -y docker.io docker-compose git
systemctl enable --now docker
```

### 3. Setup Swap Space (CRITICAL for 4GB RAM)
Since you have 4GB RAM, we need swap space to prevent crashes during builds or heavy load.
```bash
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
```

## Phase 2: Deploy Code

### 1. Clone Your Repository
You can clone via HTTPS (easiest) or SSH keys.
```bash
git clone https://github.com/Jabulanimsengi/stylrSA.git app
cd app
```
*Note: If your repo is private, you'll need to use a Personal Access Token (PAT) as the password.*

### 2. Configure Environment
Create the `.env` file from the template we prepared:
```bash
nano .env
```
Paste the contents of `.env.production.template` (which is in your repo now) and **fill in the real values**.
- Set a strong `DB_PASSWORD`.
- Fill in Cloudinary keys.
- Set `DOMAIN_NAME` to your actual domain.

### 3. Build and Start
```bash
docker-compose up -d --build
```
This will take a few minutes. Docker will build your Frontend and Backend images.

## Phase 3: Data Migration

### 1. Dump Data from Old Database
On your **LOCAL** machine (not the server), verify you can connect to your old DB.
Run this command to dump the data to a file:
```bash
# Example if using Supabase/Postgres
pg_dump "postgres://user:pass@host:port/db" > backup.sql
```

### 2. Upload Dump to Hetzner
On your **LOCAL** machine:
```bash
scp backup.sql root@89.167.76.156:/root/app/backup.sql
```

### 3. Restore Data to New Database
Back on your **HETZNER** server:
```bash
# Stop the backend to prevent writes during restore
docker-compose stop backend

# Copy backup into the postgres container
docker cp backup.sql app_postgres_1:/backup.sql

# Restore the database
docker run --rm -e PGPASSWORD=14YH08r4IPQJ9RVJ postgres:17-alpine \-U hairpros -d hairpros_db -f /backup.sql

# Restart backend
docker-compose start backend
```

## Phase 4: Final Steps

### 1. DNS Update
Go to your domain registrar (e.g., GoDaddy, Namecheap) and update the **A Record** to point to `89.167.76.156`.

### 2. SSL/HTTPS (Future Step)
Currently, Nginx is listening on port 80 (HTTP). For HTTPS, we recommend using Certbot.
Once DNS is propagated:
```bash
apt install -y certbot python3-certbot-nginx
# We will need to adjust nginx config significantly for this or use a separate certbot container.
# For now, ensure HTTP works first.
```
