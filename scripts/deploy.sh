#!/bin/bash
set -e

echo "Pulling latest changes"
git pull origin main

echo "Installing dependencies"
npm install

echo "Building the project"
npm run build

echo "Restarting application"
if pm2 list | grep -q booklibrary; then
  pm2 restart booklibrary
else
  pm2 start index.js --name booklibrary
fi

echo "Deployment successful"
