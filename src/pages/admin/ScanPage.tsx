import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Html5Qrcode } from "html5-qrcode";
import { useAuth } from "../../contexts/AuthContext";
import { CheckCircle, XCircle, Loader2, Camera } from "lucide-react";

export default function ScanPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<"idle" | "valid" | "invalid" | "pending">("idle");
  const [message, setMessage] = useState("Appuyez sur Démarrer pour scanner");
  const [lastScannedTicket, setLastScannedTicket] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scanLock = useRef(false);

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        // ✅ Force la caméra arrière sur mobile
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (result) => handleScan(result),
        (error) => console.warn("QR scan error:", error)
      );

      setScanning(true);
      setMessage("Pointez la caméra vers un QR code");
    } catch (err) {
      console.error("Erreur démarrage caméra:", err);
      setStatus("invalid");
      setMessage("Impossible d'accéder à la caméra. Vérifiez les permissions.");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(console.error);
      scannerRef.current = null;
    }
    setScanning(false);
    setMessage("Scanner arrêté");
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  // Realtime sync
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
    setMessage("Vérification du billet...");

    try {
      // Supporte QR code = UUID direct ou JSON avec id
      let ticketId = data;
      try {
        const parsed = JSON.parse(data);
        ticketId = parsed.id || data;
      } catch {
        ticketId = data; // QR code = UUID direct
      }

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
    } catch (err) {
      console.error("Erreur scan:", err);
      setStatus("invalid");
      setMessage("QR Code invalide");
      resetAfterDelay();
    }
  };

  const resetAfterDelay = () => {
    setTimeout(() => {
      setStatus("idle");
      setMessage("Pointez la caméra vers un QR code");
      setLastScannedTicket(null);
    }, 3000);
  };

  const bgColor = {
    idle: "bg-[#1a0525]",
    valid: "bg-emerald-900/40",
    invalid: "bg-rose-900/40",
    pending: "bg-amber-900/20",
  }[status];

  return (
    <div className={`min-h-screen ${bgColor} text-white flex flex-col items-center pt-24 px-6 pb-16 transition-colors duration-500`}>
      <h1 className="text-3xl font-black uppercase italic mb-8 text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-300">
        Scanner un billet
      </h1>

      {/* Conteneur scanner */}
      <div className="w-full max-w-sm rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl mb-6 bg-black">
        <div id="qr-reader" style={{ width: "100%" }} />
        {!scanning && (
          <div className="flex items-center justify-center h-48 text-white/20">
            <Camera size={48} />
          </div>
        )}
      </div>

      {/* Bouton start/stop */}
      <button
        onClick={scanning ? stopScanner : startScanner}
        className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all mb-8 ${
          scanning
            ? "bg-rose-500 hover:bg-rose-400 text-white"
            : "bg-amber-400 hover:bg-amber-300 text-black"
        }`}
      >
        {scanning ? "Arrêter" : "Démarrer la caméra"}
      </button>

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
        {status === "idle" && <Camera className="w-12 h-12 text-white/20 mx-auto mb-3" />}
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
