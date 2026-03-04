# BlueStay Hotel Booking - Local Setup Guide

## ✅ Environment Files Created

I've created the following configuration files:
- `apps/api/.env` - Backend API configuration
- `apps/web/.env.local` - Frontend web configuration

Both files are configured for local development with default values.

---

## 📋 Prerequisites Installation

### 1. Install Node.js 20+
1. Visit https://nodejs.org/
2. Download the **LTS version** (v20 or newer)
3. Run the installer
4. Verify installation:
   ```powershell
   node --version
   npm --version
   ```

### 2. Install Docker Desktop
1. Visit https://www.docker.com/products/docker-desktop/
2. Download **Docker Desktop for Windows**
3. Run the installer
4. Start Docker Desktop
5. Verify installation:
   ```powershell
   docker --version
   docker compose version
   ```

---

## 🚀 Setup Steps (After Installing Prerequisites)

### Step 1: Install Dependencies
```powershell
cd c:\Users\vpbgk\OneDrive\Desktop\project-hotel\hotel-booking
npm install
```

### Step 2: Start Database & Cache Services
```powershell
docker compose up postgres redis -d
```

**Wait 10-15 seconds** for PostgreSQL to fully initialize.

### Step 3: Setup Database Schema & Seed Data
```powershell
cd apps/api
npx prisma generate
npx prisma db push
npx prisma db seed
cd ../..
```

### Step 4: Start Development Servers

**Option A: Run in separate PowerShell windows**

Window 1 (API):
```powershell
cd c:\Users\vpbgk\OneDrive\Desktop\project-hotel\hotel-booking
npm run dev:api
```

Window 2 (Web):
```powershell
cd c:\Users\vpbgk\OneDrive\Desktop\project-hotel\hotel-booking
npm run dev:web
```

**Option B: Use Docker for everything**
```powershell
docker compose up -d
docker compose exec api npx prisma db push
docker compose exec api npx prisma db seed
```

---

## 🌐 Access URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Web App** | http://localhost:3000 | Main hotel booking website |
| **GraphQL Playground** | http://localhost:4000/graphql | Interactive API explorer |
| **Swagger Docs** | http://localhost:4000/api/docs | REST API documentation |
| **API Health** | http://localhost:4000/health | Health check endpoint |
| **Prisma Studio** | http://localhost:5555 | Database visual editor (run `npx prisma studio` in apps/api) |

---

## 👤 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| **Platform Admin** | admin@bluestay.in | password123 |
| **Hotel Admin** | admin@radhikaresort.in | password123 |
| **Hotel Staff** | staff@radhikaresort.in | password123 |
| **Guest** | guest@example.com | password123 |

---

## 🛠️ Useful Commands

### Database Management
```powershell
cd apps/api

# Open visual database editor
npx prisma studio

# Reset database and re-seed
npx prisma db push --force-reset
npx prisma db seed

# View database schema
npx prisma format
```

### Development
```powershell
# View Docker logs
docker compose logs -f

# Stop all services
docker compose down

# Restart a specific service
docker compose restart postgres
docker compose restart redis

# Check running containers
docker ps
```

### Testing
```powershell
# Unit tests
cd apps/api
npm test

# E2E tests (requires servers running)
npx playwright test

# Load tests
k6 run tests/load/k6-booking-flow.js
```

---

## 🐛 Troubleshooting

### "Port already in use"
```powershell
# Find process using port 3000 or 4000
netstat -ano | findstr :3000
netstat -ano | findstr :4000

# Kill process by PID
taskkill /PID <process_id> /F
```

### Database connection fails
```powershell
# Check if PostgreSQL is running
docker ps

# View PostgreSQL logs
docker compose logs postgres

# Restart PostgreSQL
docker compose restart postgres
```

### Redis connection fails
```powershell
# Check if Redis is running
docker ps

# Test Redis connection
docker compose exec redis redis-cli ping
# Should return: PONG
```

### npm install fails
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install
```

### Prisma errors
```powershell
cd apps/api

# Regenerate Prisma client
npx prisma generate

# Check connection
npx prisma db execute --stdin < NUL
```

---

## 📝 Next Steps

1. **Install Node.js and Docker** using links above
2. **Run the setup steps** in order
3. **Access http://localhost:3000** and explore the platform
4. **Login** with test accounts above
5. **Review the codebase** and implement your fixes

---

## 📚 Additional Resources

- Full Project Guide: See `GUIDE.md`
- Project Plan: See `plan.md`
- API Documentation: http://localhost:4000/api/docs (after starting API)
- GraphQL Schema: http://localhost:4000/graphql (after starting API)

---

## 💡 Development Workflow

1. Make code changes in `apps/api/src` or `apps/web/src`
2. Both servers support **hot reload** (changes auto-refresh)
3. Test changes in browser
4. Run tests: `npm test`
5. Commit changes to git

---

## 🆘 Need Help?

If you encounter any issues during setup:
1. Check the error message carefully
2. Review the troubleshooting section above
3. Check Docker Desktop is running
4. Ensure all services are started: `docker ps`
5. View logs: `docker compose logs -f`
