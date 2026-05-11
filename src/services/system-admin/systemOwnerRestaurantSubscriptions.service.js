import systemAdminApi from "../systemAdminApi";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function getSystemRestaurantSubscriptions(ownerId, restaurantId) {
  const { data } = await systemAdminApi.get(
    `/system-admin/owners/${ownerId}/restaurants/${restaurantId}/subscriptions`,
    {
      params: { _t: Date.now() },
      headers: NO_CACHE_HEADERS,
    }
  );

  return data;
}

export async function getSystemRestaurantCurrentSubscription(ownerId, restaurantId) {
  const { data } = await systemAdminApi.get(
    `/system-admin/owners/${ownerId}/restaurants/${restaurantId}/subscriptions/current`,
    {
      params: { _t: Date.now() },
      headers: NO_CACHE_HEADERS,
    }
  );

  return data;
}

export async function createSystemRestaurantSubscription(ownerId, restaurantId, payload) {
  const { data } = await systemAdminApi.post(
    `/system-admin/owners/${ownerId}/restaurants/${restaurantId}/subscriptions`,
    payload,
    { headers: NO_CACHE_HEADERS }
  );

  return data;
}

export async function expireSystemRestaurantCurrentSubscription(ownerId, restaurantId) {
  const { data } = await systemAdminApi.post(
    `/system-admin/owners/${ownerId}/restaurants/${restaurantId}/subscriptions/expire-current`,
    {},
    { headers: NO_CACHE_HEADERS }
  );

  return data;
}

export async function getSystemPlans() {
  const { data } = await systemAdminApi.get("/plans", {
    params: { _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });

  return Array.isArray(data) ? data : data?.data || [];
}