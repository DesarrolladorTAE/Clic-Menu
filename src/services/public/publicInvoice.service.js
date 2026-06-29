import axios from "axios";

const apiBase =
  import.meta.env.VITE_API_BASE_URL || "https://api.clicmenu.com.mx/api";

const publicApi = axios.create({
  baseURL: apiBase,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export async function getPublicInvoice(token) {
  const cleanToken = encodeURIComponent(String(token || ""));

  const { data } = await publicApi.get(`/public/invoice/${cleanToken}`);

  return data;
}

export async function stampPublicInvoice(token, payload) {
  const cleanToken = encodeURIComponent(String(token || ""));

  const { data } = await publicApi.post(
    `/public/invoice/${cleanToken}/stamp`,
    payload
  );

  return data;
}