// src/services/productVariantGenerator.service.js
import api from "./api";

/**
 * POST /api/restaurants/{restaurant}/products/{product}/variants/generate
 * body: { replace?: boolean, selections: [{attribute_id, value_ids: number[]}] }
 */
export async function generateProductVariants(restaurantId, productId, payload) {
  const { data } = await api.post(
    `/restaurants/${restaurantId}/products/${productId}/variants/generate`,
    payload,
  );
  return data;
}
