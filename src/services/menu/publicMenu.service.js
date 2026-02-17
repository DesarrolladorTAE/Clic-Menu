import axios from "axios";

export async function resolveMenuToken(token) {
  const apiBase = import.meta.env.VITE_API_BASE_URL || "https://api.clicmenu.com.mx/api";
  // Usar axios limpio evita que el interceptor te mande al login si el token falla
  const { data } = await axios.get(`${apiBase}/public/menu/${token}/resolve`);
  return data;
}