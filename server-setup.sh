#!/bin/bash

# Server Setup & Fix Script
# Run this on your production server to fix all issues

echo "🚀 Starting Server Fix..."

# 1. Install all dependencies (including dev dependencies for webpack)
echo "📦 Installing dependencies..."
npm install --include=dev

# 2. Build the project
echo "🔨 Building project..."
npm run build

# 3. Update HTML files (just in case)
echo "🔒 Updating HTML files..."
node update-html-scripts.js

# 4. Stop existing PM2 processes
echo "🛑 Stopping existing processes..."
pm2 delete all 2>/dev/null || true

# 5. Start with robust PM2 command (bypassing config file issues)
echo "▶️ Starting application..."
mkdir -p logs

pm2 start backend/server.js \
  --name "lebanon-breach-reporting" \
  --instances 1 \
  --max-memory-restart 1G \
  --env production \
  --error logs/err.log \
  --output logs/out.log \
  --time \
  --merge-logs

# 6. Save process list
echo "💾 Saving process list..."
pm2 save

echo ""
echo "✅ Setup Complete!"
echo "-------------------"
echo "Check status: pm2 list"
echo "Check logs:   pm2 logs lebanon-breach-reporting"
