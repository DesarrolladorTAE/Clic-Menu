import api from "../api";

/**
 * Endpoints backend:
 * GET  /api/restaurants/:restaurantId/branches/:branchId/operational-settings
 * POST /api/restaurants/:restaurantId/branches/:branchId/operational-settings
 * PUT  /api/restaurants/:restaurantId/branches/:branchId/operational-settings
 *
 * Backend ahora responde:
 * { data: {...}, ui: {...}, notices: [...] }
 */

function normalizeOperationalResponse(resData) {
  // Compat: si backend viejo mandara solo {data}, no rompemos.
  const payload = resData || {};
  return {
    data: payload.data ?? payload,
    ui: payload.ui ?? null,
    notices: payload.notices ?? [],
    message: payload.message ?? null,
  };
}

export async function getOperationalSettings(restaurantId, branchId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/branches/${branchId}/operational-settings`
  );

  const norm = normalizeOperationalResponse(data);
  return norm; // { data, ui, notices, message }
}

export async function createOperationalSettings(restaurantId, branchId, payload) {
  const { data } = await api.post(
    `/restaurants/${restaurantId}/branches/${branchId}/operational-settings`,
    payload
  );

  const norm = normalizeOperationalResponse(data);
  return norm;
}

export async function updateOperationalSettings(restaurantId, branchId, payload) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/branches/${branchId}/operational-settings`,
    payload
  );

  const norm = normalizeOperationalResponse(data);
  return norm;
}
