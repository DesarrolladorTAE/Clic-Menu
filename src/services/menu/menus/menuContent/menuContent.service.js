import api from "../../../api";

function menuContentPath(
  restaurantId,
  branchId,
  menuId
) {
  return `/restaurants/${restaurantId}/branches/${branchId}/menus/${menuId}/content`;
}

export async function getMenuContentCatalog(
  restaurantId,
  branchId,
  menuId
) {
  const { data } = await api.get(
    `${menuContentPath(
      restaurantId,
      branchId,
      menuId
    )}/catalog`
  );

  return {
    data: data?.data || null,
    message:
      data?.message ||
      "Catálogo seleccionable cargado correctamente.",
  };
}

export async function getMenuContent(
  restaurantId,
  branchId,
  menuId
) {
  const { data } = await api.get(
    menuContentPath(
      restaurantId,
      branchId,
      menuId
    )
  );

  return {
    data: data?.data || null,
    message:
      data?.message ||
      "Contenido del menú cargado correctamente.",
  };
}

export async function syncMenuContent(
  restaurantId,
  branchId,
  menuId,
  payload
) {
  const { data } = await api.put(
    menuContentPath(
      restaurantId,
      branchId,
      menuId
    ),
    payload
  );

  return {
    data: data?.data || null,
    message:
      data?.message ||
      "Contenido del menú guardado correctamente.",
  };
}