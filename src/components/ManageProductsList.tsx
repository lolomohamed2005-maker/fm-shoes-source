import React, { useState, useEffect } from 'react';
import {
  Search,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  Package,
  Filter,
} from 'lucide-react';
import { getAdminProducts, deleteAdminProduct, toggleAdminProduct } from '../services/api';
import { Product } from '../types';
import { DeleteProductModal } from './DeleteProductModal';

interface ManageProductsListProps {
  onAddNewProduct?: () => void;
  onViewProduct?: (product: Product) => void;
  onEditProduct?: (product: Product) => void;
}

export const ManageProductsList: React.FC<ManageProductsListProps> = ({
  onAddNewProduct,
  onViewProduct,
  onEditProduct,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Feedback
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Deletion Modal State
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getAdminProducts();
      setProducts(res.products || []);
    } catch (err: any) {
      console.error('Failed to load products for management:', err);
      setErrorBanner('تعذر تحميل قائمة المنتجات، يرجى إعادة المحاولة');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle Delete Confirmation
  const handleConfirmDelete = async (productId: number) => {
    setIsDeleting(true);
    setErrorBanner(null);
    try {
      await deleteAdminProduct(productId);
      const deletedName = productToDelete?.name_ar || 'المنتج';
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setProductToDelete(null);
      setSuccessBanner(`تم حذف "${deletedName}" بنجاح وإزالته من المتجر.`);
      setTimeout(() => setSuccessBanner(null), 5000);
    } catch (err: any) {
      setErrorBanner(err.message || 'فشل حذف المنتج من قاعدة البيانات');
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle active status
  const handleToggle = async (productId: number) => {
    try {
      const res = await toggleAdminProduct(productId);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, is_active: res.is_active } : p))
      );
    } catch (err) {
      setErrorBanner('فشل تغيير حالة تفعيل المنتج');
    }
  };

  // Filtered list
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.name_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'active') return p.is_active;
    if (statusFilter === 'inactive') return !p.is_active;
    return true;
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header with counts and Add button */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-stone-900">إدارة وحذف منتجات المتجر</h2>
            <span className="bg-amber-100 text-amber-900 text-xs font-black px-2.5 py-0.5 rounded-full">
              {products.length} موديل
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            يمكنك حذف أي منتج تريده نهائياً بضغطة زر، أو تعطيل ظهوره مؤقتاً في المتجر.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="p-2.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition cursor-pointer"
            title="تحديث القائمة"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {onAddNewProduct && (
            <button
              onClick={onAddNewProduct}
              className="flex-1 sm:flex-initial bg-amber-500 hover:bg-amber-400 text-stone-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة منتج جديد</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {successBanner && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center justify-between text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-700 hover:text-emerald-950"
          >
            ✕
          </button>
        </div>
      )}

      {/* Error Notification */}
      {errorBanner && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center justify-between text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorBanner}</span>
          </div>
          <button
            onClick={() => setErrorBanner(null)}
            className="text-rose-700 hover:text-rose-950"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن الموديل بالاسم أو كود SKU..."
            className="w-full text-xs bg-white border border-stone-200 rounded-2xl py-3 pr-10 pl-4 focus:ring-2 focus:ring-amber-500 shadow-2xs"
          />
          <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs font-bold"
            >
              مسح
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-stone-200 shadow-2xs text-xs font-bold w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`flex-1 sm:flex-initial px-3 py-2 rounded-xl transition cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-stone-900 text-white'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            الكل ({products.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`flex-1 sm:flex-initial px-3 py-2 rounded-xl transition cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            النشط ({products.filter((p) => p.is_active).length})
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`flex-1 sm:flex-initial px-3 py-2 rounded-xl transition cursor-pointer ${
              statusFilter === 'inactive'
                ? 'bg-stone-600 text-white'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            المعطل ({products.filter((p) => !p.is_active).length})
          </button>
        </div>
      </div>

      {/* Products List / Cards */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
          <p className="text-xs font-bold text-stone-500">جاري تحميل قائمة المنتجات...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center space-y-4">
          <Package className="w-12 h-12 text-stone-300 mx-auto" />
          <div>
            <h3 className="text-base font-black text-stone-800">لا توجد منتجات مطابقة</h3>
            <p className="text-xs text-stone-400 mt-1">
              {searchQuery ? 'لم يتم العثور على أي منتج يطابق بحثك.' : 'لم تقم بإضافة أي منتجات بعد.'}
            </p>
          </div>
          {onAddNewProduct && (
            <button
              onClick={onAddNewProduct}
              className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-black px-5 py-2.5 rounded-xl text-xs inline-flex items-center gap-2 cursor-pointer shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة أول منتج للمتجر</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProducts.map((product) => {
            const img =
              product.primary_image ||
              product.images?.[0]?.image_url ||
              'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80';

            return (
              <div
                key={product.id}
                className="bg-white rounded-3xl border border-stone-200/90 shadow-2xs hover:shadow-md transition p-4 flex flex-col justify-between gap-4"
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <img
                    src={img}
                    alt={product.name_ar}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-stone-100 shrink-0 border border-stone-200"
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-black text-stone-900 text-xs sm:text-sm line-clamp-2">
                        {product.name_ar}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="font-black text-amber-600">{product.price} ج.م</span>
                      {product.discount_price && (
                        <span className="text-stone-400 line-through">
                          {product.discount_price} ج.م
                        </span>
                      )}
                      {product.category_name_ar && (
                        <span className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-medium">
                          {product.category_name_ar}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1 text-[10px] text-stone-400 font-mono">
                      <span>كود: {product.sku || 'بدون'}</span>
                      <span>•</span>
                      <span className="text-stone-600 font-bold">
                        المخزون: {product.total_stock || 0} قطعة
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls: Toggle active, View in store, and DELETE button */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggle(product.id)}
                      className={`text-[10px] font-black px-2.5 py-1.5 rounded-xl cursor-pointer transition ${
                        product.is_active
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          : 'bg-stone-100 text-stone-500 hover:bg-stone-200 border border-stone-200'
                      }`}
                      title="تبديل حالة العرض بالمتجر"
                    >
                      {product.is_active ? 'معروض للزبائن' : 'مخفي مؤقتاً'}
                    </button>

                    {onViewProduct && (
                      <button
                        onClick={() => onViewProduct(product)}
                        className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition cursor-pointer"
                        title="معاينة شكل المنتج في المتجر"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}

                    {onEditProduct && (
                      <button
                        onClick={() => onEditProduct(product)}
                        className="p-1.5 text-stone-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition cursor-pointer"
                        title="تعديل تفاصيل المنتج"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* PROMINENT RED DELETE BUTTON */}
                  <button
                    onClick={() => setProductToDelete(product)}
                    className="bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-2xs"
                    title="حذف هذا المنتج نهائياً من المتجر"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف المنتج</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      <DeleteProductModal
        isOpen={Boolean(productToDelete)}
        product={productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};
