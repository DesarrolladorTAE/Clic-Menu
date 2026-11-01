//src/services/menu/menuSets/dashboard/ownerInventoryDashboard.service.js
import api from "../../../api";

const inventoryUrl = (restaurantId, branchId) =>
  `/restaurants/${restaurantId}/branches/${branchId}/operational-dashboard/inventory`;

function validateResponse(response, message, withRows = false) {
  const result = response?.data;

  if (response?.ok !== true || !result?.context || !result?.summary
    || !Array.isArray(result?.stock_breakdown)
    || !Array.isArray(result?.reservation_breakdown)
    || (withRows && (!Array.isArray(result?.rows) || !result?.pagination))) {
    throw new Error(message);
  }

  return result;
}

function buildFilters(filters = {}, withPagination = false) {
  const params = {
    resource_type: filters.resource_type || "all",
    stock_status: filters.stock_status || "all",
    include_inactive: filters.include_inactive ? 1 : 0,
  };

  if (filters.warehouse_id) {
    params.warehouse_id = Number(filters.warehouse_id);
  }

  if (withPagination) {
    params.page = Math.max(1, Number(filters.page) || 1);
    params.per_page = 5;
  }

  return params;
}

// Consultar los indicadores de inventario y sus desgloses.
export async function getOwnerInventoryDashboardSummary(
  restaurantId, branchId, filters = {}, signal = undefined
) {
  const { data } = await api.get(
    `${inventoryUrl(restaurantId, branchId)}/summary`,
    { params: buildFilters(filters), signal }
  );

  return validateResponse(data, "No se recibió el resumen de inventario.");
}

// Consultar el inventario por recurso y almacén, paginado de cinco en cinco.
export async function getOwnerInventoryDashboardItems(
  restaurantId, branchId, filters = {}, signal = undefined
) {
  const { data } = await api.get(
    `${inventoryUrl(restaurantId, branchId)}/items`,
    { params: buildFilters(filters, true), signal }
  );

  return validateResponse(data, "No se recibió el detalle del inventario.", true);
}