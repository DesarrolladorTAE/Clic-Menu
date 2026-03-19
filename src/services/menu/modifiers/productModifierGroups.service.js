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

export async function getProductModifierGroups(restaurantId, productId, params = {}) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/products/${productId}/modifier-groups`,
    { params }
  );

  return {
    data: data?.data ?? [],
    branch_id: data?.branch_id ?? null,
    modifiers_mode: data?.modifiers_mode ?? "global",
    message: data?.message ?? "",
  };
}

export async function createProductModifierGroup(restaurantId, productId, payload) {
  const { data } = await api.post(
    `/restaurants/${restaurantId}/products/${productId}/modifier-groups`,
    payload
  );

  return data?.data;
}

export async function updateProductModifierGroup(
  restaurantId,
  productId,
  assignmentId,
  payload
) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/products/${productId}/modifier-groups/${assignmentId}`,
    payload
  );

  return data?.data;
}

export async function deleteProductModifierGroup(restaurantId, productId, assignmentId, params = {}) {
  const { data } = await api.delete(
    `/restaurants/${restaurantId}/products/${productId}/modifier-groups/${assignmentId}`,
    { params }
  );

  return data;
}