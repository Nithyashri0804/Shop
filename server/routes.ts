import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { 
  users, 
  products, 
  categories, 
  orders, 
  wishlist, 
  paymentSettings, 
  reviews,
  type User,
  type Product,
  type Category,
  type Order,
  insertUserSchema,
  insertCategorySchema,
  insertProductSchema,
  insertOrderSchema,
  insertWishlistSchema,
  insertPaymentSettingsSchema,
  insertReviewSchema
} from "@shared/schema";
import { eq, like, and, or, desc, asc, count, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import { z } from "zod";

// Middleware for authentication
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    const user = await storage.getUser(decoded.id);
    if (!user) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Middleware for admin authentication
const authenticateAdmin = async (req: any, res: any, next: any) => {
  await authenticateToken(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  });
};

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, email, password, phone } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Create user
      const userData = insertUserSchema.parse({
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: 'customer'
      });

      const user = await storage.createUser(userData);
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
        token
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({ message: error.message || 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      res.json({
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
        token
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
    res.json({
      user: { 
        id: req.user.id, 
        name: req.user.name, 
        email: req.user.email, 
        phone: req.user.phone, 
        role: req.user.role 
      }
    });
  });

  // Categories routes
  app.get('/api/categories', async (req, res) => {
    try {
      const { gender, active } = req.query;
      
      let query = db.select().from(categories);
      const conditions = [];
      
      if (gender && gender !== 'all') {
        conditions.push(eq(categories.gender, gender as string));
      }
      
      if (active === 'true') {
        conditions.push(eq(categories.isActive, true));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      const result = await query.orderBy(categories.name);
      res.json(result);
    } catch (error: any) {
      console.error('Categories fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch categories' });
    }
  });

  app.post('/api/categories', authenticateAdmin, async (req: any, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const [category] = await db.insert(categories).values(categoryData).returning();
      res.status(201).json(category);
    } catch (error: any) {
      console.error('Category creation error:', error);
      res.status(500).json({ message: 'Failed to create category' });
    }
  });

  app.put('/api/categories/:id', authenticateAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const categoryData = insertCategorySchema.parse(req.body);
      
      const [category] = await db.update(categories)
        .set({ ...categoryData, updatedAt: new Date() })
        .where(eq(categories.id, id))
        .returning();
        
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      res.json(category);
    } catch (error: any) {
      console.error('Category update error:', error);
      res.status(500).json({ message: 'Failed to update category' });
    }
  });

  app.delete('/api/categories/:id', authenticateAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const [category] = await db.delete(categories)
        .where(eq(categories.id, id))
        .returning();
        
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      res.json({ message: 'Category deleted successfully' });
    } catch (error: any) {
      console.error('Category deletion error:', error);
      res.status(500).json({ message: 'Failed to delete category' });
    }
  });

  // Products routes
  app.get('/api/products', async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 12, 
        search = '', 
        category = '', 
        gender = '', 
        size = '', 
        color = '', 
        sortBy = 'newest',
        featured = '',
        active = 'true'
      } = req.query;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      const conditions = [];

      if (search) {
        conditions.push(
          or(
            like(products.name, `%${search}%`),
            like(products.description, `%${search}%`),
            like(products.category, `%${search}%`)
          )
        );
      }

      if (category && category !== 'all') {
        conditions.push(eq(products.category, category as string));
      }

      if (gender && gender !== 'all') {
        conditions.push(eq(products.gender, gender as string));
      }

      if (active === 'true') {
        conditions.push(eq(products.isActive, true));
      }

      if (featured === 'true') {
        conditions.push(eq(products.featured, true));
      }

      let query = db.select().from(products);
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      // Apply sorting
      switch (sortBy) {
        case 'price-low':
          query = query.orderBy(asc(products.price));
          break;
        case 'price-high':
          query = query.orderBy(desc(products.price));
          break;
        case 'name':
          query = query.orderBy(asc(products.name));
          break;
        case 'newest':
        default:
          query = query.orderBy(desc(products.createdAt));
          break;
      }

      const result = await query.limit(parseInt(limit as string)).offset(offset);
      
      // Get total count for pagination
      let countQuery = db.select({ count: count() }).from(products);
      if (conditions.length > 0) {
        countQuery = countQuery.where(and(...conditions));
      }
      const [{ count: totalCount }] = await countQuery;
      
      const totalPages = Math.ceil(totalCount / parseInt(limit as string));

      res.json({
        products: result,
        totalPages,
        currentPage: parseInt(page as string),
        totalCount
      });
    } catch (error: any) {
      console.error('Products fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch products' });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const [product] = await db.select().from(products).where(eq(products.id, id));
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      res.json(product);
    } catch (error: any) {
      console.error('Product fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch product' });
    }
  });

  app.post('/api/products', authenticateAdmin, async (req: any, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const [product] = await db.insert(products).values(productData).returning();
      res.status(201).json(product);
    } catch (error: any) {
      console.error('Product creation error:', error);
      res.status(500).json({ message: 'Failed to create product' });
    }
  });

  app.put('/api/products/:id', authenticateAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const productData = insertProductSchema.parse(req.body);
      
      const [product] = await db.update(products)
        .set({ ...productData, updatedAt: new Date() })
        .where(eq(products.id, id))
        .returning();
        
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      res.json(product);
    } catch (error: any) {
      console.error('Product update error:', error);
      res.status(500).json({ message: 'Failed to update product' });
    }
  });

  app.delete('/api/products/:id', authenticateAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const [product] = await db.delete(products)
        .where(eq(products.id, id))
        .returning();
        
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      res.json({ message: 'Product deleted successfully' });
    } catch (error: any) {
      console.error('Product deletion error:', error);
      res.status(500).json({ message: 'Failed to delete product' });
    }
  });

  // Orders routes
  app.get('/api/orders', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const result = await db.select().from(orders)
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.createdAt));
      
      res.json(result);
    } catch (error: any) {
      console.error('Orders fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch orders' });
    }
  });

  app.get('/api/orders/all', authenticateAdmin, async (req: any, res) => {
    try {
      const { page = 1, limit = 10, status = '' } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      let query = db.select().from(orders);
      
      if (status && status !== 'all') {
        query = query.where(eq(orders.status, status as string));
      }
      
      const result = await query
        .orderBy(desc(orders.createdAt))
        .limit(parseInt(limit as string))
        .offset(offset);
      
      // Get total count
      let countQuery = db.select({ count: count() }).from(orders);
      if (status && status !== 'all') {
        countQuery = countQuery.where(eq(orders.status, status as string));
      }
      const [{ count: totalCount }] = await countQuery;
      
      const totalPages = Math.ceil(totalCount / parseInt(limit as string));

      res.json({
        orders: result,
        totalPages,
        currentPage: parseInt(page as string),
        totalCount
      });
    } catch (error: any) {
      console.error('All orders fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch orders' });
    }
  });

  app.get('/api/orders/:id', authenticateToken, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const [order] = await db.select().from(orders).where(eq(orders.id, id));
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      // Check if user owns this order or is admin
      if (order.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      res.json(order);
    } catch (error: any) {
      console.error('Order fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch order' });
    }
  });

  app.post('/api/orders', authenticateToken, async (req: any, res) => {
    try {
      const orderData = insertOrderSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const [order] = await db.insert(orders).values(orderData).returning();
      res.status(201).json(order);
    } catch (error: any) {
      console.error('Order creation error:', error);
      res.status(500).json({ message: 'Failed to create order' });
    }
  });

  app.put('/api/orders/:id/status', authenticateAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, trackingNumber } = req.body;
      
      const updateData: any = { status, updatedAt: new Date() };
      if (trackingNumber) {
        updateData.trackingNumber = trackingNumber;
      }
      
      const [order] = await db.update(orders)
        .set(updateData)
        .where(eq(orders.id, id))
        .returning();
        
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      res.json(order);
    } catch (error: any) {
      console.error('Order status update error:', error);
      res.status(500).json({ message: 'Failed to update order status' });
    }
  });

  app.put('/api/orders/:id/payment-status', authenticateAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { paymentStatus } = req.body;
      
      const [order] = await db.update(orders)
        .set({ paymentStatus, updatedAt: new Date() })
        .where(eq(orders.id, id))
        .returning();
        
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      res.json(order);
    } catch (error: any) {
      console.error('Payment status update error:', error);
      res.status(500).json({ message: 'Failed to update payment status' });
    }
  });

  // Wishlist routes
  app.get('/api/wishlist', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const result = await db.select({
        id: wishlist.id,
        productId: wishlist.productId,
        createdAt: wishlist.createdAt,
        product: products
      })
      .from(wishlist)
      .leftJoin(products, eq(wishlist.productId, products.id))
      .where(eq(wishlist.userId, userId))
      .orderBy(desc(wishlist.createdAt));
      
      // Extract just the products for the response
      const wishlistProducts = result.map(item => item.product).filter(Boolean);
      
      res.json(wishlistProducts);
    } catch (error: any) {
      console.error('Wishlist fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch wishlist' });
    }
  });

  app.post('/api/wishlist', authenticateToken, async (req: any, res) => {
    try {
      const { productId } = req.body;
      const userId = req.user.id;
      
      // Check if already in wishlist
      const [existing] = await db.select().from(wishlist)
        .where(and(eq(wishlist.userId, userId), eq(wishlist.productId, productId)));
      
      if (existing) {
        return res.status(400).json({ message: 'Product already in wishlist' });
      }
      
      const wishlistData = insertWishlistSchema.parse({ userId, productId });
      const [wishlistItem] = await db.insert(wishlist).values(wishlistData).returning();
      
      res.status(201).json(wishlistItem);
    } catch (error: any) {
      console.error('Wishlist add error:', error);
      res.status(500).json({ message: 'Failed to add to wishlist' });
    }
  });

  app.delete('/api/wishlist/:productId', authenticateToken, async (req: any, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const userId = req.user.id;
      
      const [deleted] = await db.delete(wishlist)
        .where(and(eq(wishlist.userId, userId), eq(wishlist.productId, productId)))
        .returning();
        
      if (!deleted) {
        return res.status(404).json({ message: 'Item not found in wishlist' });
      }
      
      res.json({ message: 'Removed from wishlist' });
    } catch (error: any) {
      console.error('Wishlist remove error:', error);
      res.status(500).json({ message: 'Failed to remove from wishlist' });
    }
  });

  // Payment settings routes
  app.get('/api/payment-settings', async (req, res) => {
    try {
      const [settings] = await db.select().from(paymentSettings).limit(1);
      
      if (!settings) {
        // Return default settings
        const defaultSettings = {
          codEnabled: true,
          qrEnabled: true,
          upiId: '',
          businessName: 'AS Shreads',
          whatsappNumber: '+919876543210',
          qrCodeUrl: '',
          paymentInstructions: 'Scan QR and pay the exact amount. Send payment screenshot to our WhatsApp number for verification.'
        };
        return res.json(defaultSettings);
      }
      
      res.json(settings);
    } catch (error: any) {
      console.error('Payment settings fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch payment settings' });
    }
  });

  app.put('/api/payment-settings', authenticateAdmin, async (req: any, res) => {
    try {
      const settingsData = insertPaymentSettingsSchema.parse(req.body);
      
      // Check if settings exist
      const [existing] = await db.select().from(paymentSettings).limit(1);
      
      let result;
      if (existing) {
        [result] = await db.update(paymentSettings)
          .set({ ...settingsData, updatedAt: new Date() })
          .where(eq(paymentSettings.id, existing.id))
          .returning();
      } else {
        [result] = await db.insert(paymentSettings).values(settingsData).returning();
      }
      
      res.json(result);
    } catch (error: any) {
      console.error('Payment settings update error:', error);
      res.status(500).json({ message: 'Failed to update payment settings' });
    }
  });

  // File upload routes
  app.post('/api/upload/media', upload.array('files', 10), async (req: any, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }
      
      const uploadedFiles = files.map(file => {
        // Convert to base64 for storage
        const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        return {
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          dataUrl: base64
        };
      });
      
      res.json({ files: uploadedFiles });
    } catch (error: any) {
      console.error('File upload error:', error);
      res.status(500).json({ message: 'Failed to upload files' });
    }
  });

  // Reviews routes
  app.post('/api/products/:id/reviews', authenticateToken, async (req: any, res) => {
    try {
      const productId = parseInt(req.params.id);
      const { rating, comment } = req.body;
      
      const reviewData = insertReviewSchema.parse({
        userId: req.user.id,
        productId,
        rating,
        comment
      });
      
      const [review] = await db.insert(reviews).values(reviewData).returning();
      res.status(201).json(review);
    } catch (error: any) {
      console.error('Review creation error:', error);
      res.status(500).json({ message: 'Failed to add review' });
    }
  });

  app.get('/api/products/:id/reviews', async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const result = await db.select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        user: {
          id: users.id,
          name: users.name
        }
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt));
      
      res.json(result);
    } catch (error: any) {
      console.error('Reviews fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch reviews' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
