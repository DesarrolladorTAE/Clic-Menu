import axios from "axios";

const apiBase =
  import.meta.env.VITE_API_BASE_URL || "https://api.clicmenu.com.mx/api";

const publicTrackingApi = axios.create({
  baseURL: apiBase,
  headers: { Accept: "application/json" },
});

const TRACKING_TOKEN_PATTERN = /^[A-Za-z0-9]{12}$/;

export function isValidPublicTrackingToken(trackingToken) {
  return TRACKING_TOKEN_PATTERN.test(String(trackingToken || "").trim());
}

export async function getPublicOnlineOrderTracking(trackingToken) {
  const token = String(trackingToken || "").trim();

  if (!isValidPublicTrackingToken(token)) {
    throw new Error("El enlace de seguimiento no es válido.");
  }

  const { data } = await publicTrackingApi.get(
    `/public/online-orders/tracking/${encodeURIComponent(token)}`,
  );

  return data?.data ?? null;
}

export function getPublicTrackingErrorMessage(
  error,
  fallback = "No pudimos consultar el seguimiento de tu pedido.",
) {
  if (error?.message === "El enlace de seguimiento no es válido.") {
    return error.message;
  }

  const status = Number(error?.response?.status || 0);
  const message = String(error?.response?.data?.message || "").trim();

  if (status === 404 && message) return message;
  if (status === 0) return "No pudimos conectarnos en este momento. Revisa tu conexión e intenta nuevamente.";

  return fallback;
}
