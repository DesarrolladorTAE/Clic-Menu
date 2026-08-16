import api from "../../api";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

// GET /restaurants/:restaurantId/branches
export async function getOnlineOrderBranches(restaurantId) {
  const { data } = await api.get(`/restaurants/${restaurantId}/branches`, {
    params: { _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;

  return [];
}

// GET /restaurants/:restaurantId/branches/:branchId/online-order-setting
export async function getOnlineOrderSetting(restaurantId, branchId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/branches/${branchId}/online-order-setting`,
    {
      params: { _t: Date.now() },
      headers: NO_CACHE_HEADERS,
    }
  );

  return data?.data ?? null;
}

// PUT /restaurants/:restaurantId/branches/:branchId/online-order-setting
export async function updateOnlineOrderSetting(restaurantId, branchId, payload) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/branches/${branchId}/online-order-setting`,
    payload
  );

  return data;
}

// ==================== FORMAS DE ENTREGA ====================

// GET /restaurants/:restaurantId/branches/:branchId/online-order-fulfillments
export async function getOnlineOrderFulfillments(restaurantId, branchId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/branches/${branchId}/online-order-fulfillments`,
    {
      params: { _t: Date.now() },
      headers: NO_CACHE_HEADERS,
    }
  );

  return Array.isArray(data?.data) ? data.data : [];
}

// PUT /restaurants/:restaurantId/branches/:branchId/online-order-fulfillments
export async function saveOnlineOrderFulfillment(restaurantId, branchId, payload) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/branches/${branchId}/online-order-fulfillments`,
    payload
  );

  return data;
}


// ==================== ZONAS Y UBICACIONES ====================

export async function getOnlineOrderDeliveryConcepts(restaurantId, branchId, fulfillmentId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/branches/${branchId}/online-order-fulfillments/${fulfillmentId}/delivery-concepts`,
    {
      params: { _t: Date.now() },
      headers: NO_CACHE_HEADERS,
    }
  );

  return Array.isArray(data?.data) ? data.data : [];
}

export async function createOnlineOrderDeliveryConcept(
  restaurantId,
  branchId,
  fulfillmentId,
  payload
) {
  const { data } = await api.post(
    `/restaurants/${restaurantId}/branches/${branchId}/online-order-fulfillments/${fulfillmentId}/delivery-concepts`,
    payload
  );

  return data; 
}

export async function updateOnlineOrderDeliveryConcept(
  restaurantId,
  branchId,
  fulfillmentId,
  conceptId,
  payload
) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/branches/${branchId}/online-order-fulfillments/${fulfillmentId}/delivery-concepts/${conceptId}`,
    payload
  );

  return data;
}

export async function deleteOnlineOrderDeliveryConcept(
  restaurantId,
  branchId,
  fulfillmentId,
  conceptId
) {
  const { data } = await api.delete(
    `/restaurants/${restaurantId}/branches/${branchId}/online-order-fulfillments/${fulfillmentId}/delivery-concepts/${conceptId}`
  );

  return data;
}


// ==================== PUNTOS PROGRAMADOS ====================

export async function getOnlineOrderScheduledPoints(restaurantId, branchId, fulfillmentId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/branches/${branchId}/online-order-fulfillments/${fulfillmentId}/scheduled-points`,
    {
      params: { _t: Date.now() },
      headers: NO_CACHE_HEADERS,
    }
  );

  return Array.isArray(data?.data) ? data.data : [];
}

export async function createOnlineOrderScheduledPoint(
  restaurantId,
  branchId,
  fulfillmentId,
  payload
) {
  const { data } = await api.post(
    `/restaurants/${restaurantId}/branches/${branchId}/online-order-fulfillments/${fulfillmentId}/scheduled-points`,
    payload
  );

  return data;
}

export async function updateOnlineOrderScheduledPoint(
  restaurantId,
  branchId,
  fulfillmentId,
  pointId,
  payload
) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/branches/${branchId}/online-order-fulfillments/${fulfillmentId}/scheduled-points/${pointId}`,
    payload
  );

  return data;
}

export async function deleteOnlineOrderScheduledPoint(
  restaurantId,
  branchId,
  fulfillmentId,
  pointId
) {
  const { data } = await api.delete(
    `/restaurants/${restaurantId}/branches/${branchId}/online-order-fulfillments/${fulfillmentId}/scheduled-points/${pointId}`
  );

  return data;
}


// ==================== HORARIOS DE PUNTOS ====================

export async function getOnlineOrderTimeBlocks(
  restaurantId,
  branchId,
  fulfillmentId,
  pointId
) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/branches/${branchId}/online-order-fulfillments/${fulfillmentId}/scheduled-points/${pointId}/time-blocks`,
    {
      params: { _t: Date.now() },
      headers: NO_CACHE_HEADERS,
    }
  );

  return Array.isArray(data?.data) ? data.data : [];
}

export async function createOnlineOrderTimeBlock(
  restaurantId,
  branchId,
  fulfillmentId,
  pointId,
  payload
) {
  const { data } = await api.post(
    `/restaurants/${restaurantId}/branches/${branchId}/online-order-fulfillments/${fulfillmentId}/scheduled-points/${pointId}/time-blocks`,
    payload
  );

  return data;
}

export async function updateOnlineOrderTimeBlock(
  restaurantId,
  branchId,
  fulfillmentId,
  pointId,
  blockId,
  payload
) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/branches/${branchId}/online-order-fulfillments/${fulfillmentId}/scheduled-points/${pointId}/time-blocks/${blockId}`,
    payload
  );

  return data;
}

export async function deleteOnlineOrderTimeBlock(
  restaurantId,
  branchId,
  fulfillmentId,
  pointId,
  blockId
) {
  const { data } = await api.delete(
    `/restaurants/${restaurantId}/branches/${branchId}/online-order-fulfillments/${fulfillmentId}/scheduled-points/${pointId}/time-blocks/${blockId}`
  );

  return data;
}