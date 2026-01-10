import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image_url: string;
  date: string;
  location: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: (shouldConfirm?: boolean) => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem('onewayticket_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('onewayticket_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = useCallback((item: CartItem) => {
    setCart((prevCart) => {
      if (prevCart.some((i) => i.id === item.id)) return prevCart;
      return [...prevCart, item];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
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

  // OPTIMISATION : Calculs mémoïsés pour éviter les calculs inutiles
  const total = useMemo(() => {
    return cart.reduce((acc, item) => acc + (Number(item.price) || 0), 0);
  }, [cart]);

  const itemCount = useMemo(() => cart.length, [cart]);

  // OPTIMISATION : Mémoïser la valeur du contexte pour éviter de re-render les consommateurs
  const value = useMemo(() => ({
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    total,
    itemCount
  }), [cart, addToCart, removeFromCart, clearCart, total, itemCount]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart doit être utilisé à l’intérieur de CartProvider');
  }
  return context;
};