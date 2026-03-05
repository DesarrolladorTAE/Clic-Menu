// src/pages/staff/kitchen/KitchenKdsPage.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { staffContext } from "../../../services/staff/staffAuth.service";
import { useStaffAuth } from "../../../context/StaffAuthContext";

import {
  fetchKitchenKdsOrders,
  startKitchenItem,
  readyKitchenItem,
} from "../../../services/staff/kitchen/kitchenKds.service";

/**
 * Traducciones visibles (ES) sin tocar valores internos (EN)
 * - Interno: lo que venga de BD / API (queued, in_progress, ready, open, etc.)
 * - Visual: lo que se muestra al usuario.
 */
const ESTADO_ITEM_ES = {
  queued: "Pendiente",
  in_progress: "Preparando",
  ready: "Listo",
};

const ESTADO_ORDEN_ES = {
  pending_approval: "Pendiente de aprobación",
  active: "Activa",
  open: "Abierta",
  ready: "Lista",
  paying: "En cobro",
  paid: "Pagada",
  canceled: "Cancelada",
  cancelled: "Cancelada",
};

function tItemStatus(st) {
  const key = String(st || "").trim();
  return ESTADO_ITEM_ES[key] || (key ? "Desconocido" : "—");
}

function tOrderStatus(st) {
  const key = String(st || "").trim();
  return ESTADO_ORDEN_ES[key] || (key ? "Desconocido" : "—");
}

export default function KitchenDashboard() {
  const nav = useNavigate();
  const { clearStaff, exitSmart } = useStaffAuth();

  const [busy, setBusy] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState("");
  const [ctx, setCtx] = useState(null);

  const [includeReady, setIncludeReady] = useState(false);
  const [orders, setOrders] = useState([]);

  const pollRef = useRef(null);
  const abortRef = useRef(false);

  const loadContext = useCallback(async () => {
    setErr("");
    try {
      const res = await staffContext();
      const data = res?.data || null;
      setCtx(data);

      const roleName = data?.role?.name;
      if (roleName && roleName !== "kitchen") {
        if (roleName === "waiter") nav("/staff/app", { replace: true });
        else if (roleName === "cashier") nav("/staff/cashier", { replace: true });
        else nav("/staff/select-context", { replace: true });
        return false;
      }
      return true;
    } catch (e) {
      const status = e?.response?.status;
      if (status === 409) {
        nav("/staff/select-context", { replace: true });
        return false;
      }
      if (status === 401) {
        clearStaff();
        nav("/staff/login", { replace: true });
        return false;
      }
      setErr(e?.response?.data?.message || "No se pudo cargar el contexto.");
      return false;
    }
  }, [nav, clearStaff]);

  const loadOrders = useCallback(
    async (opts = {}) => {
      const { silent = false } = opts;

      if (!silent) setRefreshing(true);
      setErr("");

      try {
        const res = await fetchKitchenKdsOrders({
          include_ready_items: includeReady ? 1 : 0,
        });

        const ok = !!res?.ok;
        const data = ok ? res?.data : [];
        setOrders(Array.isArray(data) ? data : []);
      } catch (e) {
        const status = e?.response?.status;

        if (status === 409) {
          nav("/staff/select-context", { replace: true });
          return;
        }

        if (status === 401) {
          clearStaff();
          nav("/staff/login", { replace: true });
          return;
        }

        setErr(e?.response?.data?.message || "No se pudieron cargar las comandas de cocina.");
      } finally {
        if (!silent) setRefreshing(false);
        setBusy(false);
      }
    },
    [includeReady, nav, clearStaff]
  );

  useEffect(() => {
    abortRef.current = false;

    (async () => {
      setBusy(true);
      const ok = await loadContext();
      if (!ok) {
        setBusy(false);
        return;
      }
      await loadOrders({ silent: true });
      setBusy(false);
    })();

    return () => {
      abortRef.current = true;
    };
  }, [loadContext]);

  useEffect(() => {
    const startPolling = () => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => {
        if (document.hidden) return;
        loadOrders({ silent: true });
      }, 3500);
    };

    startPolling();

    const onVis = () => {
      if (!document.hidden) loadOrders({ silent: true });
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [loadOrders]);

  useEffect(() => {
    loadOrders({ silent: true });
  }, [includeReady, loadOrders]);

  const onExit = async () => {
    setErr("");
    try {
      const res = await exitSmart();
      if (res?.mode === "logout") nav("/staff/login", { replace: true });
      else nav("/staff/select-context", { replace: true });
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudo salir.");
    }
  };

  const visibleOrders = useMemo(() => {
    if (includeReady) return orders;
    return (orders || []).filter((o) => Array.isArray(o?.items) && o.items.length > 0);
  }, [orders, includeReady]);

  const doStart = async (item) => {
    setErr("");
    const id = item?.id;
    if (!id) return;

    setRefreshing(true);
    try {
      await startKitchenItem(id);
      await loadOrders({ silent: true });
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudo iniciar el ítem.");
    } finally {
      setRefreshing(false);
    }
  };

  const doReady = async (item) => {
    setErr("");
    const id = item?.id;
    if (!id) return;

    setRefreshing(true);
    try {
      await readyKitchenItem(id);
      await loadOrders({ silent: true });
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudo marcar como listo el ítem.");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div style={wrap}>
      <div style={topbar}>
        <div>
          <div style={title}>Monitor de Cocina (KDS)</div>
          <div style={sub}>
            {ctx?.restaurant?.trade_name || ctx?.restaurant?.name || "—"}{" "}
            <span style={{ opacity: 0.6 }}>·</span> {ctx?.branch?.name || "—"}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button
            style={btnGhost}
            onClick={() => setIncludeReady((s) => !s)}
            title="Mostrar u ocultar ítems listos (supervisión)"
            disabled={busy}
          >
            {includeReady ? "Mostrando listos" : "Ocultar listos"}
          </button>

          <button
            style={btnPrimary}
            onClick={() => loadOrders()}
            disabled={busy || refreshing}
            title="Refrescar"
          >
            {refreshing ? "Actualizando…" : "Refrescar"}
          </button>

          <button style={btnDanger} onClick={onExit} title="Salir">
            Salir
          </button>
        </div>
      </div>

      {err ? <div style={msgErr}>{err}</div> : null}

      {busy ? (
        <div style={note}>Cargando…</div>
      ) : (
        <>
          {!visibleOrders?.length ? (
            <div style={empty}>
              <div style={{ fontWeight: 950 }}>No hay ítems pendientes en cocina.</div>
              <div style={{ opacity: 0.7, marginTop: 6 }}>
                Si esperabas ver algo, quizá la orden ya está <b>lista</b>, o no hay comandas <b>abiertas</b>.
              </div>
            </div>
          ) : (
            <div style={grid}>
              {visibleOrders.map((o) => (
                <OrderCard
                  key={o.id}
                  order={o}
                  onStart={doStart}
                  onReady={doReady}
                  busy={refreshing}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function OrderCard({ order, onStart, onReady, busy }) {
  const items = Array.isArray(order?.items) ? order.items : [];
  const createdAt = formatWhen(order?.created_at);

  const allReady = !!order?.all_ready || Number(order?.non_ready_count || 0) === 0;
  const orderStatusEs = tOrderStatus(order?.status);

  // Tiempo corto tipo "01:10" (como en tu captura), basado en created_at
  const elapsed = formatElapsed(order?.created_at);

  return (
    <div style={ticketCard}>
      <div style={ticketHead}>
        <div style={{ minWidth: 0 }}>
          <div style={ticketHeadTop}>
            <div style={ticketMesaText}>Mesa: {order?.table_name || order?.table_id || "—"}</div>
            <div style={ticketTimePill}>{elapsed}</div>
          </div>

          <div style={ticketHeadBottom}>
            <div style={ticketFolioText}>Folio {order?.folio ?? order?.id ?? "—"}</div>
            <div style={ticketBadges}>
              <span style={allReady ? badgeOk2 : badgeWarn2}>
                {allReady ? "Listo" : "Preparando"}
              </span>
              <span style={badgeDark2} title={`Estado interno: ${String(order?.status || "")}`}>
                {String(orderStatusEs || "—").toUpperCase()}
              </span>
            </div>
          </div>

          {order?.customer_name ? (
            <div style={ticketCustomer}>{order.customer_name}</div>
          ) : null}

          {createdAt ? <div style={ticketMeta}>{createdAt}</div> : null}
        </div>
      </div>

      <div style={ticketBody}>
        {items.map((it) => (
          <ItemRow key={it.id} item={it} onStart={onStart} onReady={onReady} busy={busy} />
        ))}
      </div>
    </div>
  );
}

function ItemRow({ item, onStart, onReady, busy }) {
  const st = String(item?.kitchen_status || "");
  const canStart = st === "queued";
  const canReady = st === "in_progress";

  const name = [item?.product_name || "Producto", item?.variant_name ? `(${item.variant_name})` : ""]
    .filter(Boolean)
    .join(" ");

  const notes = prettyNotes(item?.notes);
  const itemStatusEs = tItemStatus(st);

  return (
    <div style={ticketItemRow}>
      <div style={ticketLeft}>
        <div style={ticketItemTop}>
          <span style={qtyDot}>{item?.quantity ?? 1}</span>
          <div style={{ minWidth: 0 }}>
            <div style={ticketItemName} title={name}>
              {name}
            </div>

            {notes ? (
              <div style={ticketNotes}>
                {notes}
              </div>
            ) : null}

            <div style={ticketItemMeta}>
              <span style={pill(st)} title={`Estado interno: ${st || ""}`}>
                {itemStatusEs}
              </span>

              {item?.kitchen_started_at ? (
                <span style={metaDot}>
                  Inició {formatWhen(item.kitchen_started_at)}
                </span>
              ) : null}

              {item?.kitchen_ready_at ? (
                <span style={metaDot}>
                  Listo {formatWhen(item.kitchen_ready_at)}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {Array.isArray(item?.modifiers) && item.modifiers.length ? (
          <div style={ticketModifiers}>
            {item.modifiers.map((m, idx) => (
              <span key={idx} style={chipModifier}>
                {String(m?.name || m || "").trim() || "—"}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div style={ticketRight}>
        <button
          style={btnAction(canStart)}
          onClick={() => onStart(item)}
          disabled={!canStart || busy}
          title={canStart ? "Marcar como en proceso" : "Solo se permite si está pendiente"}
        >
          Empezar
        </button>

        <button
          style={btnActionOk(canReady)}
          onClick={() => onReady(item)}
          disabled={!canReady || busy}
          title={canReady ? "Marcar como listo" : "Solo se permite si está en proceso"}
        >
          Listo
        </button>
      </div>
    </div>
  );
}

function prettyNotes(notes) {
  if (!notes) return "";
  if (typeof notes === "string") return notes;
  try {
    return JSON.stringify(notes);
  } catch {
    return String(notes);
  }
}

function formatWhen(value) {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString();
  } catch {
    return String(value);
  }
}

function formatElapsed(createdAt) {
  if (!createdAt) return "—";
  try {
    const d = new Date(createdAt);
    const ms = Date.now() - d.getTime();
    if (!Number.isFinite(ms) || ms < 0) return "—";

    const total = Math.floor(ms / 1000);
    const mm = Math.floor(total / 60);
    const ss = total % 60;

    const mm2 = String(mm).padStart(2, "0");
    const ss2 = String(ss).padStart(2, "0");
    return `${mm2}:${ss2}`;
  } catch {
    return "—";
  }
}

function pill(status) {
  const s = String(status || "");
  if (s === "queued") return { ...pillBase, background: "#fff7ed", borderColor: "#fed7aa", color: "#9a3412" };
  if (s === "in_progress") return { ...pillBase, background: "#eff6ff", borderColor: "#bfdbfe", color: "#1d4ed8" };
  if (s === "ready") return { ...pillBase, background: "#ecfdf5", borderColor: "#bbf7d0", color: "#166534" };
  return { ...pillBase, background: "#f3f4f6", borderColor: "#e5e7eb", color: "#374151" };
}

/* ================== estilos inline (KDS simple, contenedor tipo “tarjeta” como tu captura) ================== */

const wrap = { maxWidth: 1180, margin: "18px auto", padding: 14 };

const topbar = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  marginBottom: 12,
};

const title = { fontSize: 20, fontWeight: 1000, letterSpacing: 0.2 };
const sub = { fontSize: 12, opacity: 0.75, marginTop: 4 };

const note = { padding: 12, border: "1px solid #eee", borderRadius: 12, background: "#fff" };

const empty = {
  padding: 16,
  borderRadius: 14,
  border: "1px dashed #e5e7eb",
  background: "#fff",
};


const grid = {
  display: "grid",
  gap: 14,
  justifyContent: "start",
  width: "fit-content",
  maxWidth: "100%",
  marginLeft: 0,
  marginRight: "auto",

  // 1 columna si no cabe, 2 si cabe, pero manteniendo el tamaño fijo
   gridTemplateColumns: "repeat(2, minmax(460px, 1fr))",
};


/* ====== Tarjeta de comanda tipo captura: cabecera amarilla + cuerpo blanco ====== */

const ticketCard = {
  border: "1px solid #eaeaea",
  borderRadius: 16,
  overflow: "hidden",
  background: "#fff",
  boxShadow: "0 1px 0 rgba(0,0,0,0.04)",

  // mantiene todas las tarjetas parejas
  display: "flex",
  flexDirection: "column",
};

const ticketHead = {
  background: "#fbbf24",
  padding: 12,
};

const ticketHeadTop = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
};

const ticketMesaText = {
  fontWeight: 1000,
  fontSize: 14,
  color: "#111827",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const ticketTimePill = {
  fontSize: 12,
  fontWeight: 900,
  color: "#111827",
  background: "rgba(255,255,255,0.55)",
  border: "1px solid rgba(17,24,39,0.15)",
  padding: "4px 8px",
  borderRadius: 999,
  flexShrink: 0,
};

const ticketHeadBottom = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  marginTop: 6,
};

const ticketFolioText = {
  fontSize: 12,
  fontWeight: 900,
  color: "rgba(17,24,39,0.85)",
};

const ticketBadges = {
  display: "flex",
  gap: 8,
  alignItems: "center",
  flexWrap: "wrap",
  justifyContent: "flex-end",
};

const badgeOk2 = {
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 10px",
  borderRadius: 999,
  border: "1px solid rgba(22,101,52,0.25)",
  background: "rgba(236,253,245,0.85)",
  color: "#166534",
  fontWeight: 950,
  fontSize: 12,
};

const badgeWarn2 = {
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 10px",
  borderRadius: 999,
  border: "1px solid rgba(154,52,18,0.18)",
  background: "rgba(255,247,237,0.85)",
  color: "#9a3412",
  fontWeight: 950,
  fontSize: 12,
};

const badgeDark2 = {
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 10px",
  borderRadius: 999,
  border: "1px solid rgba(17,24,39,0.25)",
  background: "rgba(17,24,39,0.9)",
  color: "#fff",
  fontWeight: 950,
  fontSize: 12,
};

const ticketCustomer = {
  marginTop: 8,
  fontSize: 12,
  fontWeight: 900,
  color: "rgba(17,24,39,0.9)",
};

const ticketMeta = {
  marginTop: 4,
  fontSize: 11,
  opacity: 0.75,
  color: "#111827",
};

const ticketBody = {
  padding: 10,

  // límite visual aprox. a 3 filas (ajustable)
  maxHeight: 230,
  overflowY: "auto",
  overflowX: "hidden",

  // para que el scroll no empuje el layout
  scrollbarGutter: "stable",
};

/* ====== Fila de ítem (como la captura: cantidad circular, nombre, nota, botón a la derecha) ====== */

const ticketItemRow = {
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: 12,
  padding: "10px 0",
  borderTop: "1px solid #f1f5f9",
};

const ticketLeft = { minWidth: 0 };

const ticketItemTop = {
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  gap: 10,
  alignItems: "flex-start",
};

const qtyDot = {
  width: 26,
  height: 26,
  borderRadius: 999,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 1000,
  fontSize: 12,
  color: "#111827",
  background: "#f3f4f6",
  border: "1px solid #e5e7eb",
  flexShrink: 0,
};

const ticketItemName = {
  fontWeight: 1000,
  fontSize: 13,
  color: "#111827",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const ticketNotes = {
  marginTop: 4,
  fontSize: 12,
  color: "rgba(17,24,39,0.75)",
  whiteSpace: "pre-wrap",
};

const ticketItemMeta = {
  marginTop: 6,
  display: "flex",
  gap: 8,
  alignItems: "center",
  flexWrap: "wrap",
  fontSize: 11,
  color: "rgba(17,24,39,0.7)",
};

const metaDot = {
  opacity: 0.8,
};

const ticketModifiers = {
  marginTop: 8,
  display: "flex",
  gap: 6,
  flexWrap: "wrap",
};

const chipModifier = {
  fontSize: 11,
  fontWeight: 900,
  padding: "3px 8px",
  borderRadius: 999,
  border: "1px solid #fde68a",
  background: "#fffbeb",
  color: "#92400e",
};

const ticketRight = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  alignItems: "flex-end",
  justifyContent: "center",
};

/* ====== Botones ====== */

const btnPrimary = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #d1fae5",
  background: "#ecfdf5",
  cursor: "pointer",
  fontWeight: 1000,
};

const btnGhost = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  background: "#fff",
  cursor: "pointer",
  fontWeight: 950,
};

const btnDanger = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ffb4b4",
  background: "#ffe5e5",
  cursor: "pointer",
  fontWeight: 950,
  color: "#7a0010",
};

const btnAction = (enabled) => ({
  width: 110,
  padding: "8px 10px",
  borderRadius: 999,
  border: `1px solid ${enabled ? "#c7d2fe" : "#e5e7eb"}`,
  background: enabled ? "#eef2ff" : "#f9fafb",
  cursor: enabled ? "pointer" : "not-allowed",
  fontWeight: 1000,
  color: "#1f2a7a",
  opacity: enabled ? 1 : 0.55,
});

const btnActionOk = (enabled) => ({
  width: 110,
  padding: "8px 10px",
  borderRadius: 999,
  border: `1px solid ${enabled ? "#bbf7d0" : "#e5e7eb"}`,
  background: enabled ? "#ecfdf5" : "#f9fafb",
  cursor: enabled ? "pointer" : "not-allowed",
  fontWeight: 1000,
  color: "#166534",
  opacity: enabled ? 1 : 0.55,
});

/* ====== Píldoras ====== */

const pillBase = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "2px 8px",
  borderRadius: 999,
  border: "1px solid",
  fontWeight: 900,
  fontSize: 11,
};

/* ====== Errores ====== */

const msgErr = {
  background: "#ffe5e5",
  border: "1px solid #ffb4b4",
  padding: 10,
  borderRadius: 10,
  marginBottom: 10,
  color: "#7a0010",
  fontWeight: 900,
};