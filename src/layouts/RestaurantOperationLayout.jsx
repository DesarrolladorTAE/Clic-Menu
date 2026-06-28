import React, { useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import RestaurantOperationSidebar from "../components/layout/RestaurantOperationSidebar";
import { getPlanAccess } from "../services/plan/planAccess.service";

export default function RestaurantOperationLayout() {
  const nav = useNavigate();
  const location = useLocation();
  const { restaurantId } = useParams();

  const restaurantName = location.state?.restaurantName || "RESTAURANTE";
  const pathname = location.pathname;

  const [planAccess, setPlanAccess] = useState(null);
  const [planAccessLoading, setPlanAccessLoading] = useState(false);
  const [planAccessError, setPlanAccessError] = useState("");

  const planFeatures = useMemo(() => planAccess?.features || {}, [planAccess]);

  useEffect(() => {
    let mounted = true;

    const loadPlanAccess = async () => {
      if (!restaurantId) return;

      setPlanAccessLoading(true);
      setPlanAccessError("");

      try {
        const data = await getPlanAccess(restaurantId);

        if (!mounted) return;

        setPlanAccess(data || null);
      } catch (error) {
        if (!mounted) return;

        setPlanAccess(null);
        setPlanAccessError(
          error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            "No se pudo cargar el acceso del plan."
        );
      } finally {
        if (mounted) {
          setPlanAccessLoading(false);
        }
      }
    };

    loadPlanAccess();

    return () => {
      mounted = false;
    };
  }, [restaurantId]);

  const currentKey = useMemo(() => {
    const isBranchSalesChannelsSection =
      pathname.includes("/branch-sales-channels") ||
      (pathname.includes("/operation/branches/") &&
        pathname.includes("/sales-channels/") &&
        pathname.includes("/products"));

    if (isBranchSalesChannelsSection) return "branch-sales-channels";
    if (pathname.includes("/reports/sales")) return "sales-report";
    if (pathname.includes("/reports/profit")) return "profit-report";
    if (pathname.includes("/purchases")) return "purchases";
    if (pathname.includes("/modifiers")) return "modifiers";
    if (pathname.includes("/staff")) return "staff";
    if (pathname.includes("/warehouses/inventory-report")) {
      return "inventory-report";
    }
    if (pathname.includes("/warehouses")) return "warehouses";
    if (pathname.includes("/ingredients")) return "ingredients";
    if (pathname.includes("/public-menu-settings")) return "public-menu-settings";
    if (pathname.includes("/menu")) return "menu";
    if (pathname.includes("/catalog")) return "catalog";
    if (pathname.includes("/tables")) return "tables";
    if (pathname.includes("/cash-registers")) return "cash-registers";
    if (pathname.includes("/ticket-settings")) return "ticket-settings";
    if (pathname.includes("/customer-loyalty-settings")) {
      return "customer-loyalty-settings";
    }

    if (pathname.includes("/connections/taeconta")) {
      return "taeconta";
    }

    return "staff";
  }, [pathname]);

  const restrictedRouteByKey = useMemo(
    () => ({
      ingredients: {
        feature: "ingredient_modules",
        redirectTo: "staff",
      },
      warehouses: {
        feature: "warehouse_modules",
        redirectTo: "staff",
      },
      purchases: {
        feature: "purchase_modules",
        redirectTo: "staff",
      },
      modifiers: {
        feature: "modifier_modules",
        redirectTo: "staff",
      },
      "sales-report": {
        feature: "report_modules",
        redirectTo: "staff",
      },
      "profit-report": {
        feature: "report_modules",
        redirectTo: "staff",
      },
      "inventory-report": {
        feature: "report_modules",
        redirectTo: "staff",
      },
      "customer-loyalty-settings": {
        feature: "customer_loyalty_modules",
        redirectTo: "staff",
      },
      "public-menu-settings": {
        feature: "public_menu_advanced_customization",
        redirectTo: "staff",
      },
    }),
    [] 
  );

  const canAccessKey = (key) => {
    const restriction = restrictedRouteByKey[key];

    if (!restriction) return true;

    return !!planFeatures?.[restriction.feature];
  };

  const base = `/owner/restaurants/${restaurantId}/operation`;

  const currentRestriction = restrictedRouteByKey[currentKey] || null;

  const isRestrictedRoute =
    !!currentRestriction &&
    !!planAccess &&
    !planAccessLoading &&
    !canAccessKey(currentKey);

  const shouldHoldOutlet =
    !!currentRestriction &&
    (planAccessLoading || (!planAccess && !planAccessError) || isRestrictedRoute);

  useEffect(() => {
    if (planAccessLoading) return;
    if (!planAccess) return;
    if (!isRestrictedRoute) return;

    const redirectKey = currentRestriction?.redirectTo || "staff";

    nav(`${base}/${redirectKey}`, {
      replace: true,
      state: {
        restaurantName,
        planBlockedMessage: "Tu plan actual no permite acceder a este módulo.",
      },
    });
  }, [
    base,
    currentRestriction,
    isRestrictedRoute,
    nav,
    planAccess,
    planAccessLoading,
    restaurantName,
  ]);

  const handleNavigate = (key) => {
    if (!canAccessKey(key)) {
      nav(`${base}/staff`, {
        replace: true,
        state: {
          restaurantName,
          planBlockedMessage: "Tu plan actual no permite acceder a este módulo.",
        },
      });
      return;
    }

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

      case "taeconta":
        nav(`${base}/connections/taeconta`, {
          state: { restaurantName },
        });
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
        planAccess={planAccess}
        planFeatures={planFeatures}
        planAccessLoading={planAccessLoading}
        planAccessError={planAccessError}
      />

      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          bgcolor: "background.default",
        }}
      >
        {!shouldHoldOutlet ? (
          <Outlet
            context={{
              planAccess,
              planFeatures,
              planAccessLoading,
              planAccessError,
            }}
          />
        ) : null}
      </Box>
    </Box>
  );
}