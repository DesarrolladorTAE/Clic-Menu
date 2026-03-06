// src/services/staff/waiter/waiterTables.service.js
import staffApi from "../../staffApi";

export async function fetchStaffTablesGrid() {
  const res = await staffApi.get("/staff/waiter/tables/grid");
  return res?.data;
}

export async function attendTable(tableId) {
  const res = await staffApi.post(`/staff/waiter/tables/${tableId}/attend`);
  return res?.data;
}

export async function rejectTableCall(tableId) {
  const res = await staffApi.post(`/staff/waiter/tables/${tableId}/reject-call`);
  return res?.data;
}

export async function finishAttention(tableId) {
  const res = await staffApi.post( `/staff/waiter/tables/${tableId}/finish-attention`);
  return res?.data;
}

export async function releaseTableSession(tableId) {
  const res = await staffApi.post( `/staff/waiter/tables/${tableId}/release-session`);
  return res?.data;
}

export async function markTablePaid(tableId) {
  const res = await staffApi.post(`/staff/waiter/tables/${tableId}/mark-paid`);
  return res?.data;
}


export async function acceptCustomerOrder(orderId) {
  const res = await staffApi.post(`/staff/waiter/orders/${orderId}/accept`);
  return res?.data;
}

export async function rejectCustomerOrder(orderId) {
  const res = await staffApi.post(`/staff/waiter/orders/${orderId}/reject`);
  return res?.data;
}

//Avisos de pedido listo para mesero
export async function fetchWaiterReadyNotifications() {
  const res = await staffApi.get(`/staff/waiter/ready-notifications`);
  return res?.data;
}

export async function markWaiterReadyNotificationRead(notificationId) {
  const res = await staffApi.post(`/staff/waiter/ready-notifications/${notificationId}/read`);
  return res?.data;
}

// =========================
// Avisos de solicitud de cuenta
// =========================
export async function fetchWaiterBillRequests() {
  const res = await staffApi.get(`/staff/waiter/bill-requests`);
  return res?.data;
}

export async function markWaiterBillRequestRead(billRequestId) {
  const res = await staffApi.post(`/staff/waiter/bill-requests/${billRequestId}/read`);
  return res?.data;
}

export async function startWaiterOrderPayment(orderId) {
    const res = await staffApi.post(`/staff/waiter/orders/${orderId}/start-payment`);
    return res?.data;
}


