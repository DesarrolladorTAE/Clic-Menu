import staffApi from "../../staffApi";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
  Expires: "0",
};

export async function finishKitchenPreparedItem(preparedItemId) {
  const res = await staffApi.post(
    `/staff/kitchen/prepared-items/${preparedItemId}/finish`,
    {},
    { headers: NO_CACHE_HEADERS }
  );

  return res?.data;
}

export async function confirmKitchenPreparedItemReturn(preparedItemId) {
  const res = await staffApi.post(
    `/staff/kitchen/prepared-items/${preparedItemId}/confirm-return`,
    {},
    { headers: NO_CACHE_HEADERS }
  );

  return res?.data;
}

export async function markKitchenPreparedItemUnfit(preparedItemId, note = "") {
  const normalizedNote = typeof note === "string" ? note.trim() : "";

  const res = await staffApi.post(
    `/staff/kitchen/prepared-items/${preparedItemId}/mark-unfit`,
    { note: normalizedNote || null },
    { headers: NO_CACHE_HEADERS }
  );

  return res?.data;
}

export async function retireExpiredKitchenPreparedItem(preparedItemId) {
  const res = await staffApi.post(
    `/staff/kitchen/prepared-items/${preparedItemId}/retire-expired`,
    {},
    { headers: NO_CACHE_HEADERS }
  );

  return res?.data;
}