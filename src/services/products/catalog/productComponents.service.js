// src/services/productComponents.service.js
import api from "../../api";


export async function getProductComponents(restaurantId, productId, params = {}) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/products/${productId}/components`,
    { params }
  );
  return data;
}

export async function upsertProductComponents(restaurantId, productId, payload) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/products/${productId}/components`,
    payload
  );
  return data;
}

export async function getComponentCandidates(restaurantId, productId, params = {}) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/products/${productId}/components/candidates`,
    { params }
  );
  return data;
}
