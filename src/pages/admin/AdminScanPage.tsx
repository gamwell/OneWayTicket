import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from '../../lib/supabase';
import { CheckCircle, XCircle, Camera, Loader2, RefreshCw, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Chemins vers vos fichiers audio dans /public/sound/
const SOUND_SUCCESS = '/sound/qr_success.wav';
const SOUND_ERROR = '/sound/qr_error.wav';

const AdminScanPage: React.FC = () => {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; ticket?: any } | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Référence pour le scanner
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Initialisation stable des références Audio
  const audioSuccess = useRef(new Audio(SOUND_SUCCESS));
  const audioError = useRef(new Audio(SOUND_ERROR));

  // Pré-chargement des sons
  useEffect(() => {
    audioSuccess.current.load();
    audioError.current.load();
  }, []);

  const playFeedback = (type: 'success' | 'error') => {
    const sound = type === 'success' ? audioSuccess.current : audioError.current;
    
    sound.pause();
    sound.currentTime = 0; 
    
    sound.play().catch(err => console.warn("Audio bloqué par le navigateur :", err));
    
    // Vibration haptique (Android & iOS compatible)
    if ("vibrate" in navigator) {
      type === 'success' ? navigator.vibrate(100) : navigator.vibrate([200, 100, 200]);
    }
  };

  useEffect(() => {
    if (!isScanning || loading) return;

    // Initialisation du scanner HTML5
    scannerRef.current = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 15, // Plus fluide pour les scans rapides
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0 
      },
      false
    );

    scannerRef.current.render(onScanSuccess, (err) => { /* Ignore failure */ });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => console.error("Arrêt scanner:", error));
        scannerRef.current = null;
      }
    };
  }, [isScanning, loading]);

  async function onScanSuccess(decodedText: string) {
    if (loading) return;
    
    setLoading(true);
    setIsScanning(false);

    try {
      // 1. Vérification dans Supabase
      const { data: ticket, error } = await supabase
        .from('tickets')
        .select('*, events(title)')
        .eq('id', decodedText)
        .single();

      if (error || !ticket) {
        playFeedback('error');
        setScanResult({ success: false, message: "BILLET INCONNU" });
      } else if (ticket.scanned_at) {
        playFeedback('error');
        setScanResult({ 
          success: false, 
          message: `DÉJÀ SCANNÉ`,
          ticket 
        });
      } else {
        // 2. Validation du billet (Update RLS requis)
        const { error: updateError } = await supabase
          .from('tickets')
          .update({ scanned_at: new Date().toISOString() })
          .eq('id', decodedText);

        if (updateError) throw updateError;

        playFeedback('success');
        setScanResult({ 
          success: true, 
          message: "ACCÈS ACCORDÉ", 
          ticket 
        });
      }
    } catch (err) {
      playFeedback('error');
      setScanResult({ success: false, message: "ERREUR RÉSEAU" });
    } finally {
      setLoading(false);
    }
  }

  const resetScanner = () => {
    setScanResult(null);
    setIsScanning(true);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col font-sans px-4 pt-10 pb-20">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 max-w-lg mx-auto w-full">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="text-cyan-400 w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Security Terminal</span>
          </div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">
            Gate <span className="text-cyan-400">Scanner</span>
          </h1>
        </div>
        <button 
          onClick={() => navigate('/admin')} 
          className="p-3 bg-slate-800/50 rounded-2xl border border-white/5 text-slate-400 hover:text-white transition-all"
        >
          <ArrowLeft size={24} />
        </button>
      </header>

      <div className="max-w-lg mx-auto w-full relative">
        {/* Zone de Scan Active */}
        {isScanning && (
          <div className="overflow-hidden rounded-[2.5rem] border-2 border-white/10 bg-black shadow-2xl relative">
            <div id="reader" className="w-full"></div>
            <div className="absolute bottom-0 w-full p-6 bg-slate-950/80 backdrop-blur-md border-t border-white/5 text-center">
              <p className="text-cyan-400 font-bold text-sm animate-pulse flex items-center justify-center gap-2">
                <Camera size={18} /> EN ATTENTE DE SIGNAL...
              </p>
            </div>
          </div>
        )}

        {/* Animation de chargement (Verrouillage API) */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f172a]/90 backdrop-blur-xl rounded-[2.5rem] z-50 border-2 border-cyan-500/30">
            <Loader2 className="animate-spin text-cyan-400 w-14 h-14 mb-4" />
            <p className="text-cyan-400 font-black uppercase text-[10px] tracking-[0.4em]">Auth en cours...</p>
          </div>
        )}

        {/* Interface de Résultat (Succès/Erreur) */}
        {scanResult && (
          <div className={`p-10 rounded-[2.5rem] border-2 flex flex-col items-center text-center transition-all animate-in zoom-in duration-300 ${
            scanResult.success 
            ? "bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_60px_-15px_rgba(16,185,129,0.3)]" 
            : "bg-red-500/10 border-red-500/50 shadow-[0_0_60px_-15px_rgba(239,68,68,0.3)]"
          }`}>
            {scanResult.success ? (
              <CheckCircle size={100} className="text-emerald-500 mb-6" />
            ) : (
              <XCircle size={100} className="text-red-500 mb-6" />
            )}
            
            <h2 className={`text-4xl font-black uppercase italic mb-2 tracking-tighter ${scanResult.success ? "text-emerald-400" : "text-red-400"}`}>
              {scanResult.message}
            </h2>

            {scanResult.ticket && (
              <div className="mt-6 p-6 bg-slate-900/60 rounded-3xl w-full border border-white/5">
                <p className="text-white font-black text-xl uppercase leading-tight mb-2">
                  {scanResult.ticket.events?.title || 'Événement Inconnu'}
                </p>
                <div className="h-[1px] bg-white/10 w-full my-4" />
                <p className="text-slate-500 text-[9px] font-mono tracking-widest uppercase">
                  ID: {scanResult.ticket.id}
                </p>
                {!scanResult.success && scanResult.ticket.scanned_at && (
                  <p className="text-red-400 text-[10px] font-bold uppercase mt-2">
                    Scanné à: {new Date(scanResult.ticket.scanned_at).toLocaleTimeString()}
                  </p>
                )}
              </div>
            )}

            <button 
              onClick={resetScanner}
              className="mt-10 flex items-center justify-center gap-3 bg-white text-slate-950 px-10 py-5 rounded-2xl font-black uppercase text-sm hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              <RefreshCw size={20} /> Scan Suivant
            </button>
          </div>
        )}
      </div>

      {/* Footer Status */}
      <footer className="mt-auto max-w-lg mx-auto w-full grid grid-cols-2 gap-4">
        <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl">
          <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Audio Feedback</p>
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Activé (WAV)</p>
        </div>
        <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl">
          <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Vibration</p>
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Haptique OK</p>
        </div>
      </footer>
    </div>
  );
};

export default AdminScanPage;