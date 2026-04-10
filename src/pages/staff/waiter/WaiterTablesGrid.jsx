import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";

import PageContainer from "../../../components/common/PageContainer";
import AppAlert from "../../../components/common/AppAlert";
import PaginationFooter from "../../../components/common/PaginationFooter";
import usePagination from "../../../hooks/usePagination";

import { useStaffAuth } from "../../../context/StaffAuthContext";

import {
  fetchStaffTablesGrid,
  attendTable,
  finishAttention,
  releaseTableSession,
  markTablePaid,
  rejectTableCall,
  acceptCustomerOrder,
  rejectCustomerOrder,
  fetchWaiterReadyNotifications,
  markWaiterReadyNotificationRead,
  fetchWaiterBillRequests,
  markWaiterBillRequestRead,
  startWaiterOrderPayment,
} from "../../../services/staff/waiter/waiterTables.service";

import {
  occupyTable,
  freeTable,
  fetchStaffWaiterMenu,
} from "../../../services/staff/waiter/staffOrders.service";

import {
  fetchTableSessionRequests,
  approveTableSessionRequest,
  rejectTableSessionRequest,
} from "../../../services/staff/waiter/tableSessionRequests.service";

import echo from "../../../realtime/echo";

import WaiterTablesHeader from "../../../components/staff/waiter/WaiterTablesHeader";
import WaiterZoneTabs from "../../../components/staff/waiter/WaiterZoneTabs";
import WaiterTablesBoard from "../../../components/staff/waiter/WaiterTablesBoard";
import WaiterNoticesDrawer from "../../../components/staff/waiter/WaiterNoticesDrawer";
import WaiterWarehouseSelectionDialog from "../../../components/staff/waiter/WaiterWarehouseSelectionDialog";

const PAGE_SIZE = 8;

export default function WaiterTablesGrid() {
  const nav = useNavigate();
  const { clearStaff } = useStaffAuth() || {};

  const [busy, setBusy] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);

  const [requests, setRequests] = useState([]);
  const [reqBusyId, setReqBusyId] = useState(null);

  const [readyNotifications, setReadyNotifications] = useState([]);
  const [readyBusyId, setReadyBusyId] = useState(null);

  const [billRequests, setBillRequests] = useState([]);
  const [billBusyId, setBillBusyId] = useState(null);

  const [payingBusyOrderId, setPayingBusyOrderId] = useState(null);

  const [noticeOpen, setNoticeOpen] = useState(false);
  const [zoneTab, setZoneTab] = useState("all");

  const [warehouseDialog, setWarehouseDialog] = useState({
    open: false,
    loading: false,
    tableId: null,
    tableName: "",
    orderId: null,
    context: null,
    selectedWarehouseId: "",
  });

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "info",
    title: "",
    message: "",
  });

  const pollRef = useRef(null);
  const wsRefreshFastRef = useRef(null);
  const wsRefreshSlowRef = useRef(null);

  const showAlert = (message, severity = "info", title) => {
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
  const pickData = (e) => e?.response?.data?.data || null;

  const isContextConflict = (e) => {
    const status = Number(e?.response?.status || 0);
    const message = String(
      e?.response?.data?.message || e?.message || ""
    ).toLowerCase();

    if (status !== 409) return false;

    return (
      message.includes("no hay un turno activo") ||
      message.includes("selecciona sucursal") ||
      message.includes("sucursal sin configuración operativa")
    );
  };

  const openWarehouseDialog = ({ table, orderId, context }) => {
    const selectable = Array.isArray(context?.selectable_warehouses)
      ? context.selectable_warehouses
      : [];

    const preselected =
      context?.auto_selected_warehouse_id ||
      (selectable.length === 1 ? Number(selectable[0]?.id || 0) : "");

    setWarehouseDialog({
      open: true,
      loading: false,
      tableId: table?.id || null,
      tableName: table?.name || "",
      orderId: orderId || null,
      context: context || null,
      selectedWarehouseId: preselected || "",
    });
  };

  const closeWarehouseDialog = () => {
    setWarehouseDialog({
      open: false,
      loading: false,
      tableId: null,
      tableName: "",
      orderId: null,
      context: null,
      selectedWarehouseId: "",
    });
  };

  const load = async ({ silent = false } = {}) => {
    if (!silent) setBusy(true);
    else setRefreshing(true);

    try {
      const [resGrid, resReq, resReady, resBill] = await Promise.all([
        fetchStaffTablesGrid(),
        fetchTableSessionRequests().catch(() => null),
        fetchWaiterReadyNotifications().catch(() => null),
        fetchWaiterBillRequests().catch(() => null),
      ]);

      setData(resGrid || null);
      setRequests(Array.isArray(resReq?.data) ? resReq.data : []);
      setReadyNotifications(Array.isArray(resReady?.data) ? resReady.data : []);
      setBillRequests(Array.isArray(resBill?.data) ? resBill.data : []);
    } catch (e) {
      const st = e?.response?.status;

      if (st === 401) {
        clearStaff?.();
        nav("/staff/login", { replace: true });
        return;
      }

      if (isContextConflict(e)) {
        nav("/staff/select-context", { replace: true });
        return;
      }

      showAlert(pickErr(e, "No se pudieron cargar las mesas."), "error");
    } finally {
      setBusy(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const start = () => {
      if (pollRef.current) return;

      pollRef.current = setInterval(() => {
        if (document.visibilityState === "visible") {
          load({ silent: true });
        }
      }, 10000);
    };

    const stop = () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };

    start();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const meta = data?.meta || {};
  const tables = useMemo(
    () => (Array.isArray(data?.data) ? data.data : []),
    [data]
  );

  const summary = useMemo(() => {
    const counts = {
      free: 0,
      call: 0,
      mine: 0,
      locked: 0,
      blocked: 0,
      pending: 0,
    };

    for (const t of tables) {
      const s = String(t?.ui_state || "free");
      if (counts[s] !== undefined) counts[s]++;
    }

    return counts;
  }, [tables]);

  const zones = useMemo(() => {
    const map = new Map();

    tables.forEach((table) => {
      const zoneId = table?.zone_id ?? "no-zone";
      const zoneKey = String(zoneId);
      const zoneLabel =
        table?.zone_name ||
        table?.zone_label ||
        (table?.zone_id ? `Zona ${table.zone_id}` : "Sin zona");

      if (!map.has(zoneKey)) {
        map.set(zoneKey, {
          key: zoneKey,
          label: zoneLabel,
        });
      }
    });

    return [{ key: "all", label: "Todas" }, ...Array.from(map.values())];
  }, [tables]);

  useEffect(() => {
    if (!zones.some((z) => z.key === zoneTab)) {
      setZoneTab("all");
    }
  }, [zones, zoneTab]);

  const filteredTables = useMemo(() => {
    if (zoneTab === "all") return tables;
    return tables.filter((table) => String(table?.zone_id ?? "no-zone") === zoneTab);
  }, [tables, zoneTab]);

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
    items: filteredTables,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  const noticesCount =
    (Array.isArray(requests) ? requests.length : 0) +
    (Array.isArray(readyNotifications) ? readyNotifications.length : 0) +
    (Array.isArray(billRequests) ? billRequests.length : 0);

  useEffect(() => {
    const branchId = Number(meta?.branch_id || 0);
    const staffId = Number(meta?.staff_id || 0);

    if (!branchId) return;

    const channelName = `branch.${branchId}.tables`;

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

    const handleGridUpdated = (payload = {}) => {
      const eventBranchId = Number(payload?.branch_id || 0);
      if (!eventBranchId || eventBranchId !== branchId) return;

      scheduleRefresh();

      const targetStaffId = Number(payload?.target_staff_id || 0);
      const msg = String(payload?.message || "").trim();

      if (msg && (!targetStaffId || targetStaffId === staffId)) {
        showAlert(msg, "info");
      }
    };

    echo.private(channelName).listen(".table.grid.updated", handleGridUpdated);

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
  }, [meta?.branch_id, meta?.staff_id]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (wsRefreshFastRef.current) clearTimeout(wsRefreshFastRef.current);
      if (wsRefreshSlowRef.current) clearTimeout(wsRefreshSlowRef.current);
    };
  }, []);

  const doAttend = async (table) => {
    const id = table?.id;
    if (!id) return;

    try {
      await attendTable(id);
      showAlert(`Mesa ${table?.name || id}: llamada atendida.`, "success");
      await load({ silent: true });
    } catch (e) {
      const st = e?.response?.status;
      const code = pickCode(e);
      const msg = pickErr(e, "No se pudo atender la mesa.");

      if (
        st === 409 &&
        (code === "TAKEN" || String(msg).toLowerCase().includes("ya tomó"))
      ) {
        showAlert(
          `Te ganaron la mesa ${table?.name || id}. Otro mesero la atendió primero.`,
          "warning"
        );
        await load({ silent: true });
        return;
      }

      showAlert(msg, "error");
    }
  };

  const doRejectCall = async (table) => {
    const tableId = table?.id;
    if (!tableId) return;

    try {
      const res = await rejectTableCall(tableId);
      showAlert(res?.message || "Llamada rechazada.", "success");
      await load({ silent: true });
    } catch (e) {
      const st = e?.response?.status;
      const code = pickCode(e);
      const msg = pickErr(e, "No se pudo rechazar la llamada.");

      if (st === 403 && code === "NOT_YOURS") {
        showAlert("No puedes rechazar: esa mesa no es tuya.", "warning");
        await load({ silent: true });
        return;
      }

      showAlert(msg, "error");
    }
  };

  const doFinish = async (table) => {
    const id = table?.id;
    if (!id) return;

    try {
      const res = await finishAttention(id);
      const msg = res?.message
        ? String(res.message)
        : `Mesa ${table?.name || id}: atención finalizada.`;

      showAlert(msg, "success");
      await load({ silent: true });
    } catch (e) {
      const st = e?.response?.status;
      const code = pickCode(e);
      const msg = pickErr(e, "No se pudo finalizar la atención.");

      if (st === 403 && code === "NOT_YOURS") {
        showAlert("No puedes finalizar: esa mesa/llamada no es tuya.", "warning");
        await load({ silent: true });
        return;
      }

      showAlert(msg, "error");
    }
  };

  const doReleaseSession = async (table) => {
    const tableId = table?.id;
    if (!tableId) return;

    try {
      const res = await releaseTableSession(tableId);
      showAlert(res?.message || "Sesión liberada.", "success");
      await load({ silent: true });
    } catch (e) {
      showAlert(pickErr(e, "No se pudo liberar la sesión."), "error");
    }
  };

  const doMarkPaid = async (table) => {
    const tableId = table?.id;
    if (!tableId) return;

    try {
      const res = await markTablePaid(tableId);
      showAlert(
        res?.message || "Cuenta marcada como pagada. Mesa liberada.",
        "success"
      );
      await load({ silent: true });
    } catch (e) {
      const code = pickCode(e);
      const msg = pickErr(e, "No se pudo marcar como pagada.");

      if (code === "WAITER_MARK_PAID_DISABLED") {
        showAlert(
          "El cierre final del cobro ya no lo hace el mesero. Ahora debe realizarlo caja.",
          "warning"
        );
        await load({ silent: true });
        return;
      }

      showAlert(msg, "error");
    }
  };

  const doAccept = async (table) => {
    const pending = table?.pending_order || null;
    const orderId = pending?.id || null;

    if (!orderId) {
      showAlert("No hay comanda pendiente para aceptar.", "warning");
      return;
    }

    try {
      const res = await acceptCustomerOrder(orderId);

      if (res?.ok) {
        showAlert(res?.message || `Comanda #${orderId}: aceptada.`, "success");
        await load({ silent: true });
        return;
      }

      if (
        res?.code === "PREFERRED_WAREHOUSE_SELECTION_REQUIRED" &&
        res?.data?.ok
      ) {
        openWarehouseDialog({
          table,
          orderId,
          context: res.data,
        });
        return;
      }

      if (
        res?.code === "INVALID_SELECTED_WAREHOUSE" &&
        res?.data?.ok
      ) {
        openWarehouseDialog({
          table,
          orderId,
          context: res.data,
        });

        showAlert(
          "El almacén seleccionado ya no es válido. Elige otro para continuar.",
          "warning"
        );
        return;
      }

      showAlert(
        res?.message || "No se pudo aceptar la comanda.",
        "error"
      );
    } catch (e) {
      showAlert(pickErr(e, "No se pudo aceptar la comanda."), "error");
    }
  };

 const confirmAcceptWithWarehouse = async () => {
    const orderId = warehouseDialog?.orderId;
    const preferredWarehouseId = Number(
      warehouseDialog?.selectedWarehouseId || 0
    );

    if (!orderId || !preferredWarehouseId) {
      showAlert("Debes seleccionar un almacén preferido.", "warning");
      return;
    }

    setWarehouseDialog((prev) => ({
      ...prev,
      loading: true,
    }));

    try {
      const res = await acceptCustomerOrder(orderId, {
        preferred_warehouse_id: preferredWarehouseId,
      });

      if (res?.ok) {
        closeWarehouseDialog();
        showAlert(res?.message || `Comanda #${orderId}: aceptada.`, "success");
        await load({ silent: true });
        return;
      }

      if (
        (res?.code === "PREFERRED_WAREHOUSE_SELECTION_REQUIRED" ||
          res?.code === "INVALID_SELECTED_WAREHOUSE") &&
        res?.data?.ok
      ) {
        const selectable = Array.isArray(res?.data?.selectable_warehouses)
          ? res.data.selectable_warehouses
          : [];

        setWarehouseDialog((prev) => ({
          ...prev,
          loading: false,
          context: res.data,
          selectedWarehouseId:
            res?.data?.auto_selected_warehouse_id ||
            (selectable.length === 1
              ? Number(selectable[0]?.id || 0)
              : prev.selectedWarehouseId),
        }));

        showAlert(
          res?.message || "Debes seleccionar un almacén válido.",
          "warning"
        );
        return;
      }

      setWarehouseDialog((prev) => ({
        ...prev,
        loading: false,
      }));

      showAlert(
        res?.message || "No se pudo aceptar la comanda.",
        "error"
      );
    } catch (e) {
      setWarehouseDialog((prev) => ({
        ...prev,
        loading: false,
      }));

      showAlert(pickErr(e, "No se pudo aceptar la comanda."), "error");
    }
  };

  const doReject = async (table) => {
    const pending = table?.pending_order || null;
    const orderId = pending?.id || null;

    if (!orderId) {
      showAlert("No hay comanda pendiente para rechazar.", "warning");
      return;
    }

    try {
      await rejectCustomerOrder(orderId);
      showAlert(`Comanda #${orderId}: rechazada.`, "success");
      await load({ silent: true });
    } catch (e) {
      showAlert(pickErr(e, "No se pudo rechazar la comanda."), "error");
    }
  };

  const doApproveReq = async (reqId) => {
    if (!reqId) return;
    setReqBusyId(reqId);

    try {
      const res = await approveTableSessionRequest(reqId);
      showAlert(res?.message || "Dispositivo aprobado.", "success");
      await load({ silent: true });
    } catch (e) {
      showAlert(pickErr(e, "No se pudo aprobar la solicitud."), "error");
    } finally {
      setReqBusyId(null);
    }
  };

  const doRejectReq = async (reqId) => {
    if (!reqId) return;
    setReqBusyId(reqId);

    try {
      const res = await rejectTableSessionRequest(reqId);
      showAlert(res?.message || "Solicitud rechazada.", "success");
      await load({ silent: true });
    } catch (e) {
      showAlert(pickErr(e, "No se pudo rechazar la solicitud."), "error");
    } finally {
      setReqBusyId(null);
    }
  };

  const doReadReadyNotification = async (notificationId) => {
    if (!notificationId) return;
    setReadyBusyId(notificationId);

    try {
      const res = await markWaiterReadyNotificationRead(notificationId);
      showAlert(res?.message || "Aviso marcado como leído.", "success");
      await load({ silent: true });
    } catch (e) {
      showAlert(pickErr(e, "No se pudo marcar el aviso como leído."), "error");
    } finally {
      setReadyBusyId(null);
    }
  };

  const doReadBillRequest = async (billRequestId) => {
    if (!billRequestId) return;
    setBillBusyId(billRequestId);

    try {
      const res = await markWaiterBillRequestRead(billRequestId);
      showAlert(res?.message || "Aviso de cuenta marcado como leído.", "success");
      await load({ silent: true });
    } catch (e) {
      showAlert(
        pickErr(e, "No se pudo marcar el aviso de cuenta como leído."),
        "error"
      );
    } finally {
      setBillBusyId(null);
    }
  };

  const doStartPayment = async (orderId) => {
    if (!orderId) return;
    setPayingBusyOrderId(orderId);

    try {
      const res = await startWaiterOrderPayment(orderId);
      showAlert(
        res?.message || `Orden #${orderId}: enviada a caja correctamente.`,
        "success"
      );
      await load({ silent: true });
    } catch (e) {
      showAlert(pickErr(e, "No se pudo iniciar el cobro."), "error");
    } finally {
      setPayingBusyOrderId(null);
    }
  };

  const doOccupy = async (table) => {
    const tableId = table?.id;
    if (!tableId) return;

    try {
      const res = await occupyTable(tableId);
      showAlert(res?.message || "Mesa marcada como ocupada.", "success");
      await load({ silent: true });
    } catch (e) {
      const st = e?.response?.status;
      const code = pickCode(e);
      const msg = pickErr(e, "No se pudo marcar como ocupada.");

      if (st === 403 && code === "NOT_YOURS") {
        showAlert("No puedes ocupar: esa mesa no es tuya.", "warning");
        await load({ silent: true });
        return;
      }

      if (st === 409 && code === "TAKEN") {
        showAlert("Otro mesero ya tomó esta mesa.", "warning");
        await load({ silent: true });
        return;
      }

      showAlert(msg, "error");
    }
  };

  const doFree = async (table) => {
    const tableId = table?.id;
    if (!tableId) return;

    try {
      const res = await freeTable(tableId);
      showAlert(res?.message || "Mesa puesta como libre.", "success");
      await load({ silent: true });
    } catch (e) {
      const st = e?.response?.status;
      const code = pickCode(e);
      const msg = pickErr(e, "No se pudo liberar la mesa.");

      if (st === 403 && code === "NOT_YOURS") {
        showAlert("No puedes liberar: esa mesa no es tuya.", "warning");
        await load({ silent: true });
        return;
      }

      if (st === 409 && code === "HAS_ACTIVE_ORDER") {
        showAlert(
          "No se puede poner libre: hay comanda activa o pendiente.",
          "warning"
        );
        await load({ silent: true });
        return;
      }

      showAlert(msg, "error");
    }
  };

  const doCreateOrder = async (table) => {
    const tableId = table?.id;
    if (!tableId) return;

    try {
      const res = await fetchStaffWaiterMenu();
      const payload = res?.data || res?.payload || res || null;

      nav(`/staff/waiter/tables/${tableId}/order`, {
        state: {
          table: {
            id: tableId,
            name: table?.name || null,
            seats: table?.seats || null,
            ordering_mode: table?.ordering_mode || meta?.ordering_mode || null,
            table_service_mode:
              table?.table_service_mode || meta?.table_service_mode || null,
          },
          preloadedMenu: payload,
          intent: "create",
          existingOrderId: null,
        },
      });
    } catch (e) {
      showAlert(
        pickErr(e, "No se pudo abrir el menú para crear comanda."),
        "error"
      );
    }
  };

  const doViewOrder = async (table) => {
    const tableId = table?.id;
    const openOrderId = table?.active_order?.id || null;

    if (!tableId || !openOrderId) return;

    try {
      const res = await fetchStaffWaiterMenu();
      const payload = res?.data || res?.payload || res || null;

      nav(`/staff/waiter/tables/${tableId}/order`, {
        state: {
          table: {
            id: tableId,
            name: table?.name || null,
            seats: table?.seats || null,
            ordering_mode: table?.ordering_mode || meta?.ordering_mode || null,
            table_service_mode:
              table?.table_service_mode || meta?.table_service_mode || null,
          },
          preloadedMenu: payload,
          intent: "view",
          existingOrderId: openOrderId,
        },
      });
    } catch (e) {
      showAlert(
        pickErr(e, "No se pudo abrir el menú para ver la comanda."),
        "error"
      );
    }
  };

  if (busy) {
    return (
      <PageContainer>
        <Box
          sx={{
            minHeight: "70vh",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress />
            <Typography sx={{ mt: 2, color: "text.secondary", fontSize: 14 }}>
              Cargando tablero de mesas…
            </Typography>
          </Box>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth={1400}>
      <Box sx={{ display: "grid", gap: 3 }}>
        <WaiterTablesHeader
          meta={meta}
          summary={summary}
          refreshing={refreshing}
          onDashboard={() => nav("/staff/app")}
        />

        <WaiterZoneTabs
          tab={zoneTab}
          onChange={setZoneTab}
          zones={zones}
        />

        {filteredTables.length === 0 ? (
          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              backgroundColor: "background.paper",
              py: 8,
              px: 3,
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: 24,
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              No hay mesas en esta zona
            </Typography>

            <Typography
              sx={{
                mt: 1,
                color: "text.secondary",
                fontSize: 14,
              }}
            >
              Cuando existan mesas o cambies de zona, aparecerán aquí.
            </Typography>
          </Box>
        ) : (
          <>
            <WaiterTablesBoard
              tables={paginatedItems}
              meta={meta}
              payingBusyOrderId={payingBusyOrderId}
              onAttend={doAttend}
              onRejectCall={doRejectCall}
              onFinish={doFinish}
              onReleaseSession={doReleaseSession}
              onMarkPaid={doMarkPaid}
              onAccept={doAccept}
              onReject={doReject}
              onStartPayment={doStartPayment}
              onOccupy={doOccupy}
              onFree={doFree}
              onCreateOrder={doCreateOrder}
              onViewOrder={doViewOrder}
            />

            <PaginationFooter
              page={page}
              totalPages={totalPages}
              startItem={startItem}
              endItem={endItem}
              total={total}
              hasPrev={hasPrev}
              hasNext={hasNext}
              onPrev={prevPage}
              onNext={nextPage}
              itemLabel="mesas"
            />
          </>
        )}
      </Box>

      <WaiterNoticesDrawer
        open={noticeOpen}
        onOpen={() => setNoticeOpen(true)}
        onClose={() => setNoticeOpen(false)}
        count={noticesCount}
        requests={requests}
        reqBusyId={reqBusyId}
        readyNotifications={readyNotifications}
        readyBusyId={readyBusyId}
        billRequests={billRequests}
        billBusyId={billBusyId}
        payingBusyOrderId={payingBusyOrderId}
        onApproveReq={doApproveReq}
        onRejectReq={doRejectReq}
        onReadReadyNotification={doReadReadyNotification}
        onReadBillRequest={doReadBillRequest}
        floatingIcon={NotificationsNoneRoundedIcon}
      />

      <WaiterWarehouseSelectionDialog
        open={warehouseDialog.open}
        loading={warehouseDialog.loading}
        orderId={warehouseDialog.orderId}
        tableName={warehouseDialog.tableName}
        context={warehouseDialog.context}
        selectedWarehouseId={warehouseDialog.selectedWarehouseId}
        onChange={(value) =>
          setWarehouseDialog((prev) => ({
            ...prev,
            selectedWarehouseId: value,
          }))
        }
        onClose={closeWarehouseDialog}
        onConfirm={confirmAcceptWithWarehouse}
      />

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={alertState.severity}
        title={alertState.title}
        message={alertState.message}
        autoHideDuration={4200}
      />
    </PageContainer>
  );
}