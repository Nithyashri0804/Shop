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
  cart,
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
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit
    fieldSize: 10 * 1024 * 1024,
    fields: 20,
    files: 10
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Health check endpoint for monitoring
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
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
      console.log('Creating product with data:', JSON.stringify(req.body, null, 2));
      
      // Validate required fields
      const { name, description, price, category, gender, sizes, colors, stock } = req.body;
      
      if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Product name is required' });
      }
      
      if (!description || !description.trim()) {
        return res.status(400).json({ message: 'Product description is required' });
      }
      
      if (!price || parseFloat(price) <= 0) {
        return res.status(400).json({ message: 'Valid price is required' });
      }
      
      if (!category || !category.trim()) {
        return res.status(400).json({ message: 'Category is required' });
      }
      
      if (!gender) {
        return res.status(400).json({ message: 'Gender is required' });
      }
      
      if (!sizes || !Array.isArray(sizes) || sizes.length === 0) {
        return res.status(400).json({ message: 'At least one size must be selected' });
      }
      
      if (!colors || !Array.isArray(colors) || colors.length === 0) {
        return res.status(400).json({ message: 'At least one color must be selected' });
      }
      
      // Validate stock object
      if (!stock || typeof stock !== 'object') {
        return res.status(400).json({ message: 'Stock information is required' });
      }
      
      // Ensure all selected sizes have stock values
      for (const size of sizes) {
        if (!(size in stock) || stock[size] < 0) {
          return res.status(400).json({ message: `Stock quantity required for size ${size}` });
        }
      }
      
      // Prepare product data with proper defaults
      const productData = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        originalPrice: req.body.originalPrice ? parseFloat(req.body.originalPrice) : null,
        category: category.trim(),
        gender,
        sizes: Array.isArray(sizes) ? sizes : [],
        colors: Array.isArray(colors) ? colors : [],
        stock: stock || {},
        media: Array.isArray(req.body.media) ? req.body.media : [],
        images: Array.isArray(req.body.images) ? req.body.images : (Array.isArray(req.body.media) ? req.body.media : []),
        accessories: Array.isArray(req.body.accessories) ? req.body.accessories : [],
        tags: Array.isArray(req.body.tags) ? req.body.tags : (typeof req.body.tags === 'string' ? req.body.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []),
        weight: req.body.weight ? parseFloat(req.body.weight) : null,
        shippingCost: req.body.shippingCost ? parseFloat(req.body.shippingCost) : 0,
        featured: Boolean(req.body.featured),
        isActive: req.body.isActive !== false
      };
      
      console.log('Processed product data:', JSON.stringify(productData, null, 2));
      
      const [product] = await db.insert(products).values(productData).returning();
      console.log('Product created successfully:', product.id);
      res.status(201).json(product);
    } catch (error: any) {
      console.error('Product creation error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        code: error.code,
        constraint: error.constraint,
        detail: error.detail
      });
      
      // Return more specific error messages
      if (error.code === '23505') { // Unique constraint violation
        return res.status(400).json({ message: 'A product with this name already exists' });
      }
      
      if (error.code === '23502') { // Not null violation
        return res.status(400).json({ message: `Required field missing: ${error.column}` });
      }
      
      if (error.code === '22P02') { // Invalid text representation
        return res.status(400).json({ message: 'Invalid data format - please check numeric fields' });
      }
      
      if (error.message.includes('invalid input syntax')) {
        return res.status(400).json({ message: 'Invalid data format provided' });
      }
      
      res.status(500).json({ 
        message: error.message || 'Failed to create product',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
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

  app.get('/api/orders/my-orders', authenticateToken, async (req: any, res) => {
    try {
      const userId = parseInt(req.user.id);
      console.log('User ID for my-orders:', userId, 'Type:', typeof userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      const result = await db.select().from(orders)
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.createdAt));
      
      res.json(result);
    } catch (error: any) {
      console.error('My orders fetch error:', error);
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
      console.log('Creating order with data:', req.body);
      
      // Validate and enrich order items with product details
      const enrichedItems = await Promise.all(
        req.body.items.map(async (item: any) => {
          const [productData] = await db.select().from(products).where(eq(products.id, item.productId));
          
          if (!productData) {
            throw new Error(`Product with ID ${item.productId} not found`);
          }
          
          return {
            productId: item.productId,
            product: productData, // Include full product data
            size: item.size,
            quantity: item.quantity,
            price: productData.price,
            accessories: item.accessories || []
          };
        })
      );
      
      const orderData = {
        userId: req.user.id,
        items: enrichedItems,
        totalAmount: req.body.totalAmount || req.body.total,
        status: req.body.status || 'pending',
        paymentMethod: req.body.paymentMethod,
        paymentStatus: req.body.paymentStatus || 'pending',
        shippingAddress: req.body.shippingAddress,
        trackingNumber: req.body.trackingNumber || null
      };
      
      console.log('Processed order data:', orderData);
      
      const [order] = await db.insert(orders).values(orderData).returning();
      console.log('Order created successfully:', order);
      
      res.status(201).json(order);
    } catch (error: any) {
      console.error('Order creation error:', error);
      res.status(500).json({ message: error.message || 'Failed to create order' });
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

  // Cart routes (authenticated users only)
  app.get('/api/cart', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      const cartItems = await db
        .select({
          id: cart.id,
          productId: cart.productId,
          size: cart.size,
          quantity: cart.quantity,
          accessories: cart.accessories,
          product: {
            id: products.id,
            name: products.name,
            price: products.price,
            images: products.images,
            media: products.media,
            sizes: products.sizes,
            colors: products.colors,
            stock: products.stock,
            category: products.category,
            gender: products.gender,
            isActive: products.isActive,
          }
        })
        .from(cart)
        .innerJoin(products, eq(cart.productId, products.id))
        .where(eq(cart.userId, userId));

      // Format cart items to match frontend expectations
      const formattedItems = cartItems.map(item => ({
        productId: item.productId,
        product: item.product,
        size: item.size,
        quantity: item.quantity,
        accessories: item.accessories || []
      }));

      res.json(formattedItems);
    } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).json({ message: 'Failed to fetch cart' });
    }
  });

  app.post('/api/cart', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { productId, size, quantity, accessories = [] } = req.body;

      // Validate required fields
      if (!productId || !size || !quantity) {
        return res.status(400).json({ message: 'Product ID, size, and quantity are required' });
      }

      // Check if item already exists in cart
      const existingItem = await db
        .select()
        .from(cart)
        .where(
          and(
            eq(cart.userId, userId),
            eq(cart.productId, productId),
            eq(cart.size, size)
          )
        )
        .limit(1);

      if (existingItem.length > 0) {
        // Update existing item quantity
        const [updatedItem] = await db
          .update(cart)
          .set({ 
            quantity: existingItem[0].quantity + quantity,
            updatedAt: new Date()
          })
          .where(eq(cart.id, existingItem[0].id))
          .returning();
        
        res.json(updatedItem);
      } else {
        // Create new cart item
        const [newItem] = await db
          .insert(cart)
          .values({
            userId,
            productId,
            size,
            quantity,
            accessories
          })
          .returning();
        
        res.status(201).json(newItem);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({ message: 'Failed to add item to cart' });
    }
  });

  app.put('/api/cart/:productId/:size', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { productId, size } = req.params;
      const { quantity } = req.body;

      if (quantity <= 0) {
        return res.status(400).json({ message: 'Quantity must be greater than 0' });
      }

      const [updatedItem] = await db
        .update(cart)
        .set({ 
          quantity,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(cart.userId, userId),
            eq(cart.productId, parseInt(productId)),
            eq(cart.size, size)
          )
        )
        .returning();

      if (!updatedItem) {
        return res.status(404).json({ message: 'Cart item not found' });
      }

      res.json(updatedItem);
    } catch (error) {
      console.error('Error updating cart item:', error);
      res.status(500).json({ message: 'Failed to update cart item' });
    }
  });

  app.delete('/api/cart/:productId/:size', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { productId, size } = req.params;

      const [deletedItem] = await db
        .delete(cart)
        .where(
          and(
            eq(cart.userId, userId),
            eq(cart.productId, parseInt(productId)),
            eq(cart.size, size)
          )
        )
        .returning();

      if (!deletedItem) {
        return res.status(404).json({ message: 'Cart item not found' });
      }

      res.json({ message: 'Item removed from cart' });
    } catch (error) {
      console.error('Error removing cart item:', error);
      res.status(500).json({ message: 'Failed to remove cart item' });
    }
  });

  app.delete('/api/cart', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;

      await db
        .delete(cart)
        .where(eq(cart.userId, userId));

      res.json({ message: 'Cart cleared' });
    } catch (error) {
      console.error('Error clearing cart:', error);
      res.status(500).json({ message: 'Failed to clear cart' });
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
  app.post('/api/upload/media', authenticateAdmin, upload.fields([
    { name: 'media', maxCount: 10 },
    { name: 'images', maxCount: 10 }
  ]), async (req: any, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const allFiles: Express.Multer.File[] = [];
      
      // Combine files from both 'media' and 'images' fields
      if (files.media) allFiles.push(...files.media);
      if (files.images) allFiles.push(...files.images);
      
      if (allFiles.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }
      
      const uploadedMedia = allFiles.map((file, index) => {
        // Convert to base64 for storage
        const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        // Return just the base64 string as the media ID
        return base64;
      });
      
      res.json({ 
        media: uploadedMedia,
        images: uploadedMedia // Also return as images for compatibility
      });
    } catch (error: any) {
      console.error('File upload error:', error);
      res.status(500).json({ message: 'Failed to upload files' });
    }
  });

  // Legacy support for images endpoint
  app.post('/api/upload/images', authenticateAdmin, upload.fields([
    { name: 'media', maxCount: 10 },
    { name: 'images', maxCount: 10 }
  ]), async (req: any, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const allFiles: Express.Multer.File[] = [];
      
      // Combine files from both 'media' and 'images' fields
      if (files.media) allFiles.push(...files.media);
      if (files.images) allFiles.push(...files.images);
      
      if (allFiles.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }
      
      const uploadedImages = allFiles.map((file, index) => {
        // Convert to base64 for storage
        const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        return base64;
      });
      
      res.json({ images: uploadedImages });
    } catch (error: any) {
      console.error('Image upload error:', error);
      res.status(500).json({ message: 'Failed to upload images' });
    }
  });

  // Delete media endpoint
  app.delete('/api/upload/media/:mediaId', authenticateAdmin, async (req: any, res) => {
    try {
      // Since we're using base64 storage, we don't need to delete files from disk
      // Just return success
      res.json({ message: 'Media deleted successfully' });
    } catch (error: any) {
      console.error('Media deletion error:', error);
      res.status(500).json({ message: 'Failed to delete media' });
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
