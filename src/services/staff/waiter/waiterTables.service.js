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

export async function finishAttention(tableId) {
  const res = await staffApi.post(`/staff/waiter/tables/${tableId}/finish-attention`);
  return res?.data;
}

export async function releaseTableSession(tableId) {
  const res = await staffApi.post(`/staff/waiter/tables/${tableId}/release-session`);
  return res?.data;
}

export async function markTablePaid(tableId) {
  const res = await staffApi.post(`/staff/waiter/tables/${tableId}/mark-paid`);
  return res?.data;
}

async function postWaiterOrderAction(url, payload = {}) {
  const res = await staffApi.post(url, payload);
  return res?.data;
}

export async function acceptCustomerOrder(orderId) {
  try {
    return await postWaiterOrderAction(`/staff/waiter/orders/${orderId}/accept`);
  } catch (e) {
    if (e?.response?.status === 404) {
      return await postWaiterOrderAction(`/staff/staff/waiter/orders/${orderId}/accept`);
    }
    throw e;
  }
}

export async function rejectCustomerOrder(orderId) {
  try {
    return await postWaiterOrderAction(`/staff/waiter/orders/${orderId}/reject`);
  } catch (e) {
    if (e?.response?.status === 404) {
      return await postWaiterOrderAction(`/staff/staff/waiter/orders/${orderId}/reject`);
    }
    throw e;
  }
}

/**
 * ============================
 * Join Requests (device takeover)
 * ============================
 */
export async function listTableSessionRequests() {
  const res = await staffApi.get(`/staff/waiter/table-session-requests`);
  return res?.data;
}

export async function approveTableSessionRequest(reqId) {
  const res = await staffApi.post(`/staff/waiter/table-session-requests/${reqId}/approve`);
  return res?.data;
}

export async function rejectTableSessionRequest(reqId) {
  const res = await staffApi.delete(`/staff/waiter/table-session-requests/${reqId}`);
  return res?.data;
}