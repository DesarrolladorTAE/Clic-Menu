import staffApi from "../staffApi";

/**
 * POST /api/staff/login
 * body: { email, password }
 */
export async function staffLogin(payload) {
  const { data } = await staffApi.post("/staff/login", payload);

  // Guarda token staff si viene
  if (data?.token) localStorage.setItem("staff_token", data.token);

  // Persistimos un snapshot por si refrescan
  if (data?.user) sessionStorage.setItem("staff_user", JSON.stringify(data.user));
  else sessionStorage.removeItem("staff_user");

  if (data?.active_context) sessionStorage.setItem("staff_active_context", JSON.stringify(data.active_context));
  else sessionStorage.removeItem("staff_active_context");

  return data;
}

/**
 * POST /api/staff/logout
 */
export async function staffLogout() {
  const { data } = await staffApi.post("/staff/logout");
  localStorage.removeItem("staff_token");
  sessionStorage.removeItem("staff_user");
  sessionStorage.removeItem("staff_active_context");
  return data;
}

/**
 * GET /api/staff/waiter/branches
 */
export async function staffBranches() {
  const { data } = await staffApi.get("/staff/waiter/branches");
  return data; // { ok, data: contexts[] }
}

/**
 * POST /api/staff/waiter/select-branch
 * body: { restaurant_id, branch_id }
 */
export async function staffSelectBranch(payload) {
  const { data } = await staffApi.post("/staff/waiter/select-branch", payload);

  if (data?.active_context) {
    sessionStorage.setItem("staff_active_context", JSON.stringify(data.active_context));
  }

  return data;
}

/**
 * POST /api/staff/waiter/exit-branch
 */
export async function staffExitBranch() {
  const { data } = await staffApi.post("/staff/waiter/exit-branch");
  sessionStorage.removeItem("staff_active_context");
  return data;
}

/**
 * GET /api/staff/waiter/context
 */
export async function staffContext() {
  const { data } = await staffApi.get("/staff/waiter/context");
  return data; // { ok, data: { work_session_id, restaurant, branch, role } }
}

/**
 * Helpers
 */
export function getStaffToken() {
  return localStorage.getItem("staff_token") || "";
}

export function clearStaffLocal() {
  localStorage.removeItem("staff_token");
  sessionStorage.removeItem("staff_user");
  sessionStorage.removeItem("staff_active_context");
}