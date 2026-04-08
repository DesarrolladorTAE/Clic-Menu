import api from "../../../api";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function getProductInventoryMovements(
  restaurantId,
  warehouseId,
  { product_id = "", type = "", reason = "", limit = 50 } = {}
) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/warehouses/${warehouseId}/product-movements`,
    {
      params: {
        ...(product_id ? { product_id } : {}),
        ...(type ? { type } : {}),
        ...(reason ? { reason } : {}),
        limit,
        _t: Date.now(),
      },
      headers: NO_CACHE_HEADERS,
    }
  );

  return data;
}

export async function createProductInventoryMovement(restaurantId, payload) {
  const { data } = await api.post(
    `/restaurants/${restaurantId}/product-movements/manual`,
    payload
  );
  return data;
}
