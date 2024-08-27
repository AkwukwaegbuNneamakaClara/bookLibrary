# Replace this with the absolute path to your Git executable
$gitPath = "C:\Program Files\Git\bin\git.exe"

Write-Host "Pulling latest changes"
& "$gitPath" pull origin main

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
