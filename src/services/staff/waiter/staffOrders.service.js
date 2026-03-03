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


export async function fetchStaffWaiterMenu() {
  const res = await staffApi.get(`/staff/waiter/menu`);
  return res?.data;
}


export async function occupyTable(tableId) {
  const res = await staffApi.post(`/staff/waiter/tables/${tableId}/occupy`);
  return res?.data;
}

export async function freeTable(tableId) {
  const res = await staffApi.post(`/staff/waiter/tables/${tableId}/free`);
  return res?.data;
}

// Crea una comanda NUEVA para la mesa (waiter_only)
export async function createWaiterOrder(tableId, payload) {
  const res = await staffApi.post(`/staff/waiter/tables/${tableId}/orders`, payload);
  return res?.data;
}

export async function getCurrentTableOrder(tableId) {
  const res = await staffApi.get(`/staff/waiter/tables/${tableId}/orders/current`);
  return res?.data;
}

export async function getTableOrderHistory(tableId, limit = 10) {
  const res = await staffApi.get(`/staff/waiter/tables/${tableId}/orders/history`, {
    params: { limit },
  });
  return res?.data;
}

// Agrega items a una orden abierta (si permites append en waiter_only)
export async function appendWaiterOrderItems(orderId, payload) {
  const res = await staffApi.post(`/staff/waiter/orders/${orderId}/append-items`, payload);
  return res?.data;
}

/**
 * Opcional: por si existe en tu backend (muchas veces sí).
 * Si no existe, en el hook hay fallback a current-order.
 */
export async function getOrderById(orderId) {
  const res = await staffApi.get(`/staff/waiter/orders/${orderId}`);
  return res?.data;
}