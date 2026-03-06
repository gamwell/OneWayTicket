import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Ticket } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export default function SuccessPage() {
  const { clearCart } = useCart();
  
  // 1. FIX ERREUR CONSOLE : On utilise useRef pour vider le panier une seule fois
  const hasCleared = useRef(false);

  useEffect(() => {
    if (hasCleared.current) return;

    clearCart();
    hasCleared.current = true;
    console.log("✅ Succès : Panier vidé et navigation prête.");
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-[#1a0525] flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
      
      {/* FOND (Derrière tout le monde) */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/20 via-[#1a0525] to-[#1a0525] z-0 pointer-events-none"></div>

      {/* CONTENU (Devant et Cliquable) */}
      <div className="relative z-10 max-w-lg w-full bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-500">
        
        <div className="flex justify-center mb-6">
          <div className="bg-green-500/20 p-4 rounded-full ring-4 ring-green-500/10">
            <CheckCircle className="w-16 h-16 text-green-400" />
          </div>
        </div>

        <h1 className="text-4xl font-black uppercase italic text-white mb-2 tracking-wide">
          Paiement Validé !
        </h1>
        
        <p className="text-gray-300 mb-8 text-lg">
          Merci pour votre commande. <br/> Vos billets ont été envoyés par email.
        </p>

        {/* Info Box */}
        <div className="bg-white/5 rounded-xl p-4 mb-8 border border-white/5">
            <div className="flex items-center gap-4 text-left">
                <div className="bg-amber-400/20 p-3 rounded-xl">
                    <Ticket className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Prochaine étape</p>
                    <p className="text-sm text-white font-medium">Vérifiez votre boîte mail (et les spams)</p>
                </div>
            </div>
        </div>

        {/* 👇 BOUTONS DE NAVIGATION (Version <Link> optimisée) 👇 */}
        <div className="flex flex-col gap-4">
          
          <Link 
            to="/my-tickets" 
            className="w-full py-4 bg-white text-black font-bold uppercase rounded-xl hover:bg-gray-200 transition transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg shadow-white/10 relative z-50"
          >
            <Ticket size={20} />
            VOIR MES BILLETS
          </Link>

          <Link 
            to="/" 
            className="w-full py-4 bg-transparent border border-white/10 text-white font-bold uppercase rounded-xl hover:bg-white/5 transition flex items-center justify-center gap-2 relative z-50"
          >
            RETOUR À L'ACCUEIL <ArrowRight size={20} />
          </Link>

        </div>

      </div>
    </div>
  );
}