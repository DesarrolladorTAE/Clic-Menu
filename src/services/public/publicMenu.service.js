// src/services/public/publicMenu.service.js
import axios from "axios";

const apiBase = import.meta.env.VITE_API_BASE_URL || "https://api.clicmenu.com.mx/api";

const publicApi = axios.create({
  baseURL: apiBase,
  headers: { Accept: "application/json" },
});

/**
 * =========================================================
 * 1) Device Identifier (persistente por navegador)
 *    - Esto activa “solo un usuario a la vez”
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
  const { data } = await publicApi.post(`/public/tables/${tableId}/scan`, { device_identifier });
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
  const { data } = await publicApi.post(`/public/table-sessions/${sessionId}/heartbeat`, { device_identifier });
  return data;
}

/**
 * =========================================================
 * 4) Call Waiter
 * =========================================================
 */
export async function callWaiterByTable(tableId) {
  const device_identifier = getOrCreatePublicDeviceId();
  const { data } = await publicApi.post(`/public/tables/${tableId}/call-waiter`, { device_identifier });
  return data;
}

/**
 * =========================================================
 * 5) Orders (create)
 *    OJO: por tu routes.php hay riesgo de que quede /public/public/orders,
 *    así que aquí hago fallback automático si da 404.
 * =========================================================
 */
async function postCreateOrder(url, payload) {
  const { data } = await publicApi.post(url, payload);
  return data;
}

export async function createPublicOrder({ token, customer_name, items }) {
  const device_identifier = getOrCreatePublicDeviceId();

  const payload = {
    token,
    device_identifier,
    customer_name,
    items: Array.isArray(items) ? items : [],
  };

  try {
    // Ruta esperada
    return await postCreateOrder(`/public/orders`, payload);
  } catch (e) {
    // Fallback por tu definición: Route::post('/public/orders') dentro de prefix('public')
    if (e?.response?.status === 404) {
      return await postCreateOrder(`/public/public/orders`, payload);
    }
    throw e;
  }
}