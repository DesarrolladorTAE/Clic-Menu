import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OwnerRoute() {
  const { user, loading } = useAuth();

  if (loading) return <div>Cargando sesión...</div>;
  if (!user) return <Navigate to="/auth/login" replace />;

  //Como llega el rol desde Laravel:
  const isOwner =
    user?.role?.name?.toLowerCase() === "propietario" ||
    String(user?.role_id) === "2";

  if (!isOwner) return <Navigate to="/app" replace />;

  return <Outlet />;
}
