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
  const res = await staffApi.post(
    `/staff/waiter/tables/${tableId}/finish-attention`,
  );
  return res?.data;
}

export async function releaseTableSession(tableId) {
  const res = await staffApi.post(
    `/staff/waiter/tables/${tableId}/release-session`,
  );
  return res?.data;
}

export async function markTablePaid(tableId) {
  const res = await staffApi.post(`/staff/waiter/tables/${tableId}/mark-paid`);
  return res?.data;
}

/**
 * ============================
 * waiter_only (Solo mesero)
 * ============================
 */
export async function occupyTable(tableId) {
  const res = await staffApi.post(`/staff/waiter/tables/${tableId}/occupy`);
  return res?.data;
}

export async function freeTable(tableId) {
  const res = await staffApi.post(`/staff/waiter/tables/${tableId}/free`);
  return res?.data;
}

export async function rejectTableCall(tableId) {
  const res = await staffApi.post(`/staff/waiter/tables/${tableId}/reject-call`);
  return res?.data;
}

/**
 * ============================
 * ✅ NUEVO: Menú y comanda del mesero (waiter_only)
 * ============================
 *
 * Nota: estos endpoints deben existir en Laravel.
 * Si tus rutas difieren, aquí se ajusta 1 vez y listo.
 */

// Trae el menú para esa mesa (categorías, productos, variantes, compuestos)
export async function fetchWaiterTableMenu(tableId) {
  const res = await staffApi.get(`/staff/tables/${tableId}/menu`);
  return res?.data;
}

// Crea una comanda NUEVA para la mesa (waiter_only)
export async function createWaiterOrder(tableId, payload) {
  const res = await staffApi.post(`/staff/tables/${tableId}/orders`, payload);
  return res?.data;
}

// Agrega items a una orden abierta (si permites append en waiter_only)
export async function appendWaiterOrderItems(orderId, payload) {
  const res = await staffApi.post(`/staff/orders/${orderId}/append-items`, payload);
  return res?.data;
}

// Obtiene detalle de una orden del mesero (para historial)
export async function getWaiterOrder(orderId) {
  const res = await staffApi.get(`/staff/orders/${orderId}`);
  return res?.data;
}

/**
 * ============================
 * customer_assisted (aceptar/rechazar)
 * ============================
 */
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