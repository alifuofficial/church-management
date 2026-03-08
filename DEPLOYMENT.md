# Church Management System - Deployment Guide

This guide covers deploying your Church Management System to a VPS.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Option A: Docker Deployment (Recommended)](#option-a-docker-deployment-recommended)
3. [Option B: Manual Deployment with PM2](#option-b-manual-deployment-with-pm2)
4. [Post-Deployment Setup](#post-deployment-setup)
5. [SSL Configuration](#ssl-configuration)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- VPS with at least **2GB RAM** and **1 vCPU**
- **Ubuntu 22.04 LTS** or similar Linux distribution
- Root or sudo access
- Domain name (optional but recommended)

---

## Option A: Docker Deployment (Recommended)

### Step 1: Prepare Your VPS

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sudo sh

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Add your user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Create app directory
mkdir -p ~/church-app
cd ~/church-app
```

### Step 2: Upload Your Files

**Option 1: Using Git**
```bash
git clone <your-repo-url> .
```

**Option 2: Using SCP (from your local machine)**
```bash
scp -r ./* user@your-vps-ip:~/church-app/
```

**Option 3: Using rsync (recommended)**
```bash
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
  ./ user@your-vps-ip:~/church-app/
```

### Step 3: Configure Environment

```bash
cd ~/church-app

# Create .env file
cp .env.example .env
nano .env
```

Update these required values:
```env
NEXTAUTH_URL=https://yourchurch.com
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
```

### Step 4: Deploy

```bash
# Build and start
docker compose up -d --build

# Check logs
docker compose logs -f

# Initialize database
docker compose exec church-app npx prisma db push
```

### Step 5: Set Up Reverse Proxy (Nginx)

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx config
sudo nano /etc/nginx/sites-available/church
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name yourchurch.com www.yourchurch.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/church /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

---

## Option B: Manual Deployment with PM2

### Step 1: Install Node.js & Bun

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Bun
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# Install PM2
sudo npm install -g pm2
```

### Step 2: Upload Files

```bash
mkdir -p ~/church-app
cd ~/church-app

# Upload files using rsync (from local)
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
  ./ user@your-vps-ip:~/church-app/
```

### Step 3: Install & Build

```bash
cd ~/church-app

# Install dependencies
bun install

# Generate Prisma client
bunx prisma generate

# Initialize database
bun run db:push

# Build for production
bun run build
```

### Step 4: Configure Environment

```bash
cp .env.example .env
nano .env

# Set these:
# NEXTAUTH_URL=https://yourchurch.com
# NEXTAUTH_SECRET=<generated-secret>
# NODE_ENV=production
```

### Step 5: Start with PM2

```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

Add:
```javascript
module.exports = {
  apps: [{
    name: 'church-app',
    script: '.next/standalone/server.js',
    cwd: '/home/YOURUSER/church-app',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '0.0.0.0'
    }
  }]
};
```

```bash
# Start app
pm2 start ecosystem.config.js

# Save PM2 config
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Step 6: Set Up Nginx (same as Docker method)

---

## Post-Deployment Setup

### 1. Create Admin User

Visit your site and register, then in the database:

```bash
# Connect to database
sqlite3 db/church.db

# Update user role to ADMIN
UPDATE User SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

Or use Prisma Studio:
```bash
npx prisma studio
```

### 2. Configure Email Settings

1. Go to Admin Panel → Email Subscriptions → Email Settings
2. Enter your SMTP credentials
3. Test the connection

### 3. Configure Social Login (Optional)

1. Go to Admin Panel → Settings → Social Login
2. Enable Google/Facebook login
3. Add OAuth credentials

---

## SSL Configuration

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourchurch.com -d www.yourchurch.com

# Auto-renewal test
sudo certbot renew --dry-run
```

### Manual SSL

1. Get SSL certificate from your provider
2. Place files in `/etc/nginx/ssl/`
3. Update Nginx config to use SSL

---

## Useful Commands

### Docker

```bash
# View logs
docker compose logs -f

# Restart
docker compose restart

# Stop
docker compose down

# Update
git pull
docker compose up -d --build

# Access container
docker compose exec church-app sh

# Database backup
docker compose exec church-app sqlite3 /app/data/church.db ".backup /app/data/backup.db"
```

### PM2

```bash
# View logs
pm2 logs

# Restart
pm2 restart church-app

# Stop
pm2 stop church-app

# Monitor
pm2 monit

# Update
git pull
bun install
bun run build
pm2 restart church-app
```

### Database

```bash
# Backup SQLite
sqlite3 db/church.db ".backup db/backup-$(date +%Y%m%d).db"

# Restore
cp db/backup-20240101.db db/church.db

# View data
sqlite3 db/church.db "SELECT * FROM User;"
```

---

## Troubleshooting

### Port 3000 Already in Use

```bash
# Find process
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

### Permission Denied

```bash
# Fix permissions
sudo chown -R $USER:$USER ~/church-app
chmod -R 755 ~/church-app
```

### Database Errors

```bash
# Reset database (WARNING: loses all data)
bun run db:push --force-reset
```

### Memory Issues

```bash
# Add swap memory
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Check Application Status

```bash
# Check if app is running
curl http://localhost:3000

# Check system resources
htop

# Check disk space
df -h
```

---

## Security Recommendations

1. **Firewall**: Only expose ports 80, 443, and SSH
   ```bash
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw allow 22
   sudo ufw enable
   ```

2. **Regular Updates**: Keep system and packages updated
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

3. **Backup Regularly**: Set up automated backups
   ```bash
   # Add to crontab
   crontab -e
   # Add: 0 2 * * * sqlite3 ~/church-app/db/church.db ".backup ~/backups/church-$(date +\%Y\%m\%d).db"
   ```

4. **Strong Secrets**: Use strong, unique values for:
   - NEXTAUTH_SECRET
   - Database passwords
   - API keys

---

## Need Help?

If you encounter issues:
1. Check logs: `docker compose logs` or `pm2 logs`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify environment variables are set correctly
4. Ensure database is initialized: `bun run db:push`
