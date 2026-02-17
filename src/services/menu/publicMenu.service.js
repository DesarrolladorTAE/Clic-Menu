// src/services/public/publicMenu.service.js
import axios from "axios";

const apiBase = import.meta.env.VITE_API_BASE_URL || "https://api.clicmenu.com.mx/api";

const publicApi = axios.create({
  baseURL: apiBase,
  headers: { Accept: "application/json" },
  // withCredentials: false, // por default
});

/**
 * Submódulo 3: resolver token -> contexto
 * GET /api/public/menu/{token}/resolve
 */
export async function resolveMenuToken(token) {
  const { data } = await publicApi.get(`/public/menu/${token}/resolve`);
  return data?.data; // { token, restaurant, branch, sales_channel, table, ordering_mode, table_service_mode }
}

/**
 * Submódulo 4: menú final listo para UI
 * GET /api/public/menu/{token}
 */
export async function fetchResolvedMenu(token) {
  const { data } = await publicApi.get(`/public/menu/${token}`);
  return data?.data; // payload completo
}
