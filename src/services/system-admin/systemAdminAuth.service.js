import systemAdminApi from "../systemAdminApi";

const SS_ADMIN_USER = "system_admin_user";

export async function systemAdminLogin(payload) {
  const { data } = await systemAdminApi.post("/system-admin/login", payload);

  if (data?.token) {
    localStorage.setItem("system_admin_token", data.token);
  }

  if (data?.user) {
    sessionStorage.setItem(SS_ADMIN_USER, JSON.stringify(data.user));
  } else {
    sessionStorage.removeItem(SS_ADMIN_USER);
  }

  return data;
}

export async function systemAdminMe() {
  const token = localStorage.getItem("system_admin_token");

  if (!token) {
    return {
      ok: false,
      user: null,
    };
  }

  const { data } = await systemAdminApi.get("/system-admin/me");

  if (data?.user) {
    sessionStorage.setItem(SS_ADMIN_USER, JSON.stringify(data.user));
  }

  return data;
}

export async function systemAdminLogout() {
  const { data } = await systemAdminApi.post("/system-admin/logout");
  clearSystemAdminLocal();
  return data;
}

export function getSystemAdminToken() {
  return localStorage.getItem("system_admin_token") || "";
}

export function getSystemAdminUser() {
  try {
    const raw = sessionStorage.getItem(SS_ADMIN_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSystemAdminLocal() {
  localStorage.removeItem("system_admin_token");
  sessionStorage.removeItem(SS_ADMIN_USER);
}