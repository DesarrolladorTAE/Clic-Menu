// src/services/public/publicMenu.service.js
import axios from "axios";

const apiBase = import.meta.env.VITE_API_BASE_URL || "https://api.clicmenu.com.mx/api";

const publicApi = axios.create({
  baseURL: apiBase,
  headers: { Accept: "application/json" },
});

/**
 * Submódulo 3: resolver token -> contexto
 * GET /api/public/menu/{token}/resolve
 */
export async function resolveMenuToken(token) {
  const { data } = await publicApi.get(`/public/menu/${token}/resolve`);
  return data?.data;
}

/**
 * Submódulo 4: menú final listo para UI
 * GET /api/public/menu/{token}
 */
export async function fetchResolvedMenu(token) {
  const { data } = await publicApi.get(`/public/menu/${token}`);
  return data?.data;
}

/**
 * Submódulo 5: llamar al mesero
 * POST /api/public/menu/{token}/call-waiter
 */
export async function callWaiter(token) {
  const { data } = await publicApi.post(`/public/menu/${token}/call-waiter`, {});
  return data;
}
