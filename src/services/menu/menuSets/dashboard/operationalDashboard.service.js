//src/services/menu/menuSets/dashboard/operationalDashboard.service.js
import api from "../../../api";

const dashboardUrl = (restaurantId, branchId) =>
  `/restaurants/${restaurantId}/branches/${branchId}/operational-dashboard`;

// Consultar el resumen operativo de una sucursal para una fecha de servicio.
export async function getOperationalDashboardOverview(
  restaurantId, branchId, serviceDate = null, signal = undefined
) {
  const params = serviceDate ? { service_date: serviceDate } : {};

  const { data } = await api.get(
    `${dashboardUrl(restaurantId, branchId)}/overview`,
    { params, signal }
  );

  const overview = data?.data;
  const fields = ["context", "inventory", "products", "menu_sets", "import_updates", "reminders"];

  if (data?.ok !== true || !overview || typeof overview !== "object") {
    throw new Error("No se recibió el resumen operativo de la sucursal.");
  }

  if (fields.some((field) => !overview[field] || typeof overview[field] !== "object" || Array.isArray(overview[field]))) {
    throw new Error("La información del resumen operativo está incompleta.");
  }

  return overview;
}