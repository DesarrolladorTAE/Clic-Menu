// src/services/public/publicMenu.service.js
import axios from "axios";

const apiBase = import.meta.env.VITE_API_BASE_URL || "https://api.clicmenu.com.mx/api";

const publicApi = axios.create({
  baseURL: apiBase,
  headers: { Accept: "application/json" },
});

/**
 * Resolver token -> contexto
 * GET /api/public/menu/{token}/resolve
 */
export async function resolveMenuToken(token) {
  const { data } = await publicApi.get(`/public/menu/${token}/resolve`);
  return data?.data;
}

/**
 * Menú final listo para UI
 * GET /api/public/menu/{token}
 */
export async function fetchResolvedMenu(token) {
  const { data } = await publicApi.get(`/public/menu/${token}`);
  return data?.data;
}

/**
 * Device identifier (persistente por navegador)
 * OJO: esto es lo que activa "solo un usuario a la vez"
 */
export function getOrCreatePublicDeviceId() {
  const KEY = "public_device_identifier_v1";
  let v = "";
  try {
    v = localStorage.getItem(KEY) || "";
  } catch {}

  if (v) return v;

  // uuid simple sin dependencia
  const rnd = () => Math.random().toString(16).slice(2);
  v = `dev_${Date.now().toString(16)}_${rnd()}_${rnd()}`;

  try {
    localStorage.setItem(KEY, v);
  } catch {}

  return v;
}

/**
 * Sesión QR: scan
 * POST /api/public/tables/{table}/scan
 * body: { device_identifier }
 */
export async function scanTable(tableId) {
  const device_identifier = getOrCreatePublicDeviceId();
  const { data } = await publicApi.post(`/public/tables/${tableId}/scan`, { device_identifier });
  return data;
}

/**
 * Sesión QR: show/poll
 * GET /api/public/table-sessions/{session}?device_identifier=...
 */
export async function getTableSession(sessionId) {
  const device_identifier = getOrCreatePublicDeviceId();
  const { data } = await publicApi.get(`/public/table-sessions/${sessionId}`, {
    params: { device_identifier },
  });
  return data;
}

/**
 * Sesión QR: heartbeat (opcional)
 * POST /api/public/table-sessions/{session}/heartbeat
 */
export async function heartbeatTableSession(sessionId) {
  const device_identifier = getOrCreatePublicDeviceId();
  const { data } = await publicApi.post(`/public/table-sessions/${sessionId}/heartbeat`, { device_identifier });
  return data;
}

/**
 * Llamar al mesero (ENDPOINT REAL)
 * POST /api/public/tables/{table}/call-waiter
 * body: { device_identifier }
 */
export async function callWaiterByTable(tableId) {
  const device_identifier = getOrCreatePublicDeviceId();
  const { data } = await publicApi.post(`/public/tables/${tableId}/call-waiter`, { device_identifier });
  return data;
}