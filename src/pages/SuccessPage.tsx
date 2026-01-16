import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, Home, ArrowRight, Download, Trash2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext'; // Vérifiez le chemin
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ... (Gardez votre composant InvoiceButton ici tel quel) ...
// Pour gagner de la place, je ne remets pas le code du bouton InvoiceButton 
// car il est correct, insérez-le ici.
const InvoiceButton = ({ orderId }: { orderId: string }) => { return <button>Facture (Placeholder)</button> }


// --- DEBUGGER TEMPORAIRE ---
const StorageDebugger = () => {
  const [keys, setKeys] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setKeys(Object.keys(localStorage));
    }
  }, []);

  return (
    <div className="fixed bottom-0 left-0 w-full bg-black text-green-400 p-4 text-xs font-mono z-50 border-t border-green-500 opacity-90">
      <h3 className="font-bold mb-2 text-white">🕵️ OUTIL DE DIAGNOSTIC (À supprimer avant mise en prod)</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <strong className="text-white">Clés trouvées dans LocalStorage :</strong>
          <ul className="list-disc pl-4 mt-1">
            {keys.map(key => (
              <li key={key}>
                {key}: <span className="text-white">{localStorage.getItem(key)?.slice(0, 50)}...</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
           <button 
             onClick={() => { localStorage.clear(); window.location.reload(); }}
             className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
           >
             <Trash2 className="inline w-4 h-4 mr-1"/> TOUT EFFACER & RECHARGER
           </button>
           <p className="mt-2 text-gray-400">Si le panier persiste, cliquez sur ce bouton rouge.</p>
        </div>
      </div>
    </div>
  );
};

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const { clearCart, cart } = useCart();
  const orderId = searchParams.get('orderId');
  const hasCleared = useRef(false);

  useEffect(() => {
    if (!hasCleared.current) {
      console.log("Exécution du nettoyage du panier...");
      
      // 1. Appel Context
      clearCart(false);
      
      // 2. Force Brute supplémentaire
      localStorage.removeItem('onewayticket_cart_v2');
      localStorage.setItem('onewayticket_cart_v2', '[]'); // On écrase

      hasCleared.current = true;
    }
  }, [clearCart]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-6 font-sans pb-32">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] text-center shadow-2xl relative overflow-hidden">
        
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl"></div>
        
        <div className="flex justify-center mb-8">
          <div className="p-5 rounded-full bg-emerald-500/10 border-2 border-emerald-500 animate-bounce">
            <CheckCircle2 size={48} className="text-emerald-500" />
          </div>
        </div>

        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-4">
          Paiement <span className="text-cyan-400">Validé</span>
        </h1>
        
        {/* INDICATEUR D'ÉTAT DU PANIER */}
        {cart.length > 0 ? (
           <p className="text-red-400 font-bold bg-red-900/20 p-2 rounded mb-4">
             ⚠️ ATTENTION : Le panier contient encore {cart.length} articles !
             <br/> Regardez le panneau noir en bas.
           </p>
        ) : (
           <p className="text-emerald-400 font-bold bg-emerald-900/20 p-2 rounded mb-4">
             ✅ Le panier est bien vide.
           </p>
        )}

        <p className="text-slate-400 mb-8 leading-relaxed">
          Votre transaction a été traitée avec succès.
        </p>

        {orderId && (
          <div className="bg-black/20 border border-white/5 p-6 rounded-3xl mb-8">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-500">ID Réservation</span>
            <div className="text-2xl font-mono font-black text-white mt-2 mb-6">#{orderId}</div>
            {/* Insérez <InvoiceButton orderId={orderId} /> ici */}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <Link to="/dashboard" className="flex items-center justify-center gap-2 text-cyan-400 font-black uppercase text-xs tracking-widest hover:text-white transition-colors p-2">
            Mon Tableau de Bord <ArrowRight size={14} />
          </Link>
          <Link to="/" className="flex items-center justify-center gap-2 text-slate-500 font-bold uppercase text-[10px] tracking-widest hover:text-slate-300 transition-colors">
            <Home size={14} /> Retour à l'accueil
          </Link>
        </div>
      </div>

      {/* COMPOSANT DE DEBUG (A enlever une fois le problème réglé) */}
      <StorageDebugger />
    </div>
  );
}