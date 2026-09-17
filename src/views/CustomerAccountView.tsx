import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  ShoppingBag,
  Heart,
  MapPin,
  LogOut,
  Package,
  Phone,
  Lock,
  Mail,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import {
  customerLogin,
  customerRegister,
  getCustomerOrders,
  getCustomerAddresses,
  addCustomerAddress,
  deleteCustomerAddress,
} from '../services/api';
import { Order, Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { AddProductForm } from '../components/AddProductForm';
import { ManageProductsList } from '../components/ManageProductsList';

interface CustomerAccountViewProps {
  initialTab?: 'orders' | 'wishlist' | 'addresses' | 'add_product' | 'manage_products';
  onTrackOrder: (orderNum: string) => void;
  onViewProduct: (product: Product) => void;
  onNavigate?: (view: string, params?: any) => void;
}

export const CustomerAccountView: React.FC<CustomerAccountViewProps> = ({
  initialTab,
  onTrackOrder,
  onViewProduct,
  onNavigate,
}) => {
  const { customer, isCustomerAuthenticated, setCustomerUser, logoutCustomer } = useAuth();
  const { wishlistItems } = useWishlist();

  const isAdmin = Boolean(
    customer?.role === 'SUPER_ADMIN' ||
    customer?.role === 'ADMIN' ||
    customer?.phone === '01010574689' ||
    (typeof window !== 'undefined' && localStorage.getItem('khatwa_admin_token'))
  );

  // Auth Forms State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Authenticated State
  const [activeTab, setActiveTab] = useState<'add_product' | 'orders' | 'wishlist' | 'addresses'>(
    initialTab || (isAdmin ? 'add_product' : 'orders')
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Update tab if admin status changes
  useEffect(() => {
    if (isAdmin && !initialTab) {
      setActiveTab('add_product');
    }
  }, [isAdmin, initialTab]);

  // New address form
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newTitle, setNewTitle] = useState('المنزل');
  const [newGov, setNewGov] = useState('القاهرة');
  const [newCity, setNewCity] = useState('');
  const [newStreet, setNewStreet] = useState('');

  useEffect(() => {
    if (isCustomerAuthenticated) {
      setLoadingData(true);
      Promise.all([getCustomerOrders(), getCustomerAddresses()])
        .then(([ordRes, addrRes]) => {
          setOrders(ordRes.orders || []);
          setAddresses(addrRes.addresses || []);
        })
        .catch(console.error)
        .finally(() => setLoadingData(false));
    }
  }, [isCustomerAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);
    try {
      const res = await customerLogin(loginPhone.trim(), loginPassword);
      setCustomerUser(res.user, res.token);
    } catch (err: any) {
      setAuthError(err.message || 'بيانات الدخول غير صحيحة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);
    try {
      const res = await customerRegister({
        name: regName.trim(),
        phone: regPhone.trim(),
        email: regEmail.trim() || undefined,
        password: regPassword,
      });
      setCustomerUser(res.user, res.token);
    } catch (err: any) {
      setAuthError(err.message || 'فشل إنشاء الحساب');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await addCustomerAddress({
        title: newTitle,
        governorate: newGov,
        city: newCity,
        street_address: newStreet,
      });
      setAddresses((prev) => [res.address, ...prev]);
      setShowAddAddress(false);
      setNewCity('');
      setNewStreet('');
    } catch (err: any) {
      alert(err.message || 'فشل إضافة العنوان');
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm('هل تريد حذف هذا العنوان؟')) return;
    try {
      await deleteCustomerAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(err.message || 'فشل حذف العنوان');
    }
  };

  // If not logged in, show Auth Screen
  if (!isCustomerAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-right">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xl p-8 space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-2">
              <UserIcon className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-stone-900">
              {authMode === 'login' ? 'تسجيل دخول العملاء' : 'إنشاء حساب جديد'}
            </h1>
            <p className="text-xs text-stone-500">
              تابع طلباتك وعناوينك المفضلة لتجربة تسوق أسرع
            </p>
          </div>

          {/* Toggle Tab */}
          <div className="flex bg-stone-100 p-1 rounded-xl">
            <button
              onClick={() => {
                setAuthMode('login');
                setAuthError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                authMode === 'login' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => {
                setAuthMode('register');
                setAuthError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                authMode === 'register' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
              }`}
            >
              مستخدم جديد
            </button>
          </div>

          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">رقم الهاتف</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl py-2.5 pr-9 pl-3 focus:bg-white focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                  <Phone className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">كلمة المرور</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl py-2.5 pr-9 pl-3 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                  <Lock className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold py-3 rounded-xl text-xs transition cursor-pointer"
              >
                {isSubmitting ? 'جاري الدخول...' : 'دخول الحساب'}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('admin')}
                  className="text-[11px] text-amber-600 hover:text-amber-700 font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>دخول حساب الأدمن لإدارة وإضافة المنتجات 👑</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">الاسم بالكامل</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="محمد أحمد"
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">رقم الهاتف (المصري)</label>
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="010XXXXXXXX"
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:bg-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">البريد الإلكتروني (اختياري)</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">كلمة المرور</label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold py-3 rounded-xl text-xs transition cursor-pointer"
              >
                {isSubmitting ? 'جاري التسجيل...' : 'إنشاء حساب جديد'}
              </button>
            </form>
          )}

        </div>
      </div>
    );
  }

  // Authenticated Dashboard
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-right">
      
      {/* Profile Header */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 text-stone-950 font-black text-2xl flex items-center justify-center">
            {customer?.name?.charAt(0) || 'ع'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black">{customer?.name}</h1>
              {isAdmin && (
                <span className="bg-amber-500 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>حساب الأدمن والمدير</span>
                </span>
              )}
            </div>
            <span className="text-xs text-stone-400 block mt-0.5 font-mono">{customer?.phone}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && onNavigate && (
            <button
              onClick={() => onNavigate('admin')}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black px-4 py-2.5 rounded-xl text-xs shadow-md transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>لوحة الإدارة الكاملة</span>
            </button>
          )}

          <button
            onClick={logoutCustomer}
            className="flex items-center gap-2 bg-stone-800 hover:bg-rose-950/80 hover:text-rose-400 text-stone-300 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل خروج</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 gap-6 text-sm font-bold overflow-x-auto pb-1">
        {isAdmin && (
          <>
            <button
              onClick={() => setActiveTab('add_product')}
              className={`pb-3 flex items-center gap-2 border-b-2 transition cursor-pointer shrink-0 ${
                activeTab === 'add_product'
                  ? 'border-amber-500 text-stone-900 font-black'
                  : 'border-transparent text-amber-600 hover:text-amber-700 font-bold'
              }`}
            >
              <Plus className="w-4 h-4 text-amber-500" />
              <span>إضافة منتج جديد للمتجر ✨</span>
            </button>

            <button
              onClick={() => setActiveTab('manage_products')}
              className={`pb-3 flex items-center gap-2 border-b-2 transition cursor-pointer shrink-0 ${
                activeTab === 'manage_products'
                  ? 'border-rose-600 text-rose-600 font-black'
                  : 'border-transparent text-stone-600 hover:text-rose-600 font-bold'
              }`}
            >
              <Trash2 className="w-4 h-4 text-rose-500" />
              <span>حذف وإدارة المنتجات 🗑️</span>
            </button>
          </>
        )}

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition cursor-pointer shrink-0 ${
            activeTab === 'orders'
              ? 'border-amber-500 text-stone-900'
              : 'border-transparent text-stone-400 hover:text-stone-700'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>سجل الطلبات ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition cursor-pointer shrink-0 ${
            activeTab === 'wishlist'
              ? 'border-amber-500 text-stone-900'
              : 'border-transparent text-stone-400 hover:text-stone-700'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>قائمة المفضلة ({wishlistItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition cursor-pointer shrink-0 ${
            activeTab === 'addresses'
              ? 'border-amber-500 text-stone-900'
              : 'border-transparent text-stone-400 hover:text-stone-700'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>عناويني المحفوظة ({addresses.length})</span>
        </button>
      </div>

      {/* Tab: Add Product (Admin Only) */}
      {isAdmin && activeTab === 'add_product' && (
        <div className="space-y-6">
          <AddProductForm
            onSuccess={(newProduct) => {
              if (onViewProduct) onViewProduct(newProduct);
            }}
          />
        </div>
      )}

      {/* Tab: Manage & Delete Products (Admin Only) */}
      {isAdmin && activeTab === 'manage_products' && (
        <div className="space-y-6">
          <ManageProductsList
            onAddNewProduct={() => setActiveTab('add_product')}
            onViewProduct={onViewProduct}
            onEditProduct={() => {
              if (onNavigate) onNavigate('admin');
            }}
          />
        </div>
      )}

      {/* Tab 1: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 text-stone-500 text-xs">
              لم تقم بطلب أي أحذية بعد. تسوق الموديلات الجديدة الآن!
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-stone-900">{ord.order_number}</span>
                    <span className="text-xs text-stone-400">
                      {new Date(ord.created_at).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-full">
                      {ord.status}
                    </span>
                    <button
                      onClick={() => onTrackOrder(ord.order_number)}
                      className="bg-stone-900 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-lg"
                    >
                      تتبع
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-500">إجمالي المبلغ المطلوب:</span>
                  <span className="text-base font-black text-amber-600">{ord.total_amount} ج.م</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Wishlist */}
      {activeTab === 'wishlist' && (
        <div>
          {wishlistItems.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 text-stone-500 text-xs">
              قائمة المفضلة لديك فارغة. اضغط على أيقونة القلب على أي حذاء لحفظه هنا.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {wishlistItems.map((item) => (
                <div key={item.id} className="bg-white p-3 rounded-2xl border border-stone-200 space-y-2">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=80'}
                    alt={item.name_ar}
                    className="w-full aspect-square object-cover rounded-xl"
                  />
                  <h4 className="text-xs font-bold text-stone-900 truncate">{item.name_ar}</h4>
                  <span className="text-xs font-black text-amber-600 block">{item.price} ج.م</span>
                  <button
                    onClick={() => onViewProduct({ id: item.product_id, name_ar: item.name_ar } as any)}
                    className="w-full bg-stone-900 text-amber-400 py-1.5 rounded-lg text-xs font-bold"
                  >
                    عرض التفاصيل
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-stone-800">العناوين المسجلة للشحن</h3>
            <button
              onClick={() => setShowAddAddress(!showAddAddress)}
              className="bg-stone-900 text-amber-400 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة عنوان جديد</span>
            </button>
          </div>

          {showAddAddress && (
            <form onSubmit={handleAddAddress} className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="اسم العنوان (مثل: المنزل)"
                  className="text-xs p-2.5 rounded-xl bg-white border border-stone-300"
                />
                <input
                  type="text"
                  required
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  placeholder="المدينة / الحي"
                  className="text-xs p-2.5 rounded-xl bg-white border border-stone-300"
                />
                <input
                  type="text"
                  required
                  value={newStreet}
                  onChange={(e) => setNewStreet(e.target.value)}
                  placeholder="الشارع والعمارة"
                  className="text-xs p-2.5 rounded-xl bg-white border border-stone-300"
                />
              </div>
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-5 py-2 rounded-xl text-xs"
              >
                حفظ العنوان
              </button>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div key={addr.id} className="bg-white p-5 rounded-2xl border border-stone-200 flex justify-between items-start">
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-stone-900 block">{addr.title}</span>
                  <span className="text-stone-500 block">{addr.governorate} - {addr.city}</span>
                  <span className="text-stone-700 block">{addr.street_address}</span>
                </div>
                <button
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="text-stone-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
