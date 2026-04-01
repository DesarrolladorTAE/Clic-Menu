import staffApi from "../../staffApi";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function fetchCashierSaleDiscountSummary(saleId) {
  const res = await staffApi.get(`/staff/cashier/sales/${saleId}/discounts`, {
    params: { _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });
  return res?.data;
}

export async function fetchCashierSaleDiscountAudit(saleId) {
  const res = await staffApi.get(
    `/staff/cashier/sales/${saleId}/discount-audit`,
    {
      params: { _t: Date.now() },
      headers: NO_CACHE_HEADERS,
    }
  );
  return res?.data;
}

export async function applyCashierSaleGlobalDiscount(saleId, payload) {
  const res = await staffApi.post(
    `/staff/cashier/sales/${saleId}/discounts/global`,
    payload,
    { headers: NO_CACHE_HEADERS }
  );
  return res?.data;
}

export async function removeCashierSaleGlobalDiscount(saleId) {
  const res = await staffApi.delete(
    `/staff/cashier/sales/${saleId}/discounts/global`,
    { headers: NO_CACHE_HEADERS }
  );
  return res?.data;
}

export async function applyCashierSaleItemDiscount(
  saleId,
  orderItemId,
  payload
) {
  const res = await staffApi.post(
    `/staff/cashier/sales/${saleId}/discounts/items/${orderItemId}`,
    payload,
    { headers: NO_CACHE_HEADERS }
  );
  return res?.data;
}

export async function removeCashierSaleItemDiscount(saleId, orderItemId) {
  const res = await staffApi.delete(
    `/staff/cashier/sales/${saleId}/discounts/items/${orderItemId}`,
    { headers: NO_CACHE_HEADERS }
  );
  return res?.data;
}