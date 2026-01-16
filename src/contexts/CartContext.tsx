"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';

export interface CartItem {
  id: string;
  event_id: string;
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

const STORAGE_KEY = 'onewayticket_cart_v2'; 

export const CartProvider = ({ children }: { children: ReactNode }) => {
  
  // --- INITIALISATION BLINDÉE ---
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];

    // 👇 1. DÉTECTION INTELLIGENTE STRIPE
    // On regarde si l'URL contient les traces d'un paiement Stripe
    const params = new URLSearchParams(window.location.search);
    const isStripeReturn = params.has('payment_intent') || 
                           params.has('payment_intent_client_secret') ||
                           params.has('redirect_status');

    // 👇 2. DÉTECTION DE VOS MOTS CLÉS (Au cas où)
    const path = window.location.pathname.toLowerCase();
    const isSuccessPage = path.includes('success') || 
                          path.includes('confirmation') || 
                          path.includes('merci') ||
                          path.includes('valide');

    if (isStripeReturn || isSuccessPage) {
      console.log("💳 Retour de paiement détecté : Panier forcé à VIDE.");
      
      // On nettoie tout immédiatement
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('onewayticket_cart');
      localStorage.removeItem('cart');
      localStorage.removeItem('panier');
      
      return []; // On démarre vide !
    }

    // Sinon, on charge normalement
    try {
      const savedCart = localStorage.getItem(STORAGE_KEY);
      if (savedCart) return JSON.parse(savedCart);
    } catch (error) {
      console.error("Erreur lecture panier:", error);
    }
    return [];
  });

  // Sauvegarde automatique
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (cart.length === 0) {
        // Si le panier est vide dans le state, on vide le stockage aussi
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
      }
    }
  }, [cart]);

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setCart((prevCart) => {
      const exists = prevCart.some((i) => String(i.id) === String(item.id));
      if (exists) return prevCart;
      
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
    const performClear = () => {
      setCart([]); 
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    };

    if (shouldConfirm) {
      if (window.confirm("Voulez-vous vraiment vider votre panier ?")) {
        performClear();
      }
    } else {
      performClear();
    }
  }, []);

  const isInCart = useCallback((id: string) => {
    return cart.some((item) => String(item.id) === String(id));
  }, [cart]);

  const total = useMemo(() => {
    return cart.reduce((acc, item) => {
      const p = Number(item.price) || 0;
      const q = Number(item.quantity) || 1;
      return acc + (p * q);
    }, 0);
  }, [cart]);

  const itemCount = useMemo(() => cart.length, [cart]);

  const value = useMemo(() => ({
    cart, addToCart, removeFromCart, clearCart, total, itemCount, isInCart
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