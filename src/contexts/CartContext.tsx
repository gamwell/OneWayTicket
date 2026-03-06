import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";

import { supabase } from "../supabaseClient";
import { useAuth } from "./AuthContext";

export type CartItem = {
  id: string;
  stripe_price_id: string;
  title: string;
  price: number;
  image_url?: string;
  date?: string;
  location?: string;
  quantity: number;
};

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  total: number;
  count: number;
  syncCartFromSupabase: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = "onewayticket_cart_v2";

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart doit être utilisé à l'intérieur d'un CartProvider");
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // 🔥 Flag pour bloquer la fusion après clearCart
  const justCleared = useRef(false);
  // Flag pour éviter la fusion au premier montage si déjà fait
  const hasMerged = useRef(false);

  // --- CHARGEMENT INITIAL ---
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      setCart(stored ? JSON.parse(stored) : []);
    } catch {
      setCart([]);
    }
  }, []);

  // --- SAUVEGARDE LOCALE ---
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  // --- SYNCHRONISATION SUPABASE ---
  const syncCartFromSupabase = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("user_cart")
      .select("cart")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("[Cart] Erreur chargement Supabase:", error);
      return;
    }

    if (data?.cart) {
      setCart(data.cart);
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data.cart));
    }
  };

  const saveCartToSupabase = async (updatedCart: CartItem[]) => {
    if (!user) return;
    const { error } = await supabase.from("user_cart").upsert({
      user_id: user.id,
      cart: updatedCart,
      updated_at: new Date().toISOString(),
    });
    if (error) console.error("[Cart] Erreur sauvegarde Supabase:", error);
  };

  // --- FUSION PANIER LOCAL + SUPABASE APRÈS LOGIN ---
  useEffect(() => {
    const mergeCarts = async () => {
      if (!user) return;

      // 🔥 Si on vient de vider le panier, on ne fusionne pas
      if (justCleared.current) {
        justCleared.current = false;
        return;
      }

      // 🔥 Ne fusionner qu'une seule fois par session
      if (hasMerged.current) return;
      hasMerged.current = true;

      const localCart = cart;
      const { data } = await supabase
        .from("user_cart")
        .select("cart")
        .eq("user_id", user.id)
        .maybeSingle();

      const remoteCart = data?.cart || [];

      // Si le panier distant est vide, ne pas écraser
      if (remoteCart.length === 0 && localCart.length === 0) return;

      const merged = [...remoteCart];
      localCart.forEach((localItem) => {
        const existing = merged.find((i) => i.id === localItem.id);
        if (existing) {
          existing.quantity = Math.max(existing.quantity, localItem.quantity);
        } else {
          merged.push(localItem);
        }
      });

      setCart(merged);
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(merged));
      saveCartToSupabase(merged);
    };

    mergeCarts();
  }, [user]);

  // --- ACTIONS ---
  const addToCart = (newItem: Omit<CartItem, "quantity">) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === newItem.id);
      const updated = existing
        ? prev.map((i) => i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { ...newItem, quantity: 1 }];
      saveCartToSupabase(updated);
      return updated;
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const updated = prev.filter((i) => i.id !== itemId);
      saveCartToSupabase(updated);
      return updated;
    });
  };

  const clearCart = () => {
    // 🔥 Marquer que le panier vient d'être vidé
    justCleared.current = true;
    hasMerged.current = false;
    setCart([]);
    localStorage.removeItem(CART_STORAGE_KEY);
    saveCartToSupabase([]);
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const count = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, total, count, syncCartFromSupabase }}
    >
      {children}
    </CartContext.Provider>
  );
};
