// src/components/SuperAdminRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export const SuperAdminRoute = ({ children }: { children: JSX.Element }) => {
  const { profile, loading } = useAuth();
  if (loading) return null;
  if (profile?.role !== "superadmin") {
    return <Navigate to="/" replace />;
  }
  return children;
};