// src/services/branchCatalog.service.js
import api from "../api";

export async function getBranchCatalog(restaurantId, branchId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/branches/${branchId}/catalog`
  );
  return data;
}

export async function upsertProductOverride(restaurantId, branchId, productId, payload) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/branches/${branchId}/products/${productId}/override`,
    payload
  );
  return data;
}

export async function deleteProductOverride(restaurantId, branchId, productId) {
  const { data } = await api.delete(
    `/restaurants/${restaurantId}/branches/${branchId}/products/${productId}/override`
  );
  return data;
}
