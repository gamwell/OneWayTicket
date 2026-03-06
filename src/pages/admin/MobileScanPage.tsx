import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

type ScanStatus = "idle" | "valid" | "invalid" | "pending";

export default function MobileScanPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState<ScanStatus>("idle");
  const [lastTicketId, setLastTicketId] = useState<string | null>(null);
  const [message, setMessage] = useState("Scannez un billet pour commencer");

  // 🔊 Sons (optionnels)
  const soundValid = useRef(new Audio("/sounds/valid.mp3"));
  const soundInvalid = useRef(new Audio("/sounds/invalid.mp3"));

  // ⚡ Anti-spam scan
  const scanLock = useRef(false);

  // ⚡ Cache local pour éviter les requêtes inutiles
  const ticketCache = useRef<Record<string, any>>({});

  // ------------------------------------------------------------
  // 🔥 INITIALISATION DU SCANNER html5-qrcode
  // ------------------------------------------------------------
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader-mobile",
      {
        fps: 10,
        qrbox: 250,
        aspectRatio: 1.0,
      },
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
  // 🔥 Synchronisation entre scanners (INSERT scan_logs)
  // ------------------------------------------------------------
  useEffect(() => {
    const channel = supabase
      .channel("realtime-mobile-scans")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "scan_logs" },
        (payload) => {
          const scannedTicket = payload.new.ticket_id;
          if (scannedTicket === lastTicketId) return;
          if (ticketCache.current[scannedTicket]) {
            ticketCache.current[scannedTicket].checked_in = true;
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [lastTicketId]);

  // ------------------------------------------------------------
  // 🔥 Synchronisation UPDATE tickets
  // ------------------------------------------------------------
  useEffect(() => {
    const channel = supabase
      .channel("mobile-scan-sync")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "tickets" },
        (payload) => {
          if (payload.new.id && ticketCache.current[payload.new.id]) {
            ticketCache.current[payload.new.id] = payload.new;
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // ------------------------------------------------------------
  // 🔥 FONCTION DE SCAN PRINCIPALE
  // ------------------------------------------------------------
  const handleScan = async (data: string | null) => {
    if (!data) return;

    if (scanLock.current) return;
    scanLock.current = true;
    setTimeout(() => (scanLock.current = false), 1500);

    setStatus("pending");
    setMessage("🔍 Vérification...");
    setLastTicketId(null);

    try {
      let ticketId = data;

      // JSON → { id: "..." }
      try {
        const parsed = JSON.parse(data);
        if (parsed.id) ticketId = parsed.id;
      } catch {
        // Pas JSON → ID brut
      }

      setLastTicketId(ticketId);

      // --- 1. Vérification Cache Local ---
      if (ticketCache.current[ticketId]) {
        const cached = ticketCache.current[ticketId];
        if (cached.checked_in) {
          triggerInvalid("⚠️ Billet déjà utilisé !");
          return;
        }
      }

      // --- 2. Vérification Supabase ---
      const { data: ticket, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("id", ticketId)
        .maybeSingle();

      if (error || !ticket) {
        triggerInvalid("❌ Billet inconnu");
        return;
      }

      ticketCache.current[ticketId] = ticket;

      if (ticket.checked_in) {
        triggerInvalid(
          `⚠️ Déjà scanné à ${new Date(ticket.updated_at).toLocaleTimeString()}`
        );
        return;
      }

      // --- 3. Validation ---
      const { error: updateError } = await supabase
        .from("tickets")
        .update({ checked_in: true })
        .eq("id", ticketId);

      if (updateError) throw updateError;

      await supabase.from("scan_logs").insert({
        ticket_id: ticketId,
        scanned_by: user?.id || null,
        status: "valid",
        scan_method: "mobile",
      });

      triggerValid("✅ Entrée autorisée");
    } catch (err) {
      console.error(err);
      triggerInvalid("❌ Erreur de lecture");
    }
  };

  // ------------------------------------------------------------
  // 🔥 Helpers (sons + vibration)
  // ------------------------------------------------------------
  const triggerValid = (msg: string) => {
    setStatus("valid");
    setMessage(msg);
    try { soundValid.current.play().catch(() => {}); } catch {}
    navigator.vibrate?.(200);
  };

  const triggerInvalid = (msg: string) => {
    setStatus("invalid");
    setMessage(msg);
    try { soundInvalid.current.play().catch(() => {}); } catch {}
    navigator.vibrate?.([100, 50, 100]);
  };

  // Couleur dynamique
  const bgColor =
    status === "valid"
      ? "bg-green-600"
      : status === "invalid"
      ? "bg-red-600"
      : "bg-black";

  // ------------------------------------------------------------
  // 🔥 UI
  // ------------------------------------------------------------
  return (
    <div className={`min-h-screen ${bgColor} text-white flex flex-col transition-colors duration-300`}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/10 bg-black/20 backdrop-blur-sm fixed top-0 w-full z-10">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="p-2 bg-white/10 rounded-full hover:bg-white/20"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
          <h1 className="font-bold tracking-wide">Scanner Mobile</h1>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Contenu */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-6 gap-6">

        {/* Zone Caméra */}
        <div className="w-full max-w-sm aspect-square relative rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl bg-black">

          {/* Scanner html5-qrcode */}
          <div id="qr-reader-mobile" style={{ width: "100%", height: "100%" }} />

          {/* Viseur */}
          <div className="absolute inset-0 border-[30px] border-black/50 pointer-events-none flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-white/80 rounded-2xl relative">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-amber-400 -mt-1 -ml-1"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-amber-400 -mt-1 -mr-1"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-amber-400 -mb-1 -ml-1"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-amber-400 -mb-1 -mr-1"></div>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="text-center bg-black/30 p-6 rounded-2xl backdrop-blur-md w-full max-w-sm">
          <p className="text-2xl font-bold mb-2 animate-pulse">{message}</p>
          {lastTicketId && (
            <p className="text-sm text-white/70 font-mono bg-black/40 py-1 px-3 rounded-full inline-block">
              ID: {lastTicketId.slice(0, 8)}...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
