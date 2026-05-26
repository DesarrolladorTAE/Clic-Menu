import api from "../../api";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

// GET /restaurants/:restaurantId/branches/:branchId/print-setting
export async function getBranchPrintSetting(restaurantId, branchId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/branches/${branchId}/print-setting`,
    {
      params: { _t: Date.now() },
      headers: NO_CACHE_HEADERS,
    }
  );

  return data?.data ?? null;
}

// PUT /restaurants/:restaurantId/branches/:branchId/print-setting
export async function updateBranchPrintSetting(
  restaurantId,
  branchId,
  payload
) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/branches/${branchId}/print-setting`,
    payload
  );

  return data?.data ?? null;
}

// DELETE /restaurants/:restaurantId/branches/:branchId/print-setting
export async function deleteBranchPrintSetting(restaurantId, branchId) {
  const { data } = await api.delete(
    `/restaurants/${restaurantId}/branches/${branchId}/print-setting`
  );

  return data?.data ?? null;
}