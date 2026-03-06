import React from "react";
import ProtectedRoute from "./ProtectedRoute";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  return <ProtectedRoute requireAdmin>{children}</ProtectedRoute>;
};

export default AdminRoute;