//src/services/menu/menus/menuContent/menuSetAssignment.service.js
import api from "../../../api";

function menuSetAssignmentPath(restaurantId, branchId, menuId) {
  return `/restaurants/${restaurantId}/branches/${branchId}/menus/${menuId}/menu-sets`;
}

export async function getMenuSetAssignments(restaurantId, branchId, menuId) {
  const { data } = await api.get(menuSetAssignmentPath(restaurantId, branchId, menuId));

  return {
    data: data?.data || null,
    message: data?.message || "Conjuntos del menú cargados correctamente.",
  };
}

export async function syncMenuSetAssignments(restaurantId, branchId, menuId, menuSetIds) {
  const { data } = await api.put(
    menuSetAssignmentPath(restaurantId, branchId, menuId),
    { menu_set_ids: menuSetIds }
  );

  return {
    data: data?.data || null,
    message: data?.message || "Conjuntos del menú actualizados correctamente.",
  };
}