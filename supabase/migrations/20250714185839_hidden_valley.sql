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
 '["https://images.pexels.com/photos/1192609/pexels-photo-1192609.jpeg?auto=compress&cs=tinysrgb&w=600"]', 
 '["https://images.pexels.com/photos/1192609/pexels-photo-1192609.jpeg?auto=compress&cs=tinysrgb&w=600"]', 
 true),
('Summer Dress', 'Light and breezy summer dress perfect for warm weather', 49.99, 'Dresses', 'women',
 '["XS", "S", "M", "L"]', '["Blue", "Pink", "White", "Yellow"]',
 '{"XS": 8, "S": 12, "M": 15, "L": 10}',
 '["https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=600"]',
 '["https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=600"]',
 true);

-- Create admin user (password: password123)
INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@asshreads.com', '$2b$12$lI8VJhFFsEeDNmnNGTNr9.4sWcoJi7lnwYADvk3mOLYlDk1mZdpuW', 'admin');

-- Create test customer (password: password123)
INSERT INTO users (name, email, password, role) VALUES 
('Test Customer', 'customer@test.com', '$2b$12$lI8VJhFFsEeDNmnNGTNr9.4sWcoJi7lnwYADvk3mOLYlDk1mZdpuW', 'customer');

-- Set up payment settings
INSERT INTO payment_settings (cod_enabled, qr_enabled, business_name, whatsapp_number, payment_instructions) VALUES 
(true, true, 'AS Shreads', '+919876543210', 'Pay on delivery or scan QR code for online payment.');