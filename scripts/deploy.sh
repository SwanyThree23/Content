#!/bin/bash
# ============================================
# AI SOAP OPERA STUDIO - DEPLOYMENT SCRIPT
# ============================================

set -e

echo "🚀 Starting AI Soap Opera Studio Deployment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

# Check environment variables
echo -e "${BLUE}🔐 Checking environment variables...${NC}"

if [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠️  .env.local not found, copying from .env.example${NC}"
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local with your actual API keys"
fi

# Required environment variables
REQUIRED_VARS=(
    "DATABASE_URL"
    "ANTHROPIC_API_KEY"
    "YOUTUBE_CLIENT_ID"
    "YOUTUBE_CLIENT_SECRET"
    "JWT_SECRET"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^${var}=" .env.local; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Missing environment variables:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Please configure these variables in .env.local before continuing"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables configured${NC}"

# Setup database
echo -e "${BLUE}🗄️  Setting up database...${NC}"

if [ -n "$DATABASE_URL" ]; then
    echo "Running database migrations..."
    psql "$DATABASE_URL" < database/complete-schema.sql || echo "⚠️  Database already initialized"
    echo -e "${GREEN}✅ Database setup complete${NC}"
else
    echo -e "${YELLOW}⚠️  DATABASE_URL not set, skipping database setup${NC}"
fi

# Build application
echo -e "${BLUE}🔨 Building application...${NC}"
npm run build

echo -e "${GREEN}✅ Build complete${NC}"

# Deployment options
echo ""
echo "=========================================="
echo "🎉 Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Local Development:"
echo "   npm run dev"
echo "   Open http://localhost:3000"
echo ""
echo "2. Deploy to Vercel:"
echo "   vercel --prod"
echo ""
echo "3. Deploy Database to Railway:"
echo "   railway up"
echo ""
echo "4. Setup N8N Automation:"
echo "   Import: n8n-workflows/soap-opera-automation.json"
echo ""
echo "=========================================="
echo ""
echo -e "${GREEN}🚀 Ready to create AI soap operas!${NC}"
