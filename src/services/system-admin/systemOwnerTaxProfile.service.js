import systemAdminApi from "../systemAdminApi";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function getSystemOwnerTaxProfile(ownerId) {
  const { data } = await systemAdminApi.get(
    `/system-admin/owners/${ownerId}/tax-profile`,
    {
      params: { _t: Date.now() },
      headers: NO_CACHE_HEADERS,
    }
  );

  return data;
}

export async function updateSystemOwnerTaxProfile(ownerId, payload) {
  const { data } = await systemAdminApi.put(
    `/system-admin/owners/${ownerId}/tax-profile`,
    payload,
    { headers: NO_CACHE_HEADERS }
  );

  return data;
}