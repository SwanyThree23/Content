# Production Deployment Guide

Complete guide for deploying the SwanyThree AI Soap Opera Studio to production.

## Prerequisites

1. **Accounts Needed:**
   - Railway account (for backend)
   - Vercel account (for frontend)
   - Sentry account (for error tracking)
   - PostgreSQL database (Railway provides this)

2. **API Keys Required:**
   - Anthropic API key
   - OpenRouter API key
   - OpenAI API key
   - ElevenLabs API key
   - Akool API key

## Part 1: Generate JWT Secret

```bash
# Generate a secure 48-character base64 JWT secret
openssl rand -base64 48
```

Save this output - you'll need it for environment variables.

## Part 2: Deploy Backend to Railway

### Step 1: Install Railway CLI
```bash
npm install -g railway
```

### Step 2: Initialize Railway Project
```bash
cd backend
railway login
railway init
```

### Step 3: Add PostgreSQL Database
```bash
railway add postgresql
```

### Step 4: Set Environment Variables
```bash
# Set all required environment variables
railway variables set NODE_ENV=production
railway variables set JWT_SECRET="<your-generated-secret>"
railway variables set ANTHROPIC_API_KEY="sk-ant-api03-..."
railway variables set OPENROUTER_API_KEY="sk-or-v1-..."
railway variables set OPENAI_API_KEY="sk-..."
railway variables set ELEVENLABS_API_KEY="sk_..."
railway variables set AKOOL_API_KEY="..."
railway variables set MANUS_API_KEY="manus_..."
railway variables set GITHUB_TOKEN="github_pat_..."
railway variables set ALLOWED_ORIGINS="https://swanythree.vercel.app,https://swanythree.com"
```

### Step 5: Setup Sentry (Error Tracking)

1. Go to [sentry.io](https://sentry.io) and create an account
2. Create a new project (Node.js)
3. Copy your DSN (looks like `https://xxx@xxx.ingest.sentry.io/xxx`)
4. Set it in Railway:

```bash
railway variables set SENTRY_DSN="https://...@....ingest.sentry.io/..."
```

### Step 6: Deploy Backend
```bash
railway up
```

### Step 7: Run Database Migrations
```bash
railway run npm run db:push
```

### Step 8: Get Your Backend URL
```bash
railway domain
```

Save this URL - you'll need it for the frontend.

## Part 3: Deploy Frontend to Vercel

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Deploy Frontend
```bash
cd frontend
vercel --prod
```

### Step 3: Set Environment Variables in Vercel

Go to your Vercel project dashboard:
1. Click on "Settings"
2. Click on "Environment Variables"
3. Add:
   - `VITE_API_URL` = `https://your-backend.railway.app/api`

### Step 4: Redeploy
```bash
vercel --prod
```

## Part 4: Security Configuration

### CORS Setup
The backend is already configured to accept requests from your Vercel frontend. Make sure `ALLOWED_ORIGINS` in Railway includes your Vercel domain.

### Rate Limiting
Already configured in backend:
- **General API:** 100 requests per 15 minutes
- **Auth endpoints:** 5 login attempts per 15 minutes

### Error Tracking
Sentry is configured and will automatically:
- Track errors and exceptions
- Monitor performance
- Profile application bottlenecks

## Part 5: Database Backups

### Manual Backup
```bash
railway run npm run backup
```

### Automated Daily Backups
Set up a cron job or use Railway's scheduled tasks:

```bash
# In Railway dashboard:
# Add a cron service that runs: npm run backup
# Schedule: 0 2 * * * (2 AM daily)
```

## Part 6: Testing Production

### 1. Health Check
```bash
curl https://your-backend.railway.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-02T...",
  "environment": "production"
}
```

### 2. Test Registration
```bash
curl -X POST https://your-backend.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test User"}'
```

Expected response:
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "email": "test@test.com",
    "name": "Test User"
  }
}
```

### 3. Test Frontend
Visit your Vercel URL and verify:
- [ ] Login page loads
- [ ] Can create an account
- [ ] Dashboard loads after login
- [ ] API calls work

## Part 7: Monitoring

### Sentry Dashboard
1. Go to [sentry.io](https://sentry.io)
2. View your project
3. Check for errors and performance issues

### Railway Logs
```bash
railway logs
```

### Database Monitoring
```bash
railway run npx prisma studio
```

## Part 8: Environment Variables Checklist

### Backend (Railway)
- [x] `NODE_ENV=production`
- [x] `DATABASE_URL` (auto-set by Railway)
- [x] `JWT_SECRET`
- [x] `ANTHROPIC_API_KEY`
- [x] `OPENROUTER_API_KEY`
- [x] `OPENAI_API_KEY`
- [x] `ELEVENLABS_API_KEY`
- [x] `AKOOL_API_KEY`
- [x] `MANUS_API_KEY`
- [x] `GITHUB_TOKEN`
- [x] `SENTRY_DSN`
- [x] `ALLOWED_ORIGINS`
- [x] `PORT=3001`

### Frontend (Vercel)
- [x] `VITE_API_URL`

## Part 9: Troubleshooting

### Backend won't start
- Check Railway logs: `railway logs`
- Verify all environment variables are set
- Check database connection

### Frontend can't connect to backend
- Verify `VITE_API_URL` is correct
- Check CORS settings in `ALLOWED_ORIGINS`
- Test backend health endpoint

### Database errors
- Run migrations: `railway run npm run db:push`
- Check DATABASE_URL is set correctly

### Rate limiting issues
- Adjust limits in `backend/server.js`
- Redeploy with `railway up`

## Part 10: Updates and Maintenance

### Deploying Updates

**Backend:**
```bash
cd backend
railway up
```

**Frontend:**
```bash
cd frontend
vercel --prod
```

### Database Migrations
```bash
# Create migration
railway run npx prisma migrate dev --name your_migration_name

# Apply to production
railway run npm run db:push
```

### Backup Before Updates
```bash
railway run npm run backup
```

## Security Best Practices

1. **Never commit `.env` files** - Already in .gitignore
2. **Rotate API keys regularly** - Update in Railway dashboard
3. **Monitor Sentry for security issues** - Check daily
4. **Review rate limiting** - Adjust based on usage
5. **Keep dependencies updated** - Run `npm audit` regularly

## Cost Optimization

- **Railway:** ~$5-20/month depending on usage
- **Vercel:** Free for hobby projects, Pro if needed
- **Sentry:** Free tier available (5k events/month)
- **API costs:** Variable based on usage

## Support

- Railway docs: https://docs.railway.app
- Vercel docs: https://vercel.com/docs
- Sentry docs: https://docs.sentry.io

---

## Quick Reference Commands

```bash
# Backend deployment
cd backend && railway up

# Frontend deployment
cd frontend && vercel --prod

# View logs
railway logs

# Backup database
railway run npm run backup

# Database studio
railway run npx prisma studio

# Check health
curl https://your-backend.railway.app/health
```

## Production URLs

- **Backend:** https://your-project.railway.app
- **Frontend:** https://your-project.vercel.app
- **Database:** Managed by Railway
- **Monitoring:** https://sentry.io

---

🚀 **Your production deployment is complete!**
