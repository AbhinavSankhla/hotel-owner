# BlueStay Hotel Booking - Quick Setup Script
# Run this script after installing Node.js and Docker

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BlueStay Hotel Booking - Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js 20+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "✓ npm installed: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm not found. Please reinstall Node.js" -ForegroundColor Red
    exit 1
}

# Check Docker
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker not found. Please install Docker Desktop from https://www.docker.com/products/docker-desktop/" -ForegroundColor Red
    exit 1
}

# Check Docker Compose
try {
    $composeVersion = docker compose version
    Write-Host "✓ Docker Compose available: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker Compose not found. Please update Docker Desktop" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Setup..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Install dependencies
Write-Host "[1/5] Installing npm dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 2: Start Docker services
Write-Host "[2/5] Starting PostgreSQL and Redis..." -ForegroundColor Yellow
docker compose up postgres redis -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to start Docker services" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Docker services started" -ForegroundColor Green
Write-Host "⏳ Waiting 15 seconds for PostgreSQL to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 15
Write-Host ""

# Step 3: Setup Prisma
Write-Host "[3/5] Generating Prisma client..." -ForegroundColor Yellow
Set-Location apps\api
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to generate Prisma client" -ForegroundColor Red
    Set-Location ..\..
    exit 1
}
Write-Host "✓ Prisma client generated" -ForegroundColor Green
Write-Host ""

# Step 4: Push database schema
Write-Host "[4/5] Creating database schema..." -ForegroundColor Yellow
npx prisma db push
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to push database schema" -ForegroundColor Red
    Set-Location ..\..
    exit 1
}
Write-Host "✓ Database schema created" -ForegroundColor Green
Write-Host ""

# Step 5: Seed database
Write-Host "[5/5] Seeding database with sample data..." -ForegroundColor Yellow
npx prisma db seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to seed database" -ForegroundColor Red
    Set-Location ..\..
    exit 1
}
Write-Host "✓ Database seeded" -ForegroundColor Green
Write-Host ""

Set-Location ..\..

Write-Host "========================================" -ForegroundColor Green
Write-Host "Setup Complete! 🎉" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Open TWO PowerShell windows" -ForegroundColor White
Write-Host ""
Write-Host "   Window 1 - Start API server:" -ForegroundColor White
Write-Host "   npm run dev:api" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Window 2 - Start Web server:" -ForegroundColor White
Write-Host "   npm run dev:web" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Access the application:" -ForegroundColor White
Write-Host "   Web:     http://localhost:3000" -ForegroundColor Yellow
Write-Host "   GraphQL: http://localhost:4000/graphql" -ForegroundColor Yellow
Write-Host "   Swagger: http://localhost:4000/api/docs" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Login with test account:" -ForegroundColor White
Write-Host "   Email:    admin@bluestay.in" -ForegroundColor Yellow
Write-Host "   Password: password123" -ForegroundColor Yellow
Write-Host ""
Write-Host "📖 For more details, see SETUP.md" -ForegroundColor Cyan
Write-Host ""
