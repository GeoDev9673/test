#!/bin/bash
# ==========================================================
# ⚡ PARALIFE — Automated One-Click VPS Deployment Script
# Target OS: Ubuntu 24.04 LTS (GoDaddy VPS)
# ==========================================================

set -e

echo "=============================================="
echo "🚀 Starting PARALIFE VPS Auto-Deployment..."
echo "=============================================="

# 1. Update package lists
echo "📦 Updating system packages..."
sudo apt update -y && sudo apt upgrade -y

# 2. Install Node.js 22.x LTS, Git, and Nginx
echo "📦 Installing Node.js, Git, Nginx, and essential tools..."
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs git nginx ufw certbot python3-certbot-nginx

# 3. Install PM2 (Process Manager for 24/7 background uptime)
echo "⚡ Installing PM2..."
sudo npm install -g pm2

# 4. Create App Directory
APP_DIR="/var/www/paralife"
echo "📂 Setting up app directory at $APP_DIR..."
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# 5. Copy or clone project files if needed
cd $APP_DIR

# 6. Install dependencies and build project
echo "🔨 Installing project dependencies and building..."
npm install
npm run build

# 7. Start Backend Server with PM2
echo "⚡ Starting background server with PM2..."
pm2 delete paralife || true
pm2 start server.js --name "paralife"
pm2 save
pm2 startup | tail -n 1 | sudo bash || true

# 8. Configure Nginx Reverse Proxy
echo "🌐 Configuring Nginx Web Server..."
sudo cat > /etc/nginx/sites-available/paralife << 'EOF'
server {
    listen 80;
    server_name _;

    # Client upload limit
    client_max_body_size 50M;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Static assets caching
    location /assets/ {
        proxy_pass http://127.0.0.1:3000/assets/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Main App & API Proxy
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
EOF

# Enable site in Nginx
sudo ln -sf /etc/nginx/sites-available/paralife /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
sudo nginx -t
sudo systemctl restart nginx

# 9. Configure Firewall
echo "🛡️ Configuring Firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw allow 22/tcp
sudo ufw --force enable

echo "=============================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "⚡ PARALIFE is now running 24/7 on your VPS!"
echo "🔗 Open in browser: http://$(curl -s ifconfig.me)"
echo "📂 Database file: $APP_DIR/data/subscribers.json"
echo "=============================================="
