#!/bin/bash

# PM2 Startup Script for Lebanon Breach Reporting System
# This script starts the application using PM2

cd /var/www/marsad-website

# Create logs directory if it doesn't exist
mkdir -p logs

# Start the application with PM2
pm2 start backend/server.js \
  --name "lebanon-breach-reporting" \
  --instances 1 \
  --max-memory-restart 1G \
  --env production \
  --error logs/err.log \
  --output logs/out.log \
  --time \
  --merge-logs

# Save PM2 process list
pm2 save

# Show status
pm2 list

echo ""
echo "✓ Application started successfully!"
echo "✓ View logs: pm2 logs lebanon-breach-reporting"
echo "✓ Monitor: pm2 monit"
echo "✓ Stop: pm2 stop lebanon-breach-reporting"
