import api from "../../api";

export async function getBranchDiscountPolicy(restaurantId, branchId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/branches/${branchId}/discount-policy`
  );

  return data;
}

export async function upsertBranchDiscountPolicy(restaurantId, branchId, payload) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/branches/${branchId}/discount-policy`,
    payload
  );

  return data;
}

export async function deleteBranchDiscountPolicy(restaurantId, branchId) {
  const { data } = await api.delete(
    `/restaurants/${restaurantId}/branches/${branchId}/discount-policy`
  );

  return data;
}
