import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Html5Qrcode } from "html5-qrcode";
import { useAuth } from "../../contexts/AuthContext";
import { CheckCircle, XCircle, Loader2, Camera, Keyboard } from "lucide-react";

export default function ScanPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<"idle" | "valid" | "invalid" | "pending">("idle");
  const [message, setMessage] = useState("Scannez ou saisissez un code");
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [mode, setMode] = useState<"camera" | "manual">("camera");
  const [lastTicket, setLastTicket] = useState<any>(null);
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
    } catch {
      setStatus("invalid");
      setMessage("Caméra indisponible → utilisez le mode manuel");
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
    return () => { if (scannerRef.current) scannerRef.current.stop().catch(console.error); };
  }, []);

  const validateTicket = async (ticketId: string, isQrHash = false) => {
    if (scanLock.current) return;
    scanLock.current = true;
    setTimeout(() => (scanLock.current = false), 3000);

    setStatus("pending");
    setMessage("Vérification...");

    try {
      // Cherche par id, qr_code_hash, ou code_court
      const { data: ticket, error } = await supabase
        .from("tickets")
        .select("*, events(title)")
        .or(`id.eq.${ticketId},qr_code_hash.eq.${ticketId},code_court.eq.${ticketId.toUpperCase()}`)
        .maybeSingle();

      if (error || !ticket) {
        setStatus("invalid");
        setMessage("Billet introuvable ❌");
        resetAfterDelay();
        return;
      }

      if (ticket.checked_in) {
        setStatus("invalid");
        setMessage("Billet déjà utilisé !");
        setLastTicket(ticket);
        resetAfterDelay();
        return;
      }

      await supabase.from("tickets").update({ checked_in: true }).eq("id", ticket.id);
      await supabase.from("scan_logs").insert({ ticket_id: ticket.id, scanned_by: user?.id || null });

      setStatus("valid");
      setLastTicket(ticket);
      setMessage(`Entrée autorisée ! 🎉`);
      resetAfterDelay();
    } catch {
      setStatus("invalid");
      setMessage("Erreur de vérification");
      resetAfterDelay();
    }
  };

  const handleScan = (data: string | null) => {
    if (!data) return;
    let ticketId = data.trim();
    try { ticketId = JSON.parse(data).id || data; } catch { }
    validateTicket(ticketId, true);
  };

  const handleManualSubmit = () => {
    if (!manualCode.trim()) return;
    validateTicket(manualCode.trim());
    setManualCode("");
  };

  const resetAfterDelay = () => {
    setTimeout(() => {
      setStatus("idle");
      setLastTicket(null);
      setMessage(mode === "camera" ? "Cadrez le QR code" : "Saisissez un code");
    }, 4000);
  };

  return (
    <div className={`min-h-screen text-white flex flex-col items-center pt-24 px-6 pb-16 transition-colors duration-500 ${
      status === "valid" ? "bg-emerald-900/40" :
      status === "invalid" ? "bg-rose-900/40" : "bg-[#1a0525]"
    }`}>
      <h1 className="text-3xl font-black uppercase italic mb-6 text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-300">
        Scanner un billet
      </h1>

      {/* Toggle */}
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
          <Keyboard size={16} /> Code court
        </button>
      </div>

      {/* MODE CAMÉRA */}
      {mode === "camera" && (
        <>
          <div className="w-full max-w-sm rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl mb-6 bg-black relative min-h-[280px] flex items-center justify-center">
            <div id="qr-reader" style={{ width: "100%" }} />
            {!scanning && <Camera size={64} className="text-white/10 absolute" />}
          </div>
          <button
            onClick={scanning ? stopScanner : startScanner}
            className={`px-10 py-4 rounded-2xl font-black uppercase tracking-widest transition-all mb-6 shadow-lg ${
              scanning ? "bg-rose-500 hover:bg-rose-400 text-white" : "bg-amber-400 hover:bg-amber-300 text-black"
            }`}
          >
            {scanning ? "⏹ Arrêter" : "▶ Démarrer"}
          </button>
        </>
      )}

      {/* MODE CODE COURT */}
      {mode === "manual" && (
        <div className="w-full max-w-sm mb-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-4 text-center">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">
              Code à 6 caractères visible sur le billet
            </p>
            <p className="text-amber-400 text-5xl font-black tracking-[0.4em] mb-2">
              AB3X7K
            </p>
            <p className="text-white/20 text-xs">Exemple de code court</p>
          </div>

          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
            placeholder="Ex: AB3X7K"
            maxLength={6}
            className="w-full px-4 py-5 bg-white/5 border border-white/20 rounded-2xl text-white text-center text-3xl font-black tracking-[0.4em] placeholder:text-white/20 focus:outline-none focus:border-amber-400 uppercase mb-3"
          />
          <button
            onClick={handleManualSubmit}
            disabled={manualCode.length < 4 || status === "pending"}
            className="w-full py-4 bg-amber-400 text-black font-black uppercase rounded-2xl hover:bg-amber-300 transition-all disabled:opacity-40 text-lg"
          >
            {status === "pending" ? "Vérification..." : "Valider ✓"}
          </button>
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

        <p className={`font-bold text-xl mb-2 ${
          status === "valid" ? "text-emerald-400" :
          status === "invalid" ? "text-rose-400" :
          status === "pending" ? "text-amber-400" : "text-white/50"
        }`}>{message}</p>

        {/* Infos billet scanné */}
        {lastTicket && status === "valid" && (
          <p className="text-emerald-300/70 text-sm mt-1">
            🎫 {lastTicket.events?.title || "Billet valide"}
          </p>
        )}
      </div>
    </div>
  );
}
