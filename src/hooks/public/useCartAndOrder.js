// src/hooks/public/useCartAndOrder.js
import { useCallback, useMemo, useRef, useState } from "react";
import {
  appendPublicOrderItems,
  createPublicOrder,
  getPublicOrder,
} from "../../services/public/publicMenu.service";
import { makeKey, safeNum } from "./publicMenu.utils";

function normalizeItemsForApi(cart) {
  const arr = Array.isArray(cart) ? cart : [];
  return arr.map((it) => {
    const out = {
      product_id: Number(it.product_id),
      variant_id: it.variant_id ? Number(it.variant_id) : null,
      quantity: Number(it.quantity || 1),
      notes: it.notes ? String(it.notes).slice(0, 500) : null,
    };

    if (Array.isArray(it.components)) {
      out.components = it.components.map((c) => ({
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

  // Modal de envío (solo para primer envío)
  const [sendOpen, setSendOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [sending, setSending] = useState(false);
  const [sendToast, setSendToast] = useState("");

  // ✅ Orden/Comanda
  const [pendingOrder, setPendingOrder] = useState(null); // { id, status: "pending"|"accepted"|"rejected"|"expired" }
  const [activeOrder, setActiveOrder] = useState(null); // { id, status, customer_name, total, ... }
  const [oldItems, setOldItems] = useState([]); // items ya registrados

  const lastOrderIdRef = useRef(null);

  function addToCartFromProduct(p, componentsOverride) {
    const pid = Number(p?.id);
    if (!pid) return;

    const key = makeKey(pid, null);

    setCart((prev) => {
      const idx = prev.findIndex((x) => x.key === key);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          quantity: Math.min(99, safeNum(next[idx].quantity, 1) + 1),
          ...(Array.isArray(componentsOverride)
            ? { components: componentsOverride }
            : {}),
        };
        return next;
      }

      const isComposite = String(p?.product_type || "simple") === "composite";
      const base = {
        key,
        product_id: pid,
        variant_id: null,
        name: p?.display_name || p?.name || "Producto",
        variant_name: null,
        unit_price: safeNum(p?.price, 0),
        quantity: 1,
        notes: "",
        product_type: String(p?.product_type || "simple"),
      };

      if (isComposite) {
        base.components = Array.isArray(componentsOverride) ? componentsOverride : [];
      }

      return [...prev, base];
    });
  }

  function addToCartFromVariant(p, v, componentsOverride) {
    const pid = Number(p?.id);
    const vid = Number(v?.id);
    if (!pid || !vid) return;

    const key = makeKey(pid, vid);

    setCart((prev) => {
      const idx = prev.findIndex((x) => x.key === key);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          quantity: Math.min(99, safeNum(next[idx].quantity, 1) + 1),
          ...(Array.isArray(componentsOverride)
            ? { components: componentsOverride }
            : {}),
        };
        return next;
      }

      const isComposite = String(p?.product_type || "simple") === "composite";
      const base = {
        key,
        product_id: pid,
        variant_id: vid,
        name: p?.display_name || p?.name || "Producto",
        variant_name: v?.name || "Variante",
        unit_price: safeNum(v?.price, safeNum(p?.price, 0)),
        quantity: 1,
        notes: "",
        product_type: String(p?.product_type || "simple"),
      };

      if (isComposite) {
        base.components = Array.isArray(componentsOverride) ? componentsOverride : [];
      }

      return [...prev, base];
    });
  }

  function setCartComponents(itemKey, components) {
    setCart((prev) =>
      prev.map((x) =>
        x.key === itemKey
          ? { ...x, components: Array.isArray(components) ? components : [] }
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
    setCart((prev) => prev.map((x) => (x.key === key ? { ...x, notes: String(notes || "") } : x)));
  }

  const cartTotal = useMemo(() => {
    return cart.reduce(
      (acc, it) => acc + safeNum(it.unit_price, 0) * safeNum(it.quantity, 1),
      0,
    );
  }, [cart]);

  const oldTotal = useMemo(() => {
    const arr = Array.isArray(oldItems) ? oldItems : [];
    return arr.reduce((acc, it) => acc + safeNum(it.line_total, safeNum(it.unit_price, 0) * safeNum(it.quantity, 1)), 0);
  }, [oldItems]);

  // Total global (lo que vas a mostrar arriba)
  const totalGlobal = useMemo(() => {
    return Math.round((safeNum(oldTotal, 0) + safeNum(cartTotal, 0)) * 100) / 100;
  }, [oldTotal, cartTotal]);

  const allowBase =
    canSelect &&
    hasTable &&
    sessionActive &&
    orderingMode === "customer_assisted" &&
    cart.length > 0 &&
    !sessionBusy &&
    !sessionUnavailable;

  const hasPending = !!pendingOrder?.id && String(pendingOrder?.status || "pending") === "pending";
  const canAppend = !!activeOrder?.id && String(activeOrder?.status || "").toLowerCase() === "open";

  // ✅ reglas:
  // - Si hay pending: NO puedes mandar otra (Laravel lo bloquea por sesión/orden).
  // - Si hay open: puedes append.
  const allowSendNow = allowBase && (!hasPending);

  const refreshOrder = useCallback(
    async (orderId) => {
      if (!orderId) return null;
      const res = await getPublicOrder({ orderId: Number(orderId), token: String(token || "") });
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
        // refresca items viejos (lo que ya quedó guardado)
        await refreshOrder(orderId);
        return { ok: true };
      }

      setSendToast(`⚠️ ${res?.message || "No se pudieron agregar productos."}`);
      return { ok: false };
    },
    [cart, token, refreshOrder],
  );

  async function submitOrderOrAppend() {
    if (sending) return;

    if (!allowBase) {
      setSendToast("⚠️ No se puede enviar en este momento (sesión no activa o menú no seleccionable).");
      setTimeout(() => setSendToast(""), 4500);
      return;
    }

    // Si la orden ya está open, esto es APPEND (sin modal nombre)
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

    // Si hay pending, no hay nada que hacer
    if (hasPending) {
      setSendToast("⏳ Ya hay una comanda en espera de aprobación. No puedes enviar otra.");
      setTimeout(() => setSendToast(""), 5000);
      return;
    }

    // Primer envío: requiere nombre (Laravel: customer_name)
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

  /**
   * ✅ Sincroniza estado desde session poll (Laravel)
   * Tu backend puede mandar "pending_approval" / "open" etc.
   * Aquí solo usamos heurística simple:
   * - si detectamos open -> pasamos pending->accepted y cargamos order/items
   * - si detectamos rejected/expired -> marcamos pending accordingly
   */
  const syncOrderStatusFromSession = useCallback(
    async (sessionOrderStatus) => {
      const st = String(sessionOrderStatus || "").toLowerCase();
      const oid = pendingOrder?.id || activeOrder?.id || lastOrderIdRef.current;

      if (!oid) return;

      // accepted/open
      if (st.includes("open")) {
        if (pendingOrder?.id) setPendingOrder((p) => (p ? { ...p, status: "accepted" } : p));
        setActiveOrder((prev) => ({ ...(prev || {}), id: Number(oid), status: "open" }));
        await refreshOrder(oid);
        return;
      }

      // pending
      if (st.includes("pending")) {
        if (pendingOrder?.id) setPendingOrder((p) => (p ? { ...p, status: "pending" } : p));
        return;
      }

      // rejected/expired
      if (st.includes("rejected")) {
        if (pendingOrder?.id) setPendingOrder((p) => (p ? { ...p, status: "rejected" } : p));
        return;
      }
      if (st.includes("expired")) {
        if (pendingOrder?.id) setPendingOrder((p) => (p ? { ...p, status: "expired" } : p));
        return;
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
    // cart
    cart,
    setCart,
    addToCartFromProduct,
    addToCartFromVariant,
    setCartComponents,
    removeCartItem,
    setCartQty,
    setCartNotes,

    // totals
    cartTotal,
    oldTotal,
    totalGlobal,

    // modal
    sendOpen,
    setSendOpen,
    customerName,
    setCustomerName,

    // sending/status
    sending,
    sendToast,
    setSendToast,

    // order state
    pendingOrder,
    activeOrder,
    oldItems,
    refreshOrder,
    syncOrderStatusFromSession,

    // action
    allowSendNow,
    canAppend,
    submitOrderOrAppend,

    resetOnChannelChange,
  };
}