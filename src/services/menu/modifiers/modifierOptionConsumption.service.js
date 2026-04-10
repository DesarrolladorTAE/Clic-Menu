import api from "../../api";
import { getIngredients } from "../../inventory/ingredients/ingredients.service";

export async function getModifierOptionConsumption(
  restaurantId,
  groupId,
  optionId
) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/modifier-groups/${groupId}/options/${optionId}/consumption`
  );

  return data?.data ?? null;
}

export async function saveModifierOptionConsumption(
  restaurantId,
  groupId,
  optionId,
  payload
) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/modifier-groups/${groupId}/options/${optionId}/consumption`,
    payload
  );

  return data?.data ?? null;
}

export async function deleteModifierOptionConsumption(
  restaurantId,
  groupId,
  optionId
) {
  const { data } = await api.delete(
    `/restaurants/${restaurantId}/modifier-groups/${groupId}/options/${optionId}/consumption`
  );

  return data;
}

export async function resolveModifierOptionConsumption(
  restaurantId,
  groupId,
  optionId,
  payload
) {
  const cleanPayload = {
    branch_id: Number(payload.branch_id),
    option_quantity: Number(payload.option_quantity ?? 1),
  };

  if (payload?.warehouse_id) {
    cleanPayload.warehouse_id = Number(payload.warehouse_id);
  }

  const { data } = await api.post(
    `/restaurants/${restaurantId}/modifier-groups/${groupId}/options/${optionId}/consumption/resolve`,
    cleanPayload
  );

  return data;
}

export async function fetchCatalogIngredients(restaurantId, params = {}) {
  const response = await getIngredients(restaurantId, {
    only_active:
      typeof params.only_active === "boolean" ? params.only_active : false,
    q: params.q || "",
  });

  return response?.data ?? [];
}

export async function fetchCatalogProducts(restaurantId, params = {}) {
  const { data } = await api.get(`/restaurants/${restaurantId}/products`, {
    params,
  });

  return Array.isArray(data?.data) ? data.data : [];
}

export async function fetchWarehousesByRestaurant(restaurantId, params = {}) {
  const { data } = await api.get(`/restaurants/${restaurantId}/warehouses`, {
    params,
  });

  return Array.isArray(data?.data) ? data.data : [];
}