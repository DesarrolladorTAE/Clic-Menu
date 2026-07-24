import api from "../../api";

function menusPath(restaurantId, branchId) {
  return `/restaurants/${restaurantId}/branches/${branchId}/menus`;
}

export async function getMenus(
  restaurantId,
  branchId,
  params = {}
) {
  const { data } = await api.get(
    menusPath(restaurantId, branchId),
    { params }
  );

  return {
    menus: Array.isArray(data?.data) ? data.data : [],
    meta: data?.meta || null,
    message: data?.message || "",
  };
}

export async function getMenu(
  restaurantId,
  branchId,
  menuId
) {
  const { data } = await api.get(
    `${menusPath(restaurantId, branchId)}/${menuId}`
  );

  return {
    menu: data?.data || null,
    message: data?.message || "",
  };
}

export async function createMenu(
  restaurantId,
  branchId,
  payload
) {
  const { data } = await api.post(
    menusPath(restaurantId, branchId),
    payload
  );

  return {
    menu: data?.data || null,
    message:
      data?.message ||
      "Menú creado correctamente.",
  };
}

export async function updateMenu(
  restaurantId,
  branchId,
  menuId,
  payload
) {
  const { data } = await api.put(
    `${menusPath(restaurantId, branchId)}/${menuId}`,
    payload
  );

  return {
    menu: data?.data || null,
    message:
      data?.message ||
      "Menú actualizado correctamente.",
  };
}

export async function activateMenu(
  restaurantId,
  branchId,
  menuId
) {
  return updateMenu(
    restaurantId,
    branchId,
    menuId,
    {
      status: "active",
    }
  );
}

export async function archiveMenu(
  restaurantId,
  branchId,
  menuId
) {
  const { data } = await api.post(
    `${menusPath(restaurantId, branchId)}/${menuId}/archive`
  );

  return {
    menu: data?.data || null,
    message:
      data?.message ||
      "Menú archivado correctamente.",
  };
}