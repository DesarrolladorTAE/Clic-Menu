//src/services/menu/menuSets/menuSetManagement.service.js
import api from "../../api";

const managementUrl = (restaurantId, branchId, menuSetId) =>
  `/restaurants/${restaurantId}/branches/${branchId}/menu-sets/${menuSetId}/management`;

// Consultar la modalidad y programación administrativa del Conjunto.
export async function getMenuSetManagement(restaurantId, branchId, menuSetId) {
  const { data } = await api.get(managementUrl(restaurantId, branchId, menuSetId));

  if (!data?.management || typeof data.management !== "object") {
    throw new Error("No se recibió la configuración de administración del conjunto.");
  }

  return data.management;
}

// Actualizar la modalidad de administración.
export async function updateMenuSetManagement(restaurantId, branchId, menuSetId, payload) {
  const { data } = await api.put(
    managementUrl(restaurantId, branchId, menuSetId),
    payload
  );

  if (!data?.management || typeof data.management !== "object") {
    throw new Error("No se recibió la confirmación de la configuración guardada.");
  }

  return data;
}