import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { registerRoutes } from '../server/routes';
import path from 'path';
import fs from 'fs';

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

// Serve static files manually for Vercel
app.get('/', (req, res) => {
  const indexPath = path.join(process.cwd(), 'client', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>AS Shreads</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body>
          <div id="root">
            <h1>AS Shreads - Loading...</h1>
            <p>Your e-commerce store is starting up. Please wait...</p>
          </div>
        </body>
      </html>
    `);
  }
});

// Initialize routes
let initialized = false;
async function initializeApp() {
  if (!initialized) {
    try {
      await registerRoutes(app);
      initialized = true;
    } catch (error) {
      console.error('Failed to initialize app:', error);
      throw error;
    }
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await initializeApp();
    
    // Convert Vercel request to Express request
    const expressReq = req as any;
    const expressRes = res as any;
    
    // Handle the request with Express
    return new Promise((resolve, reject) => {
      expressRes.on('finish', resolve);
      expressRes.on('error', reject);
      
      app(expressReq, expressRes);
    });
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}