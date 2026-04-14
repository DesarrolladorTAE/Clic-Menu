import staffApi from "../../staffApi";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function fetchCashierPaymentMethods() {
  const res = await staffApi.get("/staff/cashier/payment-methods", {
    params: { _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });
  return res?.data;
}

export async function fetchCashierTaxOptions() {
  const res = await staffApi.get("/staff/cashier/consumption-tax-options", {
    params: { _t: Date.now() },
    headers: NO_CACHE_HEADERS,
  });
  return res?.data;
}

export async function previewCashierSalePayment(saleId, payload) {
  const res = await staffApi.post(
    `/staff/cashier/sales/${saleId}/preview-payment`,
    payload,
    { headers: NO_CACHE_HEADERS }
  );
  return res?.data;
}

export async function payCashierSale(saleId, payload) {
  const res = await staffApi.post(
    `/staff/cashier/sales/${saleId}/pay`,
    payload,
    { headers: NO_CACHE_HEADERS }
  );
  return res?.data;
}

/**
 * Helper para extraer de forma segura la info del ticket
 * cuando el backend responde al cobrar.
 */
export function extractTicketFromPayResponse(response) {
  return response?.data?.ticket ?? null;
}

/**
 * Helper para extraer advertencias de ticket
 * cuando la venta sí se cobró pero el ticket falló o no existe.
 */
export function extractTicketWarningFromPayResponse(response) {
  return {
    ticketWarning: Boolean(response?.data?.ticket_warning),
    ticketErrorCode: response?.data?.ticket_error_code ?? null,
    ticketErrorMessage: response?.data?.ticket_error_message ?? null,
  };
}
