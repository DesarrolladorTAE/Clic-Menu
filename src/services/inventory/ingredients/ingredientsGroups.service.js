import api from "../../api";

/**
 * GET /restaurants/{restaurantId}/ingredient-groups?only_active=0&q=
 */
export async function getIngredientGroups(restaurantId, { only_active = false, q = "" } = {}) {
  const { data } = await api.get(`/restaurants/${restaurantId}/ingredient-groups`, {
    params: { only_active: only_active ? 1 : 0, q: q || "" },
  });
  return data; // { data: [] }
}

/**
 * POST /restaurants/{restaurantId}/ingredient-groups
 */
export async function createIngredientGroup(restaurantId, payload) {
  const { data } = await api.post(`/restaurants/${restaurantId}/ingredient-groups`, payload);
  return data; // { message, data }
}

/**
 * PUT /restaurants/{restaurantId}/ingredient-groups/{groupId}
 */
export async function updateIngredientGroup(restaurantId, groupId, payload) {
  const { data } = await api.put(`/restaurants/${restaurantId}/ingredient-groups/${groupId}`, payload);
  return data;
}

/**
 * DELETE /restaurants/{restaurantId}/ingredient-groups/{groupId}
 */
export async function deleteIngredientGroup(restaurantId, groupId) {
  const { data } = await api.delete(`/restaurants/${restaurantId}/ingredient-groups/${groupId}`);
  return data;
}
