import api from "../../api";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

// GET /restaurants/:restaurantId/branches/:branchId/ticket-settings
export async function getTicketSettings(restaurantId, branchId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/branches/${branchId}/ticket-settings`,
    {
      params: { _t: Date.now() },
      headers: NO_CACHE_HEADERS,
    }
  );

  return data?.data ?? null;
}

// PUT /restaurants/:restaurantId/branches/:branchId/ticket-settings
export async function updateTicketSettings(restaurantId, branchId, payload) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/branches/${branchId}/ticket-settings`,
    payload
  );

  return data?.data ?? null;
}
