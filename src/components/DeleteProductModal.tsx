import React from 'react';
import { Trash2, AlertTriangle, X, RefreshCw } from 'lucide-react';
import { Product } from '../types';

interface DeleteProductModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onConfirm: (productId: number) => Promise<void>;
  isDeleting: boolean;
}

export const DeleteProductModal: React.FC<DeleteProductModalProps> = ({
  isOpen,
  product,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-5 text-right relative"
        dir="rtl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute left-5 top-5 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition cursor-pointer disabled:opacity-40"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon & Title */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-stone-900">تأكيد حذف المنتج</h3>
            <span className="text-xs text-stone-500 block">إزالة الموديل نهائياً من المتجر</span>
          </div>
        </div>

        {/* Product Preview Card */}
        <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200/80 flex items-center gap-3.5">
          <img
            src={
              product.primary_image ||
              product.images?.[0]?.image_url ||
              'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&auto=format&fit=crop&q=80'
            }
            alt={product.name_ar}
            referrerPolicy="no-referrer"
            className="w-16 h-16 rounded-xl object-cover bg-stone-200 shrink-0 border border-stone-200"
          />
          <div className="min-w-0 flex-1">
            <h4 className="font-black text-xs text-stone-900 truncate">{product.name_ar}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-amber-600 font-black text-xs">{product.price} ج.م</span>
              {product.sku && (
                <span className="text-[10px] text-stone-400 font-mono bg-stone-200/70 px-1.5 py-0.5 rounded">
                  {product.sku}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Caution Message */}
        <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-rose-800 leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">تحذير: هذا الإجراء نهائي ولا يمكن التراجع عنه!</strong>
            <span>سيتم حذف هذا الموديل ومقاساته وصوره بالكامل من قاعدة البيانات وإزالته فوراً من عرض المتجر.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={() => onConfirm(product.id)}
            disabled={isDeleting}
            className="w-full sm:flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 active:scale-95 transition cursor-pointer"
          >
            {isDeleting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>جاري الحذف...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>نعم، احذف المنتج الآن</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-stone-300 hover:bg-stone-50 font-bold text-stone-700 text-xs transition cursor-pointer disabled:opacity-40"
          >
            إلغاء وتراجع
          </button>
        </div>
      </div>
    </div>
  );
};
