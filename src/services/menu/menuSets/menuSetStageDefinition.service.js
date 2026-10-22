//src/services/menu/menuSets/menuSetStageDefinition.service.js
import api from "../../api";

const definitionsUrl = (restaurantId, branchId) =>
  `/restaurants/${restaurantId}/branches/${branchId}/menu-set-stage-definitions`;

// Consultar las etapas predeterminadas y personalizadas.
export async function getMenuSetStageDefinitions(restaurantId, branchId) {
  const { data } = await api.get(definitionsUrl(restaurantId, branchId));
  return Array.isArray(data?.stage_definitions) ? data.stage_definitions : [];
}

// Crear una etapa personalizada.
export async function createMenuSetStageDefinition(restaurantId, branchId, payload) {
  const { data } = await api.post(definitionsUrl(restaurantId, branchId), payload);
  return data;
}

// Actualizar una etapa personalizada.
export async function updateMenuSetStageDefinition(
  restaurantId, branchId, definitionId, payload
) {
  const { data } = await api.put(
    `${definitionsUrl(restaurantId, branchId)}/${definitionId}`,
    payload
  );

  return data;
}

// Eliminar una etapa personalizada.
export async function deleteMenuSetStageDefinition(restaurantId, branchId, definitionId) {
  const { data } = await api.delete(
    `${definitionsUrl(restaurantId, branchId)}/${definitionId}`
  );

  return data;
}