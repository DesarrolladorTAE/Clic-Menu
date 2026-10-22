//src/services/menu/menuSets/menuSetStage.service.js
import api from "../../api";

const stageUrl = (restaurantId, branchId, menuSetId) =>
  `/restaurants/${restaurantId}/branches/${branchId}/menu-sets/${menuSetId}/stages`;

// Consultar las etapas de un conjunto.
export async function getMenuSetStages(restaurantId, branchId, menuSetId) {
  const { data } = await api.get(stageUrl(restaurantId, branchId, menuSetId));
  return Array.isArray(data?.stages) ? data.stages : [];
}

// Consultar una etapa.
export async function getMenuSetStage(restaurantId, branchId, menuSetId, stageId) {
  const { data } = await api.get(
    `${stageUrl(restaurantId, branchId, menuSetId)}/${stageId}`
  );

  return data?.stage || null;
}

// Agregar una etapa al conjunto.
export async function createMenuSetStage(restaurantId, branchId, menuSetId, payload) {
  const { data } = await api.post(
    stageUrl(restaurantId, branchId, menuSetId),
    payload
  );

  return data;
}

// Actualizar una etapa.
export async function updateMenuSetStage(
  restaurantId, branchId, menuSetId, stageId, payload
) {
  const { data } = await api.put(
    `${stageUrl(restaurantId, branchId, menuSetId)}/${stageId}`,
    payload
  );

  return data;
}

// Eliminar una etapa.
export async function deleteMenuSetStage(restaurantId, branchId, menuSetId, stageId) {
  const { data } = await api.delete(
    `${stageUrl(restaurantId, branchId, menuSetId)}/${stageId}`
  );

  return data;
}

export { getMenuSetStageDefinitions } from "./menuSetStageDefinition.service";
