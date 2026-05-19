import React, { useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import RestaurantAdminSidebar from "../components/layout/RestaurantAdminSidebar";
import { getPlanAccess } from "../services/plan/planAccess.service";

export default function RestaurantAdminLayout() {
  const nav = useNavigate();
  const location = useLocation();
  const { restaurantId } = useParams();

  const restaurantName =
    location.state?.restaurantName || "RESTAURANTE";

  const pathname = location.pathname;

  const [planAccess, setPlanAccess] = useState(null);
  const [planAccessLoading, setPlanAccessLoading] = useState(false);
  const [planAccessError, setPlanAccessError] = useState("");

  const planFeatures = useMemo(
    () => planAccess?.features || {},
    [planAccess]
  );

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
    if (pathname.includes("/edit-info")) return "edit-info";
    if (pathname.includes("/settings")) return "config";
    if (pathname.includes("/branches")) return "branches";
    if (pathname.includes("/operation")) return "operation";

    return "edit-info";
  }, [pathname]);

  const restrictedRouteByKey = useMemo(
    () => ({
      config: {
        feature: "restaurant_settings_page",
        redirectTo: "edit-info",
      },
    }),
    []
  );

  const canAccessKey = (key) => {
    const restriction = restrictedRouteByKey[key];

    if (!restriction) return true;

    return !!planFeatures?.[restriction.feature];
  };

  const base = `/owner/restaurants/${restaurantId}`;

  const currentRestriction =
    restrictedRouteByKey[currentKey] || null;

  const isRestrictedRoute =
    !!currentRestriction &&
    !!planAccess &&
    !planAccessLoading &&
    !canAccessKey(currentKey);

  const shouldHoldOutlet =
    !!currentRestriction &&
    (
      planAccessLoading ||
      (!planAccess && !planAccessError) ||
      isRestrictedRoute
    );

  
  useEffect(() => {
    if (planAccessLoading) return;
    if (!planAccess) return;
    if (!isRestrictedRoute) return;

    const redirectKey =
      currentRestriction?.redirectTo || "edit-info";

    nav(`${base}/${redirectKey}`, {
      replace: true,
      state: {
        restaurantName,
        planBlockedMessage:
          "Tu plan actual no permite acceder a este módulo.",
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
      nav(`${base}/edit-info`, {
        replace: true,
        state: {
          restaurantName,
          planBlockedMessage:
            "Tu plan actual no permite acceder a este módulo.",
        },
      });

      return;
    }

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

    if (key === "branches") {
      nav(`/owner/restaurants/${restaurantId}/branches`, {
        state: { restaurantName },
      });
      return;
    }

    if (key === "operation") {
      nav(`/owner/restaurants/${restaurantId}/operation/staff`, {
         state: { restaurantName },
      });
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
        planAccess={planAccess}
        planFeatures={planFeatures}
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
          <Outlet />
        ) : null}
      </Box>
    </Box>
  );
}