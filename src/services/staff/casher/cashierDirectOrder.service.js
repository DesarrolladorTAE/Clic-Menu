import staffApi from "../../staffApi";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function fetchCashierDirectMenu() {
  const res = await staffApi.get("/staff/cashier/direct-orders/menu", {
    params: { _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });

  return res?.data;
}

export async function createCashierDirectOrder(payload) {
  const res = await staffApi.post("/staff/cashier/direct-orders", payload, {
    headers: NO_CACHE_HEADERS,
    validateStatus: (status) =>
      (status >= 200 && status < 300) || status === 409 || status === 422,
  });

  return {
    ...res?.data,
    __httpStatus: res?.status,
  };
}

export async function fetchCashierDirectOrder(orderId) {
  const res = await staffApi.get(`/staff/cashier/direct-orders/${orderId}`, {
    params: { _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });

  return res?.data;
}

export async function appendCashierDirectOrderItems(orderId, payload) {
  const res = await staffApi.post(
    `/staff/cashier/direct-orders/${orderId}/items`,
    payload,
    {
      headers: NO_CACHE_HEADERS,
      validateStatus: (status) =>
        (status >= 200 && status < 300) || status === 409 || status === 422,
    }
  );

  return {
    ...res?.data,
    __httpStatus: res?.status,
  };
}

export async function reviewCashierDirectOrderStock(orderId) {
  const res = await staffApi.get(
    `/staff/cashier/direct-orders/${orderId}/stock-review`,
    {
      params: { _t: Date.now() },
      headers: NO_CACHE_HEADERS,
      validateStatus: (status) =>
        (status >= 200 && status < 300) || status === 409 || status === 422,
    }
  );

  return {
    ...res?.data,
    __httpStatus: res?.status,
  };
}

export async function removeCashierDirectOrderItem(orderId, orderItemId) {
  const res = await staffApi.delete(
    `/staff/cashier/direct-orders/${orderId}/items/${orderItemId}`,
    {
      headers: NO_CACHE_HEADERS,
      validateStatus: (status) =>
        (status >= 200 && status < 300) || status === 409 || status === 422,
    }
  );

  return {
    ...res?.data,
    __httpStatus: res?.status,
  };
}