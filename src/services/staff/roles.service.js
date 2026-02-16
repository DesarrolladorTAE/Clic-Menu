import api from "../api";

/**
 * Roles
 * GET /roles?scope=operational
 */
export async function getRoles(params = {}) {
  const { scope, q } = params;

  const { data } = await api.get("/roles", {
    params: {
      ...(scope ? { scope } : {}),
      ...(q ? { q } : {}),
    },
  });

  return data?.data ?? data ?? [];
}
