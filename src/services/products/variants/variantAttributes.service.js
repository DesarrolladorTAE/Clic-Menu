import api from "../../api";

/**
 * GET /api/restaurants/{restaurant}/variant-attributes?only_active=1|0
 */
export async function getVariantAttributes(restaurantId, params = {}) {
  const { data } = await api.get(`/restaurants/${restaurantId}/variant-attributes`, {
    params,
  });
  return data; // { data: [...] }
}

/**
 * POST /api/restaurants/{restaurant}/variant-attributes
 * body: { name, status }
 */
export async function createVariantAttribute(restaurantId, payload) {
  const { data } = await api.post(`/restaurants/${restaurantId}/variant-attributes`, payload);
  return data;
}

/**
 * PUT /api/restaurants/{restaurant}/variant-attributes/{attribute}
 * body: { name?, status? }
 */
export async function updateVariantAttribute(restaurantId, attributeId, payload) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/variant-attributes/${attributeId}`,
    payload,
  );
  return data;
}

/**
 * DELETE /api/restaurants/{restaurant}/variant-attributes/{attribute}
 */
export async function deleteVariantAttribute(restaurantId, attributeId) {
  const { data } = await api.delete(`/restaurants/${restaurantId}/variant-attributes/${attributeId}`);
  return data;
}
