// src/pages/auth/Callback.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      // Supabase finalise automatiquement la session OAuth ici
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Erreur callback OAuth :", error);
        navigate("/auth/login");
        return;
      }

      // Si la session existe → redirection vers le dashboard
      if (data.session) {
        navigate("/dashboard");
      } else {
        // Si aucune session → retour à la connexion
        navigate("/auth/login");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen text-white">
      <p>Connexion en cours...</p>
    </div>
  );
}
