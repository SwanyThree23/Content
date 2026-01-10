# SwanyBot Live - Enterprise Platform

Full-stack AI-powered platform with 35+ integrations, streaming, and SaaS monetization.

## Quick Start

```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## Deploy

```bash
chmod +x deploy.sh
./deploy.sh
```

## Stack
- Backend: Node.js + Express + TypeScript
- Frontend: React 18 + Vite + TailwindCSS
- DB: Supabase (PostgreSQL)
- Cache: Redis
- Payments: Stripe
- AI: Claude, OpenRouter, ElevenLabs, etc.

## Features
- 35+ integrations
- Live streaming (VDO.Ninja, Prism, EvMux)
- Document RAG with Pinecone
- Multi-tenant with teams
- SaaS billing with Stripe
- Admin dashboard with flywheel metrics
- 2FA, OAuth (GitHub, Google)
- Real-time WebSocket
- Background job queues
