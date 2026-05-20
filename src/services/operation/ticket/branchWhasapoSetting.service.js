import api from "../../api";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

// GET /restaurants/:restaurantId/branches/:branchId/whasapo-setting
export async function getBranchWhasapoSetting(restaurantId, branchId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/branches/${branchId}/whasapo-setting`,
    {
      params: { _t: Date.now() },
      headers: NO_CACHE_HEADERS,
    }
  );

  return data?.data ?? null;
}

// PUT /restaurants/:restaurantId/branches/:branchId/whasapo-setting
export async function updateBranchWhasapoSetting(
  restaurantId,
  branchId,
  payload
) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/branches/${branchId}/whasapo-setting`,
    payload
  );

  return data?.data ?? null;
}

// DELETE /restaurants/:restaurantId/branches/:branchId/whasapo-setting
export async function deleteBranchWhasapoSetting(restaurantId, branchId) {
  const { data } = await api.delete(
    `/restaurants/${restaurantId}/branches/${branchId}/whasapo-setting`
  );

  return data?.data ?? null;
}