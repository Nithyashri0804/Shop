const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

// Configure Express middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Basic API endpoints for testing
app.get('/api/test', (req, res) => {
  res.json({ message: 'AS Shreads API is working!', timestamp: new Date().toISOString() });
});

// Serve a basic HTML page for the root
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>AS Shreads</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #333; text-align: center; }
          .status { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .info { background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>AS Shreads - E-commerce Platform</h1>
          <div class="status">
            ✅ Server is running successfully on Vercel
          </div>
          <div class="info">
            <h3>Available Endpoints:</h3>
            <ul>
              <li><a href="/api/health">/api/health</a> - Health check</li>
              <li><a href="/api/test">/api/test</a> - Test endpoint</li>
            </ul>
          </div>
          <div class="info">
            <h3>Deployment Information:</h3>
            <p>Platform: Vercel</p>
            <p>Status: Deployed successfully</p>
            <p>Environment: Production</p>
          </div>
          <a href="/api/test" class="button">Test API</a>
        </div>
      </body>
    </html>
  `);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Export for Vercel
module.exports = app;