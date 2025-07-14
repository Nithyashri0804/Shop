import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './contexts/ToastContext';
import { WishlistProvider } from './contexts/WishlistContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProductList from './pages/products/ProductList';
import ProductDetail from './pages/products/ProductDetail';
import Cart from './pages/cart/Cart';
import Checkout from './pages/checkout/Checkout';
import OrderConfirmation from './pages/orders/OrderConfirmation';
import MyOrders from './pages/orders/MyOrders';
import OrderDetail from './pages/orders/OrderDetail';
import PaymentPage from './pages/checkout/PaymentPage';
import PaymentSettings from './pages/admin/PaymentSettings';
import CategoryManagement from './pages/admin/CategoryManagement';
import DeliveryZoneManagement from './pages/admin/DeliveryZoneManagement';
import Profile from './pages/profile/Profile';
import Dashboard from './pages/admin/Dashboard';
import ProductManagement from './pages/admin/ProductManagement';
import OrderManagement from './pages/admin/OrderManagement';

import Wishlist from './pages/wishlist/Wishlist';
import About from './pages/About';
import Contact from './pages/Contact';
import SearchResults from './pages/search/SearchResults';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <Router>
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/products" element={<ProductList />} />
                  <Route path="/products/:gender" element={<ProductList />} />
                  <Route path="/products/:gender/:category" element={<ProductList />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/payment" element={<PaymentPage />} />
                  <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
                  <Route path="/order-confirmation" element={<OrderConfirmation />} />
                  <Route path="/orders" element={<MyOrders />} />
                  <Route path="/order/:orderId" element={<OrderDetail />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/search" element={<SearchResults />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/admin" element={<Dashboard />} />
                  <Route path="/admin/products" element={<ProductManagement />} />
                  <Route path="/admin/orders" element={<OrderManagement />} />

                  <Route path="/admin/categories" element={<CategoryManagement />} />
                  <Route path="/admin/delivery-zones" element={<DeliveryZoneManagement />} />
                  <Route path="/admin/payment-settings" element={<PaymentSettings />} />
                </Routes>
              </Layout>
            </Router>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;