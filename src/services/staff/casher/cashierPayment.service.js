import staffApi from "../../staffApi";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function fetchCashierPaymentMethods() {
  const res = await staffApi.get("/staff/cashier/payment-methods", {
    params: { _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });
  return res?.data;
}

export async function fetchCashierTaxOptions() {
  const res = await staffApi.get("/staff/cashier/consumption-tax-options", {
    params: { _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });
  return res?.data;
}

export async function previewCashierSalePayment(saleId, payload) {
  const res = await staffApi.post(
    `/staff/cashier/sales/${saleId}/preview-payment`,
    payload,
    { headers: NO_CACHE_HEADERS }
  );
  return res?.data;
}

export async function payCashierSale(saleId, payload) {
  const res = await staffApi.post(
    `/staff/cashier/sales/${saleId}/pay`,
    payload,
    { headers: NO_CACHE_HEADERS }
  );
  return res?.data;
}
