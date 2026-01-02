# ⚡ Quick Start Guide

Get SwanyThree AI Soap Opera Studio running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- API keys ready:
  - Anthropic (Claude)
  - OpenRouter
  - OpenAI
  - ElevenLabs
  - Akool

## Step 1: Clone & Install

```bash
# Clone repository
git clone <your-repo-url>
cd swanythree

# Install backend
cd backend
npm install

# Install frontend
cd ../frontend
npm install
```

## Step 2: Setup Backend

```bash
cd backend

# Copy environment file
cp .env.example .env

# Generate JWT secret
openssl rand -base64 48
# Copy output to .env as JWT_SECRET

# Edit .env and add your API keys
nano .env  # or use your favorite editor
```

Required in `.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/swanythree
JWT_SECRET=<your-generated-secret>
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENROUTER_API_KEY=sk-or-v1-...
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=sk_...
AKOOL_API_KEY=...
```

## Step 3: Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

## Step 4: Start Backend

```bash
npm run dev
```

You should see:
```
🚀 Server running on port 3001
📊 Sentry: disabled
🌍 Environment: development
```

## Step 5: Setup Frontend

```bash
cd ../frontend

# Copy environment file
cp .env.example .env

# Edit .env
nano .env
```

Add:
```env
VITE_API_URL=http://localhost:3001/api
```

## Step 6: Start Frontend

```bash
npm run dev
```

Frontend runs on `http://localhost:3000`

## Step 7: Test It!

### Backend Health Check
```bash
curl http://localhost:3001/health
```

Expected:
```json
{
  "status": "ok",
  "timestamp": "2026-01-02T...",
  "environment": "development"
}
```

### Create Account
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "test123",
    "name": "Test User"
  }'
```

Expected:
```json
{
  "token": "eyJhbG...",
  "user": {
    "id": "...",
    "email": "test@test.com",
    "name": "Test User"
  }
}
```

### Test Frontend
1. Open `http://localhost:3000`
2. Register a new account
3. Login
4. Create a project
5. Test AI chat

## Next Steps

### Development
- Read [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) for API integration
- Read [SOAP_OPERA_README.md](SOAP_OPERA_README.md) for workflow
- Check [backend/README.md](backend/README.md) for API docs

### Production
- Read [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- Read [SECURITY.md](SECURITY.md) for security best practices
- Set up Sentry for monitoring

## Common Issues

### Database Connection Failed
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Verify DATABASE_URL format
postgresql://username:password@host:port/database
```

### Port Already in Use
```bash
# Backend (3001)
lsof -ti:3001 | xargs kill -9

# Frontend (3000)
lsof -ti:3000 | xargs kill -9
```

### Prisma Client Not Generated
```bash
cd backend
npm run db:generate
```

### Missing Environment Variables
```bash
# Check .env exists
ls -la .env

# Verify all required variables set
cat .env | grep -E "DATABASE_URL|JWT_SECRET|ANTHROPIC_API_KEY"
```

## Development Commands

### Backend
```bash
npm run dev          # Start dev server
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Create migration
npm run backup       # Backup database
```

### Frontend
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Quick Test Script

```bash
#!/bin/bash
# test.sh - Quick test script

echo "Testing backend health..."
curl http://localhost:3001/health

echo "\n\nCreating test user..."
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test User"}'

echo "\n\nLogging in..."
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}' | jq -r '.token')

echo "Token: $TOKEN"

echo "\n\nCreating project..."
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Test Project","description":"Test","type":"soap_opera"}'

echo "\n\nDone!"
```

Save as `test.sh`, make executable: `chmod +x test.sh`, run: `./test.sh`

## VS Code Setup

### Recommended Extensions
- Prisma
- ESLint
- Prettier
- GitLens
- REST Client

### Launch Configuration
Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Backend",
      "program": "${workspaceFolder}/backend/server.js",
      "cwd": "${workspaceFolder}/backend",
      "envFile": "${workspaceFolder}/backend/.env"
    }
  ]
}
```

## Database GUI

### Prisma Studio
```bash
cd backend
npx prisma studio
```

Opens at `http://localhost:5555`

### Alternative: pgAdmin
- Download from https://www.pgadmin.org/
- Connect using your DATABASE_URL credentials

## Monitoring Development

### Watch Logs
```bash
# Backend logs
cd backend
npm run dev | tee logs.txt

# Frontend logs
cd frontend
npm run dev | tee logs.txt
```

### Monitor Database
```bash
# Watch queries (PostgreSQL)
tail -f /var/log/postgresql/postgresql-14-main.log
```

## Done! 🎉

Your development environment is ready!

- **Backend:** http://localhost:3001
- **Frontend:** http://localhost:3000
- **Database GUI:** http://localhost:5555 (Prisma Studio)
- **Health Check:** http://localhost:3001/health

Now build something amazing! 🚀
