// src/pages/public/hooks/useCartAndOrder.js

import { useMemo, useState } from "react";
import { createPublicOrder } from "../../services/public/publicMenu.service";
import { makeKey, safeNum } from "./publicMenu.utils";

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

  // Modal de envío
  const [sendOpen, setSendOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [sending, setSending] = useState(false);
  const [sendToast, setSendToast] = useState("");

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
          // si vienen componentesOverride, actualiza (para “edición” desde el card)
          ...(Array.isArray(componentsOverride) ? { components: componentsOverride } : {}),
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
          ...(Array.isArray(componentsOverride) ? { components: componentsOverride } : {}),
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
    return cart.reduce((acc, it) => acc + safeNum(it.unit_price, 0) * safeNum(it.quantity, 1), 0);
  }, [cart]);

  const allowOrderSubmit =
    canSelect &&
    hasTable &&
    sessionActive &&
    orderingMode === "customer_assisted" &&
    cart.length > 0 &&
    !sessionBusy &&
    !sessionUnavailable;

  async function submitOrder() {
    if (sending) return;

    const name = String(customerName || "").trim();
    if (!name) {
      setSendToast("⚠️ Escribe tu nombre para enviar la comanda.");
      setTimeout(() => setSendToast(""), 3500);
      return;
    }

    if (!allowOrderSubmit) {
      setSendToast(
        "⚠️ No se puede enviar en este momento (sesión no activa o menú no seleccionable).",
      );
      setTimeout(() => setSendToast(""), 3500);
      return;
    }

    setSending(true);
    setSendToast("");

    try {
      const items = cart.map((it) => {
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

      const res = await createPublicOrder({
        token: String(token || ""),
        customer_name: name,
        items,
      });

      if (res?.ok) {
        setSendToast("✅ Comanda enviada. En espera de aprobación.");
        setCart([]);
        setCustomerName("");
        setSendOpen(false);
        setTimeout(() => setSendToast(""), 4500);
      } else {
        const msg = res?.message || "No se pudo crear la comanda.";
        setSendToast(`⚠️ ${msg}`);
        setTimeout(() => setSendToast(""), 4500);
      }
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "No se pudo crear la comanda.";

      const errs = e?.response?.data?.errors;
      const extra =
        errs && typeof errs === "object"
          ? "\n" +
            Object.entries(errs)
              .slice(0, 5)
              .map(([k, v]) => `• ${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`)
              .join("\n")
          : "";

      setSendToast(`⚠️ ${msg}${extra}`);
      setTimeout(() => setSendToast(""), 6500);
    } finally {
      setSending(false);
    }
  }

  function resetOnChannelChange() {
    setCart([]);
    setSendOpen(false);
    setCustomerName("");
    setSendToast("");
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

    sendOpen,
    setSendOpen,
    customerName,
    setCustomerName,
    sending,
    sendToast,
    setSendToast,
    allowOrderSubmit,
    submitOrder,

    resetOnChannelChange,
  };
}