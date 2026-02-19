import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useStaffAuth } from "../context/StaffAuthContext";

export default function StaffProtectedRoute() {
  const { isStaffAuthenticated } = useStaffAuth();
  const location = useLocation();

  if (!isStaffAuthenticated) {
    const from = location.pathname + location.search;
    return <Navigate to="/staff/login" replace state={{ from }} />;
  }

  return <Outlet />;
}