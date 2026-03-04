# Fix Prisma and Start Servers
Write-Host "Fixing Prisma client and starting servers..." -ForegroundColor Cyan
Write-Host ""

$projectRoot = "c:\Users\vpbgk\OneDrive\Desktop\project-hotel\hotel-booking"
Set-Location $projectRoot

# Step 1: Regenerate Prisma client
Write-Host "[1/3] Regenerating Prisma client..." -ForegroundColor Yellow
Set-Location apps\api
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to generate Prisma client" -ForegroundColor Red
    Set-Location ..\..
    exit 1
}
Write-Host "✓ Prisma client generated" -ForegroundColor Green
Set-Location ..\..
Write-Host ""

# Step 2: Check Docker services
Write-Host "[2/3] Checking Docker services..." -ForegroundColor Yellow
$postgresRunning = docker ps --filter "name=postgres" --format "{{.Names}}" 2>$null
$redisRunning = docker ps --filter "name=redis" --format "{{.Names}}" 2>$null

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

# Step 3: Start servers
Write-Host "[3/3] Starting development servers..." -ForegroundColor Yellow
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot'; Write-Host 'Starting API Server...' -ForegroundColor Cyan; npm run dev:api"
Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot'; Write-Host 'Starting Web Server...' -ForegroundColor Cyan; npm run dev:web"

Write-Host "========================================" -ForegroundColor Green
Write-Host "Servers Starting! 🚀" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Two PowerShell windows opened:" -ForegroundColor White
Write-Host "  1. API Server (http://localhost:4000)" -ForegroundColor Gray
Write-Host "  2. Web Server (http://localhost:3000)" -ForegroundColor Gray
Write-Host ""
Write-Host "Wait ~30 seconds for servers to start, then:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Access URLs:" -ForegroundColor Cyan
Write-Host "  Web App:  http://localhost:3000" -ForegroundColor Yellow
Write-Host "  GraphQL:  http://localhost:4000/graphql" -ForegroundColor Yellow
Write-Host "  API Docs: http://localhost:4000/api/docs" -ForegroundColor Yellow
Write-Host ""
Write-Host "Login:" -ForegroundColor Cyan
Write-Host "  Email:    admin@bluestay.in" -ForegroundColor Yellow
Write-Host "  Password: password123" -ForegroundColor Yellow
Write-Host ""
