# Windows Setup Guide for AS Shreads E-commerce

## PowerShell Commands for Windows Users

### 1. Open PowerShell in VS Code
- Press `Ctrl + `` (backtick) or `View > Terminal`
- Make sure PowerShell is selected (not Command Prompt)

### 2. Install Dependencies
```powershell
npm install
```

### 3. Set up Neon Database
1. Go to https://neon.tech and create a free account
2. Create a new project (name it "as-shreads-db")
3. Copy your connection string from the dashboard

### 4. Create Environment File
```powershell
# Create .env file
@"
DATABASE_URL=postgresql://username:password@ep-hostname.region.neon.tech/database?sslmode=require
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
"@ | Out-File -FilePath .env -Encoding utf8

# Edit .env file to add your actual Neon connection string
code .env
```

### 5. Create Database Tables
```powershell
npm run db:push
```

### 6. Add Sample Data
```powershell
# Create sample data file
@"
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
 '[\"S\", \"M\", \"L\", \"XL\"]', '[\"White\", \"Black\", \"Navy\", \"Gray\"]', 
 '{\"S\": 15, \"M\": 20, \"L\": 18, \"XL\": 12}', 
 '[\"https://via.placeholder.com/400x400?text=T-Shirt\"]', 
 '[\"https://via.placeholder.com/400x400?text=T-Shirt\"]', 
 true),
('Slim Fit Jeans', 'Modern slim fit jeans made from premium denim', 59.99, 'Jeans', 'men',
 '[\"28\", \"30\", \"32\", \"34\", \"36\"]', '[\"Blue\", \"Black\", \"Dark Blue\"]',
 '{\"28\": 8, \"30\": 12, \"32\": 15, \"34\": 10, \"36\": 5}',
 '[\"https://via.placeholder.com/400x400?text=Jeans\"]',
 '[\"https://via.placeholder.com/400x400?text=Jeans\"]',
 true),
('Floral Summer Dress', 'Beautiful floral dress perfect for summer occasions', 45.99, 'Dresses', 'women',
 '[\"XS\", \"S\", \"M\", \"L\"]', '[\"Pink\", \"Blue\", \"Yellow\"]',
 '{\"XS\": 6, \"S\": 10, \"M\": 8, \"L\": 4}',
 '[\"https://via.placeholder.com/400x400?text=Dress\"]',
 '[\"https://via.placeholder.com/400x400?text=Dress\"]',
 true),
('Casual Crop Top', 'Trendy crop top for casual wear', 19.99, 'Tops', 'women',
 '[\"XS\", \"S\", \"M\", \"L\"]', '[\"White\", \"Pink\", \"Black\"]',
 '{\"XS\": 12, \"S\": 18, \"M\": 15, \"L\": 8}',
 '[\"https://via.placeholder.com/400x400?text=Top\"]',
 '[\"https://via.placeholder.com/400x400?text=Top\"]',
 true),
('Cozy Hoodie', 'Comfortable hoodie for all seasons', 39.99, 'Hoodies', 'unisex',
 '[\"S\", \"M\", \"L\", \"XL\", \"XXL\"]', '[\"Gray\", \"Black\", \"Navy\", \"Red\"]',
 '{\"S\": 10, \"M\": 15, \"L\": 12, \"XL\": 8, \"XXL\": 5}',
 '[\"https://via.placeholder.com/400x400?text=Hoodie\"]',
 '[\"https://via.placeholder.com/400x400?text=Hoodie\"]',
 true);

INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@asshreads.com', '$2b$12$lI8VJhFFsEeDNmnNGTNr9.4sWcoJi7lnwYADvk3mOLYlDk1mZdpuW', 'admin'),
('Test Customer', 'customer@test.com', '$2b$12$lI8VJhFFsEeDNmnNGTNr9.4sWcoJi7lnwYADvk3mOLYlDk1mZdpuW', 'customer'),
('John Doe', 'john@example.com', '$2b$12$lI8VJhFFsEeDNmnNGTNr9.4sWcoJi7lnwYADvk3mOLYlDk1mZdpuW', 'customer');

INSERT INTO payment_settings (cod_enabled, qr_enabled, business_name, whatsapp_number, payment_instructions) VALUES 
(true, true, 'AS Shreads', '+919876543210', 'Pay on delivery or scan QR code for online payment.');
"@ | Out-File -FilePath sample-data.sql -Encoding utf8
```

### 7. Load Sample Data
```powershell
# Replace with your actual Neon connection string
psql "postgresql://username:password@ep-hostname.region.neon.tech/database?sslmode=require" -f sample-data.sql
```

### 8. Start Application (Choose Method A or B)

#### Method A: Using batch file (Recommended)
```powershell
.\dev.bat
```

#### Method B: Using PowerShell environment variables
```powershell
$env:NODE_ENV="development"
tsx server/index.ts
```

#### Method C: Using cross-env (if available)
```powershell
npx cross-env NODE_ENV=development tsx server/index.ts
```

### 9. Open in Browser
- Go to: http://localhost:5000

### 10. Test Login
- **Admin**: admin@asshreads.com / password123
- **Customer**: customer@test.com / password123

## Windows-Specific Troubleshooting

### PowerShell Execution Policy Error
If you get "execution policy" error:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Path Issues
Make sure you're in the correct directory:
```powershell
# Check current directory
Get-Location

# List files
Get-ChildItem

# Change directory
Set-Location "C:\path\to\your\project"
```

### Environment Variables
To check if environment variables are set:
```powershell
# Check NODE_ENV
$env:NODE_ENV

# Set NODE_ENV temporarily
$env:NODE_ENV="development"
```

### Database Connection Issues
If you get database connection errors:
```powershell
# Test connection string
psql "your_neon_connection_string" -c "SELECT 1;"

# Check .env file
Get-Content .env
```

### Port Issues
If port 5000 is in use:
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F
```

## Alternative: Using Command Prompt

If you prefer Command Prompt over PowerShell:

### 1. Open Command Prompt
- Press `Ctrl + Shift + P` in VS Code
- Type "Terminal: Select Default Profile"
- Choose "Command Prompt"

### 2. Create .env file
```cmd
echo DATABASE_URL=postgresql://username:password@ep-hostname.region.neon.tech/database?sslmode=require > .env
echo NODE_ENV=development >> .env
echo PORT=5000 >> .env
echo JWT_SECRET=your_very_secure_jwt_secret_key_here_at_least_32_characters_long >> .env
echo SESSION_SECRET=your_very_secure_session_secret_key_here_at_least_32_characters_long >> .env
echo BUSINESS_NAME=AS Shreads >> .env
echo BUSINESS_EMAIL=shreadslife@gmail.com >> .env
echo BUSINESS_PHONE=+919876543210 >> .env
echo WHATSAPP_NUMBER=+919876543210 >> .env
echo BCRYPT_SALT_ROUNDS=12 >> .env
echo PASSWORD_MIN_LENGTH=6 >> .env
echo MAX_FILE_SIZE=5242880 >> .env
echo CORS_ORIGIN=http://localhost:3000,http://localhost:5000 >> .env
```

### 3. Start application
```cmd
dev.bat
```

## Quick Reference

### Common Commands
```powershell
# Install dependencies
npm install

# Create tables
npm run db:push

# Start development server
.\dev.bat

# Start production server
.\start.bat

# Stop server
Ctrl + C
```

### File Management
```powershell
# Edit .env file
code .env

# View .env content
Get-Content .env

# Check if file exists
Test-Path .env
```

This setup eliminates the PowerShell environment variable issue and provides multiple ways to run the application on Windows.