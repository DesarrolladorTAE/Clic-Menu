// src/services/public/publicMenu.service.js
import axios from "axios";

const apiBase =
  import.meta.env.VITE_API_BASE_URL || "https://api.clicmenu.com.mx/api";

const publicApi = axios.create({
  baseURL: apiBase,
  headers: { Accept: "application/json" },
});

/**
 * =========================================================
 * 1) Device Identifier (persistente)
 * =========================================================
 */
export function getOrCreatePublicDeviceId() {
  const KEY = "public_device_identifier_v1";
  let v = "";
  try {
    v = localStorage.getItem(KEY) || "";
  } catch {}

  if (v) return v;

  const rnd = () => Math.random().toString(16).slice(2);
  v = `dev_${Date.now().toString(16)}_${rnd()}_${rnd()}`;

  try {
    localStorage.setItem(KEY, v);
  } catch {}

  return v;
}

/**
 * =========================================================
 * 2) Menu Resolve / Menu Payload
 * =========================================================
 */
export async function resolveMenuToken(token) {
  const { data } = await publicApi.get(`/public/menu/${token}/resolve`);
  return data?.data;
}

export async function fetchResolvedMenu(token) {
  const { data } = await publicApi.get(`/public/menu/${token}`);
  return data?.data;
}

/**
 * =========================================================
 * 2.5) Preparación rápida
 * =========================================================
 * Consulta las unidades físicas disponibles para el contexto público
 * resuelto por el token. No aparta ni modifica PreparedItems.
 */
export async function fetchPreparedItems(token) {
  const safeToken = encodeURIComponent(String(token || ""));
  const { data } = await publicApi.get(`/public/menu/${safeToken}/prepared-items`);

  return data;
}

/**
 * =========================================================
 * 3) Table Session (scan / poll / heartbeat)
 * =========================================================
 */
export async function scanTable(tableId) {
  const device_identifier = getOrCreatePublicDeviceId();
  const { data } = await publicApi.post(`/public/tables/${tableId}/scan`, {
    device_identifier,
  });
  return data;
}

export async function getTableSession(sessionId) {
  const device_identifier = getOrCreatePublicDeviceId();
  const { data } = await publicApi.get(`/public/table-sessions/${sessionId}`, {
    params: { device_identifier },
  });
  return data;
}

export async function heartbeatTableSession(sessionId) {
  const device_identifier = getOrCreatePublicDeviceId();
  const { data } = await publicApi.post(
    `/public/table-sessions/${sessionId}/heartbeat`,
    { device_identifier },
  );
  return data;
}

/**
 * =========================================================
 * 3.5) Join Request (retomar cuenta)
 * =========================================================
 */
export async function createJoinRequest(tableId) {
  const device_identifier = getOrCreatePublicDeviceId();
  const { data } = await publicApi.post(`/public/tables/${tableId}/join-request`, {
    device_identifier,
  });
  return data;
}

export async function getJoinRequestStatus(tableId) {
  const device_identifier = getOrCreatePublicDeviceId();
  const { data } = await publicApi.get(`/public/tables/${tableId}/join-request/status`, {
    params: { device_identifier },
  });
  return data;
}

/**
 * =========================================================
 * 4) Call Waiter
 * =========================================================
 */
export async function callWaiterByTable(tableId) {
  const device_identifier = getOrCreatePublicDeviceId();
  const { data } = await publicApi.post(`/public/tables/${tableId}/call-waiter`, {
    device_identifier,
  });
  return data;
}

/**
 * =========================================================
 * 5) Orders
 * =========================================================
 */
export async function createPublicOrder({
  token,
  customer_name,
  party_size,
  adult_count,
  child_count,
  items,
}) {
  const device_identifier = getOrCreatePublicDeviceId();

  const payload = {
    token: String(token || ""),
    device_identifier,
    customer_name: String(customer_name || "").slice(0, 120),
    party_size: Number(party_size || 0),
    adult_count: Number(adult_count || 0),
    child_count: Number(child_count || 0),
    items: Array.isArray(items) ? items : [],
  };

  const { data } = await publicApi.post(`/public/orders`, payload);
  return data;
}

export async function getPublicOrder({ orderId, token }) {
  const device_identifier = getOrCreatePublicDeviceId();
  const { data } = await publicApi.get(`/public/orders/${orderId}`, {
    params: {
      token: String(token || ""),
      device_identifier,
    },
  });
  return data;
}

export async function appendPublicOrderItems({ orderId, token, items }) {
  const device_identifier = getOrCreatePublicDeviceId();
  const payload = {
    token: String(token || ""),
    device_identifier,
    items: Array.isArray(items) ? items : [],
  };

  const { data } = await publicApi.post(`/public/orders/${orderId}/append-items`, payload);
  return data;
}

/**
 * =========================================================
 * 5.5) Solicitud de cancelación QR
 * =========================================================
 * Registra una solicitud parcial o total del cliente.
 * token y device_identifier autentican la sesión por query params;
 * el body contiene únicamente la solicitud comercial.
 */
export async function requestOrderCancellation({
  orderId,
  token,
  type,
  items = [],
  reason_code,
  reason_note = null,
}) {
  const device_identifier = getOrCreatePublicDeviceId();
  const normalizedType = String(type || "").trim().toLowerCase();

  const payload = {
    type: normalizedType,
    reason_code: String(reason_code || "").trim(),
    reason_note: String(reason_note || "").trim() || null,
  };

  if (normalizedType === "partial") {
    payload.items = (Array.isArray(items) ? items : []).map((item) => ({
      order_item_id: Number(item?.order_item_id || 0),
      quantity: Number(item?.quantity || 0),
    }));
  }

  const { data } = await publicApi.post(
    `/public/orders/${Number(orderId)}/cancellation-request`,
    payload,
    {
      params: {
        token: String(token || ""),
        device_identifier,
      },
    },
  );

  return data;
}

/**
 * =========================================================
 * 6) Request Bill
 * =========================================================
 */
export async function requestPublicOrderBill({ orderId, token }) {
  const device_identifier = getOrCreatePublicDeviceId();

  const payload = {
    token: String(token || ""),
    device_identifier,
  };

  const { data } = await publicApi.post(`/public/orders/${orderId}/request-bill`, payload);
  return data;
}


export async function sendPublicWhatsapp({ token, items }) {
  const payload = {
    token: String(token || ""),
    items: Array.isArray(items) ? items : [],
  };

  const { data } = await publicApi.post(`/public/web/send-whatsapp`, payload);
  return data;
}

/**
 * =========================================================
 * 8) Pedidos en línea
 * =========================================================
 */
export async function quotePublicOnlineOrder({ token, payload }) {
  const { data } = await publicApi.post(
    `/public/menu/${encodeURIComponent(String(token || ""))}/online-order/quote`,
    payload,
  );

  return data;
}

export async function createPublicOnlineOrder({ token, payload }) {
  const { data } = await publicApi.post(
    `/public/menu/${encodeURIComponent(String(token || ""))}/online-order/orders`,
    payload,
  );

  return data;
}
