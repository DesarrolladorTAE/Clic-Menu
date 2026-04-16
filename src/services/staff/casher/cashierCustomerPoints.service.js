import staffApi from "../../staffApi";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function searchCashierCustomersDirectory(params = {}) {
  const res = await staffApi.get("/staff/cashier/customers/search", {
    params: {
      ...params,
      _t: Date.now(),
    },
    headers: NO_CACHE_HEADERS,
  });
  return res?.data;
}

export async function fetchCashierCustomerPointsBalance(customerId) {
  const res = await staffApi.get(
    `/staff/cashier/customers/${customerId}/points-balance`,
    {
      params: { _t: Date.now() },
      headers: NO_CACHE_HEADERS,
    }
  );
  return res?.data;
}

export async function fetchCashierCustomerPointsLedger(customerId) {
  const res = await staffApi.get(
    `/staff/cashier/customers/${customerId}/points-ledger`,
    {
      params: { _t: Date.now() },
      headers: NO_CACHE_HEADERS,
    }
  );
  return res?.data;
}

export async function fetchCashierCustomerSalesHistory(customerId) {
  const res = await staffApi.get(
    `/staff/cashier/customers/${customerId}/sales-history`,
    {
      params: { _t: Date.now() },
      headers: NO_CACHE_HEADERS,
    }
  );
  return res?.data;
}