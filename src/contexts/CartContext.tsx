"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';

export interface CartItem {
  id: string;       // IMPORTANT : C'est le ticket_type_id pour Stripe
  event_id: string;  // Pour référence
  title: string;
  price: number;
  image_url: string;
  date: string;
  location: string;
  quantity: number; 
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (id: string) => void;
  clearCart: (shouldConfirm?: boolean) => void;
  total: number;
  itemCount: number;
  isInCart: (id: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'onewayticket_cart_v2'; // Changé en v2 pour forcer le nettoyage des anciennes données corrompues

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const savedCart = localStorage.getItem(STORAGE_KEY);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Erreur lecture panier:", error);
      return [];
    }
  });

  // Sauvegarde auto
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
  }, [cart]);

  // Sync entre onglets
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setCart(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setCart((prevCart) => {
      const exists = prevCart.some((i) => String(i.id) === String(item.id));
      if (exists) return prevCart;
      
      // NETTOYAGE DU PRIX : Sécurité contre le NaN
      // On transforme en string, on enlève tout ce qui n'est pas chiffre ou point, puis on repasse en Number
      const rawPrice = String(item.price).replace(/[^\d.-]/g, '');
      const cleanPrice = parseFloat(rawPrice) || 0;

      const newItem: CartItem = { 
        ...item, 
        price: cleanPrice,
        quantity: item.quantity || 1 
      };
      return [...prevCart, newItem];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prevCart) => prevCart.filter((item) => String(item.id) !== String(id)));
  }, []);

  const clearCart = useCallback((shouldConfirm: boolean = false) => {
    if (shouldConfirm) {
      if (window.confirm("Voulez-vous vraiment vider votre panier ?")) {
        setCart([]);
      }
    } else {
      setCart([]);
    }
  }, []);

  const isInCart = useCallback((id: string) => {
    return cart.some((item) => String(item.id) === String(id));
  }, [cart]);

  // CALCUL DU TOTAL : Sécurité supplémentaire
  const total = useMemo(() => {
    return cart.reduce((acc, item) => {
      const p = Number(item.price) || 0;
      const q = Number(item.quantity) || 1;
      return acc + (p * q);
    }, 0);
  }, [cart]);

  const itemCount = useMemo(() => cart.length, [cart]);

  const value = useMemo(() => ({
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    total,
    itemCount,
    isInCart
  }), [cart, addToCart, removeFromCart, clearCart, total, itemCount, isInCart]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart doit être utilisé dans CartProvider');
  return context;
};