# BlueStay - Start Development Servers
# This script starts both API and Web servers in the background

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BlueStay - Starting Development Servers" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker services are running
Write-Host "Checking Docker services..." -ForegroundColor Yellow
$postgresRunning = docker ps --filter "name=postgres" --format "{{.Names}}"
$redisRunning = docker ps --filter "name=redis" --format "{{.Names}}"

if (-not $postgresRunning) {
    Write-Host "⚠ PostgreSQL not running. Starting..." -ForegroundColor Yellow
    docker compose up postgres -d
    Start-Sleep -Seconds 10
}

if (-not $redisRunning) {
    Write-Host "⚠ Redis not running. Starting..." -ForegroundColor Yellow
    docker compose up redis -d
    Start-Sleep -Seconds 3
}

Write-Host "✓ Docker services ready" -ForegroundColor Green
Write-Host ""

# Start API server in new window
Write-Host "Starting API server (port 4000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev:api"
Start-Sleep -Seconds 2

# Start Web server in new window
Write-Host "Starting Web server (port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev:web"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Servers Starting! 🚀" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Two new PowerShell windows will open:" -ForegroundColor Cyan
Write-Host "  1. API Server (port 4000)" -ForegroundColor White
Write-Host "  2. Web Server (port 3000)" -ForegroundColor White
Write-Host ""
Write-Host "⏳ Please wait 30-60 seconds for servers to start..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Access URLs:" -ForegroundColor Cyan
Write-Host "  Web:     http://localhost:3000" -ForegroundColor Yellow
Write-Host "  GraphQL: http://localhost:4000/graphql" -ForegroundColor Yellow
Write-Host "  Swagger: http://localhost:4000/api/docs" -ForegroundColor Yellow
Write-Host ""
Write-Host "Login Credentials:" -ForegroundColor Cyan
Write-Host "  Email:    admin@bluestay.in" -ForegroundColor Yellow
Write-Host "  Password: password123" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C in each window to stop the servers" -ForegroundColor Gray
Write-Host ""
