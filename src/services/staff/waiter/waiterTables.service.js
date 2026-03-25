// src/services/staff/waiter/waiterTables.service.js
import staffApi from "../../staffApi";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function fetchStaffTablesGrid() {
  const res = await staffApi.get("/staff/waiter/tables/grid", {
    params: { _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });
  return res?.data;
}

export async function attendTable(tableId) {
  const res = await staffApi.post(
    `/staff/waiter/tables/${tableId}/attend`,
    {},
    { headers: NO_CACHE_HEADERS }
  );
  return res?.data;
}

export async function rejectTableCall(tableId) {
  const res = await staffApi.post(
    `/staff/waiter/tables/${tableId}/reject-call`,
    {},
    { headers: NO_CACHE_HEADERS }
  );
  return res?.data;
}

export async function finishAttention(tableId) {
  const res = await staffApi.post(
    `/staff/waiter/tables/${tableId}/finish-attention`,
    {},
    { headers: NO_CACHE_HEADERS }
  );
  return res?.data;
}

export async function releaseTableSession(tableId) {
  const res = await staffApi.post(
    `/staff/waiter/tables/${tableId}/release-session`,
    {},
    { headers: NO_CACHE_HEADERS }
  );
  return res?.data;
}

export async function markTablePaid(tableId) {
  const res = await staffApi.post(
    `/staff/waiter/tables/${tableId}/mark-paid`,
    {},
    { headers: NO_CACHE_HEADERS }
  );
  return res?.data;
}

export async function acceptCustomerOrder(orderId) {
  const res = await staffApi.post(
    `/staff/waiter/orders/${orderId}/accept`,
    {},
    { headers: NO_CACHE_HEADERS }
  );
  return res?.data;
}

export async function rejectCustomerOrder(orderId) {
  const res = await staffApi.post(
    `/staff/waiter/orders/${orderId}/reject`,
    {},
    { headers: NO_CACHE_HEADERS }
  );
  return res?.data;
}

// Avisos de pedido listo para mesero
export async function fetchWaiterReadyNotifications() {
  const res = await staffApi.get(`/staff/waiter/ready-notifications`, {
    params: { _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });
  return res?.data;
}

export async function markWaiterReadyNotificationRead(notificationId) {
  const res = await staffApi.post(
    `/staff/waiter/ready-notifications/${notificationId}/read`,
    {},
    { headers: NO_CACHE_HEADERS }
  );
  return res?.data;
}

// =========================
// Avisos de solicitud de cuenta
// =========================
export async function fetchWaiterBillRequests() {
  const res = await staffApi.get(`/staff/waiter/bill-requests`, {
    params: { _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });
  return res?.data;
}

export async function markWaiterBillRequestRead(billRequestId) {
  const res = await staffApi.post(
    `/staff/waiter/bill-requests/${billRequestId}/read`,
    {},
    { headers: NO_CACHE_HEADERS }
  );
  return res?.data;
}

export async function startWaiterOrderPayment(orderId) {
  const res = await staffApi.post(
    `/staff/waiter/orders/${orderId}/start-payment`,
    {},
    { headers: NO_CACHE_HEADERS }
  );
  return res?.data;
}