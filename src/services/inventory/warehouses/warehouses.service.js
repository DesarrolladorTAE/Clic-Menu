import api from "../../api";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

/**
 * GET /restaurants/{restaurantId}/warehouses
 * Query:
 * - scope=global|branch
 * - branch_id=
 * - status=active|inactive
 */
export async function getWarehouses(
  restaurantId,
  { scope, branch_id, status } = {}
) {
  const { data } = await api.get(`/restaurants/${restaurantId}/warehouses`, {
    params: {
      ...(scope ? { scope } : {}),
      ...(branch_id ? { branch_id } : {}),
      ...(status ? { status } : {}),
      _t: Date.now(),
    },
    headers: NO_CACHE_HEADERS,
  });

  return data;
}

/**
 * POST /restaurants/{restaurantId}/warehouses
 */
export async function createWarehouse(restaurantId, payload) {
  const { data } = await api.post(
    `/restaurants/${restaurantId}/warehouses`,
    payload
  );
  return data;
}

/**
 * PUT /restaurants/{restaurantId}/warehouses/{warehouseId}
 */
export async function updateWarehouse(restaurantId, warehouseId, payload) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/warehouses/${warehouseId}`,
    payload
  );
  return data;
}

/**
 * POST /restaurants/{restaurantId}/warehouses/ensure-defaults
 */
export async function ensureDefaultWarehouses(restaurantId) {
  const { data } = await api.post(
    `/restaurants/${restaurantId}/warehouses/ensure-defaults`,
    {}
  );
  return data;
}

/**
 * GET /restaurants/{restaurantId}/warehouses/effective?branch_id=
 */
export async function getEffectiveWarehouse(
  restaurantId,
  { branch_id } = {}
) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/warehouses/effective`,
    {
      params: {
        ...(branch_id ? { branch_id } : {}),
        _t: Date.now(),
      },
      headers: NO_CACHE_HEADERS,
    }
  );

  return data;
}
