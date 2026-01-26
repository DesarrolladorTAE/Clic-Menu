import api from "./api";

export async function getRestaurantSettings(restaurantId) {
  const { data } = await api.get(`/restaurants/${restaurantId}/settings`);
  return data?.data ?? null;
}

export async function upsertRestaurantSettings(restaurantId, payload) {
  const { data } = await api.put(`/restaurants/${restaurantId}/settings`, payload);
  return data?.data ?? null;
}
