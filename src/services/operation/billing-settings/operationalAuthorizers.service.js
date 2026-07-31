import api from "../../api";

export async function getBranchOperationalAuthorizers(restaurantId, branchId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/branches/${branchId}/operational-authorizers`
  );

  return data;
}

export async function getBranchOperationalAuthorizerCandidates(restaurantId, branchId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/branches/${branchId}/operational-authorizers/candidates`
  );

  return data;
}

export async function createBranchOperationalAuthorizer(
  restaurantId,
  branchId,
  payload
) {
  const { data } = await api.post(
    `/restaurants/${restaurantId}/branches/${branchId}/operational-authorizers`,
    payload
  );

  return data;
}

export async function updateBranchOperationalAuthorizer(
  restaurantId,
  branchId,
  authorizerId,
  payload
) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/branches/${branchId}/operational-authorizers/${authorizerId}`,
    payload
  );

  return data;
}

export async function deleteBranchOperationalAuthorizer(
  restaurantId,
  branchId,
  authorizerId
) {
  const { data } = await api.delete(
    `/restaurants/${restaurantId}/branches/${branchId}/operational-authorizers/${authorizerId}`
  );

  return data;
}
