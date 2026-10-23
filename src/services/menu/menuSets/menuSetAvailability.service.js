//src/services/menu/menuSets/menuSetAvailability.service.js
import api from "../../api";

const availabilityUrl = (restaurantId, branchId, menuSetId) =>
  `/restaurants/${restaurantId}/branches/${branchId}/menu-sets/${menuSetId}/availability-preview`;

// Consultar la disponibilidad de las opciones de un Conjunto.
export async function getMenuSetAvailabilityPreview(
  restaurantId, branchId, menuSetId, serviceDate, quantity = 1, signal = undefined
) {
  const { data } = await api.get(
    availabilityUrl(restaurantId, branchId, menuSetId),
    {
      params: {
        service_date: serviceDate,
        quantity,
      },
      signal,
    }
  );

  if (!Array.isArray(data?.options)) {
    throw new Error("No se recibió la información de disponibilidad solicitada.");
  }

  return {
    menu_set_id: data.menu_set_id,
    service_date: data.service_date,
    quantity: data.quantity,
    options: data.options,
  };
}
