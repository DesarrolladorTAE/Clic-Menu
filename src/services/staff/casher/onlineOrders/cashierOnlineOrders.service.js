import staffApi from "../../../staffApi";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
}; 

export async function fetchCashierOnlineOrders() {
  const res = await staffApi.get("/staff/cashier/online-orders", {
    params: { _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });

  return res?.data;
}

export async function fetchCashierOnlineOrderDetail(onlineOrderId) {
  const res = await staffApi.get(`/staff/cashier/online-orders/${onlineOrderId}`, {
    params: { _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });

  return res?.data;
}

export async function fetchCashierOnlineOrderNewNotifications() {
  const res = await staffApi.get("/staff/cashier/online-order-new-notifications", {
    params: { _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });

  return res?.data;
}

export async function markCashierOnlineOrderNewNotificationRead(notificationId) {
  const res = await staffApi.post(
    `/staff/cashier/online-order-new-notifications/${notificationId}/read`,
    {},
    { headers: NO_CACHE_HEADERS }
  );

  return res?.data;
}

export async function acceptCashierOnlineOrder(onlineOrderId) {
  const res = await staffApi.post(
    `/staff/cashier/online-orders/${onlineOrderId}/accept`,
    {},
    { headers: NO_CACHE_HEADERS }
  );

  return res?.data;
}

export async function rejectCashierOnlineOrder(onlineOrderId, reason) {
  const res = await staffApi.post(
    `/staff/cashier/online-orders/${onlineOrderId}/reject`,
    { reason },
    { headers: NO_CACHE_HEADERS }
  );

  return res?.data;
}

export async function cancelCashierOnlineOrder(onlineOrderId, reason) {
  const res = await staffApi.post(
    `/staff/cashier/online-orders/${onlineOrderId}/cancel`,
    { reason },
    { headers: NO_CACHE_HEADERS }
  );

  return res?.data;
}

export async function takeCashierOnlineOrder(onlineOrderId) {
  const res = await staffApi.post(
    `/staff/cashier/online-orders/${onlineOrderId}/take`,
    {},
    { headers: NO_CACHE_HEADERS }
  );

  return res?.data;
}

export async function releaseCashierOnlineOrder(onlineOrderId) {
  const res = await staffApi.post(
    `/staff/cashier/online-orders/${onlineOrderId}/release`,
    {},
    { headers: NO_CACHE_HEADERS }
  );

  return res?.data;
}

export async function confirmCashierOnlineOrderPreparation(onlineOrderId) {
  const res = await staffApi.post(
    `/staff/cashier/online-orders/${onlineOrderId}/confirm-preparation`,
    {},
    { headers: NO_CACHE_HEADERS }
  );

  return res?.data;
}

export async function startCashierOnlineOrderPreparation(onlineOrderId) {
  const res = await staffApi.post(
    `/staff/cashier/online-orders/${onlineOrderId}/start-preparation`,
    {},
    { headers: NO_CACHE_HEADERS }
  );

  return res?.data;
}

export async function markCashierOnlineOrderReady(onlineOrderId) {
  const res = await staffApi.post(
    `/staff/cashier/online-orders/${onlineOrderId}/mark-ready`,
    {},
    { headers: NO_CACHE_HEADERS }
  );

  return res?.data;
}

export async function markCashierOnlineOrderOutForDelivery(onlineOrderId) {
  const res = await staffApi.post(
    `/staff/cashier/online-orders/${onlineOrderId}/out-for-delivery`,
    {},
    { headers: NO_CACHE_HEADERS }
  );

  return res?.data;
}

export async function deliverCashierOnlineOrder(onlineOrderId) {
  const res = await staffApi.post(
    `/staff/cashier/online-orders/${onlineOrderId}/deliver`,
    {},
    { headers: NO_CACHE_HEADERS }
  );

  return res?.data;
}
