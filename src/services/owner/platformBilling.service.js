import api from "../api";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function getPlatformPurchases(params = {}) {
  const { data } = await api.get("/platform-purchases", {
    params: { ...params, _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });

  return data;
}

export async function getPlatformInvoices(params = {}) {
  const { data } = await api.get("/platform-invoices", {
    params: { ...params, _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });

  return data;
}

export async function getPlatformInvoice(invoiceId) {
  const { data } = await api.get(`/platform-invoices/${invoiceId}`, {
    params: { _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });

  return data;
}

export async function createPlatformInvoice(payload) {
  const { data } = await api.post("/platform-invoices", payload);
  return data;
}

export async function retryPlatformInvoice(invoiceId) {
  const { data } = await api.post(`/platform-invoices/${invoiceId}/retry`);
  return data;
}

export async function downloadPlatformInvoicePdf(invoiceId) {
  return downloadPlatformInvoiceDocument(invoiceId, "pdf");
}

export async function downloadPlatformInvoiceXml(invoiceId) {
  return downloadPlatformInvoiceDocument(invoiceId, "xml");
}

async function downloadPlatformInvoiceDocument(invoiceId, type) {
  const response = await api.get(`/platform-invoices/${invoiceId}/${type}/download`, {
    responseType: "blob",
    headers: NO_CACHE_HEADERS,
  });

  return {
    blob: response.data,
    filename: getFilename(
      response.headers,
      `factura-${invoiceId}.${type}`
    ),
  };
}

function getFilename(headers, fallback) {
  const disposition = headers?.["content-disposition"] || "";

  const utfMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) {
    try {
      return decodeURIComponent(utfMatch[1].replace(/["']/g, ""));
    } catch {
      return utfMatch[1].replace(/["']/g, "");
    }
  }

  const basicMatch = disposition.match(/filename="?([^"]+)"?/i);
  return basicMatch?.[1]?.trim() || fallback;
}