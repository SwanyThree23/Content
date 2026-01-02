# Security Guide

Comprehensive security implementation for SwanyThree platform.

## Authentication & Authorization

### JWT Implementation

**Token Generation:**
```javascript
const token = jwt.sign(
  { id: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

**Token Verification:**
```javascript
jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
  if (err) return res.status(403).json({ error: 'Invalid token' });
  req.user = user;
  next();
});
```

**Best Practices:**
- ✅ Tokens expire after 7 days
- ✅ Secrets are 48+ characters (base64)
- ✅ Tokens stored in localStorage (frontend)
- ✅ Automatic logout on 401 responses

### Password Security

**Hashing:**
```javascript
const hashedPassword = await bcrypt.hash(password, 10);
```

**Verification:**
```javascript
const validPassword = await bcrypt.compare(password, user.password);
```

**Requirements:**
- ✅ bcrypt with 10 salt rounds
- ✅ Passwords never stored in plain text
- ✅ Failed login attempts rate limited

## Rate Limiting

### General API Endpoints
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests' }
});
```

### Authentication Endpoints
```javascript
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                     // 5 attempts
  skipSuccessfulRequests: true,
  message: { error: 'Too many login attempts' }
});
```

### Bypass for Development
Rate limiting is applied in production only. Development mode has no limits.

## CORS Configuration

### Production
```javascript
const allowedOrigins = [
  'https://swanythree.vercel.app',
  'https://swanythree.com'
];
```

### Development
```javascript
const allowedOrigins = ['http://localhost:3000'];
```

### Settings
```javascript
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## Error Tracking (Sentry)

### Initialization
```javascript
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
    new ProfilingIntegration()
  ],
  tracesSampleRate: 1.0
});
```

### Features
- ✅ Automatic error capture
- ✅ Performance monitoring
- ✅ Request tracing
- ✅ Performance profiling
- ✅ User context tracking

### Error Handler
```javascript
app.use(Sentry.Handlers.errorHandler());

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});
```

## Database Security

### Connection
- ✅ Connection string in environment variables
- ✅ SSL enabled for production
- ✅ Credentials never committed to git

### Queries
- ✅ Prisma ORM prevents SQL injection
- ✅ Parameterized queries only
- ✅ Input validation on all endpoints

### Backups
```bash
# Daily automated backups
npm run backup

# Stores in /backend/backups/
# Format: backup-YYYY-MM-DDTHH-MM-SS.sql
```

## API Keys Protection

### Storage
- ✅ All keys in environment variables
- ✅ Never committed to git
- ✅ Different keys for dev/prod
- ✅ Rotation policy recommended (quarterly)

### Usage
```javascript
headers: {
  'x-api-key': process.env.ANTHROPIC_API_KEY
}
```

### User API Keys
- ✅ Cryptographically random generation
- ✅ SHA-256 hashing for storage
- ✅ Prefix: `sk_` for identification
- ✅ Last 4 characters visible only

## Input Validation

### File Uploads
```javascript
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024  // 50MB limit
  }
});
```

### JSON Payloads
```javascript
app.use(express.json({ limit: '50mb' }));
```

### Validation Pattern
```javascript
// Example validation
if (!email || !password) {
  return res.status(400).json({ error: 'Missing required fields' });
}

if (!email.includes('@')) {
  return res.status(400).json({ error: 'Invalid email' });
}
```

## Environment Variables

### Required Security Variables
```env
# JWT secret (48+ characters)
JWT_SECRET="generated-with-openssl-rand-base64-48"

# Sentry DSN
SENTRY_DSN="https://...@....ingest.sentry.io/..."

# Allowed origins (comma-separated)
ALLOWED_ORIGINS="https://swanythree.vercel.app,https://swanythree.com"

# Database (SSL enabled in production)
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

### Generating Secrets
```bash
# JWT secret (48 characters)
openssl rand -base64 48

# API key (32 characters)
openssl rand -hex 32
```

## Security Headers

### Implemented
- ✅ CORS headers
- ✅ Content-Type validation
- ✅ Authorization header validation

### Recommended Additions
```javascript
// Add helmet for additional security headers
const helmet = require('helmet');
app.use(helmet());
```

## Webhook Security

### Validation
```javascript
// Verify webhook source
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return hash === signature;
}
```

### Retry Logic
- ✅ Failed webhooks logged
- ✅ No automatic retries (prevents loops)
- ✅ Call count tracked

## Monitoring & Alerts

### Sentry Alerts
1. Set up in Sentry dashboard
2. Configure email/Slack notifications
3. Monitor:
   - Error rates
   - Performance degradation
   - Failed API calls

### Custom Logging
```javascript
console.error('Security event:', {
  type: 'failed_login',
  email: sanitizedEmail,
  ip: req.ip,
  timestamp: new Date()
});
```

## Security Checklist

### Deployment
- [ ] Generate strong JWT secret
- [ ] Set up Sentry monitoring
- [ ] Configure CORS for production domains
- [ ] Enable database SSL
- [ ] Set rate limits appropriately
- [ ] Review all environment variables
- [ ] Test authentication flow
- [ ] Verify API key rotation policy

### Ongoing Maintenance
- [ ] Monitor Sentry daily
- [ ] Review access logs weekly
- [ ] Rotate API keys quarterly
- [ ] Update dependencies monthly
- [ ] Run security audits (`npm audit`)
- [ ] Test backups monthly
- [ ] Review rate limit effectiveness

## Incident Response

### If API Key Compromised
1. Immediately rotate the key
2. Update environment variables
3. Redeploy application
4. Review access logs
5. Notify affected users

### If Database Compromised
1. Restore from latest backup
2. Change all credentials
3. Review audit logs
4. Force password reset for all users
5. Notify users per GDPR requirements

### If Error Rate Spikes
1. Check Sentry dashboard
2. Review recent deployments
3. Check rate limiting logs
4. Scale resources if needed
5. Rollback if necessary

## Compliance

### GDPR Considerations
- ✅ User data deletion endpoints
- ✅ Data export capability
- ✅ Privacy-focused logging
- ✅ Secure data storage

### Best Practices
- ✅ Principle of least privilege
- ✅ Defense in depth
- ✅ Regular security audits
- ✅ Dependency updates
- ✅ Secure by default

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Prisma Security](https://www.prisma.io/docs/guides/security)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Security is an ongoing process. Review and update this guide regularly.**
