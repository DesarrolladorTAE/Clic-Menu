import React from "react";
import { Box } from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import SystemAdminSidebar from "../components/layout/SystemAdminSidebar";
import { useSystemAdminAuth } from "../context/SystemAdminAuthContext";

export default function SystemAdminLayout() {
  const nav = useNavigate();
  const location = useLocation();
  const { logout, adminUser } = useSystemAdminAuth();

  const pathname = location.pathname;

  let currentKey = "dashboard";

  if (pathname.includes("/subscription-sales")) {
    currentKey = "subscription-sales";
  } else if (pathname.includes("/owners")) {
    currentKey = "owners";
  } else {
    currentKey = "dashboard";
  }

  const handleNavigate = (key) => {
    switch (key) {
      case "dashboard":
        nav("/system-admin");
        break;

      case "owners":
        nav("/system-admin/owners");
        break;

      case "subscription-sales":
        nav("/system-admin/subscription-sales");
        break;

      default:
        nav("/system-admin");
        break;
    }
  };

  const handleLogout = async () => {
    await logout();
    nav("/system-admin/login", { replace: true });
  };

  const adminName = adminUser?.name
    ? `${adminUser.name} ${adminUser.last_name_paternal || ""}`.trim()
    : "Administrador";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        bgcolor: "background.default",
      }}
    >
      <SystemAdminSidebar
        adminName={adminName}
        currentKey={currentKey}
        logoSrc="/images/clicmenu-blanco.png"
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          bgcolor: "background.default",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}