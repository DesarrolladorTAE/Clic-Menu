import { useCallback, useMemo, useRef, useState } from "react";
import {
  appendPublicOrderItems,
  createPublicOrder,
  getPublicOrder,
} from "../../services/public/publicMenu.service";
import {
  buildCartKey,
  normalizeCompositeComponentsForKey,
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

    if (Array.isArray(it.components) && it.components.length > 0) {
      out.components = normalizeCompositeComponentsForKey(it.components).map((c) => ({
        component_product_id: Number(c.component_product_id),
        variant_id: c.variant_id ? Number(c.variant_id) : null,
        quantity: c.quantity == null ? null : Number(c.quantity),
      }));
    }

    return out;
  });
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

  function upsertCartItem(nextItem) {
    setCart((prev) => {
      const idx = prev.findIndex((x) => x.key === nextItem.key);

      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          quantity: Math.min(99, safeNum(next[idx].quantity, 1) + safeNum(nextItem.quantity, 1)),
          components: nextItem.components ?? next[idx].components ?? [],
          components_detail:
            nextItem.components_detail ?? next[idx].components_detail ?? [],
        };
        return next;
      }

      return [...prev, nextItem];
    });
  }

  function addToCartFromProduct(p, componentsOverride = [], componentsDetailOverride = []) {
    if (String(activeOrder?.status || "") === "paying") return;

    const pid = Number(p?.id);
    if (!pid) return;

    const normalizedComponents = normalizeCompositeComponentsForKey(componentsOverride);
    const key = buildCartKey(pid, null, normalizedComponents);
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
    });
  }

  function addToCartFromVariant(p, v, componentsOverride = [], componentsDetailOverride = []) {
    if (String(activeOrder?.status || "") === "paying") return;

    const pid = Number(p?.id);
    const vid = Number(v?.id);
    if (!pid || !vid) return;

    const normalizedComponents = normalizeCompositeComponentsForKey(componentsOverride);
    const key = buildCartKey(pid, vid, normalizedComponents);
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
        acc +
        safeNum(it.line_total, safeNum(it.unit_price, 0) * safeNum(it.quantity, 1)),
      0,
    );
  }, [oldItems]);

  const totalGlobal = useMemo(() => {
    return Math.round((safeNum(oldTotal, 0) + safeNum(cartTotal, 0)) * 100) / 100;
  }, [oldTotal, cartTotal]);

  const orderUi = activeOrder?.customer_ui || null;

  const hasItems = cart.length > 0;
  const modeOk = String(orderingMode || "").toLowerCase() === "customer_assisted";
  const tableOk = !!hasTable;
  const sessionOk = !!sessionActive;
  const selectableOk = !!canSelect;
  const busyOk = !sessionBusy;
  const unavailableOk = !sessionUnavailable;
  const payingOk = String(activeOrder?.status || "") !== "paying";
  const orderUiOk = orderUi?.can_add_items ?? true;

  const allowBase =
    selectableOk &&
    tableOk &&
    sessionOk &&
    modeOk &&
    hasItems &&
    busyOk &&
    unavailableOk &&
    orderUiOk &&
    payingOk;

  const hasPending =
    !!pendingOrder?.id && String(pendingOrder?.status || "pending") === "pending";

  const canAppend =
    !!activeOrder?.id &&
    ["open", "ready"].includes(String(activeOrder?.status || "").toLowerCase()) &&
    (orderUi?.can_send_items ?? true) &&
    payingOk;

  const allowSendNow = allowBase && !hasPending && (orderUi?.can_send_items ?? true);

  const refreshOrder = useCallback(
    async (orderId) => {
      if (!orderId) return null;

      const res = await getPublicOrder({
        orderId: Number(orderId),
        token: String(token || ""),
      });

      if (res?.ok) {
        const o = res?.data?.order || null;
        const items = Array.isArray(res?.data?.items) ? res.data.items : [];

        setActiveOrder(o ? { ...o } : { id: Number(orderId) });
        setOldItems(items);
        lastOrderIdRef.current = Number(orderId);

        return { order: o, items };
      }

      return null;
    },
    [token],
  );

  const createFirstOrder = useCallback(
    async (name) => {
      const items = normalizeItemsForApi(cart);

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
    },
    [cart, token],
  );

  const appendToOpenOrder = useCallback(
    async (orderId) => {
      const items = normalizeItemsForApi(cart);

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
        setTimeout(() => setSendToast(""), 4500);
      } catch (e) {
        const msg =
          e?.response?.data?.message ||
          e?.response?.data?.error ||
          e?.message ||
          "No se pudo agregar productos.";
        setSendToast(`⚠️ ${msg}`);
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
      setTimeout(() => setSendToast(""), 4500);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "No se pudo crear la comanda.";
      setSendToast(`⚠️ ${msg}`);
      setTimeout(() => setSendToast(""), 6500);
    } finally {
      setSending(false);
    }
  }

  const syncOrderStatusFromSession = useCallback(
    async (sessionOrderStatus) => {
      const st = String(sessionOrderStatus || "").toLowerCase();
      const oid = pendingOrder?.id || activeOrder?.id || lastOrderIdRef.current;
      if (!oid) return;

      if (st.includes("open") || st.includes("ready")) {
        if (pendingOrder?.id) {
          setPendingOrder((p) => (p ? { ...p, status: "accepted" } : p));
        }

        setActiveOrder((prev) => ({
          ...(prev || {}),
          id: Number(oid),
          status: st.includes("ready") ? "ready" : "open",
        }));

        await refreshOrder(oid);
        return;
      }

      if (st.includes("pending")) {
        if (pendingOrder?.id) {
          setPendingOrder((p) => (p ? { ...p, status: "pending" } : p));
        }
        return;
      }

      if (st.includes("rejected")) {
        if (pendingOrder?.id) {
          setPendingOrder((p) => (p ? { ...p, status: "rejected" } : p));
        }
        return;
      }

      if (st.includes("expired")) {
        if (pendingOrder?.id) {
          setPendingOrder((p) => (p ? { ...p, status: "expired" } : p));
        }
      }
    },
    [pendingOrder, activeOrder, refreshOrder],
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
    refreshOrder,
    syncOrderStatusFromSession,

    allowSendNow,
    canAppend,
    submitOrderOrAppend,

    resetOnChannelChange,
  };
}