import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";

import PageContainer from "../../../../components/common/PageContainer";
import AppAlert from "../../../../components/common/AppAlert";
import usePagination from "../../../../hooks/usePagination";
import { useStaffAuth } from "../../../../context/StaffAuthContext";
import echo from "../../../../realtime/echo";

import {
  acceptCashierOnlineOrder,
  cancelCashierOnlineOrder,
  confirmCashierOnlineOrderPreparation,
  deliverCashierOnlineOrder,
  fetchCashierOnlineOrderNewNotifications,
  fetchCashierOnlineOrders,
  markCashierOnlineOrderNewNotificationRead,
  markCashierOnlineOrderOutForDelivery,
  markCashierOnlineOrderArrivedAtDestination,
  markCashierOnlineOrderReady,
  rejectCashierOnlineOrder,
  releaseCashierOnlineOrder,
  startCashierOnlineOrderPreparation,
  takeCashierOnlineOrder,
} from "../../../../services/staff/casher/onlineOrders/cashierOnlineOrders.service";

import {
  fetchCashierReadyNotifications,
  markCashierReadyNotificationRead,
} from "../../../../services/staff/casher/cashierReadyNotifications.service";

import CashierOnlineOrdersHeroCard from "../../../../components/staff/casher/onlineOrders/CashierOnlineOrdersHeroCard";
import CashierOnlineOrdersTabs from "../../../../components/staff/casher/onlineOrders/CashierOnlineOrdersTabs";
import CashierOnlineOrdersPanel from "../../../../components/staff/casher/onlineOrders/CashierOnlineOrdersPanel";
import CashierOnlineOrderActionDialog from "../../../../components/staff/casher/onlineOrders/CashierOnlineOrderActionDialog";
import CashierReadyNotificationsDrawer from "../../../../components/staff/casher/queuePage/CashierReadyNotificationsDrawer";

const PAGE_SIZE = 5;
const DIALOG_ACTIONS = ["reject", "release", "deliver", "cancel"];

export default function CashierOnlineOrdersPage() {
  const nav = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { clearStaff } = useStaffAuth() || {};

  const initialTab = searchParams.get("tab") === "mine" ? "mine" : "available";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [tab, setTab] = useState(initialTab);

  const [busyOrderId, setBusyOrderId] = useState(null);
  const [busyAction, setBusyAction] = useState("");
  const [dialogAction, setDialogAction] = useState("");
  const [dialogOrder, setDialogOrder] = useState(null);

  const [readyNotifications, setReadyNotifications] = useState([]);
  const [readyBusyId, setReadyBusyId] = useState(null);
  const [onlineOrderNotifications, setOnlineOrderNotifications] = useState([]);
  const [onlineOrderBusyId, setOnlineOrderBusyId] = useState(null);
  const [noticesDrawerOpen, setNoticesDrawerOpen] = useState(false);

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

  const handleRequestError = (error, fallback) => {
    const status = Number(error?.response?.status || 0);
    const code = error?.response?.data?.code;

    if (status === 401) {
      clearStaff?.();
      nav("/staff/login", { replace: true });
      return true;
    }

    if (code === "NO_OPEN_CASH_SESSION") {
      nav("/staff/cashier", { replace: true });
      return true;
    }

    if (code === "NO_ACTIVE_STAFF_CONTEXT") {
      nav("/staff/select-context", { replace: true });
      return true;
    }

    showAlert({
      severity: [403, 409, 422].includes(status) ? "warning" : "error",
      message: friendlyError(error, fallback),
    });

    return false;
  };

  const load = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);

      const [ordersResponse, readyResponse, onlineOrderNotificationsResponse] = await Promise.all([
        fetchCashierOnlineOrders(),
        fetchCashierReadyNotifications().catch(() => null),
        fetchCashierOnlineOrderNewNotifications().catch(() => null),
      ]);

      setData(ordersResponse?.data || null);
      setReadyNotifications(Array.isArray(readyResponse?.data) ? readyResponse.data : []);
      setOnlineOrderNotifications(
        Array.isArray(onlineOrderNotificationsResponse?.data?.notifications)
          ? onlineOrderNotificationsResponse.data.notifications
          : []
      );
    } catch (error) {
      if (!silent) handleRequestError(error, "No se pudieron cargar los pedidos en línea.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const meta = data?.meta || {};
  const branchId = Number(meta?.branch_id || 0);

  useEffect(() => {
    load();

    pollRef.current = setInterval(() => {
      if (document.visibilityState === "visible" && !busyOrderId && !dialogAction) {
        load({ silent: true });
      }
    }, 8000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      const reason = String(payload?.reason || "").trim();
      const message = String(payload?.message || "").trim();

      if (reason === "online_order_new_notification_created" && message) {
        showAlert({ severity: "info", title: "Nuevo pedido en línea", message });
      }
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
  }, [branchId]);

  useEffect(() => {
    const requestedTab = searchParams.get("tab") === "mine" ? "mine" : "available";
    setTab((current) => (current === requestedTab ? current : requestedTab));
  }, [searchParams]);

  useEffect(() => {
    if (["available", "mine"].includes(searchParams.get("tab"))) return;

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", "available");
    setSearchParams(nextParams, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const availableOrders = useMemo(
    () => (Array.isArray(data?.available) ? data.available : []),
    [data]
  );

  const myOrders = useMemo(
    () => (Array.isArray(data?.mine) ? data.mine : []),
    [data]
  );

  const counts = data?.counts || {};
  const availableCount = Number(counts?.available ?? availableOrders.length);
  const myCount = Number(counts?.mine ?? myOrders.length);

  const myTotal = useMemo(
    () => myOrders.reduce((total, order) => total + Number(order?.total || 0), 0),
    [myOrders]
  );

  const activeOrders = tab === "mine" ? myOrders : availableOrders;

  const {
    page,
    total,
    totalPages,
    startItem,
    endItem,
    hasPrev,
    hasNext,
    nextPage,
    prevPage,
    paginatedItems,
  } = usePagination({
    items: activeOrders,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  const handleTabChange = (nextTab) => {
    const resolved = nextTab === "mine" ? "mine" : "available";
    setTab(resolved);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", resolved);
    setSearchParams(nextParams, { replace: true });
  };

  const handleReadReadyNotification = async (notificationId) => {
    if (!notificationId) return;

    setReadyBusyId(notificationId);

    try {
      const response = await markCashierReadyNotificationRead(notificationId);

      setReadyNotifications((current) =>
        current.filter((row) => Number(row?.id) !== Number(notificationId))
      );

      showAlert({
        severity: "success",
        message: response?.message || "Aviso de cocina marcado como leído.",
      });

      load({ silent: true });
    } catch (error) {
      handleRequestError(error, "No se pudo marcar el aviso de cocina como leído.");
      load({ silent: true });
    } finally {
      setReadyBusyId(null);
    }
  };

  const handleReadOnlineOrderNotification = async (notificationId) => {
    if (!notificationId) return;

    setOnlineOrderBusyId(notificationId);

    try {
      const response = await markCashierOnlineOrderNewNotificationRead(notificationId);

      setOnlineOrderNotifications((current) =>
        current.filter((row) => Number(row?.notification_id) !== Number(notificationId))
      );

      showAlert({
        severity: "success",
        message: response?.message || "Aviso de Pedido en línea marcado como leído.",
      });

      load({ silent: true });
    } catch (error) {
      handleRequestError(error, "No se pudo marcar el aviso del Pedido en línea como leído.");
      load({ silent: true });
    } finally {
      setOnlineOrderBusyId(null);
    }
  };

  const handleOpenDetail = (order) => {
    const onlineOrderId = Number(order?.id || 0);
    if (!onlineOrderId) return;

    nav(`/staff/cashier/online-orders/${onlineOrderId}`, {
      state: { fromTab: tab },
    });
  };

  const handleOpenPayment = (order) => {
    const onlineOrderId = Number(order?.id || 0);
    if (!onlineOrderId) return;

    nav(`/staff/cashier/online-orders/${onlineOrderId}/payment`, {
      state: { fromTab: "mine" },
    });
  };

  const handleOrderAction = (action, order) => {
    const onlineOrderId = Number(order?.id || 0);
    if (!onlineOrderId || busyOrderId) return;

    if (["prepare_payment", "pay"].includes(action)) {
      handleOpenPayment(order);
      return;
    }

    if (DIALOG_ACTIONS.includes(action)) {
      setDialogAction(action);
      setDialogOrder(order);
      return;
    }

    executeOrderAction(action, order);
  };

  const executeOrderAction = async (action, order, payload = {}) => {
    const onlineOrderId = Number(order?.id || 0);
    if (!onlineOrderId || busyOrderId) return;

    setBusyOrderId(onlineOrderId);
    setBusyAction(action);

    try {
      let response;

      switch (action) {
        case "accept":
          response = await acceptCashierOnlineOrder(onlineOrderId);
          break;

        case "reject":
          response = await rejectCashierOnlineOrder(onlineOrderId, payload.reason);
          break;
        
        case "cancel":
          response = await cancelCashierOnlineOrder(onlineOrderId, payload.reason);
          break;

        case "take":
          response = await takeCashierOnlineOrder(onlineOrderId);
          break;

        case "release":
          response = await releaseCashierOnlineOrder(onlineOrderId);
          break;

        case "confirm_preparation":
          response = await confirmCashierOnlineOrderPreparation(onlineOrderId);
          break;

        case "start_preparation":
          response = await startCashierOnlineOrderPreparation(onlineOrderId);
          break;

        case "mark_ready":
          response = await markCashierOnlineOrderReady(onlineOrderId);
          break;

        case "out_for_delivery":
          response = await markCashierOnlineOrderOutForDelivery(onlineOrderId);
          break;

        case "arrived_at_destination":
          response = await markCashierOnlineOrderArrivedAtDestination(onlineOrderId);
          break;

        case "deliver":
          response = await deliverCashierOnlineOrder(onlineOrderId);
          break;

        default:
          return;
      }

      setDialogAction("");
      setDialogOrder(null);

      showAlert({
        severity: "success",
        message: response?.message || "El pedido se actualizó correctamente.",
      });

      await load({ silent: true });
    } catch (error) {
      handleRequestError(error, "No se pudo completar la acción.");
      await load({ silent: true });
    } finally {
      setBusyOrderId(null);
      setBusyAction("");
    }
  };

  const handleDialogConfirm = async ({ reason } = {}) => {
    if (!dialogAction || !dialogOrder) return;
    await executeOrderAction(dialogAction, dialogOrder, { reason });
  };

  const handleDialogClose = () => {
    if (busyOrderId) return;

    setDialogAction("");
    setDialogOrder(null);
  };

  if (loading) {
    return (
      <PageContainer>
        <Box sx={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
          <Stack spacing={2} alignItems="center">
            <CircularProgress />

            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
              Cargando pedidos en línea…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <CashierOnlineOrdersHeroCard
          availableCount={availableCount}
          myCount={myCount}
          myTotal={myTotal}
        />

        <CashierOnlineOrdersTabs
          tab={tab}
          onChange={handleTabChange}
          availableCount={availableCount}
          myCount={myCount}
        />

        <CashierOnlineOrdersPanel
          mode={tab}
          orders={paginatedItems}
          busyOrderId={busyOrderId}
          busyAction={busyAction}
          page={page}
          totalPages={totalPages}
          startItem={startItem}
          endItem={endItem}
          total={total}
          hasPrev={hasPrev}
          hasNext={hasNext}
          onPrev={prevPage}
          onNext={nextPage}
          onOpenDetail={handleOpenDetail}
          onAction={handleOrderAction}
        />
      </Stack>
 
      <CashierOnlineOrderActionDialog
        open={Boolean(dialogAction && dialogOrder)}
        action={dialogAction}
        order={dialogOrder}
        submitting={Boolean(dialogOrder) && Number(busyOrderId || 0) === Number(dialogOrder?.id || 0) && busyAction === dialogAction}
        onClose={handleDialogClose}
        onConfirm={handleDialogConfirm}
      />

      <CashierReadyNotificationsDrawer
        open={noticesDrawerOpen}
        onOpen={() => setNoticesDrawerOpen(true)}
        onClose={() => setNoticesDrawerOpen(false)}
        notifications={readyNotifications}
        busyId={readyBusyId}
        onReadNotification={handleReadReadyNotification}
        onlineOrderNotifications={onlineOrderNotifications}
        onlineOrderBusyId={onlineOrderBusyId}
        onReadOnlineOrderNotification={handleReadOnlineOrderNotification}
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
    .replaceAll("OnlineOrder", "pedido en línea")
    .replaceAll("Order", "pedido")
    .replaceAll("Sale", "venta");
}