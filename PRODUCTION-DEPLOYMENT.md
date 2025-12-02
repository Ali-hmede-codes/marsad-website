# Production Deployment Guide

This guide covers deploying the Lebanon Breach Reporting System to your production server at `/var/www/marsad-website`.

## Initial Setup on Production Server

### 1. Prerequisites

Make sure you have the following installed on your server:
```bash
# Check Node.js version (should be 14+ or 16+)
node --version

# Check npm version
npm --version

# Check MySQL
mysql --version
```

### 2. Clone/Upload the Project

If using Git:
```bash
cd /var/www
git clone <your-repo-url> marsad-website
cd marsad-website
```

Or if uploading files manually, ensure all files are in `/var/www/marsad-website`.

### 3. Install Dependencies

```bash
cd /var/www/marsad-website
npm install
```

This will install all dependencies including PM2 locally.

### 4. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your production settings
nano .env
```

Make sure to set:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`
- `EMAIL_USER`, `EMAIL_PASS` (for email verification)
- `NODE_ENV=production`
- `PORT=3000`

### 5. Setup Database

```bash
# Apply database schema
node apply_schema.js

# Apply seed data
node apply_seed.js

# Create admin user (if needed)
node create_user.js
```

## Starting the Application with PM2

### Start the App

```bash
npm run pm2:start:prod
```

This will:
- Start your app using PM2
- Run in production mode
- Enable auto-restart on crashes
- Log to `./logs/` directory

### Verify It's Running

```bash
npm run pm2:list
```

You should see:
```
┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
├────┼────────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 0  │ lebanon-breach-re… │ cluster  │ 0    │ online    │ 0%       │ 50.0mb   │
└────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘
```

### Save PM2 Process List

```bash
npm run pm2:save
```

This saves the current process list so PM2 can restore it after a reboot.

### Setup Auto-Start on Server Reboot

```bash
npm run pm2:startup
```

This will output a command that you need to run with sudo. It will look something like:
```bash
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u root --hp /root
```

Copy and run that command, then save the process list again:
```bash
npm run pm2:save
```

Now your app will automatically start when the server reboots!

## Managing the Application

### View Logs
```bash
# Real-time logs
npm run pm2:logs

# Or view log files directly
tail -f logs/combined.log
tail -f logs/err.log
```

### Restart the App
```bash
npm run pm2:restart
```

### Stop the App
```bash
npm run pm2:stop
```

### Start the App Again
```bash
npm run pm2:start:prod
```

### Monitor Performance
```bash
npm run pm2:monit
```

### Check Status
```bash
npm run pm2:list
```

## Updating the Application

When you need to deploy updates:

```bash
# 1. Navigate to project directory
cd /var/www/marsad-website

# 2. Pull latest changes (if using Git)
git pull origin main

# 3. Install any new dependencies
npm install

# 4. Apply any database changes (if needed)
node apply_schema.js

# 5. Restart the app with zero downtime
npm run pm2:restart

# 6. Check if it's running properly
npm run pm2:list
npm run pm2:logs
```

## Nginx Configuration

If you're using Nginx as a reverse proxy (recommended), here's a basic configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Serve static files directly
    location /uploads {
        alias /var/www/marsad-website/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Apply the configuration:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## SSL/HTTPS Setup (Recommended)

Use Let's Encrypt for free SSL certificates:

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically
# Test renewal with:
sudo certbot renew --dry-run
```

## Troubleshooting

### "pm2: not found" Error

The npm scripts use `npx pm2` which should work with locally installed PM2. If you still get this error:

**Option 1: Install PM2 globally**
```bash
sudo npm install -g pm2
```

**Option 2: Use npx directly**
```bash
npx pm2 start ecosystem.config.js --env production
```

### App Not Starting

```bash
# Check logs
npm run pm2:logs

# Check if port 3000 is already in use
sudo netstat -tulpn | grep :3000

# Check PM2 status
npm run pm2:list

# Try deleting and restarting
npm run pm2:delete
npm run pm2:start:prod
```

### Database Connection Issues

```bash
# Test MySQL connection
mysql -u your_user -p your_database

# Check .env file
cat .env | grep DB_

# Check if MySQL is running
sudo systemctl status mysql
```

### Permission Issues

```bash
# Fix ownership of project files
sudo chown -R www-data:www-data /var/www/marsad-website

# Or if running as a specific user
sudo chown -R your-user:your-user /var/www/marsad-website

# Fix uploads directory permissions
chmod -R 755 /var/www/marsad-website/backend/uploads
```

### High Memory Usage

```bash
# Check memory usage
npm run pm2:monit

# The app will auto-restart if it exceeds 1GB
# Check logs to identify memory leaks
npm run pm2:logs
```

## Security Checklist

- [ ] `.env` file has proper permissions (600)
- [ ] Database credentials are secure
- [ ] JWT_SECRET is a strong random string
- [ ] Firewall is configured (only allow 80, 443, 22)
- [ ] SSH is secured (disable root login, use SSH keys)
- [ ] Regular backups are configured
- [ ] SSL/HTTPS is enabled
- [ ] Nginx security headers are configured
- [ ] PM2 is set to auto-start on reboot

## Backup Strategy

### Database Backup

```bash
# Create backup script
nano /root/backup-db.sh
```

Add:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u your_user -p'your_password' your_database > /root/backups/db_$DATE.sql
# Keep only last 7 days
find /root/backups -name "db_*.sql" -mtime +7 -delete
```

Make it executable and add to cron:
```bash
chmod +x /root/backup-db.sh
crontab -e
# Add: 0 2 * * * /root/backup-db.sh
```

### Files Backup

```bash
# Backup uploads directory
tar -czf /root/backups/uploads_$(date +%Y%m%d).tar.gz /var/www/marsad-website/backend/uploads
```

## Monitoring

### Check App Health

```bash
# Health check endpoint
curl http://localhost:3000/api/health
```

### Monitor Logs

```bash
# Watch error logs
tail -f logs/err.log

# Watch all logs
tail -f logs/combined.log

# PM2 logs
npm run pm2:logs
```

### System Resources

```bash
# Check disk space
df -h

# Check memory
free -h

# Check CPU
top

# PM2 monitoring
npm run pm2:monit
```

## Quick Reference Commands

```bash
# Start app
npm run pm2:start:prod

# Stop app
npm run pm2:stop

# Restart app
npm run pm2:restart

# View logs
npm run pm2:logs

# Check status
npm run pm2:list

# Monitor performance
npm run pm2:monit

# Save process list
npm run pm2:save

# Update app
git pull && npm install && npm run pm2:restart
```

## Support

If you encounter issues:

1. Check the logs: `npm run pm2:logs`
2. Check PM2 status: `npm run pm2:list`
3. Check system resources: `free -h` and `df -h`
4. Review the troubleshooting section above
5. Check the PM2-GUIDE.md for more detailed PM2 information
