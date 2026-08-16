import api from "../../api";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function getOnlineOrderPlanAccess(restaurantId) {
  const { data } = await api.get(`/restaurants/${restaurantId}/plan-access`, {
    params: { _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });

  return data?.data ?? data ?? {};
}

export async function getOnlineOrderBranchSalesChannels(restaurantId, branchId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/branches/${branchId}/sales-channels`,
    {
      params: { _t: Date.now() },
      headers: NO_CACHE_HEADERS,
    }
  );

  return Array.isArray(data?.data) ? data.data : [];
}

export async function getOnlineOrderQrCodes(restaurantId, branchId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/branches/${branchId}/qr-codes`,
    {
      params: { _t: Date.now() },
      headers: NO_CACHE_HEADERS,
    }
  );

  return {
    data: Array.isArray(data?.data) ? data.data : [],
    ui: data?.ui ?? null,
  };
}

export async function updateOnlineOrderActivation(restaurantId, branchId, isActive) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/branches/${branchId}/online-order-activation`,
    {
      is_active: !!isActive,
    }
  );

  return data;
}
