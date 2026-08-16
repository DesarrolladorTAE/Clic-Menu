import api from "../../api";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

function paymentSettingsPath(restaurantId, branchId) {
  return `/restaurants/${restaurantId}/branches/${branchId}/online-order-payments`;
}

function transferSettingPath(restaurantId, branchId) {
  return `/restaurants/${restaurantId}/branches/${branchId}/online-order-transfer-setting`;
}

// ==================== MÉTODOS DE PAGO ====================

export async function getOnlineOrderPaymentSettings(restaurantId, branchId) {
  const { data } = await api.get(paymentSettingsPath(restaurantId, branchId), {
    params: { _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });

  return Array.isArray(data?.data) ? data.data : [];
}

export async function saveOnlineOrderPaymentSetting(restaurantId, branchId, payload) {
  const { data } = await api.put(
    paymentSettingsPath(restaurantId, branchId),
    payload
  );

  return data;
}

// ==================== DATOS PARA TRANSFERENCIA ====================

export async function getOnlineOrderTransferSetting(restaurantId, branchId) {
  const { data } = await api.get(transferSettingPath(restaurantId, branchId), {
    params: { _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });

  return data?.data ?? null;
}

export async function updateOnlineOrderTransferSetting(restaurantId, branchId, payload) {
  const { data } = await api.put(
    transferSettingPath(restaurantId, branchId),
    payload
  );

  return data;
}