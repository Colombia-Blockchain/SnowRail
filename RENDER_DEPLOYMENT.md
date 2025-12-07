# 🚀 Render Deployment Guide

## Quick Setup

### 1. Create PostgreSQL Database

1. Go to Render Dashboard → **New** → **PostgreSQL**
2. Settings:
   - Name: `snowrail-db`
   - Plan: **Free**
   - Region: Oregon (same as web service)
3. Click **Create Database**
4. Copy the **Internal Database URL** (starts with `postgresql://`)

### 2. Create Web Service

1. Go to Render Dashboard → **New** → **Web Service**
2. Connect your GitHub repository: `KevinMB0220/SnowRail`
3. Settings:
   - **Name**: `snowrail-backend`
   - **Region**: Oregon
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node --max-old-space-size=512 dist/server.js`
   - **Plan**: Free

### 3. Environment Variables

Add these in the **Environment** section:

```bash
# Required
DATABASE_URL=<paste_internal_database_url>
PORT=4000

# Avalanche (Fuji Testnet)
NETWORK=fuji
RPC_URL_AVALANCHE=https://api.avax-test.network/ext/bc/C/rpc
TREASURY_CONTRACT_ADDRESS=0xcba2318C6C4d9c98f7732c5fDe09D1BAe12c27be
PRIVATE_KEY=<your_private_key>

# Rail API (optional - for withdrawals)
RAIL_API_BASE_URL=https://sandbox.layer2financial.com/api
RAIL_AUTH_URL=https://auth.layer2financial.com/oauth2/ausbdqlx69rH6OjWd696/v1/token
RAIL_CLIENT_ID=<your_rail_client_id>
RAIL_CLIENT_SECRET=<your_rail_client_secret>

# Arweave (optional - for permanent receipts)
ARWEAVE_JWK=<your_arweave_jwk_json>
```

### 4. Deploy

Click **Create Web Service** and Render will:
1. Clone your repo
2. Install dependencies
3. Run Prisma migrations
4. Build TypeScript
5. Start the server

---

## 🔧 Troubleshooting

### Error: "Reached heap limit Allocation failed"

**Solution**: The start command already includes `--max-old-space-size=512`.

If you still get OOM errors:
1. Go to your Web Service settings
2. Change Start Command to: `node --max-old-space-size=1024 dist/server.js`
3. Click **Save Changes**
4. Manually deploy again

### Error: "prisma: not found"

**Solution**: Already fixed. Prisma is in production dependencies.

### Database Connection Issues

1. Verify `DATABASE_URL` is set correctly
2. Check it's the **Internal Database URL** (not External)
3. Format: `postgresql://user:pass@host:port/dbname`

### Build Fails

```bash
# Common causes:
- Missing environment variables
- Wrong root directory (should be 'backend')
- Incorrect build command
```

### Health Check Fails

Your server should have a `/health` endpoint that returns 200 OK.

If missing, add to your server:

```typescript
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
```

---

## 📊 Resource Limits (Free Tier)

| Resource | Limit |
|----------|-------|
| RAM | 512 MB |
| CPU | Shared |
| Bandwidth | 100 GB/month |
| Build Time | 15 min |
| Database Storage | 1 GB |

---

## 🔄 Auto-Deploy

Render automatically deploys when you push to `main` branch.

To disable:
1. Go to Web Service settings
2. Uncheck "Auto-Deploy"

---

## 🌐 Custom Domain

Free tier includes:
- `https://snowrail-backend.onrender.com`

For custom domain:
1. Upgrade to paid plan
2. Add domain in settings
3. Configure DNS records

---

## 📝 Monitoring

### Logs

View real-time logs:
1. Go to your Web Service
2. Click **Logs** tab
3. Filter by severity if needed

### Health Check

Render pings `/health` every few minutes.

If it fails 3 times, service is marked as down.

---

## 🚀 Production Checklist

Before going live:

- [ ] Database backups enabled
- [ ] Environment variables set
- [ ] Health check endpoint working
- [ ] Logs monitoring configured
- [ ] Error tracking setup (Sentry, etc.)
- [ ] Rate limiting enabled
- [ ] CORS configured properly
- [ ] Secrets rotated from development

---

## 💰 Upgrade to Paid Plan

Benefits:
- More RAM (4-32 GB)
- Dedicated CPU
- No sleep on free tier
- Custom domains
- Better performance

Cost: Starting at $7/month

---

## 🆘 Support

- [Render Docs](https://render.com/docs)
- [Render Community](https://community.render.com)
- [SnowRail Issues](https://github.com/KevinMB0220/SnowRail/issues)

