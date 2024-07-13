#!/bin/bash
set -e

echo "Pulling latest changes"
git pull origin main

echo "Installing dependencies"
npm install

echo "Building the project"
npm run build

echo "Restarting application"
pm2 restart all

echo "Deployment successful"