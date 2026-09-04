import systemAdminApi from "../systemAdminApi";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

const salesBase = "/system-admin/addon-sales";

export async function getSystemAddonSalesMonthly(params = {}) {
  const { data } = await systemAdminApi.get(`${salesBase}/monthly`, {
    params: { ...params, _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });

  return data;
}

export async function getSystemAddonSalesSummary(params = {}) {
  const { data } = await systemAdminApi.get(`${salesBase}/summary`, {
    params: { ...params, _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });

  return data;
}

export async function getSystemAddonSalesCatalog() {
  const { data } = await systemAdminApi.get("/system-admin/addons", {
    params: { _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });

  return Array.isArray(data?.data) ? data.data : [];
}