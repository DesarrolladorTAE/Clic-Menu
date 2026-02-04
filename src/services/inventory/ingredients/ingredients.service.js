import api from "../../api";

/**
 * GET /restaurants/{restaurantId}/ingredients?only_active=0&q=
 */
export async function getIngredients(restaurantId, { only_active = false, q = "" } = {}) {
  const { data } = await api.get(`/restaurants/${restaurantId}/ingredients`, {
    params: { only_active: only_active ? 1 : 0, q: q || "" },
  });
  return data; // { data: [] }
}

/**
 * POST /restaurants/{restaurantId}/ingredients
 */
export async function createIngredient(restaurantId, payload) {
  const { data } = await api.post(`/restaurants/${restaurantId}/ingredients`, payload);
  return data; // { message, data }
}

/**
 * GET /restaurants/{restaurantId}/ingredients/{ingredientId}
 */
export async function getIngredient(restaurantId, ingredientId) {
  const { data } = await api.get(`/restaurants/${restaurantId}/ingredients/${ingredientId}`);
  return data; // { data }
}

/**
 * PUT /restaurants/{restaurantId}/ingredients/{ingredientId}
 */
export async function updateIngredient(restaurantId, ingredientId, payload) {
  const { data } = await api.put(`/restaurants/${restaurantId}/ingredients/${ingredientId}`, payload);
  return data; // { message, data }
}

/**
 * DELETE /restaurants/{restaurantId}/ingredients/{ingredientId}
 */
export async function deleteIngredient(restaurantId, ingredientId) {
  const { data } = await api.delete(`/restaurants/${restaurantId}/ingredients/${ingredientId}`);
  return data; // { message }
}
