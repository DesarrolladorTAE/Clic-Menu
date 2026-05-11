import systemAdminApi from "../systemAdminApi";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function getSystemSubscriptionSalesMonthly(params = {}) {
  const { data } = await systemAdminApi.get(
    "/system-admin/subscription-sales/monthly",
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

export async function getSystemSubscriptionSalesSummary(params = {}) {
  const { data } = await systemAdminApi.get(
    "/system-admin/subscription-sales/summary",
    {
      params: {
        ...params,
        _t: Date.now(),
      },
      headers: NO_CACHE_HEADERS,
    }
  );

  return data;
}