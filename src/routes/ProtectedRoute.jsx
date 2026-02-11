import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Cargando sesión...</div>;

  if (!isAuthenticated) {
    const from = location.pathname + location.search;
    return <Navigate to="/auth/login" replace state={{ from }} />;
  }

  return <Outlet />;
}
