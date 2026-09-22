import api from "../../api";

export async function getPreparedItemSetting(restaurantId, branchId) {
  const response = await api.get(
    `/restaurants/${restaurantId}/branches/${branchId}/prepared-item-setting`
  );

  return response.data;
}

export async function updatePreparedItemSetting(
  restaurantId,
  branchId,
  payload
) {
  const response = await api.put(
    `/restaurants/${restaurantId}/branches/${branchId}/prepared-item-setting`,
    payload
  );

  return response.data;
}

export async function getPreparedProductPolicies(restaurantId, branchId) {
  const response = await api.get(
    `/restaurants/${restaurantId}/branches/${branchId}/prepared-product-policies`
  );

  return response.data;
}

export async function getPreparedProductPolicy(
  restaurantId,
  branchId,
  productId
) {
  const response = await api.get(
    `/restaurants/${restaurantId}/branches/${branchId}/prepared-product-policies/${productId}`
  );

  return response.data;
}

export async function updatePreparedProductPolicy(
  restaurantId,
  branchId,
  productId,
  payload
) {
  const response = await api.put(
    `/restaurants/${restaurantId}/branches/${branchId}/prepared-product-policies/${productId}`,
    payload
  );

  return response.data;
}

export async function deletePreparedProductPolicy(
  restaurantId,
  branchId,
  productId
) {
  const response = await api.delete(
    `/restaurants/${restaurantId}/branches/${branchId}/prepared-product-policies/${productId}`
  );

  return response.data;
}