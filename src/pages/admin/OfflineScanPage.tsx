import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase"; // ✅ Correction du chemin
import { QrReader } from "react-qr-reader";
import { useAuth } from "../../contexts/AuthContext";

const OFFLINE_QUEUE_KEY = "onewayticket_offline_scans";

export default function OfflineScanPage() {
  const { user } = useAuth();

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [status, setStatus] = useState<"idle" | "saved" | "synced" | "error">("idle");
  const [message, setMessage] = useState<string>("Scannez un billet");
  const [queue, setQueue] = useState<string[]>([]);

  // ------------------------------------------------------------
  // 🔥 Charger la queue + écouter le statut réseau
  // ------------------------------------------------------------
  useEffect(() => {
    const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
    setQueue(stored ? JSON.parse(stored) : []);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const saveQueue = (newQueue: string[]) => {
    setQueue(newQueue);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(newQueue));
  };

  // ------------------------------------------------------------
  // 🔥 SCAN HORS‑LIGNE : stockage local
  // ------------------------------------------------------------
  const handleScan = (data: string | null) => {
    if (!data) return;

    try {
      const parsed = JSON.parse(data);
      const ticketId = parsed.id as string;

      if (!ticketId) throw new Error("Invalid QR");

      // éviter les doublons
      if (queue.includes(ticketId)) {
        setStatus("error");
        setMessage(`Billet déjà scanné (#${ticketId})`);
        return;
      }

      const updated = [...queue, ticketId];
      saveQueue(updated);

      setStatus("saved");
      setMessage(`Billet enregistré hors-ligne (#${ticketId})`);
    } catch {
      setStatus("error");
      setMessage("QR Code invalide");
    }
  };

  // ------------------------------------------------------------
  // 🔥 SYNCHRONISATION ONLINE
  // ------------------------------------------------------------
  const syncNow = useCallback(async () => {
    if (!isOnline) {
      setStatus("error");
      setMessage("Pas de connexion — impossible de synchroniser");
      return;
    }

    if (queue.length === 0) {
      setStatus("idle");
      setMessage("Aucun scan à synchroniser");
      return;
    }

    try {
      for (const id of queue) {
        // 1. Marquer comme validé
        const { error: updateErr } = await supabase
          .from("tickets")
          .update({ checked_in: true })
          .eq("id", id);

        if (updateErr) throw updateErr;

        // 2. Log pour les autres scanners
        const { error: logErr } = await supabase.from("scan_logs").insert({
          ticket_id: id,
          scanned_by: user?.id || null,
        });

        if (logErr) throw logErr;
      }

      saveQueue([]);
      setStatus("synced");
      setMessage("Tous les scans hors-ligne ont été synchronisés");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage("Erreur lors de la synchronisation");
    }
  }, [isOnline, queue, user]);

  // ------------------------------------------------------------
  // 🔥 UI
  // ------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <div className="p-4 text-center border-b border-white/10">
        <h1 className="text-xl font-bold">Mode Scan Hors‑ligne</h1>

        <p className="text-xs mt-1">
          Statut réseau :{" "}
          <span className={isOnline ? "text-green-400" : "text-red-400"}>
            {isOnline ? "En ligne" : "Hors‑ligne"}
          </span>
        </p>

        <p className="text-[10px] text-white/60 mt-1">
          Les billets scannés sont enregistrés localement et synchronisés plus tard.
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-6">
        <div className="w-full max-w-xs rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg">
          <QrReader
            onResult={(result) => handleScan(result?.getText() || null)}
            constraints={{ facingMode: "environment" }}
            containerStyle={{ width: "100%" }}
            videoStyle={{ width: "100%", height: "auto" }}
          />
        </div>

        <div className="text-center">
          <p className="text-lg font-bold mb-2">{message}</p>
          <p className="text-xs text-white/60">
            Scans en attente de synchro : {queue.length}
          </p>
        </div>

        <button
          onClick={syncNow}
          className="mt-4 px-6 py-3 rounded-full bg-cyan-500 text-black font-bold text-sm disabled:bg-gray-500"
          disabled={!isOnline}
        >
          Synchroniser maintenant
        </button>
      </div>
    </div>
  );
}