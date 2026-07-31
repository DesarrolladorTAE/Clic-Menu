import api from "../../api";

export async function getBranchBillingSettings(restaurantId, branchId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/branches/${branchId}/billing-settings`
  );

  return data;
}

export async function updateBranchBillingSettings(restaurantId, branchId, payload) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/branches/${branchId}/billing-settings`,
    payload
  );

  return data;
}