import { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useAuth } from "../../contexts/AuthContext";

export default function ScanPage() {
  const { user } = useAuth();

  const [status, setStatus] = useState<"idle" | "valid" | "invalid" | "pending">("idle");
  const [message, setMessage] = useState("Scannez un billet pour commencer");
  const [lastScannedTicket, setLastScannedTicket] = useState<string | null>(null);

  // ⚡ Anti-spam scan (évite les scans multiples)
  const scanLock = useRef(false);

  // ------------------------------------------------------------
  // 🔥 INITIALISATION DU SCANNER html5-qrcode
  // ------------------------------------------------------------
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 250 },
      false
    );

    scanner.render(
      (result) => handleScan(result),
      (error) => console.warn("QR scan error:", error)
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, []);

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
          if (
            lastScannedTicket &&
            payload.new.id === lastScannedTicket &&
            payload.new.checked_in
          ) {
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
  // 🔥 LOGIQUE DE SCAN
  // ------------------------------------------------------------
  const handleScan = async (data: string | null) => {
    if (!data) return;

    // ⚡ Anti-spam
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

      // Reset après 3 secondes
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

      {/* 🔥 Conteneur du scanner html5-qrcode */}
      <div className="max-w-sm mx-auto">
        <div id="qr-reader" style={{ width: "100%" }} />
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
