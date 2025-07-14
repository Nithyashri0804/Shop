# VS Code Terminal Commands for AS Shreads with Neon PostgreSQL

## Quick Start in VS Code Terminal

### 1. Open Terminal
- Press `Ctrl + `` (backtick) or `View > Terminal`
- Make sure you're in the project directory

### 2. Install Dependencies
```bash
npm install
```

### 3. Get Neon Database Connection String

1. **Go to https://neon.tech** and sign up (free tier available)
2. **Create a new project** (choose any name like "as-shreads-db")
3. **Copy the connection string** from the dashboard
   - It looks like: `postgresql://username:password@ep-hostname.region.neon.tech/database?sslmode=require`

### 4. Create Environment File
```bash
# Create .env file with your Neon connection string
cat > .env << 'EOF'
# Replace this with your actual Neon connection string
DATABASE_URL=postgresql://username:password@ep-hostname.region.neon.tech/database?sslmode=require

# Application Configuration
NODE_ENV=development
PORT=5000
JWT_SECRET=your_very_secure_jwt_secret_key_here_at_least_32_characters_long
SESSION_SECRET=your_very_secure_session_secret_key_here_at_least_32_characters_long
BUSINESS_NAME=AS Shreads
BUSINESS_EMAIL=shreadslife@gmail.com
BUSINESS_PHONE=+919876543210
WHATSAPP_NUMBER=+919876543210
BCRYPT_SALT_ROUNDS=12
PASSWORD_MIN_LENGTH=6
MAX_FILE_SIZE=5242880
CORS_ORIGIN=http://localhost:3000,http://localhost:5000
EOF
```

### 5. Update Database URL
```bash
# Edit .env file to replace with your actual Neon connection string
code .env
```

### 6. Create Database Tables
```bash
npm run db:push
```

### 7. Add Sample Data
```bash
# Create sample data file
cat > sample-data.sql << 'EOF'
INSERT INTO categories (name, gender, description, is_active) VALUES
('T-Shirts', 'men', 'Comfortable casual t-shirts for men', true),
('Jeans', 'men', 'Stylish denim jeans for men', true),
('Dresses', 'women', 'Elegant dresses for women', true),
('Tops', 'women', 'Trendy tops for women', true),
('Hoodies', 'unisex', 'Comfortable hoodies for everyone', true),
('Shorts', 'unisex', 'Comfortable shorts for all', true),
('Jackets', 'unisex', 'Stylish jackets for all seasons', true),
('Accessories', 'unisex', 'Fashion accessories and more', true);

INSERT INTO products (name, description, price, category, gender, sizes, colors, stock, media, images, is_active) VALUES
('Classic Cotton T-Shirt', 'Comfortable 100% cotton t-shirt perfect for daily wear', 24.99, 'T-Shirts', 'men', 
 '["S", "M", "L", "XL"]', '["White", "Black", "Navy", "Gray"]', 
 '{"S": 15, "M": 20, "L": 18, "XL": 12}', 
 '["https://via.placeholder.com/400x400?text=T-Shirt"]', 
 '["https://via.placeholder.com/400x400?text=T-Shirt"]', 
 true),
('Slim Fit Jeans', 'Modern slim fit jeans made from premium denim', 59.99, 'Jeans', 'men',
 '["28", "30", "32", "34", "36"]', '["Blue", "Black", "Dark Blue"]',
 '{"28": 8, "30": 12, "32": 15, "34": 10, "36": 5}',
 '["https://via.placeholder.com/400x400?text=Jeans"]',
 '["https://via.placeholder.com/400x400?text=Jeans"]',
 true),
('Floral Summer Dress', 'Beautiful floral dress perfect for summer occasions', 45.99, 'Dresses', 'women',
 '["XS", "S", "M", "L"]', '["Pink", "Blue", "Yellow"]',
 '{"XS": 6, "S": 10, "M": 8, "L": 4}',
 '["https://via.placeholder.com/400x400?text=Dress"]',
 '["https://via.placeholder.com/400x400?text=Dress"]',
 true),
('Casual Crop Top', 'Trendy crop top for casual wear', 19.99, 'Tops', 'women',
 '["XS", "S", "M", "L"]', '["White", "Pink", "Black"]',
 '{"XS": 12, "S": 18, "M": 15, "L": 8}',
 '["https://via.placeholder.com/400x400?text=Top"]',
 '["https://via.placeholder.com/400x400?text=Top"]',
 true),
('Cozy Hoodie', 'Comfortable hoodie for all seasons', 39.99, 'Hoodies', 'unisex',
 '["S", "M", "L", "XL", "XXL"]', '["Gray", "Black", "Navy", "Red"]',
 '{"S": 10, "M": 15, "L": 12, "XL": 8, "XXL": 5}',
 '["https://via.placeholder.com/400x400?text=Hoodie"]',
 '["https://via.placeholder.com/400x400?text=Hoodie"]',
 true);

INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@asshreads.com', '$2b$12$lI8VJhFFsEeDNmnNGTNr9.4sWcoJi7lnwYADvk3mOLYlDk1mZdpuW', 'admin'),
('Test Customer', 'customer@test.com', '$2b$12$lI8VJhFFsEeDNmnNGTNr9.4sWcoJi7lnwYADvk3mOLYlDk1mZdpuW', 'customer'),
('John Doe', 'john@example.com', '$2b$12$lI8VJhFFsEeDNmnNGTNr9.4sWcoJi7lnwYADvk3mOLYlDk1mZdpuW', 'customer');

INSERT INTO payment_settings (cod_enabled, qr_enabled, business_name, whatsapp_number, payment_instructions) VALUES 
(true, true, 'AS Shreads', '+919876543210', 'Pay on delivery or scan QR code for online payment.');
EOF

# Load sample data into your Neon database
# Replace the connection string with your actual Neon connection string
psql "postgresql://username:password@ep-hostname.region.neon.tech/database?sslmode=require" -f sample-data.sql
```

### 8. Start the Application
```bash
npm run dev
```

### 9. Open in Browser
- Go to: http://localhost:5000

### 10. Test Login
- **Admin**: admin@asshreads.com / password123
- **Customer**: customer@test.com / password123

## Common Commands

### Check if everything is working
```bash
# Check Node.js version
node --version

# Check if dependencies are installed
ls node_modules

# Check if .env file exists
cat .env
```

### Database Management
```bash
# Connect to your Neon database
psql "your_neon_connection_string_here"

# Inside psql, run these commands:
\dt              # List all tables
\d users         # Show users table structure
SELECT * FROM users;  # View all users
SELECT * FROM products LIMIT 3;  # View first 3 products
\q               # Exit psql
```

### Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Push database schema changes
npm run db:push

# Stop the server
Ctrl + C
```

### Troubleshooting

#### If you get "DATABASE_URL not found" error:
```bash
# Check if .env file exists
ls -la .env

# Check .env content
cat .env

# Make sure DATABASE_URL is set correctly
```

#### If you get "tables don't exist" error:
```bash
# Push database schema
npm run db:push

# Check if tables were created
psql "your_neon_connection_string" -c "\dt"
```

#### If you get "port 5000 already in use" error:
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process (replace PID with actual number)
kill -9 PID

# Or use different port in .env
echo "PORT=3000" >> .env
```

## VS Code Extensions (Optional but helpful)

Install these extensions for better development experience:
- **PostgreSQL** - Database management
- **Thunder Client** - API testing
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Quick Test Commands

### Test API endpoints:
```bash
# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@asshreads.com", "password": "password123"}'

# Test products
curl http://localhost:5000/api/products

# Test categories
curl http://localhost:5000/api/categories
```

That's it! Your AS Shreads e-commerce application should be running with Neon PostgreSQL. The setup is much simpler since you don't need to install or configure a local database server.