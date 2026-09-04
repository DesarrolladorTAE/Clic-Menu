import systemAdminApi from "../systemAdminApi";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

const restaurantBase = (ownerId, restaurantId) =>
  `/system-admin/owners/${ownerId}/restaurants/${restaurantId}`;

export async function getSystemAddons() {
  const { data } = await systemAdminApi.get("/system-admin/addons", {
    params: { _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });

  return data;
}

export async function getSystemOwnerRestaurantAddons(ownerId, restaurantId) {
  const { data } = await systemAdminApi.get(
    `${restaurantBase(ownerId, restaurantId)}/addons`,
    {
      params: { _t: Date.now() },
      headers: NO_CACHE_HEADERS,
    }
  );

  return data;
}

export async function assignSystemOwnerRestaurantAddon(ownerId, restaurantId, addonId, payload) {
  const { data } = await systemAdminApi.post(
    `${restaurantBase(ownerId, restaurantId)}/addons/${addonId}`,
    payload,
    { headers: NO_CACHE_HEADERS }
  );

  return data;
}