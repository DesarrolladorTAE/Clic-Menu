import api from "../api";

// GET /api/restaurants/:restaurantId/branches/:branchId/tables
export async function getTables(restaurantId, branchId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/branches/${branchId}/tables`
  );
  return data?.data || [];
}

// POST /api/restaurants/:restaurantId/branches/:branchId/tables
export async function createTable(restaurantId, branchId, payload) {
  const { data } = await api.post(
    `/restaurants/${restaurantId}/branches/${branchId}/tables`,
    payload
  );
  return data?.data;
}

// PUT /api/restaurants/:restaurantId/branches/:branchId/tables/:tableId
export async function updateTable(restaurantId, branchId, tableId, payload) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/branches/${branchId}/tables/${tableId}`,
    payload
  );
  return data?.data;
}

// DELETE /api/restaurants/:restaurantId/branches/:branchId/tables/:tableId
export async function deleteTable(restaurantId, branchId, tableId) {
  const { data } = await api.delete(
    `/restaurants/${restaurantId}/branches/${branchId}/tables/${tableId}`
  );
  return data;
}
