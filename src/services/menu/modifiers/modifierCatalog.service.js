import api from "../../api";

export async function getModifierCatalog(restaurantId, params = {}) {
  const requestParams = { ...params };

  if (requestParams.branch_id === "" || requestParams.branch_id === null || requestParams.branch_id === undefined) {
    delete requestParams.branch_id;
  }

  const { data } = await api.get(`/restaurants/${restaurantId}/modifier-catalog`, {
    params: requestParams,
  });

  return data ?? {};
}

export async function getCatalogProducts(restaurantId, params = {}) {
  const { data } = await api.get(`/restaurants/${restaurantId}/products`, {
    params: {
      include_inactive: true,
      ...params,
    },
  });

  return data?.data ?? [];
}

export async function getProductVariants(restaurantId, productId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/products/${productId}/variants`
  );

  return Array.isArray(data?.data) ? data.data : [];
}

export async function getProductComponentsCatalog(restaurantId, productId, params = {}) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/products/${productId}/components`,
    { params }
  );

  return data?.data?.items ?? [];
}

export async function getComponentProductVariants(restaurantId, componentProductId) {
  return getProductVariants(restaurantId, componentProductId);
}