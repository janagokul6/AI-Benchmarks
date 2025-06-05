#!/bin/bash

APP_NAME="ai-benchmark"  # must match your pm2 process name

# Load nvm if you're using it
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"

echo "Installing dependencies..."
npm install --production

echo "Building app..."
npm run build

echo "Restarting with PM2..."
pm2 reload $APP_NAME || pm2 start npm --name "$APP_NAME" -- start

echo "saving PM2 process..."
pm2 save
echo "Deployment complete."
