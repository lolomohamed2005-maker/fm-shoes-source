import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  Phone,
  AlertCircle,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import { Order } from '../types';
import { getOrder } from '../services/api';

interface OrderTrackingViewProps {
  initialOrderNumber?: string;
  onNavigateHome: () => void;
}

const ORDER_STEPS = [
  { status: 'PENDING', label: 'تم استلام الطلب', desc: 'تم تسجيل طلبك في نظام المتجر بنجاح' },
  { status: 'CONFIRMED', label: 'تم التأكيد', desc: 'تمت مراجعة بيانات الشحن والمقاسات' },
  { status: 'PROCESSING', label: 'جاري التجهيز', desc: 'يتم فحص وتغليف الأحذية في المستودع' },
  { status: 'SHIPPED', label: 'خرج مع المندوب', desc: 'الشحنة في طريقها إلى عنوانك' },
  { status: 'DELIVERED', label: 'تم الاستلام بنجاح', desc: 'تم تسليم الشحنة وتحصيل المبلغ' },
];

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  initialOrderNumber = '',
  onNavigateHome,
}) => {
  const [orderNumberInput, setOrderNumberInput] = useState(initialOrderNumber);
  const [orderData, setOrderData] = useState<{ order: Order; items: any[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchOrderDetails = async (num: string) => {
    if (!num.trim()) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await getOrder(num.trim());
      setOrderData(res);
    } catch (err: any) {
      setOrderData(null);
      setErrorMessage(err.message || 'لم يتم العثور على طلب بهذا الرقم');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber) {
      fetchOrderDetails(initialOrderNumber);
    }
  }, [initialOrderNumber]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrderDetails(orderNumberInput);
  };

  // Determine current step index
  const getStepIndex = (status: string) => {
    const map: Record<string, number> = {
      PENDING: 0,
      CONFIRMED: 1,
      PROCESSING: 2,
      SHIPPED: 3,
      DELIVERED: 4,
    };
    return map[status] !== undefined ? map[status] : 0;
  };

  const currentStep = orderData ? getStepIndex(orderData.order.status) : 0;
  const isCancelled = orderData?.order.status === 'CANCELLED';
  const isReturned = orderData?.order.status === 'RETURNED';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-2">
          <Package className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
          تتبع حالة شحنتك
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
          أدخل رقم الطلب المكون من الكود (مثال: KHT-823910) لمعرفة المكان الحالي لشحنتك وموعد وصولها
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="max-w-lg mx-auto flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            required
            value={orderNumberInput}
            onChange={(e) => setOrderNumberInput(e.target.value.toUpperCase())}
            placeholder="أدخل رقم الطلب (مثال: KHT-XXXXXX)"
            className="w-full text-xs font-mono bg-white border border-stone-300 rounded-2xl py-3 pr-10 pl-4 focus:ring-2 focus:ring-amber-500 uppercase font-bold"
          />
          <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
        </div>
        <button
          type="submit"
          disabled={loading || !orderNumberInput.trim()}
          className="bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-amber-400 font-bold px-6 py-3 rounded-2xl text-xs transition cursor-pointer"
        >
          {loading ? 'جاري البحث...' : 'تتبع الآن'}
        </button>
      </form>

      {/* Error Message */}
      {errorMessage && (
        <div className="max-w-lg mx-auto p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Order Details Display */}
      {orderData && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-lg overflow-hidden space-y-8 p-6 sm:p-10 animate-in fade-in text-right">
          
          {/* Top Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-4">
            <div>
              <span className="text-xs text-stone-400 block font-medium">بيانات الطلب:</span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-stone-900 font-mono">
                  {orderData.order.order_number}
                </span>
                <span className="text-xs font-semibold text-stone-500">
                  ({new Date(orderData.order.created_at).toLocaleDateString('ar-EG')})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500">حالة الطلب الحالية:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-black ${
                isCancelled
                  ? 'bg-rose-100 text-rose-800'
                  : isReturned
                  ? 'bg-purple-100 text-purple-800'
                  : orderData.order.status === 'DELIVERED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {orderData.order.status === 'PENDING' && 'قيد المراجعة'}
                {orderData.order.status === 'CONFIRMED' && 'تم التأكيد'}
                {orderData.order.status === 'PROCESSING' && 'جاري التجهيز'}
                {orderData.order.status === 'SHIPPED' && 'تم الشحن'}
                {orderData.order.status === 'DELIVERED' && 'تم التسليم'}
                {orderData.order.status === 'CANCELLED' && 'ملغي'}
                {orderData.order.status === 'RETURNED' && 'مرتجع'}
              </span>
            </div>
          </div>

          {/* Stepper (if not cancelled/returned) */}
          {!isCancelled && !isReturned ? (
            <div className="py-4">
              <div className="relative flex items-center justify-between">
                
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-stone-200 -translate-y-1/2 z-0" />
                <div
                  className="absolute top-1/2 right-0 h-1 bg-amber-500 -translate-y-1/2 z-0 transition-all duration-500"
                  style={{ width: `${(currentStep / (ORDER_STEPS.length - 1)) * 100}%` }}
                />

                {/* Steps */}
                {ORDER_STEPS.map((step, idx) => {
                  const isDone = idx <= currentStep;
                  const isCurrent = idx === currentStep;

                  return (
                    <div key={step.status} className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                          isDone
                            ? 'bg-amber-500 text-stone-950 ring-4 ring-amber-100'
                            : 'bg-stone-200 text-stone-500'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </div>
                      <span
                        className={`mt-2 text-[11px] sm:text-xs font-bold text-center ${
                          isCurrent ? 'text-amber-700' : isDone ? 'text-stone-900' : 'text-stone-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
              isCancelled ? 'bg-rose-50 text-rose-800' : 'bg-purple-50 text-purple-800'
            }`}>
              <XCircle className="w-5 h-5" />
              <span>
                {isCancelled
                  ? 'هذا الطلب تم إلغاؤه بناء على رغبة العميل أو لعدم الرد على تأكيد الشحنة.'
                  : 'تم استرجاع هذا الطلب وفقاً لسياسة الاستبدال والاسترجاع.'}
              </span>
            </div>
          )}

          {/* Delivery & Customer Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-stone-50 p-6 rounded-2xl border border-stone-200/80 text-xs">
            <div className="space-y-2">
              <span className="font-bold text-stone-900 block mb-1">بيانات التوصيل:</span>
              <div className="flex items-center gap-2 text-stone-700">
                <span className="text-stone-400">الاسم:</span>
                <span className="font-bold">{orderData.order.customer_name}</span>
              </div>
              <div className="flex items-center gap-2 text-stone-700">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <span className="font-mono">{orderData.order.customer_phone}</span>
              </div>
              <div className="flex items-start gap-2 text-stone-700">
                <MapPin className="w-3.5 h-3.5 text-stone-400 mt-0.5 shrink-0" />
                <span>{orderData.order.shipping_address}</span>
              </div>
            </div>

            <div className="space-y-2 border-t md:border-t-0 md:border-r border-stone-200 md:pr-6 pt-4 md:pt-0">
              <span className="font-bold text-stone-900 block mb-1">الدفع والمبالغ المستحقة:</span>
              <div className="flex justify-between text-stone-700">
                <span>طريقة السداد:</span>
                <span className="font-bold text-stone-900">الدفع نقداً عند الاستلام</span>
              </div>
              <div className="flex justify-between text-stone-700">
                <span>حالة السداد:</span>
                <span className={`font-bold ${
                  orderData.order.payment_status === 'PAID' ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {orderData.order.payment_status === 'PAID' ? 'تم الدفع للمندوب' : 'مستحق عند التسليم'}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-stone-950 pt-2 border-t border-stone-200">
                <span>المبلغ المطلوب تسليمه للمندوب:</span>
                <span className="text-amber-600">{orderData.order.total_amount} ج.م</span>
              </div>
            </div>
          </div>

          {/* Items In Order */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-stone-900">المنتجات المطلوبة في هذا الطلب:</h3>
            <div className="space-y-2">
              {orderData.items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 bg-white"
                >
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop&q=80'}
                    alt={item.product_name_ar}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-lg object-cover bg-stone-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-stone-900 truncate">
                      {item.product_name_ar}
                    </h4>
                    <span className="text-stone-500 text-[11px] block">
                      المقاس: {item.size} {item.color ? `| اللون: ${item.color}` : ''} | الكمية: {item.quantity}
                    </span>
                  </div>
                  <span className="font-black text-xs text-stone-900">
                    {item.price * item.quantity} ج.م
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Service Help Box */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-stone-700 text-center sm:text-right">
              <span className="font-bold text-stone-900 block">هل تحتاج لتعديل المقاس أو العنوان؟</span>
              <span className="text-stone-500 text-[11px]">تواصل مع خدمة عملاء متجر FM مباشرة وسنساعدك فوراً:</span>
            </div>
            <div className="flex items-center gap-2 font-mono font-bold">
              <a
                href="tel:01010574689"
                className="px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-stone-900 hover:text-amber-600 transition"
              >
                01010574689
              </a>
              <a
                href="tel:01055753006"
                className="px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-stone-900 hover:text-amber-600 transition"
              >
                01055753006
              </a>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
