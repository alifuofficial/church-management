#!/bin/bash

# Church Management System - Quick Deploy Script
# Run this on your VPS after uploading files

set -e

echo "=========================================="
echo "Church Management System - Deployment"
echo "=========================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    
    # Generate NEXTAUTH_SECRET
    SECRET=$(openssl rand -base64 32)
    sed -i "s/change-this-to-a-random-secret-key/$SECRET/g" .env
    
    echo ""
    echo "IMPORTANT: Edit .env and set NEXTAUTH_URL to your domain!"
    echo "Example: NEXTAUTH_URL=https://yourchurch.com"
    echo ""
fi

# Check deployment method
read -p "Deploy with Docker? (y/n, recommended): " use_docker

if [[ $use_docker =~ ^[Yy]$ ]]; then
    echo ""
    echo "Deploying with Docker..."
    
    # Build and start
    docker compose up -d --build
    
    echo ""
    echo "Waiting for app to start..."
    sleep 10
    
    # Check if running
    if docker compose ps | grep -q "Up"; then
        echo "✓ Docker container is running!"
    else
        echo "✗ Container failed to start. Check logs:"
        docker compose logs
        exit 1
    fi
    
else
    echo ""
    echo "Deploying with PM2..."
    
    # Check if bun is installed
    if ! command -v bun &> /dev/null; then
        echo "Installing Bun..."
        curl -fsSL https://bun.sh/install | bash
        source ~/.bashrc
    fi
    
    # Check if pm2 is installed
    if ! command -v pm2 &> /dev/null; then
        echo "Installing PM2..."
        npm install -g pm2
    fi
    
    # Install dependencies
    echo "Installing dependencies..."
    bun install
    
    # Generate Prisma client
    echo "Generating Prisma client..."
    bunx prisma generate
    
    # Initialize database
    echo "Initializing database..."
    bun run db:push
    
    # Build
    echo "Building application..."
    bun run build
    
    # Start with PM2
    echo "Starting with PM2..."
    pm2 start npm --name "church-app" -- start
    
    # Save PM2 config
    pm2 save
    
    # Setup startup script
    pm2 startup
    
    echo "✓ Application started with PM2!"
fi

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Edit .env file with your settings"
echo "2. Set up Nginx reverse proxy (see DEPLOYMENT.md)"
echo "3. Configure SSL certificate"
echo "4. Create your admin account"
echo ""
echo "Application running at: http://localhost:3000"
echo ""
