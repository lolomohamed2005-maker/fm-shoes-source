import React, { useState } from 'react';
import { Heart, ShoppingBag, Star, Check } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface ProductCardProps {
  product: Product;
  onViewProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewProduct }) => {
  const { addItem } = useCart();
  const { isInWishlist, toggle: toggleWishlist } = useWishlist();

  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    product.variants && product.variants.length > 0 ? product.variants[0].id : null
  );
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isFavorite = isInWishlist(product.id);

  // Price calculations
  const originalPrice = Number(product.price);
  const currentPrice = product.discount_price ? Number(product.discount_price) : originalPrice;
  const hasDiscount = !!product.discount_price && Number(product.discount_price) < originalPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  // Stock calculations
  const totalStock = product.total_stock !== undefined ? product.total_stock : 10;
  const isOutOfStock = totalStock <= 0;
  const isLowStock = totalStock > 0 && totalStock <= 4;

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // If product has multiple variants, open size selector
    if (product.variants && product.variants.length > 1 && !showSizePicker) {
      setShowSizePicker(true);
      return;
    }

    const variantIdToUse = selectedVariantId || (product.variants?.[0]?.id ?? 1);
    setIsAdding(true);
    try {
      await addItem(product.id, variantIdToUse, 1);
      setJustAdded(true);
      setShowSizePicker(false);
      setTimeout(() => setJustAdded(false), 1800);
    } catch (err: any) {
      alert(err.message || 'فشل إضافة المنتج');
    } finally {
      setIsAdding(false);
    }
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleWishlist(product.id);
  };

  const primaryImage =
    product.primary_image ||
    (product.images && product.images[0]?.image_url) ||
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80';

  return (
    <div
      onClick={() => onViewProduct(product)}
      className="group relative bg-white rounded-2xl border border-stone-200/90 hover:border-amber-400/80 transition-all duration-300 shadow-xs hover:shadow-xl flex flex-col justify-between overflow-hidden cursor-pointer"
    >
      {/* Top Image Container */}
      <div className="relative w-full pt-[95%] bg-stone-100 overflow-hidden">
        <img
          src={primaryImage}
          alt={product.name_ar}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Wishlist Button */}
        <button
          onClick={handleFavoriteClick}
          aria-label="إضافة إلى المفضلة"
          className={`absolute top-3 left-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md shadow-xs transition-transform active:scale-90 z-10 cursor-pointer ${
            isFavorite
              ? 'bg-rose-50 text-rose-600 border border-rose-200'
              : 'bg-white/90 text-stone-600 hover:text-rose-600 hover:bg-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end z-10">
          {hasDiscount && (
            <span className="bg-rose-600 text-white font-black text-xs px-2 py-0.5 rounded-md shadow-xs">
              وفر {discountPercent}%
            </span>
          )}
          {product.is_bestseller && (
            <span className="bg-amber-500 text-stone-950 font-black text-[10px] px-2 py-0.5 rounded-md shadow-xs">
              الأكثر طلباً
            </span>
          )}
        </div>

        {/* Stock status overlay banner if out of stock or low stock */}
        {isOutOfStock ? (
          <div className="absolute inset-x-0 bottom-0 bg-stone-950/80 backdrop-blur-xs text-rose-400 py-1.5 text-center text-xs font-bold">
            نفد من المخزون
          </div>
        ) : isLowStock ? (
          <div className="absolute inset-x-0 bottom-0 bg-amber-600/90 text-white py-1 text-center text-[11px] font-bold">
            متبقي {totalStock} قطع فقط!
          </div>
        ) : null}
      </div>

      {/* Card Content Details */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Category & Rating Row */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-sm">
              {product.category_name_ar || 'أحذية'}
            </span>
            <div className="flex items-center gap-1 font-bold text-stone-700">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{Number(product.rating || 5).toFixed(1)}</span>
            </div>
          </div>

          {/* Product Title */}
          <h3 className="font-bold text-stone-900 text-sm leading-snug line-clamp-2 group-hover:text-amber-600 transition-colors">
            {product.name_ar}
          </h3>

          {/* Sizes preview */}
          {product.variants && product.variants.length > 0 && (
            <div className="mt-2 flex items-center gap-1 overflow-hidden flex-wrap">
              <span className="text-[11px] text-stone-400">المقاسات:</span>
              {product.variants.slice(0, 5).map((v) => (
                <span
                  key={v.id}
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-sm ${
                    v.stock > 0
                      ? 'bg-stone-100 text-stone-700'
                      : 'bg-stone-100/50 text-stone-400 line-through'
                  }`}
                >
                  {v.size}
                </span>
              ))}
              {product.variants.length > 5 && (
                <span className="text-[10px] text-stone-400 font-bold">+{product.variants.length - 5}</span>
              )}
            </div>
          )}
        </div>

        {/* Interactive Size Picker overlay when clicked Quick Add */}
        {showSizePicker && product.variants && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="p-2.5 bg-amber-50/90 border border-amber-300 rounded-xl space-y-2 animate-in fade-in"
          >
            <div className="flex items-center justify-between text-xs font-bold text-stone-800">
              <span>اختر المقاس المطلوب:</span>
              <button
                onClick={() => setShowSizePicker(false)}
                className="text-stone-400 hover:text-stone-700 text-xs"
              >
                إلغاء
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {product.variants.map((v) => {
                const disabled = v.stock <= 0;
                const isSelected = selectedVariantId === v.id;
                return (
                  <button
                    key={v.id}
                    disabled={disabled}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`py-1 text-xs font-bold rounded-md transition ${
                      isSelected
                        ? 'bg-stone-900 text-amber-400 shadow-xs'
                        : disabled
                        ? 'bg-stone-200/50 text-stone-400 cursor-not-allowed line-through'
                        : 'bg-white text-stone-800 border border-stone-200 hover:border-amber-400'
                    }`}
                  >
                    {v.size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Pricing & Add to Cart Footer */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black text-stone-900">
                {currentPrice} <span className="text-xs font-bold text-amber-600">ج.م</span>
              </span>
            </div>
            {hasDiscount && (
              <span className="text-xs text-stone-400 line-through">
                {originalPrice} ج.م
              </span>
            )}
          </div>

          <button
            disabled={isOutOfStock || isAdding}
            onClick={handleQuickAdd}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : isOutOfStock
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-stone-900 hover:bg-stone-800 text-white'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>تمت الإضافة!</span>
              </>
            ) : isOutOfStock ? (
              <span>نفد</span>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                <span>{showSizePicker ? 'تأكيد' : 'أضف للسلة'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
