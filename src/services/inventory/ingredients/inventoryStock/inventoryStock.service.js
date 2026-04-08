import api from "../../../api";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function getIngredientInventoryStocks(
  restaurantId,
  warehouseId,
  { q = "", ingredient_group_id = "", only_positive = false } = {}
) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/warehouses/${warehouseId}/stocks`,
    {
      params: {
        ...(q ? { q } : {}),
        ...(ingredient_group_id ? { ingredient_group_id } : {}),
        ...(only_positive ? { only_positive: 1 } : {}),
        _t: Date.now(),
      },
      headers: NO_CACHE_HEADERS,
    }
  );

  return data;
}