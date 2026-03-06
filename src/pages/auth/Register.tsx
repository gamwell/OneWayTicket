import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-hot-toast";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  Chrome,
  Sparkles,
  AlertCircle,
  LogIn, // Icône ajoutée pour le bouton de redirection
} from "lucide-react";

const Register: React.FC = () => {
  const navigate = useNavigate();
  // ✅ On utilise le AuthContext au lieu de Supabase direct
  const { signUp, signInWithGoogle } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // ✅ Nouvel état pour gérer l'affichage du bouton "Se connecter"
  const [isAccountExisting, setIsAccountExisting] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);
    setIsAccountExisting(false);

    try {
      // ✅ Appel via AuthContext (déclenche l'email auto si succès)
      const { error: authError } = await signUp(
        formData.email.trim(),
        formData.password,
        formData.fullName.trim()
      );

      if (authError) throw authError;

      // Succès
      toast.success("Compte créé avec succès !");
      toast("Vérifiez vos emails pour confirmer votre inscription.", {
        icon: "📧",
        duration: 6000,
      });
      navigate("/auth/login");

    } catch (err: any) {
      console.error("Erreur Inscription:", err);
      
      // ✅ DÉTECTION DU COMPTE EXISTANT
      // Supabase renvoie souvent "User already registered"
      if (err.message?.includes("User already registered") || err.message?.includes("already exists")) {
        setError("Cet email possède déjà un compte.");
        setIsAccountExisting(true); // On active le bouton de connexion
        toast.error("Ce compte existe déjà !");
      } else {
        setError(err.message || "Une erreur est survenue.");
        toast.error("Impossible de créer le compte");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      await signInWithGoogle();
    } catch {
      toast.error("Impossible de se connecter avec Google.");
    }
  };

  return (
    <div
      className="min-h-screen text-white flex items-center justify-center px-6 relative overflow-hidden py-20"
      style={{ backgroundColor: "#1a0525" }}
    >
      <div className="fixed inset-0 z-[0] pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")`,
          }}
        ></div>
        <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] bg-rose-500/20 blur-[130px] rounded-full"></div>
        <div className="absolute bottom-[5%] left-[-5%] w-[60%] h-[60%] bg-amber-400/15 blur-[160px] rounded-full"></div>
      </div>

      <div className="max-w-md w-full animate-in fade-in zoom-in duration-500 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase mb-4 text-amber-200 shadow-lg shadow-amber-500/10">
            <Sparkles size={10} className="text-amber-300" /> New Account
          </div>

          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white drop-shadow-xl leading-tight">
            Rejoindre <br />
            <span className="bg-gradient-to-r from-rose-400 via-amber-300 to-orange-400 bg-clip-text text-transparent inline-block py-2 pr-2">
              OneWayTicket
            </span>
          </h1>
        </div>

        <div className="bg-white/10 border border-white/20 p-8 rounded-[3rem] backdrop-blur-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden">
          
          {/* ZONE D'ERREUR INTELLIGENTE */}
          {error && (
            <div className="bg-rose-500/20 border border-rose-500/30 p-4 rounded-2xl flex flex-col gap-3 text-rose-200 text-xs mb-6 font-bold animate-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                 <AlertCircle className="w-5 h-5 shrink-0" /> 
                 <p>{error}</p>
              </div>

              {/* Bouton visible uniquement si le compte existe déjà */}
              {isAccountExisting && (
                <Link 
                  to="/auth/login" 
                  className="mt-1 bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-xl text-center transition-colors flex items-center justify-center gap-2 border border-white/10"
                >
                  <LogIn size={14} /> Se connecter maintenant
                </Link>
              )}
            </div>
          )}

          <button
            onClick={handleGoogleRegister}
            type="button"
            className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest hover:bg-white/15 hover:border-amber-200/50 transition-all mb-8 group text-white"
          >
            <Chrome
              size={20}
              className="text-amber-300 group-hover:scale-110 transition-transform"
            />
            Continuer avec Google
          </button>

          <div className="flex items-center gap-4 mb-8">
            <div className="h-[1px] bg-white/10 flex-1"></div>
            <span className="text-[10px] font-black uppercase text-rose-100/40">
              Ou Email
            </span>
            <div className="h-[1px] bg-white/10 flex-1"></div>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            {[
              {
                label: "Nom Complet",
                icon: User,
                type: "text",
                val: formData.fullName,
                set: (v: string) => setFormData({ ...formData, fullName: v }),
                autocomplete: "name",
              },
              {
                label: "Email",
                icon: Mail,
                type: "email",
                val: formData.email,
                set: (v: string) => setFormData({ ...formData, email: v }),
                autocomplete: "email",
              },
              {
                label: "Mot de passe",
                icon: Lock,
                type: "password",
                val: formData.password,
                set: (v: string) => setFormData({ ...formData, password: v }),
                autocomplete: "new-password",
              },
            ].map((field, i) => (
              <div key={i} className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-amber-100/60 ml-3">
                  {field.label}
                </label>
                <div className="relative group">
                  <field.icon
                    className="absolute left-6 top-1/2 -translate-y-1/2 text-amber-200/50 group-focus-within:text-amber-300 transition-colors"
                    size={18}
                  />
                  <input
                    required
                    type={field.type}
                    value={field.val}
                    onChange={(e) => field.set(e.target.value)}
                    autoComplete={field.autocomplete}
                    className="w-full bg-black/20 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white font-bold placeholder:text-white/20 focus:outline-none focus:border-amber-300 focus:bg-black/30 transition-all"
                    placeholder="..."
                  />
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-white text-[#1a0525] rounded-2xl font-black uppercase tracking-widest text-sm hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <ArrowRight size={20} />
              )}
              {loading ? "Création en cours..." : "S'inscrire"}
            </button>
          </form>

          <p className="text-center mt-8 text-white/40 text-xs font-bold uppercase tracking-tight">
            Déjà membre ?
            <Link
              to="/auth/login"
              className="text-teal-300 hover:text-white transition-colors ml-2 border-b border-teal-300/30 hover:border-white pb-0.5"
            >
              Connexion
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;