import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSystemAdminAuth } from "../context/SystemAdminAuthContext";

export default function SystemAdminProtectedRoute() {
  const { adminUser, loading } = useSystemAdminAuth();
  const location = useLocation();

  if (loading) return <div>Cargando sesión...</div>;

  if (!adminUser) {
    const from = location.pathname + location.search;
    return <Navigate to="/system-admin/login" replace state={{ from }} />;
  }

  const isSystemAdmin =
    adminUser?.role?.name?.toLowerCase() === "admin" &&
    adminUser?.role?.scope?.toLowerCase() === "system";

  if (!isSystemAdmin) {
    return <Navigate to="/system-admin/login" replace />;
  }

  return <Outlet />;
}