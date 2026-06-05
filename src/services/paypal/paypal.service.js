//src/services/paypal/paypal.service.js

import api from "../api";

/**
 * GET /api/paypal/config
 */
export async function getPayPalConfig() {
  const { data } = await api.get("/paypal/config");
  return data;
}

/**
 * POST /api/restaurants/:restaurantId/paypal/checkout
 */
export async function createPayPalCheckout(restaurantId, payload) {
  const { data } = await api.post(
    `/restaurants/${restaurantId}/paypal/checkout`,
    payload
  );

  return data;
}

/**
 * POST /api/restaurants/:restaurantId/paypal/capture
 */
export async function capturePayPalOrder(restaurantId, orderId) {
  const { data } = await api.post(
    `/restaurants/${restaurantId}/paypal/capture`,
    {
      order_id: orderId,
    }
  );

  return data;
}