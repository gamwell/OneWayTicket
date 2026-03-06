import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // On utilise le contexte
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user, loading } = useAuth(); // On récupère l'état réel de l'app

  useEffect(() => {
    // 1. Si on est encore en chargement, on attend.
    if (loading) {
        console.log("⏳ [Callback] En attente de la session Supabase...");
        return; 
    }

    // 2. Si le chargement est fini et qu'on a un USER -> Dashboard
    if (user) {
      console.log("✅ [Callback] Utilisateur confirmé :", user.email);
      console.log("🔀 [Callback] Redirection vers le Dashboard...");
      
      // 'replace: true' empêche de revenir en arrière sur cette page de chargement
      navigate('/dashboard', { replace: true });
    } 
    
    // 3. Si le chargement est fini mais PAS d'utilisateur -> Login
    else {
      console.warn("⛔ [Callback] Pas d'utilisateur trouvé après chargement.");
      // Optionnel : on peut laisser une seconde chance ou renvoyer au login
      // navigate('/auth/login', { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-[#1a0525] flex flex-col items-center justify-center text-white">
      <div className="flex flex-col items-center gap-6 p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
        <Loader2 className="w-16 h-16 text-amber-400 animate-spin" />
        <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Finalisation...</h2>
            <p className="text-white/60 text-sm">Nous sécurisons votre connexion.</p>
        </div>
      </div>
    </div>
  );
}