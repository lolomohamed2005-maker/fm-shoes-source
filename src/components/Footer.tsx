import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  Lock,
  MessageCircle,
  Download,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  onNavigate: (view: string, param?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-8 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Trust Badges Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-stone-800">
          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-stone-800/50">
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">شحن سريع لكافة المحافظات</h4>
              <p className="text-xs text-stone-400 mt-0.5">توصيل خلال 2-4 أيام عمل حتى باب منزلك</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-stone-800/50">
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">معاينة قبل الاستلام</h4>
              <p className="text-xs text-stone-400 mt-0.5">افتح الشحنة وتأكد من المقاس قبل دفع أي مبلغ</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-stone-800/50">
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">استبدال واسترجاع سهل</h4>
              <p className="text-xs text-stone-400 mt-0.5">إمكانية تغيير المقاس أو الاسترجاع خلال 14 يوماً</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-stone-800/50">
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">خامات طبية ومريحة</h4>
              <p className="text-xs text-stone-400 mt-0.5">نعل طبي مرن مضاد للانزلاق ومقاوم للبكتيريا</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo size="lg" lightText={true} />
            <p className="text-sm text-stone-400 leading-relaxed max-w-sm">
              متجر FM Shoes & Clogs للأحذية والسليبرز والكلوجز الطبية المريحة. نوفر أحدث الموديلات العصرية بنعل مريح يدعم راحة قدميك طوال اليوم، مع خدمة المعاينة والدفع عند الاستلام.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs font-semibold text-stone-400">وسائل الدفع:</span>
              <span className="px-2.5 py-1 bg-stone-800 text-amber-400 rounded text-xs font-bold border border-stone-700">
                الدفع عند الاستلام (COD)
              </span>
              <span className="px-2.5 py-1 bg-stone-800 text-stone-300 rounded text-xs font-bold border border-stone-700">
                المحافظ الإلكترونية
              </span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h5 className="text-sm font-bold text-white mb-4">التصنيفات الشائعة</h5>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li>
                <button
                  onClick={() => onNavigate('catalog', { category: 'crocs' })}
                  className="hover:text-amber-400 transition cursor-pointer"
                >
                  كلوجز وكروكس طبية
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog', { category: 'slippers' })}
                  className="hover:text-amber-400 transition cursor-pointer"
                >
                  سليبرز وشباشب مريحة
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog', { category: 'sandals' })}
                  className="hover:text-amber-400 transition cursor-pointer"
                >
                  صنادل صيفية خفيفة
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog', { category: 'shoes' })}
                  className="hover:text-amber-400 transition cursor-pointer"
                >
                  أحذية رياضية وسنيكرز
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog', { category: 'all' })}
                  className="hover:text-amber-400 transition cursor-pointer"
                >
                  تصفح جميع المنتجات
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h5 className="text-sm font-bold text-white mb-4">خدمة العملاء</h5>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li>
                <button
                  onClick={() => onNavigate('tracking')}
                  className="hover:text-amber-400 transition cursor-pointer"
                >
                  تتبع حالة الطلب
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('account')}
                  className="hover:text-amber-400 transition cursor-pointer"
                >
                  حسابي وسجل الطلبات
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('account', { tab: 'wishlist' })}
                  className="hover:text-amber-400 transition cursor-pointer"
                >
                  قائمة الرغبات
                </button>
              </li>
              <li>
                <span className="text-stone-400">ضمان الاستبدال 14 يوم</span>
              </li>
              <li>
                <span className="text-stone-400">معاينة قبل دفع المبلغ</span>
              </li>
            </ul>
          </div>

          {/* Contact Details with both phone numbers */}
          <div>
            <h5 className="text-sm font-bold text-white mb-4">أرقام خدمة العملاء</h5>
            <ul className="space-y-3 text-sm text-stone-400">
              <li>
                <a
                  href="tel:01010574689"
                  className="flex items-center gap-2.5 text-stone-200 hover:text-amber-400 transition font-mono font-bold"
                >
                  <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>01010574689</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:01055753006"
                  className="flex items-center gap-2.5 text-stone-200 hover:text-amber-400 transition font-mono font-bold"
                >
                  <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>01055753006</span>
                </a>
              </li>
              <li className="flex items-center gap-3 pt-1">
                <a
                  href="https://wa.me/201010574689"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700/60 hover:bg-emerald-600 text-emerald-100 rounded-lg text-xs font-bold transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>واتساب 1</span>
                </a>
                <a
                  href="https://wa.me/201055753006"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700/60 hover:bg-emerald-600 text-emerald-100 rounded-lg text-xs font-bold transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>واتساب 2</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>support@fm-shoes.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>القاهرة، جمهورية مصر العربية</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar with Admin Link */}
        <div className="pt-8 mt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            جميع الحقوق محفوظة &copy; {new Date().getFullYear()} متجر FM للأحذية (FM Shoes & Clogs).
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="/download-source-zip"
              download="fm-shoes-source-code.zip"
              className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition cursor-pointer font-bold bg-stone-800/80 hover:bg-stone-800 px-3 py-1.5 rounded-lg border border-amber-500/20"
              title="تحميل الأكواد الكاملة للمشروع في ملف مضغوط ZIP"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل سورس كود الموقع (ZIP)</span>
            </a>

            <button
              onClick={() => onNavigate('admin')}
              className="flex items-center gap-1 text-stone-400 hover:text-amber-400 transition cursor-pointer font-medium"
              title="دخول المسؤولين لإدارة المنتجات والطلبات"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>دخول لوحة تحكم المسؤول (Admin Portal)</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
