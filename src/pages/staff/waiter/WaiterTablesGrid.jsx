// src/pages/staff/waiter/WaiterTablesGrid.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useStaffAuth } from "../../../context/StaffAuthContext";
import {
  fetchStaffTablesGrid,
  attendTable,
  finishAttention,
  acceptCustomerOrder,
  rejectCustomerOrder,
  releaseTableSession,
  markTablePaid,
  listTableSessionRequests,
  approveTableSessionRequest,
  rejectTableSessionRequest,
} from "../../../services/staff/waiter/waiterTables.service";

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
      <div style={{ marginTop: 8, fontSize: 11, opacity: 0.75 }}>(clic para cerrar)</div>
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
    mine: { bg: "#e8f1ff", bd: "#95b9ff", fg: "#0b4db3", label: "Atendiendo" },
    locked: { bg: "#f3f4f6", bd: "#d1d5db", fg: "#374151", label: "Ocupada" },
    blocked: { bg: "#efeff3", bd: "#c7c7d0", fg: "#4b5563", label: "Bloqueada" },
    pending: { bg: "#fff3cd", bd: "#ffe08a", fg: "#8a6d3b", label: "Comanda pendiente" },
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

  const [toast, setToast] = useState({ open: false, message: "", type: "info" });
  const showToast = (message, type = "info") => {
    setToast({ open: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, open: false })), 4500);
  };
  const closeToast = () => setToast((t) => ({ ...t, open: false }));

  const pollRef = useRef(null);

  const load = async ({ silent = false } = {}) => {
    if (!silent) setBusy(true);
    else setRefreshing(true);

    try {
      const [resGrid, resReq] = await Promise.all([
        fetchStaffTablesGrid(),
        listTableSessionRequests().catch(() => null),
      ]);

      setData(resGrid || null);
      setRequests(Array.isArray(resReq?.data) ? resReq.data : []);
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

      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "No se pudieron cargar las mesas.";
      showToast(msg, "error");
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
        if (document.visibilityState === "visible") load({ silent: true });
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
  const tables = useMemo(() => (Array.isArray(data?.data) ? data.data : []), [data]);

  const summary = useMemo(() => {
    const counts = { free: 0, call: 0, mine: 0, locked: 0, blocked: 0, pending: 0 };
    for (const t of tables) {
      const s = String(t?.ui_state || "free");
      if (counts[s] !== undefined) counts[s]++;
    }
    return counts;
  }, [tables]);

  const doAttend = async (table) => {
    const id = table?.id;
    if (!id) return;

    try {
      await attendTable(id);
      showToast(`Mesa ${table?.name || id}: llamada atendida.`, "success");
      await load({ silent: true });
    } catch (e) {
      const st = e?.response?.status;
      const code = e?.response?.data?.code;
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "No se pudo atender la mesa.";

      if (st === 409 && (code === "TAKEN" || String(msg).toLowerCase().includes("ya tomó"))) {
        showToast(
          `Te ganaron la mesa ${table?.name || id}. Otro mesero la atendió primero.`,
          "warning"
        );
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
      const msg = res?.message ? String(res.message) : `Mesa ${table?.name || id}: atención finalizada.`;
      showToast(msg, "success");
      await load({ silent: true });
    } catch (e) {
      const st = e?.response?.status;
      const code = e?.response?.data?.code;
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "No se pudo finalizar la atención.";

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
      const msg = e?.response?.data?.message || e?.message || "No se pudo liberar la sesión.";
      showToast(msg, "error");
    }
  };

  const doMarkPaid = async (table) => {
    const tableId = table?.id;
    if (!tableId) return;

    try {
      const res = await markTablePaid(tableId);
      showToast(res?.message || "Cuenta marcada como pagada. Mesa liberada.", "success");
      await load({ silent: true });
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "No se pudo marcar como pagada.";
      showToast(msg, "error");
    }
  };

  const doAccept = async (table) => {
    const pending = table?.pending_order || null;
    const orderId = pending?.id || null;

    if (!orderId) {
      showToast("No hay comanda pendiente para aceptar.", "warning");
      return;
    }

    try {
      await acceptCustomerOrder(orderId);
      showToast(`Comanda #${orderId}: aceptada.`, "success");
      await load({ silent: true });
    } catch (e) {
      const st = e?.response?.status;
      const code = e?.response?.data?.code;
      const msg = e?.response?.data?.message || e?.message || "No se pudo aceptar la comanda.";

      if (st === 409 && (code === "TAKEN" || code === "TABLE_TAKEN" || code === "NOT_PENDING")) {
        showToast("Otro mesero aceptó primero esta comanda (o ya no estaba pendiente).", "warning");
        await load({ silent: true });
        return;
      }

      showToast(msg, "error");
    }
  };

  const doReject = async (table) => {
    const pending = table?.pending_order || null;
    const orderId = pending?.id || null;

    if (!orderId) {
      showToast("No hay comanda pendiente para rechazar.", "warning");
      return;
    }

    try {
      await rejectCustomerOrder(orderId);
      showToast(`Comanda #${orderId}: rechazada.`, "success");
      await load({ silent: true });
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "No se pudo rechazar la comanda.";
      showToast(msg, "error");
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
      const msg = e?.response?.data?.message || e?.message || "No se pudo aprobar la solicitud.";
      showToast(msg, "error");
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
      const msg = e?.response?.data?.message || e?.message || "No se pudo rechazar la solicitud.";
      showToast(msg, "error");
    } finally {
      setReqBusyId(null);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "22px auto", padding: 16 }}>
      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={closeToast} />

      <div
        style={{
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 18,
          background: "#fff",
          padding: 14,
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "grid", gap: 6 }}>
            <div style={{ fontSize: 18, fontWeight: 950 }}>Mesas (Mesero)</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>
              Sucursal: <strong>{meta?.branch_id ?? "—"}</strong> · Staff:{" "}
              <strong>{meta?.staff_id ?? "—"}</strong> · Servicio:{" "}
              <strong>{meta?.table_service_mode ?? "—"}</strong> · Modo pedido:{" "}
              <strong>{meta?.ordering_mode ?? "—"}</strong>
              {refreshing ? <span style={{ marginLeft: 10, opacity: 0.75 }}>🔄 actualizando…</span> : null}
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
              <span style={{ ...pillMini("#e6ffed", "#8ae99c") }}>Libre: {summary.free}</span>
              <span style={{ ...pillMini("#fff3cd", "#ffe08a") }}>Llamando: {summary.call}</span>
              <span style={{ ...pillMini("#e8f1ff", "#95b9ff") }}>Atendiendo: {summary.mine}</span>
              <span style={{ ...pillMini("#f3f4f6", "#d1d5db") }}>Ocupada: {summary.locked}</span>
              <span style={{ ...pillMini("#efeff3", "#c7c7d0") }}>Bloqueada: {summary.blocked}</span>
              <span style={{ ...pillMini("#fff3cd", "#ffe08a") }}>Pendiente: {summary.pending}</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "start" }}>
            <PillButton tone="soft" onClick={() => load()} disabled={busy} title="Recargar">
              🔄 Recargar
            </PillButton>

            <PillButton tone="default" onClick={() => nav("/staff/app")} title="Regresar al dashboard">
              ← Dashboard
            </PillButton>
          </div>
        </div>
      </div>

      {/* JOIN REQUESTS */}
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
          <div style={{ fontWeight: 950, marginBottom: 10 }}>Solicitudes para retomar cuenta</div>
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
                    {r.expires_at ? <> · Expira: <strong>{r.expires_at}</strong></> : null}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <PillButton
                    tone="ok"
                    disabled={reqBusyId === r.id}
                    onClick={() => doApproveReq(r.id)}
                    title="Aprobar dispositivo"
                  >
                    ✅ Aprobar
                  </PillButton>
                  <PillButton
                    tone="danger"
                    disabled={reqBusyId === r.id}
                    onClick={() => doRejectReq(r.id)}
                    title="Rechazar solicitud"
                  >
                    ⛔ Rechazar
                  </PillButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {busy ? (
        <div style={{ marginTop: 14, padding: 12, border: "1px solid rgba(0,0,0,0.12)", borderRadius: 14, background: "#fff" }}>
          Cargando mesas…
        </div>
      ) : tables.length === 0 ? (
        <div style={{ marginTop: 14, padding: 12, border: "1px solid rgba(0,0,0,0.12)", borderRadius: 14, background: "#fff" }}>
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

              const session = t?.session || null;
              const hasDevice = !!session?.has_device;

              // Backend flags
              const canAttend = !!t?.actions?.can_attend;
              const canFinish = !!t?.actions?.can_finish_attention;
              const canAccept = !!t?.actions?.can_accept_order && hasPending;
              const canReject = !!t?.actions?.can_reject_order && hasPending;

              // ✅ Pagado/Liberar: backend los manda en actions, pero tú además quieres:
              // - Pagado siempre visible si hay open
              // - Liberar sesión solo si hay device (si ya está liberada, ya no tiene caso)
              const canMarkPaid = !!t?.actions?.can_mark_paid && hasOpenOrder;
              const canReleaseSession = !!t?.actions?.can_release_session && hasOpenOrder && hasDevice;

              return (
                <div
                  key={t.id}
                  style={{
                    borderRadius: 16,
                    border: `1px solid ${v.bd}`,
                    background: v.bg,
                    padding: 12,
                    minHeight: 150,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    boxShadow: "0 10px 22px rgba(0,0,0,0.05)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 10 }}>
                    <div style={{ display: "grid", gap: 4 }}>
                      <div style={{ fontWeight: 950, fontSize: 15 }}>{t?.name || `Mesa #${t.id}`}</div>
                      <div style={{ fontSize: 12, opacity: 0.85 }}>
                        Estado: <strong style={{ color: v.fg }}>{v.label}</strong>
                      </div>
                    </div>

                    <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.85 }}>
                      {Number(t?.seats || 0) ? `${t.seats} asientos` : "—"}
                    </div>
                  </div>

                  {t?.ui_reason ? (
                    <div style={{ fontSize: 12, opacity: 0.9, color: v.fg, fontWeight: 800 }}>
                      {t.ui_reason}
                    </div>
                  ) : null}

                  {hasOpenOrder ? (
                    <div style={{ fontSize: 12, opacity: 0.85 }}>
                      🍽️ Comanda #{openOrder.id} ·{" "}
                      {openOrder.total != null ? <strong>{money(openOrder.total)}</strong> : null}
                      {" · "}
                      {hasDevice ? (
                        <strong style={{ color: "#0b4db3" }}>Con dispositivo</strong>
                      ) : (
                        <strong style={{ color: "#8a6d3b" }}>Sin dispositivo</strong>
                      )}
                    </div>
                  ) : hasPending ? (
                    <div style={{ fontSize: 12, opacity: 0.9, fontWeight: 900 }}>
                      ⏳ Comanda pendiente #{pending.id}
                      {pending?.customer_name ? ` · ${pending.customer_name}` : ""}
                      {pending?.total != null ? ` · ${money(pending.total)}` : ""}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, opacity: 0.75 }}>Sin comanda activa</div>
                  )}

                  <div style={{ marginTop: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {/* 1) Pendiente: Aceptar/Rechazar */}
                    {canAccept ? (
                      <PillButton tone="ok" onClick={() => doAccept(t)} title="Aceptar comanda del cliente">
                        ✅ Aceptar
                      </PillButton>
                    ) : null}

                    {canReject ? (
                      <PillButton tone="danger" onClick={() => doReject(t)} title="Rechazar comanda del cliente">
                        ⛔ Rechazar
                      </PillButton>
                    ) : null}

                    {/* 2) Atender/Finalizar llamada */}
                    {canAttend ? (
                      <PillButton tone="warn" onClick={() => doAttend(t)} title="Atender llamada">
                        ✅ Atender
                      </PillButton>
                    ) : null}

                    {canFinish ? (
                      <PillButton
                        tone="dark"
                        onClick={() => doFinish(t)}
                        title="Finalizar atención (cierra table_calls)"
                      >
                        🧾 Finalizar atención
                      </PillButton>
                    ) : null}

                    {/* 3) Open: Pagado | Liberar Sesión */}
                    {canMarkPaid ? (
                      <PillButton tone="ok" onClick={() => doMarkPaid(t)} title="Cierra orden y libera mesa (por ahora)">
                        💳 Pagado
                      </PillButton>
                    ) : null}

                    {canReleaseSession ? (
                      <PillButton
                        tone="dark"
                        onClick={() => doReleaseSession(t)}
                        title="Borra device_identifier de table_sessions (no toca la comanda)"
                      >
                        🔓 Liberar Sesión
                      </PillButton>
                    ) : null}

                    {!canAccept && !canReject && !canAttend && !canFinish && !canMarkPaid && !canReleaseSession ? (
                      <span style={{ fontSize: 12, opacity: 0.75, fontWeight: 800 }}>
                        Sin acciones
                      </span>
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

function pillMini(bg, bd) {
  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    border: `1px solid ${bd}`,
    background: bg,
    fontSize: 12,
    fontWeight: 950,
    whiteSpace: "nowrap",
  };
}