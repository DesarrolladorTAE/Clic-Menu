// src/services/staff/waiter/staffOrders.service.js
import staffApi from "../../staffApi";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

function requirePositiveId(value, label) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new Error(`${label} debe ser un identificador válido.`);

  return id;
}

function buildExclusiveWaiterContext({ tableId = null, orderId = null } = {}) {
  const hasTableId = tableId !== null && tableId !== undefined && tableId !== "";
  const hasOrderId = orderId !== null && orderId !== undefined && orderId !== "";

  if (hasTableId === hasOrderId) {
    throw new Error(
      "Debes enviar tableId para una orden nueva u orderId para continuar una orden existente, pero no ambos.",
    );
  }

  return hasTableId
    ? { table_id: requirePositiveId(tableId, "tableId") }
    : { order_id: requirePositiveId(orderId, "orderId") };
}

export async function fetchStaffWaiterMenu({ tableId = null, orderId = null } = {}) {
  const params = {
    _t: Date.now(),
    ...buildExclusiveWaiterContext({ tableId, orderId }),
  };

  const res = await staffApi.get("/staff/waiter/menu", {
    params,
    headers: NO_CACHE_HEADERS,
  });

  return res?.data;
}

export async function fetchPreparedItems({ tableId = null, orderId = null } = {}) {
  const params = {
    _t: Date.now(),
    ...buildExclusiveWaiterContext({ tableId, orderId }),
  };

  const res = await staffApi.get("/staff/waiter/prepared-items", {
    params,
    headers: NO_CACHE_HEADERS,
  });

  return res?.data;
}

export async function occupyTable(tableId, payload = {}) {
  const res = await staffApi.post(
    `/staff/waiter/tables/${tableId}/occupy`,
    payload,
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

export async function fetchCancellationContext(orderId) {
  const normalizedOrderId = requirePositiveId(orderId, "orderId");

  const res = await staffApi.get(
    `/staff/waiter/orders/${normalizedOrderId}/cancellation-context`,
    {
      params: { _t: Date.now() },
      headers: NO_CACHE_HEADERS,
    },
  );

  return res?.data;
}

export async function cancelOrderItems(orderId, payload) {
  const normalizedOrderId = requirePositiveId(orderId, "orderId");

  const res = await staffApi.post(
    `/staff/waiter/orders/${normalizedOrderId}/cancellations`,
    payload,
    { headers: NO_CACHE_HEADERS },
  );

  return res?.data;
}