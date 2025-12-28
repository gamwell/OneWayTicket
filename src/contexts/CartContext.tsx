import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Définition des types
export type CartItem = {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventImage: string;
  ticketTypeId: string;
  ticketTypeName: string;
  price: number;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (ticketTypeId: string) => void;
  updateQuantity: (ticketTypeId: string, delta: number) => void;
  clearCart: () => void;
  total: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  // 1. CHARGEMENT : On regarde si un panier existe déjà dans la mémoire
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // 2. SAUVEGARDE : Dès que le panier change, on l'écrit dans la mémoire
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (newItem: Omit<CartItem, 'quantity'>) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.ticketTypeId === newItem.ticketTypeId
      );

      if (existingItem) {
        return currentCart.map((item) =>
          item.ticketTypeId === newItem.ticketTypeId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, { ...newItem, quantity: 1 }];
    });
  };

  const removeFromCart = (ticketTypeId: string) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.ticketTypeId !== ticketTypeId)
    );
  };

  const updateQuantity = (ticketTypeId: string, delta: number) => {
    setCart((currentCart) =>
      currentCart.map((item) => {
        if (item.ticketTypeId === ticketTypeId) {
          const newQuantity = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, total }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};