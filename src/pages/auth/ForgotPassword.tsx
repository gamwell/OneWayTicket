import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { Mail, ArrowLeft, Loader2, Sparkles } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });

      if (error) throw error;

      setMessage({
        type: "success",
        text: "Email envoyé ! Vérifiez votre boîte de réception (et vos spams).",
      });
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Une erreur est survenue.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a0525] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Fond d'ambiance */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-rose-500/10 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2rem] relative z-10">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[9px] font-bold tracking-widest uppercase text-amber-300 mb-4">
            <Sparkles size={10} /> Récupération
          </div>
          <h2 className="text-3xl font-black italic uppercase text-white mb-2">
            Mot de passe oublié ?
          </h2>
          <p className="text-white/50 text-sm">
            Entrez votre email pour recevoir un lien magique.
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-xl text-xs font-bold text-center border ${
              message.type === "success"
                ? "bg-teal-500/10 border-teal-500/30 text-teal-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">
              Votre Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30"
                size={18}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-amber-300 transition-all"
                placeholder="exemple@email.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-white text-[#1a0525] rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-amber-300 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Envoyer le lien"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
          >
            <ArrowLeft size={14} /> Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;