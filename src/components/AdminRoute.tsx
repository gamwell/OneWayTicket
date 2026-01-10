// src/components/AdminRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { profile, loading } = useAuth();

  // Pendant le chargement de la session
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-white">
        Vérification des droits...
      </div>
    );
  }

  // Si pas de profil ou rôle insuffisant
  if (!profile || (profile.role !== "admin" && profile.role !== "superadmin")) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};