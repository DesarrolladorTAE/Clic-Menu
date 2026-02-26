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
 *   - create (pending_approval)
 *   - show (order + items)  GET /public/orders/{order}?token&device_identifier
 *   - append-items (open)   POST /public/orders/{order}/append-items
 * =========================================================
 */

export async function createPublicOrder({ token, customer_name, items }) {
  const device_identifier = getOrCreatePublicDeviceId();

  const payload = {
    token: String(token || ""),
    device_identifier,
    customer_name: String(customer_name || "").slice(0, 120),
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
  const { data } = await publicApi.post(
    `/public/orders/${orderId}/append-items`,
    payload,
  );
  return data;
}