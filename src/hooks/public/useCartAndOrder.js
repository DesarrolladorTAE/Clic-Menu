import { useCallback, useMemo, useRef, useState } from "react";
import {
  appendPublicOrderItems,
  createPublicOrder,
  getPublicOrder,
} from "../../services/public/publicMenu.service";
import {
  buildAvailabilityErrorMessage,
  buildCartKey,
  extractApiErrorInfo,
  isAvailabilityErrorCode,
  normalizeCompositeComponentsForKey,
  normalizeModifierGroupsForKey,
  safeNum,
} from "./publicMenu.utils";

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

function isActiveOrderStatus(status) {
  return ["open", "ready", "paying", "paid"].includes(String(status || "").toLowerCase());
}

function isPendingLikeStatus(status) {
  return ["pending", "rejected", "expired", "cancelled"].includes(
    String(status || "").toLowerCase(),
  );
}

export function useCartAndOrder({
  token,
  canSelect,
  hasTable,
  sessionActive,
  orderingMode,
  sessionBusy,
  sessionUnavailable,
}) {
  const [cart, setCart] = useState([]);
  const [sendOpen, setSendOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [sending, setSending] = useState(false);
  const [sendToast, setSendToast] = useState("");

  const [pendingOrder, setPendingOrder] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [oldItems, setOldItems] = useState([]);

  const lastOrderIdRef = useRef(null);

  const currentOrderId = useMemo(() => {
    return Number(
      activeOrder?.id || pendingOrder?.id || lastOrderIdRef.current || 0,
    );
  }, [activeOrder?.id, pendingOrder?.id]);

  const reconcileOrderState = useCallback((order) => {
    const o = order ? { ...order } : null;
    const status = String(o?.status || "").toLowerCase();
    const oid = Number(o?.id || 0);

    if (oid) {
      lastOrderIdRef.current = oid;
    }

    if (!o) return;

    if (isActiveOrderStatus(status)) {
      setPendingOrder(null);
      setActiveOrder(o);
      return;
    }

    if (isPendingLikeStatus(status)) {
      setPendingOrder({
        id: oid || null,
        status: status || "pending",
      });

      if (
        status === "pending" ||
        status === "rejected" ||
        status === "expired" ||
        status === "cancelled"
      ) {
        setActiveOrder(null);
      }

      return;
    }

    setActiveOrder(o);
  }, []);

  function upsertCartItem(nextItem) {
    setCart((prev) => {
      const idx = prev.findIndex((x) => x.key === nextItem.key);

      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          quantity: Math.min(
            99,
            safeNum(next[idx].quantity, 1) + safeNum(nextItem.quantity, 1),
          ),
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
    if (String(activeOrder?.status || "").toLowerCase() === "paying") return;

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
    if (String(activeOrder?.status || "").toLowerCase() === "paying") return;

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

  const tableOk = !!hasTable;
  const sessionOk = !!sessionActive;
  const modeOk = String(orderingMode || "") === "customer_assisted";
  const selectableOk = !!canSelect;
  const busyOk = !sessionBusy;
  const unavailableOk = !sessionUnavailable;
  const hasItems = cart.length > 0;

  const orderUi = activeOrder?.customer_ui || {};
  const payingOk = String(activeOrder?.status || "").toLowerCase() !== "paying";

  const canAppend =
    !!activeOrder?.id &&
    ["open", "ready"].includes(String(activeOrder?.status || "").toLowerCase());

  const orderUiOk = canAppend
    ? orderUi?.can_add_items !== false && orderUi?.can_send_items !== false
    : true;

  const hasPending =
    !!pendingOrder?.id &&
    String(pendingOrder?.status || "pending").toLowerCase() === "pending";

  const allowBase =
    tableOk &&
    sessionOk &&
    modeOk &&
    selectableOk &&
    busyOk &&
    unavailableOk &&
    hasItems &&
    orderUiOk &&
    payingOk;

  const allowSendNow = allowBase && (canAppend || !hasPending);

  const refreshOrder = useCallback(
    async (orderId) => {
      const oid = Number(orderId || activeOrder?.id || pendingOrder?.id || lastOrderIdRef.current || 0);
      if (!oid) return null;

      const res = await getPublicOrder({
        orderId: oid,
        token: String(token || ""),
      });

      if (res?.ok) {
        const o = res?.data?.order || null;
        const items = Array.isArray(res?.data?.items) ? res.data.items : [];

        if (o) {
          reconcileOrderState({ ...o });
        } else {
          setActiveOrder((prev) => ({
            ...(prev || {}),
            id: oid,
          }));
        }

        setOldItems(items);
        lastOrderIdRef.current = oid;

        return { order: o, items };
      }

      return null;
    },
    [token, activeOrder?.id, pendingOrder?.id, reconcileOrderState],
  );

  const createFirstOrder = useCallback(
    async (name) => {
      const items = normalizeItemsForApi(cart);

      try {
        const res = await createPublicOrder({
          token: String(token || ""),
          customer_name: name,
          items,
        });

        if (res?.ok) {
          const orderId = res?.data?.order_id || res?.data?.id || res?.order_id || null;

          if (orderId) {
            setPendingOrder({ id: Number(orderId), status: "pending" });
            lastOrderIdRef.current = Number(orderId);
          } else {
            setPendingOrder({ id: null, status: "pending" });
          }

          setCart([]);
          setCustomerName("");
          setSendOpen(false);
          setSendToast("✅ Comanda enviada. En espera de aprobación.");
          return { ok: true, orderId };
        }

        setSendToast(`⚠️ ${res?.message || "No se pudo crear la comanda."}`);
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
          "No se pudo crear la comanda.";

        setSendToast(`⚠️ ${msg}`);
        return { ok: false };
      }
    },
    [cart, token],
  );

  const appendToOpenOrder = useCallback(
    async (orderId) => {
      const items = normalizeItemsForApi(cart);

      try {
        const res = await appendPublicOrderItems({
          orderId: Number(orderId),
          token: String(token || ""),
          items,
        });

        if (res?.ok) {
          setCart([]);
          setSendToast("✅ Productos agregados a la orden.");
          await refreshOrder(orderId);
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
    [cart, token, refreshOrder],
  );

  function buildBlockerMessage() {
    const reasons = [];

    if (!tableOk) reasons.push("mesa no detectada");
    if (!sessionOk) reasons.push("sesión no activa");
    if (!modeOk) reasons.push("modo no permitido");
    if (!selectableOk) reasons.push("menú no seleccionable");
    if (!busyOk) reasons.push("mesa ocupada por otro dispositivo");
    if (!unavailableOk) reasons.push("sesión no disponible");
    if (!hasItems) reasons.push("sin productos");
    if (!orderUiOk) reasons.push("orden bloqueada para agregar");
    if (!payingOk) reasons.push("cuenta en proceso de pago");

    return reasons.length
      ? `⚠️ No se puede enviar en este momento: ${reasons.join(", ")}.`
      : "⚠️ No se puede enviar en este momento.";
  }

  async function submitOrderOrAppend() {
    if (sending) return;

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

    if (!allowBase) {
      setSendToast(buildBlockerMessage());
      setTimeout(() => setSendToast(""), 5000);
      return;
    }

    if (hasPending) {
      setSendToast("⏳ Ya hay una comanda en espera de aprobación. No puedes enviar otra.");
      setTimeout(() => setSendToast(""), 5000);
      return;
    }

    const name = String(customerName || "").trim();
    if (!name) {
      setSendToast("⚠️ Escribe tu nombre para enviar la comanda.");
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

  const applyRealtimeOrderReason = useCallback(
    (reason, orderId) => {
      const rs = String(reason || "").toLowerCase();
      const oid = Number(
        orderId || pendingOrder?.id || activeOrder?.id || lastOrderIdRef.current || 0,
      );
      if (!oid) return;

      lastOrderIdRef.current = oid;

      if (rs === "pending_order_created") {
        setPendingOrder({ id: oid, status: "pending" });
        return;
      }

      if (rs === "pending_order_accepted") {
        setPendingOrder(null);
        setActiveOrder((prev) => ({
          ...(prev || {}),
          id: oid,
          status: "open",
          customer_ui: {
            ...(prev?.customer_ui || {}),
            can_add_items: true,
            can_send_items: true,
            show_payment_message: false,
          },
        }));
        return;
      }

      if (rs === "order_items_appended") {
        setPendingOrder(null);
        setActiveOrder((prev) => ({
          ...(prev || {}),
          id: oid,
          status: ["ready", "paying", "paid"].includes(
            String(prev?.status || "").toLowerCase(),
          )
            ? prev?.status
            : "open",
          customer_ui: {
            ...(prev?.customer_ui || {}),
            can_add_items: true,
            can_send_items: true,
          },
        }));
        return;
      }

      if (rs === "pending_order_rejected") {
        setPendingOrder({ id: oid, status: "rejected" });
        setActiveOrder(null);
        return;
      }

      if (rs === "ready_notice_read") {
        setPendingOrder(null);
        setActiveOrder((prev) => ({
          ...(prev || {}),
          id: oid,
          status: "ready",
          customer_ui: {
            ...(prev?.customer_ui || {}),
            can_add_items: true,
            can_send_items: true,
            show_payment_message: false,
          },
          bill_flow: {
            ...(prev?.bill_flow || {}),
            can_request_bill: true,
          },
        }));
        return;
      }

      if (rs === "bill_requested") {
        setPendingOrder(null);
        setActiveOrder((prev) => ({
          ...(prev || {}),
          id: oid,
          bill_flow: {
            ...(prev?.bill_flow || {}),
            already_sent: true,
            request_status: "sent",
          },
        }));
        return;
      }

      if (rs === "bill_request_read") {
        setPendingOrder(null);
        setActiveOrder((prev) => ({
          ...(prev || {}),
          id: oid,
          bill_flow: {
            ...(prev?.bill_flow || {}),
            already_sent: true,
            request_status: "read",
          },
        }));
        return;
      }

      if (rs === "payment_started") {
        setPendingOrder(null);
        setActiveOrder((prev) => ({
          ...(prev || {}),
          id: oid,
          status: "paying",
          customer_ui: {
            ...(prev?.customer_ui || {}),
            show_payment_message: true,
            can_add_items: false,
            can_send_items: false,
          },
          bill_flow: {
            ...(prev?.bill_flow || {}),
            can_request_bill: false,
          },
        }));
        return;
      }

      if (rs === "order_paid") {
        setPendingOrder(null);
        setActiveOrder((prev) => ({
          ...(prev || {}),
          id: oid,
          status: "paid",
          customer_ui: {
            ...(prev?.customer_ui || {}),
            show_payment_message: false,
            can_add_items: false,
            can_send_items: false,
          },
          bill_flow: {
            ...(prev?.bill_flow || {}),
            can_request_bill: false,
          },
        }));
      }
    },
    [pendingOrder?.id, activeOrder?.id],
  );

  const syncOrderStatusFromSession = useCallback(
    async (sessionOrderStatus) => {
      const st = String(sessionOrderStatus || "").toLowerCase();
      const oid = pendingOrder?.id || activeOrder?.id || lastOrderIdRef.current;
      if (!oid) return;

      if (st.includes("open") || st.includes("ready")) {
        setPendingOrder(null);

        setActiveOrder((prev) => ({
          ...(prev || {}),
          id: Number(oid),
          status: st.includes("ready") ? "ready" : "open",
          customer_ui: {
            ...(prev?.customer_ui || {}),
            can_add_items: true,
            can_send_items: true,
            show_payment_message: false,
          },
        }));

        await refreshOrder(oid);
        return;
      }

      if (st.includes("pending")) {
        setPendingOrder({ id: Number(oid), status: "pending" });
        return;
      }

      if (st.includes("rejected")) {
        setPendingOrder({ id: Number(oid), status: "rejected" });
        setActiveOrder(null);
        return;
      }

      if (st.includes("expired")) {
        setPendingOrder({ id: Number(oid), status: "expired" });
        setActiveOrder(null);
      }
    },
    [pendingOrder?.id, activeOrder?.id, refreshOrder],
  );

  function resetOnChannelChange() {
    setCart([]);
    setSendOpen(false);
    setCustomerName("");
    setSendToast("");
    setPendingOrder(null);
    setActiveOrder(null);
    setOldItems([]);
    lastOrderIdRef.current = null;
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

    pendingOrder,
    activeOrder,
    oldItems,
    currentOrderId,
    refreshOrder,
    syncOrderStatusFromSession,
    applyRealtimeOrderReason,

    allowSendNow,
    canAppend,
    submitOrderOrAppend,

    resetOnChannelChange,
  };
}
