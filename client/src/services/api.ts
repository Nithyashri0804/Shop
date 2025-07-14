import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (name: string, email: string, password: string, phone?: string) =>
    api.post('/auth/register', { name, email, password, phone }),
  
  getCurrentUser: () => api.get('/auth/me'),
};

// Products API
export const productsAPI = {
  getProducts: (params?: any) => api.get('/products', { params }),
  
  getProduct: (id: string) => api.get(`/products/${id}`),
  
  createProduct: (data: any) => api.post('/products', data),
  
  updateProduct: (id: string, data: any) => api.put(`/products/${id}`, data),
  
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
  
  addReview: (id: string, rating: number, comment: string) =>
    api.post(`/products/${id}/reviews`, { rating, comment }),
};

// Orders API
export const ordersAPI = {
  createOrder: (data: any) => api.post('/orders', data),
  
  getMyOrders: () => api.get('/orders/my-orders'),
  
  getAllOrders: (params?: any) => api.get('/orders', { params }),
  
  getOrder: (id: string) => api.get(`/orders/${id}`),
  
  updateOrderStatus: (id: string, orderStatus: string, trackingNumber?: string) =>
    api.put(`/orders/${id}/status`, { orderStatus, trackingNumber }),
  
  updateOrderPaymentStatus: (id: string, paymentStatus: string) =>
    api.put(`/orders/${id}/payment-status`, { paymentStatus }),
};

// Categories API
export const categoriesAPI = {
  getCategories: (params?: any) => api.get('/categories', { params }),
  
  getCategory: (id: string) => api.get(`/categories/${id}`),
  
  createCategory: (data: any) => api.post('/categories', data),
  
  updateCategory: (id: string, data: any) => api.put(`/categories/${id}`, data),
  
  deleteCategory: (id: string) => api.delete(`/categories/${id}`),
};

// Upload API
export const uploadAPI = {
  uploadMedia: (formData: FormData) => api.post('/upload/media', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 30000, // 30 second timeout for uploads
  }),
  
  deleteMedia: (mediaId: string) => api.delete(`/upload/media/${mediaId}`),
  
  getMedia: (mediaId: string) => api.get(`/upload/media/${mediaId}`, {
    responseType: 'blob'
  }),
  
  getAllMedia: (params?: any) => api.get('/upload/media', { params }),
  
  // Legacy support for images
  uploadImages: (formData: FormData) => api.post('/upload/media', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 30000,
  }),
  
  deleteImage: (imageId: string) => api.delete(`/upload/media/${imageId}`),
};

// Wishlist API
export const wishlistAPI = {
  getWishlist: () => api.get('/wishlist'),
  
  addToWishlist: (productId: string) => {
    console.log('Adding to wishlist:', productId);
    return api.post('/wishlist', { productId });
  },
  
  removeFromWishlist: (productId: string) => {
    console.log('Removing from wishlist:', productId);
    return api.delete(`/wishlist/${productId}`);
  },
  
  clearWishlist: () => api.delete('/wishlist'),
};

// Payment Settings API
export const paymentSettingsAPI = {
  getSettings: () => api.get('/payment-settings'),
  
  updateSettings: (data: any) => {
    console.log('=== API CALL: UPDATE PAYMENT SETTINGS ===');
    console.log('Data being sent:', JSON.stringify(data, null, 2));
    console.log('API URL:', `${API_BASE_URL}/payment-settings`);
    return api.put('/payment-settings', data);
  },
};

// Add request interceptor for debugging
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Log API requests in development
  if (import.meta.env.DEV) {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
  }
  
  return config;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log('API Response:', response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    // Log errors in development
    if (import.meta.env.DEV) {
      console.error('API Error:', error.response?.status, error.config?.url, error.response?.data);
    }
    
    if (error.response?.status === 401) {
      Cookies.remove('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;