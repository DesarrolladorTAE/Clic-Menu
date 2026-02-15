// src/services/productVariantChannels.service.js
import api from "../../api"; // ajusta si tu cliente se llama diferente

export async function getVariantChannels(restaurantId, productId, variantId, branchId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/products/${productId}/variants/${variantId}/channels`,
    { params: { branch_id: branchId } },
  );
  return data;
}

export async function upsertVariantChannels(restaurantId, productId, variantId, items) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/products/${productId}/variants/${variantId}/channels`,
    { items },
  );
  return data;
}

export async function deleteVariantChannelOverride(restaurantId, productId, variantId, branchSalesChannelId) {
  const { data } = await api.delete(
    `/restaurants/${restaurantId}/products/${productId}/variants/${variantId}/channels/${branchSalesChannelId}`,
  );
  return data;
}
