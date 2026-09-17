import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Package,
  ArrowLeft,
  Truck,
  PhoneCall,
  Clock,
} from 'lucide-react';

interface OrderSuccessViewProps {
  orderNumber: string;
  onTrackOrder: (orderNum: string) => void;
  onReturnHome: () => void;
}

export const OrderSuccessView: React.FC<OrderSuccessViewProps> = ({
  orderNumber,
  onTrackOrder,
  onReturnHome,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 shadow-xl space-y-8">
        
        {/* Animated Badge */}
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
            تم تسجيل طلبك بنجاح!
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
            شكراً لثقتك في متجر FM للأحذية (FM Shoes & Clogs)
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
            تم استلام تفاصيل طلبك بنجاح وجاري البدء في تجهيز الأحذية وتغليفها للشحن.
          </p>
        </div>

        {/* Order Number Card */}
        <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200/80 max-w-md mx-auto space-y-2">
          <span className="text-xs text-stone-500 font-medium block">رقم الطلب الخاص بك:</span>
          <div className="flex items-center justify-center gap-3">
            <span className="text-xl sm:text-2xl font-black text-stone-900 font-mono tracking-wider">
              {orderNumber}
            </span>
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg bg-stone-200 text-stone-700 hover:bg-stone-300 transition cursor-pointer"
              title="نسخ رقم الطلب"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <span className="text-[11px] text-stone-400 block">
            احتفظ بهذا الرقم لتتبع حالة ومسار شحنتك حتى الاستلام
          </span>
        </div>

        {/* Step-by-Step Delivery Roadmap */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-right">
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold text-xs mb-2">
              1
            </div>
            <h4 className="text-xs font-bold text-stone-900">المراجعة والتأكيد</h4>
            <p className="text-[11px] text-stone-500">
              سيتم تأكيد مقاسات الأحذية وعنوانك خلال دقائق لتجهيز الشحنة فوراً.
            </p>
          </div>

          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold text-xs mb-2">
              2
            </div>
            <h4 className="text-xs font-bold text-stone-900">الشحن مع المندوب</h4>
            <p className="text-[11px] text-stone-500">
              تصلك الشحنة خلال 2 إلى 4 أيام عمل لكافة محافظات مصر.
            </p>
          </div>

          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold text-xs mb-2">
              3
            </div>
            <h4 className="text-xs font-bold text-stone-900">المعاينة ثم الدفع</h4>
            <p className="text-[11px] text-stone-500">
              عاين المنتج وقس الحذاء قبل سداد المبلغ نقداً لمندوب الشحن.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-stone-100">
          <button
            onClick={() => onTrackOrder(orderNumber)}
            className="w-full sm:w-auto bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold px-7 py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <Package className="w-4 h-4" />
            <span>تتبع حالة هذا الطلب الآن</span>
          </button>

          <button
            onClick={onReturnHome}
            className="w-full sm:w-auto bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold px-6 py-3.5 rounded-xl text-xs transition cursor-pointer"
          >
            العودة للصفحة الرئيسية
          </button>
        </div>

        {/* Customer Service Notice with both numbers */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-stone-600 pt-3">
          <div className="flex items-center gap-1.5">
            <PhoneCall className="w-4 h-4 text-amber-600" />
            <span>خدمة العملاء والواتساب:</span>
          </div>
          <div className="flex items-center gap-3 font-mono font-bold">
            <a href="tel:01010574689" className="text-stone-900 hover:text-amber-600">01010574689</a>
            <span>-</span>
            <a href="tel:01055753006" className="text-stone-900 hover:text-amber-600">01055753006</a>
          </div>
        </div>

      </div>
    </div>
  );
};
