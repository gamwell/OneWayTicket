import { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabase"; // ✅ Correction du chemin
import { QrReader } from "react-qr-reader";
import { useAuth } from "../../contexts/AuthContext";

export default function ScanPage() {
  const { user } = useAuth();

  const [status, setStatus] = useState<"idle" | "valid" | "invalid" | "pending">("idle");
  const [message, setMessage] = useState("Scannez un billet pour commencer");
  const [lastScannedTicket, setLastScannedTicket] = useState<string | null>(null);

  // ⚡ Anti-spam scan (évite les scans multiples)
  const scanLock = useRef(false);

  // ------------------------------------------------------------
  // 🔥 SYNCHRONISATION ENTRE SCANNERS (INSERT scan_logs)
  // ------------------------------------------------------------
  useEffect(() => {
    const channel = supabase
      .channel("realtime-scans")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "scan_logs" },
        (payload) => {
          const scannedTicket = payload.new.ticket_id;

          // Ne pas déclencher si c'est le même ticket scanné ici
          if (lastScannedTicket && scannedTicket !== lastScannedTicket) {
            setStatus("invalid");
            setMessage("Billet déjà validé sur un autre scanner");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lastScannedTicket]);

  // ------------------------------------------------------------
  // 🔥 SYNCHRONISATION ENTRE SCANNERS (UPDATE tickets)
  // ------------------------------------------------------------
  useEffect(() => {
    const channel = supabase
      .channel("scan-sync")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "tickets" },
        (payload) => {
          // Vérifier que le ticket modifié est celui scanné
          if (lastScannedTicket && payload.new.id === lastScannedTicket && payload.new.checked_in) {
            setStatus("invalid");
            setMessage("Billet déjà validé ailleurs");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lastScannedTicket]);

  // ------------------------------------------------------------
  // 🔥 VERSION AMÉLIORÉE DU SCAN
  // ------------------------------------------------------------
  const handleScan = async (data: string | null) => {
    if (!data) return;

    // ⚡ Anti-spam : ignore si déjà en traitement
    if (scanLock.current) return;
    scanLock.current = true;
    setTimeout(() => (scanLock.current = false), 1000);

    setStatus("pending");
    setMessage("Vérification du billet...");

    try {
      const parsed = JSON.parse(data);
      const ticketId = parsed.id;

      setLastScannedTicket(ticketId);

      // Vérifier si le ticket existe
      const { data: ticket, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("id", ticketId)
        .maybeSingle();

      if (error || !ticket) {
        setStatus("invalid");
        setMessage("Billet introuvable");
        return;
      }

      // Vérifier si déjà validé
      if (ticket.checked_in) {
        setStatus("invalid");
        setMessage("Billet déjà validé");
        return;
      }

      // Valider le billet
      const { error: updateErr } = await supabase
        .from("tickets")
        .update({ checked_in: true })
        .eq("id", ticketId);

      if (updateErr) {
        setStatus("invalid");
        setMessage("Erreur lors de la validation");
        return;
      }

      // Ajouter un log
      await supabase.from("scan_logs").insert({
        ticket_id: ticketId,
        scanned_by: user?.id || null,
      });

      setStatus("valid");
      setMessage("Billet validé — entrée autorisée");

      // Reset message après 3 secondes pour permettre un nouveau scan clair
      setTimeout(() => {
        setStatus("idle");
        setMessage("Scannez un billet pour commencer");
        setLastScannedTicket(null);
      }, 3000);
    } catch (err) {
      console.error("Erreur lors du scan:", err);
      setStatus("invalid");
      setMessage("QR Code invalide");
    }
  };

  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl font-bold mb-6">Scanner un billet</h1>

      <div className="max-w-sm mx-auto">
        <QrReader
          onResult={(result) => handleScan(result?.getText() || null)}
          constraints={{ facingMode: "environment" }}
          containerStyle={{ width: "100%" }}
        />
      </div>

      {/* 🔥 Messages dynamiques */}
      <div className="mt-6">
        {status === "valid" && (
          <p className="text-green-400 font-bold text-xl">✔ {message}</p>
        )}

        {status === "invalid" && (
          <p className="text-red-400 font-bold text-xl">✖ {message}</p>
        )}

        {status === "pending" && (
          <p className="text-yellow-300 font-bold text-xl">⏳ {message}</p>
        )}

        {status === "idle" && (
          <p className="text-gray-300 text-lg">{message}</p>
        )}
      </div>
    </div>
  );
}