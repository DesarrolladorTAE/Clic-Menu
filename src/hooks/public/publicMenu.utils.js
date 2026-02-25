// src/pages/public/publicMenu.utils.js
// Utilidades puras (helpers, traducciones, formato, constants, detección de errores)
// Objetivo: tener TODO lo reutilizable y sin UI aquí para que el page quede limpio.

export const PUBLIC_QR_DISABLED_MSG =
  "Menú digital temporalmente fuera de servicio. Por favor, solicita una carta física";

export const PUBLIC_QR_WRONG_MODE_MSG =
  "Este QR ya no es válido para el modo actual de toma de pedidos. Solicita que generen un QR nuevo.";

export function money(n) {
  const num = Number(n || 0);
  try {
    return num.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
  } catch {
    return `$${num.toFixed(2)}`;
  }
}

export function translateStatus(value) {
  const v = String(value || "").toLowerCase();
  const map = {
    active: "Activo",
    inactive: "Inactivo",
    disabled: "Deshabilitado",
    suspended: "Suspendido",
    deleted: "Eliminado",
    pending: "Pendiente",
  };
  return map[v] || (value ? String(value) : "—");
}

export function translateOrderingMode(value) {
  const v = String(value || "").toLowerCase();
  const map = {
    waiter_only: "Solo mesero",
    customer_assisted: "Cliente asistido",
  };
  return map[v] || (value ? String(value) : "—");
}

export function translateTableServiceMode(value) {
  const v = String(value || "").toLowerCase();
  const map = {
    assigned_waiter: "Mesero asignado",
    free_for_all: "Libre",
  };
  return map[v] || (value ? String(value) : "—");
}

export function isQrDisabledPublicError(e) {
  const status = e?.response?.status;
  if (status !== 403) return false;

  const msg = String(
    e?.response?.data?.message || e?.response?.data?.error || e?.message || "",
  ).toLowerCase();

  return (
    msg.includes("qr desactivado") ||
    msg.includes("no está habilitado") ||
    msg.includes("servicio por qr") ||
    msg.includes("no está habilitado aquí") ||
    msg.includes("desactivado")
  );
}

export function isQrWrongModeError(e) {
  const status = e?.response?.status;
  if (status !== 403) return false;

  const msg = String(
    e?.response?.data?.message || e?.response?.data?.error || e?.message || "",
  ).toLowerCase();

  return (
    msg.includes("qr no válido") ||
    msg.includes("modo actual") ||
    msg.includes("toma de pedidos") ||
    msg.includes("genera un qr nuevo")
  );
}

export function fmtMMSS(totalSeconds) {
  const s = Math.max(0, Number(totalSeconds || 0));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(Math.floor(s % 60)).padStart(2, "0");
  return `${mm}:${ss}`;
}

/**
 * =========================================================
 * Cart helpers (items para backend)
 * =========================================================
 *
 * cartItem shape:
 * {
 *   key: "p:12" | "v:12:55",
 *   product_id,
 *   variant_id: null|number,
 *   name,
 *   variant_name,
 *   unit_price,
 *   quantity,
 *   notes,
 *   product_type,
 *   components: [{ component_product_id, variant_id?, quantity? }]
 * }
 */
export function makeKey(productId, variantId) {
  return variantId ? `v:${productId}:${variantId}` : `p:${productId}`;
}

export function safeNum(v, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

export function safeHash(obj) {
  try {
    const s = JSON.stringify(obj || []);
    return `${s.length}:${s.slice(0, 160)}`;
  } catch {
    return String(Date.now());
  }
}