//Punto de acceso para menu restaurant
import api from "../api";

export async function getMenuSections(restaurantId, params = {}) {
  const { data } = await api.get(`/restaurants/${restaurantId}/menu-sections`, { params });
  return data?.data ?? [];
}

export async function createMenuSection(restaurantId, payload) {
  const { data } = await api.post(`/restaurants/${restaurantId}/menu-sections`, payload);
  return data?.data;
}

export async function updateMenuSection(restaurantId, sectionId, payload) {
  const { data } = await api.put(`/restaurants/${restaurantId}/menu-sections/${sectionId}`, payload);
  return data?.data;
}

export async function deleteMenuSection(restaurantId, sectionId) {
  const { data } = await api.delete(`/restaurants/${restaurantId}/menu-sections/${sectionId}`);
  return data;
}
