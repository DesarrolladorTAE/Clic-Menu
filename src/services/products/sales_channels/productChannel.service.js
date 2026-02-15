import api from "../../api";

// Lista de productos configurables para este canal en esta sucursal
export async function getChannelProducts(restaurantId, branchId, salesChannelId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/branches/${branchId}/sales-channels/${salesChannelId}/products`
  );
  return data;
}

// Upsert config por producto en canal
export async function upsertChannelProduct(restaurantId, branchId, salesChannelId, productId, payload) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/branches/${branchId}/sales-channels/${salesChannelId}/products/${productId}`,
    payload
  );
  return data;
}

// Borrar config (opcional) -> vuelve a default (no se vende)
export async function deleteChannelProduct(restaurantId, branchId, salesChannelId, productId) {
  const { data } = await api.delete(
    `/restaurants/${restaurantId}/branches/${branchId}/sales-channels/${salesChannelId}/products/${productId}`
  );
  return data;
}
