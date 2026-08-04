// src/services/staff/casher/cashierSaleCheck.service.js
import staffApi from "../../staffApi";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};


export async function fetchCashierSaleCheckContext(saleId) {
  const res = await staffApi.get(
    `/staff/cashier/sales/${saleId}/checks`,
    {
      params: { _t: Date.now() },
      headers: NO_CACHE_HEADERS,
    }
  );

  return res?.data;
}


export async function fetchCashierSaleCheckDetail(checkId) {
  const res = await staffApi.get(
    `/staff/cashier/checks/${checkId}`,
    {
      params: { _t: Date.now() },
      headers: NO_CACHE_HEADERS,
    }
  );

  return res?.data;
}


export async function prepareCashierSaleCheckPayment(checkId) {
  const res = await staffApi.post(
    `/staff/cashier/checks/${checkId}/prepare-payment`,
    {},
    { headers: NO_CACHE_HEADERS }
  );

  return res?.data;
}