import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase"; // ✅ Correction ici

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      console.log("🔄 Traitement du retour Google...");

      // 1. On laisse Supabase digérer le code de l'URL
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("❌ Erreur callback OAuth :", error.message);
        navigate("/auth/login");
        return;
      }

      if (session) {
        console.log("✅ Session confirmée ! Redirection vers l'accueil...");

        // Recharge propre pour mettre à jour le AuthContext
        window.location.href = "/";
      } else {
        navigate("/auth/login", { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#1a0525] text-amber-300">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent mb-4"></div>
      <p className="animate-pulse font-bold tracking-widest">FINALISATION DE LA CONNEXION...</p>
    </div>
  );
}