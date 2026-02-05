import api from "../../api";

// GET /restaurants/:restaurantId/suppliers
export async function getSuppliers(restaurantId, { only_active = false, q = "" } = {}) {
  const { data } = await api.get(`/restaurants/${restaurantId}/suppliers`, {
    params: { only_active: only_active ? 1 : 0, q: q || "" },
  });
  return data; // { data: [] }
}

export async function createSupplier(restaurantId, payload) {
  const { data } = await api.post(`/restaurants/${restaurantId}/suppliers`, payload);
  return data;
}

export async function updateSupplier(restaurantId, supplierId, payload) {
  const { data } = await api.put(`/restaurants/${restaurantId}/suppliers/${supplierId}`, payload);
  return data;
}

export async function deleteSupplier(restaurantId, supplierId) {
  const { data } = await api.delete(`/restaurants/${restaurantId}/suppliers/${supplierId}`);
  return data;
}
