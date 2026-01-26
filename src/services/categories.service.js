//Punto de acceso para restaurant
import api from "./api";


export async function getCategories(restaurantId, params = {}) {
  const { data } = await api.get(`/restaurants/${restaurantId}/categories`, { params });
  return data?.data ?? [];
}

export async function createCategory(restaurantId, payload) {
  const { data } = await api.post(`/restaurants/${restaurantId}/categories`, payload);
  return data?.data;
}

export async function updateCategory(restaurantId, categoryId, payload) {
  const { data } = await api.put(`/restaurants/${restaurantId}/categories/${categoryId}`, payload);
  return data?.data;
}

export async function deleteCategory(restaurantId, categoryId) {
  const { data } = await api.delete(`/restaurants/${restaurantId}/categories/${categoryId}`);
  return data;
}
