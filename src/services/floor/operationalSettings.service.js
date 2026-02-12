import api from "../api";

/**
 * Endpoints backend:
 * GET  /api/restaurants/:restaurantId/branches/:branchId/operational-settings
 * POST /api/restaurants/:restaurantId/branches/:branchId/operational-settings
 * PUT  /api/restaurants/:restaurantId/branches/:branchId/operational-settings
 */

export async function getOperationalSettings(restaurantId, branchId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/branches/${branchId}/operational-settings`
  );
  return data?.data; // { id, branch_id, ordering_mode, table_service_mode, is_qr_enabled }
}

export async function createOperationalSettings(restaurantId, branchId, payload) {
  const { data } = await api.post(
    `/restaurants/${restaurantId}/branches/${branchId}/operational-settings`,
    payload
  );
  return data?.data;
}

export async function updateOperationalSettings(restaurantId, branchId, payload) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/branches/${branchId}/operational-settings`,
    payload
  );
  return data?.data;
}
