#!/bin/bash

# AS Shreads E-commerce - Local Development Setup Script

echo "🚀 Setting up AS Shreads E-commerce for local development..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check if PostgreSQL client is installed (optional - for database management)
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL client is not installed. Install it if you want to manage the database directly:"
    echo "   - macOS: brew install postgresql"
    echo "   - Ubuntu/Debian: sudo apt-get install postgresql-client"
    echo "   - Windows: Download from https://www.postgresql.org/"
    echo "   (You can skip this and use Neon dashboard instead)"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "⚙️  Creating .env file..."
    cat > .env << EOF
# Database Configuration (Replace with your Neon connection string)
DATABASE_URL=postgresql://username:password@ep-hostname.region.neon.tech/database?sslmode=require
PGPORT=5432
PGUSER=username
PGPASSWORD=password
PGDATABASE=database
PGHOST=ep-hostname.region.neon.tech

# Application Configuration
NODE_ENV=development
PORT=5000

# JWT Configuration
JWT_SECRET=your_very_secure_jwt_secret_key_here_at_least_32_characters_long
JWT_EXPIRES_IN=7d

# Session Configuration
SESSION_SECRET=your_very_secure_session_secret_key_here_at_least_32_characters_long

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
EOF

    echo "✅ .env file created. Please update the database credentials."
else
    echo "✅ .env file already exists"
fi

echo "🗄️  Using Neon PostgreSQL - no local database setup needed!"
echo "   Just get your connection string from https://neon.tech"

# Create VS Code settings
mkdir -p .vscode
cat > .vscode/settings.json << EOF
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.env": true
  },
  "typescript.preferences.includePackageJsonAutoImports": "auto"
}
EOF

cat > .vscode/launch.json << EOF
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Server",
      "type": "node",
      "request": "launch",
      "program": "\${workspaceFolder}/server/index.ts",
      "outFiles": ["\${workspaceFolder}/dist/**/*.js"],
      "runtimeArgs": ["-r", "tsx/cjs"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
EOF

echo "⚙️  VS Code configuration created"

# Create sample data script
cat > sample-data.sql << EOF
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

-- Create admin user (password: password123)
INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@asshreads.com', '\$2b\$12\$lI8VJhFFsEeDNmnNGTNr9.4sWcoJi7lnwYADvk3mOLYlDk1mZdpuW', 'admin');

-- Create test customer (password: password123)
INSERT INTO users (name, email, password, role) VALUES 
('Test Customer', 'customer@test.com', '\$2b\$12\$lI8VJhFFsEeDNmnNGTNr9.4sWcoJi7lnwYADvk3mOLYlDk1mZdpuW', 'customer');

-- Set up payment settings
INSERT INTO payment_settings (cod_enabled, qr_enabled, business_name, whatsapp_number, payment_instructions) VALUES 
(true, true, 'AS Shreads', '+919876543210', 'Pay on delivery or scan QR code for online payment.');
EOF

echo "📋 Sample data script created: sample-data.sql"

echo ""
echo "🎉 Setup complete! Next steps:"
echo ""
echo "1. Sign up at https://neon.tech (free tier available)"
echo "2. Create a new project in Neon dashboard"
echo "3. Copy your connection string from Neon dashboard"
echo "4. Update DATABASE_URL in .env file with your Neon connection string"
echo "5. Push database schema: npm run db:push"
echo "6. Add sample data: psql 'your_neon_connection_string' -f sample-data.sql"
echo "7. Start development server: npm run dev"
echo "8. Open http://localhost:5000"
echo ""
echo "📖 For detailed instructions, see LOCAL_SETUP_GUIDE.md"
echo ""
echo "🔐 Test credentials:"
echo "   Admin: admin@asshreads.com / password123"
echo "   Customer: customer@test.com / password123"