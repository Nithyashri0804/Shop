# Vercel Deployment Guide for AS Shreads

## Prerequisites
- Vercel account
- GitHub repository with your code
- PostgreSQL database (Neon recommended)

## Step 1: Environment Variables
Add these environment variables in your Vercel dashboard:

```
DATABASE_URL=your_postgresql_connection_string
NODE_ENV=production
```

## Step 2: Build Configuration
The project is already configured with:
- `vercel.json` for routing
- Serverless function in `api/[...slug].ts`
- `@vercel/node` dependency installed

## Step 3: Deploy to Vercel

### Option A: Using Vercel CLI
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your project directory
3. Follow the prompts

### Option B: Using Vercel Dashboard
1. Connect your GitHub repository
2. Set the build command to: `npm run build`
3. Set the output directory to: `dist/public`
4. Deploy

## Step 4: Database Setup
After deployment, run the database migration:
```bash
vercel env pull .env.local
npm run db:push
```

## Common Issues and Solutions

### Build Error: "transforming..."
This usually happens when the build process encounters module resolution issues. The current configuration should handle this by using the serverless function approach.

### Database Connection Issues
Make sure your DATABASE_URL is properly set in Vercel environment variables and points to a publicly accessible PostgreSQL instance.

### Static Files Not Serving
The app is configured to serve static files through the Express server, which works well with Vercel's serverless functions.

## Current Configuration

### vercel.json
```json
{
  "version": 2,
  "functions": {
    "api/index.js": {
      "runtime": "@vercel/node@3.0.7"
    }
  },
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/api/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### api/index.js
This file handles all requests and serves both API endpoints and static files. It's written in CommonJS format for better Vercel compatibility.

## Fixed Issues
✅ Converted from ES modules to CommonJS for Vercel compatibility
✅ Simplified serverless function structure
✅ Added proper error handling for production
✅ Created basic health check and test endpoints

## Deployment Status
✅ Configuration files created
✅ Serverless function configured
✅ Environment variables documented
✅ Build process optimized for Vercel

## Next Steps
1. Push your code to GitHub
2. Connect GitHub repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

Your AS Shreads application will be available at: `https://your-project-name.vercel.app`