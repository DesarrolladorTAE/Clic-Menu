//src/services/products/variants/variantAttributes.service.js
import api from "../../api";

/**
 * GET /api/restaurants/{restaurant}/products/{product}/variant-attributes
 * params: { only_active?: boolean }
 */
export async function getVariantAttributes(restaurantId, productId, params = {}) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/products/${productId}/variant-attributes`,
    { params },
  );

  return data; // { product, data: [...] }
}

/**
 * POST /api/restaurants/{restaurant}/products/{product}/variant-attributes
 * body: { name, status }
 */
export async function createVariantAttribute(restaurantId, productId, payload) {
  const { data } = await api.post(
    `/restaurants/${restaurantId}/products/${productId}/variant-attributes`,
    payload,
  );

  return data;
}

/**
 * PUT /api/restaurants/{restaurant}/products/{product}/variant-attributes/{attribute}
 * body: { name?, status? }
 */
export async function updateVariantAttribute(
  restaurantId,
  productId,
  attributeId,
  payload
) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/products/${productId}/variant-attributes/${attributeId}`,
    payload,
  );

  return data;
}

/**
 * DELETE /api/restaurants/{restaurant}/products/{product}/variant-attributes/{attribute}
 */
export async function deleteVariantAttribute(restaurantId, productId, attributeId) {
  const { data } = await api.delete(
    `/restaurants/${restaurantId}/products/${productId}/variant-attributes/${attributeId}`,
  );

  return data;
}