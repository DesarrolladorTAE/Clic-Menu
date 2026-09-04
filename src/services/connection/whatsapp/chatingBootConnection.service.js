import api from "../../api";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

const connectionUrl = (restaurantId, branchId) =>
  `/restaurants/${restaurantId}/branches/${branchId}/whatsapp-qr-connection`;

export async function getBranchWhatsappQrConnection(restaurantId, branchId) {
  const { data } = await api.get(connectionUrl(restaurantId, branchId), {
    params: { _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });

  return data ?? null;
}

export async function createBranchWhatsappQrConnection(
  restaurantId,
  branchId,
  payload = {}
) {
  const { data } = await api.post(
    connectionUrl(restaurantId, branchId),
    payload
  );

  return data ?? null;
}

export async function getBranchWhatsappQrConnectionStatus(
  restaurantId,
  branchId
) {
  const { data } = await api.get(
    `${connectionUrl(restaurantId, branchId)}/status`,
    {
      params: { _t: Date.now() },
      headers: NO_CACHE_HEADERS,
    }
  );

  return data ?? null;
}

export async function deleteBranchWhatsappQrConnection(
  restaurantId,
  branchId
) {
  const { data } = await api.delete(
    connectionUrl(restaurantId, branchId)
  );

  return data ?? null;
}