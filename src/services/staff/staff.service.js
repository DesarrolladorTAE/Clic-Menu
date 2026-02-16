import api from "../api";

export async function getStaff(restaurantId) {
  const { data } = await api.get(`/restaurants/${restaurantId}/staff`);
  return data?.data ?? [];
}

export async function createStaff(restaurantId, payload) {
  const { data } = await api.post(`/restaurants/${restaurantId}/staff`, payload);
  return data;
}

export async function updateStaff(restaurantId, userId, payload) {
  const { data } = await api.put(`/restaurants/${restaurantId}/staff/${userId}`, payload);
  return data;
}

export async function deleteStaff(restaurantId, userId) {
  const { data } = await api.delete(`/restaurants/${restaurantId}/staff/${userId}`);
  return data;
}
