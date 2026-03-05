// src/services/staff/kitchen/kitchenKds.service.js
import staffApi from "../../staffApi";

/**
 * KitchenKdsController
 * - orders (open/ready)
 * - startItem (queued -> in_progress)
 * - readyItem (in_progress -> ready)
 */

export async function fetchKitchenKdsOrders(params = {}) {
  // params: { include_ready_items?: 0|1 }
  const res = await staffApi.get(`/staff/kitchen/kds/orders`, { params });
  return res?.data;
}

export async function startKitchenItem(itemId) {
  const res = await staffApi.post(`/staff/kitchen/kds/order-items/${itemId}/start`);
  return res?.data;
}

export async function readyKitchenItem(itemId) {
  const res = await staffApi.post(`/staff/kitchen/kds/order-items/${itemId}/ready`);
  return res?.data;
}