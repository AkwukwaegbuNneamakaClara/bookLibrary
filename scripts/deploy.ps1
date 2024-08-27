# PowerShell equivalent of the Bash script

# Exit immediately if a command exits with a non-zero status
$ErrorActionPreference = "Stop"

Write-Host "Pulling latest changes"
git pull origin main

Write-Host "Installing dependencies"
npm install

Write-Host "Building the project"
npm run build

Write-Host "Restarting application"
$pm2List = pm2 list

if ($pm2List -match 'booklibrary') {
    pm2 restart booklibrary
} else {
    pm2 start index.js --name booklibrary
}

Write-Host "Deployment successful"
