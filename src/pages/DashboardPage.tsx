"use client"

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';
import { Ticket, User, Calendar, ArrowRight, Loader2, MapPin, Trash2, RefreshCw } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

const DashboardPage = () => {
  const { user, profile } = useAuth();
  const { clearCart } = useCart();
  const [searchParams] = useSearchParams();
  
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- LOGIQUE DE VIDAGE DU PANIER ---
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    
    if (paymentStatus === 'success') {
      console.log("💳 Détection d'un paiement réussi. Tentative de vidage du panier...");
      
      // On appelle la fonction de vidage
      clearCart();

      // On nettoie l'URL pour éviter de vider le panier à nouveau au prochain refresh
      // On attend un micro-instant pour s'assurer que clearCart a commencé
      setTimeout(() => {
        window.history.replaceState({}, '', window.location.pathname);
        console.log("🧹 URL nettoyée et panier normalement vide.");
      }, 100);
    }
  }, [searchParams, clearCart]);

  // --- LE RESTE DE TON CODE (Chargement des billets) ---
  const fetchUserTickets = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          event:event_id (title, date, location, image_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (err) {
      console.error("Erreur chargement billets:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserTickets();
  }, [fetchUserTickets]);

  // ... (Garde tes fonctions handleDelete et ton return tel quel)
  return (
    <div className="min-h-screen bg-[#1a0525] text-white pt-28 px-6 pb-20">
      {/* ... reste de ton JSX ... */}
    </div>
  );
};

export default DashboardPage;