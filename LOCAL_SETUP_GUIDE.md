# AS Shreads E-commerce - Local Development Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download here](https://www.postgresql.org/download/)
- **VS Code** - [Download here](https://code.visualstudio.com/)
- **Git** - [Download here](https://git-scm.com/)

## Step 1: Clone and Setup Project

1. **Clone the repository** (or download the project files):
   ```bash
   git clone <your-repo-url>
   cd as-shreads-ecommerce
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## Step 2: Database Setup (Neon PostgreSQL)

### Using Neon PostgreSQL (Recommended - No local setup required!)

1. **Sign up for Neon** at https://neon.tech (free tier available)
2. **Create a new project** in Neon dashboard
3. **Get your connection string** from the Neon dashboard
   - It looks like: `postgresql://username:password@host/database?sslmode=require`
4. **Copy the connection string** - you'll use it in the .env file

## Step 3: Environment Configuration

1. **Create `.env` file** in the project root:
   ```bash
   cp .env.example .env
   ```

2. **Update `.env` with your Neon database settings**:
   ```env
   # Database Configuration (Replace with your Neon connection string)
   DATABASE_URL=postgresql://username:password@ep-hostname.region.neon.tech/database?sslmode=require
   
   # These are auto-extracted from DATABASE_URL by Neon
   PGPORT=5432
   PGUSER=username
   PGPASSWORD=password
   PGDATABASE=database
   PGHOST=ep-hostname.region.neon.tech
   
   # Application Configuration
   NODE_ENV=development
   PORT=5000
   
   # JWT Configuration (Generate secure keys)
   JWT_SECRET=your_very_secure_jwt_secret_key_here_at_least_32_characters
   JWT_EXPIRES_IN=7d
   
   # Session Configuration
   SESSION_SECRET=your_very_secure_session_secret_key_here_at_least_32_characters
   
   # Business Information
   BUSINESS_NAME=AS Shreads
   BUSINESS_EMAIL=shreadslife@gmail.com
   BUSINESS_PHONE=+919876543210
   
   # WhatsApp Configuration
   WHATSAPP_NUMBER=+919876543210
   
   # Instagram Configuration
   INSTAGRAM_URL=https://www.instagram.com/shreadslife
   
   # Security Configuration
   BCRYPT_SALT_ROUNDS=12
   PASSWORD_MIN_LENGTH=6
   
   # Upload Configuration
   MAX_FILE_SIZE=5242880
   
   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000,http://localhost:5000
   
   # Rate Limiting
   RATE_LIMIT_MAX_REQUESTS=100
   RATE_LIMIT_WINDOW_MS=900000
   
   # Logging Configuration
   LOG_LEVEL=info
   LOG_FORMAT=combined
   ```

## Step 4: Database Migration

1. **Push database schema** to create tables:
   ```bash
   npm run db:push
   ```

2. **Verify tables were created**:
   ```bash
   # Connect to your Neon database (replace with your actual connection string)
   psql "postgresql://username:password@ep-hostname.region.neon.tech/database?sslmode=require"
   
   # List all tables
   \dt
   
   # You should see: users, products, categories, orders, wishlist, payment_settings, reviews
   ```

## Step 5: Seed Sample Data (Optional)

Run these SQL commands to add sample data for testing:

```sql
-- Insert sample categories
INSERT INTO categories (name, gender, description, is_active) VALUES
('T-Shirts', 'men', 'Comfortable casual t-shirts for men', true),
('Jeans', 'men', 'Stylish denim jeans for men', true),
('Dresses', 'women', 'Elegant dresses for women', true),
('Tops', 'women', 'Trendy tops for women', true),
('Hoodies', 'unisex', 'Comfortable hoodies for everyone', true);

-- Insert sample products
INSERT INTO products (name, description, price, category, gender, sizes, colors, stock, media, images, is_active) VALUES
('Classic Cotton T-Shirt', 'Comfortable 100% cotton t-shirt perfect for daily wear', 24.99, 'T-Shirts', 'men', 
 '["S", "M", "L", "XL"]', '["White", "Black", "Navy", "Gray"]', 
 '{"S": 15, "M": 20, "L": 18, "XL": 12}', 
 '["https://via.placeholder.com/400x400?text=T-Shirt"]', 
 '["https://via.placeholder.com/400x400?text=T-Shirt"]', 
 true);

-- Create admin user (password: admin123)
INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@asshreads.com', '$2b$12$lI8VJhFFsEeDNmnNGTNr9.4sWcoJi7lnwYADvk3mOLYlDk1mZdpuW', 'admin');

-- Create test customer (password: customer123)
INSERT INTO users (name, email, password, role) VALUES 
('Test Customer', 'customer@test.com', '$2b$12$lI8VJhFFsEeDNmnNGTNr9.4sWcoJi7lnwYADvk3mOLYlDk1mZdpuW', 'customer');

-- Set up payment settings
INSERT INTO payment_settings (cod_enabled, qr_enabled, business_name, whatsapp_number, payment_instructions) VALUES 
(true, true, 'AS Shreads', '+919876543210', 'Pay on delivery or scan QR code for online payment.');
```

## Step 6: VS Code Configuration

1. **Install recommended VS Code extensions**:
   - TypeScript and JavaScript Language Features
   - ESLint
   - Prettier
   - Thunder Client (for API testing)
   - PostgreSQL (for database management)

2. **Create `.vscode/settings.json`**:
   ```json
   {
     "typescript.preferences.importModuleSpecifier": "relative",
     "editor.formatOnSave": true,
     "editor.codeActionsOnSave": {
       "source.fixAll.eslint": true
     },
     "files.exclude": {
       "**/node_modules": true,
       "**/dist": true
     }
   }
   ```

3. **Create `.vscode/launch.json`** for debugging:
   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "name": "Debug Server",
         "type": "node",
         "request": "launch",
         "program": "${workspaceFolder}/server/index.ts",
         "outFiles": ["${workspaceFolder}/dist/**/*.js"],
         "runtimeArgs": ["-r", "tsx/cjs"],
         "env": {
           "NODE_ENV": "development"
         }
       }
     ]
   }
   ```

## Step 7: Running the Application

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Access the application**:
   - Frontend: http://localhost:5000
   - API: http://localhost:5000/api

3. **Test the application**:
   - Login with admin credentials: admin@asshreads.com / password123
   - Browse products, add to cart, test checkout process
   - Access admin panel for product management

## Step 8: Development Workflow

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open database studio (if available)

### Project Structure

```
as-shreads-ecommerce/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API service layer
│   │   └── types/          # TypeScript types
├── server/                 # Express backend
│   ├── db.ts              # Database connection
│   ├── storage.ts         # Data access layer
│   ├── routes.ts          # API routes
│   └── index.ts           # Server entry point
├── shared/                 # Shared code
│   └── schema.ts          # Database schema & types
└── package.json
```

## Step 9: Testing API Endpoints

You can test the API using Thunder Client in VS Code or curl:

### Authentication
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@asshreads.com", "password": "password123"}'

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "New User", "email": "user@test.com", "password": "password123"}'
```

### Products
```bash
# Get all products
curl http://localhost:5000/api/products

# Get single product
curl http://localhost:5000/api/products/1
```

### Categories
```bash
# Get all categories
curl http://localhost:5000/api/categories
```

## Troubleshooting

### Common Issues

1. **Database connection errors**:
   - Verify PostgreSQL is running
   - Check DATABASE_URL in .env
   - Ensure database and user exist

2. **Port already in use**:
   - Change PORT in .env file
   - Kill existing processes: `lsof -ti:5000 | xargs kill`

3. **Module not found errors**:
   - Delete node_modules and package-lock.json
   - Run `npm install` again

4. **TypeScript errors**:
   - Ensure all dependencies are installed
   - Check tsconfig.json configuration

### Database Management

```bash
# Connect to database
psql -U as_shreads_user -d as_shreads_db

# View all tables
\dt

# View table structure
\d table_name

# View table data
SELECT * FROM products LIMIT 5;
```

## Security Notes

- Change default JWT_SECRET and SESSION_SECRET in production
- Use environment variables for all sensitive data
- Keep .env file out of version control
- Use HTTPS in production
- Implement rate limiting for API endpoints

## Next Steps

Once you have the application running locally:

1. **Customize the UI** to match your brand
2. **Add more products** and categories
3. **Configure payment gateways** (Stripe, PayPal, etc.)
4. **Set up email notifications** for orders
5. **Add more features** like coupons, reviews, etc.
6. **Deploy to production** when ready

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify environment variables are set correctly
3. Ensure database is running and accessible
4. Check network connectivity for API calls

Happy coding! 🚀