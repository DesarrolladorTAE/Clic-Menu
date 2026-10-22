//src/services/menu/menuSets/menuSetProduct.service.js
import api from "../../api";

const productsUrl = (restaurantId, branchId, menuSetId, stageId) =>
  `/restaurants/${restaurantId}/branches/${branchId}/menu-sets/${menuSetId}/stages/${stageId}/products`;

// Consultar productos elegibles para una sucursal.
export async function getMenuSetEligibleProducts(restaurantId, branchId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/branches/${branchId}/menu-sets/eligible-products`
  );

  return Array.isArray(data?.products) ? data.products : [];
}

// Consultar productos asignados a una etapa.
export async function getMenuSetStageProducts(restaurantId, branchId, menuSetId, stageId) {
  const { data } = await api.get(
    productsUrl(restaurantId, branchId, menuSetId, stageId)
  );

  return {
    options: Array.isArray(data?.options) ? data.options : [],
    capacity_mode: data?.capacity_mode || "none",
  };
}

// Consultar un producto asignado.
export async function getMenuSetStageProduct(
  restaurantId, branchId, menuSetId, stageId, optionId
) {
  const { data } = await api.get(
    `${productsUrl(restaurantId, branchId, menuSetId, stageId)}/${optionId}`
  );

  return data?.option || null;
}

// Agregar un producto a una etapa.
export async function createMenuSetStageProduct(
  restaurantId, branchId, menuSetId, stageId, payload
) {
  const { data } = await api.post(
    productsUrl(restaurantId, branchId, menuSetId, stageId),
    payload
  );

  return data;
}

// Actualizar la configuración de un producto.
export async function updateMenuSetStageProduct(
  restaurantId, branchId, menuSetId, stageId, optionId, payload
) {
  const { data } = await api.put(
    `${productsUrl(restaurantId, branchId, menuSetId, stageId)}/${optionId}`,
    payload
  );

  return data;
}

// Retirar un producto de una etapa.
export async function deleteMenuSetStageProduct(
  restaurantId, branchId, menuSetId, stageId, optionId
) {
  const { data } = await api.delete(
    `${productsUrl(restaurantId, branchId, menuSetId, stageId)}/${optionId}`
  );

  return data;
}