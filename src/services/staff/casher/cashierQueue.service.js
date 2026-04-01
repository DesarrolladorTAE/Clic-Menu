import staffApi from "../../staffApi";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function fetchCashierSaleQueue() {
  const res = await staffApi.get("/staff/cashier/sales/queue", {
    params: { _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });
  return res?.data;
}

export async function takeCashierSale(saleId) {
  const res = await staffApi.post(
    `/staff/cashier/sales/${saleId}/take`,
    {},
    { headers: NO_CACHE_HEADERS }
  );
  return res?.data;
}


export async function fetchCashierSaleDetail(saleId) {
  const res = await staffApi.get(`/staff/cashier/sales/${saleId}`, {
    params: { _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });
  return res?.data;
}
