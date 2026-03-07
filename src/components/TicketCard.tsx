import React, { useState } from "react";
import jsPDF from "jspdf";
import { Trash2, Loader2 } from "lucide-react";
import { supabase } from "../supabaseClient";

interface TicketCardProps {
  ticket: {
    id: string;
    event_id: string;
    qr_code?: string;
    qr_code_hash?: string;
    code_court?: string;
    created_at: string;
    event?: {
      title: string;
      date: string;
      location?: string;
    };
  };
  onDelete?: (ticketId: string) => void;
}

export default function TicketCard({ ticket, onDelete }: TicketCardProps) {
  const [deleting, setDeleting] = useState(false);

  const eventTitle = ticket.event?.title || "Événement inconnu";
  const eventDate = ticket.event?.date
    ? new Date(ticket.event.date).toLocaleDateString("fr-FR", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      })
    : "Date inconnue";
  const eventLocation = ticket.event?.location || "";

  // ✅ Utilise qr_code_hash ou id comme valeur du QR
  const qrValue = ticket.qr_code_hash || ticket.qr_code || ticket.id;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrValue}`;

  // ✅ Code court affiché sur le billet
  const codeCourt = ticket.code_court || ticket.id.slice(0, 6).toUpperCase();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const confirmed = window.confirm("Supprimer ce billet ? Cette action est irréversible.");
    if (!confirmed) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from("tickets").delete().eq("id", ticket.id);
      if (error) throw error;
      onDelete?.(ticket.id);
    } catch (err) {
      console.error("Erreur suppression:", err);
      alert("Impossible de supprimer ce billet.");
    } finally {
      setDeleting(false);
    }
  };

  const downloadPDF = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    doc.setFillColor(20, 10, 40);
    doc.rect(0, 0, 210, 297, "F");

    doc.setTextColor(255, 180, 0);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("ONEWAYTICKET", 105, 30, { align: "center" });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text(eventTitle, 105, 50, { align: "center" });

    doc.setFontSize(13);
    doc.setTextColor(200, 200, 200);
    doc.text(`📅 ${eventDate}`, 105, 65, { align: "center" });
    if (eventLocation) doc.text(`📍 ${eventLocation}`, 105, 75, { align: "center" });

    doc.setDrawColor(255, 180, 0);
    doc.setLineWidth(0.5);
    doc.line(30, 85, 180, 85);

    try {
      const img = await loadImage(qrUrl);
      doc.addImage(img, "PNG", 65, 95, 80, 80);
    } catch {
      doc.setTextColor(255, 100, 100);
      doc.text("QR Code indisponible", 105, 135, { align: "center" });
    }

    // ✅ Code court en gros sur le PDF
    doc.setTextColor(255, 180, 0);
    doc.setFontSize(32);
    doc.setFont("helvetica", "bold");
    doc.text(codeCourt, 105, 195, { align: "center" });

    doc.setTextColor(150, 150, 150);
    doc.setFontSize(10);
    doc.text("Code d'entrée", 105, 203, { align: "center" });

    doc.setTextColor(150, 150, 150);
    doc.setFontSize(9);
    doc.text(`ID : ${ticket.id}`, 105, 215, { align: "center" });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text("Présentez ce QR code ou votre code d'entrée à l'accueil.", 105, 228, { align: "center" });

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text("quarksydigital.com — Billet non remboursable", 105, 285, { align: "center" });

    doc.save(`billet-${eventTitle.replace(/\s+/g, "-")}-${codeCourt}.pdf`);
  };

  const loadImage = (url: string): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext("2d")!.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = reject;
      img.src = url;
    });

  return (
    <div className="bg-white shadow-lg rounded-2xl overflow-hidden text-center">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-4">
        <h2 className="text-white font-bold text-lg">{eventTitle}</h2>
        <p className="text-amber-300 text-sm">{eventDate}</p>
        {eventLocation && <p className="text-white/70 text-xs mt-1">📍 {eventLocation}</p>}
      </div>

      {/* QR Code */}
      <div className="p-6">
        <img src={qrUrl} alt="QR Code" className="mx-auto mb-4 rounded-lg" width={180} height={180} />

        {/* ✅ Code court bien visible */}
        <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl py-3 px-4 mb-4">
          <p className="text-amber-600 text-xs font-bold uppercase tracking-wider mb-1">
            Code d'entrée
          </p>
          <p className="text-3xl font-black tracking-[0.3em] text-amber-500">
            {codeCourt}
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Communiquez ce code au staff si le QR ne scanne pas
          </p>
        </div>

        <p className="text-gray-400 text-xs mb-1">ID : {ticket.id.slice(0, 8)}...</p>
        <p className="text-gray-500 text-sm mb-4">
          Acheté le {new Date(ticket.created_at).toLocaleDateString("fr-FR")}
        </p>

        <button
          onClick={downloadPDF}
          className="w-full bg-amber-400 hover:bg-amber-500 text-black font-bold py-2 px-4 rounded-lg transition-colors mb-3"
        >
          ⬇ Télécharger le billet (PDF)
        </button>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-full flex items-center justify-center gap-2 bg-rose-100 hover:bg-rose-200 text-rose-600 font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          {deleting ? "Suppression..." : "Supprimer ce billet"}
        </button>
      </div>
    </div>
  );
}
