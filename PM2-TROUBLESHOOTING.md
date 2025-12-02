# PM2 Startup Troubleshooting

## Error: "Cannot read properties of null (reading 'includes')"

This error can occur with certain PM2 versions or configuration issues. Here are multiple solutions:

---

## Solution 1: Use the Simplified Config File (Recommended)

The main `ecosystem.config.js` has been updated with a simplified configuration.

```bash
cd /var/www/marsad-website
pm2 start ecosystem.config.js --env production
```

---

## Solution 2: Use the Minimal Production Config

Try the ultra-minimal configuration:

```bash
cd /var/www/marsad-website
pm2 start ecosystem.production.config.js
```

---

## Solution 3: Use the Bash Startup Script

This method doesn't use a config file at all:

```bash
cd /var/www/marsad-website
chmod +x start-pm2.sh
./start-pm2.sh
```

---

## Solution 4: Direct PM2 Command (No Config File)

Start the app directly without any config file:

```bash
cd /var/www/marsad-website

# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start backend/server.js \
  --name "lebanon-breach-reporting" \
  --instances 1 \
  --max-memory-restart 1G \
  -i 1

# Set environment variables
pm2 set lebanon-breach-reporting:NODE_ENV production
pm2 set lebanon-breach-reporting:PORT 3000

# Restart to apply env vars
pm2 restart lebanon-breach-reporting

# Save the process list
pm2 save
```

---

## Solution 5: Use NPM Scripts (Simplest)

If you've pulled the latest code with updated package.json:

```bash
cd /var/www/marsad-website
npm run pm2:start:prod
```

Or if that fails, try starting without the config file:

```bash
npx pm2 start backend/server.js --name lebanon-breach-reporting
```

---

## Solution 6: Update PM2

Sometimes updating PM2 fixes compatibility issues:

```bash
# Update PM2 globally (if installed globally)
sudo npm install -g pm2@latest

# Or update locally in the project
cd /var/www/marsad-website
npm install pm2@latest --save-dev
```

Then try starting again:

```bash
npm run pm2:start:prod
```

---

## Solution 7: Delete PM2 Cache and Restart

```bash
# Stop all PM2 processes
pm2 kill

# Clear PM2 cache
rm -rf ~/.pm2

# Start fresh
cd /var/www/marsad-website
pm2 start backend/server.js --name lebanon-breach-reporting

# Save
pm2 save
```

---

## Verify It's Running

After using any of the above methods, verify the app is running:

```bash
# Check PM2 status
pm2 list

# View logs
pm2 logs lebanon-breach-reporting

# Test the API
curl http://localhost:3000/api/health
```

You should see:
```json
{"status":"OK","message":"Server is running"}
```

---

## Setup Auto-Start on Reboot

Once the app is running successfully:

```bash
# Save current process list
pm2 save

# Generate startup script
pm2 startup

# Run the command it outputs (usually requires sudo)
# Example: sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root
```

---

## Quick Start Commands Summary

**Method 1 - NPM Script (Easiest):**
```bash
cd /var/www/marsad-website
npm run pm2:start:prod
```

**Method 2 - Bash Script:**
```bash
cd /var/www/marsad-website
chmod +x start-pm2.sh
./start-pm2.sh
```

**Method 3 - Direct Command:**
```bash
cd /var/www/marsad-website
pm2 start backend/server.js --name lebanon-breach-reporting
pm2 save
```

**Method 4 - Config File:**
```bash
cd /var/www/marsad-website
pm2 start ecosystem.config.js --env production
```

---

## Common Issues

### Port Already in Use

```bash
# Find what's using port 3000
sudo netstat -tulpn | grep :3000

# Kill the process
sudo kill -9 <PID>

# Or change the port in .env file
echo "PORT=3001" >> .env
```

### Permission Denied

```bash
# Fix ownership
sudo chown -R $USER:$USER /var/www/marsad-website

# Fix permissions
chmod -R 755 /var/www/marsad-website
```

### Module Not Found

```bash
# Reinstall dependencies
cd /var/www/marsad-website
rm -rf node_modules package-lock.json
npm install
```

---

## Need Help?

If none of these solutions work:

1. Check PM2 version: `pm2 --version`
2. Check Node version: `node --version`
3. Check the error logs: `pm2 logs lebanon-breach-reporting --err`
4. Try running the app directly first: `node backend/server.js`
5. Check if .env file exists and is configured properly

---

## Recommended Approach

For production, I recommend this sequence:

```bash
# 1. Navigate to project
cd /var/www/marsad-website

# 2. Ensure dependencies are installed
npm install

# 3. Create logs directory
mkdir -p logs

# 4. Start with the simplest method
npm run pm2:start:prod

# 5. Verify it's running
pm2 list
pm2 logs lebanon-breach-reporting

# 6. Test the API
curl http://localhost:3000/api/health

# 7. Save and setup auto-start
pm2 save
pm2 startup
# Run the command it outputs
```

This should get your app running successfully! 🚀
