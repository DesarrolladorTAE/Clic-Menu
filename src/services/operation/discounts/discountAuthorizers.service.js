import api from "../../api";

export async function getBranchDiscountAuthorizers(restaurantId, branchId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/branches/${branchId}/discount-authorizers`
  );

  return data;
}

export async function getBranchDiscountAuthorizerCandidates(restaurantId, branchId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/branches/${branchId}/discount-authorizers/candidates`
  );

  return data;
}

export async function createBranchDiscountAuthorizer(
  restaurantId,
  branchId,
  payload
) {
  const { data } = await api.post(
    `/restaurants/${restaurantId}/branches/${branchId}/discount-authorizers`,
    payload
  );

  return data;
}

export async function updateBranchDiscountAuthorizer(
  restaurantId,
  branchId,
  authorizerId,
  payload
) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/branches/${branchId}/discount-authorizers/${authorizerId}`,
    payload
  );

  return data;
}

export async function deleteBranchDiscountAuthorizer(
  restaurantId,
  branchId,
  authorizerId
) {
  const { data } = await api.delete(
    `/restaurants/${restaurantId}/branches/${branchId}/discount-authorizers/${authorizerId}`
  );

  return data;
}
