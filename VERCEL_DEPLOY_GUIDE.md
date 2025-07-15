# Vercel Deployment Guide - AS Shreads App

## Step 1: Set Up Database (Neon)

1. **Go to [neon.tech](https://neon.tech)**
2. **Sign up/login** with your email or GitHub
3. **Create new project:**
   - Project name: `as-shreads-db`
   - Region: Choose closest to your location
   - Database name: `as_shreads` (or leave default)
4. **Copy connection string:**
   - Go to your project dashboard
   - Find "Connection string" section
   - Copy the full URL (starts with `postgresql://`)
   - Example: `postgresql://username:password@host.neon.tech/database?sslmode=require`

## Step 2: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up/login** with GitHub (recommended)
3. **Import your repository:**
   - Click "New Project"
   - Select your GitHub repository
   - Click "Import"

## Step 3: Configure Deployment Settings

1. **Project settings:**
   - Framework Preset: `Other`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

2. **Environment Variables** (click "Add" for each):
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = (paste your Neon connection string)
   - `JWT_SECRET` = `abcd1234efgh5678ijkl9012mnop3456qrst789` (32+ characters)

## Step 4: Deploy

1. **Click "Deploy"**
2. **Wait 3-5 minutes** for deployment
3. **Your app will be live** at `https://your-project-name.vercel.app`

## Step 5: Post-Deployment Setup

1. **Visit your deployed app**
2. **Register first account:**
   - Click "Register"
   - Fill in your details
   - This becomes your admin account
3. **Login and test:**
   - Try adding products
   - Test cart functionality
   - Check payment settings

## Troubleshooting

**Build fails:**
- Check build logs in Vercel dashboard
- Verify Node.js version is 20+

**Database connection errors:**
- Double-check your DATABASE_URL
- Ensure it includes `?sslmode=require` at the end
- Test connection string format

**500 errors:**
- Check Function logs in Vercel dashboard
- Verify all environment variables are set

## Quick Commands

Generate a secure JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Your app should be live and working! The first registered user automatically becomes an admin.