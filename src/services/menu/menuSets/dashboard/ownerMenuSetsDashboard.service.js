//src/services/menu/menuSets/dashboard/ownerMenuSetsDashboard.service.js
import api from "../../../api";

const menuSetsUrl = (restaurantId, branchId) =>
  `/restaurants/${restaurantId}/branches/${branchId}/operational-dashboard/menu-sets`;

// Consultar los Conjuntos con su disponibilidad oficial y paginación.
export async function getOwnerMenuSetsDashboard(
  restaurantId, branchId, filters = {}, signal = undefined
) {
  const params = {
    availability_status: filters.availability_status || "all",
    page: Math.max(1, Number(filters.page) || 1),
    per_page: 5,
  };

  if (filters.service_date) {
    params.service_date = filters.service_date;
  }

  if (filters.menu_set_id) {
    params.menu_set_id = Number(filters.menu_set_id);
  }

  const { data } = await api.get(
    menuSetsUrl(restaurantId, branchId),
    { params, signal }
  );

  const result = data?.data;

  if (data?.ok !== true || !result?.context || !result?.summary
    || !Array.isArray(result?.rows) || !result?.pagination) {
    throw new Error("No se recibió el listado operativo de Conjuntos.");
  }

  return result;
}

// Consultar las etapas, opciones y capacidades de un Conjunto.
export async function getOwnerMenuSetDashboardDetail(
  restaurantId, branchId, menuSetId, serviceDate = null, signal = undefined
) {
  const params = serviceDate ? { service_date: serviceDate } : {};

  const { data } = await api.get(
    `${menuSetsUrl(restaurantId, branchId)}/${menuSetId}`,
    { params, signal }
  );

  const result = data?.data;

  if (data?.ok !== true || !result || typeof result !== "object"
    || !result.id || !Array.isArray(result.stages)) {
    throw new Error("No se recibió el detalle operativo del Conjunto.");
  }

  return result;
}