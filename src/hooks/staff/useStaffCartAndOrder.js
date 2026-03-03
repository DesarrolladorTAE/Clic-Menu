// src/hooks/staff/useStaffCartAndOrder.js
import { useCallback, useMemo, useRef, useState } from "react";
import {
  appendWaiterOrderItems,
  createWaiterOrder,
  getCurrentTableOrder,
  getOrderById,
} from "../../services/staff/waiter/staffOrders.service";
import { makeKey, safeNum } from "../public/publicMenu.utils";

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

export function useStaffCartAndOrder({ tableId }) {
  const [cart, setCart] = useState([]);

  // modal nombre
  const [sendOpen, setSendOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [sending, setSending] = useState(false);
  const [sendToast, setSendToast] = useState("");

  // orden
  const [activeOrder, setActiveOrder] = useState(null); // { id, status, customer_name }
  const [oldItems, setOldItems] = useState([]);

  const lastLoadedRef = useRef({ tableId: null, orderId: null });

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

      if (isComposite) base.components = Array.isArray(componentsOverride)
        ? componentsOverride
        : [];
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

      if (isComposite) base.components = Array.isArray(componentsOverride)
        ? componentsOverride
        : [];
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
    !!activeOrder?.id && String(activeOrder?.status || "").toLowerCase() === "open";

  const loadExisting = useCallback(
    async ({ orderId } = {}) => {
      const tid = Number(tableId || 0);
      if (!tid) return;

      const oIdNum = orderId ? Number(orderId) : null;

      if (
        lastLoadedRef.current.tableId === tid &&
        lastLoadedRef.current.orderId === (oIdNum || null) &&
        (Array.isArray(oldItems) ? oldItems.length : 0) > 0
      ) {
        return;
      }

      lastLoadedRef.current = { tableId: tid, orderId: oIdNum || null };

      let res = null;

      // Si viene orderId, intentamos por ID, mas si falla, caemos a current-order por mesa.
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
    },
    [tableId, oldItems],
  );

  const createFirstOrder = useCallback(
    async (name) => {
      const tid = Number(tableId || 0);
      if (!tid) {
        setSendToast("⚠️ Mesa inválida.");
        return { ok: false };
      }

      const items = normalizeItemsForApi(cart);
      const res = await createWaiterOrder(tid, {
        customer_name: name,
        items,
      });

      if (res?.ok) {
        const orderId = res?.data?.order_id || res?.data?.id || null;
        setCart([]);
        setCustomerName("");
        setSendOpen(false);
        setSendToast("✅ Comanda creada.");

        if (orderId) await loadExisting({ orderId });
        else await loadExisting({});

        return { ok: true, orderId };
      }

      setSendToast(`⚠️ ${res?.message || "No se pudo crear la comanda."}`);
      return { ok: false };
    },
    [tableId, cart, loadExisting],
  );

  const appendToOpenOrder = useCallback(
    async (orderId) => {
      const items = normalizeItemsForApi(cart);
      const res = await appendWaiterOrderItems(Number(orderId), { items });

      if (res?.ok) {
        setCart([]);
        setSendToast("✅ Productos agregados a la orden.");
        await loadExisting({ orderId });
        return { ok: true };
      }

      setSendToast(`⚠️ ${res?.message || "No se pudieron agregar productos."}`);
      return { ok: false };
    },
    [cart, loadExisting],
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

  function resetAll() {
    setCart([]);
    setSendOpen(false);
    setCustomerName("");
    setSendToast("");
    setActiveOrder(null);
    setOldItems([]);
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

    loadExisting,
    submitOrderOrAppend,
    resetAll,
  };
}