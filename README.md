# 🎬 SwanyThree AI Soap Opera Studio

Complete production-ready full-stack platform for creating AI-powered soap operas with multi-model AI integration, real-time streaming, and comprehensive API management.

## 🚀 Features

### Core Capabilities
- **Multi-Model AI Chat** - Claude, OpenRouter, GPT integration
- **Voice Generation** - ElevenLabs text-to-speech with voice cloning
- **Speech Recognition** - OpenAI Whisper transcription
- **Video Processing** - Akool face swap, voice cloning, video translation
- **Real-Time Streaming** - Live soap opera broadcasts
- **Project Management** - Organize and track productions
- **Usage Analytics** - Monitor costs and API usage
- **Webhook System** - Event-driven integrations
- **MCP Server Support** - Model Context Protocol integration

### Production Features
- ✅ JWT authentication with bcrypt
- ✅ Rate limiting (100 req/15min general, 5 req/15min auth)
- ✅ Sentry error tracking and performance monitoring
- ✅ PostgreSQL database with Prisma ORM
- ✅ CORS protection
- ✅ Automated database backups
- ✅ Comprehensive API documentation
- ✅ TypeScript support ready

## 📋 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- API keys (Anthropic, OpenRouter, OpenAI, ElevenLabs, Akool)

### Backend Setup

```bash
# Clone repository
git clone <repo-url>
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your API keys

# Generate JWT secret
openssl rand -base64 48
# Add to .env as JWT_SECRET

# Setup database
npm run db:generate
npm run db:push

# Start development server
npm run dev
```

Backend runs on `http://localhost:3001`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Set VITE_API_URL=http://localhost:3001/api

# Start development server
npm run dev
```

Frontend runs on `http://localhost:3000`

## 📁 Project Structure

```
swanythree/
├── backend/
│   ├── middleware/
│   │   └── auth.js              # JWT authentication
│   ├── routes/
│   │   ├── auth.js              # User authentication
│   │   ├── projects.js          # Project management
│   │   ├── apiKeys.js           # API key management
│   │   ├── claude.js            # Claude AI integration
│   │   ├── openrouter.js        # OpenRouter models
│   │   ├── elevenlabs.js        # Text-to-speech
│   │   ├── whisper.js           # Speech-to-text
│   │   ├── akool.js             # Video processing
│   │   ├── mcp.js               # MCP servers
│   │   ├── chat.js              # Chat history
│   │   ├── stream.js            # Live streaming
│   │   ├── usage.js             # Analytics
│   │   └── webhooks.js          # Webhook management
│   ├── scripts/
│   │   └── backup.js            # Database backup
│   ├── prisma/
│   │   └── schema.prisma        # Database schema
│   ├── server.js                # Main server
│   ├── package.json
│   ├── .env.example
│   └── README.md
├── frontend/
│   ├── src/
│   │   └── services/
│   │       └── api.js           # API client
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
├── DEPLOYMENT.md                # Production deployment guide
├── SECURITY.md                  # Security documentation
├── INTEGRATION_GUIDE.md         # Integration tutorial
├── SOAP_OPERA_README.md         # Soap opera specific guide
└── README.md                    # This file
```

## 🔐 Security

### Authentication
- JWT tokens with 7-day expiration
- bcrypt password hashing (10 rounds)
- Automatic token refresh
- Secure session management

### Rate Limiting
- General API: 100 requests per 15 minutes
- Auth endpoints: 5 attempts per 15 minutes
- Configurable per environment

### Monitoring
- Sentry error tracking
- Performance profiling
- Request tracing
- Custom error logging

See [SECURITY.md](SECURITY.md) for complete security documentation.

## 🚢 Deployment

### Railway (Backend)
```bash
cd backend
railway login
railway init
railway add postgresql
railway variables set JWT_SECRET="<your-secret>"
railway variables set ANTHROPIC_API_KEY="<your-key>"
# ... set other variables
railway up
```

### Vercel (Frontend)
```bash
cd frontend
vercel --prod
# Set VITE_API_URL in Vercel dashboard
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment guide.

## 📚 API Documentation

### Authentication
```bash
# Register
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}

# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Projects
```bash
# List projects
GET /api/projects
Authorization: Bearer <token>

# Create project
POST /api/projects
Authorization: Bearer <token>
{
  "name": "My Soap Opera",
  "description": "A dramatic story",
  "type": "soap_opera"
}
```

### AI Services
```bash
# Claude chat
POST /api/claude/chat
Authorization: Bearer <token>
{
  "messages": [{"role": "user", "content": "Hello"}],
  "model": "claude-sonnet-4-20250514"
}

# Text-to-speech
POST /api/elevenlabs/tts
Authorization: Bearer <token>
{
  "text": "Hello world",
  "voiceId": "EXAVITQu4vr4xnSDxMaL"
}

# Transcription
POST /api/whisper/transcribe
Authorization: Bearer <token>
Content-Type: multipart/form-data
[audio file]
```

See [backend/README.md](backend/README.md) for complete API documentation.

## 🔧 Development

### Database Migrations
```bash
# Create migration
npm run db:migrate

# Apply schema changes
npm run db:push

# Regenerate Prisma client
npm run db:generate

# Open Prisma Studio
npx prisma studio
```

### Backup Database
```bash
npm run backup
# Creates backup in /backend/backups/
```

### Testing
```bash
# Health check
curl http://localhost:3001/health

# Test auth
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test"}'
```

## 📊 Usage Analytics

Track API usage, costs, and performance:

```bash
# Get usage stats
GET /api/usage/stats
Authorization: Bearer <token>

# Get usage history
GET /api/usage/history?days=30
Authorization: Bearer <token>
```

## 🪝 Webhooks

Register webhooks for events:

```bash
# Register webhook
POST /api/webhooks/register
Authorization: Bearer <token>
{
  "url": "https://your-server.com/webhook",
  "event": "project.created"
}
```

Supported events:
- `project.created`
- `project.updated`
- `stream.started`
- `stream.ended`
- `usage.threshold`

## 🛠️ Tech Stack

### Backend
- **Framework:** Express.js
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** JWT + bcrypt
- **Monitoring:** Sentry
- **Security:** express-rate-limit, CORS, helmet
- **File Upload:** Multer
- **API Clients:** Axios

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Styling:** Tailwind CSS (recommended)

### AI Services
- **Claude:** Anthropic API
- **Multi-Model:** OpenRouter
- **TTS:** ElevenLabs
- **STT:** OpenAI Whisper
- **Video:** Akool

## 🔗 Integration Guides

- [Integration Guide](INTEGRATION_GUIDE.md) - Complete integration tutorial
- [Soap Opera Guide](SOAP_OPERA_README.md) - Soap opera creation workflow
- [Security Guide](SECURITY.md) - Security best practices
- [Deployment Guide](DEPLOYMENT.md) - Production deployment

## 📝 Environment Variables

### Backend Required
```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=<48-char-base64>
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENROUTER_API_KEY=sk-or-v1-...
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=sk_...
AKOOL_API_KEY=...
SENTRY_DSN=https://...
ALLOWED_ORIGINS=https://your-frontend.com
```

### Frontend Required
```env
VITE_API_URL=https://your-backend.railway.app/api
```

## 🐛 Troubleshooting

### Backend won't start
- Check all environment variables are set
- Verify database connection
- Run `npm run db:generate`

### Frontend can't connect
- Verify `VITE_API_URL` is correct
- Check CORS settings in backend
- Test backend health endpoint

### Database errors
- Run migrations: `npm run db:push`
- Check DATABASE_URL format
- Verify PostgreSQL is running

## 📈 Monitoring

### Sentry Dashboard
- Real-time error tracking
- Performance monitoring
- User impact analysis
- Release tracking

### Logs
```bash
# Railway logs
railway logs

# Local logs
npm run dev  # Shows all console output
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## 🆘 Support

- **Documentation:** See `/docs` folder
- **Issues:** GitHub Issues
- **Security:** See [SECURITY.md](SECURITY.md)

## 🎯 Roadmap

- [ ] WebSocket support for real-time collaboration
- [ ] Video editing timeline interface
- [ ] Character management system
- [ ] Scene templates library
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Plugin system for custom integrations

## 🙏 Acknowledgments

- Anthropic (Claude AI)
- OpenRouter (Multi-model access)
- ElevenLabs (Voice synthesis)
- OpenAI (Whisper)
- Akool (Video processing)
- Railway (Hosting)
- Vercel (Frontend hosting)
- Sentry (Monitoring)

---

**Built with ❤️ for creators of AI-powered content**

🎬 **Ready to create your AI soap opera? Get started now!** 🚀
