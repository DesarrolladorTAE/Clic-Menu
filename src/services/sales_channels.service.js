import api from "./api";

export async function getSalesChannels(restaurantId, params = {}) {
  const { data } = await api.get(`/restaurants/${restaurantId}/sales-channels`, { params });
  return data?.data ?? [];
}

export async function createSalesChannel(restaurantId, payload) {
  const { data } = await api.post(`/restaurants/${restaurantId}/sales-channels`, payload);
  return data?.data;
}

export async function updateSalesChannel(restaurantId, channelId, payload) {
  const { data } = await api.put(`/restaurants/${restaurantId}/sales-channels/${channelId}`, payload);
  return data?.data;
}

export async function deleteSalesChannel(restaurantId, channelId) {
  const { data } = await api.delete(`/restaurants/${restaurantId}/sales-channels/${channelId}`);
  return data;
}

export async function getSalesChannel(restaurantId, channelId) {
  const { data } = await api.get(`/restaurants/${restaurantId}/sales-channels/${channelId}`);
  return data?.data;
}
