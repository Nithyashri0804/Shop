# Simple Vercel Deployment Guide for AS Shreads

## What I Created for You:
✅ **Clean API structure** - Simple Express.js serverless function
✅ **PostgreSQL integration** - Uses your production database
✅ **Core endpoints** - Auth, products, orders, categories
✅ **Multi-language support** - English, Hindi, Spanish
✅ **No build complexity** - Direct JavaScript deployment

## Deploy Steps:

### 1. Push to Git (if not already done):
```bash
git add .
git commit -m "Simple Vercel deployment setup"
git push origin main
```

### 2. Go to Vercel Dashboard:
- Import your GitHub repository
- Select "AS Shreads" project

### 3. Configure Build Settings:
- **Framework Preset**: Other
- **Build Command**: Leave EMPTY (turn off the toggle)
- **Output Directory**: Leave EMPTY
- **Install Command**: npm install

### 4. Add Environment Variables:
```
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:passkK@ep-broad-snowflake-a1uwr6kw-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=your_very_secure_jwt_secret_key_here_at_least_32_characters_long
BUSINESS_NAME=AS Shreads
BUSINESS_EMAIL=your_business_email@example.com
BUSINESS_PHONE=your_business_phone
BUSINESS_WHATSAPP=your_whatsapp_number
```

### 5. Deploy:
- Click "Deploy"
- Wait for deployment to complete

## After Deployment:
Your API will be available at:
- **Homepage**: `https://your-app.vercel.app/`
- **Health Check**: `https://your-app.vercel.app/api/health`
- **Login**: `https://your-app.vercel.app/api/auth/login`
- **Register**: `https://your-app.vercel.app/api/auth/register`
- **Products**: `https://your-app.vercel.app/api/products`

## Test Your Deployment:
```bash
# Test health endpoint
curl https://your-app.vercel.app/api/health

# Test with different languages
curl "https://your-app.vercel.app/api/health?lang=hi"
curl "https://your-app.vercel.app/api/health?lang=es"

# Test register
curl -X POST https://your-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"testpass123"}'
```

## Language Support:
- **English**: `https://your-app.vercel.app?lang=en`
- **Hindi**: `https://your-app.vercel.app?lang=hi`
- **Spanish**: `https://your-app.vercel.app?lang=es`

This setup is clean, simple, and will deploy without any build errors!