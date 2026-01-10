import React, { useState } from 'react';
import { FileText, Loader2, ShieldCheck } from 'lucide-react';

interface InvoiceButtonProps {
  orderId: string;
}

export const InvoiceButton: React.FC<InvoiceButtonProps> = ({ orderId }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const generateLocalPDF = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      // 1. IMPORT DYNAMIQUE (Optimise la vitesse de chargement de la page)
      const [
        { default: jsPDF },
        { default: html2canvas },
        { default: QRCode }
      ] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
        import('qrcode')
      ]);

      // 2. Génération du QR Code
      const qrCodeDataUrl = await QRCode.toDataURL(orderId, {
        margin: 1,
        width: 400, // Augmenté pour la netteté sur le PDF
        color: {
          dark: '#1e1b4b',
          light: '#ffffff',
        },
      });

      // 3. Création du template HTML
      const invoiceElement = document.createElement('div');
      // On utilise des styles inline robustes pour html2canvas
      Object.assign(invoiceElement.style, {
        width: '210mm',
        minHeight: '297mm',
        padding: '40px',
        background: '#ffffff',
        color: '#1a1a1a',
        position: 'fixed',
        top: '0',
        left: '-10000px', // Sorti de l'écran mais présent dans le DOM
        zIndex: '-9999',
      });
      
      invoiceElement.innerHTML = `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1a1a1a;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 5px solid #00E5FF; padding-bottom: 25px; margin-bottom: 40px;">
            <div>
              <h1 style="margin: 0; color: #1e1b4b; font-size: 32px; font-weight: 900; letter-spacing: -1px;">ONE WAY TICKET</h1>
              <p style="margin: 5px 0; color: #64748b; text-transform: uppercase; font-size: 11px; font-weight: bold; letter-spacing: 2px;">Document Officiel d'Accès</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; font-size: 14px; font-weight: bold; color: #1e1b4b;">COMMANDE #${orderId}</p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">${new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          <div style="display: flex; gap: 50px; align-items: flex-start;">
            <div style="flex: 2;">
              <h2 style="font-size: 14px; color: #1e1b4b; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">Récapitulatif de votre Pass</h2>
              <div style="margin-top: 20px; border: 1px solid #f1f5f9; border-radius: 12px; overflow: hidden;">
                <div style="background: #f8fafc; padding: 15px; display: flex; justify-content: space-between; font-size: 12px; font-weight: bold; color: #64748b;">
                  <span>ARTICLE</span>
                  <span>STATUT</span>
                </div>
                <div style="padding: 20px; display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-weight: bold; color: #1e1b4b;">Pass Événement Digital OWT</span>
                  <span style="background: #ecfdf5; color: #059669; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 900;">PAYÉ ✅</span>
                </div>
              </div>

              <div style="margin-top: 50px; padding: 20px; background: #fff1f2; border-radius: 12px; border: 1px solid #fecdd3;">
                <p style="margin: 0; font-size: 12px; color: #e11d48; line-height: 1.6;">
                  <strong>VÉRIFICATION :</strong> Ce titre est unique et sera scanné à l'entrée. Ne partagez pas ce QR Code. Une pièce d'identité peut être demandée.
                </p>
              </div>
            </div>

            <div style="flex: 1; text-align: center; background: #f8fafc; padding: 25px; border-radius: 20px; border: 2px dashed #cbd5e1;">
              <p style="font-size: 9px; font-weight: 900; color: #64748b; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px;">Portail de Contrôle</p>
              <img src="${qrCodeDataUrl}" style="width: 160px; height: 160px; display: block; margin: 0 auto;" />
              <p style="font-family: monospace; font-size: 12px; margin-top: 15px; color: #1e1b4b; font-weight: bold;">${orderId}</p>
            </div>
          </div>

          <div style="margin-top: 80px; text-align: center;">
            <div style="height: 1px; background: #f1f5f9; width: 100%; margin-bottom: 20px;"></div>
            <p style="font-size: 10px; color: #94a3b8; line-height: 1.8;">
              Système de billetterie sécurisé OneWayTicket. Généré numériquement.<br>
              En cas de problème, contactez le support avec votre numéro de commande.
            </p>
          </div>
        </div>
      `;

      document.body.appendChild(invoiceElement);

      // 4. Capture Canvas (Scale 2 pour une qualité Retina/Impression)
      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      // 5. Génération PDF
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      pdf.save(`OWT-Pass-${orderId}.pdf`);

      // 6. Nettoyage
      document.body.removeChild(invoiceElement);
    } catch (error) {
      console.error("Erreur génération PDF:", error);
      alert("Erreur lors de la création du billet. Veuillez réessayer.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button 
      onClick={generateLocalPDF} 
      disabled={isDownloading} 
      className="w-full bg-[#0F0F23] text-[#00E5FF] p-5 rounded-2xl flex items-center justify-center gap-4 border border-[#00E5FF]/20 hover:bg-[#00E5FF]/5 hover:border-[#00E5FF] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-cyan-900/20 group"
    >
      {isDownloading ? (
        <Loader2 className="animate-spin w-5 h-5" />
      ) : (
        <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
      )}
      
      <span className="font-black tracking-[0.2em] uppercase text-xs">
        {isDownloading ? 'Génération en cours...' : 'Télécharger le billet PDF'}
      </span>

      {!isDownloading && (
        <ShieldCheck className="w-5 h-5 text-[#FF6B9D] drop-shadow-[0_0_5px_rgba(255,107,157,0.5)]" />
      )}
    </button>
  );
};