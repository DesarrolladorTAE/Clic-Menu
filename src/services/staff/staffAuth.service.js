import staffApi from "../staffApi";

/**
 * Storage keys (sesión)
 */
const SS_USER = "staff_user";
const SS_ACTIVE_CONTEXT = "staff_active_context";
const SS_CONTEXTS = "staff_contexts";

/**
 * POST /api/staff/login
 * body: { email, password, device_name? }
 */
export async function staffLogin(payload) {
  const { data } = await staffApi.post("/staff/login", payload);

  // Guarda token staff
  if (data?.token) localStorage.setItem("staff_token", data.token);

  // user
  if (data?.user) sessionStorage.setItem(SS_USER, JSON.stringify(data.user));
  else sessionStorage.removeItem(SS_USER);

  // contexts (lista para selección)
  if (Array.isArray(data?.contexts)) sessionStorage.setItem(SS_CONTEXTS, JSON.stringify(data.contexts));
  else sessionStorage.removeItem(SS_CONTEXTS);

  // active_context (si auto-seleccionó)
  if (data?.active_context) sessionStorage.setItem(SS_ACTIVE_CONTEXT, JSON.stringify(data.active_context));
  else sessionStorage.removeItem(SS_ACTIVE_CONTEXT);

  return data;
}

/**
 * POST /api/staff/select-context
 * body: { restaurant_id, branch_id, role_id }
 */
export async function staffSelectContext(payload) {
  const { data } = await staffApi.post("/staff/select-context", payload);

  if (data?.active_context) {
    sessionStorage.setItem(SS_ACTIVE_CONTEXT, JSON.stringify(data.active_context));
  }

  return data;
}

/**
 * GET /api/staff/context
 * Requiere contexto activo
 */
export async function staffContext() {
  const { data } = await staffApi.get("/staff/context");
  return data; // { ok, data: { work_session_id, restaurant, branch, role } }
}

/**
 * POST /api/staff/exit-context
 * Cierra turno pero NO token
 */
export async function staffExitContext() {
  const { data } = await staffApi.post("/staff/exit-context");
  sessionStorage.removeItem(SS_ACTIVE_CONTEXT);
  return data;
}

/**
 * POST /api/staff/logout
 * Cierra turno + revoca token actual
 */
export async function staffLogout() {
  const { data } = await staffApi.post("/staff/logout");
  clearStaffLocal();
  return data;
}

/**
 * Helpers
 */
export function getStaffToken() {
  return localStorage.getItem("staff_token") || "";
}

export function getStaffUser() {
  try {
    const raw = sessionStorage.getItem(SS_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getStaffContexts() {
  try {
    const raw = sessionStorage.getItem(SS_CONTEXTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getStaffActiveContext() {
  try {
    const raw = sessionStorage.getItem(SS_ACTIVE_CONTEXT);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStaffActiveContext(next) {
  if (next) sessionStorage.setItem(SS_ACTIVE_CONTEXT, JSON.stringify(next));
  else sessionStorage.removeItem(SS_ACTIVE_CONTEXT);
}

export function clearStaffLocal() {
  localStorage.removeItem("staff_token");
  sessionStorage.removeItem(SS_USER);
  sessionStorage.removeItem(SS_ACTIVE_CONTEXT);
  sessionStorage.removeItem(SS_CONTEXTS);
}