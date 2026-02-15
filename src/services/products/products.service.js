import api from "../api";

export async function getProducts(restaurantId, params = {}) {
  const { data } = await api.get(`/restaurants/${restaurantId}/products`, { params });
  return data?.data ?? [];
}

export async function createProduct(restaurantId, payload) {
  const { data } = await api.post(`/restaurants/${restaurantId}/products`, payload);
  return data?.data;
}

export async function getProduct(restaurantId, productId) {
  const { data } = await api.get(`/restaurants/${restaurantId}/products/${productId}`);
  return data?.data;
}

export async function updateProduct(restaurantId, productId, payload) {
  const { data } = await api.put(`/restaurants/${restaurantId}/products/${productId}`, payload);
  return data?.data;
}

export async function deleteProduct(restaurantId, productId) {
  const { data } = await api.delete(`/restaurants/${restaurantId}/products/${productId}`);
  return data;
}

// ========= IMÁGENES =========
export async function getProductImages(restaurantId, productId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/products/${productId}/images`
  );
  return data?.data ?? [];
}

export async function uploadProductImage(restaurantId, productId, file, sort_order = null) {
  const fd = new FormData();
  fd.append("image", file);
  if (sort_order !== null && sort_order !== undefined) {
    fd.append("sort_order", String(sort_order));
  }

  const { data } = await api.post(
    `/restaurants/${restaurantId}/products/${productId}/images`,
    fd
  );

  return data?.data;
}

export async function deleteProductImage(restaurantId, productId, imageId) {
  const { data } = await api.delete(
    `/restaurants/${restaurantId}/products/${productId}/images/${imageId}`
  );
  return data;
}

export async function reorderProductImages(restaurantId, productId, items) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/products/${productId}/images/reorder`,
    { items }
  );
  return data?.data ?? [];
}
