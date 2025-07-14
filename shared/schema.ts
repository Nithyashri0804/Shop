import { pgTable, text, serial, integer, boolean, decimal, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"),
  role: text("role").notNull().default("customer"), // "admin" | "customer"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  gender: text("gender").notNull(), // "men" | "women" | "unisex"
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  category: text("category").notNull(),
  gender: text("gender").notNull(), // "men" | "women" | "unisex"
  sizes: json("sizes").$type<string[]>().notNull().default([]),
  colors: json("colors").$type<string[]>().notNull().default([]),
  stock: json("stock").$type<{ [size: string]: number }>().notNull().default({}),
  media: json("media").$type<string[]>().notNull().default([]),
  images: json("images").$type<string[]>().notNull().default([]), // Legacy support
  accessories: json("accessories").$type<any[]>().notNull().default([]),
  tags: json("tags").$type<string[]>().notNull().default([]),
  weight: decimal("weight", { precision: 8, scale: 2 }),
  shippingCost: decimal("shipping_cost", { precision: 8, scale: 2 }),
  featured: boolean("featured").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  items: json("items").$type<any[]>().notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  paymentMethod: text("payment_method").notNull(), // "cod" | "qr"
  paymentStatus: text("payment_status").notNull().default("pending"), // "pending" | "completed" | "failed"
  shippingAddress: json("shipping_address").$type<any>().notNull(),
  trackingNumber: text("tracking_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Wishlist table
export const wishlist = pgTable("wishlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: integer("product_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Payment settings table
export const paymentSettings = pgTable("payment_settings", {
  id: serial("id").primaryKey(),
  codEnabled: boolean("cod_enabled").notNull().default(true),
  qrEnabled: boolean("qr_enabled").notNull().default(true),
  upiId: text("upi_id"),
  businessName: text("business_name").notNull().default("AS Shreads"),
  whatsappNumber: text("whatsapp_number"),
  qrCodeUrl: text("qr_code_url"),
  paymentInstructions: text("payment_instructions"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: integer("product_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  wishlist: many(wishlist),
  reviews: many(reviews),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
}));

export const wishlistRelations = relations(wishlist, ({ one }) => ({
  user: one(users, { fields: [wishlist.userId], references: [users.id] }),
  product: one(products, { fields: [wishlist.productId], references: [products.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  wishlist: many(wishlist),
  reviews: many(reviews),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  email: true,
  password: true,
  phone: true,
  role: true,
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  gender: true,
  description: true,
  isActive: true,
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  price: true,
  originalPrice: true,
  category: true,
  gender: true,
  sizes: true,
  colors: true,
  stock: true,
  media: true,
  images: true,
  accessories: true,
  tags: true,
  weight: true,
  shippingCost: true,
  featured: true,
  isActive: true,
}).extend({
  // Ensure proper validation for required fields
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Product description is required"),
  price: z.string().or(z.number()).transform(val => typeof val === 'string' ? parseFloat(val) : val),
  originalPrice: z.string().or(z.number()).optional().transform(val => val ? (typeof val === 'string' ? parseFloat(val) : val) : undefined),
  category: z.string().min(1, "Category is required"),
    gender: z.enum(['men', 'women', 'unisex']),
  sizes: z.array(z.string()).min(1, "At least one size is required"),
  colors: z.array(z.string()).min(1, "At least one color is required"),
  stock: z.record(z.string(), z.number().min(0)),
  weight: z.string().or(z.number()).optional().transform(val => val ? (typeof val === 'string' ? parseFloat(val) : val) : undefined),
  shippingCost: z.string().or(z.number()).optional().transform(val => val ? (typeof val === 'string' ? parseFloat(val) : val) : undefined),
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  items: true,
  totalAmount: true,
  status: true,
  paymentMethod: true,
  paymentStatus: true,
  shippingAddress: true,
  trackingNumber: true,
});

export const insertWishlistSchema = createInsertSchema(wishlist).pick({
  userId: true,
  productId: true,
});

export const insertPaymentSettingsSchema = createInsertSchema(paymentSettings).pick({
  codEnabled: true,
  qrEnabled: true,
  upiId: true,
  businessName: true,
  whatsappNumber: true,
  qrCodeUrl: true,
  paymentInstructions: true,
});

export const insertReviewSchema = createInsertSchema(reviews).pick({
  userId: true,
  productId: true,
  rating: true,
  comment: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertWishlist = z.infer<typeof insertWishlistSchema>;
export type Wishlist = typeof wishlist.$inferSelect;

export type InsertPaymentSettings = z.infer<typeof insertPaymentSettingsSchema>;
export type PaymentSettings = typeof paymentSettings.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
