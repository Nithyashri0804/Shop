# Deploy to Render with Your Existing Database

## Database Setup ✅ Complete
I can see you've already created a PostgreSQL database on Render:
- **Database Name**: as_shreads  
- **Username**: as_shreads_user
- **Port**: 5432

## Deploy Your Web Service Now:

### Step 1: Create Web Service
1. In Render dashboard, click "New" → "Web Service"
2. Connect your GitHub repository
3. Select your AS Shreads repository

### Step 2: Configure Build Settings
- **Name**: as-shreads-api
- **Environment**: Node
- **Build Command**: `npm install`
- **Start Command**: `node api/index.js`
- **Plan**: Free

### Step 3: Environment Variables
Add these in the Environment Variables section:
```
NODE_ENV=production
JWT_SECRET=your_very_secure_jwt_secret_key_here_at_least_32_characters_long
BUSINESS_NAME=AS Shreads
BUSINESS_EMAIL=contact@asshreads.com
BUSINESS_PHONE=+91-9876543210
BUSINESS_WHATSAPP=+91-9876543210
```

### Step 4: Connect Database
- **DATABASE_URL**: Use the "External Database URL" from your database (the hidden one in your screenshot)
- This connects your web service to the PostgreSQL database you created

### Step 5: Deploy
Click "Create Web Service" and it will deploy automatically.

## After Deployment:
Your AS Shreads API will be live at:
- `https://as-shreads-api.onrender.com`
- Multi-language support included (English, Hindi, Spanish)

The database is already set up, so you just need to create the web service and connect it!