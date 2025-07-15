const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Database connected successfully');
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'AS Shreads API is running',
    database: pool.totalCount > 0 ? 'connected' : 'disconnected'
  });
});

// Root route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>AS Shreads</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 40px; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; }
          h1 { color: #333; text-align: center; }
          .status { background: #e8f5e8; padding: 20px; border-radius: 4px; margin: 20px 0; }
          .api-info { background: #f0f8ff; padding: 20px; border-radius: 4px; margin: 20px 0; }
          ul { line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🛍️ AS Shreads</h1>
          <div class="status">
            <strong>✅ API Status:</strong> Running Successfully<br>
            <strong>🗄️ Database:</strong> Connected<br>
            <strong>⚡ Environment:</strong> Production
          </div>
          <div class="api-info">
            <h3>Available API Endpoints:</h3>
            <ul>
              <li><strong>GET /api/health</strong> - Health check</li>
              <li><strong>POST /api/auth/login</strong> - User login</li>
              <li><strong>POST /api/auth/register</strong> - User registration</li>
              <li><strong>GET /api/products</strong> - Get all products</li>
              <li><strong>POST /api/orders</strong> - Create new order</li>
              <li><strong>GET /api/categories</strong> - Get categories</li>
            </ul>
          </div>
          <p style="text-align: center; color: #666; margin-top: 40px;">
            Your e-commerce backend is ready for integration!
          </p>
        </div>
      </body>
    </html>
  `);
});

// Basic auth endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    // Check if user exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const result = await pool.query(
      'INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, role',
      [name, email, hashedPassword, phone || null, 'customer']
    );
    
    const user = result.rows[0];
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '7d' }
    );
    
    res.json({ user, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '7d' }
    );
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Products endpoint
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE "isActive" = true ORDER BY "createdAt" DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Categories endpoint
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories WHERE "isActive" = true ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Orders endpoint
app.post('/api/orders', async (req, res) => {
  try {
    const { userId, items, total, shippingAddress, paymentMethod } = req.body;
    
    const result = await pool.query(
      'INSERT INTO orders ("userId", items, total, status, "shippingAddress", "paymentMethod") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, JSON.stringify(items), total, 'pending', JSON.stringify(shippingAddress), paymentMethod]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

module.exports = app;