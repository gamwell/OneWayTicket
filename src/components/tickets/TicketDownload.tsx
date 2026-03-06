import React, { useRef, useState } from "react";
// ✅ CORRECTION 1 : On utilise QRCodeCanvas au lieu de QRCodeSVG
import { QRCodeCanvas } from "qrcode.react";
import { Download, CheckCircle, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface TicketProps {
  eventTitle: string;
  userName: string;
  ticketId: string;
  date: string;
  price: number;
}

const TicketDownload: React.FC<TicketProps> = ({ eventTitle, userName, ticketId, date, price }) => {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // --- LOGIQUE DE TÉLÉCHARGEMENT PDF ---
  const downloadTicket = async () => {
    const element = ticketRef.current;
    if (!element) return;

    setIsGenerating(true);

    try {
      // 1. Capture du ticket en haute qualité
      const canvas = await html2canvas(element, {
        scale: 3, // ✅ Qualité augmentée
        backgroundColor: "#ffffff",
        useCORS: true, // ✅ Utile si vous ajoutez des images externes plus tard
        logging: false, 
      });

      // 2. Création du PDF
      const imgData = canvas.toDataURL("image/png");
      
      // Orientation "p" (portrait), unité "mm", format "a4"
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = 210; // Largeur A4 en mm
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight); // 10mm de marge en haut
      pdf.save(`billet-${eventTitle.replace(/\s+/g, '-')}-${ticketId.slice(0, 5)}.pdf`);

    } catch (error) {
      console.error("❌ Erreur téléchargement:", error);
      alert("Erreur lors de la génération du billet. Vérifiez la console.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      {/* --- LE VISUEL DU BILLET --- */}
      <div 
        ref={ticketRef} 
        className="w-full max-w-md bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200"
      >
        {/* En-tête */}
        <div className="bg-cyan-500 p-6 text-center">
          <h2 className="text-2xl font-black uppercase text-white tracking-widest">{eventTitle}</h2>
          <p className="text-cyan-900 font-bold opacity-80">OneWayTicket</p>
        </div>

        {/* Corps */}
        <div className="p-8 space-y-6">
          <div className="flex justify-between border-b border-dashed border-slate-300 pb-4">
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold">Participant</p>
              <p className="text-lg font-bold">{userName}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase font-bold">Date</p>
              <p className="text-lg font-bold">{new Date(date).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex justify-between items-center">
             <div>
                <p className="text-xs text-slate-500 uppercase font-bold">Prix</p>
                <p className="text-2xl font-black text-cyan-600">{price} €</p>
             </div>
             
             {/* ✅ CORRECTION 2 : Utilisation de QRCodeCanvas */}
             <div className="p-2 bg-white border-2 border-slate-900 rounded-lg">
                <QRCodeCanvas 
                  value={ticketId} 
                  size={80}
                  level="H"
                  includeMargin={true} // Ajoute une petite marge blanche propre
                />
             </div>
          </div>
          
          <div className="pt-4 text-center">
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">ID: {ticketId}</p>
          </div>
        </div>

        {/* Pied de page ticket */}
        <div className="bg-slate-100 p-4 border-t-2 border-dashed border-slate-300 flex justify-center items-center gap-2">
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-xs font-bold text-slate-500 uppercase">Billet Valide</span>
        </div>
      </div>

      {/* --- BOUTON D'ACTION --- */}
      <button
        onClick={downloadTicket}
        disabled={isGenerating}
        className="flex items-center gap-3 px-8 py-4 bg-pink-500 hover:bg-pink-400 disabled:bg-slate-400 text-white rounded-xl font-bold uppercase tracking-widest transition-all shadow-lg hover:shadow-pink-500/30 active:scale-95"
      >
        {isGenerating ? (
            <>
                <Loader2 size={20} className="animate-spin" /> Génération...
            </>
        ) : (
            <>
                <Download size={20} /> Télécharger mon Billet
            </>
        )}
      </button>
    </div>
  );
};

export default TicketDownload;