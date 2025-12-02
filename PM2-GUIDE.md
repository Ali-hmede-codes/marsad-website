# PM2 Process Manager Guide

This application uses PM2 to manage the Node.js process in production, ensuring it stays running and automatically restarts if it crashes.

## Quick Start

### Start the application with PM2
```bash
npm run pm2:start
```

### Start in production mode
```bash
npm run pm2:start:prod
```

## PM2 Commands

### Basic Commands

| Command | Description |
|---------|-------------|
| `npm run pm2:start` | Start the application in development mode |
| `npm run pm2:start:prod` | Start the application in production mode |
| `npm run pm2:stop` | Stop the application |
| `npm run pm2:restart` | Restart the application |
| `npm run pm2:delete` | Delete the application from PM2 |
| `npm run pm2:logs` | View application logs in real-time |
| `npm run pm2:monit` | Open PM2 monitoring dashboard |

### Direct PM2 Commands

You can also use PM2 directly:

```bash
# List all running processes
pm2 list

# Show detailed info about the app
pm2 show lebanon-breach-reporting

# Monitor CPU and memory usage
pm2 monit

# View logs
pm2 logs lebanon-breach-reporting

# View only error logs
pm2 logs lebanon-breach-reporting --err

# Clear all logs
pm2 flush

# Restart the app
pm2 restart lebanon-breach-reporting

# Stop the app
pm2 stop lebanon-breach-reporting

# Delete the app from PM2
pm2 delete lebanon-breach-reporting

# Save current PM2 process list (for auto-restart on system reboot)
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

## Configuration

The PM2 configuration is defined in `ecosystem.config.js`:

- **App Name**: `lebanon-breach-reporting`
- **Script**: `./backend/server.js`
- **Instances**: 1 (can be increased for load balancing)
- **Auto-restart**: Enabled
- **Max Memory**: 1GB (app restarts if it exceeds this)
- **Logs**: Stored in `./logs/` directory

## Environment Variables

The app uses different environment variables based on the mode:

- **Development**: `NODE_ENV=development`, `PORT=3000`
- **Production**: `NODE_ENV=production`, `PORT=3000`

Make sure to create a `.env` file based on `.env.example` for your environment-specific settings.

## Logs

PM2 logs are stored in the `logs/` directory:

- `err.log` - Error logs
- `out.log` - Standard output logs
- `combined.log` - Combined logs

View logs in real-time:
```bash
npm run pm2:logs
```

## Auto-Start on System Reboot

To make your app start automatically when the server reboots:

1. Start your app with PM2:
   ```bash
   npm run pm2:start:prod
   ```

2. Save the PM2 process list:
   ```bash
   pm2 save
   ```

3. Setup PM2 startup script:
   ```bash
   pm2 startup
   ```
   
4. Follow the instructions shown by PM2 (you may need to run a command with sudo/admin privileges)

## Monitoring

### Real-time Monitoring
```bash
npm run pm2:monit
```

This opens an interactive dashboard showing:
- CPU usage
- Memory usage
- Process status
- Logs

### Web-based Monitoring (Optional)

PM2 Plus provides advanced monitoring features:
```bash
pm2 plus
```

## Troubleshooting

### App won't start
```bash
# Check PM2 logs
npm run pm2:logs

# Check if port 3000 is already in use
netstat -ano | findstr :3000

# Delete and restart
npm run pm2:delete
npm run pm2:start
```

### High memory usage
The app will automatically restart if it exceeds 1GB of memory. Check logs to identify memory leaks.

### App keeps crashing
```bash
# View error logs
pm2 logs lebanon-breach-reporting --err

# Check app status
pm2 list
```

## Production Deployment

For production deployment:

1. Ensure `.env` file is configured with production settings
2. Start with production environment:
   ```bash
   npm run pm2:start:prod
   ```
3. Save the process list:
   ```bash
   pm2 save
   ```
4. Setup auto-start on boot:
   ```bash
   pm2 startup
   ```

## Updating the Application

When you update the code:

```bash
# Pull latest changes
git pull

# Install any new dependencies
npm install

# Restart the app
npm run pm2:restart
```

PM2 will restart the app with zero downtime.
