// src/services/staff/kitchen/kitchenKds.service.js
import staffApi from "../../staffApi";

/**
 * KitchenKdsController
 * - orders (open/ready)
 * - startItem (queued -> in_progress)
 * - readyItem (in_progress -> ready)
 * - notifyReady (aviso a mesero)
 */

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function fetchKitchenKdsOrders(params = {}) {
  const res = await staffApi.get(`/staff/kitchen/kds/orders`, {
    params: {
      ...params,
      _t: Date.now(), // rompe caché
    },
    headers: NO_CACHE_HEADERS,
  });

  return res?.data;
}

export async function startKitchenItem(itemId) {
  const res = await staffApi.post(
    `/staff/kitchen/kds/order-items/${itemId}/start`,
    {},
    { headers: NO_CACHE_HEADERS }
  );
  return res?.data;
}

export async function readyKitchenItem(itemId) {
  const res = await staffApi.post(
    `/staff/kitchen/kds/order-items/${itemId}/ready`,
    {},
    { headers: NO_CACHE_HEADERS }
  );
  return res?.data;
}

export async function notifyKitchenOrderReady(orderId) {
  const res = await staffApi.post(
    `/staff/kitchen/kds/orders/${orderId}/notify-ready`,
    {},
    { headers: NO_CACHE_HEADERS }
  );
  return res?.data;
}