import React, { useState, useEffect } from 'react';
import {
  Star,
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Share2,
  AlertCircle,
  Plus,
  Minus,
  MessageSquarePlus,
  Trash2,
} from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { getProduct, submitReview, deleteAdminProduct } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/ProductCard';
import { DeleteProductModal } from '../components/DeleteProductModal';

interface ProductDetailViewProps {
  productIdOrSlug: string | number;
  onNavigate: (view: string, param?: any) => void;
  onViewProduct: (product: Product) => void;
  onFastBuy: () => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  productIdOrSlug,
  onNavigate,
  onViewProduct,
  onFastBuy,
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  // Review Form state
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  const { addItem, openCart } = useCart();
  const { isInWishlist, toggle: toggleWishlist } = useWishlist();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getProduct(productIdOrSlug);
        const p = res.product;
        setProduct(p);

        // Select primary image
        const primImg =
          p.images?.find((img) => img.is_primary)?.image_url ||
          p.images?.[0]?.image_url ||
          p.primary_image ||
          '';
        setSelectedImage(primImg);

        // Select first in-stock variant if available
        if (p.variants && p.variants.length > 0) {
          const inStockVar = p.variants.find((v) => v.stock > 0) || p.variants[0];
          setSelectedVariant(inStockVar);
        }
        setQuantity(1);
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productIdOrSlug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-bold text-stone-600">جاري تحميل تفاصيل المنتج...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-black text-stone-900">المنتج غير موجود</h2>
        <p className="text-xs text-stone-500">قد يكون تم إيقاف هذا المنتج أو تغيير رابطه.</p>
        <button
          onClick={() => onNavigate('catalog', { category: 'all' })}
          className="bg-stone-900 text-amber-400 px-6 py-2.5 rounded-xl text-xs font-bold"
        >
          العودة للمتجر
        </button>
      </div>
    );
  }

  const originalPrice = Number(product.price);
  const currentPrice = product.discount_price ? Number(product.discount_price) : originalPrice;
  const hasDiscount = !!product.discount_price && Number(product.discount_price) < originalPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  const currentStock = selectedVariant ? selectedVariant.stock : 0;
  const isOutOfStock = currentStock <= 0;
  const isFavorite = isInWishlist(product.id);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    setIsAdding(true);
    try {
      await addItem(product.id, selectedVariant.id, quantity);
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 2000);
    } catch (err: any) {
      alert(err.message || 'فشل إضافة المنتج');
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!selectedVariant) return;
    try {
      await addItem(product.id, selectedVariant.id, quantity);
      onFastBuy();
    } catch (err: any) {
      alert(err.message || 'فشل إتمام الشراء');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewComment) return;
    setSubmittingReview(true);
    try {
      const res = await submitReview({
        product_id: product.id,
        customer_name: reviewName,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewMessage(res.message);
      setReviewName('');
      setReviewComment('');
    } catch (err: any) {
      setReviewMessage(err.message || 'فشل إرسال التقييم');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-stone-500">
        <button onClick={() => onNavigate('home')} className="hover:text-stone-900">
          الرئيسية
        </button>
        <span>/</span>
        <button
          onClick={() => onNavigate('catalog', { category: product.category_slug || 'all' })}
          className="hover:text-stone-900"
        >
          {product.category_name_ar || 'الأحذية'}
        </button>
        <span>/</span>
        <span className="text-stone-900 font-bold truncate max-w-xs">{product.name_ar}</span>
      </nav>

      {/* Main 2-Column Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        
        {/* Left: Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-stone-100 border border-stone-200 shadow-md">
            <img
              src={
                selectedImage ||
                'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80'
              }
              alt={product.name_ar}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            {hasDiscount && (
              <span className="absolute top-4 right-4 bg-rose-600 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-md">
                وفر {discountPercent}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.image_url)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                    selectedImage === img.image_url
                      ? 'border-amber-500 shadow-sm'
                      : 'border-stone-200 hover:border-stone-400'
                  }`}
                >
                  <img
                    src={img.image_url}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info & Order Action */}
        <div className="space-y-6 text-right">
          
          {/* Header & Badges */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                {product.category_name_ar || 'الأحذية'}
              </span>
              <span className="text-xs text-stone-400 font-mono">
                كود الموديل: {product.sku}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 leading-tight">
              {product.name_ar}
            </h1>

            {/* Rating Stars */}
            <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(Number(product.rating)) ? 'fill-current' : 'text-stone-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-amber-700 font-black">{Number(product.rating || 5).toFixed(1)}</span>
              <span className="text-stone-400">({product.reviews_count || 0} تقييم)</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-stone-400 block mb-0.5">سعر البيع الحالي:</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-stone-900">
                  {currentPrice} <span className="text-sm font-bold text-amber-600">ج.م</span>
                </span>
                {hasDiscount && (
                  <span className="text-sm text-stone-400 line-through">
                    {originalPrice} ج.م
                  </span>
                )}
              </div>
            </div>

            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-xl">
              الدفع عند الاستلام بعد المعاينة
            </span>
          </div>

          {/* Sizes Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-900">
                  اختر المقاس المناسب:
                </label>
                {selectedVariant && (
                  <span
                    className={`text-xs font-bold ${
                      selectedVariant.stock <= 3 ? 'text-amber-600' : 'text-emerald-700'
                    }`}
                  >
                    {selectedVariant.stock > 0
                      ? `متبقي في المخزون: ${selectedVariant.stock} قطع`
                      : 'نفد هذا المقاس'}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-5 gap-2">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  const isOut = v.stock <= 0;
                  return (
                    <button
                      key={v.id}
                      disabled={isOut}
                      onClick={() => {
                        setSelectedVariant(v);
                        setQuantity(1);
                      }}
                      className={`py-2.5 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center cursor-pointer ${
                        isSelected
                          ? 'bg-stone-900 text-amber-400 shadow-md ring-2 ring-amber-500'
                          : isOut
                          ? 'bg-stone-100 text-stone-300 cursor-not-allowed line-through'
                          : 'bg-white text-stone-800 border border-stone-300 hover:border-amber-400'
                      }`}
                    >
                      <span>{v.size}</span>
                      {v.stock > 0 && v.stock <= 3 && (
                        <span className="text-[9px] text-amber-500">متبقي {v.stock}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-stone-300 rounded-xl bg-white p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-100 disabled:opacity-30"
                >
                  <Minus className="w-4 h-4 text-stone-700" />
                </button>
                <span className="w-10 text-center font-bold text-sm text-stone-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                  disabled={quantity >= currentStock || isOutOfStock}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-100 disabled:opacity-30"
                >
                  <Plus className="w-4 h-4 text-stone-700" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                disabled={isOutOfStock || isAdding}
                onClick={handleAddToCart}
                className={`flex-1 py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-98 cursor-pointer ${
                  addSuccess
                    ? 'bg-emerald-600 text-white'
                    : isOutOfStock
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : 'bg-stone-900 hover:bg-stone-800 text-white'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>
                  {addSuccess ? 'تمت الإضافة بنجاح!' : isOutOfStock ? 'نفد من المخزون' : 'أضف إلى السلة'}
                </span>
              </button>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3.5 rounded-xl border transition cursor-pointer ${
                  isFavorite
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-white border-stone-300 text-stone-600 hover:border-rose-400 hover:text-rose-600'
                }`}
                title="إضافة للمفضلة"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Direct Buy Now Button */}
            <button
              disabled={isOutOfStock}
              onClick={handleBuyNow}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-stone-200 text-stone-950 font-black py-3.5 px-4 rounded-xl text-sm shadow-md transition cursor-pointer active:scale-98"
            >
              شراء فوري الآن (الدفع عند الاستلام)
            </button>
          </div>

          {/* Delivery & Assurance Pills */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-stone-200 text-center text-[11px] text-stone-600">
            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
              <Truck className="w-4 h-4 text-amber-600 mx-auto mb-1" />
              <span className="font-bold block text-stone-800">شحن سريع</span>
              <span>2-4 أيام لجميع المدن</span>
            </div>

            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
              <ShieldCheck className="w-4 h-4 text-amber-600 mx-auto mb-1" />
              <span className="font-bold block text-stone-800">معاينة الشحنة</span>
              <span>تأكد من المقاس أولاً</span>
            </div>

            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
              <RotateCcw className="w-4 h-4 text-amber-600 mx-auto mb-1" />
              <span className="font-bold block text-stone-800">استبدال 14 يوم</span>
              <span>في حالة رغبتك بتغيير المقاس</span>
            </div>
          </div>

          {/* Full Description */}
          <div className="space-y-3 pt-4 border-t border-stone-200">
            <h3 className="text-sm font-black text-stone-900">مواصفات وتفاصيل الموديل:</h3>
            <div className="text-xs text-stone-600 leading-relaxed space-y-2 whitespace-pre-line bg-stone-50/70 p-4 rounded-2xl border border-stone-100">
              {product.description_ar}
            </div>
          </div>

        </div>

      </div>

      {/* Customer Reviews & Add Review Section */}
      <section className="pt-10 border-t border-stone-200 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-stone-900">
              تقييمات وآراء المشترين ({product.reviews?.length || 0})
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              تجارب حقيقية لعملاء قاموا بشراء هذا الموديل وتجربته
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-4">
            {!product.reviews || product.reviews.length === 0 ? (
              <div className="bg-stone-50 p-8 rounded-2xl text-center border border-stone-200 text-stone-500 text-xs">
                كن أول من يقيّم هذا المنتج وشارك تجربتك مع زوار المتجر!
              </div>
            ) : (
              product.reviews.map((r) => (
                <div
                  key={r.id}
                  className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-2 text-right"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-stone-900">{r.customer_name}</span>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < r.rating ? 'fill-current' : 'text-stone-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed">{r.comment}</p>
                  <span className="text-[10px] text-stone-400 block pt-1">
                    {new Date(r.created_at).toLocaleDateString('ar-EG')}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Add Review Box */}
          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 space-y-4">
            <h4 className="text-sm font-black text-stone-900 flex items-center gap-1.5">
              <MessageSquarePlus className="w-4 h-4 text-amber-600" />
              <span>أضف رأيك في هذا المنتج</span>
            </h4>

            {reviewMessage ? (
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold">
                {reviewMessage}
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-3 text-right">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">اسمك الكامل</label>
                  <input
                    type="text"
                    required
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="مثال: أحمد مصطفى"
                    className="w-full text-xs bg-white border border-stone-300 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">التقييم</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= reviewRating
                              ? 'text-amber-400 fill-current'
                              : 'text-stone-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">تعليقك وتجربتك</label>
                  <textarea
                    required
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="اكتب رأيك بصراحة عن الراحة والمقاس والخامة..."
                    className="w-full text-xs bg-white border border-stone-300 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  {submittingReview ? 'جاري الإرسال...' : 'إرسال التقييم'}
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* Related Products */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <section className="pt-10 border-t border-stone-200 space-y-6">
          <h3 className="text-xl sm:text-2xl font-black text-stone-900">
            موديلات مشابهة قد تعجبك
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {product.relatedProducts.map((rel) => (
              <ProductCard
                key={rel.id}
                product={rel}
                onViewProduct={onViewProduct}
              />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
