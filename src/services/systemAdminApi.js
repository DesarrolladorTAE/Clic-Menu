import axios from "axios";

const systemAdminApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://api.clicmenu.com.mx/api",
  withCredentials: false,
  timeout: 30000,
  headers: {
    Accept: "application/json",
  },
});

systemAdminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("system_admin_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default systemAdminApi;