#!/bin/bash

set -e

echo "🚀 SwanyBot Live - Deployment Script"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f backend/.env ]; then
    echo -e "${RED}❌ Error: backend/.env file not found${NC}"
    echo "Please create backend/.env from backend/.env.example"
    exit 1
fi

echo -e "${GREEN}✓${NC} Environment file found"

# Backend deployment
echo ""
echo "📦 Building Backend..."
cd backend
npm install
npm run build
echo -e "${GREEN}✓${NC} Backend built successfully"

# Frontend deployment
echo ""
echo "📦 Building Frontend..."
cd ../frontend
npm install
npm run build
echo -e "${GREEN}✓${NC} Frontend built successfully"

cd ..

echo ""
echo "======================================"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Deploy backend/dist to your Node.js hosting (Railway, Render, etc.)"
echo "2. Deploy frontend/dist to your static hosting (Vercel, Netlify, etc.)"
echo "3. Update FRONTEND_URL in backend .env"
echo "4. Update VITE_API_URL in frontend .env"
echo ""
echo "For local development:"
echo "  Backend:  cd backend && npm run dev"
echo "  Frontend: cd frontend && npm run dev"
