import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Truck,
  Tag,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
  onContinueShopping: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onProceedToCheckout,
  onContinueShopping,
}) => {
  const {
    items,
    itemCount,
    subtotal,
    shippingCost,
    totalAmount,
    freeShippingThreshold,
    freeShippingRemaining,
    isFreeShipping,
    appliedCoupon,
    couponError,
    isCartOpen,
    isLoading,
    closeCart,
    updateQuantity,
    removeItem,
    applyCouponCode,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    const success = await applyCouponCode(couponInput.trim());
    setIsApplyingCoupon(false);
    if (success) {
      setCouponInput('');
    }
  };

  // Free shipping percentage
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dimmed Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pl-0">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-r border-stone-200">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-black text-stone-900">سلة المشتريات</h2>
              <span className="bg-stone-200 text-stone-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {itemCount} منتجات
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-amber-50/80 px-4 py-3 border-b border-amber-200/60 text-xs">
            <div className="flex items-center gap-2 mb-1.5 font-bold text-stone-800">
              <Truck className="w-4 h-4 text-amber-600 shrink-0" />
              {isFreeShipping ? (
                <span className="text-emerald-700 font-black">
                  تهانينا! لقد حصلت على شحن مجاني لكافة المحافظات 🎉
                </span>
              ) : (
                <span>
                  أضف بـ <strong className="text-amber-700">{freeShippingRemaining} ج.م</strong> إضافية للحصول على شحن مجاني!
                </span>
              )}
            </div>
            <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isFreeShipping ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Items List Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500 space-y-3">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-stone-800">سلة التسوق فارغة</h3>
                <p className="text-xs text-stone-500 max-w-xs leading-relaxed">
                  لم تقم بإضافة أي أحذية أو كروكس إلى سلتك بعد. تصفح أحدث الموديلات المتوفرة لدينا الآن.
                </p>
                <button
                  onClick={() => {
                    closeCart();
                    onContinueShopping();
                  }}
                  className="mt-2 bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold px-6 py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  تصفح المنتجات الآن
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3.5 p-3 rounded-xl border border-stone-200 bg-white hover:border-amber-300 transition-colors shadow-2xs"
                >
                  <img
                    src={
                      item.image_url ||
                      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80'
                    }
                    alt={item.name_ar}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-lg object-cover bg-stone-100 shrink-0"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-stone-900 line-clamp-2 leading-snug">
                          {item.name_ar}
                        </h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-stone-400 hover:text-rose-600 transition p-1 cursor-pointer"
                          title="حذف من السلة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-500">
                        <span className="bg-stone-100 px-1.5 py-0.5 rounded-sm font-semibold">
                          مقاس: {item.size}
                        </span>
                        {item.color && (
                          <span className="text-stone-400">| لون: {item.color}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-100">
                      <span className="text-xs font-black text-stone-900">
                        {item.price * item.quantity} ج.م
                        {item.quantity > 1 && (
                          <span className="text-[10px] text-stone-400 font-normal mr-1">
                            ({item.price} لكل قطعة)
                          </span>
                        )}
                      </span>

                      {/* Quantity Selector */}
                      <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-stone-50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={isLoading}
                          className="w-6 h-6 flex items-center justify-center hover:bg-stone-200 text-stone-600 transition cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-stone-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={isLoading || item.quantity >= item.current_stock}
                          className="w-6 h-6 flex items-center justify-center hover:bg-stone-200 text-stone-600 disabled:opacity-40 transition cursor-pointer"
                          title={item.quantity >= item.current_stock ? 'أقصى كمية متاحة' : 'زيادة'}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Coupon & Checkout */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50/90 space-y-3.5">
              
              {/* Coupon Code Section */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>تم تطبيق الكوبون: <strong>{appliedCoupon.code}</strong> (خصم {appliedCoupon.discountAmount} ج.م)</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-stone-400 hover:text-rose-600 font-semibold text-xs cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="هل لديك كود خصم؟ (مثل FM10)"
                      className="w-full text-xs bg-white border border-stone-300 rounded-xl py-2 pr-8 pl-3 uppercase placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                    <Tag className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <button
                    type="submit"
                    disabled={isApplyingCoupon || !couponInput.trim()}
                    className="bg-stone-800 hover:bg-stone-900 disabled:bg-stone-300 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    تطبيق
                  </button>
                </form>
              )}

              {couponError && (
                <div className="flex items-center gap-1 text-xs text-rose-600">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{couponError}</span>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-stone-600 pt-1">
                <div className="flex justify-between">
                  <span>المجموع الفرعي ({itemCount} قطع)</span>
                  <span className="font-bold text-stone-900">{subtotal} ج.م</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>خصم الكوبون</span>
                    <span>-{appliedCoupon.discountAmount} ج.م</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>مصاريف الشحن</span>
                  {isFreeShipping ? (
                    <span className="text-emerald-700 font-bold">شحن مجاني</span>
                  ) : (
                    <span className="font-bold text-stone-900">{shippingCost} ج.م</span>
                  )}
                </div>

                <div className="flex justify-between text-sm font-black text-stone-950 pt-2 border-t border-stone-200">
                  <span>الإجمالي الكلي (الدفع عند الاستلام)</span>
                  <span className="text-base text-amber-600 font-black">{totalAmount} ج.م</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    closeCart();
                    onProceedToCheckout();
                  }}
                  className="w-full bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md active:scale-98 transition cursor-pointer"
                >
                  <span>متابعة الشراء (الدفع عند الاستلام)</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={closeCart}
                  className="w-full text-center text-xs text-stone-500 hover:text-stone-800 font-medium py-1"
                >
                  الاستمرار في التسوق
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
