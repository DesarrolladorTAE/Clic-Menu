import staffApi from "../../staffApi";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

/**
 * Historial / postventa
 * Ajusta esta ruta si en tu backend quedó con otro nombre.
 */
export async function fetchCashierRefundSalesHistory(params = {}) {
  const res = await staffApi.get("/staff/cashier/sales/history", {
    params: {
      ...params,
      _t: Date.now(),
    },
    headers: NO_CACHE_HEADERS,
  });
  return res?.data;
}

export async function fetchCashierSaleRefundSummary(saleId) {
  const res = await staffApi.get(`/staff/cashier/sales/${saleId}/refunds/summary`, {
    params: { _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });
  return res?.data;
}

export async function refundCashierSaleFull(saleId, payload) {
  const res = await staffApi.post(
    `/staff/cashier/sales/${saleId}/refunds/full`,
    payload,
    { headers: NO_CACHE_HEADERS }
  );
  return res?.data;
}

export async function refundCashierSaleAmount(saleId, payload) {
  const res = await staffApi.post(
    `/staff/cashier/sales/${saleId}/refunds/amount`,
    payload,
    { headers: NO_CACHE_HEADERS }
  );
  return res?.data;
}

export async function refundCashierSaleItems(saleId, payload) {
  const res = await staffApi.post(
    `/staff/cashier/sales/${saleId}/refunds/items`,
    payload,
    { headers: NO_CACHE_HEADERS }
  );
  return res?.data;
}
