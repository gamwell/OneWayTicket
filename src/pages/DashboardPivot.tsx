import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function DashboardPivot() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return; // ⏳ On attend la fin du chargement

    if (!user) {
      // ❌ Pas connecté → accueil
      navigate("/", { replace: true });
      return;
    }

    // 🔐 Détection admin
    const isAdmin =
      profile?.role === "admin" ||
      profile?.role === "superadmin" ||
      profile?.is_admin === true;

    if (isAdmin) {
      // 🛠️ Admin → Dashboard Admin
      navigate("/admin/dashboard", { replace: true });
    } else {
      // 👤 Utilisateur normal → Profil
      navigate("/profile", { replace: true });
    }
  }, [user, profile, loading, navigate]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#1a0525] text-white">
      <p className="animate-pulse text-amber-300 tracking-widest text-xs uppercase">
        Redirection vers votre espace...
      </p>
    </div>
  );
}