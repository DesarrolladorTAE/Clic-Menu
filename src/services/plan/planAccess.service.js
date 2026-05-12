import api from "../api";

export async function getPlanAccess(restaurantId) {
  const { data } = await api.get(`/restaurants/${restaurantId}/plan-access`);
  return data?.data ?? data;
}