//src/services/products/variants/variantAttributeValues.service.js
import api from "../../api";

/**
 * GET /api/restaurants/{restaurant}/products/{product}/variant-attributes/{attribute}/values
 * params: { only_active?: boolean }
 */
export async function getVariantAttributeValues(
  restaurantId,
  productId,
  attributeId,
  params = {}
) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/products/${productId}/variant-attributes/${attributeId}/values`,
    { params },
  );

  return data; // { product, attribute, data: [...] }
}

/**
 * POST /api/restaurants/{restaurant}/products/{product}/variant-attributes/{attribute}/values
 * body: { value, sort_order, status }
 */
export async function createVariantAttributeValue(
  restaurantId,
  productId,
  attributeId,
  payload
) {
  const { data } = await api.post(
    `/restaurants/${restaurantId}/products/${productId}/variant-attributes/${attributeId}/values`,
    payload,
  );

  return data;
}

/**
 * PUT /api/restaurants/{restaurant}/products/{product}/variant-attributes/{attribute}/values/{valueRow}
 * body: { value?, sort_order?, status? }
 */
export async function updateVariantAttributeValue(
  restaurantId,
  productId,
  attributeId,
  valueId,
  payload
) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/products/${productId}/variant-attributes/${attributeId}/values/${valueId}`,
    payload,
  );

  return data;
}

/**
 * DELETE /api/restaurants/{restaurant}/products/{product}/variant-attributes/{attribute}/values/{valueRow}
 */
export async function deleteVariantAttributeValue(
  restaurantId,
  productId,
  attributeId,
  valueId
) {
  const { data } = await api.delete(
    `/restaurants/${restaurantId}/products/${productId}/variant-attributes/${attributeId}/values/${valueId}`,
  );

  return data;
}