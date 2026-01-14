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
  TicketCheck,
  Sparkles 
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
      navigate('/auth/login', { state: { from: '/cart' } });
      return;
    }

    if (cart.length === 0) return;

    setIsLoading(true);

    try {
      /**
       * ÉTAPE : Appel de l'Edge Function Supabase
       */
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: { 
          priceId: cart[0].stripe_price_id, 
          cartItems: cart, 
          userEmail: user.email
        },
      });

      if (error) throw error;

      // 2. Redirection vers l'URL Stripe
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("L'URL de paiement n'a pas été générée par le système.");
      }
      
    } catch (error: any) {
      console.error("Erreur générale paiement:", error);
      alert(error.message || "Une erreur technique est survenue avec le service de paiement.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- ÉTAT : PANIER VIDE (Design uniformisé) ---
  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans text-white relative overflow-hidden"
           style={{ background: '#1a0525' }}>
        
        {/* Auras de fond */}
        <div className="fixed inset-0 z-[0] pointer-events-none">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }}></div>
          <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-rose-500/15 blur-[130px] rounded-full"></div>
          <div className="absolute bottom-[5%] right-[-5%] w-[60%] h-[60%] bg-amber-400/10 blur-[160px] rounded-full"></div>
        </div>

        <div className="bg-white/5 p-12 rounded-[3rem] border border-white/10 text-center max-w-md backdrop-blur-xl relative z-10 shadow-2xl">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <ShoppingBag className="text-white/20" size={40} />
          </div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-4 text-white">Panier vide</h2>
          <p className="text-rose-100/50 mb-8 font-medium">Votre aventure commence par un billet.</p>
          <button 
            onClick={() => navigate('/events')}
            className="px-8 py-4 bg-white text-[#1a0525] font-black rounded-2xl uppercase tracking-widest hover:bg-amber-300 hover:scale-105 transition-all shadow-lg"
          >
            Explorer les Events
          </button>
        </div>
      </div>
    );
  }

  // --- ÉTAT : PANIER REMPLI ---
  return (
    <div className="min-h-screen text-white pt-24 pb-20 px-4 font-sans relative overflow-hidden"
         style={{ background: '#1a0525' }}>

      {/* --- BACKGROUND TROPICAL LUXE --- */}
      <div className="fixed inset-0 z-[0] pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }}></div>
        {/* Rose (Haut Droite) */}
        <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-rose-500/15 blur-[150px] rounded-full animate-pulse"></div>
        {/* Ambre (Bas Gauche) */}
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-amber-400/10 blur-[180px] rounded-full"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-rose-200/50 hover:text-white transition-colors font-bold uppercase text-[10px] tracking-[0.2em] group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Retour boutique
          </button>
          
          <div className="text-right">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase mb-2 text-amber-200">
                <Sparkles size={10} className="text-amber-300" /> Checkout
              </div>
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-white drop-shadow-lg">
              Mon <span className="bg-gradient-to-r from-rose-400 via-amber-300 to-orange-400 bg-clip-text text-transparent">Panier</span>
            </h1>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Liste des articles */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-5 flex items-center gap-6 group hover:bg-white/10 hover:border-amber-300/30 transition-all shadow-lg">
                
                {/* Image */}
                <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden border border-white/5 shadow-2xl relative">
                   <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                   <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-black uppercase tracking-tighter italic leading-none text-white mb-2">{item.title}</h3>
                  <div className="inline-block px-2 py-1 bg-black/20 rounded-md border border-white/5">
                    <p className="text-rose-100/60 text-[10px] font-black uppercase tracking-widest">
                      {item.date ? new Date(item.date).toLocaleDateString('fr-FR') : 'Date à confirmer'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-amber-300 font-black text-2xl mb-2">{item.price} €</p>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-white/20 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Résumé de la commande */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 sticky top-28 shadow-2xl">
              <h2 className="text-xl font-black italic tracking-tighter uppercase mb-8 flex items-center gap-2 text-white">
                <TicketCheck className="text-amber-300" /> Récapitulatif
              </h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-rose-100/60 text-xs font-bold uppercase tracking-widest">
                  <span>Billets ({cart.length})</span>
                  <span>{total} €</span>
                </div>
                <div className="flex justify-between text-rose-100/60 text-xs font-bold uppercase tracking-widest italic">
                  <span>Frais de service</span>
                  <span className="text-teal-300 font-black">OFFERT</span>
                </div>
                
                <div className="h-[1px] bg-white/10 my-4"></div>
                
                <div className="flex justify-between items-end">
                  <span className="font-bold text-[10px] uppercase tracking-[0.3em] text-white/40 mb-1">Total à payer</span>
                  <span className="text-4xl font-black text-amber-300 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                    {total} €
                  </span>
                </div>
              </div>

              <button 
                onClick={handlePayment}
                disabled={isLoading}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-amber-300 to-rose-500 font-black text-[#1a0525] uppercase tracking-widest text-lg shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 transition-all hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 flex justify-center items-center gap-3"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin w-6 h-6" />
                ) : (
                  <>
                    <CreditCard size={20} /> Paiement
                  </>
                )}
              </button>
              
              <div className="mt-8 text-center">
                <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold leading-relaxed">
                  Paiement sécurisé via Stripe<br/>
                  Billets envoyés par email instantanément
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