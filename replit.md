# replit.md

## Overview

This is a full-stack e-commerce application built with React and Express, featuring a modern fashion retail platform called "AS Shreads". The application uses a monorepo structure with shared types and schemas, implementing a complete online shopping experience with product management, cart functionality, user authentication, and order processing.

## Recent Changes

### Project Migration and Deployment Setup (July 15, 2025)
- ✓ Successfully migrated from Replit Agent to Replit environment
- ✓ Installed missing dependencies (cross-env)
- ✓ Created PostgreSQL database and applied schema
- ✓ Verified application is running correctly on port 5000
- ✓ Created deployment configurations for Render and Vercel
- ✓ Added health check endpoint for monitoring
- ✓ Created comprehensive deployment guides and checklists
- ✓ Configured Docker support for containerized deployment
- ✓ Updated project documentation for production readiness

### Order System Fixes (July 14, 2025)
- ✓ Fixed critical order creation issue with field name mismatches
- ✓ Updated frontend components to use correct database field names (id vs _id, status vs orderStatus)
- ✓ Fixed data structure in order creation flow (added totalAmount to orderData)
- ✓ Resolved TypeScript type errors with price calculations (string vs number)
- ✓ Updated all order display components (MyOrders, OrderConfirmation, OrderDetail)
- ✓ Ensured proper price formatting with parseFloat() conversions
- ✓ Fixed admin order management dashboard filtering and data display issues
- ✓ Enhanced order creation to include full product data in order items
- ✓ Fixed API endpoints for admin order management (getAllOrders, updateOrderStatus)
- ✓ Fixed "Unknown Product" issue in orders by enriching order items with full product data
- ✓ Fixed missing product images in order confirmation and order history pages
- ✓ Improved order creation endpoint to include complete product information
- ✓ Fixed OrderDetail component runtime errors with proper price string-to-number conversions
- ✓ Removed analytics and user management sections from admin navigation
- ✓ Streamlined admin panel to focus on core e-commerce functionality

### Migration to Replit Environment (July 14, 2025)
- ✓ Successfully migrated from Replit Agent to Replit environment
- ✓ Installed missing dependencies (cross-env)
- ✓ Created PostgreSQL database and applied schema
- ✓ Fixed cart table creation issues
- ✓ Resolved price calculation type errors (string to number conversion)
- ✓ Added sample products and categories for testing
- ✓ Verified all core functionality is working

## User Preferences

Preferred communication style: Simple, everyday language.

## Deployment Preparation (July 15, 2025)
- ✓ Migration from Replit Agent to Replit environment completed
- ✓ Created comprehensive deployment guide for Render and Vercel
- ✓ Added health check endpoint for monitoring
- ✓ Configured server for production deployment with proper port handling
- ✓ Created Docker configuration for containerized deployment
- ✓ Added render.yaml and vercel.json configuration files
- ✓ Updated server startup to use environment PORT variable
- ✓ Created deployment checklist for easy reference
- ✓ Installed cross-env dependency for production builds
- ✓ Database schema applied successfully
- ✓ Fixed build dependency issues by moving build tools to production dependencies
- ✓ Created Vercel-specific deployment guide for user
- ✓ User chose Vercel for deployment platform
- ✓ Created proper serverless function configuration for Vercel
- ✓ Added @vercel/node runtime dependency
- ✓ Identified all environment variables needed for production deployment

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context API for global state (Auth, Cart, Wishlist, Toast)
- **Routing**: React Router DOM for client-side navigation
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: PostgreSQL sessions with connect-pg-simple
- **File Structure**: Modular route organization

### Development Setup
- **Hot Reload**: Vite dev server with Express middleware integration
- **Type Safety**: Shared TypeScript types between client and server
- **Build Process**: Vite for client, esbuild for server bundling

## Key Components

### Authentication System
- JWT-based authentication with HTTP-only cookies
- Role-based access control (admin/customer)
- Context-based auth state management
- Protected routes and middleware

### E-commerce Features
- **Product Management**: CRUD operations with media upload support
- **Shopping Cart**: Persistent cart with size/quantity management
- **Wishlist**: User-specific wishlist functionality
- **Order Processing**: Complete order lifecycle management
- **Payment Integration**: QR code payments and Cash on Delivery

### Admin Dashboard
- **Product Management**: Add/edit products with media uploads
- **Order Management**: Track and update order status
- **User Management**: View and manage customer accounts
- **Analytics**: Sales reports and performance metrics
- **Payment Settings**: Configure payment methods and QR codes

### Media Management
- **File Upload**: Support for images and videos
- **Storage**: Base64 encoding for media files
- **Gallery Components**: Interactive media galleries with zoom functionality

## Data Flow

### Database Schema
```typescript
// Users table
users: {
  id: serial (primary key)
  username: text (unique)
  password: text
}
```

### State Management Flow
1. **Authentication**: AuthContext manages user state and token storage
2. **Cart**: CartContext handles cart operations with localStorage persistence
3. **Wishlist**: WishlistContext manages wishlist items
4. **Toast**: ToastContext for user notifications

### API Structure
- **Base URL**: `/api` prefix for all backend routes
- **Authentication**: Bearer token in Authorization header
- **Error Handling**: Centralized error responses with proper status codes

## External Dependencies

### Frontend Dependencies
- **UI Framework**: React with TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **State Management**: React Context API
- **HTTP Client**: Axios for API communication
- **Charts**: Recharts for analytics visualization
- **Form Handling**: React Hook Form with Zod validation

### Backend Dependencies
- **Database**: Drizzle ORM with PostgreSQL
- **Authentication**: JWT tokens
- **File Processing**: Built-in Node.js file handling
- **Session Management**: PostgreSQL session store

### Database Provider
- **Neon Database**: Serverless PostgreSQL with connection pooling
- **Connection**: Uses DATABASE_URL environment variable
- **Migrations**: Drizzle Kit for schema management

## Deployment Strategy

### Build Process
1. **Client**: Vite builds React app to `dist/public`
2. **Server**: esbuild bundles Express app to `dist/index.js`
3. **Static Assets**: Served from built client directory

### Environment Configuration
- **Development**: `NODE_ENV=development` with hot reload
- **Production**: `NODE_ENV=production` with optimized builds
- **Database**: Requires `DATABASE_URL` for PostgreSQL connection

### Scripts
- `dev`: Start development server with hot reload
- `build`: Build both client and server for production
- `start`: Run production server
- `db:push`: Push database schema changes

### Production Considerations
- **Static Files**: Express serves built React app
- **Database**: Neon Database handles connection pooling
- **Error Handling**: Centralized error middleware
- **Security**: CORS, helmet, and input validation

The application follows modern web development practices with TypeScript throughout, responsive design principles, and a scalable architecture suitable for e-commerce platforms.