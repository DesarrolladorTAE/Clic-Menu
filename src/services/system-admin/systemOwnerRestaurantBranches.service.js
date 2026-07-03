import systemAdminApi from "../systemAdminApi";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

const base = (ownerId, restaurantId) =>
  `/system-admin/owners/${ownerId}/restaurants/${restaurantId}/branches`;

export async function getSystemOwnerRestaurantBranches(ownerId, restaurantId, params = {}) {
  const { data } = await systemAdminApi.get(base(ownerId, restaurantId), {
    params: {
      ...params,
      _t: Date.now(),
    },
    headers: NO_CACHE_HEADERS,
  });

  return data;
}

export async function getSystemOwnerRestaurantBranch(ownerId, restaurantId, branchId) {
  const { data } = await systemAdminApi.get(
    `${base(ownerId, restaurantId)}/${branchId}`,
    {
      params: { _t: Date.now() },
      headers: NO_CACHE_HEADERS,
    }
  );

  return data;
}

export async function createSystemOwnerRestaurantBranch(ownerId, restaurantId, payload) {
  const { data } = await systemAdminApi.post(base(ownerId, restaurantId), payload, {
    headers: NO_CACHE_HEADERS,
  });

  return data;
}

export async function updateSystemOwnerRestaurantBranch(ownerId, restaurantId, branchId, payload) {
  const { data } = await systemAdminApi.put(
    `${base(ownerId, restaurantId)}/${branchId}`,
    payload,
    { headers: NO_CACHE_HEADERS }
  );

  return data;
}

export async function dryRunDeleteSystemOwnerRestaurantBranch(
  ownerId,
  restaurantId,
  branchId
) {
  const { data } = await systemAdminApi.post(
    `${base(ownerId, restaurantId)}/${branchId}/hard-delete-dry-run`,
    {},
    { headers: NO_CACHE_HEADERS }
  );

  return data;
}

export async function deleteSystemOwnerRestaurantBranch(ownerId, restaurantId, branchId) {
  const { data } = await systemAdminApi.delete(
    `${base(ownerId, restaurantId)}/${branchId}`,
    { headers: NO_CACHE_HEADERS }
  );

  return data;
}

export async function getSystemOwnerRestaurantBranchLogo(ownerId, restaurantId, branchId) {
  const { data } = await systemAdminApi.get(
    `${base(ownerId, restaurantId)}/${branchId}/logo`,
    {
      params: { _t: Date.now() },
      headers: NO_CACHE_HEADERS,
    }
  );

  return data?.data || null;
}

export async function uploadSystemOwnerRestaurantBranchLogo(
  ownerId,
  restaurantId,
  branchId,
  file
) {
  const formData = new FormData();
  formData.append("image", file);

  const { data } = await systemAdminApi.post(
    `${base(ownerId, restaurantId)}/${branchId}/logo`,
    formData,
    {
      headers: {
        ...NO_CACHE_HEADERS,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data?.data || null;
}

export async function deleteSystemOwnerRestaurantBranchActiveLogo(
  ownerId,
  restaurantId,
  branchId
) {
  const { data } = await systemAdminApi.delete(
    `${base(ownerId, restaurantId)}/${branchId}/logo`,
    { headers: NO_CACHE_HEADERS }
  );

  return data;
}