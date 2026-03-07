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
        { facingMode: "environment" },
        {
          fps: 15,                          // ✅ FPS augmenté
          qrbox: { width: 300, height: 300 }, // ✅ Zone plus grande
          aspectRatio: 1.0,
          disableFlip: false,               // ✅ Accepte les QR retournés
        },
        (result) => handleScan(result),
        () => {} // on ignore les erreurs de frame
      );

      setScanning(true);
      setMessage("Cadrez le QR code dans le carré — à 30-40cm");
    } catch (err) {
      console.error("Erreur caméra:", err);
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
    setMessage("Appuyez sur Démarrer pour scanner");
    setStatus("idle");
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) scannerRef.current.stop().catch(console.error);
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
      // ✅ Supporte UUID direct OU JSON
      let ticketId = data.trim();
      try {
        const parsed = JSON.parse(data);
        ticketId = parsed.id || data;
      } catch {
        ticketId = data.trim();
      }

      setLastScannedTicket(ticketId);

      // ✅ Cherche par id OU qr_code_hash
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
      await supabase.from("scan_logs").insert({
        ticket_id: ticket.id,
        scanned_by: user?.id || null,
      });

      setStatus("valid");
      setMessage("Entrée autorisée !");
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
      setMessage("Cadrez le QR code dans le carré — à 30-40cm");
      setLastScannedTicket(null);
    }, 3000);
  };

  return (
    <div className={`min-h-screen text-white flex flex-col items-center pt-24 px-6 pb-16 transition-colors duration-500 ${
      status === "valid" ? "bg-emerald-900/40" :
      status === "invalid" ? "bg-rose-900/40" :
      "bg-[#1a0525]"
    }`}>
      <h1 className="text-3xl font-black uppercase italic mb-2 text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-300">
        Scanner un billet
      </h1>
      <p className="text-white/30 text-xs mb-8 uppercase tracking-widest">
        Tenez le téléphone à 30-40cm du QR code
      </p>

      {/* Conteneur scanner */}
      <div className="w-full max-w-sm rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl mb-6 bg-black relative min-h-[320px] flex items-center justify-center">
        <div id="qr-reader" style={{ width: "100%" }} />
        {!scanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera size={64} className="text-white/10" />
          </div>
        )}
      </div>

      {/* Bouton start/stop */}
      <button
        onClick={scanning ? stopScanner : startScanner}
        className={`px-10 py-4 rounded-2xl font-black uppercase tracking-widest transition-all mb-8 shadow-lg ${
          scanning
            ? "bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/30"
            : "bg-amber-400 hover:bg-amber-300 text-black shadow-amber-500/30"
        }`}
      >
        {scanning ? "⏹ Arrêter" : "▶ Démarrer la caméra"}
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
