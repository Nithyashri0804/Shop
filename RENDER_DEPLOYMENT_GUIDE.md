# Render Deployment Guide for AS Shreads

## Quick Deploy to Render

### Option 1: One-Click Deploy (Recommended)
1. Go to [Render.com](https://render.com)
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. The `render.yaml` file will automatically configure everything

### Option 2: Manual Setup
1. Go to [Render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository

**Build Settings:**
- **Environment**: Node
- **Build Command**: `npm install`
- **Start Command**: `node api/index.js`
- **Plan**: Free

**Environment Variables:**
```
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:passkK@ep-broad-snowflake-a1uwr6kw-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=your_very_secure_jwt_secret_key_here_at_least_32_characters_long
BUSINESS_NAME=AS Shreads
BUSINESS_EMAIL=contact@asshreads.com
BUSINESS_PHONE=+91-9876543210
BUSINESS_WHATSAPP=+91-9876543210
```

### After Deployment:
Your AS Shreads API will be available at:
- `https://as-shreads-api.onrender.com`
- Health check: `https://as-shreads-api.onrender.com/api/health`

### Database Options:
- **Use existing Neon database** (recommended) - Just add your DATABASE_URL
- **Create new PostgreSQL on Render** - Let render.yaml create it automatically

## Deploy Steps:
1. Push to GitHub: `git push origin main`
2. Go to Render dashboard
3. Import repository
4. Deploy automatically with render.yaml

Your multi-language e-commerce API will be live on Render!