import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Layers,
  Tag,
  Users,
  Settings,
  Plus,
  Trash2,
  Edit,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Upload,
  Eye,
  LogOut,
  Save,
  Lock,
  Phone,
  RefreshCw,
  SlidersHorizontal,
  Image as ImageIcon,
  Sparkles,
  Star,
  Check,
  FolderPlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/BrandLogo';
import {
  adminLogin,
  getAdminDashboard,
  getAdminProducts,
  getAdminProduct,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  toggleAdminProduct,
  getAdminOrders,
  getAdminOrder,
  updateAdminOrderStatus,
  getAdminCategories,
  createAdminCategory,
  deleteAdminCategory,
  getAdminCoupons,
  createAdminCoupon,
  deleteAdminCoupon,
  getAdminCustomers,
  getAdminSettings,
  updateAdminSettings,
  changeAdminPassword,
  uploadImageFile,
  uploadMultipleImageFiles,
} from '../services/api';
import { Product, Order, Category, Coupon, StoreSettings } from '../types';
import { AddProductForm } from '../components/AddProductForm';

interface AdminViewProps {
  onBackToStore: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onBackToStore }) => {
  const { admin, isAdminAuthenticated, setAdminUser, logoutAdmin } = useAuth();

  // Login form state - private and clean, no hardcoded credentials exposed
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Admin Tab - default to add_product so the moment admin opens their account, the add product form is right there!
  const [activeTab, setActiveTab] = useState<
    'add_product' | 'dashboard' | 'products' | 'orders' | 'categories' | 'coupons' | 'customers' | 'settings'
  >('add_product');

  // Dashboard Data
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  // Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchProduct, setSearchProduct] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [customSizeInput, setCustomSizeInput] = useState('');

  // Product Form State
  const [productForm, setProductForm] = useState<any>({
    name_ar: '',
    name_en: '',
    category_id: '',
    description_ar: '',
    price: '',
    discount_price: '',
    sku: '',
    is_featured: true,
    is_bestseller: false,
    images: [] as Array<{ image_url: string; is_primary: boolean }>,
    variants: [
      { size: '40', stock: 10, color: '' },
      { size: '41', stock: 10, color: '' },
      { size: '42', stock: 10, color: '' },
      { size: '43', stock: 10, color: '' },
      { size: '44', stock: 10, color: '' },
      { size: '45', stock: 10, color: '' },
    ],
  });

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('ALL');

  // Coupons State
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [newCouponForm, setNewCouponForm] = useState({
    code: '',
    discount_type: 'PERCENTAGE',
    discount_value: '10',
    min_order_amount: '0',
    max_uses: '100',
  });

  // Category Form State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySlug, setNewCategorySlug] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState('');

  // Settings State
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({});
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [currentAdminPassword, setCurrentAdminPassword] = useState('');
  const [settingsSavedMessage, setSettingsSavedMessage] = useState<string | null>(null);

  // Load active tab data
  useEffect(() => {
    if (!isAdminAuthenticated) return;

    if (activeTab === 'dashboard') {
      setLoadingDashboard(true);
      getAdminDashboard()
        .then(setDashboardData)
        .catch(console.error)
        .finally(() => setLoadingDashboard(false));
    } else if (activeTab === 'products') {
      getAdminProducts().then((res) => setProducts(res.products || []));
      getAdminCategories().then((res) => setCategories(res.categories || []));
    } else if (activeTab === 'orders') {
      getAdminOrders({ status: orderFilterStatus !== 'ALL' ? orderFilterStatus : undefined })
        .then((res) => setOrders(res.orders || []));
    } else if (activeTab === 'categories') {
      getAdminCategories().then((res) => setCategories(res.categories || []));
    } else if (activeTab === 'coupons') {
      getAdminCoupons().then((res) => setCoupons(res.coupons || []));
    } else if (activeTab === 'settings') {
      getAdminSettings().then((res) => setStoreSettings(res.settings || {}));
    }
  }, [isAdminAuthenticated, activeTab, orderFilterStatus]);

  // Handle Admin Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      const res = await adminLogin(loginPhone.trim(), loginPassword);
      setAdminUser(res.user, res.token);
      setActiveTab('products');
      getAdminProducts().then((p) => setProducts(p.products || []));
      getAdminCategories().then((c) => setCategories(c.categories || []));
    } catch (err: any) {
      setLoginError(err.message || 'بيانات الدخول غير صحيحة، يرجى التأكد من رقم الهاتف وكلمة المرور');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // If not authenticated as Admin, show login screen
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col justify-center items-center p-4 text-right">
        <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <BrandLogo size="lg" lightText={true} />
            <div>
              <h1 className="text-lg font-black text-white">لوحة تحكم إدارة المتجر</h1>
              <p className="text-xs text-stone-400 mt-1">تسجيل دخول آمن لإدارة المنتجات، المقاسات، والطلبات</p>
            </div>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-xl text-xs font-bold">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-300">رقم هاتف المدير</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="010XXXXXXXX"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  className="w-full text-xs bg-stone-800 border border-stone-700 rounded-xl py-3 pr-10 pl-3 text-white focus:ring-2 focus:ring-amber-500 font-mono"
                />
                <Phone className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-300">كلمة المرور</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full text-xs bg-stone-800 border border-stone-700 rounded-xl py-3 pr-10 pl-3 text-white focus:ring-2 focus:ring-amber-500"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-black py-3 rounded-xl text-xs transition cursor-pointer shadow-md disabled:opacity-50"
            >
              {isLoggingIn ? 'جاري التحقق والدخول...' : 'دخول لوحة التحكم'}
            </button>
          </form>

          <button
            onClick={onBackToStore}
            className="w-full text-center text-xs text-stone-400 hover:text-white pt-2 cursor-pointer transition"
          >
            &larr; العودة للمتجر الرئيسي
          </button>
        </div>
      </div>
    );
  }

  // Standard Footwear Sizes in Egypt
  const standardSizes = ['37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];

  // Toggle single size on/off
  const toggleSize = (size: string) => {
    const exists = productForm.variants.some((v: any) => String(v.size) === String(size));
    if (exists) {
      setProductForm({
        ...productForm,
        variants: productForm.variants.filter((v: any) => String(v.size) !== String(size)),
      });
    } else {
      setProductForm({
        ...productForm,
        variants: [...productForm.variants, { size, stock: 10, color: '' }],
      });
    }
  };

  // Quick Preset Sizes
  const applySizePreset = (preset: 'men' | 'women' | 'all') => {
    let sizesToApply: string[] = [];
    if (preset === 'men') sizesToApply = ['41', '42', '43', '44', '45'];
    if (preset === 'women') sizesToApply = ['37', '38', '39', '40', '41'];
    if (preset === 'all') sizesToApply = ['38', '39', '40', '41', '42', '43', '44', '45'];

    const newVariants = sizesToApply.map((sz) => {
      const existing = productForm.variants.find((v: any) => String(v.size) === String(sz));
      return existing || { size: sz, stock: 10, color: '' };
    });

    setProductForm({
      ...productForm,
      variants: newVariants,
    });
  };

  // Open Create Product Modal
  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProductForm({
      name_ar: '',
      name_en: '',
      category_id: categories[0]?.id || 1,
      description_ar: '',
      price: '',
      discount_price: '',
      sku: `FM-${Math.floor(1000 + Math.random() * 9000)}`,
      is_featured: true,
      is_bestseller: false,
      images: [],
      variants: [
        { size: '40', stock: 10, color: '' },
        { size: '41', stock: 10, color: '' },
        { size: '42', stock: 10, color: '' },
        { size: '43', stock: 10, color: '' },
        { size: '44', stock: 10, color: '' },
        { size: '45', stock: 10, color: '' },
      ],
    });
    setCustomImageUrl('');
    setCustomSizeInput('');
    setShowProductModal(true);
  };

  // Handle Product modal save
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validImages = productForm.images.filter((img: any) => img.image_url && img.image_url.trim() !== '');
      if (validImages.length === 0) {
        alert('يرجى اختيار صورة واحدة على الأقل للمنتج من المعرض أو إدخال رابط صورة');
        return;
      }

      // Ensure at least one image is marked primary
      const hasPrimary = validImages.some((img: any) => img.is_primary);
      if (!hasPrimary && validImages.length > 0) {
        validImages[0].is_primary = true;
      }

      if (!productForm.variants || productForm.variants.length === 0) {
        alert('يرجى تحديد مقاس واحد على الأقل للمنتج');
        return;
      }

      const payload = {
        name_ar: productForm.name_ar,
        name_en: productForm.name_en || productForm.name_ar,
        category_id: Number(productForm.category_id) || categories[0]?.id || 1,
        description_ar: productForm.description_ar,
        price: Number(productForm.price),
        discount_price: productForm.discount_price ? Number(productForm.discount_price) : null,
        sku: productForm.sku || `FM-${Math.floor(1000 + Math.random() * 9000)}`,
        is_featured: Boolean(productForm.is_featured),
        is_bestseller: Boolean(productForm.is_bestseller),
        images: validImages,
        variants: productForm.variants.map((v: any) => ({
          size: String(v.size),
          stock: Number(v.stock) || 0,
          color: v.color || null,
        })),
      };

      if (editingProductId) {
        await updateAdminProduct(editingProductId, payload);
      } else {
        await createAdminProduct(payload);
      }

      setShowProductModal(false);
      setEditingProductId(null);
      const res = await getAdminProducts();
      setProducts(res.products || []);
      setActiveTab('products');
    } catch (err: any) {
      alert(err.message || 'فشل حفظ المنتج');
    }
  };

  // Open Edit Product
  const handleOpenEditProduct = async (prod: Product) => {
    try {
      const { product: fullProd } = await getAdminProduct(prod.id);
      setEditingProductId(fullProd.id);
      setProductForm({
        name_ar: fullProd.name_ar,
        name_en: fullProd.name_en || '',
        category_id: fullProd.category_id,
        description_ar: fullProd.description_ar || '',
        price: fullProd.price,
        discount_price: fullProd.discount_price || '',
        sku: fullProd.sku,
        is_featured: fullProd.is_featured,
        is_bestseller: fullProd.is_bestseller,
        images:
          fullProd.images && fullProd.images.length > 0
            ? fullProd.images
            : fullProd.primary_image
            ? [{ image_url: fullProd.primary_image, is_primary: true }]
            : [],
        variants:
          fullProd.variants && fullProd.variants.length > 0
            ? fullProd.variants
            : [
                { size: '40', stock: 10, color: '' },
                { size: '41', stock: 10, color: '' },
                { size: '42', stock: 10, color: '' },
              ],
      });
      setCustomImageUrl('');
      setCustomSizeInput('');
      setShowProductModal(true);
    } catch (err: any) {
      alert('فشل تحميل تفاصيل المنتج');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج نهائياً من قاعدة البيانات؟')) return;
    try {
      await deleteAdminProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || 'فشل حذف المنتج');
    }
  };

  // Toggle Active Product
  const handleToggleProduct = async (id: number) => {
    try {
      const res = await toggleAdminProduct(id);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_active: res.is_active } : p))
      );
    } catch (err: any) {
      alert('فشل تعديل حالة المنتج');
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      await updateAdminOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: status as any } : o))
      );
      if (selectedOrderDetails?.order?.id === orderId) {
        setSelectedOrderDetails((prev: any) => ({
          ...prev,
          order: { ...prev.order, status },
        }));
      }
    } catch (err: any) {
      alert(err.message || 'فشل تحديث حالة الطلب');
    }
  };

  // Handle Image File Upload (single or multiple from gallery)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingImages(true);
    try {
      if (files.length === 1) {
        const res = await uploadImageFile(files[0]);
        setProductForm((prev: any) => {
          const currentValid = prev.images.filter((img: any) => img.image_url && img.image_url.trim() !== '');
          const isFirst = currentValid.length === 0;
          return {
            ...prev,
            images: [...currentValid, { image_url: res.url, is_primary: isFirst }],
          };
        });
      } else {
        const res = await uploadMultipleImageFiles(files);
        setProductForm((prev: any) => {
          const currentValid = prev.images.filter((img: any) => img.image_url && img.image_url.trim() !== '');
          const newImgs = res.urls.map((url, i) => ({
            image_url: url,
            is_primary: currentValid.length === 0 && i === 0,
          }));
          return {
            ...prev,
            images: [...currentValid, ...newImgs],
          };
        });
      }
    } catch (err: any) {
      alert(err.message || 'فشل رفع الصور من المعرض');
    } finally {
      setIsUploadingImages(false);
      e.target.value = '';
    }
  };

  // Add Image by URL
  const handleAddImageUrl = () => {
    if (!customImageUrl.trim()) return;
    setProductForm((prev: any) => {
      const currentValid = prev.images.filter((img: any) => img.image_url && img.image_url.trim() !== '');
      return {
        ...prev,
        images: [...currentValid, { image_url: customImageUrl.trim(), is_primary: currentValid.length === 0 }],
      };
    });
    setCustomImageUrl('');
  };

  // Remove Image from Form
  const handleRemoveImage = (indexToRemove: number) => {
    setProductForm((prev: any) => {
      const updated = prev.images.filter((_: any, idx: number) => idx !== indexToRemove);
      if (updated.length > 0 && !updated.some((img: any) => img.is_primary)) {
        updated[0].is_primary = true;
      }
      return { ...prev, images: updated };
    });
  };

  // Set Primary Image
  const handleSetPrimaryImage = (indexToPrimary: number) => {
    setProductForm((prev: any) => ({
      ...prev,
      images: prev.images.map((img: any, idx: number) => ({
        ...img,
        is_primary: idx === indexToPrimary,
      })),
    }));
  };

  // Add Custom Size
  const handleAddCustomSize = () => {
    if (!customSizeInput.trim()) return;
    const exists = productForm.variants.some(
      (v: any) => String(v.size).toLowerCase() === customSizeInput.trim().toLowerCase()
    );
    if (!exists) {
      setProductForm((prev: any) => ({
        ...prev,
        variants: [...prev.variants, { size: customSizeInput.trim(), stock: 10, color: '' }],
      }));
    }
    setCustomSizeInput('');
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col text-right">
      
      {/* Admin Top Navigation Bar */}
      <header className="bg-stone-900 text-white border-b border-stone-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" lightText={true} />
            <div className="hidden sm:block border-r border-stone-800 pr-3 mr-1">
              <span className="font-bold text-xs text-stone-300 block">لوحة تحكم المسؤول</span>
              <span className="text-[10px] text-amber-400 block font-mono">إدارة المتجر والمخزون</span>
            </div>
          </div>

          {/* Quick Tabs in Header */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab('add_product')}
              className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'add_product' ? 'bg-amber-500 text-stone-950 font-black' : 'text-amber-400 bg-stone-800/80 hover:bg-stone-800'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة منتج جديد ✨</span>
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'products' ? 'bg-amber-500 text-stone-950 font-black' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>الأحذية والمنتجات</span>
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'dashboard' ? 'bg-amber-500 text-stone-950 font-black' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>الإحصائيات</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'orders' ? 'bg-amber-500 text-stone-950 font-black' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>الطلبات والشحن</span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'categories' ? 'bg-amber-500 text-stone-950 font-black' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>الأقسام</span>
            </button>
            <button
              onClick={() => setActiveTab('coupons')}
              className={`px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'coupons' ? 'bg-amber-500 text-stone-950 font-black' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>الكوبونات</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'settings' ? 'bg-amber-500 text-stone-950 font-black' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>الإعدادات</span>
            </button>
          </nav>

          <div className="flex items-center gap-2.5">
            {/* Direct Add Product CTA Button */}
            <button
              onClick={handleOpenAddProduct}
              className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
              title="إضافة منتج أو حذاء جديد للمتجر"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة منتج جديد</span>
            </button>

            <button
              onClick={onBackToStore}
              className="bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer"
            >
              معاينة المتجر
            </button>
            <button
              onClick={logoutAdmin}
              className="text-stone-400 hover:text-rose-400 p-2 transition cursor-pointer"
              title="تسجيل خروج المدير"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden bg-stone-800 p-2 flex overflow-x-auto gap-2 text-xs font-bold">
        {[
          { id: 'add_product', label: '+ إضافة منتج جديد ✨' },
          { id: 'products', label: 'المنتجات' },
          { id: 'dashboard', label: 'الإحصائيات' },
          { id: 'orders', label: 'الطلبات' },
          { id: 'categories', label: 'الأقسام' },
          { id: 'coupons', label: 'الكوبونات' },
          { id: 'settings', label: 'الإعدادات' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3 py-1.5 rounded-lg shrink-0 cursor-pointer ${
              activeTab === t.id ? 'bg-amber-500 text-stone-950 font-black' : 'text-stone-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">

        {/* ==========================================
            TAB: ADD PRODUCT (FIRST THING ADMIN SEES!)
        ========================================== */}
        {activeTab === 'add_product' && (
          <div className="space-y-6">
            <AddProductForm
              onSuccess={async () => {
                const res = await getAdminProducts();
                setProducts(res.products || []);
                setActiveTab('products');
              }}
            />
          </div>
        )}
        
        {/* ==========================================
            TAB 1: OVERVIEW / DASHBOARD
        ========================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Quick Action Add Product Banner */}
            <div className="bg-gradient-to-l from-stone-900 via-stone-850 to-stone-900 rounded-3xl p-6 sm:p-7 text-white border border-stone-750 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-lg">
              <div className="space-y-1.5 text-right">
                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-md inline-block">
                  إدارة المتجر السريعة
                </span>
                <h2 className="text-xl font-black text-white">إضافة حذاء أو كروكس جديد إلى المتجر</h2>
                <p className="text-xs text-stone-300 max-w-xl leading-relaxed">
                  ارفع صور الأحذية مباشرة من معرض هاتفك، حدد المقاسات المتاحة والمخزون، واضبط السعر للعملاء.
                </p>
              </div>
              <button
                onClick={handleOpenAddProduct}
                className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-black px-6 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-xl hover:shadow-amber-500/20 active:scale-95 transition cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة منتج الآن</span>
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-black text-stone-900">مؤشرات الأداء والمبيعات</h1>
                <p className="text-xs text-stone-500 mt-0.5">ملخص حي ومباشر من قاعدة بيانات PostgreSQL</p>
              </div>
              <button
                onClick={() => {
                  setLoadingDashboard(true);
                  getAdminDashboard().then(setDashboardData).finally(() => setLoadingDashboard(false));
                }}
                className="bg-white border border-stone-300 p-2 rounded-xl text-stone-700 hover:bg-stone-50 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingDashboard ? 'animate-spin' : ''}`} />
                <span>تحديث</span>
              </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
                <span className="text-xs font-bold text-stone-400">إجمالي المبيعات المحققة</span>
                <div className="text-2xl font-black text-stone-900">
                  {dashboardData?.totalSales || 0} <span className="text-sm font-bold text-amber-600">ج.م</span>
                </div>
                <span className="text-[11px] text-emerald-600 font-bold block">من الطلبات المسلمة والناجحة</span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
                <span className="text-xs font-bold text-stone-400">إجمالي عدد الطلبات</span>
                <div className="text-2xl font-black text-stone-900">
                  {dashboardData?.totalOrders || 0} <span className="text-sm font-bold text-stone-500">طلب</span>
                </div>
                <span className="text-[11px] text-amber-600 font-bold block">
                  {dashboardData?.todayOrders || 0} طلبات جديدة اليوم
                </span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
                <span className="text-xs font-bold text-stone-400">المنتجات المعروضة بالمتجر</span>
                <div className="text-2xl font-black text-stone-900">
                  {dashboardData?.totalProducts || 0} <span className="text-sm font-bold text-stone-500">موديل</span>
                </div>
                <span className="text-[11px] text-stone-400 block">في كافة الأقسام والتصنيفات</span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
                <span className="text-xs font-bold text-stone-400">تنبيهات نقص المخزون</span>
                <div className="text-2xl font-black text-rose-600">
                  {dashboardData?.lowStockVariants?.length || 0} <span className="text-sm font-bold text-stone-500">مقاس</span>
                </div>
                <span className="text-[11px] text-rose-600 font-bold block">متبقي 3 قطع أو أقل</span>
              </div>
            </div>

            {/* Low Stock Warning Section */}
            {dashboardData?.lowStockVariants && dashboardData.lowStockVariants.length > 0 && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-rose-800 font-black text-sm">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <span>تنبيه: مقاسات قريبة من النفاد (أقل من 3 قطع):</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {dashboardData.lowStockVariants.map((item: any) => (
                    <div key={item.id} className="bg-white p-3 rounded-xl border border-rose-200 text-xs flex justify-between items-center">
                      <div>
                        <span className="font-bold text-stone-900 block truncate max-w-[180px]">{item.product_name}</span>
                        <span className="text-stone-500 text-[11px]">مقاس: {item.size}</span>
                      </div>
                      <span className="bg-rose-100 text-rose-800 font-black px-2 py-1 rounded-md">
                        متبقي {item.stock}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Orders in Dashboard */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                <h3 className="font-black text-base text-stone-900">أحدث الطلبات المستلمة</h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-amber-600 font-bold hover:underline"
                >
                  عرض جميع الطلبات
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-400 font-bold">
                      <th className="py-2.5">رقم الطلب</th>
                      <th>العميل</th>
                      <th>الهاتف</th>
                      <th>المبلغ</th>
                      <th>الحالة</th>
                      <th>إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {dashboardData?.recentOrders?.map((ord: Order) => (
                      <tr key={ord.id} className="hover:bg-stone-50">
                        <td className="py-3 font-mono font-bold text-stone-900">{ord.order_number}</td>
                        <td className="font-semibold text-stone-800">{ord.customer_name}</td>
                        <td className="font-mono text-stone-500">{ord.customer_phone}</td>
                        <td className="font-bold text-amber-600">{ord.total_amount} ج.م</td>
                        <td>
                          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-bold text-[10px]">
                            {ord.status}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={async () => {
                              const details = await getAdminOrder(ord.id);
                              setSelectedOrderDetails(details);
                              setActiveTab('orders');
                            }}
                            className="text-stone-600 hover:text-stone-900 font-bold text-xs"
                          >
                            عرض
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 2: PRODUCTS MANAGEMENT
        ========================================== */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-stone-900">إدارة كتالوج الأحذية والمنتجات</h1>
                <p className="text-xs text-stone-500 mt-0.5">إضافة، تعديل الأسعار، التحكم في المقاسات والمخزون</p>
              </div>

              <button
                onClick={handleOpenAddProduct}
                className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-black px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md active:scale-95 transition"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة منتج جديد</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-stone-100 flex items-center justify-between">
                <div className="relative max-w-xs w-full">
                  <input
                    type="text"
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    placeholder="ابحث بالاسم أو الموديل..."
                    className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl py-2 pr-8 pl-3"
                  />
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>
                <span className="text-xs text-stone-400 font-semibold">إجمالي: {products.length} موديل</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold">
                      <th className="p-3">الصورة</th>
                      <th>الاسم بالعربية</th>
                      <th>القسم</th>
                      <th>السعر</th>
                      <th>المخزون الإجمالي</th>
                      <th>الحالة</th>
                      <th>الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {products
                      .filter((p) =>
                        searchProduct ? p.name_ar.includes(searchProduct) || p.sku?.includes(searchProduct) : true
                      )
                      .map((p) => (
                        <tr key={p.id} className="hover:bg-stone-50/80 transition">
                          <td className="p-3">
                            <img
                              src={p.primary_image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop&q=80'}
                              alt=""
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 rounded-lg object-cover bg-stone-100"
                            />
                          </td>
                          <td className="font-bold text-stone-900">
                            <div>{p.name_ar}</div>
                            <span className="text-[10px] text-stone-400 font-mono">{p.sku}</span>
                          </td>
                          <td className="text-stone-600">{p.category_name_ar || '-'}</td>
                          <td className="font-bold text-stone-900">
                            {p.price} ج.م
                            {p.discount_price && (
                              <span className="text-[10px] text-rose-600 block line-through">
                                {p.discount_price} ج.م
                              </span>
                            )}
                          </td>
                          <td>
                            <span className={`font-bold px-2 py-0.5 rounded-md ${
                              (p.total_stock || 0) <= 5 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {p.total_stock || 0} قطعة
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => handleToggleProduct(p.id)}
                              className={`text-xs font-bold px-2.5 py-1 rounded-full cursor-pointer ${
                                p.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                              }`}
                            >
                              {p.is_active ? 'نشط بالمتجر' : 'معطل'}
                            </button>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOpenEditProduct(p)}
                                className="p-1.5 text-stone-600 hover:text-amber-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                                title="تعديل المنتج"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                                title="حذف"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 3: ORDERS & SHIPPING
        ========================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-stone-900">إدارة طلبات الشحن والتوصيل</h1>
                <p className="text-xs text-stone-500 mt-0.5">متابعة شحنات العملاء، تأكيد الشحن، وتحصيل المبالغ عند الاستلام</p>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex gap-1.5 overflow-x-auto text-xs font-bold">
                {['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderFilterStatus(st)}
                    className={`px-3 py-1.5 rounded-lg shrink-0 cursor-pointer ${
                      orderFilterStatus === st ? 'bg-stone-900 text-amber-400' : 'bg-white text-stone-600 border border-stone-200'
                    }`}
                  >
                    {st === 'ALL' && 'الكل'}
                    {st === 'PENDING' && 'قيد المراجعة'}
                    {st === 'CONFIRMED' && 'تم التأكيد'}
                    {st === 'PROCESSING' && 'تجهيز'}
                    {st === 'SHIPPED' && 'تم الشحن'}
                    {st === 'DELIVERED' && 'تم التسليم'}
                    {st === 'CANCELLED' && 'ملغي'}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold">
                      <th className="p-3">رقم الطلب</th>
                      <th>تاريخ الطلب</th>
                      <th>اسم العميل</th>
                      <th>رقم الهاتف</th>
                      <th>العنوان</th>
                      <th>المبلغ الكلي</th>
                      <th>حالة الطلب</th>
                      <th>تحديث الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-stone-50">
                        <td className="p-3 font-mono font-bold text-stone-900">{ord.order_number}</td>
                        <td className="text-stone-500">{new Date(ord.created_at).toLocaleDateString('ar-EG')}</td>
                        <td className="font-bold text-stone-900">{ord.customer_name}</td>
                        <td className="font-mono text-stone-600">{ord.customer_phone}</td>
                        <td className="max-w-xs truncate text-stone-500" title={ord.shipping_address}>
                          {ord.shipping_address}
                        </td>
                        <td className="font-black text-amber-600">{ord.total_amount} ج.م</td>
                        <td>
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            ord.status === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.status === 'CANCELLED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {ord.status}
                          </span>
                        </td>
                        <td>
                          <select
                            value={ord.status}
                            onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                            className="text-xs bg-white border border-stone-300 rounded-lg p-1 font-semibold"
                          >
                            <option value="PENDING">قيد المراجعة</option>
                            <option value="CONFIRMED">تم التأكيد</option>
                            <option value="PROCESSING">جاري التجهيز</option>
                            <option value="SHIPPED">خرج مع المندوب</option>
                            <option value="DELIVERED">تم التسليم والتحصيل</option>
                            <option value="CANCELLED">إلغاء الطلب (إرجاع للمخزن)</option>
                            <option value="RETURNED">مرتجع</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 4: CATEGORIES
        ========================================== */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-black text-stone-900">إدارة تصنيفات وأقسام المتجر</h1>
            
            {/* Create Category */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
              <h3 className="font-bold text-sm text-stone-900">إضافة قسم جديد:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="اسم القسم بالعربية (مثل: كروكس طبية)"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="text-xs p-2.5 rounded-xl border border-stone-300"
                />
                <input
                  type="text"
                  placeholder="الرابط بالإنجليزية (Slug مثل: medical-crocs)"
                  value={newCategorySlug}
                  onChange={(e) => setNewCategorySlug(e.target.value)}
                  className="text-xs p-2.5 rounded-xl border border-stone-300"
                />
                <input
                  type="text"
                  placeholder="رابط صورة القسم (URL)"
                  value={newCategoryImage}
                  onChange={(e) => setNewCategoryImage(e.target.value)}
                  className="text-xs p-2.5 rounded-xl border border-stone-300"
                />
              </div>
              <button
                onClick={async () => {
                  if (!newCategoryName || !newCategorySlug) return;
                  await createAdminCategory({
                    name_ar: newCategoryName,
                    slug: newCategorySlug,
                    image_url: newCategoryImage || null,
                  });
                  const res = await getAdminCategories();
                  setCategories(res.categories || []);
                  setNewCategoryName('');
                  setNewCategorySlug('');
                  setNewCategoryImage('');
                }}
                className="bg-stone-900 text-amber-400 font-bold px-5 py-2 rounded-xl text-xs"
              >
                إضافة القسم
              </button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-white p-4 rounded-2xl border border-stone-200 space-y-2">
                  <span className="font-bold text-sm text-stone-900 block">{cat.name_ar}</span>
                  <span className="text-xs text-stone-400 block font-mono">{cat.slug}</span>
                  <div className="pt-2 border-t border-stone-100 flex justify-between items-center text-xs">
                    <span className="text-stone-500">{cat.product_count || 0} منتج</span>
                    <button
                      onClick={async () => {
                        if (!confirm('حذف هذا القسم؟')) return;
                        await deleteAdminCategory(cat.id);
                        setCategories((prev) => prev.filter((c) => c.id !== cat.id));
                      }}
                      className="text-rose-600 hover:text-rose-700 font-bold"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 5: COUPONS
        ========================================== */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-black text-stone-900">إدارة كوبونات الخصم الترويجية</h1>

            {/* Create Coupon */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
              <h3 className="font-bold text-sm text-stone-900">إنشاء كود خصم جديد:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="كود الخصم (مثل: EID20)"
                  value={newCouponForm.code}
                  onChange={(e) => setNewCouponForm({ ...newCouponForm, code: e.target.value.toUpperCase() })}
                  className="text-xs p-2.5 rounded-xl border border-stone-300 font-mono uppercase"
                />
                <select
                  value={newCouponForm.discount_type}
                  onChange={(e) => setNewCouponForm({ ...newCouponForm, discount_type: e.target.value })}
                  className="text-xs p-2.5 rounded-xl border border-stone-300"
                >
                  <option value="PERCENTAGE">نسبة مئوية (%)</option>
                  <option value="FIXED">مبلغ ثابت (ج.م)</option>
                </select>
                <input
                  type="number"
                  placeholder="قيمة الخصم"
                  value={newCouponForm.discount_value}
                  onChange={(e) => setNewCouponForm({ ...newCouponForm, discount_value: e.target.value })}
                  className="text-xs p-2.5 rounded-xl border border-stone-300"
                />
                <input
                  type="number"
                  placeholder="الحد الأدنى للطلب (ج.م)"
                  value={newCouponForm.min_order_amount}
                  onChange={(e) => setNewCouponForm({ ...newCouponForm, min_order_amount: e.target.value })}
                  className="text-xs p-2.5 rounded-xl border border-stone-300"
                />
              </div>
              <button
                onClick={async () => {
                  if (!newCouponForm.code) return;
                  await createAdminCoupon({
                    code: newCouponForm.code,
                    discount_type: newCouponForm.discount_type,
                    discount_value: Number(newCouponForm.discount_value),
                    min_order_amount: Number(newCouponForm.min_order_amount),
                    max_uses: Number(newCouponForm.max_uses),
                  });
                  const res = await getAdminCoupons();
                  setCoupons(res.coupons || []);
                  setNewCouponForm({
                    code: '',
                    discount_type: 'PERCENTAGE',
                    discount_value: '10',
                    min_order_amount: '0',
                    max_uses: '100',
                  });
                }}
                className="bg-stone-900 text-amber-400 font-bold px-5 py-2 rounded-xl text-xs"
              >
                إنشاء الكوبون
              </button>
            </div>

            {/* Coupons Table */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold">
                    <th className="p-3">الكود</th>
                    <th>نوع الخصم</th>
                    <th>القيمة</th>
                    <th>الحد الأدنى للطلب</th>
                    <th>مرات الاستخدام</th>
                    <th>الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {coupons.map((c) => (
                    <tr key={c.id} className="hover:bg-stone-50">
                      <td className="p-3 font-mono font-bold text-stone-900">{c.code}</td>
                      <td>{c.discount_type === 'PERCENTAGE' ? 'نسبة مئوية' : 'مبلغ ثابت'}</td>
                      <td className="font-bold text-amber-600">
                        {c.discount_value} {c.discount_type === 'PERCENTAGE' ? '%' : 'ج.م'}
                      </td>
                      <td>{c.min_order_amount} ج.م</td>
                      <td>{c.used_count} مرات</td>
                      <td>
                        <button
                          onClick={async () => {
                            if (!confirm('حذف هذا الكوبون؟')) return;
                            await deleteAdminCoupon(c.id);
                            setCoupons((prev) => prev.filter((item) => item.id !== c.id));
                          }}
                          className="text-rose-600 hover:text-rose-700 font-bold"
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 6: SETTINGS & SECURITY
        ========================================== */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-2xl">
            <h1 className="text-2xl font-black text-stone-900">إعدادات المتجر والأمان</h1>

            {settingsSavedMessage && (
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold">
                {settingsSavedMessage}
              </div>
            )}

            {/* General Settings */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
              <h3 className="font-bold text-sm text-stone-900">بيانات المتجر وخدمة العملاء:</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold block mb-1">اسم المتجر</label>
                  <input
                    type="text"
                    value={storeSettings.store_name || ''}
                    onChange={(e) => setStoreSettings({ ...storeSettings, store_name: e.target.value })}
                    className="w-full p-2 rounded-xl border border-stone-300"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">هاتف وواتساب خدمة العملاء</label>
                  <input
                    type="text"
                    value={storeSettings.contact_phone || ''}
                    onChange={(e) => setStoreSettings({ ...storeSettings, contact_phone: e.target.value })}
                    className="w-full p-2 rounded-xl border border-stone-300 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">شريط الإعلانات الترويجي (أعلى الموقع)</label>
                  <input
                    type="text"
                    value={storeSettings.announcement || ''}
                    onChange={(e) => setStoreSettings({ ...storeSettings, announcement: e.target.value })}
                    className="w-full p-2 rounded-xl border border-stone-300"
                  />
                </div>
              </div>
              <button
                onClick={async () => {
                  await updateAdminSettings(storeSettings);
                  setSettingsSavedMessage('تم حفظ إعدادات المتجر بنجاح!');
                  setTimeout(() => setSettingsSavedMessage(null), 2500);
                }}
                className="bg-stone-900 text-amber-400 font-bold px-5 py-2.5 rounded-xl text-xs"
              >
                حفظ التعديلات
              </button>
            </div>

            {/* Change Admin Password */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
              <h3 className="font-bold text-sm text-stone-900">تغيير كلمة مرور المدير (Security):</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold block mb-1">كلمة المرور الحالية</label>
                  <input
                    type="password"
                    value={currentAdminPassword}
                    onChange={(e) => setCurrentAdminPassword(e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-300"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">كلمة المرور الجديدة</label>
                  <input
                    type="password"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-300"
                  />
                </div>
              </div>
              <button
                onClick={async () => {
                  try {
                    await changeAdminPassword(currentAdminPassword, newAdminPassword);
                    alert('تم تغيير كلمة مرور المدير بنجاح!');
                    setCurrentAdminPassword('');
                    setNewAdminPassword('');
                  } catch (err: any) {
                    alert(err.message || 'فشل تغيير كلمة المرور');
                  }
                }}
                className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-black px-5 py-2.5 rounded-xl text-xs"
              >
                تحديث كلمة المرور
              </button>
            </div>

          </div>
        )}

      </main>

      {/* Product Edit / Create Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto text-right border border-stone-200 shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-stone-200 pb-4">
              <div>
                <h3 className="text-xl font-black text-stone-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-500" />
                  <span>{editingProductId ? 'تعديل بيانات الحذاء والموديل' : 'إضافة حذاء / كروكس جديد'}</span>
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  ارفع صور الموديل من معرض الهاتف، حدد المقاسات المتاحة والمخزون، واضبط السعر.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center cursor-pointer transition font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6 text-xs">
              
              {/* SECTION 1: BASIC INFO */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-stone-800 font-bold border-b border-stone-100 pb-1.5">
                  <Tag className="w-4 h-4 text-amber-500" />
                  <span>البيانات الأساسية للمنتج</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-stone-700 block">اسم الموديل بالعربية *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: شبشب كروكس طبي مبطن أسود خفيف"
                      value={productForm.name_ar}
                      onChange={(e) => setProductForm({ ...productForm, name_ar: e.target.value })}
                      className="w-full p-3 rounded-xl border border-stone-300 font-medium focus:ring-2 focus:ring-amber-500 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-stone-700 block">القسم والتصنيف *</label>
                    <select
                      value={productForm.category_id}
                      onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                      className="w-full p-3 rounded-xl border border-stone-300 font-bold bg-stone-50 focus:ring-2 focus:ring-amber-500 text-xs"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name_ar}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-stone-700 block">كود الموديل (SKU) *</label>
                    <input
                      type="text"
                      required
                      placeholder="FM-1001"
                      value={productForm.sku}
                      onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                      className="w-full p-3 rounded-xl border border-stone-300 font-mono font-bold focus:ring-2 focus:ring-amber-500 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-stone-700 block">السعر الأساسي (ج.م) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="350"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="w-full p-3 rounded-xl border border-stone-300 font-black text-stone-900 focus:ring-2 focus:ring-amber-500 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-stone-700 block">سعر الخصم / العرض (اختياري)</label>
                    <input
                      type="number"
                      placeholder="اتركه فارغاً إذا لا يوجد خصم"
                      value={productForm.discount_price}
                      onChange={(e) => setProductForm({ ...productForm, discount_price: e.target.value })}
                      className="w-full p-3 rounded-xl border border-stone-300 font-black text-rose-600 focus:ring-2 focus:ring-amber-500 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: PRODUCT IMAGES / GALLERY UPLOAD */}
              <div className="space-y-3 pt-2 border-t border-stone-200">
                <div className="flex items-center justify-between border-b border-stone-100 pb-1.5">
                  <div className="flex items-center gap-2 text-stone-800 font-bold">
                    <ImageIcon className="w-4 h-4 text-amber-500" />
                    <span>صور المنتج والمعرض (اختر من معرض الهاتف أو الجهاز)</span>
                  </div>
                  <span className="text-[11px] text-stone-500 font-bold">
                    {productForm.images?.length || 0} صور مضافة
                  </span>
                </div>

                {/* Upload Button Box */}
                <div className="bg-amber-50/60 border-2 border-dashed border-amber-300 rounded-2xl p-5 text-center space-y-3 hover:bg-amber-50 transition">
                  <label className="cursor-pointer block">
                    <div className="w-12 h-12 bg-amber-500 text-stone-950 rounded-2xl flex items-center justify-center mx-auto shadow-md mb-2">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="font-black text-sm text-stone-900 block">
                      اضغط هنا لاختيار صور الحذاء من معرض الهاتف أو الكمبيوتر
                    </span>
                    <span className="text-[11px] text-stone-500 block mt-1">
                      يمكنك اختيار عدة صور في وقت واحد (PNG, JPG, WebP)
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploadingImages}
                      className="hidden"
                    />
                  </label>

                  {isUploadingImages && (
                    <div className="inline-flex items-center gap-2 bg-amber-500 text-stone-950 font-bold px-4 py-2 rounded-xl text-xs shadow-sm">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري رفع وحفظ الصور من المعرض...</span>
                    </div>
                  )}
                </div>

                {/* Uploaded Images Grid */}
                {productForm.images && productForm.images.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-stone-600 block">
                      الصور المرفوعة (اضغط على أيقونة النجمة لجعل الصورة هي الصورة الرئيسية في المتجر):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {productForm.images.map((img: any, idx: number) => (
                        <div
                          key={idx}
                          className={`relative group bg-stone-50 rounded-2xl border-2 p-1.5 transition overflow-hidden ${
                            img.is_primary ? 'border-amber-500 shadow-md' : 'border-stone-200'
                          }`}
                        >
                          <img
                            src={img.image_url}
                            alt={`صورة ${idx + 1}`}
                            className="w-full h-24 object-cover rounded-xl"
                          />

                          {/* Primary Badge */}
                          {img.is_primary ? (
                            <span className="absolute top-2 right-2 bg-amber-500 text-stone-950 font-black text-[9px] px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                              <Star className="w-2.5 h-2.5 fill-stone-950" />
                              الرئيسية
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(idx)}
                              className="absolute top-2 right-2 bg-stone-900/80 hover:bg-stone-900 text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded-md opacity-90 hover:opacity-100 transition cursor-pointer"
                              title="تعيين كصورة رئيسية للمنتج"
                            >
                              تعيين رئيسية
                            </button>
                          )}

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute bottom-2 left-2 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-lg shadow-sm cursor-pointer transition"
                            title="حذف هذه الصورة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add image by URL fallback */}
                <div className="pt-2">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="أو أدخل رابط صورة مباشر (URL)..."
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      className="flex-1 p-2.5 rounded-xl border border-stone-300 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      disabled={!customImageUrl.trim()}
                      className="bg-stone-800 hover:bg-stone-900 disabled:opacity-40 text-stone-200 font-bold px-3 py-2 rounded-xl text-xs cursor-pointer transition"
                    >
                      إضافة رابط
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION 3: SIZES & VARIANTS SELECTOR */}
              <div className="space-y-3 pt-2 border-t border-stone-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-1.5">
                  <div className="flex items-center gap-2 text-stone-800 font-bold">
                    <SlidersHorizontal className="w-4 h-4 text-amber-500" />
                    <span>تحديد المقاسات المتوفرة والكميات</span>
                  </div>

                  {/* Preset quick buttons */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-stone-400 font-bold ml-1">تحديد سريع:</span>
                    <button
                      type="button"
                      onClick={() => applySizePreset('men')}
                      className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold px-2 py-1 rounded-lg text-[10px] cursor-pointer"
                    >
                      رجالي (41-45)
                    </button>
                    <button
                      type="button"
                      onClick={() => applySizePreset('women')}
                      className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold px-2 py-1 rounded-lg text-[10px] cursor-pointer"
                    >
                      حريمي (37-41)
                    </button>
                    <button
                      type="button"
                      onClick={() => applySizePreset('all')}
                      className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-2 py-1 rounded-lg text-[10px] cursor-pointer"
                    >
                      شامل (38-45)
                    </button>
                  </div>
                </div>

                {/* Quick Toggle Size Chips */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-stone-600 block">
                    اضغط على أي مقاس لإضافته أو إزالته:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {standardSizes.map((sz) => {
                      const isSelected = productForm.variants.some((v: any) => String(v.size) === String(sz));
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => toggleSize(sz)}
                          className={`w-11 h-11 rounded-xl font-black text-sm flex items-center justify-center cursor-pointer transition border ${
                            isSelected
                              ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-sm scale-105'
                              : 'bg-white text-stone-600 border-stone-300 hover:border-stone-400 hover:bg-stone-50'
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Configured Sizes Details Grid */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-stone-700">
                      المقاسات المحددة حالياً ({productForm.variants.length} مقاس):
                    </span>
                  </div>

                  {productForm.variants.length === 0 ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-center text-amber-800 font-bold text-xs">
                      لم يتم تحديد أي مقاس بعد! اضغط على المقاسات بالأعلى لتفعيلها.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {productForm.variants.map((v: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl border border-stone-200"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-stone-900 text-amber-400 font-black text-xs flex items-center justify-center">
                              {v.size}
                            </span>
                            <div>
                              <span className="text-[10px] text-stone-500 font-bold block">الكمية بالمخزن:</span>
                              <input
                                type="number"
                                min="0"
                                value={v.stock}
                                onChange={(e) => {
                                  const updated = [...productForm.variants];
                                  updated[idx].stock = e.target.value;
                                  setProductForm({ ...productForm, variants: updated });
                                }}
                                className="w-16 p-1 bg-white border border-stone-300 rounded-md font-black text-center text-xs"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              placeholder="اللون (اختياري)"
                              value={v.color || ''}
                              onChange={(e) => {
                                const updated = [...productForm.variants];
                                updated[idx].color = e.target.value;
                                setProductForm({ ...productForm, variants: updated });
                              }}
                              className="w-20 p-1 bg-white border border-stone-300 rounded-md text-[11px] text-center"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = productForm.variants.filter((_: any, i: number) => i !== idx);
                                setProductForm({ ...productForm, variants: updated });
                              }}
                              className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer transition"
                              title="إزالة المقاس"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Custom Size Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="مقاس مخصص آخر (مثلاً: 47 أو 36 أو فري سايز)..."
                      value={customSizeInput}
                      onChange={(e) => setCustomSizeInput(e.target.value)}
                      className="max-w-xs p-2 rounded-xl border border-stone-300 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomSize}
                      disabled={!customSizeInput.trim()}
                      className="bg-stone-800 hover:bg-stone-900 disabled:opacity-40 text-stone-200 font-bold px-3 py-2 rounded-xl text-xs cursor-pointer transition flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة مقاس مخصص</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION 4: DESCRIPTION & TAGS */}
              <div className="space-y-3 pt-2 border-t border-stone-200">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 block">الوصف التفصيلي والمميزات الطبية</label>
                  <textarea
                    rows={3}
                    placeholder="اكتب مواصفات المنتج، الراحة، خامة النعل، التهوية، الملمس..."
                    value={productForm.description_ar}
                    onChange={(e) => setProductForm({ ...productForm, description_ar: e.target.value })}
                    className="w-full p-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 text-xs leading-relaxed"
                  />
                </div>

                <div className="flex flex-wrap gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-800">
                    <input
                      type="checkbox"
                      checked={productForm.is_featured}
                      onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
                      className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                    />
                    <span>عرض في قسم "المميز والمختار"</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-800">
                    <input
                      type="checkbox"
                      checked={productForm.is_bestseller}
                      onChange={(e) => setProductForm({ ...productForm, is_bestseller: e.target.checked })}
                      className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                    />
                    <span>وضع شارة "الأكثر طلباً ومبيعاً"</span>
                  </label>
                </div>
              </div>

              {/* MODAL ACTIONS */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 font-bold text-stone-700 cursor-pointer transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-black px-7 py-2.5 rounded-xl shadow-md cursor-pointer transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingProductId ? 'حفظ التعديلات' : 'نشر المنتج بالمتجر الآن'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
