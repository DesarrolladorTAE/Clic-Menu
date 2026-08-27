// src/services/staff/casher/netpayTransaction.service.js

import staffApi from "../../staffApi";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function previewNetpayTransaction(saleId, payload) {
  const res = await staffApi.post(
    `/staff/cashier/sales/${saleId}/netpay-transactions/preview`,
    payload,
    { headers: NO_CACHE_HEADERS }
  );

  return res?.data;
}

export async function createNetpayTransaction(saleId, payload) {
  const res = await staffApi.post(
    `/staff/cashier/sales/${saleId}/netpay-transactions`,
    payload,
    { headers: NO_CACHE_HEADERS }
  );

  return res?.data;
}

export async function fetchNetpayTransaction(
  saleId,
  netpayTransactionId
) {
  const res = await staffApi.get(
    `/staff/cashier/sales/${saleId}/netpay-transactions/${netpayTransactionId}`,
    {
      params: { _t: Date.now() },
      headers: NO_CACHE_HEADERS,
    }
  );

  return res?.data;
}

export async function storeNetpaySaleResult(
  saleId,
  netpayTransactionId,
  payload
) {
  const res = await staffApi.post(
    `/staff/cashier/sales/${saleId}/netpay-transactions/${netpayTransactionId}/sale-result`,
    payload,
    { headers: NO_CACHE_HEADERS }
  );

  return res?.data;
}

export async function requestNetpayRecovery(
  saleId,
  netpayTransactionId
) {
  const res = await staffApi.post(
    `/staff/cashier/sales/${saleId}/netpay-transactions/${netpayTransactionId}/recovery`,
    {},
    { headers: NO_CACHE_HEADERS }
  );

  return res?.data;
}

export async function storeNetpayRecoveryResult(
  saleId,
  netpayTransactionId,
  payload
) {
  const res = await staffApi.post(
    `/staff/cashier/sales/${saleId}/netpay-transactions/${netpayTransactionId}/recovery-result`,
    payload,
    { headers: NO_CACHE_HEADERS }
  );

  return res?.data;
}

export async function finalizeApprovedNetpayTransaction(
  saleId,
  netpayTransactionId
) {
  const res = await staffApi.post(
    `/staff/cashier/sales/${saleId}/netpay-transactions/${netpayTransactionId}/finalize-approved`,
    {},
    { headers: NO_CACHE_HEADERS }
  );

  return res?.data;
}