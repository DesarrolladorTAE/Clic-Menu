import staffApi from "../../staffApi";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function fetchCashierReadyNotifications() {
  const res = await staffApi.get("/staff/cashier/ready-notifications", {
    params: { _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });

  return res?.data;
}

export async function markCashierReadyNotificationRead(notificationId) {
  const res = await staffApi.post(
    `/staff/cashier/ready-notifications/${notificationId}/read`,
    {},
    { headers: NO_CACHE_HEADERS }
  );

  return res?.data;
}