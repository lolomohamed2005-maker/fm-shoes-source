export interface ProductVariant {
  id: number;
  product_id?: number;
  size: string;
  color: string;
  color_code?: string | null;
  stock: number;
  sku?: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

export interface Product {
  id: number;
  sku: string;
  name_ar: string;
  name_en?: string;
  slug: string;
  description_ar: string;
  description_en?: string;
  price: number | string;
  discount_price?: number | string | null;
  category_id?: number;
  category_name_ar?: string;
  category_slug?: string;
  is_featured: boolean;
  is_bestseller: boolean;
  is_active: boolean;
  rating: number | string;
  reviews_count: number;
  created_at: string;
  updated_at: string;
  primary_image?: string;
  total_stock?: number;
  images?: ProductImage[];
  variants?: ProductVariant[];
  reviews?: Review[];
  relatedProducts?: Product[];
}

export interface Category {
  id: number;
  slug: string;
  name_ar: string;
  name_en?: string;
  description_ar?: string;
  image_url?: string;
  is_active: boolean;
  display_order: number;
  product_count?: number;
}

export interface CartItem {
  id: number;
  variant_id: number;
  product_id: number;
  quantity: number;
  name_ar: string;
  price: number;
  slug: string;
  size: string;
  color: string;
  current_stock: number;
  image_url: string;
  item_total: number;
  is_in_stock: boolean;
}

export interface OrderItem {
  id?: number;
  order_id?: number;
  product_id: number;
  variant_id: number;
  product_name: string;
  variant_info: string;
  unit_price: number | string;
  quantity: number;
  total_price: number | string;
  image_url?: string;
}

export interface Order {
  id: number;
  order_number: string;
  user_id?: number;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  shipping_city: string;
  shipping_area: string;
  shipping_address: string;
  building_no?: string;
  notes?: string;
  subtotal: number | string;
  discount_amount: number | string;
  coupon_code?: string;
  shipping_cost: number | string;
  total_amount: number | string;
  payment_method: string;
  payment_status: string;
  order_status?: 'Pending' | 'Confirmed' | 'Preparing' | 'Shipped' | 'Delivered' | 'Cancelled' | string;
  status?: string;
  created_at: string;
  items?: OrderItem[];
  item_count?: number;
}

export interface User {
  id: number;
  phone: string;
  name: string;
  email?: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER';
  created_at?: string;
}

export interface Review {
  id: number;
  product_id: number;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Coupon {
  id: number;
  code: string;
  discount_type: 'PERCENTAGE' | 'FIXED';
  discount_value: number | string;
  min_order_value?: number | string;
  max_discount?: number | string;
  usage_limit?: number;
  times_used?: number;
  expires_at?: string;
  is_active: boolean;
}

export interface StoreSettings {
  store_name?: string;
  store_phone?: string;
  store_address?: string;
  shipping_fee_cairo?: string;
  shipping_fee_other?: string;
  free_shipping_threshold?: string;
  announcement_banner?: string;
  [key: string]: string | undefined;
}
