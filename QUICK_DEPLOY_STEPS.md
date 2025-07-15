# Quick Deploy Steps - AS Shreads App

## The Build Error Solution

The build error you're seeing is because Render tries to install only production dependencies, but our build tools are in devDependencies. I've fixed this by moving the build tools to production dependencies.

## Deploy to Render (Fixed Steps)

### Step 1: Push to GitHub
```bash
# Make sure your code is committed and pushed
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Create Database
1. Go to [render.com](https://render.com)
2. Click "New +" → "PostgreSQL" 
3. Settings:
   - Name: `as-shreads-db`
   - Database: `as_shreads`
   - User: `as_shreads_user`
   - Plan: Free (for testing)
4. Click "Create Database"
5. Copy the "Internal Database URL" from the database info page

### Step 3: Deploy App
1. Click "New +" → "Web Service"
2. Connect your GitHub repo
3. Settings:
   - Name: `as-shreads-app`
   - Environment: `Node`
   - Build Command: `npm ci && npm run build`
   - Start Command: `npm start`
   - Node Version: `20`

### Step 4: Environment Variables
Add these in the Environment section:
- `NODE_ENV` = `production`
- `DATABASE_URL` = (paste your database URL from step 2)
- `JWT_SECRET` = `your-random-32-character-secret-key`

### Step 5: Deploy
Click "Create Web Service" and wait 5-10 minutes.

## Alternative: Deploy to Vercel (Simpler)

### Step 1: Database Setup
1. Go to [neon.tech](https://neon.tech)
2. Create account and new project
3. Copy connection string

### Step 2: Deploy
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Settings:
   - Framework: Other
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Environment Variables:
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = (neon connection string)
   - `JWT_SECRET` = `your-random-32-character-secret-key`
5. Click "Deploy"

## After Deployment

### Create Admin Account
1. Visit your deployed app
2. Register a new account
3. This becomes your admin account

### If You Get Errors
- Check the deployment logs in your platform dashboard
- Verify your DATABASE_URL is correct
- Make sure JWT_SECRET is set

Your app should now be live and working! The build issue has been resolved by moving the necessary build tools to production dependencies.