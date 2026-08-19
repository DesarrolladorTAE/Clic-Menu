import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";

import PageContainer from "../../../../components/common/PageContainer";
import AppAlert from "../../../../components/common/AppAlert";
import { useStaffAuth } from "../../../../context/StaffAuthContext";
import echo from "../../../../realtime/echo";

import { fetchCashierOnlineOrderDetail } from "../../../../services/staff/casher/onlineOrders/cashierOnlineOrders.service";

import CashierOnlineOrderDetailView from "../../../../components/staff/casher/onlineOrders/CashierOnlineOrderDetailView";

export default function CashierOnlineOrderDetailPage() {
  const { onlineOrderId } = useParams();
  const nav = useNavigate();
  const location = useLocation();
  const { clearStaff } = useStaffAuth() || {};

  const id = Number(onlineOrderId || 0);

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "info",
    title: "",
    message: "",
  });

  const pollRef = useRef(null);
  const wsRefreshFastRef = useRef(null);
  const wsRefreshSlowRef = useRef(null);

  const showAlert = ({ severity = "info", title, message }) => {
    if (!message) return;

    const resolvedTitle =
      title ||
      (severity === "success"
        ? "Listo"
        : severity === "warning"
        ? "Aviso"
        : severity === "error"
        ? "Error"
        : "Información");

    setAlertState({ open: true, severity, title: resolvedTitle, message });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((previous) => ({ ...previous, open: false }));
  };

  const load = async ({ silent = false } = {}) => {
    if (!id) {
      nav("/staff/cashier/online-orders", { replace: true });
      return;
    }

    try {
      if (!silent) setLoading(true);

      const response = await fetchCashierOnlineOrderDetail(id);
      setOrder(response?.data || null);
    } catch (error) {
      const status = Number(error?.response?.status || 0);
      const code = error?.response?.data?.code;

      if (status === 401) {
        clearStaff?.();
        nav("/staff/login", { replace: true });
        return;
      }

      if (code === "NO_OPEN_CASH_SESSION") {
        nav("/staff/cashier", { replace: true });
        return;
      }

      if (code === "NO_ACTIVE_STAFF_CONTEXT") {
        nav("/staff/select-context", { replace: true });
        return;
      }

      if (status === 404 || code === "ONLINE_ORDER_NOT_FOUND") {
        showAlert({
          severity: "warning",
          message: "El pedido ya no está disponible.",
        });

        setTimeout(() => {
          nav("/staff/cashier/online-orders", { replace: true });
        }, 900);

        return;
      }

      if (!silent) {
        showAlert({
          severity: "error",
          message: friendlyError(error, "No se pudo cargar el pedido."),
        });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const branchId = Number(order?.meta?.branch_id || 0);

  useEffect(() => {
    load();

    pollRef.current = setInterval(() => {
      if (document.visibilityState === "visible") load({ silent: true });
    }, 8000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!branchId) return;

    const channelName = `branch.${branchId}.cashier`;

    const scheduleRefresh = () => {
      if (wsRefreshFastRef.current) clearTimeout(wsRefreshFastRef.current);
      if (wsRefreshSlowRef.current) clearTimeout(wsRefreshSlowRef.current);

      wsRefreshFastRef.current = setTimeout(() => {
        load({ silent: true });
      }, 120);

      wsRefreshSlowRef.current = setTimeout(() => {
        load({ silent: true });
      }, 900);
    };

    const handleCashierQueueUpdated = (payload = {}) => {
      const eventBranchId = Number(payload?.branch_id || 0);
      if (!eventBranchId || eventBranchId !== branchId) return;

      scheduleRefresh();
    };

    echo.private(channelName).listen(".cashier.queue.updated", handleCashierQueueUpdated);

    return () => {
      if (wsRefreshFastRef.current) {
        clearTimeout(wsRefreshFastRef.current);
        wsRefreshFastRef.current = null;
      }

      if (wsRefreshSlowRef.current) {
        clearTimeout(wsRefreshSlowRef.current);
        wsRefreshSlowRef.current = null;
      }

      echo.leaveChannel(channelName);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId, id]);

  const handleBack = () => {
    const fromTab = location.state?.fromTab === "mine" ? "mine" : "available";
    nav(`/staff/cashier/online-orders?tab=${fromTab}`);
  };

  if (loading) {
    return (
      <PageContainer>
        <Box sx={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
          <Stack spacing={2} alignItems="center">
            <CircularProgress />

            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
              Cargando pedido…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <CashierOnlineOrderDetailView
        order={order}
        onBack={handleBack}
      />

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={alertState.severity}
        title={alertState.title}
        message={alertState.message}
        autoHideDuration={3000}
      />
    </PageContainer>
  );
}

function friendlyError(error, fallback) {
  const message = String(error?.response?.data?.message || error?.message || fallback);

  return message
    .replaceAll("CashSession", "sesión de caja")
    .replaceAll("CashRegister", "caja")
    .replaceAll("OrderCheck", "cuenta")
    .replaceAll("BillingGroup", "grupo de cobro")
    .replaceAll("OnlineOrder", "pedido en línea")
    .replaceAll("Order", "pedido")
    .replaceAll("Sale", "venta");
}