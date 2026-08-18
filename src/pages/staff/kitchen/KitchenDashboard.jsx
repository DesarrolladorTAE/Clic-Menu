import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";

import PageContainer from "../../../components/common/PageContainer";
import AppAlert from "../../../components/common/AppAlert";
import PaginationFooter from "../../../components/common/PaginationFooter";
import usePagination from "../../../hooks/usePagination";

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
import KitchenTabs from "../../../components/staff/kitchen/KitchenTabs";
import KitchenEmptyState from "../../../components/staff/kitchen/KitchenEmptyState";
import KitchenOrderCard from "../../../components/staff/kitchen/KitchenOrderCard";
import KitchenWarehouseSelectorDialog from "../../../components/staff/kitchen/KitchenWarehouseSelectorDialog";

import {
  buildConsumptionUi,
  buildKitchenInventoryError,
  recalcOrderDerived,
} from "../../../components/staff/kitchen/kitchen.helpers";

const ITEM_WAREHOUSE_SELECTION_FIELD =
  "selected_warehouse_id";

const PARENT_WAREHOUSE_SELECTION_FIELD =
  "selected_parent_warehouse_id";

const PAGE_SIZE = 2;

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
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [ctx, setCtx] = useState(null);

  const [tab, setTab] = useState("preparing");
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

  const loadOrders = useCallback(async () => {
    setErr("");

    try {
      const res = await fetchKitchenKdsOrders({ include_ready_items: 1 });
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

      setErr(e?.response?.data?.message || "No se pudieron cargar las comandas de cocina.");
    }
  }, [nav, clearStaff]);

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
      await loadOrders();
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
        loadOrders();
      }, 10000);
    };

    startPolling();

    const onVis = () => {
      if (!document.hidden) loadOrders();
    };

    document.addEventListener("visibilitychange", onVis);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [loadOrders]);

  const branchId = Number(ctx?.branch?.id || ctx?.branch_id || 0);

  useEffect(() => {
    if (!branchId) return;

    const channelName = `branch.${branchId}.kitchen`;

    const scheduleRefresh = () => {
      if (wsRefreshFastRef.current) clearTimeout(wsRefreshFastRef.current);
      if (wsRefreshSlowRef.current) clearTimeout(wsRefreshSlowRef.current);

      wsRefreshFastRef.current = setTimeout(() => {
        loadOrders();
      }, 120);

      wsRefreshSlowRef.current = setTimeout(() => {
        loadOrders();
      }, 900);
    };

    const handleKitchenUpdated = (payload = {}) => {
      const eventBranchId = Number(payload?.branch_id || 0);
      if (!eventBranchId || eventBranchId !== branchId) return;

      scheduleRefresh();
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
  }, [branchId, loadOrders]);

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

  const preparingOrders = useMemo(() => {
    return (orders || []).filter((order) => {
      return Number(order?.non_ready_count || 0) > 0;
    });
  }, [orders]);

  const readyOrders = useMemo(() => {
    return (orders || []).filter((order) => {
      const nonReadyCount = Number(order?.non_ready_count || 0);
      const readyUnpickedCount = Number(order?.ready_unpicked_count || 0);
      const readyNoticeSent = !!order?.ready_notice_sent;

      return nonReadyCount === 0 && (readyUnpickedCount > 0 || readyNoticeSent);
    });
  }, [orders]);

  const preparingCount = preparingOrders.length;
  const readyCount = readyOrders.length;

  const preparingPagination = usePagination({
    items: preparingOrders,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  const readyPagination = usePagination({
    items: readyOrders,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  const activePagination = tab === "ready" ? readyPagination : preparingPagination;
  const visibleOrders = activePagination.paginatedItems;

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
        true
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
      await loadOrders();
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
      await loadOrders();
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

      return recalcOrderDerived({ ...order, items: nextItems }, true);
    });

    try {
      await readyKitchenItem(id);
      setOkMsg("Ítem marcado como listo.");
    } catch (e) {
      await loadOrders();
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
        true
      )
    );

    const orderSource = String(order?.source || "").trim().toLowerCase();
    const isCashierDirect = orderSource === "cashier_direct";
    const isOnlineOrder = orderSource === "online_order";
    const sendsReadyToCashier = isCashierDirect || isOnlineOrder;

    try {
      const res = await notifyKitchenOrderReady(orderId);

      setOkMsg(
        res?.message ||
          (res?.data?.already
            ? sendsReadyToCashier
              ? isOnlineOrder
                ? "El aviso del pedido en línea listo ya estaba enviado a caja."
                : "El aviso de orden lista para caja ya estaba enviado."
              : "El aviso de pedido listo ya estaba enviado."
            : sendsReadyToCashier
            ? isOnlineOrder
              ? "Pedido en línea listo avisado a caja."
              : "Orden lista para entregar en caja."
            : "Aviso enviado al mesero.")
      );
    } catch (e) {
      await loadOrders();

      setErr(
        e?.response?.data?.message ||
          (sendsReadyToCashier
            ? isOnlineOrder
              ? "No se pudo avisar a caja que el pedido en línea está listo."
              : "No se pudo enviar el aviso de orden lista a caja."
            : "No se pudo enviar el aviso de pedido listo.")
      );
    } finally {
      setNotifyingOrderId(null);
    }
  };

  return (
    <PageContainer>
      <Stack spacing={2.5}>
        <KitchenTopbar ctx={ctx} busy={busy} onExit={onExit} />

        <KitchenTabs
          tab={tab}
          onChange={setTab}
          preparingCount={preparingCount}
          readyCount={readyCount}
        />

        {busy ? (
          <Box sx={{ minHeight: 260, display: "grid", placeItems: "center" }}>
            <Stack spacing={1.5} alignItems="center">
              <CircularProgress />
              <Typography sx={{ fontSize: 14, color: "text.secondary" }}>Cargando pedidos de Cocina…</Typography>
            </Stack>
          </Box>
        ) : visibleOrders.length === 0 ? (
          <KitchenEmptyState tab={tab} />
        ) : (
          <>
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: {
                  xs: "minmax(0, 1fr)",
                  md: "repeat(2, minmax(0, 1fr))",
                },
                alignItems: "stretch",
              }}
            >
              {visibleOrders.map((order) => (
                <KitchenOrderCard
                  key={order.id}
                  order={order}
                  onStart={doStart}
                  onReady={doReady}
                  onNotifyReady={doNotifyReady}
                  busy={busy}
                  notifying={notifyingOrderId === order.id}
                  busyItemIds={busyItemIds}
                  itemConsumptionState={itemConsumptionState}
                />
              ))}
            </Box>

            <Box
              sx={{
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                bgcolor: "background.paper",
              }}
            >
              <PaginationFooter
                page={activePagination.page}
                totalPages={activePagination.totalPages}
                startItem={activePagination.startItem}
                endItem={activePagination.endItem}
                total={activePagination.total}
                hasPrev={activePagination.hasPrev}
                hasNext={activePagination.hasNext}
                onPrev={activePagination.prevPage}
                onNext={activePagination.nextPage}
                itemLabel="pedidos"
              />
            </Box>
          </>
        )}
      </Stack>

      <KitchenWarehouseSelectorDialog
        open={warehouseDialogState.open}
        payload={warehouseDialogState.payload}
        inventoryContext={warehouseDialogState.inventoryContext}
        selectionField={warehouseDialogState.selectionField}
        initialSelectedWarehouseId={
          warehouseDialogState.selectionField
            ? warehouseDialogState.selections?.[warehouseDialogState.selectionField] || null
            : null
        }
        message={warehouseDialogState.message}
        loading={warehouseDialogState.loading}
        onClose={closeWarehouseDialog}
        onConfirm={doStartWithWarehouseSelection}
      />

      <AppAlert
        open={Boolean(err || okMsg)}
        onClose={(_, reason) => {
          if (reason === "clickaway") return;
          setErr("");
          setOkMsg("");
        }}
        severity={err ? "error" : "success"}
        title={err ? "No se pudo completar" : "Listo"}
        message={err || okMsg}
        autoHideDuration={3000}
      />
    </PageContainer>
  );
}