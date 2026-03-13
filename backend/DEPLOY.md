# One DSD Equity Program — Backend Deployment Guide

## Overview

This is the Node.js agentic backend that powers the multi-agent AI team.
Deploy this on a **Hostinger KVM VPS** (recommended: KVM 2 at $8.99/mo or higher).

**Architecture:**
- Frontend: GitHub Pages (static SPA — no changes needed)
- Backend: This Express + WebSocket server on Hostinger VPS
- AI Engine: Anthropic Claude API (claude-sonnet-4-6 / claude-opus-4-6)
- Database: SQLite (local file on VPS — zero ops, instant queries)

---

## Hostinger VPS Setup

### 1. Provision the VPS
1. Log into Hostinger → VPS → Order KVM 2 (or higher)
2. Choose **Ubuntu 22.04 LTS** as the OS
3. Select server region: **United States** (best latency for Minnesota DHS)
4. Note your VPS IP address

### 2. Initial Server Setup
```bash
# SSH into your VPS
ssh root@YOUR_VPS_IP

# Update packages
apt update && apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2 (process manager — keeps the server running)
npm install -g pm2

# Install Git
apt install -y git

# Create app user (security best practice)
adduser equity
usermod -aG sudo equity
su - equity
```

### 3. Deploy the Backend
```bash
# Clone the repository
git clone https://github.com/Gary-design63/One-DSD-Equity-Program.git
cd One-DSD-Equity-Program/backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
nano .env
# Fill in:
#   ANTHROPIC_API_KEY=your_key
#   CORS_ORIGINS=https://gary-design63.github.io
#   PORT=3000
```

### 4. Start with PM2
```bash
# Start the server
pm2 start server.js --name "equity-agents"

# Save PM2 config (auto-restart on server reboot)
pm2 save
pm2 startup

# View logs
pm2 logs equity-agents

# Restart after code updates
pm2 restart equity-agents
```

### 5. Configure Firewall
```bash
# Allow SSH and the agent server port
ufw allow ssh
ufw allow 3000
ufw enable
```

### 6. (Optional) HTTPS with Nginx + Let's Encrypt
For production, front the Node.js server with Nginx for SSL:

```bash
apt install -y nginx certbot python3-certbot-nginx

# Create Nginx config
cat > /etc/nginx/sites-available/equity-agents << 'EOF'
server {
    server_name agents.yourdomain.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -s /etc/nginx/sites-available/equity-agents /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

# Get SSL certificate (replace with your domain)
certbot --nginx -d agents.yourdomain.com
```

### 7. Connect Frontend to Backend
Edit `index.html` and uncomment + update this line:
```html
<script>window.AGENT_API_URL = 'https://agents.yourdomain.com';</script>
```

Or if using IP directly (no SSL):
```html
<script>window.AGENT_API_URL = 'http://YOUR_VPS_IP:3000';</script>
```

---

## Getting Your Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account or log in
3. Navigate to API Keys → Create Key
4. Copy the key and add to your `.env` file

**Recommended models:**
- Coordinator (Equity Compass): `claude-opus-4-6` (most powerful reasoning)
- Specialists: `claude-sonnet-4-6` (fast + capable)

**Estimated monthly API costs** for active daily use (150 staff):
- Light use (1-2 queries/day): ~$20-40/month
- Moderate use (5-10 queries/day): ~$80-150/month
- Heavy use: ~$200-400/month

---

## Updating the Backend

```bash
cd ~/One-DSD-Equity-Program
git pull origin main
cd backend
npm install  # if dependencies changed
pm2 restart equity-agents
```

---

## Monitoring

```bash
# Real-time logs
pm2 logs equity-agents --lines 100

# Server resource usage
pm2 monit

# Database inspection
sqlite3 data/equity_program.db
.tables
SELECT * FROM insights ORDER BY created_at DESC LIMIT 5;
.quit
```

---

## Security Notes

- Never commit your `.env` file (it's in `.gitignore`)
- Rotate your Anthropic API key regularly
- The SQLite database file contains conversation history — back it up regularly
- Consider enabling Hostinger's firewall in addition to UFW
- Monitor API usage costs in the Anthropic console weekly
