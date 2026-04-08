import api from "../../api";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function getPurchases(
  restaurantId,
  { status = "", branch_id = "", supplier_id = "" } = {}
) {
  const { data } = await api.get(`/restaurants/${restaurantId}/purchases`, {
    params: {
      ...(status ? { status } : {}),
      ...(branch_id ? { branch_id } : {}),
      ...(supplier_id ? { supplier_id } : {}),
      _t: Date.now(),
    },
    headers: NO_CACHE_HEADERS,
  });

  return data;
}

export async function getPurchase(restaurantId, purchaseId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/purchases/${purchaseId}`,
    {
      params: { _t: Date.now() },
      headers: NO_CACHE_HEADERS,
    }
  );

  return data;
}

export async function createPurchase(restaurantId, payload) {
  const { data } = await api.post(`/restaurants/${restaurantId}/purchases`, payload);
  return data;
}

export async function updatePurchase(restaurantId, purchaseId, payload) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/purchases/${purchaseId}`,
    payload
  );
  return data;
}

export async function deletePurchase(restaurantId, purchaseId) {
  const { data } = await api.delete(
    `/restaurants/${restaurantId}/purchases/${purchaseId}`
  );
  return data;
}

export async function completePurchase(restaurantId, purchaseId, payload = {}) {
  const { data } = await api.post(
    `/restaurants/${restaurantId}/purchases/${purchaseId}/complete`,
    payload
  );
  return data;
}

/* INGREDIENT ITEMS */
export async function createPurchaseIngredientItem(
  restaurantId,
  purchaseId,
  payload
) {
  const { data } = await api.post(
    `/restaurants/${restaurantId}/purchases/${purchaseId}/items`,
    payload
  );
  return data;
}

export async function updatePurchaseIngredientItem(
  restaurantId,
  purchaseId,
  itemId,
  payload
) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/purchases/${purchaseId}/items/${itemId}`,
    payload
  );
  return data;
}

export async function deletePurchaseIngredientItem(
  restaurantId,
  purchaseId,
  itemId
) {
  const { data } = await api.delete(
    `/restaurants/${restaurantId}/purchases/${purchaseId}/items/${itemId}`
  );
  return data;
}

/* PRODUCT ITEMS */
export async function createPurchaseProductItem(
  restaurantId,
  purchaseId,
  payload
) {
  const { data } = await api.post(
    `/restaurants/${restaurantId}/purchases/${purchaseId}/product-items`,
    payload
  );
  return data;
}

export async function updatePurchaseProductItem(
  restaurantId,
  purchaseId,
  itemId,
  payload
) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/purchases/${purchaseId}/product-items/${itemId}`,
    payload
  );
  return data;
}

export async function deletePurchaseProductItem(
  restaurantId,
  purchaseId,
  itemId
) {
  const { data } = await api.delete(
    `/restaurants/${restaurantId}/purchases/${purchaseId}/product-items/${itemId}`
  );
  return data;
}
