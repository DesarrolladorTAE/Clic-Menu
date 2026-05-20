// src/layouts/CashierLayout.jsx
import React, { useState } from "react";
import { Box } from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import AppAlert from "../components/common/AppAlert";
import CashierSidebar from "../components/layout/CashierSidebar";

import { useStaffAuth } from "../context/StaffAuthContext";

import { fetchCashierSaleQueue } from "../services/staff/casher/cashierQueue.service";
import { closeCashierSession } from "../services/staff/casher/cashierSession.service";
import { getStaffPlanAccess } from "../services/plan/planAccess.service";

export default function CashierLayout() {
  const nav = useNavigate();
  const location = useLocation();
  const { clearStaff } = useStaffAuth() || {};

  const [closing, setClosing] = useState(false);

  const [planAccess, setPlanAccess] = useState(null);
  const [planAccessLoading, setPlanAccessLoading] = useState(false);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "info",
    title: "",
    message: "",
  });

  const pathname = location.pathname;
  const currentKey = getCurrentKey(pathname);

  const planFeatures = planAccess?.features || {};
  const canUseCustomerLoyaltyModules = !!planFeatures?.customer_loyalty_modules;

  const isCustomersRoute = currentKey === "customers";
  const shouldBlockCustomersRoute =
    isCustomersRoute &&
    !planAccessLoading &&
    planAccess &&
    !canUseCustomerLoyaltyModules;

  const showAlert = ({ severity = "info", title, message }) => {
    if (!message) return;

    const resolvedTitle =
      title ||
      (severity === "success"
        ? "Listo"
        : severity === "warning"
        ? "Ojo"
        : severity === "error"
        ? "Error"
        : "Aviso");

    setAlertState({
      open: true,
      severity,
      title: resolvedTitle,
      message,
    });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const pickErr = (e, fallback) =>
    e?.response?.data?.message || e?.message || fallback;

  const pickCode = (e) => e?.response?.data?.code;

  React.useEffect(() => {
    let mounted = true;

    const loadPlanAccess = async () => {
      setPlanAccessLoading(true);

      try {
        const data = await getStaffPlanAccess();

        if (!mounted) return;

        setPlanAccess(data || null);
      } catch (e) {
        if (!mounted) return;

        setPlanAccess(null);
      } finally {
        if (mounted) setPlanAccessLoading(false);
      }
    };

    loadPlanAccess();

    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    if (!shouldBlockCustomersRoute) return;

    nav("/staff/cashier/queue", { replace: true });
  }, [shouldBlockCustomersRoute, nav]);

  const handleNavigate = (key) => {
    switch (key) {
      case "dashboard":
        nav("/staff/cashier/queue");
        break;

      case "new-sale":
        nav("/staff/cashier/direct-order");
        break;

      case "history":
        nav("/staff/cashier/refunds");
        break;

      case "customers":
        if (planAccessLoading) {
          showAlert({
            severity: "info",
            title: "Cargando permisos",
            message: "Espera un momento mientras validamos tu plan.",
          });
          return;
        }

        if (!canUseCustomerLoyaltyModules) {
          showAlert({
            severity: "warning",
            title: "Módulo no disponible",
            message: "El historial de puntos solo está disponible en el Plan Total.",
          });
          nav("/staff/cashier/queue");
          return;
        }

        nav("/staff/cashier/customers");
        break;

      default:
        nav("/staff/cashier/queue");
        break;
    }
  };

  const handleCloseCashier = async () => {
    if (closing) return;

    setClosing(true);

    try {
      const queueRes = await fetchCashierSaleQueue();
      const mySales = Array.isArray(queueRes?.data?.my_sales)
        ? queueRes.data.my_sales
        : [];

      if (mySales.length > 0) {
        showAlert({
          severity: "warning",
          title: "Ventas tomadas",
          message:
            "Aún tienes ventas tomadas. Debes cobrarlas o liberarlas antes de cerrar la caja.",
        });
        return;
      }

      const res = await closeCashierSession({});

      showAlert({
        severity: "success",
        title: "Caja cerrada",
        message: res?.message || "Caja cerrada correctamente.",
      });

      nav("/staff/cashier", { replace: true });
    } catch (e) {
      const status = Number(e?.response?.status || 0);
      const code = pickCode(e);

      if (status === 401) {
        clearStaff?.();
        nav("/staff/login", { replace: true });
        return;
      }

      if (code === "CASH_SESSION_HAS_TAKEN_SALES") {
        showAlert({
          severity: "warning",
          title: "Ventas tomadas",
          message:
            e?.response?.data?.message ||
            "Aún tienes ventas tomadas. Debes cobrarlas o liberarlas antes de cerrar la caja.",
        });
        return;
      }

      if (code === "NO_OPEN_CASH_SESSION") {
        nav("/staff/cashier", { replace: true });
        return;
      }

      showAlert({
        severity: "error",
        title: "No se pudo cerrar",
        message: pickErr(e, "No se pudo cerrar la caja."),
      });
    } finally {
      setClosing(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        bgcolor: "background.default",
      }}
    >
      <CashierSidebar
        currentKey={currentKey}
        title="Caja"
        closing={closing}
        onNavigate={handleNavigate}
        onCloseCashier={handleCloseCashier}
        canUseCustomerLoyaltyModules={canUseCustomerLoyaltyModules}
      />

      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          bgcolor: "background.default",
        }}
      >
        {!shouldBlockCustomersRoute ? <Outlet /> : null}
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

function getCurrentKey(pathname) {
  if (pathname.includes("/staff/cashier/direct-order")) return "new-sale";
  if (pathname.includes("/staff/cashier/refunds")) return "history";
  if (pathname.includes("/staff/cashier/customers")) return "customers";
  return "dashboard";
}