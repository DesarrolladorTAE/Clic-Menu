//src/services/menu/menuSets/menuSet.service.js
import api from "../../api";

// Consultar los conjuntos de una sucursal.
export async function getMenuSets(restaurantId, branchId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/branches/${branchId}/menu-sets`
  );

  return Array.isArray(data?.menu_sets) ? data.menu_sets : [];
}

// Activar o desactivar un conjunto.
export async function changeMenuSetStatus(restaurantId, branchId, menuSetId, isActive) {
  const { data } = await api.patch(
    `/restaurants/${restaurantId}/branches/${branchId}/menu-sets/${menuSetId}`,
    { is_active: isActive }
  );

  return data;
}

// Eliminar un conjunto cuando esté permitido.
export async function deleteMenuSet(restaurantId, branchId, menuSetId) {
  const { data } = await api.delete(
    `/restaurants/${restaurantId}/branches/${branchId}/menu-sets/${menuSetId}`
  );

  return data;
}

// Crear un conjunto en una sucursal.
export async function createMenuSet(restaurantId, branchId, payload) {
  const { data } = await api.post(
    `/restaurants/${restaurantId}/branches/${branchId}/menu-sets`,
    payload
  );

  return data;
}

// Consultar la información de un conjunto.
export async function getMenuSet(restaurantId, branchId, menuSetId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/branches/${branchId}/menu-sets/${menuSetId}`
  );

  return data?.menu_set || null;
}

// Actualizar la configuración general de un conjunto.
export async function updateMenuSet(restaurantId, branchId, menuSetId, payload) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/branches/${branchId}/menu-sets/${menuSetId}`,
    payload
  );

  return data;
}