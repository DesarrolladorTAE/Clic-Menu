import systemAdminApi from "../../systemAdminApi";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export const SYSTEM_INVOICE_MODES = {
  OWNER: "owner",
  PUBLIC_GENERAL: "public_general",
};

export async function getSystemPlatformPurchases(params = {}) {
  const { data } = await systemAdminApi.get("/system-admin/platform-purchases", {
    params: { ...params, _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });

  return data;
}

export async function createSystemPlatformInvoice(payload) {
  const { data } = await systemAdminApi.post(
    "/system-admin/platform-invoices",
    payload,
    { headers: NO_CACHE_HEADERS }
  );

  return data;
}

export async function getSystemPlatformInvoices(params = {}) {
  const { data } = await systemAdminApi.get("/system-admin/platform-invoices", {
    params: { ...params, _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });

  return data;
}

export async function getSystemPlatformInvoice(invoiceId) {
  const { data } = await systemAdminApi.get(
    `/system-admin/platform-invoices/${invoiceId}`,
    {
      params: { _t: Date.now() },
      headers: NO_CACHE_HEADERS,
    }
  );

  return data;
}

export async function retrySystemPlatformInvoice(invoiceId) {
  const { data } = await systemAdminApi.post(
    `/system-admin/platform-invoices/${invoiceId}/retry`,
    {},
    { headers: NO_CACHE_HEADERS }
  );

  return data;
}

export async function downloadSystemPlatformInvoicePdf(invoiceId) {
  return downloadInvoiceDocument(
    `/system-admin/platform-invoices/${invoiceId}/pdf/download`,
    `factura_${invoiceId}.pdf`
  );
}

export async function downloadSystemPlatformInvoiceXml(invoiceId) {
  return downloadInvoiceDocument(
    `/system-admin/platform-invoices/${invoiceId}/xml/download`,
    `factura_${invoiceId}.xml`
  );
}

async function downloadInvoiceDocument(url, fallbackFilename) {
  const response = await systemAdminApi.get(url, {
    responseType: "blob",
    headers: NO_CACHE_HEADERS,
  });

  return {
    blob: response.data,
    filename: resolveFilename(response.headers, fallbackFilename),
  };
}

function resolveFilename(headers, fallbackFilename) {
  const disposition = headers?.["content-disposition"] || "";
  const utfMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  const normalMatch = disposition.match(/filename="?([^"]+)"?/i);

  try {
    if (utfMatch?.[1]) return decodeURIComponent(utfMatch[1]);
  } catch {
    // Usa el nombre alternativo.
  }

  return normalMatch?.[1] || fallbackFilename;
}