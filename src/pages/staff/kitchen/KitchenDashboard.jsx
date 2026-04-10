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

import KitchenTopbar from "../../../components/staff/kitchen/KitchenTopbar";
import KitchenMessages from "../../../components/staff/kitchen/KitchenMessages";
import KitchenEmptyState from "../../../components/staff/kitchen/KitchenEmptyState";
import KitchenOrderCard from "../../../components/staff/kitchen/KitchenOrderCard";
import KitchenWarehouseSelectorDialog from "../../../components/staff/kitchen/KitchenWarehouseSelectorDialog";

import {
  buildConsumptionUi,
  buildKitchenInventoryError,
  grid,
  note,
  recalcOrderDerived,
  wrap,
} from "../../../components/staff/kitchen/kitchen.helpers";

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

  const [warehouseDialogState, setWarehouseDialogState] = useState({
    open: false,
    item: null,
    payload: null,
    loading: false,
  });

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

  const isContextConflict = (eOrRes) => {
    const status = Number(
      eOrRes?.response?.status ||
        eOrRes?.__httpStatus ||
        eOrRes?.status ||
        0
    );

    const message = String(
      eOrRes?.response?.data?.message ||
        eOrRes?.message ||
        ""
    ).toLowerCase();

    if (status !== 409) return false;

    return (
      message.includes("no hay un turno activo") ||
      message.includes("selecciona sucursal") ||
      message.includes("sucursal sin configuración operativa")
    );
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

      if (status === 401) {
        clearStaff();
        nav("/staff/login", { replace: true });
        return false;
      }

      if (isContextConflict(e)) {
        nav("/staff/select-context", { replace: true });
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

        if (status === 401) {
          clearStaff();
          nav("/staff/login", { replace: true });
          return;
        }

        if (isContextConflict(e)) {
          nav("/staff/select-context", { replace: true });
          return;
        }

        setErr(
          e?.response?.data?.message ||
            "No se pudieron cargar las comandas de cocina."
        );
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
        const hasItem =
          Array.isArray(order?.items) &&
          order.items.some((it) => Number(it?.id) === Number(itemId));
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

  const openWarehouseDialog = (item, payload) => {
    setWarehouseDialogState({
      open: true,
      item,
      payload,
      loading: false,
    });
  };

  const closeWarehouseDialog = () => {
    if (warehouseDialogState.loading) return;
    setWarehouseDialogState({
      open: false,
      item: null,
      payload: null,
      loading: false,
    });
  };

  const attemptStartItem = async (item, selectedWarehouseId = null) => {
    const id = item?.id;
    if (!id) return;

    setErr("");
    setOkMsg("");
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
      const res = await startKitchenItem(
        id,
        selectedWarehouseId ? { selected_warehouse_id: selectedWarehouseId } : {}
      );

      if (res?.ok) {
        const consumptionUi = buildConsumptionUi(res);
        setOkMsg(consumptionUi.toast || "Ítem enviado a preparación.");
        setConsumptionBadge(id, consumptionUi.badge || null);

        if (
          warehouseDialogState.open &&
          Number(warehouseDialogState.item?.id) === Number(id)
        ) {
          closeWarehouseDialog();
        }

        return;
      }

      await loadOrders({ silent: true });
      setConsumptionBadge(id, null);

      if (
        res?.code === "WAREHOUSE_SELECTION_REQUIRED_FOR_ITEM" &&
        res?.inventory?.data
      ) {
        openWarehouseDialog(item, res.inventory.data);
        return;
      }

      if (
        res?.code === "INVALID_SELECTED_WAREHOUSE_FOR_ITEM" &&
        res?.inventory?.data
      ) {
        openWarehouseDialog(item, res.inventory.data);
        setErr(
          res?.message ||
            "El almacén seleccionado ya no puede surtir este ítem."
        );
        return;
      }

      if (res?.code === "NO_VALID_WAREHOUSE_FOR_ORDER_ITEM") {
        setErr(
          res?.message ||
            "No hay opciones de almacén para resolver este ítem."
        );
        return;
      }

      setErr(
        buildKitchenInventoryError({
          response: { data: res },
        })
      );
    } catch (e) {
      await loadOrders({ silent: true });
      setConsumptionBadge(id, null);
      setErr(buildKitchenInventoryError(e));
    } finally {
      setItemBusy(id, null);
    }
  };

  const doStart = async (item) => {
    await attemptStartItem(item, null);
  };

  const doStartWithWarehouseSelection = async (selectedWarehouseId) => {
    const item = warehouseDialogState.item;
    if (!item?.id || !selectedWarehouseId) return;

    setWarehouseDialogState((prev) => ({
      ...prev,
      loading: true,
    }));

    try {
      await attemptStartItem(item, selectedWarehouseId);
    } finally {
      setWarehouseDialogState((prev) => ({
        ...prev,
        loading: false,
      }));
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
      setErr(
        e?.response?.data?.message ||
          "No se pudo marcar como listo el ítem."
      );
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
      setErr(
        e?.response?.data?.message ||
          "No se pudo enviar el aviso de pedido listo."
      );
    } finally {
      setNotifyingOrderId(null);
    }
  };

  return (
    <div style={wrap}>
      <KitchenTopbar
        ctx={ctx}
        busy={busy}
        refreshing={refreshing}
        includeReady={includeReady}
        onToggleIncludeReady={() => setIncludeReady((s) => !s)}
        onRefresh={() => loadOrders()}
        onExit={onExit}
      />

      <KitchenMessages err={err} okMsg={okMsg} />

      {busy ? (
        <div style={note}>Cargando…</div>
      ) : !visibleOrders?.length ? (
        <KitchenEmptyState />
      ) : (
        <div style={grid}>
          {visibleOrders.map((o) => (
            <KitchenOrderCard
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

      <KitchenWarehouseSelectorDialog
        open={warehouseDialogState.open}
        payload={warehouseDialogState.payload}
        loading={warehouseDialogState.loading}
        onClose={closeWarehouseDialog}
        onConfirm={doStartWithWarehouseSelection}
      />
    </div>
  );
}