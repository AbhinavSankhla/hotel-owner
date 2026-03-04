# 🔧 Quick Fix for Login Issue

## Issue
The API server needs Prisma client regenerated before it can start.

## Solution
Run these commands in order:

```powershell
# 1. Navigate to project root
cd c:\Users\vpbgk\OneDrive\Desktop\project-hotel\hotel-booking

# 2. Regenerate Prisma client
cd apps\api
npx prisma generate
cd ..\..

# 3. Ensure Docker is running
docker compose up postgres redis -d

# 4. Start API server (new window)
npm run dev:api

# 5. Start Web server (new window - only if not already running)
npm run dev:web
```

## Test Login
1. Open http://localhost:3000
2. Click "Login"
3. Use: `admin@bluestay.in` / `password123`

## If Still Fails
Check that both servers are running:
- API: http://localhost:4000/health (should return status)
- Web: http://localhost:3000 (should show the site)

## Alternative: Use the Script
```powershell
.\fix-and-start.ps1
```
This will automatically regenerate Prisma and start both servers.
