// src/services/staff/waiter/staffOrders.service.js
import staffApi from "../../staffApi";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function fetchStaffWaiterMenu({
  tableId = null,
  orderId = null,
} = {}) {
  const normalizedTableId = Number(tableId || 0);
  const normalizedOrderId = Number(orderId || 0);

  const hasTableId = normalizedTableId > 0;
  const hasOrderId = normalizedOrderId > 0;

  /*
   * El backend exige exactamente un contexto:
   * - table_id: crear una orden nueva usando el menú de la zona.
   * - order_id: continuar una orden existente conservando su menú original.
   * No se permite enviar ambos ni omitir ambos.
   */
  if (hasTableId === hasOrderId) {
    throw new Error(
      "Debes enviar tableId para una orden nueva u orderId para continuar una orden existente, pero no ambos.",
    );
  }

  const params = {
    _t: Date.now(),

    ...(hasTableId
      ? { table_id: normalizedTableId }
      : { order_id: normalizedOrderId }),
  };

  const res = await staffApi.get(
    `/staff/waiter/menu`,
    {
      params,
      headers: NO_CACHE_HEADERS,
    },
  );

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
