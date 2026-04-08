import api from "../../../api";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function getProductInventoryStocks(
  restaurantId,
  warehouseId,
  { q = "", category_id = "", status = "", only_positive = false } = {}
) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/warehouses/${warehouseId}/product-stocks`,
    {
      params: {
        ...(q ? { q } : {}),
        ...(category_id ? { category_id } : {}),
        ...(status ? { status } : {}),
        ...(only_positive ? { only_positive: 1 } : {}),
        _t: Date.now(),
      },
      headers: NO_CACHE_HEADERS,
    }
  );

  return data;
}
