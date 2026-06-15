import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import RestaurantAdminSidebar from "../components/layout/RestaurantAdminSidebar";
import { getPlanAccess } from "../services/plan/planAccess.service";
import { getBranchesByRestaurant } from "../services/restaurant/branch.service";
import AppAlert from "../components/common/AppAlert";

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

  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(false);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "info",
    title: "",
    message: "",
  });

  const planFeatures = useMemo(
    () => planAccess?.features || {},
    [planAccess]
  );

  const hasActiveBranch = useMemo(() => {
    return branches.some((branch) => String(branch?.status) === "active");
  }, [branches]);

  const showAlert = ({ severity = "warning", title = "Aviso", message = "" }) => {
    if (!message) return;

    setAlertState({
      open: true,
      severity,
      title,
      message,
    });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const loadBranches = useCallback(async () => {
    if (!restaurantId) return [];

    setBranchesLoading(true);

    try {
      const res = await getBranchesByRestaurant(restaurantId);

      const rows = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : [];

      setBranches(rows);

      return rows;
    } catch (error) {
      setBranches([]);
      return [];
    } finally {
      setBranchesLoading(false);
    }
  }, [restaurantId]);

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

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

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

  const handleNavigate = async (key) => {

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
      const freshBranches = await loadBranches();

      const hasFreshActiveBranch = freshBranches.some(
        (branch) => String(branch?.status) === "active"
      );

      if (!hasFreshActiveBranch) {
        showAlert({
          severity: "warning",
          title: "Sucursal requerida",
          message: "Primero debes crear una sucursal activa para acceder al módulo de operación.",
        });
        return;
      }

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

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={alertState.severity}
        title={alertState.title}
        message={alertState.message}
        autoHideDuration={4200}
      />
    </Box>
  );
}