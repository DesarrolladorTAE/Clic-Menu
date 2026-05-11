import systemAdminApi from "../systemAdminApi";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function getSystemOwnerRestaurants(ownerId, params = {}) {
  const { data } = await systemAdminApi.get(
    `/system-admin/owners/${ownerId}/restaurants`,
    {
      params: {
        per_page: 5,
        ...params,
        _t: Date.now(),
      },
      headers: NO_CACHE_HEADERS,
    }
  );

  return data;
}

export async function getSystemOwnerRestaurant(ownerId, restaurantId) {
  const { data } = await systemAdminApi.get(
    `/system-admin/owners/${ownerId}/restaurants/${restaurantId}`,
    {
      params: { _t: Date.now() },
      headers: NO_CACHE_HEADERS,
    }
  );

  return data;
}

export async function createSystemOwnerRestaurant(ownerId, payload) {
  const { data } = await systemAdminApi.post(
    `/system-admin/owners/${ownerId}/restaurants`,
    payload,
    { headers: NO_CACHE_HEADERS }
  );

  return data;
}

export async function updateSystemOwnerRestaurant(ownerId, restaurantId, payload) {
  const { data } = await systemAdminApi.put(
    `/system-admin/owners/${ownerId}/restaurants/${restaurantId}`,
    payload,
    { headers: NO_CACHE_HEADERS }
  );

  return data;
}

export async function deleteSystemOwnerRestaurant(ownerId, restaurantId) {
  const { data } = await systemAdminApi.delete(
    `/system-admin/owners/${ownerId}/restaurants/${restaurantId}`,
    { headers: NO_CACHE_HEADERS }
  );

  return data;
}