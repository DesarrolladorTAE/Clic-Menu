import api from "../api";

export async function getRestaurantAddons(restaurantId) {
  const { data } = await api.get(`/restaurants/${restaurantId}/addons`);
  return data;
}

export async function getRestaurantAddonCatalog(restaurantId) {
  const { data } = await api.get(`/restaurants/${restaurantId}/addons/catalog`);
  return data;
}

export async function getRestaurantAddonHistory(restaurantId, params = {}) {
  const { data } = await api.get(`/restaurants/${restaurantId}/addons/history`, { params });
  return data;
}