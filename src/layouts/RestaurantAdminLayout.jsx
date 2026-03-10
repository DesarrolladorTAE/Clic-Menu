import React from "react";
import { Box } from "@mui/material";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import RestaurantAdminSidebar from "../components/layout/RestaurantAdminSidebar";

export default function RestaurantAdminLayout() {
  const nav = useNavigate();
  const location = useLocation();
  const { restaurantId } = useParams();

  const restaurantName =
    location.state?.restaurantName || "RESTAURANTE";

  const pathname = location.pathname;

  let currentKey = "config";
  if (pathname.includes("/edit-info")) currentKey = "edit-info";
  if (pathname.includes("/settings")) currentKey = "config";
  if (pathname.includes("/operation")) currentKey = "operation";

  const handleNavigate = (key) => {
    if (key === "edit-info") {
       nav(`/owner/restaurants/${restaurantId}/edit-info`, {
        state: { restaurantName },
       });
      return;
    }

    if (key === "config") {
      nav(`/owner/restaurants/${restaurantId}/settings`, {
        state: { restaurantName },
      });
      return;
    }

    if (key === "operation") {
      // después la conectamos al nuevo layout
      // nav(`/owner/restaurants/${restaurantId}/operation`, {
      //   state: { restaurantName },
      // });
      return;
    }
  };

  const handleBackToRestaurants = () => {
    nav("/owner/restaurants-home");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        bgcolor: "background.default",
      }}
    >
      <RestaurantAdminSidebar
        restaurantName={restaurantName}
        currentKey={currentKey}
        logoSrc="/images/clicmenu-blanco.png"
        onNavigate={handleNavigate}
        onLogout={handleBackToRestaurants}
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