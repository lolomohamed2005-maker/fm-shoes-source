import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem } from '../types';
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeCartItem as apiRemoveCartItem,
  clearCart as apiClearCart,
  validateCoupon as apiValidateCoupon,
} from '../services/api';

interface AppliedCoupon {
  code: string;
  discount_type: 'PERCENTAGE' | 'FIXED';
  discount_value: number;
  discountAmount: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  freeShippingThreshold: number;
  freeShippingRemaining: number;
  isFreeShipping: boolean;
  appliedCoupon: AppliedCoupon | null;
  couponError: string | null;
  isCartOpen: boolean;
  isLoading: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (productId: number, variantId: number, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  clear: () => Promise<void>;
  applyCouponCode: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const freeShippingThreshold = 1000; // Free shipping above 1000 EGP

  const refreshCart = useCallback(async () => {
    try {
      const res = await getCart();
      setItems(res.items || []);
      setSubtotal(res.subtotal || 0);

      // Re-validate coupon against new subtotal if active
      if (appliedCoupon && res.subtotal > 0) {
        try {
          const couponRes = await apiValidateCoupon(appliedCoupon.code, res.subtotal);
          setAppliedCoupon({
            code: couponRes.code,
            discount_type: couponRes.discount_type,
            discount_value: couponRes.discount_value,
            discountAmount: couponRes.discountAmount,
          });
        } catch (err) {
          setAppliedCoupon(null);
        }
      }
    } catch (e) {
      console.error('Failed to refresh cart:', e);
    }
  }, [appliedCoupon]);

  useEffect(() => {
    refreshCart();
  }, []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - subtotal);
  const baseShipping = 45;
  const shippingCost = items.length === 0 ? 0 : isFreeShipping ? 0 : baseShipping;
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const totalAmount = Math.max(0, subtotal - discount) + shippingCost;

  const addItem = async (productId: number, variantId: number, quantity: number = 1) => {
    setIsLoading(true);
    try {
      await apiAddToCart(productId, variantId, quantity);
      await refreshCart();
      setIsCartOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(cartItemId);
      return;
    }
    setIsLoading(true);
    try {
      await apiUpdateCartItem(cartItemId, quantity);
      await refreshCart();
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (cartItemId: number) => {
    setIsLoading(true);
    try {
      await apiRemoveCartItem(cartItemId);
      await refreshCart();
    } finally {
      setIsLoading(false);
    }
  };

  const clear = async () => {
    setIsLoading(true);
    try {
      await apiClearCart();
      setItems([]);
      setSubtotal(0);
      setAppliedCoupon(null);
    } finally {
      setIsLoading(false);
    }
  };

  const applyCouponCode = async (code: string): Promise<boolean> => {
    setCouponError(null);
    try {
      const res = await apiValidateCoupon(code, subtotal);
      setAppliedCoupon({
        code: res.code,
        discount_type: res.discount_type,
        discount_value: res.discount_value,
        discountAmount: res.discountAmount,
      });
      return true;
    } catch (err: any) {
      setCouponError(err.message || 'كود الخصم غير صالح');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  return (
    <CartContext.Provider
      value={{
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
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        addItem,
        updateQuantity,
        removeItem,
        clear,
        applyCouponCode,
        removeCoupon,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
