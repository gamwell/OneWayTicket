import React from "react";
import ProtectedRoute from "./ProtectedRoute";

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * AdminRoute agit comme un simple wrapper autour de ProtectedRoute
 * en forçant l'exigence de droits administrateur.
 */
const AdminRoute = ({ children }: AdminRouteProps) => {
  // ✅ On utilise directement ProtectedRoute avec requireAdmin={true}
  // Cela utilise toute la logique de vérification de profil qu'on a corrigée.
  return (
    <ProtectedRoute requireAdmin={true}>
      {children}
    </ProtectedRoute>
  );
};

export default AdminRoute;