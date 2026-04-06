//Services de tarjetita de Cancelaciones
import staffApi from "../../staffApi";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function fetchCashierSaleAdjustments(saleId) {
  const res = await staffApi.get(`/staff/cashier/sales/${saleId}/adjustments`, {
    params: { _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });
  return res?.data;
}

export async function cancelCashierSaleItems(saleId, payload) {
  const res = await staffApi.post(
    `/staff/cashier/sales/${saleId}/adjustments/cancel-items`,
    payload,
    { headers: NO_CACHE_HEADERS }
  );
  return res?.data;
}

export async function cancelCashierSaleOrder(saleId, payload) {
  const res = await staffApi.post(
    `/staff/cashier/sales/${saleId}/adjustments/cancel-order`,
    payload,
    { headers: NO_CACHE_HEADERS }
  );
  return res?.data;
}