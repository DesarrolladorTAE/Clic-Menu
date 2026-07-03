import systemAdminApi from "../systemAdminApi";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function getSystemOwners(params = {}) {
  const { data } = await systemAdminApi.get("/system-admin/owners", {
    params: {
      per_page: 5,
      ...params,
      _t: Date.now(),
    },
    headers: NO_CACHE_HEADERS,
  });

  return data;
}

export async function createSystemOwner(payload) {
  const { data } = await systemAdminApi.post("/system-admin/owners", payload, {
    headers: NO_CACHE_HEADERS,
  });

  return data;
}

export async function updateSystemOwner(ownerId, payload) {
  const { data } = await systemAdminApi.put(
    `/system-admin/owners/${ownerId}`,
    payload,
    { headers: NO_CACHE_HEADERS }
  );

  return data;
}

export async function dryRunDeleteSystemOwner(ownerId) {
  const { data } = await systemAdminApi.post(
    `/system-admin/owners/${ownerId}/hard-delete-dry-run`,
    {},
    {
      headers: NO_CACHE_HEADERS,
    }
  );

  return data;
}

export async function deleteSystemOwner(ownerId) {
  const { data } = await systemAdminApi.delete(
    `/system-admin/owners/${ownerId}`,
    {
      headers: NO_CACHE_HEADERS,
    }
  );

  return data;
}
