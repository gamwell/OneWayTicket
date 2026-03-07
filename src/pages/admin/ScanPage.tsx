import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Html5Qrcode } from "html5-qrcode";
import { useAuth } from "../../contexts/AuthContext";
import { CheckCircle, XCircle, Loader2, Camera, Keyboard } from "lucide-react";

export default function ScanPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<"idle" | "valid" | "invalid" | "pending">("idle");
  const [message, setMessage] = useState("Scannez ou saisissez un ID de billet");
  const [lastScannedTicket, setLastScannedTicket] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [manualId, setManualId] = useState("");
  const [mode, setMode] = useState<"camera" | "manual">("camera");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scanLock = useRef(false);

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 20, qrbox: { width: 150, height: 150 } },
        (result) => handleScan(result),
        () => {}
      );
      setScanning(true);
      setMessage("Cadrez le QR code à 10-15cm");
    } catch (err) {
      setStatus("invalid");
      setMessage("Impossible d'accéder à la caméra — utilisez la saisie manuelle");
      setMode("manual");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(console.error);
      scannerRef.current = null;
    }
    setScanning(false);
    setStatus("idle");
    setMessage("Scanner arrêté");
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) scannerRef.current.stop().catch(console.error);
    };
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("scan-sync")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "tickets" },
        (payload) => {
          if (lastScannedTicket && payload.new.id === lastScannedTicket && payload.new.checked_in) {
            setStatus("invalid");
            setMessage("Billet déjà validé ailleurs");
          }
        }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [lastScannedTicket]);

  const handleScan = async (data: string | null) => {
    if (!data || scanLock.current) return;
    scanLock.current = true;
    setTimeout(() => (scanLock.current = false), 3000);

    setStatus("pending");
    setMessage("Vérification...");

    try {
      let ticketId = data.trim();
      try {
        const parsed = JSON.parse(data);
        ticketId = parsed.id || data;
      } catch { }

      setLastScannedTicket(ticketId);

      const { data: ticket, error } = await supabase
        .from("tickets")
        .select("*")
        .or(`id.eq.${ticketId},qr_code_hash.eq.${ticketId}`)
        .maybeSingle();

      if (error || !ticket) {
        setStatus("invalid");
        setMessage("Billet introuvable");
        resetAfterDelay();
        return;
      }

      if (ticket.checked_in) {
        setStatus("invalid");
        setMessage("Billet déjà utilisé !");
        resetAfterDelay();
        return;
      }

      await supabase.from("tickets").update({ checked_in: true }).eq("id", ticket.id);
      await supabase.from("scan_logs").insert({ ticket_id: ticket.id, scanned_by: user?.id || null });

      setStatus("valid");
      setMessage("✅ Entrée autorisée !");
      resetAfterDelay();
    } catch {
      setStatus("invalid");
      setMessage("QR Code invalide");
      resetAfterDelay();
    }
  };

  const handleManualSubmit = () => {
    if (!manualId.trim()) return;
    handleScan(manualId.trim());
    setManualId("");
  };

  const resetAfterDelay = () => {
    setTimeout(() => {
      setStatus("idle");
      setMessage(mode === "camera" ? "Cadrez le QR code" : "Saisissez un ID de billet");
      setLastScannedTicket(null);
    }, 3000);
  };

  return (
    <div className={`min-h-screen text-white flex flex-col items-center pt-24 px-6 pb-16 transition-colors duration-500 ${
      status === "valid" ? "bg-emerald-900/40" :
      status === "invalid" ? "bg-rose-900/40" : "bg-[#1a0525]"
    }`}>
      <h1 className="text-3xl font-black uppercase italic mb-6 text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-300">
        Scanner un billet
      </h1>

      {/* Toggle mode */}
      <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-2xl border border-white/10">
        <button
          onClick={() => { setMode("camera"); if (scanning) stopScanner(); }}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm transition-all ${
            mode === "camera" ? "bg-amber-400 text-black" : "text-white/50 hover:text-white"
          }`}
        >
          <Camera size={16} /> Caméra
        </button>
        <button
          onClick={() => { setMode("manual"); if (scanning) stopScanner(); }}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm transition-all ${
            mode === "manual" ? "bg-amber-400 text-black" : "text-white/50 hover:text-white"
          }`}
        >
          <Keyboard size={16} /> Manuel
        </button>
      </div>

      {/* MODE CAMÉRA */}
      {mode === "camera" && (
        <>
          <div className="w-full max-w-sm rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl mb-6 bg-black relative min-h-[280px] flex items-center justify-center">
            <div id="qr-reader" style={{ width: "100%" }} />
            {!scanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera size={64} className="text-white/10" />
              </div>
            )}
          </div>
          <button
            onClick={scanning ? stopScanner : startScanner}
            className={`px-10 py-4 rounded-2xl font-black uppercase tracking-widest transition-all mb-6 shadow-lg ${
              scanning ? "bg-rose-500 hover:bg-rose-400 text-white" : "bg-amber-400 hover:bg-amber-300 text-black"
            }`}
          >
            {scanning ? "⏹ Arrêter" : "▶ Démarrer la caméra"}
          </button>
        </>
      )}

      {/* MODE MANUEL */}
      {mode === "manual" && (
        <div className="w-full max-w-sm mb-6">
          <p className="text-white/40 text-xs text-center mb-4 uppercase tracking-wider">
            Copiez-collez l'ID du billet depuis Supabase ou le billet PDF
          </p>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
              placeholder="UUID du billet ex: 73f09356-..."
              className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-amber-400 font-mono text-sm"
            />
            <button
              onClick={handleManualSubmit}
              disabled={!manualId.trim() || status === "pending"}
              className="w-full py-4 bg-amber-400 text-black font-black uppercase rounded-2xl hover:bg-amber-300 transition-all disabled:opacity-40"
            >
              {status === "pending" ? "Vérification..." : "Valider le billet"}
            </button>
          </div>
        </div>
      )}

      {/* Feedback */}
      <div className={`w-full max-w-sm p-6 rounded-3xl text-center border transition-all ${
        status === "valid" ? "border-emerald-500/50 bg-emerald-500/10" :
        status === "invalid" ? "border-rose-500/50 bg-rose-500/10" :
        status === "pending" ? "border-amber-500/50 bg-amber-500/10" :
        "border-white/10 bg-white/5"
      }`}>
        {status === "valid" && <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />}
        {status === "invalid" && <XCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />}
        {status === "pending" && <Loader2 className="w-12 h-12 text-amber-400 mx-auto mb-3 animate-spin" />}
        {status === "idle" && (mode === "camera" ? <Camera className="w-12 h-12 text-white/20 mx-auto mb-3" /> : <Keyboard className="w-12 h-12 text-white/20 mx-auto mb-3" />)}
        <p className={`font-bold text-lg ${
          status === "valid" ? "text-emerald-400" :
          status === "invalid" ? "text-rose-400" :
          status === "pending" ? "text-amber-400" :
          "text-white/50"
        }`}>{message}</p>
      </div>
    </div>
  );
}
