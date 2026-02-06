import api from "../../api";

/**
 * GET /api/restaurants/{restaurantId}/products/{productId}/recipes?branch_id=
 */
export async function getProductRecipes(restaurantId, productId, { branch_id = null } = {}) {
  const { data } = await api.get(`/restaurants/${restaurantId}/products/${productId}/recipes`, {
    params: branch_id ? { branch_id } : {},
  });
  return data;
}

/**
 * PUT /api/restaurants/{restaurantId}/products/{productId}/recipes/base
 */
export async function upsertProductRecipeBase(restaurantId, productId, payload) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/products/${productId}/recipes/base`,
    payload
  );
  return data;
}

/**
 * PUT /api/restaurants/{restaurantId}/products/{productId}/recipes/variants/{variantId}
 * Body: { branch_id?, items:[{ingredient_id, qty, notes?, status?}] }
 */
export async function upsertProductRecipeVariant(restaurantId, productId, variantId, payload) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/products/${productId}/recipes/variants/${variantId}`,
    payload
  );
  return data;
}

/**
 * PATCH /api/restaurants/{restaurantId}/products/{productId}/recipes/items/{itemId}/status
 * Body: { status: active|inactive }
 */
export async function setProductRecipeItemStatus(restaurantId, productId, itemId, status) {
  const { data } = await api.patch(
    `/restaurants/${restaurantId}/products/${productId}/recipes/items/${itemId}/status`,
    { status }
  );
  return data;
}
