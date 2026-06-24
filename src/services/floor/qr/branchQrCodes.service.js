import api from "../../api";

export async function getBranchQrCodes(restaurantId, branchId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/branches/${branchId}/qr-codes`
  );

  return data;
}

export async function createBranchQrCode(restaurantId, branchId, payload) {
  const { data } = await api.post(
    `/restaurants/${restaurantId}/branches/${branchId}/qr-codes`,
    payload
  );

  return data;
}

export async function updateBranchQrCode(restaurantId, branchId, qrId, payload) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/branches/${branchId}/qr-codes/${qrId}`,
    payload
  );

  return data;
}

export async function deleteBranchQrCode(restaurantId, branchId, qrId) {
  const { data } = await api.delete(
    `/restaurants/${restaurantId}/branches/${branchId}/qr-codes/${qrId}`
  );

  return data;
}

export async function exportBranchQrCodesPdf(restaurantId, branchId, payload) {
  const { data } = await api.post(
    `/restaurants/${restaurantId}/branches/${branchId}/qr/export`,
    payload,
    {
      responseType: "blob",
    }
  );

  return data;
}