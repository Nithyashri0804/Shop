# Deploy Full AS Shreads Website to Vercel

## Problem Fixed
Your deployment was only showing the API landing page because Vercel wasn't building your React frontend.

## Solution
Updated Vercel configuration to:
- Build your React frontend from `client` folder
- Serve API endpoints under `/api/` route
- Serve your full e-commerce website at the root

## Deploy Steps:

### 1. Push Updated Configuration
```bash
git add .
git commit -m "Deploy full React frontend + API to Vercel"
git push origin main
```

### 2. Vercel Build Settings
- **Framework**: Other
- **Build Command**: Leave empty (Vercel will use the build configs)
- **Install Command**: npm install
- **Root Directory**: . (root)

### 3. Environment Variables (same as before)
```
NODE_ENV=production
DATABASE_URL=your_render_database_url
JWT_SECRET=your_jwt_secret
BUSINESS_NAME=AS Shreads
BUSINESS_EMAIL=contact@asshreads.com
BUSINESS_PHONE=+91-9876543210
```

## What You'll Get:
- **Homepage**: Full React e-commerce website
- **Product Pages**: Browse and view products
- **Shopping Cart**: Add items and checkout
- **User Authentication**: Login/register
- **Admin Panel**: Product and order management
- **API Endpoints**: Backend functionality

Your complete AS Shreads e-commerce store will be live at `https://shop-nithya.vercel.app`!