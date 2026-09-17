import React, { createContext, useContext, useState, useEffect } from 'react';
import { getWishlist, toggleWishlist as apiToggleWishlist } from '../services/api';

interface WishlistContextType {
  wishlistIds: number[];
  wishlistItems: any[];
  toggle: (productId: number) => Promise<boolean>;
  isInWishlist: (productId: number) => boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);

  const refreshWishlist = async () => {
    try {
      const res = await getWishlist();
      setWishlistItems(res.items || []);
      setWishlistIds((res.items || []).map((i: any) => i.product_id));
    } catch (e) {
      console.error('Failed to load wishlist:', e);
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, []);

  const toggle = async (productId: number): Promise<boolean> => {
    try {
      const res = await apiToggleWishlist(productId);
      if (res.inWishlist) {
        setWishlistIds((prev) => [...prev, productId]);
      } else {
        setWishlistIds((prev) => prev.filter((id) => id !== productId));
      }
      await refreshWishlist();
      return res.inWishlist;
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
      return false;
    }
  };

  const isInWishlist = (productId: number) => wishlistIds.includes(productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistItems,
        toggle,
        isInWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return ctx;
}
