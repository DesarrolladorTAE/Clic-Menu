import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

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

// -------------------------
// UI helpers
// -------------------------
function money(n) {
  const num = Number(n || 0);
  try {
    return num.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
  } catch {
    return `$${num.toFixed(2)}`;
  }
}

function pillMini(bg, bd) {
  return {
    background: bg,
    border: `1px solid ${bd}`,
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  };
}

function Toast({ open, message, type = "info", onClose }) {
  if (!open) return null;

  const bg =
    type === "success"
      ? "#e6ffed"
      : type === "warning"
      ? "#fff3cd"
      : type === "error"
      ? "#ffe5e5"
      : "#eef2ff";

  const border =
    type === "success"
      ? "#8ae99c"
      : type === "warning"
      ? "#ffe08a"
      : type === "error"
      ? "#ffb3b3"
      : "#cfcfff";

  const color =
    type === "success"
      ? "#0a7a2f"
      : type === "warning"
      ? "#8a6d3b"
      : type === "error"
      ? "#a10000"
      : "#2d2d7a";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 99999,
        maxWidth: 460,
        background: bg,
        border: `1px solid ${border}`,
        color,
        borderRadius: 12,
        padding: "12px 14px",
        boxShadow: "0 12px 24px rgba(0,0,0,0.18)",
        cursor: "pointer",
        whiteSpace: "pre-line",
      }}
      title="Clic para cerrar"
    >
      <div style={{ fontWeight: 950, marginBottom: 6 }}>
        {type === "warning"
          ? "Ojo"
          : type === "error"
          ? "Error"
          : type === "success"
          ? "Listo"
          : "Aviso"}
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.35 }}>{message}</div>
      <div style={{ marginTop: 8, fontSize: 11, opacity: 0.75 }}>
        (clic para cerrar)
      </div>
    </div>
  );
}

function PillButton({ children, onClick, disabled, tone = "default", title }) {
  const map = {
    default: { bg: "#fff", bd: "rgba(0,0,0,0.12)", fg: "#111" },
    soft: { bg: "#eef2ff", bd: "#cfcfff", fg: "#111" },
    dark: { bg: "#111827", bd: "#1f2937", fg: "#fff" },
    ok: { bg: "#e6ffed", bd: "#8ae99c", fg: "#0a7a2f" },
    warn: { bg: "#fff3cd", bd: "#ffe08a", fg: "#8a6d3b" },
    danger: { bg: "#ffe5e5", bd: "#ffb3b3", fg: "#a10000" },
    orange: { bg: "#ff7a00", bd: "#ff7a00", fg: "#fff" },
    blue: { bg: "#2563eb", bd: "#2563eb", fg: "#fff" },
  };

  const c = map[tone] || map.default;

  return (
    <button
      onClick={onClick}
      disabled={!!disabled}
      title={title}
      style={{
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        borderRadius: 12,
        border: `1px solid ${c.bd}`,
        background: c.bg,
        color: c.fg,
        padding: "10px 12px",
        fontWeight: 950,
        height: 40,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      {children}
    </button>
  );
}

function stateVisual(uiState) {
  const map = {
    free: { bg: "#e6ffed", bd: "#8ae99c", fg: "#0a7a2f", label: "Libre" },
    call: { bg: "#fff3cd", bd: "#ffe08a", fg: "#8a6d3b", label: "Llamando" },
    mine: {
      bg: "#e8f1ff",
      bd: "#95b9ff",
      fg: "#0b4db3",
      label: "Atendiendo",
    },
    locked: { bg: "#f3f4f6", bd: "#d1d5db", fg: "#374151", label: "Ocupada" },
    blocked: {
      bg: "#efeff3",
      bd: "#c7c7d0",
      fg: "#4b5563",
      label: "Bloqueada",
    },
    pending: {
      bg: "#fff3cd",
      bd: "#ffe08a",
      fg: "#8a6d3b",
      label: "Comanda pendiente",
    },
  };
  return map[uiState] || map.free;
}

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

  const [billOrderIds, setBillOrderIds] = useState([]);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "info",
  });

  const pollRef = useRef(null);
  const toastTimerRef = useRef(null);
  const wsRefreshTimerRef = useRef(null);

  const showToast = (message, type = "info") => {
    if (!message) return;
    setToast({ open: true, message, type });

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = setTimeout(() => {
      setToast((t) => ({ ...t, open: false }));
    }, 4500);
  };

  const closeToast = () => setToast((t) => ({ ...t, open: false }));

  const pickErr = (e, fallback) =>
    e?.response?.data?.message || e?.message || fallback;

  const pickCode = (e) => e?.response?.data?.code;

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

      if (st === 409) {
        nav("/staff/select-branch", { replace: true });
        return;
      }

      if (st === 401) {
        clearStaff?.();
        nav("/staff/login", { replace: true });
        return;
      }

      showToast(pickErr(e, "No se pudieron cargar las mesas."), "error");
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
    [data],
  );

  useEffect(() => {
    const activeOrderIds = (tables || [])
      .map((t) => Number(t?.active_order?.id || 0))
      .filter(Boolean);

    const unreadBillOrderIds = (billRequests || [])
      .map((n) => Number(n?.order_id || 0))
      .filter(Boolean);

    setBillOrderIds((prev) => {
      const keepPrev = (prev || []).filter((id) => activeOrderIds.includes(id));
      const merged = [...keepPrev, ...unreadBillOrderIds];
      return Array.from(new Set(merged));
    });
  }, [tables, billRequests]);

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

  useEffect(() => {
    const branchId = Number(meta?.branch_id || 0);
    const staffId = Number(meta?.staff_id || 0);

    if (!branchId) return;

    const channelName = `branch.${branchId}.tables`;

    const scheduleRefresh = () => {
      if (wsRefreshTimerRef.current) {
        clearTimeout(wsRefreshTimerRef.current);
      }

      wsRefreshTimerRef.current = setTimeout(() => {
        load({ silent: true });
      }, 180);
    };

    const handleGridUpdated = (payload = {}) => {
      const eventBranchId = Number(payload?.branch_id || 0);
      if (!eventBranchId || eventBranchId !== branchId) return;

      scheduleRefresh();

      const targetStaffId = Number(payload?.target_staff_id || 0);
      const msg = String(payload?.message || "").trim();

      if (msg && (!targetStaffId || targetStaffId === staffId)) {
        showToast(msg, "info");
      }
    };

    echo.channel(channelName).listen(".table.grid.updated", handleGridUpdated);

    return () => {
      if (wsRefreshTimerRef.current) {
        clearTimeout(wsRefreshTimerRef.current);
        wsRefreshTimerRef.current = null;
      }

      echo.leaveChannel(channelName);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta?.branch_id, meta?.staff_id]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      if (wsRefreshTimerRef.current) {
        clearTimeout(wsRefreshTimerRef.current);
      }
    };
  }, []);

  const doAttend = async (table) => {
    const id = table?.id;
    if (!id) return;

    try {
      await attendTable(id);
      showToast(`Mesa ${table?.name || id}: llamada atendida.`, "success");
      await load({ silent: true });
    } catch (e) {
      const st = e?.response?.status;
      const code = pickCode(e);
      const msg = pickErr(e, "No se pudo atender la mesa.");

      if (
        st === 409 &&
        (code === "TAKEN" || String(msg).toLowerCase().includes("ya tomó"))
      ) {
        showToast(
          `Te ganaron la mesa ${table?.name || id}. Otro mesero la atendió primero.`,
          "warning",
        );
        await load({ silent: true });
        return;
      }

      showToast(msg, "error");
    }
  };

  const doRejectCall = async (table) => {
    const tableId = table?.id;
    if (!tableId) return;

    try {
      const res = await rejectTableCall(tableId);
      showToast(res?.message || "Llamada rechazada.", "success");
      await load({ silent: true });
    } catch (e) {
      const st = e?.response?.status;
      const code = pickCode(e);
      const msg = pickErr(e, "No se pudo rechazar la llamada.");

      if (st === 403 && code === "NOT_YOURS") {
        showToast("No puedes rechazar: esa mesa no es tuya.", "warning");
        await load({ silent: true });
        return;
      }

      showToast(msg, "error");
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
      showToast(msg, "success");
      await load({ silent: true });
    } catch (e) {
      const st = e?.response?.status;
      const code = pickCode(e);
      const msg = pickErr(e, "No se pudo finalizar la atención.");

      if (st === 403 && code === "NOT_YOURS") {
        showToast("No puedes finalizar: esa mesa/llamada no es tuya.", "warning");
        await load({ silent: true });
        return;
      }

      showToast(msg, "error");
    }
  };

  const doReleaseSession = async (table) => {
    const tableId = table?.id;
    if (!tableId) return;

    try {
      const res = await releaseTableSession(tableId);
      showToast(res?.message || "Sesión liberada.", "success");
      await load({ silent: true });
    } catch (e) {
      showToast(pickErr(e, "No se pudo liberar la sesión."), "error");
    }
  };

  const doMarkPaid = async (table) => {
    const tableId = table?.id;
    if (!tableId) return;

    try {
      const res = await markTablePaid(tableId);
      showToast(
        res?.message || "Cuenta marcada como pagada. Mesa liberada.",
        "success",
      );
      await load({ silent: true });
    } catch (e) {
      showToast(pickErr(e, "No se pudo marcar como pagada."), "error");
    }
  };

  const doAccept = async (table) => {
    const pending = table?.pending_order || null;
    const orderId = pending?.id || null;

    if (!orderId) {
      showToast("No hay comanda pendiente para aceptar.", "warning");
      return;
    }

    if (typeof acceptCustomerOrder !== "function") {
      showToast(
        "acceptCustomerOrder no está disponible en waiterTables.service.js",
        "error",
      );
      return;
    }

    try {
      await acceptCustomerOrder(orderId);
      showToast(`Comanda #${orderId}: aceptada.`, "success");
      await load({ silent: true });
    } catch (e) {
      showToast(pickErr(e, "No se pudo aceptar la comanda."), "error");
    }
  };

  const doReject = async (table) => {
    const pending = table?.pending_order || null;
    const orderId = pending?.id || null;

    if (!orderId) {
      showToast("No hay comanda pendiente para rechazar.", "warning");
      return;
    }

    if (typeof rejectCustomerOrder !== "function") {
      showToast(
        "rejectCustomerOrder no está disponible en waiterTables.service.js",
        "error",
      );
      return;
    }

    try {
      await rejectCustomerOrder(orderId);
      showToast(`Comanda #${orderId}: rechazada.`, "success");
      await load({ silent: true });
    } catch (e) {
      showToast(pickErr(e, "No se pudo rechazar la comanda."), "error");
    }
  };

  const doApproveReq = async (reqId) => {
    if (!reqId) return;
    setReqBusyId(reqId);
    try {
      const res = await approveTableSessionRequest(reqId);
      showToast(res?.message || "Dispositivo aprobado.", "success");
      await load({ silent: true });
    } catch (e) {
      showToast(pickErr(e, "No se pudo aprobar la solicitud."), "error");
    } finally {
      setReqBusyId(null);
    }
  };

  const doRejectReq = async (reqId) => {
    if (!reqId) return;
    setReqBusyId(reqId);
    try {
      const res = await rejectTableSessionRequest(reqId);
      showToast(res?.message || "Solicitud rechazada.", "success");
      await load({ silent: true });
    } catch (e) {
      showToast(pickErr(e, "No se pudo rechazar la solicitud."), "error");
    } finally {
      setReqBusyId(null);
    }
  };

  const doReadReadyNotification = async (notificationId) => {
    if (!notificationId) return;
    setReadyBusyId(notificationId);
    try {
      const res = await markWaiterReadyNotificationRead(notificationId);
      showToast(res?.message || "Aviso marcado como leído.", "success");
      await load({ silent: true });
    } catch (e) {
      showToast(pickErr(e, "No se pudo marcar el aviso como leído."), "error");
    } finally {
      setReadyBusyId(null);
    }
  };

  const doReadBillRequest = async (billRequestId) => {
    if (!billRequestId) return;
    setBillBusyId(billRequestId);
    try {
      const res = await markWaiterBillRequestRead(billRequestId);
      showToast(res?.message || "Aviso de cuenta marcado como leído.", "success");
      await load({ silent: true });
    } catch (e) {
      showToast(
        pickErr(e, "No se pudo marcar el aviso de cuenta como leído."),
        "error",
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
      showToast(
        res?.message || `Orden #${orderId}: se inició el proceso de cobro.`,
        "success",
      );

      setBillOrderIds((prev) =>
        (prev || []).filter((id) => Number(id) !== Number(orderId)),
      );

      await load({ silent: true });
    } catch (e) {
      showToast(pickErr(e, "No se pudo iniciar el cobro."), "error");
    } finally {
      setPayingBusyOrderId(null);
    }
  };

  const doOccupy = async (table) => {
    const tableId = table?.id;
    if (!tableId) return;

    try {
      const res = await occupyTable(tableId);
      showToast(res?.message || "Mesa marcada como ocupada.", "success");
      await load({ silent: true });
    } catch (e) {
      const st = e?.response?.status;
      const code = pickCode(e);
      const msg = pickErr(e, "No se pudo marcar como ocupada.");

      if (st === 403 && code === "NOT_YOURS") {
        showToast("No puedes ocupar: esa mesa no es tuya.", "warning");
        await load({ silent: true });
        return;
      }
      if (st === 409 && code === "TAKEN") {
        showToast("Otro mesero ya tomó esta mesa.", "warning");
        await load({ silent: true });
        return;
      }

      showToast(msg, "error");
    }
  };

  const doFree = async (table) => {
    const tableId = table?.id;
    if (!tableId) return;

    try {
      const res = await freeTable(tableId);
      showToast(res?.message || "Mesa puesta como libre.", "success");
      await load({ silent: true });
    } catch (e) {
      const st = e?.response?.status;
      const code = pickCode(e);
      const msg = pickErr(e, "No se pudo liberar la mesa.");

      if (st === 403 && code === "NOT_YOURS") {
        showToast("No puedes liberar: esa mesa no es tuya.", "warning");
        await load({ silent: true });
        return;
      }
      if (st === 409 && code === "HAS_ACTIVE_ORDER") {
        showToast(
          "No se puede poner libre: hay comanda activa o pendiente.",
          "warning",
        );
        await load({ silent: true });
        return;
      }

      showToast(msg, "error");
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
      showToast(
        pickErr(e, "No se pudo abrir el menú para crear comanda."),
        "error",
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
      showToast(
        pickErr(e, "No se pudo abrir el menú para ver la comanda."),
        "error",
      );
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "22px auto", padding: 16 }}>
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
      />

      <div
        style={{
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 18,
          background: "#fff",
          padding: 14,
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "grid", gap: 6 }}>
            <div style={{ fontSize: 18, fontWeight: 950 }}>Mesas (Mesero)</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>
              Sucursal: <strong>{meta?.branch_id ?? "—"}</strong> · Staff:{" "}
              <strong>{meta?.staff_id ?? "—"}</strong> · Servicio:{" "}
              <strong>{meta?.table_service_mode ?? "—"}</strong> · Modo pedido:{" "}
              <strong>{meta?.ordering_mode ?? "—"}</strong>
              {refreshing ? (
                <span style={{ marginLeft: 10, opacity: 0.75 }}>
                  🔄 actualizando…
                </span>
              ) : null}
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginTop: 6,
              }}
            >
              <span style={{ ...pillMini("#e6ffed", "#8ae99c") }}>
                Libre: {summary.free}
              </span>
              <span style={{ ...pillMini("#fff3cd", "#ffe08a") }}>
                Llamando: {summary.call}
              </span>
              <span style={{ ...pillMini("#e8f1ff", "#95b9ff") }}>
                Atendiendo: {summary.mine}
              </span>
              <span style={{ ...pillMini("#f3f4f6", "#d1d5db") }}>
                Ocupada: {summary.locked}
              </span>
              <span style={{ ...pillMini("#efeff3", "#c7c7d0") }}>
                Bloqueada: {summary.blocked}
              </span>
              <span style={{ ...pillMini("#fff3cd", "#ffe08a") }}>
                Pendiente: {summary.pending}
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "start",
            }}
          >
            <PillButton
              tone="soft"
              onClick={() => load()}
              disabled={busy}
              title="Recargar"
            >
              🔄 Recargar
            </PillButton>

            <PillButton
              tone="default"
              onClick={() => nav("/staff/app")}
              title="Regresar al dashboard"
            >
              ← Dashboard
            </PillButton>
          </div>
        </div>
      </div>

      {Array.isArray(billRequests) && billRequests.length > 0 ? (
        <div
          style={{
            marginTop: 12,
            border: "1px solid rgba(0,0,0,0.12)",
            borderRadius: 18,
            background: "#fff",
            padding: 14,
            boxShadow: "0 10px 26px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ fontWeight: 950, marginBottom: 10 }}>
            Avisos de cuenta
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {billRequests.map((n) => (
              <div
                key={n.id}
                style={{
                  border: "1px solid rgba(0,0,0,0.10)",
                  borderRadius: 16,
                  padding: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                  alignItems: "center",
                  background: "#f8fafc",
                }}
              >
                <div style={{ display: "grid", gap: 4 }}>
                  <div style={{ fontWeight: 950 }}>
                    {n.title || "Pidió cuenta"}
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.9 }}>
                    {n.message || `Orden #${n.order_id} pidió cuenta`}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>
                    Mesa: <strong>{n.table_id ?? "—"}</strong> · Orden:{" "}
                    <strong>#{n.order_id ?? "—"}</strong> · Solicitado por:{" "}
                    <strong>{n.requested_by || "customer"}</strong>
                    {n.notified_at ? (
                      <>
                        {" "}· Avisado: <strong>{n.notified_at}</strong>
                      </>
                    ) : null}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <PillButton
                    tone="ok"
                    disabled={
                      billBusyId === n.id || payingBusyOrderId === n.order_id
                    }
                    onClick={() => doReadBillRequest(n.id)}
                    title="Marcar aviso de cuenta como leído"
                  >
                    {billBusyId === n.id ? "Marcando…" : "Leído"}
                  </PillButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {Array.isArray(readyNotifications) && readyNotifications.length > 0 ? (
        <div
          style={{
            marginTop: 12,
            border: "1px solid rgba(0,0,0,0.12)",
            borderRadius: 18,
            background: "#fff",
            padding: 14,
            boxShadow: "0 10px 26px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ fontWeight: 950, marginBottom: 10 }}>
            Avisos de cocina
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {readyNotifications.map((n) => (
              <div
                key={n.id}
                style={{
                  border: "1px solid rgba(0,0,0,0.10)",
                  borderRadius: 16,
                  padding: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                  alignItems: "center",
                  background: "#f8fafc",
                }}
              >
                <div style={{ display: "grid", gap: 4 }}>
                  <div style={{ fontWeight: 950 }}>
                    {n.title || "Pedido listo"}
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.9 }}>
                    {n.message || `Pedido #${n.order_id} listo`}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>
                    Mesa: <strong>{n.table_id ?? "—"}</strong> · Orden:{" "}
                    <strong>#{n.order_id ?? "—"}</strong>
                    {n.notified_at ? (
                      <>
                        {" "}· Avisado: <strong>{n.notified_at}</strong>
                      </>
                    ) : null}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <PillButton
                    tone="ok"
                    disabled={readyBusyId === n.id}
                    onClick={() => doReadReadyNotification(n.id)}
                    title="Marcar aviso como leído"
                  >
                    {readyBusyId === n.id ? "Marcando…" : "Leído"}
                  </PillButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {Array.isArray(requests) && requests.length > 0 ? (
        <div
          style={{
            marginTop: 12,
            border: "1px solid rgba(0,0,0,0.12)",
            borderRadius: 18,
            background: "#fff",
            padding: 14,
            boxShadow: "0 10px 26px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ fontWeight: 950, marginBottom: 10 }}>
            Solicitudes para retomar cuenta
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {requests.map((r) => (
              <div
                key={r.id}
                style={{
                  border: "1px solid rgba(0,0,0,0.10)",
                  borderRadius: 16,
                  padding: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                  alignItems: "center",
                  background: "#f8fafc",
                }}
              >
                <div style={{ display: "grid", gap: 4 }}>
                  <div style={{ fontWeight: 950 }}>
                    Mesa: {r.table_name || `#${r.table_id}`} · Orden #{r.order_id}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>
                    Dispositivo: <strong>{r.device_identifier}</strong>
                    {r.expires_at ? (
                      <>
                        {" "}· Expira: <strong>{r.expires_at}</strong>
                      </>
                    ) : null}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <PillButton
                    tone="ok"
                    disabled={reqBusyId === r.id}
                    onClick={() => doApproveReq(r.id)}
                    title="Aprobar dispositivo"
                  >
                    Aprobar
                  </PillButton>

                  <PillButton
                    tone="danger"
                    disabled={reqBusyId === r.id}
                    onClick={() => doRejectReq(r.id)}
                    title="Rechazar solicitud"
                  >
                    Rechazar
                  </PillButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {busy ? (
        <div
          style={{
            marginTop: 14,
            padding: 12,
            border: "1px solid rgba(0,0,0,0.12)",
            borderRadius: 14,
            background: "#fff",
          }}
        >
          Cargando mesas…
        </div>
      ) : tables.length === 0 ? (
        <div
          style={{
            marginTop: 14,
            padding: 12,
            border: "1px solid rgba(0,0,0,0.12)",
            borderRadius: 14,
            background: "#fff",
          }}
        >
          No hay mesas para mostrar.
        </div>
      ) : (
        <>
          <style>
            {`
              .tablesGrid {
                display: grid;
                gap: 12px;
                grid-template-columns: repeat(2, minmax(0, 1fr));
              }
              @media (min-width: 720px) { .tablesGrid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
              @media (min-width: 980px) { .tablesGrid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
            `}
          </style>

          <div className="tablesGrid" style={{ marginTop: 14 }}>
            {tables.map((t) => {
              const uiState = String(t?.ui_state || "free");
              const v = stateVisual(uiState);

              const pending = t?.pending_order || null;
              const hasPending = !!pending?.id;

              const openOrder = t?.active_order || null;
              const hasOpenOrder = !!openOrder?.id;
              const openOrderId = Number(openOrder?.id || 0);
              const orderStatus = String(openOrder?.status || "");

              const session = t?.session || null;
              const hasDevice = !!session?.has_device;

              const orderingMode = String(
                t?.ordering_mode || meta?.ordering_mode || "",
              );

              const canAttend = !!t?.actions?.can_attend;
              const canFinish = !!t?.actions?.can_finish_attention;
              const canRejectCall = !!t?.actions?.can_reject_call;

              const canAccept = !!t?.actions?.can_accept_order && hasPending;
              const canReject = !!t?.actions?.can_reject_order && hasPending;

              const canMarkPaid = !!t?.actions?.can_mark_paid && hasOpenOrder;

              const canMarkOccupied = !!t?.actions?.can_mark_occupied;
              const canMarkFree = !!t?.actions?.can_mark_free;
              const canCreateOrder =
                !!t?.actions?.can_create_order && !hasOpenOrder;
              const canViewOrder =
                !!t?.actions?.can_view_order && hasOpenOrder;

              const showWaiterOnlyActions =
                orderingMode === "waiter_only" || orderingMode === "waiter";

              const isCalling = uiState === "call";
              const isMine = !!t?.is_mine || uiState === "mine";
              const isLockedLike = uiState === "locked" || uiState === "blocked";

              const belongsToMe =
                !!t?.is_mine ||
                (Number(t?.assigned_waiter_id || 0) > 0 &&
                  Number(t?.assigned_waiter_id || 0) ===
                    Number(meta?.staff_id || 0));

              const isUnassignedTable = Number(t?.assigned_waiter_id || 0) === 0;

              const shouldShowOrderSummary = belongsToMe && hasOpenOrder;

              const showReleaseSession =
                belongsToMe &&
                !!t?.actions?.can_release_session &&
                hasOpenOrder;

              const showChargeButton =
                belongsToMe &&
                hasOpenOrder &&
                (orderStatus === "open" || orderStatus === "ready");

              const canChargeFromTable =
                belongsToMe &&
                !!t?.actions?.can_start_payment &&
                (orderStatus === "open" || orderStatus === "ready");

              // IMPORTANTE:
              // - llamada abierta sin dueño => todos pueden atender
              // - llamada/orden con dueño ajeno => nadie más ve botones
              const safeCanAttend =
                isCalling &&
                canAttend &&
                (belongsToMe || isUnassignedTable);

              const safeCanRejectCall =
                isCalling &&
                canRejectCall &&
                belongsToMe;

              const safeCanFinish =
                belongsToMe &&
                isMine &&
                canFinish;

              const safeCanMarkPaid =
                belongsToMe &&
                canMarkPaid;

              const safeCanAccept =
                canAccept &&
                !isLockedLike;

              const safeCanReject =
                canReject &&
                !isLockedLike &&
                (belongsToMe || isUnassignedTable);

              return (
                <div
                  key={t.id}
                  style={{
                    border: `1px solid ${v.bd}`,
                    background: v.bg,
                    borderRadius: 18,
                    padding: 12,
                    boxShadow: "0 10px 26px rgba(0,0,0,0.06)",
                    display: "grid",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <div style={{ display: "grid", gap: 2 }}>
                      <div style={{ fontSize: 16, fontWeight: 950, color: v.fg }}>
                        {t?.name || `Mesa #${t?.id}`}
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.85 }}>
                        {v.label}
                        {t?.ui_reason ? (
                          <span style={{ opacity: 0.8 }}> · {t.ui_reason}</span>
                        ) : null}
                      </div>
                    </div>

                    <div style={{ display: "grid", justifyItems: "end", gap: 2 }}>
                      <div style={{ fontSize: 12, opacity: 0.85 }}>
                        Asientos: <strong>{t?.seats ?? "—"}</strong>
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.85 }}>
                        QR:{" "}
                        <strong>
                          {t?.session
                            ? hasDevice
                              ? "Con sesión"
                              : "Sin dispositivo"
                            : "—"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {shouldShowOrderSummary ? (
                    <div
                      style={{
                        background: "rgba(255,255,255,0.65)",
                        border: "1px solid rgba(0,0,0,0.08)",
                        borderRadius: 14,
                        padding: 10,
                        display: "grid",
                        gap: 6,
                      }}
                    >
                      <div style={{ fontWeight: 950 }}>
                        Comanda activa #{openOrder.id}
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.85 }}>
                        Total: <strong>{money(openOrder.total)}</strong>
                      </div>
                    </div>
                  ) : null}

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {safeCanAttend ? (
                      <PillButton
                        tone="ok"
                        onClick={() => doAttend(t)}
                        title="Atender llamada"
                      >
                        Atender
                      </PillButton>
                    ) : null}

                    {safeCanRejectCall ? (
                      <PillButton
                        tone="danger"
                        onClick={() => doRejectCall(t)}
                        title="Rechazar llamada"
                      >
                        Rechazar
                      </PillButton>
                    ) : null}

                    {safeCanFinish ? (
                      <PillButton
                        tone="soft"
                        onClick={() => doFinish(t)}
                        title="Finalizar atención"
                      >
                        Finalizar
                      </PillButton>
                    ) : null}

                    {showWaiterOnlyActions && canMarkOccupied ? (
                      <PillButton
                        tone="blue"
                        onClick={() => doOccupy(t)}
                        title="Marcar mesa como ocupada"
                      >
                        Ocupar
                      </PillButton>
                    ) : null}

                    {showWaiterOnlyActions && canMarkFree ? (
                      <PillButton
                        tone="default"
                        onClick={() => doFree(t)}
                        title="Poner mesa como libre"
                      >
                        Liberar
                      </PillButton>
                    ) : null}

                    {showWaiterOnlyActions && canCreateOrder ? (
                      <PillButton
                        tone="orange"
                        onClick={() => doCreateOrder(t)}
                        title="Crear comanda"
                      >
                        ➕ Crear comanda
                      </PillButton>
                    ) : null}

                    {showWaiterOnlyActions && canViewOrder ? (
                      <PillButton
                        tone="orange"
                        onClick={() => doViewOrder(t)}
                        title="Ver comanda y agregar productos"
                      >
                        Ver comanda
                      </PillButton>
                    ) : null}

                    {showReleaseSession ? (
                      <PillButton
                        tone="warn"
                        onClick={() => doReleaseSession(t)}
                        disabled={!t?.actions?.can_release_session_enabled}
                        title={
                          t?.actions?.can_release_session_enabled
                            ? "Liberar sesión (desvincular dispositivo)"
                            : "No hay dispositivo vinculado"
                        }
                      >
                        Liberar sesión
                      </PillButton>
                    ) : null}

                    {showChargeButton ? (
                      <PillButton
                        tone="orange"
                        onClick={() => doStartPayment(openOrderId)}
                        disabled={
                          !canChargeFromTable ||
                          payingBusyOrderId === openOrderId
                        }
                        title="Iniciar proceso de cobro"
                      >
                        {payingBusyOrderId === openOrderId ? "Abriendo…" : "Cobrar"}
                      </PillButton>
                    ) : null}

                    {safeCanMarkPaid ? (
                      <PillButton
                        tone="ok"
                        onClick={() => doMarkPaid(t)}
                        title="Marcar cuenta como pagada y liberar mesa"
                      >
                        Pagado
                      </PillButton>
                    ) : null}

                    {safeCanAccept ? (
                      <PillButton
                        tone="ok"
                        onClick={() => doAccept(t)}
                        title="Aceptar comanda"
                      >
                        Aceptar
                      </PillButton>
                    ) : null}

                    {safeCanReject ? (
                      <PillButton
                        tone="danger"
                        onClick={() => doReject(t)}
                        title="Rechazar comanda"
                      >
                        Rechazar
                      </PillButton>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}