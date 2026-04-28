import React from "react";
import { Box } from "@mui/material";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import RestaurantOperationSidebar from "../components/layout/RestaurantOperationSidebar";

export default function RestaurantOperationLayout() {
  const nav = useNavigate();
  const location = useLocation();
  const { restaurantId } = useParams();

  const restaurantName = location.state?.restaurantName || "RESTAURANTE";
  const pathname = location.pathname;

  let currentKey = "staff";

  const isBranchSalesChannelsSection =
    pathname.includes("/branch-sales-channels") ||
    (pathname.includes("/operation/branches/") &&
      pathname.includes("/sales-channels/") &&
      pathname.includes("/products"));

  if (isBranchSalesChannelsSection) {
    currentKey = "branch-sales-channels";
  } else if (pathname.includes("/reports/sales")) {
    currentKey = "sales-report";
  } else if (pathname.includes("/reports/profit")) {
    currentKey = "profit-report";
  } else if (pathname.includes("/purchases")) {
    currentKey = "purchases";
  } else if (pathname.includes("/modifiers")) {
    currentKey = "modifiers";
  } else if (pathname.includes("/staff")) {
    currentKey = "staff";
  } else if (pathname.includes("/warehouses")) {
    currentKey = "warehouses";
  } else if (pathname.includes("/ingredients")) {
    currentKey = "ingredients";
  } else if (pathname.includes("/menu")) {
    currentKey = "menu";
  } else if (pathname.includes("/catalog")) {
    currentKey = "catalog";
  } else if (pathname.includes("/tables")) {
    currentKey = "tables";
  } else if (pathname.includes("/cash-registers")) {
    currentKey = "cash-registers";
  } else if (pathname.includes("/public-menu-settings")) {
  currentKey = "public-menu-settings";
  } else if (pathname.includes("/ticket-settings")) {
    currentKey = "ticket-settings";
  } else if (pathname.includes("/customer-loyalty-settings")) {
    currentKey = "customer-loyalty-settings";
  }

  const handleNavigate = (key) => {
    const base = `/owner/restaurants/${restaurantId}/operation`;

    switch (key) {
      case "staff":
        nav(`${base}/staff`, { state: { restaurantName } });
        break;

      case "branch-sales-channels":
        nav(`${base}/branch-sales-channels`, { state: { restaurantName } });
        break;

      case "ingredients":
        nav(`${base}/ingredients`, { state: { restaurantName } });
        break;

      case "warehouses":
        nav(`${base}/warehouses`, { state: { restaurantName } });
        break;

      case "purchases":
        nav(`${base}/purchases`, { state: { restaurantName } });
        break;

      case "menu":
        nav(`${base}/menu`, { state: { restaurantName } });
        break;

      case "catalog":
        nav(`${base}/catalog`, { state: { restaurantName } });
        break;

      case "modifiers":
        nav(`${base}/modifiers`, { state: { restaurantName } });
        break;

      case "tables":
        nav(`${base}/tables`, { state: { restaurantName } });
        break;

      case "cash-registers":
        nav(`${base}/cash-registers`, { state: { restaurantName } });
        break;

      case "ticket-settings":
        nav(`${base}/ticket-settings`, { state: { restaurantName } });
        break;

      case "public-menu-settings":
        nav(`${base}/public-menu-settings`, { state: { restaurantName } });
        break;

      case "customer-loyalty-settings":
        nav(`${base}/customer-loyalty-settings`, { state: { restaurantName } });
        break;

      case "sales-report":
        nav(`${base}/reports/sales`, { state: { restaurantName } });
        break;

      case "profit-report":
        nav(`${base}/reports/profit`, { state: { restaurantName } });
        break;

      default:
        nav(`${base}/staff`, { state: { restaurantName } });
        break;
    }
  };

  const handleBackToPreviousMenu = () => {
    nav(`/owner/restaurants/${restaurantId}/edit-info`, {
      state: { restaurantName },
    });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        bgcolor: "background.default",
      }}
    >
      <RestaurantOperationSidebar
        restaurantName={restaurantName}
        currentKey={currentKey}
        logoSrc="/images/clicmenu-blanco.png"
        onNavigate={handleNavigate}
        onLogout={handleBackToPreviousMenu}
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