import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
} from 'lucide-react';
import { Product, Category } from '../types';
import { getProducts, getCategories } from '../services/api';
import { ProductCard } from '../components/ProductCard';

interface CatalogViewProps {
  initialCategory?: string;
  initialSearch?: string;
  onViewProduct: (product: Product) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  initialCategory = 'all',
  initialSearch = '',
  onViewProduct,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalProducts, setTotalProducts] = useState<number>(0);

  // Sizes available for footwear
  const availableSizes = ['38', '39', '40', '41', '42', '43', '44', '45', '46'];

  // Load categories
  useEffect(() => {
    getCategories().then((res) => setCategories(res.categories || []));
  }, []);

  // Update when props change
  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
    if (initialSearch !== undefined) setSearchQuery(initialSearch);
  }, [initialCategory, initialSearch]);

  // Fetch filtered products
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const params: Record<string, any> = {
          page: currentPage,
          limit: 12,
          sort: sortBy,
        };

        if (selectedCategory && selectedCategory !== 'all') {
          params.category = selectedCategory;
        }
        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }
        if (selectedSize) {
          params.size = selectedSize;
        }
        if (minPrice) {
          params.min_price = minPrice;
        }
        if (maxPrice) {
          params.max_price = maxPrice;
        }

        const res = await getProducts(params);
        setProducts(res.products || []);
        setTotalPages(res.pagination.totalPages || 1);
        setTotalProducts(res.pagination.total || 0);
      } catch (err) {
        console.error('Failed to load catalog products:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [selectedCategory, searchQuery, selectedSize, minPrice, maxPrice, sortBy, currentPage]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSelectedSize('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    searchQuery.trim() !== '' ||
    selectedSize !== '' ||
    minPrice !== '' ||
    maxPrice !== '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Catalog Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
            كتالوج المنتجات والأحذية
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            عرض {totalProducts} موديل متاح للشراء الفوري مع الدفع عند الاستلام
          </p>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-800 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <Filter className="w-4 h-4" />
            <span>تصفية النتائج</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">
            <span className="hidden sm:inline-block text-stone-500">الترتيب حسب:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            >
              <option value="newest">الأحدث وصولاً</option>
              <option value="price_asc">السعر: من الأقل إلى الأعلى</option>
              <option value="price_desc">السعر: من الأعلى إلى الأقل</option>
              <option value="rating">الأعلى تقييماً</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Desktop Filters Sidebar */}
        <aside className="hidden lg:block bg-white p-6 rounded-2xl border border-stone-200 space-y-6 shadow-2xs sticky top-28">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div className="flex items-center gap-2 font-black text-stone-900 text-sm">
              <SlidersHorizontal className="w-4 h-4 text-amber-600" />
              <span>فلاتر البحث</span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-amber-600 hover:text-amber-700 font-bold cursor-pointer"
              >
                إعادة ضبط
              </button>
            )}
          </div>

          {/* Search Input Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-800 block">بحث بالاسم أو الكود</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="ابحث بالاسم أو SKU..."
                className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl py-2 pr-8 pl-3 focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Categories Filter */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-stone-800 block">الأقسام والتصنيفات</label>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setCurrentPage(1);
                }}
                className={`w-full text-right px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-stone-900 text-amber-400'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <span>جميع الأقسام</span>
                {selectedCategory === 'all' && <Check className="w-3.5 h-3.5" />}
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.slug);
                    setCurrentPage(1);
                  }}
                  className={`w-full text-right px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-between cursor-pointer ${
                    selectedCategory === cat.slug
                      ? 'bg-stone-900 text-amber-400 font-bold'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <span>{cat.name_ar}</span>
                  {selectedCategory === cat.slug && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Size Filter */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800">المقاس المطلوب</label>
              {selectedSize && (
                <button
                  onClick={() => setSelectedSize('')}
                  className="text-[11px] text-stone-400 hover:text-stone-700"
                >
                  إلغاء
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {availableSizes.map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedSize(isSelected ? '' : size);
                      setCurrentPage(1);
                    }}
                    className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                      isSelected
                        ? 'bg-stone-900 text-amber-400 shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-stone-800 block">نطاق السعر (ج.م)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="من"
                className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl p-2 text-center"
              />
              <span className="text-stone-400 text-xs">-</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="إلى"
                className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl p-2 text-center"
              />
            </div>
          </div>

        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-8">
          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-stone-500 font-semibold">الفلاتر المطبقة:</span>
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-bold">
                  القسم: {categories.find((c) => c.slug === selectedCategory)?.name_ar || selectedCategory}
                  <button onClick={() => setSelectedCategory('all')} className="hover:text-amber-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedSize && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-bold">
                  مقاس: {selectedSize}
                  <button onClick={() => setSelectedSize('')} className="hover:text-amber-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 bg-stone-200 text-stone-800 px-2.5 py-1 rounded-full font-bold">
                  بحث: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:text-stone-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={resetFilters}
                className="text-stone-500 hover:text-stone-900 underline text-xs font-semibold mr-2"
              >
                مسح الكل
              </button>
            </div>
          )}

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-80 bg-stone-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-2xs space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">لم يتم العثور على منتجات مطابقة</h3>
              <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto leading-relaxed">
                جرب تغيير خيارات التصفية أو البحث باسم موديل آخر للعثور على ما تبحث عنه.
              </p>
              <button
                onClick={resetFilters}
                className="bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold px-6 py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                إعادة ضبط جميع الفلاتر
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewProduct={onViewProduct}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pt-6 border-t border-stone-200 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-stone-200 text-stone-600 disabled:opacity-40 hover:bg-stone-100 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 text-xs font-bold">
                {[...Array(totalPages)].map((_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 rounded-lg transition ${
                        currentPage === p
                          ? 'bg-stone-900 text-amber-400 shadow-xs'
                          : 'text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-stone-200 text-stone-600 disabled:opacity-40 hover:bg-stone-100 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Mobile Filters Slide-over Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="w-4/5 max-w-xs bg-white h-full p-6 shadow-2xl overflow-y-auto flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                <span className="text-base font-black text-stone-900">تصفية النتائج</span>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-stone-500 hover:text-stone-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-2">الأقسام</label>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setCurrentPage(1);
                    }}
                    className={`w-full text-right px-3 py-2 rounded-lg text-xs font-bold ${
                      selectedCategory === 'all'
                        ? 'bg-stone-900 text-amber-400'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    جميع الأقسام
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.slug);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-right px-3 py-2 rounded-lg text-xs font-semibold ${
                        selectedCategory === cat.slug
                          ? 'bg-stone-900 text-amber-400 font-bold'
                          : 'text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {cat.name_ar}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-2">المقاس</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        setSelectedSize(selectedSize === size ? '' : size);
                        setCurrentPage(1);
                      }}
                      className={`py-1.5 text-xs font-bold rounded-lg ${
                        selectedSize === size
                          ? 'bg-stone-900 text-amber-400'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <div className="pt-6 border-t border-stone-200 space-y-2">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full bg-stone-900 text-amber-400 font-bold py-3 rounded-xl text-xs shadow-md"
              >
                تطبيق الفلاتر ({totalProducts} نتيجة)
              </button>
              <button
                onClick={() => {
                  resetFilters();
                  setMobileFilterOpen(false);
                }}
                className="w-full text-center text-xs text-stone-500 py-1"
              >
                إعادة ضبط
              </button>
            </div>
          </div>
          <div className="flex-1 bg-black/60" onClick={() => setMobileFilterOpen(false)} />
        </div>
      )}

    </div>
  );
};
