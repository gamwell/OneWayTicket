import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { Html5Qrcode } from "html5-qrcode";
import { useAuth } from "../../contexts/AuthContext";
import { Camera, Wifi, WifiOff, RefreshCw } from "lucide-react";

const OFFLINE_QUEUE_KEY = "onewayticket_offline_scans";

export default function OfflineScanPage() {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [status, setStatus] = useState<"idle" | "saved" | "synced" | "error">("idle");
  const [message, setMessage] = useState("Appuyez sur Démarrer pour scanner");
  const [queue, setQueue] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
    setQueue(stored ? JSON.parse(stored) : []);
    window.addEventListener("online", () => setIsOnline(true));
    window.addEventListener("offline", () => setIsOnline(false));
  }, []);

  useEffect(() => {
    return () => {
      if (scannerRef.current) scannerRef.current.stop().catch(console.error);
    };
  }, []);

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode("qr-reader-offline");
      scannerRef.current = html5QrCode;
      // ✅ Force caméra arrière
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (result) => handleScan(result),
        (error) => console.warn(error)
      );
      setScanning(true);
      setMessage("Pointez vers un QR code");
    } catch (err) {
      setStatus("error");
      setMessage("Impossible d'accéder à la caméra");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(console.error);
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const saveQueue = (newQueue: string[]) => {
    setQueue(newQueue);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(newQueue));
  };

  const handleScan = (data: string | null) => {
    if (!data) return;
    try {
      let ticketId = data;
      try { ticketId = JSON.parse(data).id || data; } catch { }

      if (queue.includes(ticketId)) {
        setStatus("error");
        setMessage("Billet déjà scanné");
        return;
      }
      saveQueue([...queue, ticketId]);
      setStatus("saved");
      setMessage(`Enregistré hors-ligne (${ticketId.slice(0, 8)}...)`);
    } catch {
      setStatus("error");
      setMessage("QR Code invalide");
    }
  };

  const syncNow = useCallback(async () => {
    if (!isOnline || queue.length === 0) return;
    try {
      for (const id of queue) {
        await supabase.from("tickets").update({ checked_in: true }).eq("id", id);
        await supabase.from("scan_logs").insert({ ticket_id: id, scanned_by: user?.id || null });
      }
      saveQueue([]);
      setStatus("synced");
      setMessage("Tous les scans synchronisés ✅");
    } catch {
      setStatus("error");
      setMessage("Erreur de synchronisation");
    }
  }, [isOnline, queue, user]);

  return (
    <div className="min-h-screen bg-[#1a0525] text-white flex flex-col items-center pt-24 px-6 pb-16">
      <div className="flex items-center gap-3 mb-8">
        {isOnline ? <Wifi className="text-emerald-400" /> : <WifiOff className="text-rose-400" />}
        <h1 className="text-3xl font-black uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-300">
          Scan Hors-ligne
        </h1>
      </div>

      <div className="w-full max-w-sm rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl mb-6 bg-black min-h-[200px] flex items-center justify-center">
        <div id="qr-reader-offline" style={{ width: "100%" }} />
        {!scanning && <Camera size={48} className="text-white/20" />}
      </div>

      <button
        onClick={scanning ? stopScanner : startScanner}
        className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest mb-6 transition-all ${
          scanning ? "bg-rose-500 text-white" : "bg-amber-400 text-black"
        }`}
      >
        {scanning ? "Arrêter" : "Démarrer la caméra"}
      </button>

      <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-4 mb-4 text-center">
        <p className="text-white/50 text-xs uppercase tracking-wider mb-1">File d'attente</p>
        <p className="text-3xl font-black text-amber-400">{queue.length}</p>
        <p className="text-white/30 text-xs">scans en attente</p>
      </div>

      <p className={`mb-4 font-bold ${status === "error" ? "text-rose-400" : status === "synced" ? "text-emerald-400" : "text-amber-400"}`}>
        {message}
      </p>

      <button
        onClick={syncNow}
        disabled={!isOnline || queue.length === 0}
        className="flex items-center gap-2 px-8 py-4 bg-cyan-500 text-black font-black uppercase rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-cyan-400 transition-all"
      >
        <RefreshCw size={18} />
        Synchroniser ({queue.length})
      </button>
    </div>
  );
}
