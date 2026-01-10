# 🚀 AI Soap Opera Studio - Deployment Guide

## **Vercel Deployment (Frontend + API)**

### **Prerequisites**
- GitHub repository with your code
- Vercel account (free tier works)
- All environment variables ready

### **Step-by-Step Deployment**

#### **1. Install Vercel CLI**
```bash
npm install -g vercel
```

#### **2. Login to Vercel**
```bash
vercel login
```

#### **3. Configure Environment Variables**

Create production environment variables in Vercel dashboard or via CLI:

```bash
# Database
vercel env add DATABASE_URL production
# Paste your Railway PostgreSQL URL

# Claude API
vercel env add ANTHROPIC_API_KEY production
# Paste your Claude API key

# Google Veo 3
vercel env add GOOGLE_PROJECT_ID production
vercel env add GOOGLE_APPLICATION_CREDENTIALS production

# YouTube OAuth
vercel env add YOUTUBE_CLIENT_ID production
vercel env add YOUTUBE_CLIENT_SECRET production

# Security
vercel env add JWT_SECRET production
# Generate: openssl rand -hex 32

# App URL (after first deploy, update this)
vercel env add NEXT_PUBLIC_APP_URL production
# Your Vercel URL: https://your-app.vercel.app
```

#### **4. Deploy**
```bash
# Production deployment
vercel --prod
```

#### **5. Update Environment Variables**

After first deployment, update callback URLs:
- Set `NEXT_PUBLIC_APP_URL` to your Vercel URL
- Update YouTube OAuth redirect URI in Google Console

#### **6. Verify Deployment**
```bash
# Check deployment status
vercel ls

# View logs
vercel logs
```

---

## **Railway Deployment (Database)**

### **Step-by-Step Database Setup**

#### **1. Create Railway Account**
- Visit: https://railway.app
- Sign up with GitHub

#### **2. Create PostgreSQL Database**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create new project
railway init

# Add PostgreSQL
railway add postgresql
```

#### **3. Get Database URL**
```bash
# View database connection string
railway variables

# Copy DATABASE_URL
```

#### **4. Initialize Schema**
```bash
# Connect to Railway database
railway run psql

# Or remotely:
psql $DATABASE_URL < database/complete-schema.sql
```

#### **5. Configure Connection**
- Add DATABASE_URL to Vercel environment variables
- Test connection from Vercel deployment

---

## **Production Checklist**

### **Before Going Live**

- [ ] All environment variables configured
- [ ] Database schema deployed
- [ ] Test authentication flow
- [ ] Test episode generation
- [ ] Test video generation (small test)
- [ ] Test YouTube upload
- [ ] Configure rate limits
- [ ] Setup error monitoring (Sentry)
- [ ] Configure backup strategy
- [ ] Test mobile responsiveness
- [ ] SSL/HTTPS enabled (automatic on Vercel)

### **Security Checklist**

- [ ] JWT_SECRET is strong (32+ characters)
- [ ] API keys stored in environment variables (never in code)
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] SQL injection prevention (using parameterized queries)
- [ ] XSS protection enabled
- [ ] HTTPS enforced

---

## **Scaling Configuration**

### **Vercel Settings**

**vercel.json**:
```json
{
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 60
    },
    "api/videos/**/*.ts": {
      "maxDuration": 300
    }
  },
  "regions": ["iad1"]
}
```

### **Railway Settings**

- **Deployment Region**: Choose closest to users
- **Memory**: 2GB+ for PostgreSQL
- **Backups**: Enable automatic backups
- **Replicas**: Add read replicas for scaling

---

## **Monitoring & Logging**

### **Vercel Analytics**
```bash
# Enable Analytics in Vercel dashboard
# View at: https://vercel.com/dashboard/analytics
```

### **Database Monitoring**
```bash
# Railway provides built-in monitoring
# Access at: https://railway.app/dashboard
```

### **Error Tracking**

Add Sentry to `.env.local`:
```bash
SENTRY_DSN="your-sentry-dsn"
```

---

## **Cost Optimization**

### **Vercel Costs**
- **Hobby**: Free (personal projects)
- **Pro**: $20/month (production apps)
- **Enterprise**: Custom pricing

**Optimization Tips**:
- Use Edge Functions for API routes
- Optimize images with Next.js Image
- Enable caching
- Minimize bundle size

### **Railway Costs**
- **Developer**: $5/month (hobby)
- **Team**: $20/month (production)

**Optimization Tips**:
- Monitor database size
- Clean up old data regularly
- Use connection pooling
- Optimize queries

### **API Costs**
- **Claude API**: ~$0.003 per episode script
- **Veo 3**: ~$1-3 per episode video
- **YouTube**: Free

**Budget Example** (10 episodes/month):
- Claude: $0.03
- Veo 3: $10-30
- Total: ~$30/month for AI generation

---

## **Backup Strategy**

### **Database Backups**

**Automated** (Railway):
```bash
# Railway provides daily backups
# Access in Railway dashboard
```

**Manual**:
```bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### **Code Backups**
- GitHub (automatic with git push)
- Vercel keeps deployment history

---

## **CI/CD Pipeline**

### **GitHub Actions** (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## **Post-Deployment**

### **1. Test Production**
```bash
# Test API endpoints
curl https://your-app.vercel.app/api/health

# Test authentication
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### **2. Monitor Performance**
- Check Vercel Analytics
- Monitor Railway database metrics
- Review error logs

### **3. Setup Alerts**
- Configure uptime monitoring
- Setup error notifications
- Enable performance alerts

---

## **Troubleshooting**

### **Deployment Failed**
```bash
# Check build logs
vercel logs

# Common issues:
# - Missing environment variables
# - Build errors
# - Timeout (increase maxDuration)
```

### **Database Connection Issues**
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check firewall rules
# Ensure Vercel IPs are whitelisted
```

### **API Errors**
```bash
# View function logs
vercel logs --follow

# Check environment variables
vercel env ls
```

---

## **Rolling Back**

### **Vercel Rollback**
```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback [deployment-url]
```

### **Database Rollback**
```bash
# Restore from backup
psql $DATABASE_URL < backup.sql
```

---

## **🎉 Deployment Complete!**

Your AI Soap Opera Studio is now live at:
**https://your-app.vercel.app**

### **Next Steps**:
1. Create your first series
2. Generate test episode
3. Monitor costs and performance
4. Setup automation workflows
5. Share with users!

---

**Need Help?**
- Check logs: `vercel logs`
- Review docs: `/docs`
- Create issue on GitHub
