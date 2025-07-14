# Deployment Guide for AS Shreads E-commerce Platform

This guide covers deploying your full-stack e-commerce application to both **Render** and **Vercel**.

## 🚀 Prerequisites

Before deploying, ensure you have:
- A GitHub account and repository containing your code
- A database (PostgreSQL) - both platforms offer free tiers
- Basic knowledge of environment variables

## 📋 Pre-Deployment Setup

### 1. Database Setup
You'll need a PostgreSQL database. Both platforms offer database hosting:
- **Render**: Built-in PostgreSQL database
- **Vercel**: Use Neon, Supabase, or other PostgreSQL providers

### 2. Environment Variables
Prepare these environment variables:
```
NODE_ENV=production
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

---

## 🔧 Option 1: Deploy to Render

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up using your GitHub account
3. Connect your GitHub repository

### Step 3: Create Database
1. In Render dashboard, click "New" → "PostgreSQL"
2. Configure:
   - **Name**: `as-shreads-db`
   - **Database Name**: `as_shreads`
   - **User**: `as_shreads_user`
   - **Region**: Choose closest to your users
   - **Plan**: Free tier
3. Click "Create Database"
4. Copy the "External Database URL" (starts with `postgres://`)

### Step 4: Deploy Web Service
1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `as-shreads-app`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free tier

### Step 5: Set Environment Variables
In the web service settings, add:
- `NODE_ENV`: `production`
- `DATABASE_URL`: [paste your database URL from step 3]
- `JWT_SECRET`: [generate a secure random string]
- `PORT`: `5000`

### Step 6: Deploy
1. Click "Deploy"
2. Wait for build to complete (5-10 minutes)
3. Your app will be available at `https://your-app-name.onrender.com`

---

## ⚡ Option 2: Deploy to Vercel

### Step 1: Database Setup
Since Vercel doesn't provide databases, use **Neon** (recommended):

1. Go to [neon.tech](https://neon.tech)
2. Sign up and create a new project
3. Create a database named `as_shreads`
4. Copy the connection string

### Step 2: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 3: Deploy to Vercel
```bash
# In your project directory
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? [your account]
# - Link to existing project? No
# - Project name? as-shreads-app
# - Directory? ./
# - Override settings? No
```

### Step 4: Set Environment Variables
```bash
# Add environment variables
vercel env add NODE_ENV production
vercel env add DATABASE_URL [your-neon-database-url]
vercel env add JWT_SECRET [your-secret-key]
```

### Step 5: Deploy
```bash
vercel --prod
```

---

## 🗄️ Database Migration

After deployment, you need to set up your database schema:

### For Render:
1. In Render dashboard, go to your web service
2. Open the "Shell" tab
3. Run: `npm run db:push`

### For Vercel:
Since Vercel is serverless, you'll need to run migrations locally:
```bash
# Set your production DATABASE_URL locally
export DATABASE_URL="your_production_database_url"
npm run db:push
```

---

## 🔧 Post-Deployment Setup

### 1. Test Your Deployment
Visit your deployed URL and check:
- [ ] Home page loads
- [ ] Registration works
- [ ] Login works
- [ ] Product display works
- [ ] Admin panel accessible

### 2. Add Sample Data
Log into your admin panel and:
- Create product categories
- Add some sample products
- Test the order flow

### 3. Configure Domain (Optional)
Both platforms support custom domains:
- **Render**: Go to Settings → Custom Domains
- **Vercel**: Go to project settings → Domains

---

## 🐛 Troubleshooting

### Common Issues:

**Build Fails**
- Check that all dependencies are in `package.json`
- Ensure TypeScript compilation succeeds
- Verify file paths are correct

**Database Connection Issues**
- Verify `DATABASE_URL` is correct
- Check database is running and accessible
- Ensure database schema exists

**Environment Variables**
- Double-check all required variables are set
- Verify variable names match exactly
- Restart service after changing variables

**File Upload Issues**
- Both platforms have limits on file uploads
- Consider using cloud storage (AWS S3, Cloudinary) for production

---

## 📊 Performance Optimization

### For Production:
1. **Enable Compression**: Already configured in Express
2. **Database Optimization**: Add indexes for frequently queried fields
3. **Caching**: Consider Redis for session storage
4. **CDN**: Use for static assets and images

### Monitoring:
- **Render**: Built-in logs and metrics
- **Vercel**: Analytics dashboard
- **Database**: Monitor connection pool usage

---

## 💰 Cost Considerations

### Render Free Tier:
- 512MB RAM, shared CPU
- 500 build minutes/month
- Apps sleep after 15 minutes of inactivity

### Vercel Free Tier:
- 100 GB bandwidth/month
- 1000 serverless function invocations/day
- 10 GB storage

### Database Costs:
- **Render PostgreSQL**: Free tier with 1GB storage
- **Neon**: Free tier with 3GB storage

---

## 🔐 Security Checklist

Before going live:
- [ ] Change default JWT secret
- [ ] Use HTTPS (automatically provided)
- [ ] Enable CORS properly
- [ ] Validate all user inputs
- [ ] Set up proper error handling
- [ ] Configure rate limiting
- [ ] Regular security updates

---

## 📞 Support Resources

- **Render**: [docs.render.com](https://docs.render.com)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Neon**: [neon.tech/docs](https://neon.tech/docs)

---

## 🎯 Next Steps

After successful deployment:
1. Set up monitoring and alerts
2. Configure automated backups
3. Set up staging environment
4. Implement CI/CD pipeline
5. Add performance monitoring
6. Set up error tracking (Sentry, LogRocket)

---

**Choose your preferred platform and follow the corresponding section above. Both options will give you a fully functional e-commerce application!**