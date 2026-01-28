import api from "./api";

// GET /api/restaurants/{restaurant}/sales-channels
export async function getSalesChannels(restaurantId) {
  const { data } = await api.get(`/restaurants/${restaurantId}/sales-channels`);
  return data;
}

// POST /api/restaurants/{restaurant}/sales-channels
export async function createSalesChannel(restaurantId, payload) {
  const { data } = await api.post(`/restaurants/${restaurantId}/sales-channels`, payload);
  return data;
}

// PUT /api/restaurants/{restaurant}/sales-channels/{salesChannel}
export async function updateSalesChannel(restaurantId, salesChannelId, payload) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/sales-channels/${salesChannelId}`,
    payload
  );
  return data;
}

// DELETE /api/restaurants/{restaurant}/sales-channels/{salesChannel}
export async function deleteSalesChannel(restaurantId, salesChannelId) {
  const { data } = await api.delete(
    `/restaurants/${restaurantId}/sales-channels/${salesChannelId}`
  );
  return data;
}
