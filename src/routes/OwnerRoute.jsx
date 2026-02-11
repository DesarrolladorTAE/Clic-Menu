import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OwnerRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Cargando sesión...</div>;

  if (!user) {
    const from = location.pathname + location.search;
    return <Navigate to="/auth/login" replace state={{ from }} />;
  }

  const isOwner =
    user?.role?.name?.toLowerCase() === "propietario" ||
    String(user?.role_id) === "2";

  if (!isOwner) return <Navigate to="/app" replace />;

  return <Outlet />;
}
