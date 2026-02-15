
import api from "../api";

// Lista canales del restaurante + override (is_active) para esta sucursal
export async function getBranchSalesChannels(restaurantId, branchId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/branches/${branchId}/sales-channels`
  );
  return data;
}

// Activar / desactivar canal en la sucursal
export async function upsertBranchSalesChannel(restaurantId, branchId, salesChannelId, is_active) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/branches/${branchId}/sales-channels/${salesChannelId}`,
    { is_active }
  );
  return data;
}
