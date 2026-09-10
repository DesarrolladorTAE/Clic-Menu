import staffApi from "../../staffApi";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

/*
 * Servicio HTTP de PRECUENTA para cuentas de mesa.
 *
 * Lo usa:
 * - useCashierSalePrebill.js
 *
 * Endpoints:
 * - consultar PRECUENTA actual;
 * - obtener PDF;
 * - obtener payload térmico;
 * - enviar PRECUENTA por WhatsApp.
 */

function buildPrebillParams(taxOptionCode = null) {
  const code = String(taxOptionCode || "").trim();

  return {
    _t: Date.now(),
    ...(code ? { tax_option_code: code } : {}),
  };
}

export async function fetchCashierPrebill(checkId, taxOptionCode = null) {
  const res = await staffApi.get(
    `/staff/cashier/checks/${checkId}/prebill`,
    {
      params: buildPrebillParams(taxOptionCode),
      headers: NO_CACHE_HEADERS,
    }
  );

  return res?.data;
}

export async function fetchCashierPrebillPdf(checkId, taxOptionCode = null) {
  const res = await staffApi.get(
    `/staff/cashier/checks/${checkId}/prebill/pdf`,
    {
      params: buildPrebillParams(taxOptionCode),
      headers: NO_CACHE_HEADERS,
      responseType: "blob",
    }
  );

  const blob = res?.data || null;
  const contentDisposition =
    res?.headers?.["content-disposition"] ||
    res?.headers?.["Content-Disposition"] ||
    "";

  let filename = `precuenta-${checkId}.pdf`;
  const match = /filename="?([^"]+)"?/i.exec(contentDisposition);
  if (match?.[1]) filename = match[1];

  return { blob, filename };
}

export async function fetchCashierPrebillPrintPayload(checkId, taxOptionCode = null) {
  const res = await staffApi.get(
    `/staff/cashier/checks/${checkId}/prebill/print-payload`,
    {
      params: buildPrebillParams(taxOptionCode),
      headers: NO_CACHE_HEADERS,
    }
  );

  return res?.data;
}

export async function sendCashierPrebillWhatsapp(checkId, payload = {}) {
  const res = await staffApi.post(
    `/staff/cashier/checks/${checkId}/prebill/whatsapp`,
    {
      phone: payload.phone || null,
      save_contact: Boolean(payload.save_contact),
      body: payload.body || null,
      tax_option_code: payload.tax_option_code || null,
    },
    { headers: NO_CACHE_HEADERS }
  );

  return res?.data;
}