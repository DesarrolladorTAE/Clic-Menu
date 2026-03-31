import staffApi from "../../staffApi";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function fetchCashierCurrentSession() {
  const res = await staffApi.get("/staff/cashier/cash-session/current", {
    params: { _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });
  return res?.data;
}

export async function fetchCashierRegisters() {
  const res = await staffApi.get("/staff/cashier/registers", {
    params: { _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });
  return res?.data;
}

export async function openCashierSession(payload) {
  const res = await staffApi.post(
    "/staff/cashier/cash-session/open",
    payload,
    { headers: NO_CACHE_HEADERS }
  );
  return res?.data;
}

export async function closeCashierSession(payload = {}) {
  const res = await staffApi.post(
    "/staff/cashier/cash-session/close",
    payload,
    { headers: NO_CACHE_HEADERS }
  );
  return res?.data;
}
