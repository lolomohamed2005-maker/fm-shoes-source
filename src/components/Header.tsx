import React, { useState } from 'react';
import {
  ShoppingBag,
  Heart,
  Search,
  User as UserIcon,
  ShieldCheck,
  Package,
  Menu,
  X,
  Sparkles,
  PhoneCall,
  SlidersHorizontal,
  Plus,
  Download,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, param?: any) => void;
  onSearch: (query: string) => void;
  activeCategory?: string;
  onSelectCategory?: (categorySlug: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onSearch,
  activeCategory,
  onSelectCategory,
}) => {
  const { itemCount, subtotal, openCart } = useCart();
  const { wishlistIds } = useWishlist();
  const { customer, admin, isAdminAuthenticated } = useAuth();

  const isAnyAdmin = Boolean(
    isAdminAuthenticated ||
    admin ||
    customer?.role === 'SUPER_ADMIN' ||
    customer?.role === 'ADMIN' ||
    customer?.phone === '01010574689'
  );

  const [searchInput, setSearchInput] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
      onNavigate('catalog', { search: searchInput.trim() });
    }
  };

  const navCategories = [
    { name: 'الرئيسية', slug: 'home', view: 'home' },
    { name: 'كل المنتجات', slug: 'all', view: 'catalog' },
    { name: 'كروكس (Crocs)', slug: 'crocs', view: 'catalog' },
    { name: 'سليبرز وشباشب', slug: 'slippers', view: 'catalog' },
    { name: 'صنادل صيفية', slug: 'sandals', view: 'catalog' },
    { name: 'أحذية رياضية', slug: 'shoes', view: 'catalog' },
    { name: 'العروض والتخفيضات', slug: 'offers', view: 'catalog' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white text-xs py-2 px-4 text-center font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden md:flex items-center gap-3 text-stone-300">
            <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-sans">
              خدمة العملاء: <a href="tel:01010574689" className="hover:text-amber-400 font-bold">01010574689</a> - <a href="tel:01055753006" className="hover:text-amber-400 font-bold">01055753006</a>
            </span>
          </div>

          <div className="flex-1 text-center flex items-center justify-center gap-2">
            <span className="inline-block bg-amber-500 text-stone-950 font-bold px-2 py-0.5 rounded text-[10px]">
              عرض الترحيب
            </span>
            <span>شحن مجاني لكافة المحافظات عند الطلب بـ 1000 ج.م فأكثر! كود الخصم: <strong>FM10</strong></span>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a
              href="/download-source-zip"
              download="fm-shoes-source-code.zip"
              className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded text-xs transition flex items-center gap-1.5 font-bold cursor-pointer"
              title="تحميل جميع ملفات وأكواد الموقع كاملة بصيغة ZIP"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>تحميل الكود (ZIP)</span>
            </a>
            <span className="text-stone-600">|</span>
            <button
              onClick={() => onNavigate('tracking')}
              className="text-stone-300 hover:text-white transition flex items-center gap-1 cursor-pointer"
            >
              <Package className="w-3.5 h-3.5" />
              <span>تتبع شحنتك</span>
            </button>
            <span className="text-stone-600">|</span>
            <button
              onClick={() => onNavigate('admin')}
              className="text-amber-400 hover:text-amber-300 transition flex items-center gap-1 font-semibold cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>بوابة الإدارة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-stone-700 hover:bg-stone-100"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <button
              onClick={() => onNavigate('home')}
              className="flex items-center text-right group cursor-pointer"
            >
              <BrandLogo size="md" />
            </button>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-xl mx-4 relative"
          >
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="ابحث عن سليبر، كروكس طبي، صندل رجالي، سنيكرز، أو كود الموديل..."
              className="w-full bg-stone-100 border border-stone-300 rounded-full py-2.5 pr-11 pl-24 text-sm text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all shadow-inner"
            />
            <Search className="w-5 h-5 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-stone-900 text-white hover:bg-stone-800 px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer"
            >
              بحث
            </button>
          </form>

          {/* Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Order Tracking (Mobile/Tablet icon) */}
            <button
              onClick={() => onNavigate('tracking')}
              title="تتبع حالة طلبك"
              className="p-2.5 rounded-full text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition relative cursor-pointer"
            >
              <Package className="w-5 h-5" />
            </button>

            {/* Wishlist Icon */}
            <button
              onClick={() => onNavigate('account', { tab: 'wishlist' })}
              title="قائمة المفضلة"
              className="p-2.5 rounded-full text-stone-700 hover:text-rose-600 hover:bg-rose-50 transition relative cursor-pointer"
            >
              <Heart className="w-5 h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute 1 top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {wishlistIds.length}
                </span>
              )}
            </button>

            {/* User Account Icon */}
            <button
              onClick={() => onNavigate('account')}
              title={customer ? `أهلاً، ${customer.name}` : 'حسابي / تسجيل الدخول'}
              className="flex items-center gap-1.5 p-2 rounded-full text-stone-700 hover:bg-stone-100 transition cursor-pointer"
            >
              <UserIcon className="w-5 h-5" />
              <span className="hidden xl:inline-block text-xs font-semibold max-w-[90px] truncate">
                {customer ? customer.name.split(' ')[0] : 'تسجيل دخول'}
              </span>
            </button>

            {/* Admin Quick Add Product Button */}
            {isAnyAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-black px-3.5 py-2 rounded-full text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer"
                title="إضافة منتج جديد للمتجر كأدمن"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden md:inline">إضافة منتج</span>
              </button>
            )}

            {/* Cart Icon & Button */}
            <button
              onClick={openCart}
              className="flex items-center gap-2.5 bg-stone-900 hover:bg-stone-800 text-white px-3.5 py-2 rounded-full transition shadow-sm cursor-pointer"
              title="سلة التسوق"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-500 text-stone-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {itemCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-right leading-none">
                <span className="text-[10px] text-stone-400 font-medium">السلة</span>
                <span className="text-xs font-bold text-amber-400">{subtotal} ج.م</span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <form onSubmit={handleSearchSubmit} className="md:hidden pb-3">
          <div className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="ابحث عن الأحذية أو الكروكس..."
              className="w-full bg-stone-100 border border-stone-300 rounded-full py-2 pr-10 pl-4 text-xs text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
            <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        </form>

        {/* Secondary Category Navigation Bar */}
        <nav className="hidden lg:flex items-center space-x-reverse space-x-1 border-t border-stone-100 py-2.5 text-sm font-medium">
          {navCategories.map((cat) => {
            const isActive =
              (cat.view === 'home' && currentView === 'home') ||
              (cat.view === 'catalog' && currentView === 'catalog' && activeCategory === cat.slug);

            return (
              <button
                key={cat.slug}
                onClick={() => {
                  if (cat.view === 'home') {
                    onNavigate('home');
                  } else {
                    if (onSelectCategory) onSelectCategory(cat.slug);
                    onNavigate('catalog', { category: cat.slug });
                  }
                }}
                className={`px-3.5 py-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-stone-900 text-amber-400 font-bold shadow-xs'
                    : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex">
          <div className="w-4/5 max-w-xs bg-white h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-4">
                <span className="text-xl font-black text-stone-900">أقسام المتجر</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-stone-500 hover:text-stone-900"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-1">
                {navCategories.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (cat.view === 'home') {
                        onNavigate('home');
                      } else {
                        if (onSelectCategory) onSelectCategory(cat.slug);
                        onNavigate('catalog', { category: cat.slug });
                      }
                    }}
                    className="w-full text-right px-4 py-3 rounded-lg text-sm font-semibold text-stone-800 hover:bg-amber-50 hover:text-amber-800 transition"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-stone-200 space-y-3">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                <span className="font-bold text-stone-700 block mb-1">خدمة العملاء والواتساب:</span>
                <div className="space-y-1 font-mono">
                  <a href="tel:01010574689" className="flex items-center gap-1.5 text-stone-900 font-bold hover:text-amber-600">
                    <PhoneCall className="w-3.5 h-3.5 text-amber-500" />
                    <span>01010574689</span>
                  </a>
                  <a href="tel:01055753006" className="flex items-center gap-1.5 text-stone-900 font-bold hover:text-amber-600">
                    <PhoneCall className="w-3.5 h-3.5 text-amber-500" />
                    <span>01055753006</span>
                  </a>
                </div>
              </div>

              <a
                href="/download-source-zip"
                download="fm-shoes-source-code.zip"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-amber-900 hover:bg-amber-100 transition"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-amber-700" />
                  <span>تحميل كود الموقع كاملاً (ZIP)</span>
                </div>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-mono">ZIP</span>
              </a>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('tracking');
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-stone-100 rounded-lg text-xs font-bold text-stone-800"
              >
                <span>تتبع طلبك بالرقم</span>
                <Package className="w-4 h-4 text-stone-600" />
              </button>

              {isAnyAdmin && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('admin');
                  }}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg text-xs font-black shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span>إضافة منتج جديد (أدمن)</span>
                  </div>
                  <Sparkles className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('admin');
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-stone-900 text-amber-400 rounded-lg text-xs font-bold cursor-pointer"
              >
                <span>لوحة تحكم الإدارة</span>
                <ShieldCheck className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
};
