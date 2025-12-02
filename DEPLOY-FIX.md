# 🚨 Production Fix Instructions

You encountered two issues:
1. `webpack: not found` - Because dev dependencies weren't installed or found
2. `PM2 Error` - Because of a configuration file compatibility issue

## ✅ The Fix

I've created a single script to fix everything at once.

### Run this on your server:

```bash
cd /var/www/marsad-website

# 1. Make the script executable
chmod +x server-setup.sh

# 2. Run it
./server-setup.sh
```

### What this script does:
1. Installs **all** dependencies (including webpack)
2. Builds the secured JavaScript files
3. Starts the app using a **robust method** that bypasses the PM2 config error
4. Saves the configuration

### Verification
After running the script, check:
```bash
pm2 list
curl http://localhost:3000/api/health
```
