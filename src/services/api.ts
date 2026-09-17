import {
  Product,
  Category,
  CartItem,
  Order,
  User,
  Coupon,
  StoreSettings,
} from '../types';

const API_BASE = '/api';

// Helper for HTTP requests
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('khatwa_token') || localStorage.getItem('khatwa_admin_token');
  const sessionId = localStorage.getItem('khatwa_session_id') || '';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (sessionId) {
    headers['x-session-id'] = sessionId;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'حدث خطأ في الاتصال بالخادم');
  }

  return data as T;
}

// ==========================================
// PUBLIC & STORE CATALOG API
// ==========================================

export async function getHomeData(): Promise<{
  featured: Product[];
  bestsellers: Product[];
  newArrivals: Product[];
  categories: Category[];
  settings: StoreSettings;
}> {
  return request('/home');
}

export async function getCategories(): Promise<{ categories: Category[] }> {
  return request('/categories');
}

export async function getProducts(params: Record<string, any> = {}): Promise<{
  products: Product[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, String(val));
    }
  });
  return request(`/products?${query.toString()}`);
}

export async function getProduct(idOrSlug: string | number): Promise<{ product: Product }> {
  return request(`/products/${idOrSlug}`);
}

// ==========================================
// CART API
// ==========================================

export async function getCart(): Promise<{ items: CartItem[]; subtotal: number }> {
  return request('/cart');
}

export async function addToCart(
  productId: number,
  variantId: number,
  quantity: number = 1
): Promise<{ message: string; sessionId?: string }> {
  const res = await request<{ message: string; sessionId?: string }>('/cart', {
    method: 'POST',
    body: JSON.stringify({ productId, variantId, quantity }),
  });
  if (res.sessionId && !localStorage.getItem('khatwa_session_id')) {
    localStorage.setItem('khatwa_session_id', res.sessionId);
  }
  return res;
}

export async function updateCartItem(id: number, quantity: number): Promise<{ message: string }> {
  return request(`/cart/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  });
}

export async function removeCartItem(id: number): Promise<{ message: string }> {
  return request(`/cart/${id}`, { method: 'DELETE' });
}

export async function clearCart(): Promise<{ message: string }> {
  return request('/cart', { method: 'DELETE' });
}

// ==========================================
// COUPON & ORDER API
// ==========================================

export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<{
  valid: boolean;
  code: string;
  discount_type: 'PERCENTAGE' | 'FIXED';
  discount_value: number;
  discountAmount: number;
  message: string;
}> {
  return request('/coupons/validate', {
    method: 'POST',
    body: JSON.stringify({ code, subtotal }),
  });
}

export async function createOrder(orderData: any): Promise<{
  message: string;
  orderNumber: string;
  order: Order;
}> {
  return request('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
}

export async function getOrder(orderNumber: string): Promise<{ order: Order; items: any[] }> {
  return request(`/orders/${encodeURIComponent(orderNumber)}`);
}

// ==========================================
// WISHLIST & REVIEWS
// ==========================================

export async function getWishlist(): Promise<{ items: any[] }> {
  return request('/wishlist');
}

export async function toggleWishlist(productId: number): Promise<{ inWishlist: boolean; message: string }> {
  return request('/wishlist/toggle', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  });
}

export async function submitReview(data: {
  product_id: number;
  customer_name: string;
  rating: number;
  comment: string;
}): Promise<{ message: string }> {
  return request('/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ==========================================
// CUSTOMER AUTH
// ==========================================

export async function customerLogin(phone: string, password: string): Promise<{ token: string; user: User }> {
  return request('/auth/customer/login', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
  });
}

export async function customerRegister(data: {
  name: string;
  phone: string;
  email?: string;
  password: string;
}): Promise<{ token: string; user: User }> {
  return request('/auth/customer/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function customerLogout(): Promise<{ message: string }> {
  return request('/auth/customer/logout', { method: 'POST' });
}

export async function getCustomerMe(): Promise<{ user: User }> {
  return request('/auth/customer/me');
}

export async function getCustomerOrders(): Promise<{ orders: Order[] }> {
  return request('/orders/customer/my-orders');
}

export async function getCustomerAddresses(): Promise<{ addresses: any[] }> {
  return request('/auth/customer/addresses');
}

export async function addCustomerAddress(address: any): Promise<{ address: any }> {
  return request('/auth/customer/addresses', {
    method: 'POST',
    body: JSON.stringify(address),
  });
}

export async function deleteCustomerAddress(id: number): Promise<{ message: string }> {
  return request(`/auth/customer/addresses/${id}`, { method: 'DELETE' });
}

// ==========================================
// ADMIN AUTH & MANAGEMENT
// ==========================================

export async function adminLogin(phone: string, password: string): Promise<{ token: string; user: User }> {
  return request('/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
  });
}

export async function adminLogout(): Promise<{ message: string }> {
  return request('/auth/admin/logout', { method: 'POST' });
}

export async function getAdminMe(): Promise<{ user: User }> {
  return request('/auth/admin/me');
}

export async function getAdminDashboard(): Promise<any> {
  return request('/admin/dashboard');
}

export async function getAdminProducts(params: Record<string, any> = {}): Promise<{ products: Product[] }> {
  const q = new URLSearchParams(params).toString();
  return request(`/admin/products?${q}`);
}

export async function getAdminProduct(id: number): Promise<{ product: Product }> {
  return request(`/admin/products/${id}`);
}

export async function createAdminProduct(productData: any): Promise<{ message: string; product: Product }> {
  return request('/admin/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
}

export async function updateAdminProduct(id: number, productData: any): Promise<{ message: string }> {
  return request(`/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  });
}

export async function deleteAdminProduct(id: number): Promise<{ message: string }> {
  return request(`/admin/products/${id}`, { method: 'DELETE' });
}

export async function toggleAdminProduct(id: number): Promise<{ message: string; is_active: boolean }> {
  return request(`/admin/products/${id}/toggle`, { method: 'PUT' });
}

export async function getAdminOrders(params: Record<string, any> = {}): Promise<{ orders: Order[] }> {
  const q = new URLSearchParams(params).toString();
  return request(`/admin/orders?${q}`);
}

export async function getAdminOrder(id: number): Promise<{ order: Order; items: any[] }> {
  return request(`/admin/orders/${id}`);
}

export async function updateAdminOrderStatus(id: number, status: string): Promise<{ message: string }> {
  return request(`/admin/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export async function getAdminCustomers(): Promise<{ customers: any[] }> {
  return request('/admin/customers');
}

export async function getAdminCategories(): Promise<{ categories: Category[] }> {
  return request('/admin/categories');
}

export async function createAdminCategory(categoryData: any): Promise<{ message: string; category: Category }> {
  return request('/admin/categories', {
    method: 'POST',
    body: JSON.stringify(categoryData),
  });
}

export async function updateAdminCategory(id: number, categoryData: any): Promise<{ message: string }> {
  return request(`/admin/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(categoryData),
  });
}

export async function deleteAdminCategory(id: number): Promise<{ message: string }> {
  return request(`/admin/categories/${id}`, { method: 'DELETE' });
}

export async function getAdminCoupons(): Promise<{ coupons: Coupon[] }> {
  return request('/admin/coupons');
}

export async function createAdminCoupon(couponData: any): Promise<{ message: string; coupon: Coupon }> {
  return request('/admin/coupons', {
    method: 'POST',
    body: JSON.stringify(couponData),
  });
}

export async function deleteAdminCoupon(id: number): Promise<{ message: string }> {
  return request(`/admin/coupons/${id}`, { method: 'DELETE' });
}

export async function getAdminSettings(): Promise<{ settings: StoreSettings }> {
  return request('/admin/settings');
}

export async function updateAdminSettings(settings: StoreSettings): Promise<{ message: string }> {
  return request('/admin/settings', {
    method: 'PUT',
    body: JSON.stringify({ settings }),
  });
}

export async function changeAdminPassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
  return request('/admin/change-password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function uploadImageFile(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('image', file);

  const token = localStorage.getItem('khatwa_admin_token') || localStorage.getItem('khatwa_token');
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
    credentials: 'include',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'فشل رفع الصورة');
  }
  return data;
}

export async function uploadMultipleImageFiles(files: FileList | File[]): Promise<{ urls: string[] }> {
  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append('images', file);
  });

  const token = localStorage.getItem('khatwa_admin_token') || localStorage.getItem('khatwa_token');
  const res = await fetch(`${API_BASE}/upload/multiple`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
    credentials: 'include',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'فشل رفع الصور');
  }
  return data;
}
