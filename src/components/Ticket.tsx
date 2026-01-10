import React, { useRef, useMemo, memo } from 'react';
import QRCode from 'react-qr-code';
import { useReactToPrint } from 'react-to-print';

// Définition des types pour une meilleure sécurité
interface TicketData {
  id: string;
  event_title: string;
  event_date: string;
  event_location: string;
  event_image?: string;
}

interface UserData {
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
}

interface TicketProps {
  user: UserData | null;
  ticket: TicketData;
}

const Ticket: React.FC<TicketProps> = memo(({ user, ticket }) => {
  const componentRef = useRef<HTMLDivElement>(null);

  // Optimisation : On ne recalcule le JSON du QR Code que si les données changent
  const qrValue = useMemo(() => JSON.stringify({
    id: ticket.id,
    event: ticket.event_title,
    user: user?.email,
    valid: true
  }), [ticket.id, ticket.event_title, user?.email]);

  // Fonction d'impression
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Billet-${ticket.event_title}-${ticket.id}`,
  });

  return (
    <div className="flex flex-col items-center mb-10 animate-in fade-in duration-500">
      {/* --- ZONE IMPRIMABLE --- */}
      <div 
        ref={componentRef} 
        className="w-full max-w-3xl bg-white text-black rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-gray-200 print:shadow-none print:border-2 print:border-black print:m-0"
      >
        
        {/* PARTIE GAUCHE : IMAGE & INFOS */}
        <div className="md:w-2/3 flex flex-col relative">
          {/* Image avec fallback si vide */}
          <div className="h-48 relative overflow-hidden print:h-32 bg-slate-200">
            {ticket.event_image ? (
              <img 
                src={ticket.event_image} 
                alt={ticket.event_title} 
                className="w-full h-full object-cover print:filter print:grayscale" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">
                ONEWAYTICKET
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
            <div className="absolute bottom-4 left-6 text-white print:text-black">
              <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80 print:text-black">ONEWAYTICKET</p>
              <h2 className="text-3xl font-black print:text-black leading-tight">{ticket.event_title}</h2>
            </div>
          </div>

          {/* Détails */}
          <div className="p-6 grid grid-cols-2 gap-6 bg-white">
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">Date de l'événement</p>
              <p className="text-lg font-bold text-gray-900">{ticket.event_date}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">Lieu / Destination</p>
              <p className="text-lg font-bold text-gray-900">{ticket.event_location}</p>
            </div>
            <div className="col-span-2 border-t border-gray-100 pt-4 mt-2">
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">Passager / Détenteur</p>
              <p className="text-xl font-bold text-gray-900 uppercase truncate">
                {user?.user_metadata?.full_name || user?.email || "Invité"}
              </p>
              <p className="text-[10px] text-gray-400 mt-1 font-mono">CODE REF: {ticket.id}</p>
            </div>
          </div>
        </div>

        {/* LIGNE DE SÉPARATION (Pointillés) */}
        <div className="hidden md:block w-px border-l-2 border-dashed border-gray-200 relative my-6 print:block print:border-black"></div>

        {/* PARTIE DROITE : QR CODE */}
        <div className="md:w-1/3 bg-gray-50 p-6 flex flex-col items-center justify-center text-center relative border-t md:border-t-0 border-dashed border-gray-300 print:bg-white print:border-l-2 print:border-black">
          
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 mb-4 print:border-none print:shadow-none">
            <QRCode 
              value={qrValue} 
              size={120}
              level="M" // Qualité Médium pour un scan rapide
            />
          </div>
          
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.1em] mb-1">Check-in</p>
          <p className="text-[9px] text-gray-400 px-4">Présentez ce code numérique ou imprimé à l'entrée.</p>
        </div>
      </div>

      {/* BOUTON D'IMPRESSION */}
      <button
        onClick={() => handlePrint?.()}
        className="mt-6 flex items-center gap-3 px-8 py-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-full text-cyan-400 font-bold transition-all hover:scale-105 active:scale-95 print:hidden cursor-pointer"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
        </svg>
        TÉLÉCHARGER LE BILLET (PDF)
      </button>
    </div>
  );
});

// Nom affiché pour le debug React
Ticket.displayName = 'Ticket';

export default Ticket;