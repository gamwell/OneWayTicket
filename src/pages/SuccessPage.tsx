import React, { useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, Home, ArrowRight, Download } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- COMPOSANT BOUTON FACTURE INTEGRÉ ---
interface InvoiceButtonProps {
  orderId: string;
}

const InvoiceButton: React.FC<InvoiceButtonProps> = ({ orderId }) => {
  const handleDownload = async () => {
    const invoiceElement = document.createElement('div');
    invoiceElement.style.width = '210mm';
    invoiceElement.style.padding = '40px';
    invoiceElement.style.background = 'white';
    invoiceElement.style.color = 'black';
    invoiceElement.style.position = 'absolute';
    invoiceElement.style.left = '-9999px';
    
    invoiceElement.innerHTML = `
      <div style="font-family: sans-serif; padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #00E5FF; padding-bottom: 20px;">
          <h1 style="color: #1e1b4b; margin: 0;">ONE WAY TICKET</h1>
          <p style="text-align: right; margin: 0;">Facture Officielle</p>
        </div>
        <div style="margin-top: 40px;">
          <p><strong>N° Commande :</strong> #${orderId}</p>
          <p><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
          <p><strong>Statut :</strong> <span style="color: green;">PAYÉ</span></p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-top: 40px;">
          <thead>
            <tr style="background: #f4f4f4;">
              <th style="text-align: left; padding: 12px; border: 1px solid #ddd;">Description</th>
              <th style="text-align: right; padding: 12px; border: 1px solid #ddd;">Prix</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 12px; border: 1px solid #ddd;">Billet d'événement digital (Accès complet)</td>
              <td style="padding: 12px; border: 1px solid #ddd; text-align: right;">Confirmé</td>
            </tr>
          </tbody>
        </table>
        <div style="margin-top: 100px; text-align: center; color: #666; font-size: 12px;">
          <p>Merci pour votre confiance. Ce document sert de preuve d'achat officielle.</p>
          <p>OneWayTicket Security Protocol v1.0</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(invoiceElement);

    try {
      const canvas = await html2canvas(invoiceElement, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save(`Facture-${orderId}.pdf`);
    } finally {
      document.body.removeChild(invoiceElement);
    }
  };

  return (
    <button 
      onClick={handleDownload}
      className="w-full flex items-center justify-center gap-2 bg-[#FF6B9D] hover:bg-[#ff4f8b] text-white font-black py-4 px-6 rounded-2xl transition-all shadow-lg shadow-pink-500/20 uppercase tracking-tighter"
    >
      <Download size={20} /> Télécharger ma facture
    </button>
  );
};

// --- PAGE DE SUCCÈS PRINCIPALE ---
export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const orderId = searchParams.get('orderId');
  const hasCleared = useRef(false);

  useEffect(() => {
    // Nettoyage automatique du panier au montage de la page
    if (!hasCleared.current) {
      clearCart();
      hasCleared.current = true;
    }
  }, [clearCart]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-6 font-sans">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] text-center shadow-2xl relative overflow-hidden">
        
        {/* Glow effect arrière plan */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl"></div>
        
        <div className="flex justify-center mb-8">
          <div className="p-5 rounded-full bg-emerald-500/10 border-2 border-emerald-500 animate-bounce">
            <CheckCircle2 size={48} className="text-emerald-500" />
          </div>
        </div>

        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-4">
          Paiement <span className="text-cyan-400">Validé</span>
        </h1>
        
        <p className="text-slate-400 mb-8 leading-relaxed">
          Votre transaction a été traitée avec succès. Votre panier a été vidé et votre billet est prêt à être utilisé.
        </p>

        {orderId ? (
          <div className="bg-black/20 border border-white/5 p-6 rounded-3xl mb-8">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-500">ID Réservation</span>
            <div className="text-2xl font-mono font-black text-white mt-2 mb-6">
              #{orderId}
            </div>
            
            <InvoiceButton orderId={orderId} />
          </div>
        ) : (
          <div className="text-red-400 font-bold mb-8 p-4 bg-red-500/10 rounded-2xl">
            Référence de commande manquante.
          </div>
        )}

        <div className="flex flex-col gap-4">
          <Link to="/dashboard" className="flex items-center justify-center gap-2 text-cyan-400 font-black uppercase text-xs tracking-widest hover:text-white transition-colors">
            Mon Tableau de Bord <ArrowRight size={14} />
          </Link>
          <Link to="/" className="flex items-center justify-center gap-2 text-slate-500 font-bold uppercase text-[10px] tracking-widest hover:text-slate-300 transition-colors">
            <Home size={14} /> Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}