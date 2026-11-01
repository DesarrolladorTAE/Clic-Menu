//src/services/menu/menuSets/dashboard/ownerProductsDashboard.service.js
import api from "../../../api";

const productsUrl = (restaurantId, branchId) =>
  `/restaurants/${restaurantId}/branches/${branchId}/operational-dashboard/products/availability`;

// Consultar la disponibilidad oficial de los productos de la sucursal.
export async function getOwnerProductsDashboardAvailability(
  restaurantId, branchId, filters = {}, signal = undefined
) {
  const params = {
    inventory_type: filters.inventory_type || "all",
    availability_status: filters.availability_status || "all",
    page: Math.max(1, Number(filters.page) || 1),
    per_page: 5,
  };

  if (filters.product_id) {
    params.product_id = Number(filters.product_id);
  }

  const { data } = await api.get(
    productsUrl(restaurantId, branchId),
    { params, signal }
  );

  const result = data?.data;

  if (data?.ok !== true || !result?.context || !result?.summary
    || !Array.isArray(result?.rows) || !result?.pagination) {
    throw new Error("No se recibió la disponibilidad de los productos.");
  }

  return result;
}