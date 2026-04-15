import api from "../../api";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

// GET /restaurants/:restaurantId/customer-loyalty-settings
export async function getCustomerLoyaltySettings(restaurantId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/customer-loyalty-settings`,
    {
      params: { _t: Date.now() },
      headers: NO_CACHE_HEADERS,
    }
  );

  return data?.data ?? null;
}

// PUT /restaurants/:restaurantId/customer-loyalty-settings
export async function updateCustomerLoyaltySettings(restaurantId, payload) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/customer-loyalty-settings`,
    payload
  );

  return data?.data ?? null;
}
