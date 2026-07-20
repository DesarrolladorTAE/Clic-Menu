import api from "../api";

const buildBase = (restaurantId) =>
  `/restaurants/${restaurantId}/cash-registers`;

const normalizeCashRegistersResponse = (payload) => {
  return {
    ok: payload?.ok === true,

    meta:
      payload?.meta &&
      typeof payload.meta === "object" &&
      !Array.isArray(payload.meta)
        ? payload.meta
        : {},

    warehouse_options_by_branch: Array.isArray(
      payload?.warehouse_options_by_branch
    )
      ? payload.warehouse_options_by_branch
      : [],

    data: Array.isArray(payload?.data)
      ? payload.data
      : [],
  };
};

/**
 * Devuelve la respuesta completa del listado de cajas.
 *
 * Incluye:
 * - meta;
 * - warehouse_options_by_branch;
 * - data.
 *
 * Esta función debe utilizarse en la pantalla administrativa
 * que necesita interpretar la política de almacenes.
 */
export async function getCashRegistersOverview(restaurantId) {
  const { data } = await api.get(buildBase(restaurantId));

  return normalizeCashRegistersResponse(data);
}

/**
 * Compatibilidad con consumidores existentes.
 *
 * Mantiene el comportamiento anterior y devuelve únicamente
 * el arreglo de cajas.
 */
export async function getCashRegisters(restaurantId) {
  const response = await getCashRegistersOverview(restaurantId);

  return response.data;
}

export async function createCashRegister(
  restaurantId,
  payload
) {
  const { data } = await api.post(
    buildBase(restaurantId),
    payload
  );

  return data?.data;
}

export async function updateCashRegister(
  restaurantId,
  cashRegisterId,
  payload
) {
  const { data } = await api.put(
    `${buildBase(restaurantId)}/${cashRegisterId}`,
    payload
  );

  return data?.data;
}

export async function deleteCashRegister(
  restaurantId,
  cashRegisterId
) {
  const { data } = await api.delete(
    `${buildBase(restaurantId)}/${cashRegisterId}`
  );

  return data;
}

export async function getRestaurantPlanAccess(
  restaurantId
) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/plan-access`
  );

  return data?.data || null;
}