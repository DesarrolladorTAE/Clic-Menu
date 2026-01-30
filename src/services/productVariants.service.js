// src/services/productVariants.service.js
import api from "./api";

/**
 * GET /api/restaurants/{restaurant}/products/{product}/variants
 */
export async function getProductVariants(restaurantId, productId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/products/${productId}/variants`,
  );
  return data;
}

/**
 * PUT /api/restaurants/{restaurant}/products/{product}/variants/{variant}/toggle
 * body: { is_enabled: boolean }
 */
export async function toggleProductVariant(restaurantId, productId, variantId, isEnabled) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/products/${productId}/variants/${variantId}/toggle`,
    { is_enabled: !!isEnabled },
  );
  return data;
}

/**
 * PUT /api/restaurants/{restaurant}/products/{product}/variants/{variant}/default
 * body: { is_default: boolean }
 */
export async function setDefaultProductVariant(restaurantId, productId, variantId, isDefault) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/products/${productId}/variants/${variantId}/default`,
    { is_default: !!isDefault },
  );
  return data;
}

export async function repairProductVariant(restaurantId, productId, variantId, payload) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/products/${productId}/variants/${variantId}/repair`,
    payload,
  );
  return data;
}

/**
 * DELETE /api/restaurants/{restaurant}/products/{product}/variants/{variant}
 */
export async function deleteProductVariant(restaurantId, productId, variantId) {
  const { data } = await api.delete(
    `/restaurants/${restaurantId}/products/${productId}/variants/${variantId}`,
  );
  return data;
}
