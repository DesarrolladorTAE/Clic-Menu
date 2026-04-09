import { useCallback, useMemo, useRef, useState } from "react";
import {
  appendWaiterOrderItems,
  createWaiterOrder,
  getCurrentTableOrder,
  getOrderById,
} from "../../services/staff/waiter/staffOrders.service";
import {
  buildAvailabilityErrorMessage,
  buildCartKey,
  extractApiErrorInfo,
  isAvailabilityErrorCode,
  isWarehouseSelectionErrorCode,
  normalizeCompositeComponentsForKey,
  normalizeModifierGroupsForKey,
  safeNum,
} from "../public/publicMenu.utils";

function normalizeItemsForApi(cart) {
  const arr = Array.isArray(cart) ? cart : [];

  return arr.map((it) => {
    const out = {
      product_id: Number(it.product_id),
      variant_id: it.variant_id ? Number(it.variant_id) : null,
      quantity: Number(it.quantity || 1),
      notes: it.notes ? String(it.notes).slice(0, 500) : null,
    };

    const parentModifiers = normalizeModifierGroupsForKey(it?.modifiers || []);
    if (parentModifiers.length > 0) {
      out.modifiers = parentModifiers.map((g) => ({
        ...g,
        options: g.options.map((o) => ({
          modifier_option_id: Number(o.modifier_option_id),
          quantity: Number(o.quantity || 1),
        })),
      }));
    }

    if (Array.isArray(it.components) && it.components.length > 0) {
      out.components = normalizeCompositeComponentsForKey(it.components).map((c) => {
        const componentPayload = {
          component_product_id: Number(c.component_product_id),
          variant_id: c.variant_id ? Number(c.variant_id) : null,
          quantity: c.quantity == null ? null : Number(c.quantity),
        };

        const componentModifiers = normalizeModifierGroupsForKey(c?.modifiers || []);
        if (componentModifiers.length > 0) {
          componentPayload.modifiers = componentModifiers.map((g) => ({
            ...g,
            options: g.options.map((o) => ({
              modifier_option_id: Number(o.modifier_option_id),
              quantity: Number(o.quantity || 1),
            })),
          }));
        }

        return componentPayload;
      });
    }

    return out;
  });
}

export function useStaffCartAndOrder({ tableId }) {
  const [cart, setCart] = useState([]);

  const [sendOpen, setSendOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [sending, setSending] = useState(false);
  const [sendToast, setSendToast] = useState("");

  const [activeOrder, setActiveOrder] = useState(null);
  const [oldItems, setOldItems] = useState([]);

  const [warehouseDialogOpen, setWarehouseDialogOpen] = useState(false);
  const [warehouseSelectionContext, setWarehouseSelectionContext] = useState(null);

  const lastLoadedRef = useRef({ tableId: null, orderId: null });

  function upsertCartItem(nextItem) {
    setCart((prev) => {
      const idx = prev.findIndex((x) => x.key === nextItem.key);

      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          quantity:
            Math.min(99, safeNum(next[idx].quantity, 1) + safeNum(nextItem.quantity, 1)),
          components: nextItem.components ?? next[idx].components ?? [],
          components_detail:
            nextItem.components_detail ?? next[idx].components_detail ?? [],
          modifiers: nextItem.modifiers ?? next[idx].modifiers ?? [],
          modifier_groups_display:
            nextItem.modifier_groups_display ?? next[idx].modifier_groups_display ?? [],
        };
        return next;
      }

      return [...prev, nextItem];
    });
  }

  function addToCartFromProduct(
    p,
    componentsOverride = [],
    componentsDetailOverride = [],
    modifiersOverride = [],
    modifierGroupsDisplayOverride = [],
  ) {
    const pid = Number(p?.id);
    if (!pid) return;

    const normalizedComponents = normalizeCompositeComponentsForKey(componentsOverride);
    const normalizedModifiers = normalizeModifierGroupsForKey(modifiersOverride);
    const key = buildCartKey(pid, null, normalizedComponents, normalizedModifiers);
    const isComposite = String(p?.product_type || "simple") === "composite";

    upsertCartItem({
      key,
      product_id: pid,
      variant_id: null,
      name: p?.display_name || p?.name || "Producto",
      variant_name: null,
      unit_price: safeNum(p?.price, 0),
      quantity: 1,
      notes: "",
      product_type: String(p?.product_type || "simple"),
      components: isComposite ? normalizedComponents : [],
      components_detail: isComposite
        ? Array.isArray(componentsDetailOverride)
          ? componentsDetailOverride
          : []
        : [],
      modifiers: normalizedModifiers,
      modifier_groups_display: Array.isArray(modifierGroupsDisplayOverride)
        ? modifierGroupsDisplayOverride
        : [],
    });
  }

  function addToCartFromVariant(
    p,
    v,
    componentsOverride = [],
    componentsDetailOverride = [],
    modifiersOverride = [],
    modifierGroupsDisplayOverride = [],
  ) {
    const pid = Number(p?.id);
    const vid = Number(v?.id);
    if (!pid || !vid) return;

    const normalizedComponents = normalizeCompositeComponentsForKey(componentsOverride);
    const normalizedModifiers = normalizeModifierGroupsForKey(modifiersOverride);
    const key = buildCartKey(pid, vid, normalizedComponents, normalizedModifiers);
    const isComposite = String(p?.product_type || "simple") === "composite";

    upsertCartItem({
      key,
      product_id: pid,
      variant_id: vid,
      name: p?.display_name || p?.name || "Producto",
      variant_name: v?.name || "Variante",
      unit_price: safeNum(v?.price, safeNum(p?.price, 0)),
      quantity: 1,
      notes: "",
      product_type: String(p?.product_type || "simple"),
      components: isComposite ? normalizedComponents : [],
      components_detail: isComposite
        ? Array.isArray(componentsDetailOverride)
          ? componentsDetailOverride
          : []
        : [],
      modifiers: normalizedModifiers,
      modifier_groups_display: Array.isArray(modifierGroupsDisplayOverride)
        ? modifierGroupsDisplayOverride
        : [],
    });
  }

  function setCartComponents(itemKey, components, componentsDetail = null) {
    const normalized = normalizeCompositeComponentsForKey(components);

    setCart((prev) =>
      prev.map((x) =>
        x.key === itemKey
          ? {
              ...x,
              components: normalized,
              components_detail: Array.isArray(componentsDetail)
                ? componentsDetail
                : x.components_detail || [],
            }
          : x,
      ),
    );
  }

  function removeCartItem(key) {
    setCart((prev) => prev.filter((x) => x.key !== key));
  }

  function setCartQty(key, qty) {
    const qn = Math.max(1, Math.min(99, Number(qty || 1)));
    setCart((prev) => prev.map((x) => (x.key === key ? { ...x, quantity: qn } : x)));
  }

  function setCartNotes(key, notes) {
    setCart((prev) =>
      prev.map((x) => (x.key === key ? { ...x, notes: String(notes || "") } : x)),
    );
  }

  const cartTotal = useMemo(() => {
    return cart.reduce(
      (acc, it) => acc + safeNum(it.unit_price, 0) * safeNum(it.quantity, 1),
      0,
    );
  }, [cart]);

  const oldTotal = useMemo(() => {
    const arr = Array.isArray(oldItems) ? oldItems : [];
    return arr.reduce(
      (acc, it) =>
        acc + safeNum(it.line_total, safeNum(it.unit_price, 0) * safeNum(it.quantity, 1)),
      0,
    );
  }, [oldItems]);

  const totalGlobal = useMemo(() => {
    return Math.round((safeNum(oldTotal, 0) + safeNum(cartTotal, 0)) * 100) / 100;
  }, [oldTotal, cartTotal]);

  const canAppend =
    !!activeOrder?.id &&
    ["open", "ready"].includes(String(activeOrder?.status || "").toLowerCase());

  const closeWarehouseDialog = useCallback(() => {
    if (sending) return;
    setWarehouseDialogOpen(false);
    setWarehouseSelectionContext(null);
  }, [sending]);

  const loadExisting = useCallback(
    async ({ orderId, force = false } = {}) => {
      const tid = Number(tableId || 0);
      if (!tid) return;

      const oIdNum = orderId ? Number(orderId) : null;

      if (
        !force &&
        lastLoadedRef.current.tableId === tid &&
        lastLoadedRef.current.orderId === (oIdNum || null) &&
        (Array.isArray(oldItems) ? oldItems.length : 0) > 0
      ) {
        return {
          order: activeOrder,
          items: oldItems,
          skipped: true,
        };
      }

      lastLoadedRef.current = { tableId: tid, orderId: oIdNum || null };

      let res = null;

      if (oIdNum) {
        try {
          res = await getOrderById(oIdNum);
        } catch {
          res = null;
        }
      }

      if (!res) {
        res = await getCurrentTableOrder(tid);
      }

      if (res?.ok) {
        const o = res?.data?.order || null;
        const items = Array.isArray(res?.data?.items) ? res.data.items : [];
        setActiveOrder(o);
        setOldItems(items);
        return { order: o, items };
      }

      return null;
    },
    [tableId, oldItems, activeOrder],
  );

  const createFirstOrder = useCallback(
    async (name, preferredWarehouseId = null) => {
      const tid = Number(tableId || 0);
      if (!tid) {
        setSendToast("⚠️ Mesa inválida.");
        return { ok: false };
      }

      const items = normalizeItemsForApi(cart);

      try {
        const payload = {
          customer_name: name,
          items,
          ...(preferredWarehouseId ? { preferred_warehouse_id: Number(preferredWarehouseId) } : {}),
        };

        const res = await createWaiterOrder(tid, payload);

        if (res?.ok) {
          const orderId = res?.data?.order_id || res?.data?.id || null;

          setCart([]);
          setCustomerName("");
          setSendOpen(false);
          setWarehouseDialogOpen(false);
          setWarehouseSelectionContext(null);

          if (res?.data?.preferred_warehouse_auto_selected) {
            setSendToast("✅ Comanda creada. El almacén se resolvió automáticamente.");
          } else {
            setSendToast("✅ Comanda creada.");
          }

          if (orderId) {
            await loadExisting({ orderId, force: true });
          } else {
            await loadExisting({ force: true });
          }

          return { ok: true, orderId };
        }

        setSendToast(`⚠️ ${res?.message || "No se pudo crear la comanda."}`);
        return { ok: false };
      } catch (e) {
        const apiError = extractApiErrorInfo(e);

        if (isWarehouseSelectionErrorCode(apiError.code)) {
          setWarehouseSelectionContext(apiError.data || null);
          setWarehouseDialogOpen(true);
          setSendOpen(false);
          setSendToast(`⚠️ ${apiError.message}`);
          return {
            ok: false,
            requiresWarehouseSelection: true,
            data: apiError.data || null,
          };
        }

        if (isAvailabilityErrorCode(apiError.code)) {
          setSendToast(`⚠️ ${buildAvailabilityErrorMessage(apiError)}`);
          return {
            ok: false,
            availabilityError: true,
            data: apiError.data || null,
          };
        }

        const msg =
          apiError?.message ||
          "No se pudo crear la comanda.";

        setSendToast(`⚠️ ${msg}`);
        return { ok: false };
      }
    },
    [tableId, cart, loadExisting],
  );

  const appendToOpenOrder = useCallback(
    async (orderId) => {
      const items = normalizeItemsForApi(cart);

      try {
        const res = await appendWaiterOrderItems(Number(orderId), { items });

        if (res?.ok) {
          setCart([]);
          setSendToast("✅ Productos agregados a la orden.");
          await loadExisting({ orderId, force: true });
          return { ok: true };
        }

        setSendToast(`⚠️ ${res?.message || "No se pudieron agregar productos."}`);
        return { ok: false };
      } catch (e) {
        const apiError = extractApiErrorInfo(e);

        if (isAvailabilityErrorCode(apiError.code)) {
          setSendToast(`⚠️ ${buildAvailabilityErrorMessage(apiError)}`);
          return {
            ok: false,
            availabilityError: true,
            data: apiError.data || null,
          };
        }

        const msg =
          apiError?.message ||
          "No se pudieron agregar productos.";

        setSendToast(`⚠️ ${msg}`);
        return { ok: false };
      }
    },
    [cart, loadExisting],
  );

  const confirmWarehouseSelection = useCallback(
    async (warehouseId) => {
      const name = String(customerName || "").trim();

      if (!name) {
        setSendToast("⚠️ Escribe el nombre del cliente para crear la comanda.");
        return;
      }

      if (!warehouseId) {
        setSendToast("⚠️ Debes seleccionar un almacén.");
        return;
      }

      if (sending) return;

      setSending(true);
      try {
        await createFirstOrder(name, Number(warehouseId));
        setTimeout(() => setSendToast(""), 6500);
      } finally {
        setSending(false);
      }
    },
    [customerName, sending, createFirstOrder],
  );

  async function submitOrderOrAppend() {
    if (sending) return;

    if (cart.length <= 0) {
      setSendToast("⚠️ No hay items seleccionados.");
      setTimeout(() => setSendToast(""), 3000);
      return;
    }

    if (canAppend && activeOrder?.id) {
      setSending(true);
      setSendToast("");
      try {
        await appendToOpenOrder(activeOrder.id);
        setTimeout(() => setSendToast(""), 6500);
      } finally {
        setSending(false);
      }
      return;
    }

    const name = String(customerName || "").trim();
    if (!name) {
      setSendToast("⚠️ Escribe el nombre del cliente para crear la comanda.");
      setTimeout(() => setSendToast(""), 3500);
      return;
    }

    setSending(true);
    setSendToast("");
    try {
      await createFirstOrder(name);
      setTimeout(() => setSendToast(""), 6500);
    } finally {
      setSending(false);
    }
  }

  function resetAll() {
    setCart([]);
    setSendOpen(false);
    setCustomerName("");
    setSendToast("");
    setActiveOrder(null);
    setOldItems([]);
    setWarehouseDialogOpen(false);
    setWarehouseSelectionContext(null);
    lastLoadedRef.current = { tableId: null, orderId: null };
  }

  return {
    cart,
    setCart,
    addToCartFromProduct,
    addToCartFromVariant,
    setCartComponents,
    removeCartItem,
    setCartQty,
    setCartNotes,

    cartTotal,
    oldTotal,
    totalGlobal,

    sendOpen,
    setSendOpen,
    customerName,
    setCustomerName,

    sending,
    sendToast,
    setSendToast,

    activeOrder,
    oldItems,
    canAppend,

    warehouseDialogOpen,
    warehouseSelectionContext,
    closeWarehouseDialog,
    confirmWarehouseSelection,

    loadExisting,
    submitOrderOrAppend,
    resetAll,
  };
}
