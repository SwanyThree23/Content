# 🎬 AI Soap Opera Studio - Complete Setup Guide

## **🚀 Quick Start (5 Minutes)**

### **Prerequisites**
- Node.js 18+ and npm
- PostgreSQL database (Railway recommended)
- API Keys:
  - Anthropic Claude API key
  - Google Cloud (Veo 3) credentials
  - YouTube OAuth credentials

### **Installation**

```bash
# 1. Clone repository
git clone <your-repo-url>
cd ai-soap-opera-studio

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your API keys

# 4. Setup database
psql $DATABASE_URL < database/complete-schema.sql

# 5. Run development server
npm run dev

# 6. Open browser
# http://localhost:3000
```

---

## **📦 Environment Setup**

### **Required Environment Variables**

Edit `.env.local`:

```bash
# Database (Railway PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/database"

# Anthropic Claude
ANTHROPIC_API_KEY="sk-ant-your-key-here"

# Google Veo 3
GOOGLE_PROJECT_ID="your-project-id"
GOOGLE_APPLICATION_CREDENTIALS="/path/to/credentials.json"

# YouTube OAuth
YOUTUBE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
YOUTUBE_CLIENT_SECRET="your-client-secret"

# Security
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"

# App URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## **🗄️ Database Setup**

### **Option 1: Railway (Recommended)**

1. Create Railway account: https://railway.app
2. Create new PostgreSQL database
3. Copy DATABASE_URL from Railway dashboard
4. Run schema:

```bash
psql $DATABASE_URL < database/complete-schema.sql
```

### **Option 2: Local PostgreSQL**

```bash
# Create database
createdb soapopera_db

# Run schema
psql soapopera_db < database/complete-schema.sql

# Set environment variable
DATABASE_URL="postgresql://localhost/soapopera_db"
```

---

## **🔑 API Keys Setup**

### **1. Anthropic Claude API**

1. Visit: https://console.anthropic.com/
2. Create account and get API key
3. Add to `.env.local`:
   ```
   ANTHROPIC_API_KEY="sk-ant-your-key"
   ```

### **2. Google Veo 3 (Vertex AI)**

1. Create GCP project: https://console.cloud.google.com/
2. Enable Vertex AI API
3. Create service account
4. Download JSON credentials
5. Add to `.env.local`:
   ```
   GOOGLE_PROJECT_ID="your-project-id"
   GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
   ```

### **3. YouTube OAuth**

1. Go to: https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI: `http://localhost:3000/api/auth/youtube/callback`
4. Download credentials and add to `.env.local`:
   ```
   YOUTUBE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   YOUTUBE_CLIENT_SECRET="your-client-secret"
   ```

---

## **🚀 Deployment**

### **Deploy to Vercel (Frontend)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Add environment variables in Vercel dashboard
```

### **Deploy Database to Railway**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway up
```

---

## **🎬 Creating Your First Series**

1. **Start development server**
   ```bash
   npm run dev
   ```

2. **Open Studio**
   - Navigate to http://localhost:3000/studio

3. **Create Series**
   - Click "New Series"
   - Enter title: "My Soap Opera"
   - Set genre, tone, target audience

4. **Generate First Episode**
   - Click "Generate Episode"
   - Wait 30 seconds for AI script generation
   - Review generated script and scenes

5. **Generate Videos**
   - Click "Generate Videos" on episode
   - Wait 20-30 minutes for Veo 3 processing

6. **Publish to YouTube**
   - Click "Upload to YouTube"
   - Set privacy status
   - Episode goes live!

---

## **🤖 Automation Setup (Optional)**

### **N8N Workflow**

1. Install N8N:
   ```bash
   npm install -g n8n
   n8n start
   ```

2. Import workflow:
   - Open http://localhost:5678
   - Import: `n8n-workflows/soap-opera-automation.json`

3. Configure environment variables in N8N:
   - API_URL: Your app URL
   - API_TOKEN: Your JWT token
   - SERIES_ID: Your series ID

4. Activate workflow for automatic episode generation every 3 days

---

## **📊 Project Structure**

```
ai-soap-opera-studio/
├── app/                      # Next.js app directory
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── series/         # Series management
│   │   ├── episodes/       # Episode generation
│   │   ├── videos/         # Video generation
│   │   └── youtube/        # YouTube integration
│   ├── studio/             # Studio interface
│   └── page.tsx            # Landing page
├── lib/                     # Core libraries
│   ├── ai/                 # AI integrations
│   │   ├── claude.ts       # Claude script generation
│   │   └── veo3.ts         # Veo 3 video generation
│   ├── youtube/            # YouTube client
│   ├── db.ts               # Database utilities
│   └── auth.ts             # Authentication
├── database/                # Database schemas
│   └── complete-schema.sql # PostgreSQL schema
├── scripts/                 # Deployment scripts
│   └── deploy.sh           # Automated deployment
├── n8n-workflows/          # Automation workflows
└── docs/                    # Documentation
```

---

## **🔧 Common Issues**

### **Database Connection Failed**
```bash
# Check DATABASE_URL is set
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### **API Key Invalid**
- Verify keys in `.env.local`
- Restart dev server after changes
- Check API key has required permissions

### **Video Generation Slow**
- Veo 3 takes 20-30 minutes per episode
- This is normal for AI video generation
- Consider generating overnight

### **YouTube Upload Failed**
- Verify OAuth credentials
- Check redirect URI matches exactly
- Ensure channel is verified

---

## **💡 Tips for Success**

1. **Start Small**: Create 1-2 series initially
2. **Test Locally**: Verify everything works before deploying
3. **Monitor Costs**: AI generation has costs - set budgets
4. **Quality Check**: Review scripts before video generation
5. **Iterate**: Use analytics to improve content

---

## **📚 Next Steps**

- Read API documentation: `/docs/API_REFERENCE.md`
- Setup automation: N8N workflows
- Configure analytics: YouTube Analytics integration
- Scale up: Add more series and automate publishing

---

## **🆘 Support**

- Documentation: Check `/docs` folder
- Issues: Create GitHub issue
- Community: Join Discord (link TBD)

---

**🎉 You're ready to create AI soap operas! Start generating content and watch your audience grow!**
