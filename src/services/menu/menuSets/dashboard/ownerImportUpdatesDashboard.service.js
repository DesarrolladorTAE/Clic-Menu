//src/services/menu/menuSets/dashboard/ownerImportUpdatesDashboard.service.js
import api from "../../../api";

const updatesUrl = (restaurantId, branchId) =>
  `/restaurants/${restaurantId}/branches/${branchId}/operational-dashboard/import-updates`;

// Consultar el seguimiento comercial de los Conjuntos de una sucursal.
export async function getOwnerImportUpdatesDashboard(
  restaurantId, branchId, filters = {}, signal = undefined
) {
  const params = {
    import_status: filters.import_status || "all",
    page: Math.max(1, Number(filters.page) || 1),
    per_page: 5,
  };

  if (filters.service_date) {
    params.service_date = filters.service_date;
  }

  if (filters.menu_set_id) {
    params.menu_set_id = Number(filters.menu_set_id);
  }

  const { data } = await api.get(updatesUrl(restaurantId, branchId), { params, signal });
  const result = data?.data;

  if (data?.ok !== true || !result?.context || !result?.summary
    || !Array.isArray(result?.rows) || !result?.pagination) {
    throw new Error("No se recibió el seguimiento de actualizaciones comerciales.");
  }

  return result;
}