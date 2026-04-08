import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { staffContext } from "../../../services/staff/staffAuth.service";
import { useStaffAuth } from "../../../context/StaffAuthContext";

import {
  fetchKitchenKdsOrders,
  startKitchenItem,
  readyKitchenItem,
  notifyKitchenOrderReady,
} from "../../../services/staff/kitchen/kitchenKds.service";
import echo from "../../../realtime/echo";

/**
 * Traducciones visibles
 */
const ESTADO_ITEM_ES = {
  queued: "Pendiente",
  in_progress: "Preparando",
  ready: "Listo",
  picked_up: "Recogido",
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
  if (s === "picked_up") return { ...pillBase, background: "#f3f4f6", borderColor: "#d1d5db", color: "#374151" };
  return { ...pillBase, background: "#f3f4f6", borderColor: "#e5e7eb", color: "#374151" };
}

function recalcOrderDerived(order, includeReady) {
  const rawItems = Array.isArray(order?.items) ? order.items : [];

  const nonReadyCount = rawItems.filter((it) => {
    const st = String(it?.kitchen_status || "");
    return st !== "ready" && st !== "picked_up";
  }).length;

  const readyUnpickedCount = rawItems.filter(
    (it) => String(it?.kitchen_status || "") === "ready"
  ).length;

  const allReady = nonReadyCount === 0;
  const readyNoticeSent = !!order?.ready_notice_sent;

  const visibleItems = includeReady
    ? rawItems.filter((it) => {
        const st = String(it?.kitchen_status || "");
        return st === "queued" || st === "in_progress" || st === "ready";
      })
    : rawItems.filter((it) => {
        const st = String(it?.kitchen_status || "");
        return st !== "ready" && st !== "picked_up";
      });

  return {
    ...order,
    items: visibleItems,
    all_ready: allReady,
    non_ready_count: nonReadyCount,
    ready_unpicked_count: readyUnpickedCount,
    actions: {
      ...(order?.actions || {}),
      can_notify_ready: allReady && readyUnpickedCount > 0 && !readyNoticeSent,
    },
  };
}

function groupItemModifiers(modifiers) {
  const arr = Array.isArray(modifiers) ? modifiers : [];
  const map = new Map();

  arr.forEach((m) => {
    const groupName = String(m?.group_name_snapshot || "Extras").trim() || "Extras";
    const itemName = String(m?.name_snapshot || "Modificador").trim() || "Modificador";
    const qty = Number(m?.quantity || 1);

    if (!map.has(groupName)) {
      map.set(groupName, []);
    }

    map.get(groupName).push({
      id: m?.id || `${groupName}-${itemName}`,
      name: itemName,
      quantity: qty > 0 ? qty : 1,
    });
  });

  return Array.from(map.entries()).map(([groupName, items]) => ({
    groupName,
    items,
  }));
}

function modifierLabel(mod) {
  const qty = Number(mod?.quantity || 1);
  return qty > 1 ? `${mod?.name} x${qty}` : `${mod?.name}`;
}

function buildKitchenItemsView(items = []) {
  const arr = Array.isArray(items) ? items : [];
  const independent = [];
  const compositeMap = new Map();

  arr.forEach((item) => {
    const parentId = Number(item?.parent_order_item_id || 0);

    if (!parentId) {
      independent.push({
        type: "single",
        item,
      });
      return;
    }

    if (!compositeMap.has(parentId)) {
      compositeMap.set(parentId, {
        type: "composite",
        parentId,
        items: [],
      });
    }

    compositeMap.get(parentId).items.push(item);
  });

  const composites = Array.from(compositeMap.values()).sort((a, b) => a.parentId - b.parentId);

  const combined = [...independent, ...composites];

  combined.sort((a, b) => {
    const getFirstId = (entry) => {
      if (entry?.type === "single") return Number(entry?.item?.id || 0);
      return Number(entry?.items?.[0]?.id || 0);
    };
    return getFirstId(a) - getFirstId(b);
  });

  return combined;
}

function buildConsumptionUi(result) {
  const inventory = result?.data?.inventory_consumption || null;
  const baseMessage = String(result?.message || "Ítem enviado a preparación.").trim();

  if (!inventory) {
    return {
      toast: baseMessage,
      badge: null,
    };
  }

  const warehouseText = inventory?.warehouse_id
    ? `almacén #${inventory.warehouse_id}`
    : "almacén efectivo";

  const already = !!inventory?.already;
  const type = String(inventory?.consumption_type || "").trim();

  if (already) {
    return {
      toast: `${baseMessage} El consumo de inventario ya existía previamente.`,
      badge: {
        kind: "already",
        text: "Consumo ya existía",
      },
    };
  }

  if (type === "ingredients") {
    const ingredientMovements = Array.isArray(inventory?.ingredient_movements)
      ? inventory.ingredient_movements
      : [];

    const ingredientCount = ingredientMovements.length;

    return {
      toast:
        ingredientCount > 0
          ? `${baseMessage} Se descontaron ${ingredientCount} ingrediente(s) del ${warehouseText}.`
          : `${baseMessage} Se aplicó consumo por ingredientes en el ${warehouseText}.`,
      badge: {
        kind: "applied",
        text: "Consumo aplicado",
      },
    };
  }

  if (type === "product") {
    const productMovement = inventory?.product_movement || null;
    const qty = Math.abs(Number(productMovement?.quantity || 0));

    return {
      toast:
        qty > 0
          ? `${baseMessage} Se descontó ${qty} unidad(es) del producto en el ${warehouseText}.`
          : `${baseMessage} Se aplicó consumo de producto directo en el ${warehouseText}.`,
      badge: {
        kind: "applied",
        text: "Consumo aplicado",
      },
    };
  }

  if (type === "none") {
    return {
      toast: `${baseMessage} Este producto no consume inventario.`,
      badge: {
        kind: "neutral",
        text: "Sin consumo",
      },
    };
  }

  if (type === "composite_parent_skipped") {
    return {
      toast: `${baseMessage} El padre compuesto no consume inventario directamente.`,
      badge: {
        kind: "neutral",
        text: "Consumo omitido",
      },
    };
  }

  return {
    toast: baseMessage,
    badge: null,
  };
}

function buildKitchenInventoryError(e) {
  const responseData = e?.response?.data || {};
  const code = String(responseData?.code || responseData?.inventory?.code || "").trim();
  const fallbackMessage = String(
    responseData?.message || "No se pudo iniciar el ítem."
  ).trim();

  const map = {
    EFFECTIVE_WAREHOUSE_NOT_FOUND:
      "No se pudo iniciar porque no hay un almacén efectivo activo para este pedido.",
    RECIPE_INGREDIENT_NOT_FOUND:
      "No se pudo iniciar porque falta un ingrediente de la receta.",
    RECIPE_INGREDIENT_NOT_STOCK_ITEM:
      "No se pudo iniciar porque uno de los ingredientes no es inventariable.",
    RECIPE_INGREDIENT_INACTIVE:
      "No se pudo iniciar porque uno de los ingredientes está inactivo.",
    PRODUCT_NOT_FOUND_FOR_ORDER_ITEM:
      "No se pudo iniciar porque no se encontró el producto del ítem.",
    PRODUCT_INACTIVE_FOR_ORDER_ITEM:
      "No se pudo iniciar porque el producto está inactivo.",
    PRODUCT_TYPE_NOT_SUPPORTED_FOR_DIRECT_CONSUMPTION:
      "No se pudo iniciar porque ese tipo de producto no soporta consumo directo desde cocina.",
    MISSING_RECIPE_FOR_ORDER_ITEM:
      "No se pudo iniciar porque el producto no tiene receta activa para consumir inventario.",
    INGREDIENT_NOT_STOCK_ITEM:
      "No se pudo iniciar porque el ingrediente no es inventariable.",
    INGREDIENT_INACTIVE:
      "No se pudo iniciar porque el ingrediente está inactivo.",
    PRODUCT_NOT_DIRECT_STOCK:
      "No se pudo descontar producto directo porque el producto no usa stock directo.",
    PRODUCT_INACTIVE:
      "No se pudo descontar producto directo porque el producto está inactivo.",
    INSUFFICIENT_STOCK:
      "No se pudo iniciar porque no hay existencia suficiente.",
    STOCK_NOT_FOUND:
      "No se pudo iniciar porque no existe registro de stock para este ítem.",
    INVALID_TRANSITION:
      fallbackMessage,
    ALREADY_READY:
      fallbackMessage,
    ALREADY_PICKED_UP:
      fallbackMessage,
  };

  return map[code] || fallbackMessage;
}

export default function KitchenDashboard() {
  const nav = useNavigate();
  const { clearStaff, exitSmart } = useStaffAuth();

  const [busy, setBusy] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [ctx, setCtx] = useState(null);

  const [includeReady, setIncludeReady] = useState(false);
  const [orders, setOrders] = useState([]);
  const [notifyingOrderId, setNotifyingOrderId] = useState(null);
  const [busyItemIds, setBusyItemIds] = useState({});
  const [itemConsumptionState, setItemConsumptionState] = useState({});

  const pollRef = useRef(null);
  const abortRef = useRef(false);
  const wsRefreshFastRef = useRef(null);
  const wsRefreshSlowRef = useRef(null);

  const setItemBusy = (itemId, value) => {
    setBusyItemIds((prev) => {
      const next = { ...prev };
      if (!value) delete next[itemId];
      else next[itemId] = value;
      return next;
    });
  };

  const setConsumptionBadge = (itemId, badge) => {
    if (!itemId) return;

    setItemConsumptionState((prev) => {
      const next = { ...prev };

      if (!badge) {
        delete next[itemId];
        return next;
      }

      next[itemId] = badge;
      return next;
    });
  };

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

  const patchOrderByItemId = useCallback((itemId, updater) => {
    if (!itemId) return;
    setOrders((prev) =>
      (prev || []).map((order) => {
        const hasItem = Array.isArray(order?.items) && order.items.some((it) => Number(it?.id) === Number(itemId));
        if (!hasItem) return order;
        return updater(order);
      })
    );
  }, []);

  const patchOrderById = useCallback((orderId, updater) => {
    if (!orderId) return;
    setOrders((prev) =>
      (prev || []).map((order) => {
        if (Number(order?.id) !== Number(orderId)) return order;
        return updater(order);
      })
    );
  }, []);

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
  }, [loadContext, loadOrders]);

  useEffect(() => {
    const startPolling = () => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => {
        if (document.hidden) return;
        loadOrders({ silent: true });
      }, 10000);
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

  const branchId = Number(ctx?.branch?.id || ctx?.branch_id || 0);
  const staffId = Number(ctx?.user?.id || ctx?.staff_id || 0);

  useEffect(() => {
    if (!branchId) return;

    const channelName = `branch.${branchId}.kitchen`;

    const scheduleRefresh = () => {
      if (wsRefreshFastRef.current) clearTimeout(wsRefreshFastRef.current);
      if (wsRefreshSlowRef.current) clearTimeout(wsRefreshSlowRef.current);

      wsRefreshFastRef.current = setTimeout(() => {
        loadOrders({ silent: true });
      }, 120);

      wsRefreshSlowRef.current = setTimeout(() => {
        loadOrders({ silent: true });
      }, 900);
    };

    const handleKitchenUpdated = (payload = {}) => {
      const eventBranchId = Number(payload?.branch_id || 0);
      if (!eventBranchId || eventBranchId !== branchId) return;

      scheduleRefresh();

      const targetStaffId = Number(payload?.target_staff_id || 0);
      const msg = String(payload?.message || "").trim();

      if (msg && (!targetStaffId || targetStaffId === staffId)) {
        setOkMsg(msg);
      }
    };

    echo.private(channelName).listen(".kitchen.kds.updated", handleKitchenUpdated);

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
  }, [branchId, staffId, loadOrders]);

  useEffect(() => {
    return () => {
      if (wsRefreshFastRef.current) clearTimeout(wsRefreshFastRef.current);
      if (wsRefreshSlowRef.current) clearTimeout(wsRefreshSlowRef.current);
    };
  }, []);

  const onExit = async () => {
    setErr("");
    setOkMsg("");
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

    return (orders || []).filter((o) => {
      const hasVisibleItems = Array.isArray(o?.items) && o.items.length > 0;
      const keepByUnreadNotice = !!o?.ready_notice_sent;
      return hasVisibleItems || keepByUnreadNotice;
    });
  }, [orders, includeReady]);

  const doStart = async (item) => {
    setErr("");
    setOkMsg("");
    const id = item?.id;
    if (!id) return;

    setItemBusy(id, "start");

    patchOrderByItemId(id, (order) => {
      const nextItems = (order.items || []).map((it) => {
        if (Number(it?.id) !== Number(id)) return it;
        return {
          ...it,
          kitchen_status: "in_progress",
          kitchen_started_at: it?.kitchen_started_at || new Date().toISOString(),
        };
      });

      return recalcOrderDerived({ ...order, items: nextItems }, includeReady);
    });

    try {
      const res = await startKitchenItem(id);
      const consumptionUi = buildConsumptionUi(res);

      setOkMsg(consumptionUi.toast || "Ítem enviado a preparación.");
      setConsumptionBadge(id, consumptionUi.badge || null);
    } catch (e) {
      await loadOrders({ silent: true });
      setErr(buildKitchenInventoryError(e));
      setConsumptionBadge(id, null);
    } finally {
      setItemBusy(id, null);
    }
  };

  const doReady = async (item) => {
    setErr("");
    setOkMsg("");
    const id = item?.id;
    if (!id) return;

    setItemBusy(id, "ready");

    patchOrderByItemId(id, (order) => {
      const nextItems = (order.items || []).map((it) => {
        if (Number(it?.id) !== Number(id)) return it;
        return {
          ...it,
          kitchen_status: "ready",
          kitchen_ready_at: new Date().toISOString(),
        };
      });

      return recalcOrderDerived({ ...order, items: nextItems }, includeReady);
    });

    try {
      await readyKitchenItem(id);
      setOkMsg("Ítem marcado como listo.");
    } catch (e) {
      await loadOrders({ silent: true });
      setErr(e?.response?.data?.message || "No se pudo marcar como listo el ítem.");
    } finally {
      setItemBusy(id, null);
    }
  };

  const doNotifyReady = async (order) => {
    const orderId = order?.id;
    if (!orderId) return;

    setErr("");
    setOkMsg("");
    setNotifyingOrderId(orderId);

    patchOrderById(orderId, (current) =>
      recalcOrderDerived(
        {
          ...current,
          ready_notice_sent: true,
          actions: {
            ...(current?.actions || {}),
            can_notify_ready: false,
          },
        },
        includeReady
      )
    );

    try {
      const res = await notifyKitchenOrderReady(orderId);
      setOkMsg(
        res?.message ||
          (res?.data?.already
            ? "El aviso de pedido listo ya estaba enviado."
            : "Aviso enviado al mesero.")
      );
    } catch (e) {
      await loadOrders({ silent: true });
      setErr(e?.response?.data?.message || "No se pudo enviar el aviso de pedido listo.");
    } finally {
      setNotifyingOrderId(null);
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
      {okMsg ? <div style={msgOk}>{okMsg}</div> : null}

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
                  onNotifyReady={doNotifyReady}
                  busy={refreshing}
                  notifying={notifyingOrderId === o.id}
                  busyItemIds={busyItemIds}
                  itemConsumptionState={itemConsumptionState}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function OrderCard({
  order,
  onStart,
  onReady,
  onNotifyReady,
  busy,
  notifying,
  busyItemIds,
  itemConsumptionState,
}) {
  const items = Array.isArray(order?.items) ? order.items : [];
  const createdAt = formatWhen(order?.created_at);

  const allReady = !!order?.all_ready || Number(order?.non_ready_count || 0) === 0;
  const orderStatusEs = tOrderStatus(order?.status);
  const canNotifyReady = !!order?.actions?.can_notify_ready;
  const readyNoticeSent = !!order?.ready_notice_sent;
  const hasVisibleItems = items.length > 0;
  const groupedView = useMemo(() => buildKitchenItemsView(items), [items]);

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
        {hasVisibleItems ? (
          groupedView.map((entry, idx) => {
            if (entry?.type === "single") {
              return (
                <ItemRow
                  key={`single-${entry?.item?.id || idx}`}
                  item={entry.item}
                  onStart={onStart}
                  onReady={onReady}
                  busy={busy}
                  itemBusyState={busyItemIds?.[entry?.item?.id] || null}
                  consumptionState={itemConsumptionState?.[entry?.item?.id] || null}
                />
              );
            }

            return (
              <CompositeGroupCard
                key={`composite-${entry?.parentId || idx}`}
                group={entry}
                onStart={onStart}
                onReady={onReady}
                busy={busy}
                busyItemIds={busyItemIds}
                itemConsumptionState={itemConsumptionState}
              />
            );
          })
        ) : readyNoticeSent ? (
          <div style={emptyItemsBox}>
            <div style={emptyItemsTitle}>Esperando confirmación del mesero</div>
            <div style={emptyItemsText}>
              Ya no hay ítems visibles en esta comanda, mas el aviso de <b>Pedido listo</b> sigue activo.
              La tarjeta permanecerá aquí hasta que el mesero lo marque como <b>Leído</b>.
            </div>
          </div>
        ) : (
          <div style={emptyItemsBox}>
            <div style={emptyItemsTitle}>Sin ítems visibles</div>
            <div style={emptyItemsText}>
              Esta comanda no tiene ítems visibles en este modo.
            </div>
          </div>
        )}
      </div>

      <div style={ticketFooter}>
        <div style={ticketFooterLeft}>
          {readyNoticeSent ? (
            <span style={noticeSentPill}>Aviso enviado al mesero</span>
          ) : (
            <span style={noticePendingPill}>
              {allReady ? "Listo para avisar" : "Aún hay ítems pendientes"}
            </span>
          )}
        </div>

        <div style={ticketFooterRight}>
          <button
            style={btnNotifyReady(canNotifyReady && !busy && !notifying)}
            onClick={() => onNotifyReady(order)}
            disabled={busy || notifying || !canNotifyReady}
            title={
              canNotifyReady
                ? readyNoticeSent
                  ? "El aviso ya fue enviado. Si lo oprimes de nuevo, el sistema te lo confirmará."
                  : "Avisar al mesero que el pedido está listo"
                : "Aún hay pedidos pendientes"
            }
          >
            {notifying
              ? "Enviando aviso…"
              : readyNoticeSent
              ? "Pedido listo enviado"
              : "Pedido listo"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CompositeGroupCard({
  group,
  onStart,
  onReady,
  busy,
  busyItemIds,
  itemConsumptionState,
}) {
  const items = Array.isArray(group?.items) ? group.items : [];
  if (!items.length) return null;

  return (
    <div style={compositeGroupWrap}>
      <div style={compositeGroupHeader}>
        <div style={compositeGroupTitle}>Producto compuesto</div>
        <div style={compositeGroupSub}>
          Agrupado por padre #{group?.parentId || "—"}
        </div>
      </div>

      <div style={compositeGroupBody}>
        {items.map((item) => (
          <div key={item.id} style={compositeChildRow}>
            <ItemRow
              item={item}
              onStart={onStart}
              onReady={onReady}
              busy={busy}
              itemBusyState={busyItemIds?.[item.id] || null}
              consumptionState={itemConsumptionState?.[item.id] || null}
              compact
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ItemRow({
  item,
  onStart,
  onReady,
  busy,
  itemBusyState,
  consumptionState,
  compact = false,
}) {
  const st = String(item?.kitchen_status || "");
  const canStart = st === "queued";
  const canReady = st === "in_progress";

  const name = [item?.product_name || "Producto", item?.variant_name ? `(${item.variant_name})` : ""]
    .filter(Boolean)
    .join(" ");

  const notes = prettyNotes(item?.notes);
  const itemStatusEs = tItemStatus(st);
  const groupedModifiers = groupItemModifiers(item?.modifiers);

  return (
    <div
      style={{
        ...ticketItemRow,
        borderTop: compact ? "none" : ticketItemRow.borderTop,
        padding: compact ? "6px 0" : ticketItemRow.padding,
      }}
    >
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

            {consumptionState?.text ? (
              <div style={consumptionRow}>
                <span
                  style={
                    consumptionState?.kind === "already"
                      ? consumptionBadgeAlready
                      : consumptionState?.kind === "neutral"
                      ? consumptionBadgeNeutral
                      : consumptionBadgeApplied
                  }
                >
                  {consumptionState.text}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {groupedModifiers.length ? (
          <div style={ticketModifiersBlock}>
            <div style={ticketModifiersTitle}>Modificadores</div>

            <div style={ticketModifierGroups}>
              {groupedModifiers.map((group) => (
                <div key={group.groupName} style={ticketModifierGroupCard}>
                  <div style={ticketModifierGroupName}>{group.groupName}</div>

                  <div style={ticketModifiers}>
                    {group.items.map((m) => (
                      <span key={m.id} style={chipModifier}>
                        {modifierLabel(m)}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div style={ticketRight}>
        <button
          style={btnAction(canStart && !itemBusyState)}
          onClick={() => onStart(item)}
          disabled={!canStart || busy || !!itemBusyState}
          title={canStart ? "Marcar como en proceso" : "Solo se permite si está pendiente"}
        >
          {itemBusyState === "start" ? "Empezando…" : "Empezar"}
        </button>

        <button
          style={btnActionOk(canReady && !itemBusyState)}
          onClick={() => onReady(item)}
          disabled={!canReady || busy || !!itemBusyState}
          title={canReady ? "Marcar como listo" : "Solo se permite si está en proceso"}
        >
          {itemBusyState === "ready" ? "Marcando…" : "Listo"}
        </button>
      </div>
    </div>
  );
}

/* ================== estilos inline ================== */

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
  gridTemplateColumns: "repeat(2, minmax(460px, 1fr))",
};

const ticketCard = {
  border: "1px solid #eaeaea",
  borderRadius: 16,
  overflow: "hidden",
  background: "#fff",
  boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
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
  maxHeight: 230,
  overflowY: "auto",
  overflowX: "hidden",
  scrollbarGutter: "stable",
  minHeight: 72,
};

const emptyItemsBox = {
  border: "1px dashed #d1d5db",
  background: "#f9fafb",
  borderRadius: 12,
  padding: 12,
};

const emptyItemsTitle = {
  fontSize: 13,
  fontWeight: 950,
  color: "#111827",
};

const emptyItemsText = {
  marginTop: 6,
  fontSize: 12,
  lineHeight: 1.45,
  color: "#4b5563",
};

const ticketFooter = {
  borderTop: "1px solid #f1f5f9",
  padding: "10px 12px 12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  flexWrap: "wrap",
};

const ticketFooterLeft = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
};

const ticketFooterRight = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
};

const noticeSentPill = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid #bfdbfe",
  background: "#eff6ff",
  color: "#1d4ed8",
  fontWeight: 950,
  fontSize: 12,
};

const noticePendingPill = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid #e5e7eb",
  background: "#f9fafb",
  color: "#374151",
  fontWeight: 900,
  fontSize: 12,
};

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

const consumptionRow = {
  marginTop: 8,
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
};

const consumptionBadgeApplied = {
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 10px",
  borderRadius: 999,
  border: "1px solid #bbf7d0",
  background: "#ecfdf5",
  color: "#166534",
  fontWeight: 950,
  fontSize: 11,
};

const consumptionBadgeAlready = {
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 10px",
  borderRadius: 999,
  border: "1px solid #bfdbfe",
  background: "#eff6ff",
  color: "#1d4ed8",
  fontWeight: 950,
  fontSize: 11,
};

const consumptionBadgeNeutral = {
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 10px",
  borderRadius: 999,
  border: "1px solid #e5e7eb",
  background: "#f9fafb",
  color: "#374151",
  fontWeight: 950,
  fontSize: 11,
};

const ticketModifiersBlock = {
  marginTop: 10,
  display: "grid",
  gap: 8,
};

const ticketModifiersTitle = {
  fontSize: 11,
  fontWeight: 1000,
  letterSpacing: 0.2,
  color: "#92400e",
  textTransform: "uppercase",
};

const ticketModifierGroups = {
  display: "grid",
  gap: 8,
};

const ticketModifierGroupCard = {
  display: "grid",
  gap: 6,
  padding: "8px 10px",
  borderRadius: 12,
  border: "1px solid #fde68a",
  background: "#fffbeb",
};

const ticketModifierGroupName = {
  fontSize: 11,
  fontWeight: 1000,
  color: "#92400e",
};

const ticketModifiers = {
  display: "flex",
  gap: 6,
  flexWrap: "wrap",
};

const chipModifier = {
  fontSize: 11,
  fontWeight: 900,
  padding: "3px 8px",
  borderRadius: 999,
  border: "1px solid #fcd34d",
  background: "#fff",
  color: "#92400e",
};

const compositeGroupWrap = {
  marginTop: 10,
  border: "1px solid rgba(249, 168, 37, 0.35)",
  borderRadius: 14,
  background: "rgba(255, 247, 237, 0.75)",
  overflow: "hidden",
};

const compositeGroupHeader = {
  padding: "10px 12px",
  borderBottom: "1px solid rgba(249, 168, 37, 0.22)",
  background: "rgba(254, 243, 199, 0.7)",
};

const compositeGroupTitle = {
  fontSize: 12,
  fontWeight: 1000,
  color: "#9a3412",
  textTransform: "uppercase",
  letterSpacing: 0.25,
};

const compositeGroupSub = {
  marginTop: 4,
  fontSize: 11,
  color: "#92400e",
  opacity: 0.8,
};

const compositeGroupBody = {
  padding: "4px 12px 10px",
  display: "grid",
  gap: 8,
};

const compositeChildRow = {
  borderTop: "1px dashed rgba(249, 168, 37, 0.22)",
  paddingTop: 8,
};

const ticketRight = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  alignItems: "flex-end",
  justifyContent: "center",
};

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

const btnNotifyReady = (enabled) => ({
  minWidth: 158,
  padding: "10px 14px",
  borderRadius: 999,
  border: `1px solid ${enabled ? "#f59e0b" : "#e5e7eb"}`,
  background: enabled ? "#fbbf24" : "#f9fafb",
  color: enabled ? "#111827" : "#6b7280",
  cursor: enabled ? "pointer" : "not-allowed",
  fontWeight: 1000,
  opacity: enabled ? 1 : 0.65,
});

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

const msgErr = {
  background: "#ffe5e5",
  border: "1px solid #ffb4b4",
  padding: 10,
  borderRadius: 10,
  marginBottom: 10,
  color: "#7a0010",
  fontWeight: 900,
};

const msgOk = {
  background: "#ecfdf5",
  border: "1px solid #bbf7d0",
  padding: 10,
  borderRadius: 10,
  marginBottom: 10,
  color: "#166534",
  fontWeight: 900,
};