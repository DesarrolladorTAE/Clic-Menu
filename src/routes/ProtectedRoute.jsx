import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Cargando sesión...</div>;
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;

  return <Outlet />;
}
