import api from "../api";

// GET /api/restaurants/:restaurantId/branches/:branchId/zones
export async function getZones(restaurantId, branchId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/branches/${branchId}/zones`
  );
  return data?.data || [];
}

// POST /api/restaurants/:restaurantId/branches/:branchId/zones
export async function createZone(restaurantId, branchId, payload) {
  const { data } = await api.post(
    `/restaurants/${restaurantId}/branches/${branchId}/zones`,
    payload
  );
  return data?.data;
}

// PUT /api/restaurants/:restaurantId/branches/:branchId/zones/:zoneId
export async function updateZone(restaurantId, branchId, zoneId, payload) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/branches/${branchId}/zones/${zoneId}`,
    payload
  );
  return data?.data;
}

// PUT /api/restaurants/:restaurantId/branches/:branchId/zones/:zoneId/assign-waiter
export async function assignZoneWaiter(restaurantId, branchId, zoneId, assigned_waiter_id) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/branches/${branchId}/zones/${zoneId}/assign-waiter`,
    { assigned_waiter_id }
  );
  return data?.data;
}

// DELETE /api/restaurants/:restaurantId/branches/:branchId/zones/:zoneId
export async function deleteZone(restaurantId, branchId, zoneId) {
  const { data } = await api.delete(
    `/restaurants/${restaurantId}/branches/${branchId}/zones/${zoneId}`
  );
  return data;
}