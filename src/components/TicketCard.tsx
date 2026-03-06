import React, { useState } from "react";
import jsPDF from "jspdf";
import { Trash2, Loader2 } from "lucide-react";
import { supabase } from "../supabaseClient";

interface TicketCardProps {
  ticket: {
    id: string;
    event_id: string;
    qr_code: string;
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
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${ticket.qr_code || ticket.id}`;

  // ------------------------------------------------------------
  // 🔥 SUPPRESSION
  // ------------------------------------------------------------
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // Empêche la navigation si dans un <Link>
    e.stopPropagation();

    const confirmed = window.confirm(
      "Supprimer ce billet ? Cette action est irréversible."
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from("tickets")
        .delete()
        .eq("id", ticket.id);

      if (error) throw error;

      onDelete?.(ticket.id); // Notifie le parent pour retirer la carte
    } catch (err) {
      console.error("Erreur suppression:", err);
      alert("Impossible de supprimer ce billet.");
    } finally {
      setDeleting(false);
    }
  };

  // ------------------------------------------------------------
  // 🔥 TÉLÉCHARGEMENT PDF
  // ------------------------------------------------------------
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
    if (eventLocation) {
      doc.text(`📍 ${eventLocation}`, 105, 75, { align: "center" });
    }

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

    doc.setTextColor(150, 150, 150);
    doc.setFontSize(9);
    doc.text(`ID : ${ticket.id}`, 105, 185, { align: "center" });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text("Présentez ce QR code à l'entrée de l'événement.", 105, 200, { align: "center" });

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text("quarksydigital.com — Billet non remboursable", 105, 285, { align: "center" });

    doc.save(`billet-${eventTitle.replace(/\s+/g, "-")}-${ticket.id.slice(0, 8)}.pdf`);
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
      {/* Header coloré */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-4">
        <h2 className="text-white font-bold text-lg">{eventTitle}</h2>
        <p className="text-amber-300 text-sm">{eventDate}</p>
        {eventLocation && <p className="text-white/70 text-xs mt-1">📍 {eventLocation}</p>}
      </div>

      {/* QR Code */}
      <div className="p-6">
        <img
          src={qrUrl}
          alt="QR Code"
          className="mx-auto mb-4 rounded-lg"
          width={180}
          height={180}
        />

        <p className="text-gray-400 text-xs mb-1">
          ID : {ticket.id.slice(0, 8)}...
        </p>
        <p className="text-gray-500 text-sm mb-4">
          Acheté le {new Date(ticket.created_at).toLocaleDateString("fr-FR")}
        </p>
        <p className="text-gray-500 text-sm mb-4">
          Présentez ce QR code à l'entrée de l'événement.
        </p>

        {/* Bouton PDF */}
        <button
          onClick={downloadPDF}
          className="w-full bg-amber-400 hover:bg-amber-500 text-black font-bold py-2 px-4 rounded-lg transition-colors mb-3"
        >
          ⬇ Télécharger le billet (PDF)
        </button>

        {/* 🔥 Bouton Supprimer */}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-full flex items-center justify-center gap-2 bg-rose-100 hover:bg-rose-200 text-rose-600 font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {deleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          {deleting ? "Suppression..." : "Supprimer ce billet"}
        </button>
      </div>
    </div>
  );
}
