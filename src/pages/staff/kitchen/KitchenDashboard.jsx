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

const ITEM_WAREHOUSE_SELECTION_FIELD =
  "selected_warehouse_id";

const PARENT_WAREHOUSE_SELECTION_FIELD =
  "selected_parent_warehouse_id";

function createEmptyWarehouseSelections() {
  return {
    selected_warehouse_id: null,
    selected_parent_warehouse_id: null,
  };
}

function createClosedWarehouseDialogState() {
  return {
    open: false,
    item: null,
    payload: null,
    inventoryContext: null,
    selectionField: null,
    selections: createEmptyWarehouseSelections(),
    message: "",
    loading: false,
  };
}

function normalizeWarehouseSelections(selections = {}) {
  const selectedWarehouseId = Number(
    selections?.selected_warehouse_id || 0
  );

  const selectedParentWarehouseId = Number(
    selections?.selected_parent_warehouse_id || 0
  );

  return {
    selected_warehouse_id:
      selectedWarehouseId > 0
        ? selectedWarehouseId
        : null,

    selected_parent_warehouse_id:
      selectedParentWarehouseId > 0
        ? selectedParentWarehouseId
        : null,
  };
}

function buildKitchenStartPayload(selections = {}) {
  const normalized =
    normalizeWarehouseSelections(selections);

  const payload = {};

  if (normalized.selected_warehouse_id) {
    payload.selected_warehouse_id =
      normalized.selected_warehouse_id;
  }

  if (normalized.selected_parent_warehouse_id) {
    payload.selected_parent_warehouse_id =
      normalized.selected_parent_warehouse_id;
  }

  return payload;
}

function resolveWarehouseSelectionField(response) {
  const selectionField = String(
    response?.selection_field || ""
  ).trim();

  if (
    selectionField === ITEM_WAREHOUSE_SELECTION_FIELD ||
    selectionField === PARENT_WAREHOUSE_SELECTION_FIELD
  ) {
    return selectionField;
  }

  return String(response?.inventory_context || "") ===
    "composite_parent"
    ? PARENT_WAREHOUSE_SELECTION_FIELD
    : ITEM_WAREHOUSE_SELECTION_FIELD;
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

  const [warehouseDialogState, setWarehouseDialogState] = useState(
    createClosedWarehouseDialogState
  );

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

  const resetWarehouseDialog = () => {
    setWarehouseDialogState(
      createClosedWarehouseDialogState()
    );
  };

  const openWarehouseDialog = (
    item,
    response,
    currentSelections = {}
  ) => {
    const selectionField =
      resolveWarehouseSelectionField(response);

    const inventoryPayload =
      response?.inventory?.data || null;

    setWarehouseDialogState({
      open: true,
      item,
      payload: inventoryPayload,
      inventoryContext:
        response?.inventory_context || null,
      selectionField,
      selections:
        normalizeWarehouseSelections(
          currentSelections
        ),
      message: String(
        response?.message ||
          response?.inventory?.message ||
          ""
      ),
      loading: false,
    });
  };

  const closeWarehouseDialog = () => {
    setWarehouseDialogState((prev) => {
      if (prev.loading) {
        return prev;
      }

      return createClosedWarehouseDialogState();
    });
  };

  const attemptStartItem = async (
    item,
    warehouseSelections = {}
  ) => {
    const id = Number(item?.id || 0);

    if (!id) {
      return;
    }

    const normalizedSelections =
      normalizeWarehouseSelections(
        warehouseSelections
      );

    const requestPayload =
      buildKitchenStartPayload(
        normalizedSelections
      );

    setErr("");
    setOkMsg("");
    setItemBusy(id, "start");

    patchOrderByItemId(id, (order) => {
      const nextItems = (order.items || []).map(
        (it) => {
          if (Number(it?.id) !== id) {
            return it;
          }

          return {
            ...it,
            kitchen_status: "in_progress",
            kitchen_started_at:
              it?.kitchen_started_at ||
              new Date().toISOString(),
          };
        }
      );

      return recalcOrderDerived(
        {
          ...order,
          items: nextItems,
        },
        includeReady
      );
    });

    try {
      const res = await startKitchenItem(
        id,
        requestPayload
      );

      if (res?.ok) {
        const consumptionUi =
          buildConsumptionUi(res);

        setOkMsg(
          consumptionUi.toast ||
            "Ítem enviado a preparación."
        );

        setConsumptionBadge(
          id,
          consumptionUi.badge || null
        );

        /*
        * El proceso completo terminó correctamente.
        * Ya no queda ninguna selección pendiente.
        */
        resetWarehouseDialog();

        return;
      }

      /*
      * La actualización optimista se revierte con los
      * datos autoritativos del backend.
      */
      await loadOrders({ silent: true });
      setConsumptionBadge(id, null);

      const responseCode = String(
        res?.code || ""
      ).trim();

      const requiresWarehouseSelection =
        responseCode ===
          "WAREHOUSE_SELECTION_REQUIRED_FOR_ITEM" ||
        responseCode ===
          "INVALID_SELECTED_WAREHOUSE_FOR_ITEM";

      if (
        requiresWarehouseSelection &&
        res?.inventory?.data
      ) {
        /*
        * Conservamos la selección que ya se había realizado.
        */
        openWarehouseDialog(
          item,
          res,
          normalizedSelections
        );

        if (
          responseCode ===
          "INVALID_SELECTED_WAREHOUSE_FOR_ITEM"
        ) {
          const isParentSelection =
            resolveWarehouseSelectionField(res) ===
            PARENT_WAREHOUSE_SELECTION_FIELD;

          setErr(
            res?.message ||
              (isParentSelection
                ? "El almacén seleccionado ya no puede surtir los modificadores del producto compuesto."
                : "El almacén seleccionado ya no puede surtir este ítem.")
          );
        }

        return;
      }

      if (
        responseCode ===
        "NO_VALID_WAREHOUSE_FOR_ORDER_ITEM"
      ) {
        const isParentInventory =
          String(
            res?.inventory_context || ""
          ) === "composite_parent";

        setErr(
          res?.message ||
            (isParentInventory
              ? "No hay almacenes válidos para consumir los modificadores del producto compuesto."
              : "No hay opciones de almacén para resolver este ítem.")
        );

        return;
      }

      setErr(
        buildKitchenInventoryError({
          response: {
            data: res,
          },
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
    resetWarehouseDialog();

    await attemptStartItem(
      item,
      createEmptyWarehouseSelections()
    );
  };

  const doStartWithWarehouseSelection = async (
    selectedWarehouseId
  ) => {
    const item = warehouseDialogState.item;

    const selectionField =
      warehouseDialogState.selectionField;

    const normalizedWarehouseId = Number(
      selectedWarehouseId || 0
    );

    if (
      !item?.id ||
      normalizedWarehouseId <= 0 ||
      (
        selectionField !==
          ITEM_WAREHOUSE_SELECTION_FIELD &&
        selectionField !==
          PARENT_WAREHOUSE_SELECTION_FIELD
      )
    ) {
      return;
    }

    const nextSelections = {
      ...normalizeWarehouseSelections(
        warehouseDialogState.selections
      ),
      [selectionField]: normalizedWarehouseId,
    };

    setWarehouseDialogState((prev) => ({
      ...prev,
      selections: nextSelections,
      loading: true,
    }));

    try {
      await attemptStartItem(
        item,
        nextSelections
      );
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
      const isCashierDirect = String(order?.source || "") === "cashier_direct";
      setOkMsg(
        res?.message ||
          (res?.data?.already
            ? isCashierDirect
              ? "El aviso de orden lista para caja ya estaba enviado."
              : "El aviso de pedido listo ya estaba enviado."
            : isCashierDirect
            ? "Orden lista para entregar en caja."
            : "Aviso enviado al mesero.")
      );
    } catch (e) {
      await loadOrders({ silent: true });

      const isCashierDirect = String(order?.source || "") === "cashier_direct";

      setErr(
        e?.response?.data?.message ||
          (isCashierDirect
            ? "No se pudo enviar el aviso de orden lista a caja."
            : "No se pudo enviar el aviso de pedido listo.")
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
        inventoryContext={
          warehouseDialogState.inventoryContext
        }
        selectionField={
          warehouseDialogState.selectionField
        }
        initialSelectedWarehouseId={
          warehouseDialogState.selectionField
            ? warehouseDialogState.selections?.[
                warehouseDialogState.selectionField
              ] || null
            : null
        }
        message={warehouseDialogState.message}
        loading={warehouseDialogState.loading}
        onClose={closeWarehouseDialog}
        onConfirm={doStartWithWarehouseSelection}
      />
    </div>
  );
}