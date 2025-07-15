# Deployment Guide for AS Shreads E-commerce App

## Prerequisites
- Node.js 20 or higher
- PostgreSQL database
- GitHub repository (for deployment)

## Option 1: Deploy to Render (Recommended)

### Step 1: Set up Database
1. Go to [Render.com](https://render.com) and create an account
2. Click "New +" and select "PostgreSQL"
3. Configure your database:
   - Name: `as-shreads-db`
   - Database: `as_shreads`
   - User: `as_shreads_user`
   - Plan: Free or Starter
4. Click "Create Database"
5. Once created, copy the "Internal Database URL" (starts with `postgresql://`)

### Step 2: Deploy Application
1. Push your code to GitHub
2. In Render dashboard, click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the deployment:
   - **Name**: `as-shreads-app`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### Step 3: Set Environment Variables
In the "Environment" section, add:
- `NODE_ENV` = `production`
- `DATABASE_URL` = (paste your PostgreSQL Internal Database URL from Step 1)
- `JWT_SECRET` = (generate a random 32-character string)

### Step 4: Deploy
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Your app will be available at `https://your-app-name.onrender.com`

---

## Option 2: Deploy to Vercel

### Step 1: Set up Database
1. Go to [Neon.tech](https://neon.tech) and create an account
2. Create a new project
3. Copy the connection string from your dashboard

### Step 2: Deploy Application
1. Push your code to GitHub
2. Go to [Vercel.com](https://vercel.com) and import your repository
3. Configure the deployment:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 3: Set Environment Variables
In Vercel dashboard > Settings > Environment Variables, add:
- `NODE_ENV` = `production`
- `DATABASE_URL` = (your Neon database connection string)
- `JWT_SECRET` = (generate a random 32-character string)

### Step 4: Deploy
1. Click "Deploy"
2. Wait for deployment (3-5 minutes)
3. Your app will be available at `https://your-app-name.vercel.app`

---

## Post-Deployment Setup

### 1. Initialize Database Schema
After deployment, run database migrations:
```bash
# For Render: Use their shell access
# For Vercel: Use their CLI
npx drizzle-kit push
```

### 2. Create Admin User
Access your deployed app and register the first user, then manually update their role to 'admin' in the database.

### 3. Configure Payment Settings
1. Login as admin
2. Go to Admin Panel > Payment Settings
3. Upload your UPI QR code
4. Set business details

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret for JWT tokens | `your-32-char-secret-key-here` |
| `PORT` | Server port (auto-set by platforms) | `5000` |

---

## Troubleshooting

### Common Issues

**Database Connection Errors**:
- Verify `DATABASE_URL` is correct
- Check if database is running
- Ensure IP allowlist includes your deployment platform

**Build Failures**:
- Check Node.js version (should be 20+)
- Verify all dependencies are in package.json
- Check build logs for specific errors

**404 Errors**:
- Verify build output directory
- Check routing configuration
- Ensure static files are served correctly

### Health Check
Both deployments include a health check endpoint:
- `GET /api/health` - Returns app status

### Support
- Render: Check build logs in dashboard
- Vercel: Use `vercel logs` command
- Database: Check connection logs and query performance

---

## Production Optimizations

### Security
- Use strong JWT secrets (32+ characters)
- Enable HTTPS (automatic on both platforms)
- Set up proper CORS policies
- Use environment variables for sensitive data

### Performance
- Enable compression
- Optimize images before upload
- Use CDN for static assets
- Monitor database query performance

### Monitoring
- Set up error tracking
- Monitor uptime
- Track API response times
- Monitor database performance