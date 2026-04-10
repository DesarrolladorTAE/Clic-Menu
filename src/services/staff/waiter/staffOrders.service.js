// src/services/staff/waiter/staffOrders.service.js
import staffApi from "../../staffApi";

/**
 * StaffTableOrderController
 * - menu (SALON)
 * - occupy / free
 * - createOrder
 * - showCurrent
 * - history
 * - appendItems
 */

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function fetchStaffWaiterMenu() {
  const res = await staffApi.get(`/staff/waiter/menu`, {
    params: { _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });
  return res?.data;
}

export async function occupyTable(tableId) {
  const res = await staffApi.post(
    `/staff/waiter/tables/${tableId}/occupy`,
    {},
    { headers: NO_CACHE_HEADERS }
  );
  return res?.data;
}

export async function freeTable(tableId) {
  const res = await staffApi.post(
    `/staff/waiter/tables/${tableId}/free`,
    {},
    { headers: NO_CACHE_HEADERS }
  );
  return res?.data;
}

// Crea una comanda NUEVA para la mesa (waiter_only)
export async function createWaiterOrder(tableId, payload) {
  const res = await staffApi.post(
    `/staff/waiter/tables/${tableId}/orders`,
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

export async function getCurrentTableOrder(tableId) {
  const res = await staffApi.get(`/staff/waiter/tables/${tableId}/orders/current`, {
    params: { _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });
  return res?.data;
}

export async function getTableOrderHistory(tableId, limit = 10) {
  const res = await staffApi.get(`/staff/waiter/tables/${tableId}/orders/history`, {
    params: { limit, _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });
  return res?.data;
}

// Agrega items a una orden abierta (si permites append en waiter_only)
export async function appendWaiterOrderItems(orderId, payload) {
  const res = await staffApi.post(
    `/staff/waiter/orders/${orderId}/append-items`,
    payload,
    { headers: NO_CACHE_HEADERS }
  );
  return res?.data;
}

/**
 * Opcional: por si existe en tu backend.
 */
export async function getOrderById(orderId) {
  const res = await staffApi.get(`/staff/waiter/orders/${orderId}`, {
    params: { _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });
  return res?.data;
}