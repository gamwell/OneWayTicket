import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Loader2, Sparkles } from 'lucide-react';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulation d'envoi
    setTimeout(() => {
      setSent(true);
      setLoading(false);
      setTimeout(() => setSent(false), 5000); // Reset le message de succès après 5s
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white relative overflow-hidden pt-24 pb-12 px-6">
      
      {/* --- EFFETS DE FOND (Signature OneWayTicket) --- */}
      <div className="fixed inset-0 z-[1] pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }}></div>
      
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[10%] left-[-5%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* --- HEADER --- */}
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-6 text-emerald-400">
            <Sparkles size={14} /> Support Client
          </div>
          <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase mb-4 leading-none">
            Besoin d'<span className="text-emerald-400">aide</span> ?
          </h1>
          <p className="text-slate-400 font-medium max-w-xl mx-auto italic">
            Une question sur un billet ou un événement ? Notre équipe de passionnés vous répond sous 24h.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          
          {/* --- INFOS DE CONTACT (Col 2/5) --- */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
              <h2 className="text-xl font-black italic tracking-tighter uppercase mb-8 flex items-center gap-3">
                <MessageSquare className="text-orange-400" /> Nos Coordonnées
              </h2>
              
              <div className="space-y-8">
                <ContactInfo 
                  icon={<Mail className="text-orange-400" />} 
                  label="Email" 
                  value="contact@onewayticket.com" 
                  bgColor="bg-orange-400/10" 
                />
                <ContactInfo 
                  icon={<Phone className="text-emerald-400" />} 
                  label="Téléphone" 
                  value="+33 1 23 45 67 89" 
                  bgColor="bg-emerald-400/10" 
                />
                <ContactInfo 
                  icon={<MapPin className="text-blue-400" />} 
                  label="Bureau" 
                  value="Paris, Station F" 
                  bgColor="bg-blue-400/10" 
                />
              </div>
            </div>

            {/* Petite carte décorative */}
            <div className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-white/10 p-8 rounded-[2.5rem] italic">
              <p className="text-sm font-medium text-slate-300">
                "Nous ne vendons pas que des billets, nous ouvrons des portes vers vos plus beaux souvenirs."
              </p>
            </div>
          </div>

          {/* --- FORMULAIRE (Col 3/5) --- */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Nom</label>
                  <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white outline-none focus:border-emerald-500/50 transition-all font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Prénom</label>
                  <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white outline-none focus:border-emerald-500/50 transition-all font-bold" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Email</label>
                <input type="email" required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white outline-none focus:border-emerald-500/50 transition-all font-bold" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Message</label>
                <textarea rows={4} required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white outline-none focus:border-emerald-500/50 transition-all font-bold resize-none"></textarea>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full py-5 rounded-2xl bg-emerald-500 text-slate-900 font-black uppercase tracking-tighter text-lg shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 flex justify-center items-center gap-3"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : sent ? (
                  "Message Envoyé !"
                ) : (
                  <>Envoyer le message <Send size={20} /></>
                )}
              </button>
              
              {sent && (
                <p className="text-center text-emerald-400 text-xs font-bold animate-pulse uppercase tracking-widest">
                  Merci ! Notre équipe revient vers vous très vite.
                </p>
              )}
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

// Sous-composant pour les infos de contact
function ContactInfo({ icon, label, value, bgColor }: any) {
  return (
    <div className="flex items-center gap-5 group">
      <div className={`p-4 ${bgColor} rounded-2xl transition-transform group-hover:scale-110 duration-300`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-lg font-bold tracking-tight">{value}</p>
      </div>
    </div>
  );
}