import api from "./api";

/**
 * GET /api/restaurants/{restaurant}/variant-attributes/{attribute}/values?only_active=1|0
 */
export async function getVariantAttributeValues(restaurantId, attributeId, params = {}) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/variant-attributes/${attributeId}/values`,
    { params },
  );
  return data; // { attribute, data: [...] }
}

/**
 * POST /api/restaurants/{restaurant}/variant-attributes/{attribute}/values
 * body: { value, sort_order, status }
 */
export async function createVariantAttributeValue(restaurantId, attributeId, payload) {
  const { data } = await api.post(
    `/restaurants/${restaurantId}/variant-attributes/${attributeId}/values`,
    payload,
  );
  return data;
}

/**
 * PUT /api/restaurants/{restaurant}/variant-attributes/{attribute}/values/{valueRow}
 * body: { value?, sort_order?, status? }
 */
export async function updateVariantAttributeValue(restaurantId, attributeId, valueId, payload) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/variant-attributes/${attributeId}/values/${valueId}`,
    payload,
  );
  return data;
}

/**
 * DELETE /api/restaurants/{restaurant}/variant-attributes/{attribute}/values/{valueRow}
 */
export async function deleteVariantAttributeValue(restaurantId, attributeId, valueId) {
  const { data } = await api.delete(
    `/restaurants/${restaurantId}/variant-attributes/${attributeId}/values/${valueId}`,
  );
  return data;
}
