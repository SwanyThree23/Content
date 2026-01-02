# SwanyThree Backend

Production-ready backend for the AI Soap Opera Studio platform.

## Features

- **Authentication:** JWT-based auth with bcrypt password hashing
- **Rate Limiting:** Protection against abuse
- **Error Tracking:** Sentry integration
- **Database:** PostgreSQL with Prisma ORM
- **Security:** CORS, input validation, secure headers
- **API Integrations:** Claude, OpenRouter, ElevenLabs, Whisper, Akool

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- API keys (see `.env.example`)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push
```

### Development

```bash
npm run dev
```

Server runs on `http://localhost:3001`

### Production

```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### AI Services
- `POST /api/claude/chat` - Claude AI chat
- `POST /api/claude/refine-code` - Code refinement
- `POST /api/openrouter/chat` - OpenRouter models
- `GET /api/openrouter/models` - List models
- `POST /api/elevenlabs/tts` - Text-to-speech
- `GET /api/elevenlabs/voices` - List voices
- `POST /api/whisper/transcribe` - Audio transcription
- `POST /api/akool/face-swap` - Face swap
- `POST /api/akool/voice-clone` - Voice cloning
- `POST /api/akool/video-translate` - Video translation

### Usage & Monitoring
- `GET /api/usage/stats` - Usage statistics
- `GET /api/usage/history` - Usage history
- `GET /api/webhooks` - List webhooks
- `POST /api/webhooks/register` - Register webhook
- `DELETE /api/webhooks/:id` - Delete webhook

### Health
- `GET /health` - Health check

## Environment Variables

See `.env.example` for all required variables.

Key variables:
- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - JWT signing secret
- `ANTHROPIC_API_KEY` - Claude API
- `SENTRY_DSN` - Error tracking
- `ALLOWED_ORIGINS` - CORS origins

## Database

### Migrations

```bash
# Create migration
npm run db:migrate

# Apply schema
npm run db:push

# Generate client
npm run db:generate
```

### Backup

```bash
npm run backup
```

## Security Features

- **JWT Authentication** - Secure token-based auth
- **Rate Limiting** - 100 req/15min (general), 5 req/15min (auth)
- **CORS** - Configurable allowed origins
- **Password Hashing** - bcrypt with salt rounds
- **Input Validation** - Request validation
- **Error Tracking** - Sentry monitoring

## Project Structure

```
backend/
├── middleware/
│   └── auth.js          # JWT authentication
├── routes/
│   ├── auth.js          # Authentication
│   ├── projects.js      # Project management
│   ├── apiKeys.js       # API key management
│   ├── claude.js        # Claude AI
│   ├── openrouter.js    # OpenRouter
│   ├── elevenlabs.js    # ElevenLabs TTS
│   ├── whisper.js       # Whisper transcription
│   ├── akool.js         # Akool services
│   ├── mcp.js           # MCP servers
│   ├── chat.js          # Chat history
│   ├── stream.js        # Live streaming
│   ├── usage.js         # Usage tracking
│   └── webhooks.js      # Webhook management
├── scripts/
│   └── backup.js        # Database backup
├── prisma/
│   └── schema.prisma    # Database schema
└── server.js            # Main server
```

## Deployment

See [DEPLOYMENT.md](/DEPLOYMENT.md) for complete deployment guide.

## License

MIT
