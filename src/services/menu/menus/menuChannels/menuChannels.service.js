import api from "../../../api";

function menuChannelsPath(
  restaurantId,
  branchId,
  menuId
) {
  return `/restaurants/${restaurantId}/branches/${branchId}/menus/${menuId}/channels`;
}

export async function getMenuChannels(
  restaurantId,
  branchId,
  menuId
) {
  const { data } = await api.get(
    menuChannelsPath(
      restaurantId,
      branchId,
      menuId
    )
  );

  return {
    data: data?.data || null,
    message:
      data?.message ||
      "Configuración de canales cargada correctamente.",
  };
}

export async function syncMenuChannels(
  restaurantId,
  branchId,
  menuId,
  payload
) {
  const { data } = await api.put(
    menuChannelsPath(
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
      "Canales del menú sincronizados correctamente.",
  };
}