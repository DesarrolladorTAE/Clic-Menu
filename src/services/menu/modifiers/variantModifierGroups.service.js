import api from "../../api";

export async function getCatalogProducts(restaurantId, params = {}) {
  const { data } = await api.get(`/restaurants/${restaurantId}/products`, {
    params: {
      include_inactive: true,
      ...params,
    },
  });

  return data?.data ?? [];
}

export async function getProductVariants(restaurantId, productId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/products/${productId}/variants`
  );

  return Array.isArray(data?.data) ? data.data : [];
}

export async function getVariantModifierGroups(
  restaurantId,
  productId,
  variantId,
  params = {}
) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/products/${productId}/variants/${variantId}/modifier-groups`,
    { params }
  );

  return {
    data: data?.data ?? [],
    branch_id: data?.branch_id ?? null,
    modifiers_mode: data?.modifiers_mode ?? "global",
    message: data?.message ?? "",
  };
}

export async function createVariantModifierGroup(
  restaurantId,
  productId,
  variantId,
  payload
) {
  const { data } = await api.post(
    `/restaurants/${restaurantId}/products/${productId}/variants/${variantId}/modifier-groups`,
    payload
  );

  return data?.data;
}

export async function updateVariantModifierGroup(
  restaurantId,
  productId,
  variantId,
  assignmentId,
  payload
) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/products/${productId}/variants/${variantId}/modifier-groups/${assignmentId}`,
    payload
  );

  return data?.data;
}

export async function deleteVariantModifierGroup(
  restaurantId,
  productId,
  variantId,
  assignmentId,
  params = {}
) {
  const { data } = await api.delete(
    `/restaurants/${restaurantId}/products/${productId}/variants/${variantId}/modifier-groups/${assignmentId}`,
    { params }
  );

  return data;
}