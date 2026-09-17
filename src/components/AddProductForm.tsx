import React, { useState, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Plus,
  Trash2,
  Star,
  CheckCircle2,
  AlertCircle,
  Tag,
  SlidersHorizontal,
  Save,
  Package,
  Sparkles,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { getCategories, createAdminProduct } from '../services/api';
import { Category } from '../types';
import { ManageProductsList } from './ManageProductsList';

interface AddProductFormProps {
  onSuccess?: (product: any) => void;
  onCancel?: () => void;
  isModal?: boolean;
  initialTab?: 'add' | 'manage';
}

const standardSizes = ['37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];

export const AddProductForm: React.FC<AddProductFormProps> = ({
  onSuccess,
  onCancel,
  isModal = false,
  initialTab = 'add',
}) => {
  const [activeView, setActiveView] = useState<'add' | 'manage'>(initialTab);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Form Fields
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [sku, setSku] = useState(() => `FM-${Math.floor(1000 + Math.random() * 9000)}`);
  const [descriptionAr, setDescriptionAr] = useState('');
  const [isFeatured, setIsFeatured] = useState(true);
  const [isBestseller, setIsBestseller] = useState(false);

  // Images State (From gallery upload & optional URL)
  const [images, setImages] = useState<{ image_url: string; is_primary: boolean }[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // Sizes / Variants State (Admin customizable)
  const [variants, setVariants] = useState<{ size: string; stock: number; color: string }[]>([
    { size: '41', stock: 10, color: 'افتراضي' },
    { size: '42', stock: 10, color: 'افتراضي' },
    { size: '43', stock: 10, color: 'افتراضي' },
    { size: '44', stock: 10, color: 'افتراضي' },
    { size: '45', stock: 10, color: 'افتراضي' },
  ]);
  const [customSizeInput, setCustomSizeInput] = useState('');

  // Status & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successProduct, setSuccessProduct] = useState<any | null>(null);

  // Load Categories
  useEffect(() => {
    setLoadingCategories(true);
    getCategories()
      .then((res) => {
        if (res.categories && res.categories.length > 0) {
          setCategories(res.categories);
          setCategoryId(String(res.categories[0].id));
        }
      })
      .catch((err) => console.error('Failed to load categories:', err))
      .finally(() => setLoadingCategories(false));
  }, []);

  // Handle uploading images from phone/computer gallery
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImages(true);
    setErrorMessage(null);

    const newImages: { image_url: string; is_primary: boolean }[] = [];

    const fileList = Array.from(files) as File[];
    for (const file of fileList) {
      if (!file.type.startsWith('image/')) continue;

      try {
        const dataUrl = await readFileAsDataUrl(file);
        newImages.push({
          image_url: dataUrl,
          is_primary: images.length === 0 && newImages.length === 0,
        });
      } catch (err) {
        console.error('Error reading file:', err);
      }
    }

    if (newImages.length > 0) {
      setImages((prev) => {
        const combined = [...prev, ...newImages];
        // Ensure at least one is primary
        if (!combined.some((img) => img.is_primary) && combined[0]) {
          combined[0].is_primary = true;
        }
        return combined;
      });
    }

    setIsUploadingImages(false);
    // Reset file input value
    e.target.value = '';
  };

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Add image by URL
  const handleAddImageUrl = () => {
    if (!customImageUrl.trim()) return;
    setImages((prev) => [
      ...prev,
      {
        image_url: customImageUrl.trim(),
        is_primary: prev.length === 0,
      },
    ]);
    setCustomImageUrl('');
  };

  // Set primary image
  const handleSetPrimary = (index: number) => {
    setImages((prev) =>
      prev.map((img, idx) => ({
        ...img,
        is_primary: idx === index,
      }))
    );
  };

  // Remove image
  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const filtered = prev.filter((_, idx) => idx !== index);
      if (filtered.length > 0 && !filtered.some((img) => img.is_primary)) {
        filtered[0].is_primary = true;
      }
      return filtered;
    });
  };

  // Toggle Standard Size Chip
  const toggleSize = (sz: string) => {
    setVariants((prev) => {
      const exists = prev.some((v) => String(v.size) === String(sz));
      if (exists) {
        return prev.filter((v) => String(v.size) !== String(sz));
      } else {
        return [...prev, { size: sz, stock: 10, color: 'افتراضي' }].sort((a, b) => {
          const numA = parseFloat(a.size);
          const numB = parseFloat(b.size);
          if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
          return a.size.localeCompare(b.size);
        });
      }
    });
  };

  // Add Custom Size (Typed by user)
  const handleAddCustomSize = () => {
    const trimmed = customSizeInput.trim();
    if (!trimmed) return;
    const exists = variants.some((v) => v.size.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      setVariants((prev) => [...prev, { size: trimmed, stock: 10, color: 'افتراضي' }]);
    }
    setCustomSizeInput('');
  };

  // Quick Preset Sizes
  const applySizePreset = (preset: 'men' | 'women' | 'all') => {
    if (preset === 'men') {
      setVariants([
        { size: '41', stock: 10, color: 'افتراضي' },
        { size: '42', stock: 10, color: 'افتراضي' },
        { size: '43', stock: 10, color: 'افتراضي' },
        { size: '44', stock: 10, color: 'افتراضي' },
        { size: '45', stock: 10, color: 'افتراضي' },
      ]);
    } else if (preset === 'women') {
      setVariants([
        { size: '37', stock: 10, color: 'افتراضي' },
        { size: '38', stock: 10, color: 'افتراضي' },
        { size: '39', stock: 10, color: 'افتراضي' },
        { size: '40', stock: 10, color: 'افتراضي' },
        { size: '41', stock: 10, color: 'افتراضي' },
      ]);
    } else {
      setVariants([
        { size: '38', stock: 8, color: 'افتراضي' },
        { size: '39', stock: 8, color: 'افتراضي' },
        { size: '40', stock: 10, color: 'افتراضي' },
        { size: '41', stock: 12, color: 'افتراضي' },
        { size: '42', stock: 12, color: 'افتراضي' },
        { size: '43', stock: 10, color: 'افتراضي' },
        { size: '44', stock: 8, color: 'افتراضي' },
        { size: '45', stock: 6, color: 'افتراضي' },
      ]);
    }
  };

  // Reset Form for Adding Another Product
  const handleResetForm = () => {
    setNameAr('');
    setNameEn('');
    setPrice('');
    setDiscountPrice('');
    setSku(`FM-${Math.floor(1000 + Math.random() * 9000)}`);
    setDescriptionAr('');
    setImages([]);
    setVariants([
      { size: '41', stock: 10, color: 'افتراضي' },
      { size: '42', stock: 10, color: 'افتراضي' },
      { size: '43', stock: 10, color: 'افتراضي' },
      { size: '44', stock: 10, color: 'افتراضي' },
      { size: '45', stock: 10, color: 'افتراضي' },
    ]);
    setSuccessProduct(null);
    setErrorMessage(null);
  };

  // Submit Product to Server
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!nameAr.trim()) {
      setErrorMessage('يرجى كتابة اسم المنتج بالعربية');
      return;
    }

    if (!price || Number(price) <= 0) {
      setErrorMessage('يرجى تحديد سعر صالح للمنتج');
      return;
    }

    if (variants.length === 0) {
      setErrorMessage('يرجى تحديد مقاس واحد على الأقل للمنتج');
      return;
    }

    // Default image if admin didn't upload any
    const finalImages =
      images.length > 0
        ? images
        : [
            {
              image_url:
                'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
              is_primary: true,
            },
          ];

    setIsSubmitting(true);

    try {
      const payload = {
        name_ar: nameAr.trim(),
        name_en: nameEn.trim() || undefined,
        sku: sku.trim(),
        category_id: categoryId ? Number(categoryId) : undefined,
        price: Number(price),
        discount_price: discountPrice ? Number(discountPrice) : null,
        description_ar:
          descriptionAr.trim() ||
          `حذاء وموديل طبي عالي الجودة ومريح للقدمين من خطوات، مصمم لنعومة وراحة تدوم طوال اليوم.`,
        description_en: undefined,
        is_featured: isFeatured,
        is_bestseller: isBestseller,
        is_active: true,
        images: finalImages,
        variants: variants.map((v) => ({
          size: String(v.size),
          stock: Number(v.stock) || 0,
          color: v.color || 'افتراضي',
          sku: `${sku}-${v.size}`,
        })),
      };

      const res = await createAdminProduct(payload);

      setSuccessProduct(res.product);

      if (onSuccess) {
        onSuccess(res.product);
      }
    } catch (err: any) {
      console.error('Error adding product:', err);
      setErrorMessage(err.message || 'فشل حفظ المنتج في قاعدة البيانات');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden text-right">
      {/* Header Banner */}
      <div className="bg-gradient-to-l from-stone-900 via-stone-850 to-stone-900 text-white p-6 sm:p-7 border-b border-stone-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="bg-amber-500 text-stone-950 text-[10px] font-black px-2.5 py-0.5 rounded-md inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>لوحة تحكم المنتجات (خاص بالمسؤول)</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Package className="w-6 h-6 text-amber-400" />
              <span>{activeView === 'add' ? 'إضافة حذاء أو كروكس جديد إلى المتجر' : 'إدارة وحذف منتجات المتجر'}</span>
            </h2>
            <p className="text-xs text-stone-300 max-w-xl leading-relaxed">
              {activeView === 'add'
                ? 'اكتب اسم المنتج، ارفع صوره مباشرة من معرض الهاتف أو الكمبيوتر، وأضف المقاسات التي تريدها مع السعر.'
                : 'استعرض جميع المنتجات المضافة في متجرك، مع إمكانية حذف أي موديل نهائياً أو تعطيل ظهوره بضغطة زر.'}
            </p>
          </div>

          {isModal && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="self-start sm:self-auto w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center cursor-pointer transition"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Sub Navigation Switcher: Add vs Manage/Delete */}
      <div className="bg-stone-100 p-2.5 border-b border-stone-200 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => {
            setActiveView('add');
            setSuccessProduct(null);
          }}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition cursor-pointer ${
            activeView === 'add'
              ? 'bg-amber-500 text-stone-950 shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/70'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>+ إضافة منتج جديد للمتجر</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('manage')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition cursor-pointer ${
            activeView === 'manage'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-stone-700 hover:text-rose-600 hover:bg-rose-50'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          <span>🗑️ حذف وإدارة المنتجات الحالية</span>
        </button>
      </div>

      {/* View: Manage & Delete Products */}
      {activeView === 'manage' ? (
        <div className="p-6 sm:p-8">
          <ManageProductsList
            onAddNewProduct={() => {
              setActiveView('add');
              setSuccessProduct(null);
            }}
            onViewProduct={(p) => {
              if (onSuccess) onSuccess(p);
            }}
          />
        </div>
      ) : successProduct ? (
        <div className="p-8 sm:p-12 text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-2xl font-black text-stone-900">تم إضافة المنتج بنجاح إلى المتجر!</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              أصبح موديل <strong className="text-amber-600 font-bold">"{successProduct.name_ar}"</strong> معروضاً الآن
              للعملاء ومتاحاً للشراء في الصفحة الرئيسية وقسم الكتالوج.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={handleResetForm}
              className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-black px-6 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-lg cursor-pointer active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة حذاء آخر جديد</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('manage')}
              className="bg-stone-900 hover:bg-stone-800 text-amber-400 font-black px-6 py-3 rounded-2xl text-xs flex items-center gap-2 cursor-pointer shadow-md transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>إدارة وحذف المنتجات</span>
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold px-5 py-3 rounded-2xl text-xs cursor-pointer transition"
              >
                العودة للوحة المنتجات
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Form Content */
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-7 text-xs">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-3 font-bold text-xs shadow-xs">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ========================================================
              SECTION 1: PRODUCT NAME & BASIC INFO
          ======================================================== */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-stone-900 font-black text-sm border-b border-stone-100 pb-2">
              <Tag className="w-4 h-4 text-amber-500" />
              <span>1. اسم وبيانات المنتج الأساسية</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Product Name Arabic */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-stone-800 block text-xs">
                  اسم الحذاء / المنتج بالعربية *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: شبشب كروكس طبي كلاسيك أسود مانع للانزلاق"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  className="w-full p-3.5 rounded-2xl border border-stone-300 font-bold text-stone-900 text-xs bg-stone-50/40 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-800 block text-xs">القسم والتصنيف *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full p-3.5 rounded-2xl border border-stone-300 font-bold text-stone-900 text-xs bg-stone-50/40 focus:bg-white focus:ring-2 focus:ring-amber-500 transition cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name_ar}
                    </option>
                  ))}
                  {categories.length === 0 && <option value="1">كروكس وقباقيب طبية</option>}
                </select>
              </div>

              {/* SKU */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-800 block text-xs">كود الموديل (SKU) *</label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="FM-1001"
                  className="w-full p-3.5 rounded-2xl border border-stone-300 font-mono font-bold text-stone-900 text-xs bg-stone-50/40 focus:bg-white focus:ring-2 focus:ring-amber-500 transition"
                />
              </div>

              {/* Base Price */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-800 block text-xs">السعر الأساسي (ج.م) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="390"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-3.5 rounded-2xl border border-stone-300 font-black text-stone-900 text-sm bg-stone-50/40 focus:bg-white focus:ring-2 focus:ring-amber-500 transition"
                />
              </div>

              {/* Discount Price */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-800 block text-xs">
                  سعر العرض أو الخصم (اختياري)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="اتركه فارغاً إذا لا يوجد خصم"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  className="w-full p-3.5 rounded-2xl border border-stone-300 font-black text-rose-600 text-sm bg-stone-50/40 focus:bg-white focus:ring-2 focus:ring-amber-500 transition"
                />
              </div>
            </div>
          </div>

          {/* ========================================================
              SECTION 2: PRODUCT IMAGES (UPLOAD FROM PHONE GALLERY)
          ======================================================== */}
          <div className="space-y-4 pt-2 border-t border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <div className="flex items-center gap-2 text-stone-900 font-black text-sm">
                <ImageIcon className="w-4 h-4 text-amber-500" />
                <span>2. صور المنتج (اختر صورة أو أكثر من معرض هاتفك أو جهازك)</span>
              </div>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-lg">
                {images.length} صور مضافة
              </span>
            </div>

            {/* Gallery Upload Box */}
            <div className="bg-amber-50/50 hover:bg-amber-50/80 border-2 border-dashed border-amber-300 rounded-3xl p-6 sm:p-8 text-center transition group">
              <label className="cursor-pointer block space-y-3">
                <div className="w-14 h-14 bg-amber-500 text-stone-950 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 group-active:scale-95 transition">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-sm sm:text-base font-black text-stone-900 block">
                    اضغط هنا لاختيار صور الحذاء من معرض الهاتف أو الاستوديو 📸
                  </span>
                  <span className="text-[11px] text-stone-500 block mt-1">
                    يمكنك تحديد صورة واحدة أو عدة صور معاً (PNG, JPG, WebP)
                  </span>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleGalleryUpload}
                  disabled={isUploadingImages}
                  className="hidden"
                />
              </label>

              {isUploadingImages && (
                <div className="inline-flex items-center gap-2 bg-stone-900 text-amber-400 font-bold px-4 py-2 rounded-xl text-xs mt-3 shadow-sm">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>جاري حفظ وتحميل الصور من المعرض...</span>
                </div>
              )}
            </div>

            {/* Uploaded Gallery Grid */}
            {images.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700">
                    الصور المختارة (الصورة المميزة بالنجمة هي الصورة الرئيسية في واجهة المتجر):
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`relative bg-stone-50 rounded-2xl border-2 p-1.5 transition overflow-hidden shadow-xs ${
                        img.is_primary ? 'border-amber-500 shadow-md ring-2 ring-amber-400/30' : 'border-stone-200'
                      }`}
                    >
                      <img
                        src={img.image_url}
                        alt={`صورة ${idx + 1}`}
                        className="w-full h-28 object-cover rounded-xl"
                      />

                      {/* Primary Badge */}
                      {img.is_primary ? (
                        <span className="absolute top-2 right-2 bg-amber-500 text-stone-950 font-black text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                          <Star className="w-3 h-3 fill-stone-950" />
                          الرئيسية
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(idx)}
                          className="absolute top-2 right-2 bg-stone-900/80 hover:bg-stone-900 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-md transition cursor-pointer"
                        >
                          تعيين كرئيسية
                        </button>
                      )}

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute bottom-2 left-2 bg-rose-600 hover:bg-rose-700 text-white p-1.5 rounded-xl shadow-md cursor-pointer transition"
                        title="حذف هذه الصورة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Direct Image URL Option */}
            <div className="pt-2">
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="أو ألصق رابط صورة مباشر هنا (URL)..."
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  className="flex-1 p-3 rounded-2xl border border-stone-300 text-xs bg-stone-50/40 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  disabled={!customImageUrl.trim()}
                  className="bg-stone-800 hover:bg-stone-900 disabled:opacity-40 text-stone-200 font-bold px-4 py-2.5 rounded-2xl text-xs cursor-pointer transition"
                >
                  إضافة الرابط
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================
              SECTION 3: SIZES & VARIANTS (ADMIN ADDS SIZES)
          ======================================================== */}
          <div className="space-y-4 pt-2 border-t border-stone-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-2">
              <div className="flex items-center gap-2 text-stone-900 font-black text-sm">
                <SlidersHorizontal className="w-4 h-4 text-amber-500" />
                <span>3. مقاسات المنتج والمخزون (حدد المقاسات التي تضيفها بنفسك)</span>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-stone-400 font-bold">تحديد سريع:</span>
                <button
                  type="button"
                  onClick={() => applySizePreset('men')}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold px-2.5 py-1 rounded-xl text-[10px] cursor-pointer transition"
                >
                  رجالي (41-45)
                </button>
                <button
                  type="button"
                  onClick={() => applySizePreset('women')}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold px-2.5 py-1 rounded-xl text-[10px] cursor-pointer transition"
                >
                  حريمي (37-41)
                </button>
                <button
                  type="button"
                  onClick={() => applySizePreset('all')}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold px-2.5 py-1 rounded-xl text-[10px] cursor-pointer transition"
                >
                  شامل (38-45)
                </button>
              </div>
            </div>

            {/* Quick Toggle Standard Size Chips */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-700 block">
                اضغط على أي مقاس لإضافته أو إزالته فوراً:
              </span>
              <div className="flex flex-wrap gap-2">
                {standardSizes.map((sz) => {
                  const isSelected = variants.some((v) => String(v.size) === String(sz));
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => toggleSize(sz)}
                      className={`w-11 h-11 rounded-2xl font-black text-sm flex items-center justify-center cursor-pointer transition border ${
                        isSelected
                          ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-md scale-105 ring-2 ring-amber-400/30'
                          : 'bg-white text-stone-600 border-stone-300 hover:border-stone-400 hover:bg-stone-50'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Size Typed by Admin */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="أدخل أي مقاس آخر تريده (مثال: 47 أو 36 أو فري سايز)..."
                value={customSizeInput}
                onChange={(e) => setCustomSizeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomSize();
                  }
                }}
                className="flex-1 max-w-sm p-3 rounded-2xl border border-stone-300 text-xs bg-stone-50/40 focus:bg-white"
              />
              <button
                type="button"
                onClick={handleAddCustomSize}
                disabled={!customSizeInput.trim()}
                className="bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-amber-400 font-black px-4 py-3 rounded-2xl text-xs cursor-pointer transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ إضافة هذا المقاس</span>
              </button>
            </div>

            {/* Active Selected Sizes Table / Cards */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700">
                  المقاسات المحددة حالياً ({variants.length} مقاس):
                </span>
              </div>

              {variants.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-center text-amber-800 font-bold text-xs">
                  لم يتم تحديد أي مقاس بعد! اضغط على أزرار المقاسات بالأعلى أو اكتب مقاساً مخصصاً.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {variants.map((v, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-stone-50 rounded-2xl border border-stone-200 shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-xl bg-stone-900 text-amber-400 font-black text-sm flex items-center justify-center shadow-xs">
                          {v.size}
                        </span>
                        <div>
                          <span className="text-[10px] text-stone-400 font-bold block">الكمية بالمخزن:</span>
                          <input
                            type="number"
                            min="0"
                            value={v.stock}
                            onChange={(e) => {
                              const updated = [...variants];
                              updated[idx].stock = Number(e.target.value) || 0;
                              setVariants(updated);
                            }}
                            className="w-16 p-1 bg-white border border-stone-300 rounded-lg font-black text-center text-xs text-stone-900"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          placeholder="اللون (اختياري)"
                          value={v.color || ''}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[idx].color = e.target.value;
                            setVariants(updated);
                          }}
                          className="w-20 p-1 bg-white border border-stone-300 rounded-lg text-[11px] text-center"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setVariants((prev) => prev.filter((_, i) => i !== idx));
                          }}
                          className="text-stone-400 hover:text-rose-600 p-1.5 cursor-pointer transition"
                          title="إزالة المقاس"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ========================================================
              SECTION 4: DESCRIPTION & DISPLAY OPTIONS
          ======================================================== */}
          <div className="space-y-4 pt-2 border-t border-stone-200">
            <div className="space-y-1.5">
              <label className="font-bold text-stone-800 block text-xs">
                الوصف التفصيلي والمميزات الطبية للحذاء
              </label>
              <textarea
                rows={3}
                placeholder="اكتب مواصفات المنتج، الراحة، خامة النعل، مقاومة الماء، الدعم الطبي..."
                value={descriptionAr}
                onChange={(e) => setDescriptionAr(e.target.value)}
                className="w-full p-3.5 rounded-2xl border border-stone-300 focus:ring-2 focus:ring-amber-500 text-xs leading-relaxed bg-stone-50/40 focus:bg-white"
              />
            </div>

            <div className="flex flex-wrap gap-5 pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-800">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded-md focus:ring-amber-400"
                />
                <span>عرض في قسم "المميز والمختار"</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-800">
                <input
                  type="checkbox"
                  checked={isBestseller}
                  onChange={(e) => setIsBestseller(e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded-md focus:ring-amber-400"
                />
                <span>وضع شارة "الأكثر طلباً ومبيعاً"</span>
              </label>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-end gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-stone-300 hover:bg-stone-50 font-bold text-stone-700 cursor-pointer transition text-center"
              >
                إلغاء
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-black px-8 py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xl hover:shadow-amber-500/20 active:scale-95 transition cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري حفظ ونشر المنتج في المتجر...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>نشر وعرض الحذاء في المتجر الآن ✨</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
