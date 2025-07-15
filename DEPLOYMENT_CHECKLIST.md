# Deployment Checklist

## Pre-Deployment
- [ ] Code is pushed to GitHub repository
- [ ] All features tested locally
- [ ] Database schema is finalized
- [ ] Environment variables are documented
- [ ] Build process works (`npm run build`)
- [ ] Production dependencies only in package.json

## Render Deployment
- [ ] Create PostgreSQL database on Render
- [ ] Copy database connection string
- [ ] Create web service from GitHub repo
- [ ] Set environment variables (NODE_ENV, DATABASE_URL, JWT_SECRET)
- [ ] Deploy and verify build success
- [ ] Test health check endpoint (/api/health)
- [ ] Run database migrations
- [ ] Create admin user
- [ ] Test core functionality

## Vercel Deployment  
- [ ] Create Neon database
- [ ] Copy connection string
- [ ] Import repository to Vercel
- [ ] Configure build settings
- [ ] Set environment variables
- [ ] Deploy and verify build success
- [ ] Test health check endpoint
- [ ] Run database migrations
- [ ] Create admin user
- [ ] Test core functionality

## Post-Deployment
- [ ] Admin panel access works
- [ ] Product management functional
- [ ] Order processing works
- [ ] Payment methods configured
- [ ] Email notifications (if applicable)
- [ ] Mobile responsiveness verified
- [ ] Performance monitoring set up
- [ ] Error tracking configured
- [ ] SSL certificate active
- [ ] Custom domain configured (optional)

## Performance Verification
- [ ] Page load times < 3 seconds
- [ ] API response times < 1 second
- [ ] Database queries optimized
- [ ] Images compressed and optimized
- [ ] Error handling working correctly
- [ ] 404 pages display properly

## Security Checklist
- [ ] Strong JWT secret set
- [ ] HTTPS enabled
- [ ] Environment variables secure
- [ ] Database access restricted
- [ ] Input validation working
- [ ] XSS protection active
- [ ] CORS properly configured

## Final Steps
- [ ] Document deployment URLs
- [ ] Share admin credentials securely
- [ ] Set up monitoring alerts
- [ ] Schedule regular backups
- [ ] Plan maintenance windows
- [ ] Document rollback procedures