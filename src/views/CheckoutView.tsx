import React, { useState } from 'react';
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  Tag,
  AlertCircle,
  ArrowRight,
  Phone,
  User as UserIcon,
  MapPin,
  Building,
  FileText,
  Lock,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder, validateCoupon } from '../services/api';

interface CheckoutViewProps {
  onOrderSuccess: (orderNumber: string) => void;
  onBackToCart: () => void;
}

const EGYPTIAN_GOVERNORATES = [
  { name: 'القاهرة', shipping: 45 },
  { name: 'الجيزة', shipping: 45 },
  { name: 'الإسكندرية', shipping: 50 },
  { name: 'القليوبية', shipping: 50 },
  { name: 'الشرقية', shipping: 50 },
  { name: 'الدقهلية (المنصورة)', shipping: 50 },
  { name: 'الغربية (طنطا)', shipping: 50 },
  { name: 'المنوفية', shipping: 50 },
  { name: 'دمياط', shipping: 50 },
  { name: 'كفر الشيخ', shipping: 55 },
  { name: 'البحيرة', shipping: 55 },
  { name: 'بورسعيد', shipping: 55 },
  { name: 'الإسماعيلية', shipping: 55 },
  { name: 'السويس', shipping: 55 },
  { name: 'الفيوم', shipping: 60 },
  { name: 'بني سويف', shipping: 60 },
  { name: 'المنيا', shipping: 65 },
  { name: 'أسيوط', shipping: 65 },
  { name: 'سوهاج', shipping: 70 },
  { name: 'قنا', shipping: 70 },
  { name: 'الأقصر', shipping: 75 },
  { name: 'أسوان', shipping: 75 },
  { name: 'مطروح والساحل الشمالي', shipping: 70 },
  { name: 'البحر الأحمر (الغردقة)', shipping: 80 },
  { name: 'جنوب سيناء (شرم الشيخ)', shipping: 85 },
];

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  onOrderSuccess,
  onBackToCart,
}) => {
  const {
    items,
    subtotal,
    freeShippingThreshold,
    isFreeShipping,
    appliedCoupon,
    applyCouponCode,
    removeCoupon,
    clear,
  } = useCart();
  const { customer } = useAuth();

  // Form State
  const [customerName, setCustomerName] = useState(customer?.name || '');
  const [customerPhone, setCustomerPhone] = useState(customer?.phone || '');
  const [customerAltPhone, setCustomerAltPhone] = useState('');
  const [selectedGov, setSelectedGov] = useState('القاهرة');
  const [cityArea, setCityArea] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Coupon state in checkout
  const [checkoutCoupon, setCheckoutCoupon] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const currentGovObj = EGYPTIAN_GOVERNORATES.find((g) => g.name === selectedGov);
  const baseShippingCost = isFreeShipping ? 0 : (currentGovObj?.shipping || 45);
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount) + baseShippingCost;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutCoupon.trim()) return;
    setCouponError(null);
    const success = await applyCouponCode(checkoutCoupon.trim());
    if (success) {
      setCheckoutCoupon('');
    } else {
      setCouponError('كود الخصم غير صحيح أو منتهي الصلاحية');
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validation
    if (!customerName.trim() || !customerPhone.trim() || !addressLine.trim()) {
      setSubmitError('يرجى ملء جميع الحقول الإلزامية (الاسم، رقم الهاتف، والعنوان بالتفصيل)');
      return;
    }

    // Egyptian phone check (roughly 11 digits starting with 01)
    const phoneClean = customerPhone.replace(/\s+/g, '');
    if (!/^01[0125][0-9]{8}$/.test(phoneClean)) {
      setSubmitError('يرجى إدخال رقم هاتف مصري صحيح مكون من 11 رقماً (مثال: 010XXXXXXXX)');
      return;
    }

    setIsSubmitting(true);
    try {
      const fullShippingAddress = `${selectedGov} - ${cityArea ? `${cityArea} - ` : ''}${addressLine}`;
      const payload = {
        customer_name: customerName.trim(),
        customer_phone: phoneClean,
        customer_alt_phone: customerAltPhone.trim() || undefined,
        shipping_address: fullShippingAddress,
        notes: orderNotes.trim() || undefined,
        coupon_code: appliedCoupon ? appliedCoupon.code : undefined,
      };

      const res = await createOrder(payload);
      await clear(); // Empty the cart
      onOrderSuccess(res.orderNumber);
    } catch (err: any) {
      setSubmitError(err.message || 'فشل تسجيل الطلب، يرجى المحاولة مرة أخرى');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-stone-900">سلتك فارغة حالياً</h2>
        <p className="text-xs text-stone-500">لا توجد منتجات لتأكيد طلبها.</p>
        <button
          onClick={onBackToCart}
          className="bg-stone-900 text-amber-400 font-bold px-6 py-2.5 rounded-xl text-xs"
        >
          العودة للتسوق
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="mb-8 border-b border-stone-200 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
            إتمام الطلب والشحن
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            الدفع عند الاستلام نقداً بعد استلام الشحنة ومعاينتها
          </p>
        </div>

        <button
          onClick={onBackToCart}
          className="text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1.5"
        >
          <ArrowRight className="w-4 h-4" />
          <span>تعديل السلة</span>
        </button>
      </div>

      {submitError && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-700 font-bold animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 7 Columns: Delivery Address Form */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Customer Info */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-5 text-right">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <UserIcon className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-black text-stone-900">1. بيانات المستلم</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-stone-800 block">
                  الاسم بالكامل <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="مثال: أحمد محمد علي"
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-800 block">
                  رقم الهاتف الأساسي (متاح واتساب) <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl py-3 pr-9 pl-3 focus:bg-white focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                  <Phone className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
                <span className="text-[10px] text-stone-400">سيتواصل المندوب عبر هذا الرقم للتوصيل</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-800 block">
                  رقم هاتف بديل (اختياري)
                </label>
                <input
                  type="tel"
                  value={customerAltPhone}
                  onChange={(e) => setCustomerAltPhone(e.target.value)}
                  placeholder="رقم آخر في حال عدم الرد"
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Address Info */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-5 text-right">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <MapPin className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-black text-stone-900">2. عنوان الشحن والتوصيل</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-800 block">
                  المحافظة <span className="text-rose-600">*</span>
                </label>
                <select
                  value={selectedGov}
                  onChange={(e) => setSelectedGov(e.target.value)}
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl p-3 font-semibold text-stone-800 focus:bg-white focus:ring-2 focus:ring-amber-500"
                >
                  {EGYPTIAN_GOVERNORATES.map((gov) => (
                    <option key={gov.name} value={gov.name}>
                      {gov.name} ({gov.shipping} ج.م مصاريف شحن)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-800 block">
                  المدينة / الحي أو المركز <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={cityArea}
                  onChange={(e) => setCityArea(e.target.value)}
                  placeholder="مثال: مدينة نصر / سموحة / طنطا"
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-stone-800 block">
                  العنوان بالتفصيل (الشارع، رقم العمارة، الشقة، علامة مميزة) <span className="text-rose-600">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="مثال: شارع عباس العقاد - عمارة 15 - الدور الثالث - شقة 6 - بجوار بنك مصر"
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-stone-800 block">
                  ملاحظات إضافية للمندوب (اختياري)
                </label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="مثال: التسليم بعد الساعة 4 عصراً، أو الاتصال قبل الحضور بساعة"
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Payment Method Pill */}
          <div className="bg-amber-50/70 p-6 rounded-3xl border border-amber-200/80 flex items-start gap-4 text-right">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-stone-900">
                طريقة الدفع: الدفع نقداً عند الاستلام (COD)
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                لا يلزم إدخال أي بطاقة ائتمانية. ادفع بأمان لمندوب شركة الشحن عند تسليم الطلب لك والتأكد التام من الموديل والمقاس وجودة النعل.
              </p>
            </div>
          </div>

        </div>

        {/* Right 5 Columns: Order Summary Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6 sticky top-28">
            <h2 className="text-base font-black text-stone-900 border-b border-stone-100 pb-3 text-right">
              ملخص الطلب ({items.length} منتجات)
            </h2>

            {/* Items List */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 text-right text-xs">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop&q=80'}
                    alt={item.name_ar}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-lg object-cover bg-stone-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-stone-900 truncate">{item.name_ar}</h4>
                    <span className="text-stone-500 text-[11px] block">
                      مقاس: {item.size} {item.color ? `| ${item.color}` : ''} | كمية: {item.quantity}
                    </span>
                  </div>
                  <span className="font-black text-stone-900 shrink-0">
                    {item.price * item.quantity} ج.م
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Application */}
            <div className="pt-3 border-t border-stone-100">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>تم تطبيق كود: {appliedCoupon.code} (-{appliedCoupon.discountAmount} ج.م)</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-stone-400 hover:text-rose-600 text-xs font-bold"
                  >
                    حذف
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={checkoutCoupon}
                    onChange={(e) => setCheckoutCoupon(e.target.value.toUpperCase())}
                    placeholder="كود الخصم (مثل FM10)"
                    className="flex-1 text-xs bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 uppercase focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold px-4 rounded-xl"
                  >
                    تطبيق
                  </button>
                </div>
              )}
              {couponError && (
                <span className="text-[11px] text-rose-600 mt-1 block font-semibold">{couponError}</span>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 text-xs text-stone-600 border-t border-stone-100 pt-4">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span className="font-bold text-stone-900">{subtotal} ج.م</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>خصم الكوبون ({appliedCoupon.code}):</span>
                  <span>-{discountAmount} ج.م</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>مصاريف الشحن ({selectedGov}):</span>
                {isFreeShipping ? (
                  <span className="text-emerald-700 font-bold">شحن مجاني 🎉</span>
                ) : (
                  <span className="font-bold text-stone-900">{baseShippingCost} ج.م</span>
                )}
              </div>

              <div className="flex justify-between text-base font-black text-stone-950 border-t border-stone-200 pt-3">
                <span>المبلغ الإجمالي عند الاستلام:</span>
                <span className="text-xl text-amber-600 font-black">{finalTotal} ج.م</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-amber-400 font-black py-4 px-6 rounded-2xl text-sm shadow-xl transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{isSubmitting ? 'جاري تسجيل الطلب...' : 'تأكيد الطلب والدفع عند الاستلام'}</span>
            </button>

            <div className="text-center text-[11px] text-stone-400 space-y-1">
              <p>بالنقر على تأكيد الطلب، فإنك توافق على سياسة الاستبدال والاسترجاع</p>
              <p className="text-stone-500 font-semibold">ضمان استبدال ومعاينة 14 يوماً</p>
            </div>

          </div>
        </div>

      </form>
    </div>
  );
};
