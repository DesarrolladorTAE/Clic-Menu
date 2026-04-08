import api from "../../../api";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function getIngredientInventoryMovements(
  restaurantId,
  warehouseId,
  { ingredient_id = "", type = "", reason = "", limit = 50 } = {}
) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/warehouses/${warehouseId}/movements`,
    {
      params: {
        ...(ingredient_id ? { ingredient_id } : {}),
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

export async function createIngredientInventoryMovement(restaurantId, payload) {
  const { data } = await api.post(
    `/restaurants/${restaurantId}/inventory/movements/manual`,
    payload
  );
  return data;
}
