import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase'; 
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext'; 
import { 
  ShoppingBag, 
  CreditCard, 
  Trash2, 
  ArrowLeft, 
  Loader2, 
  TicketCheck 
} from 'lucide-react';

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, total, removeFromCart } = useCart();
  
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    // 1. Protection : Utilisateur connecté ?
    if (!user) {
      alert("Vous devez être connecté pour finaliser votre achat !");
      navigate('/auth/login', { state: { from: { pathname: '/cart' } } });
      return;
    }

    if (cart.length === 0) return;

    setIsLoading(true);

    try {
      /**
       * ÉTAPE A : Pré-enregistrement des billets dans Supabase
       * Nous créons les billets avec un statut 'pending' ou similaire si nécessaire.
       */
      const ticketsToInsert = cart.map(item => ({
        user_id: user.id,
        event_id: item.id, 
        final_price: item.price,
        // On génère un hash unique temporaire pour le QR Code
        qr_code_hash: "OWT-" + Math.random().toString(36).substring(2, 15).toUpperCase(),
        scanned_at: null // Défini par défaut, mais explicite pour la clarté
      }));

      const { error: dbError } = await supabase
        .from('tickets')
        .insert(ticketsToInsert);

      if (dbError) {
        console.error("Erreur DB Supabase:", dbError);
        throw new Error("Impossible de préparer vos billets. Veuillez réessayer.");
      }

      /**
       * ÉTAPE B : Lancement de la session Stripe
       */
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4242';
      
      const response = await fetch(`${backendUrl}/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items: cart,
          email: user.email,
          userId: user.id 
        }), 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur de communication avec Stripe");
      }

      const data = await response.json();

      if (data.url) {
        // Redirection vers l'interface de paiement Stripe
        window.location.href = data.url;
      } else {
        throw new Error("L'URL de paiement n'a pas été générée.");
      }
      
    } catch (error: any) {
      console.error("Erreur générale paiement:", error);
      alert(error.message || "Une erreur technique est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  // État : Panier Vide
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4 font-sans">
        <div className="bg-white/5 p-12 rounded-[3rem] border border-white/10 text-center max-w-md backdrop-blur-xl">
          <ShoppingBag className="mx-auto text-slate-700 mb-6" size={64} />
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-4">Votre panier est vide</h2>
          <button 
            onClick={() => navigate('/events')}
            className="px-8 py-4 bg-cyan-500 text-slate-900 font-black rounded-2xl uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-cyan-500/20"
          >
            Explorer les Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e1b4b] text-white pt-24 pb-20 px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold uppercase text-[10px] tracking-[0.2em]">
            <ArrowLeft size={16} /> Retour boutique
          </button>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
            Checkout
          </h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Liste des articles */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-5 flex items-center gap-6 group hover:border-cyan-500/40 transition-all">
                <img src={item.image_url} alt={item.title} className="w-24 h-24 object-cover rounded-2xl border border-white/5 shadow-2xl" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold uppercase tracking-tighter italic leading-none">{item.title}</h3>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">
                    {item.date ? new Date(item.date).toLocaleDateString('fr-FR') : 'Date à confirmer'}
                  </p>
                  <p className="text-cyan-400 font-black mt-1 text-xl">{item.price} €</p>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-lg"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Résumé de la commande */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-[2.5rem] p-8 sticky top-28 shadow-2xl">
              <h2 className="text-xl font-black italic tracking-tighter uppercase mb-6 flex items-center gap-2">
                <TicketCheck className="text-pink-500" /> Total
              </h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-slate-400 text-xs font-bold uppercase tracking-widest">
                  <span>Billets ({cart.length})</span>
                  <span>{total} €</span>
                </div>
                <div className="flex justify-between text-slate-400 text-xs font-bold uppercase tracking-widest italic">
                  <span>Taxe & Service</span>
                  <span className="text-emerald-400">Inclus</span>
                </div>
                <div className="border-t border-white/10 pt-4 flex justify-between items-end">
                  <span className="font-bold text-[10px] uppercase tracking-[0.3em] text-slate-500">Net à payer</span>
                  <span className="text-4xl font-black text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]">
                    {total} €
                  </span>
                </div>
              </div>

              <button 
                onClick={handlePayment}
                disabled={isLoading}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 font-black text-slate-900 uppercase tracking-widest text-lg shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all hover:-translate-y-1 disabled:opacity-50 flex justify-center items-center gap-3"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin w-6 h-6" />
                ) : (
                  <>
                    <CreditCard size={20} /> Payer maintenant
                  </>
                )}
              </button>
              
              <div className="mt-8 pt-6 border-t border-white/5">
                <p className="text-[9px] text-center text-slate-500 uppercase tracking-widest font-black leading-relaxed">
                  Paiement sécurisé par Stripe<br/>
                  Billets digitaux envoyés par Email
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CartPage;