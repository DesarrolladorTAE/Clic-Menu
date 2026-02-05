import api from "../../api";

// GET /restaurants/:restaurantId/ingredients/:ingredientId/presentations
export async function getIngredientPresentations(restaurantId, ingredientId, { only_active = false } = {}) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/ingredients/${ingredientId}/presentations`,
    { params: { only_active: only_active ? 1 : 0 } }
  );
  return data; // { ingredient, data: [] }
}

// POST /restaurants/:restaurantId/ingredients/:ingredientId/presentations
export async function createIngredientPresentation(restaurantId, ingredientId, payload) {
  const { data } = await api.post(
    `/restaurants/${restaurantId}/ingredients/${ingredientId}/presentations`,
    payload
  );
  return data;
}

// PUT /restaurants/:restaurantId/ingredients/:ingredientId/presentations/:presentationId
export async function updateIngredientPresentation(restaurantId, ingredientId, presentationId, payload) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/ingredients/${ingredientId}/presentations/${presentationId}`,
    payload
  );
  return data;
}

// DELETE /restaurants/:restaurantId/ingredients/:ingredientId/presentations/:presentationId
export async function deleteIngredientPresentation(restaurantId, ingredientId, presentationId) {
  const { data } = await api.delete(
    `/restaurants/${restaurantId}/ingredients/${ingredientId}/presentations/${presentationId}`
  );
  return data; // { message, mode }
}
