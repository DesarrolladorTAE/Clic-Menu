import staffApi from "../../staffApi";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function fetchCashierSaleChecks(saleId) {
  const res = await staffApi.get(`/staff/cashier/sales/${saleId}/checks`, {
    params: { _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });

  return res?.data;
}

export async function splitCashierCheckByProducts(checkId, payload = {}) {
  const res = await staffApi.post(
    `/staff/cashier/checks/${checkId}/split`,
    payload,
    { headers: NO_CACHE_HEADERS }
  );

  return res?.data;
}

export async function splitCashierCheckEqualParts(checkId, payload = {}) {
  const res = await staffApi.post(
    `/staff/cashier/checks/${checkId}/split-equal-parts`,
    payload,
    { headers: NO_CACHE_HEADERS }
  );

  return res?.data;
}

export async function undoCashierCheckEqualParts(groupId, payload = {}) {
  const res = await staffApi.post(
    `/staff/cashier/billing-groups/${groupId}/undo-equal-parts`,
    payload,
    { headers: NO_CACHE_HEADERS }
  );

  return res?.data;
}

export async function moveCashierCheckItem(checkId, itemId, payload = {}) {
  const res = await staffApi.post(
    `/staff/cashier/checks/${checkId}/items/${itemId}/move`,
    payload,
    { headers: NO_CACHE_HEADERS }
  );

  return res?.data;
}

export async function moveCashierCheckItemQuantity(checkId, itemId, payload = {}) {
  const res = await staffApi.post(
    `/staff/cashier/checks/${checkId}/items/${itemId}/move-quantity`,
    payload,
    { headers: NO_CACHE_HEADERS }
  );

  return res?.data;
}

export async function mergeCashierChecks(sourceCheckId, targetCheckId, payload = {}) {
  const res = await staffApi.post(
    `/staff/cashier/checks/${sourceCheckId}/merge-into/${targetCheckId}`,
    payload,
    { headers: NO_CACHE_HEADERS }
  );

  return res?.data;
}

export async function mergeCashierTables(sourceTableId, targetTableId, payload = {}) {
  const res = await staffApi.post(
    `/staff/cashier/tables/${sourceTableId}/merge-into/${targetTableId}`,
    payload,
    { headers: NO_CACHE_HEADERS }
  );

  return res?.data;
}

export async function reopenCashierCheck(checkId, payload = {}) {
  const res = await staffApi.post(
    `/staff/cashier/checks/${checkId}/reopen`,
    payload,
    { headers: NO_CACHE_HEADERS }
  );

  return res?.data;
}