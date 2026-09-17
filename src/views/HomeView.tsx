import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Truck,
  ShieldCheck,
  RotateCcw,
  Footprints,
  Star,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { Product, Category, StoreSettings } from '../types';
import { getHomeData } from '../services/api';
import { ProductCard } from '../components/ProductCard';

interface HomeViewProps {
  onNavigate: (view: string, param?: any) => void;
  onViewProduct: (product: Product) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onViewProduct }) => {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getHomeData();
        setFeatured(data.featured || []);
        setBestsellers(data.bestsellers || []);
        setCategories(data.categories || []);
        setSettings(data.settings || {});
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-stone-900 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-4 shadow-2xl border border-stone-800">
        <div className="absolute inset-0 bg-radial-gradient from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 py-16 sm:py-24 lg:py-28 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-6 text-right">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-400/30 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>تشكيلة الموسم الجديد 2025</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
              خطوتك تبدأ من الراحة <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-amber-300 via-amber-400 to-amber-200">
                أحذية وكروكس وسليبرز طبية
              </span>
            </h1>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-xl">
              اكتشف تشكيلتنا الحصرية من الكروكس الطبية، الشباشب الصيفية، والصنادل الجلدية المريحة. تصاميم تدعم راحة قدميك طوال اليوم مع خدمة الدفع عند الاستلام والمعاينة قبل الدفع.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('catalog', { category: 'all' })}
                className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-black px-7 py-3.5 rounded-xl text-sm transition-all shadow-lg hover:shadow-amber-500/20 active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <span>تسوق الآن</span>
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('catalog', { category: 'crocs' })}
                className="bg-stone-800 hover:bg-stone-700 text-white font-bold px-6 py-3.5 rounded-xl text-sm border border-stone-700 transition cursor-pointer"
              >
                كولكشن الكروكس
              </button>
            </div>

            {/* Micro Guarantees */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-stone-800/80 text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>دفع عند الاستلام</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>معاينة قبل الدفع</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>استبدال 14 يوم</span>
              </div>
            </div>
          </div>

          {/* Hero Image Showcase */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-stone-800">
              <img
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80"
                alt="أحذية FM Shoes & Clogs"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
              
              {/* Floating Badge */}
              <div className="absolute bottom-6 right-6 bg-stone-900/90 backdrop-blur-md border border-stone-700 p-3.5 rounded-2xl flex items-center gap-3 text-right">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">خصم حتى 30%</span>
                  <span className="text-[11px] text-stone-400">على تشكيلة الصيف الجديدة</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900">تسوق حسب التصنيف</h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              اختر القسم المفضل لديك وتصفح المقاسات والموديلات المتوفرة
            </p>
          </div>
          <button
            onClick={() => onNavigate('catalog', { category: 'all' })}
            className="text-xs sm:text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
          >
            <span>عرض الجميع</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate('catalog', { category: cat.slug })}
              className="group relative h-48 sm:h-56 rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <img
                src={
                  cat.image_url ||
                  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80'
                }
                alt={cat.name_ar}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/30 to-transparent" />
              
              <div className="absolute inset-x-0 bottom-0 p-4 text-right">
                <span className="text-white font-bold text-base sm:text-lg block group-hover:text-amber-400 transition-colors">
                  {cat.name_ar}
                </span>
                <span className="text-[11px] text-stone-300 mt-0.5 block">
                  {cat.product_count !== undefined ? `${cat.product_count} موديل متاح` : 'تصفح الآن'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Collection */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900">الموديلات المميزة</h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              مختارات خاصة من أفضل الأحذية مبيعاً والأعلى تقييماً من عملائنا
            </p>
          </div>
          <button
            onClick={() => onNavigate('catalog', { featured: 'true' })}
            className="text-xs sm:text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
          >
            <span>شاهد المزيد</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-72 bg-stone-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featured.slice(0, 8).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewProduct={onViewProduct}
              />
            ))}
          </div>
        )}
      </section>

      {/* Promo Banner Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-stone-950 rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 text-right">
          <div className="space-y-3">
            <span className="bg-stone-950 text-white font-black text-xs px-3 py-1 rounded-full inline-block">
              كوبون ترويجي حصري
            </span>
            <h3 className="text-2xl sm:text-3xl font-black leading-tight text-stone-950">
              احصل على خصم 10% إضافي على طلبك الأول!
            </h3>
            <p className="text-stone-900 font-medium text-xs sm:text-sm max-w-lg">
              استخدم الكود <strong>FM10</strong> عند إتمام الطلب لتطبيق الخصم فوراً، بالإضافة لشحن مجاني للطلبات فوق 1000 ج.م.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <div className="border-2 border-dashed border-stone-950 px-6 py-3 rounded-2xl text-lg font-black tracking-wider bg-amber-400/50 font-mono">
              FM10
            </div>
            <button
              onClick={() => onNavigate('catalog', { category: 'all' })}
              className="bg-stone-950 hover:bg-stone-800 text-amber-400 font-bold px-6 py-3.5 rounded-2xl text-xs transition cursor-pointer"
            >
              تسوق واستخدم الكود
            </button>
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500" />
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900">الأكثر طلباً ومبيعاً</h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              المنتجات المفضلة لدى عملائنا في القاهرة وجميع المحافظات
            </p>
          </div>
          <button
            onClick={() => onNavigate('catalog', { bestseller: 'true' })}
            className="text-xs sm:text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
          >
            <span>تصفح الأكثر مبيعاً</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestsellers.slice(0, 8).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewProduct={onViewProduct}
            />
          ))}
        </div>
      </section>

      {/* Customer Trust & Reviews Snippet */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-stone-50 rounded-3xl p-8 sm:p-12 border border-stone-200/80">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-amber-600 font-bold text-xs uppercase tracking-wider">
              آراء عملائنا
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
              ماذا يقول عملاء متجر FM؟
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              أكثر من 5,000 عميل سعيد في جميع أنحاء مصر
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-right">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-stone-700 leading-relaxed">
                "الكروكس الطبي خفيف جداً ومريح في المشي لساعات طويلة في الشغل، التوصيل كان خلال يومين فقط والمندوب سمح لي أعاين المقاس قبل الدفع."
              </p>
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="font-bold text-stone-900">محمد إبراهيم</span>
                <span className="text-stone-400">القاهرة</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-stone-700 leading-relaxed">
                "السليبر الجلد الطبيعي خاماته ممتازة ومطابق للصور بنسبة 100%. شكراً لخدمة العملاء المحترمة على سرعة الاستجابة."
              </p>
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="font-bold text-stone-900">أحمد الشناوي</span>
                <span className="text-stone-400">الإسكندرية</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-stone-700 leading-relaxed">
                "سنيكرز المشي مريح جداً ونعله طري وما بيتعبش الضهر، تجربة شراء ممتازة وهطلب منهم تاني بالتأكيد."
              </p>
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="font-bold text-stone-900">محمود عبد الرحمن</span>
                <span className="text-stone-400">المنصورة</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
