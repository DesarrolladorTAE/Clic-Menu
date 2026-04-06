//Services de tarjetita de clientes
import staffApi from "../../staffApi";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function searchCashierCustomers(params = {}) {
  const res = await staffApi.get("/staff/cashier/customers/search", {
    params: {
      ...params,
      _t: Date.now(),
    },
    headers: NO_CACHE_HEADERS,
  });
  return res?.data;
}

export async function createCashierCustomer(payload) {
  const res = await staffApi.post("/staff/cashier/customers", payload, {
    headers: NO_CACHE_HEADERS,
  });
  return res?.data;
}

export async function fetchCashierSaleCustomerData(saleId) {
  const res = await staffApi.get(
    `/staff/cashier/sales/${saleId}/customer-data`,
    {
      params: { _t: Date.now() },
      headers: NO_CACHE_HEADERS,
    }
  );
  return res?.data;
}

export async function saveCashierSaleContactData(saleId, payload) {
  const res = await staffApi.post(
    `/staff/cashier/sales/${saleId}/contact-data`,
    payload,
    { headers: NO_CACHE_HEADERS }
  );
  return res?.data;
}

export async function removeCashierSaleContactData(saleId) {
  const res = await staffApi.delete(
    `/staff/cashier/sales/${saleId}/contact-data`,
    { headers: NO_CACHE_HEADERS }
  );
  return res?.data;
}

export async function attachCashierSaleCustomer(saleId, payload) {
  const res = await staffApi.post(
    `/staff/cashier/sales/${saleId}/customer`,
    payload,
    { headers: NO_CACHE_HEADERS }
  );
  return res?.data;
}

export async function detachCashierSaleCustomer(saleId) {
  const res = await staffApi.delete(
    `/staff/cashier/sales/${saleId}/customer`,
    { headers: NO_CACHE_HEADERS }
  );
  return res?.data;
}