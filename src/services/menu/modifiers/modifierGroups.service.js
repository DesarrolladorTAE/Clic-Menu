import api from "../../api";

export async function getModifierGroups(restaurantId, params = {}) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/modifier-groups`,
    { params }
  );

  return {
    data: data?.data ?? [],
    message: data?.message ?? "",
    modifiers_mode: data?.modifiers_mode ?? "global",
  };
}

export async function getModifierGroup(restaurantId, groupId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/modifier-groups/${groupId}`
  );

  return data?.data;
}

export async function createModifierGroup(restaurantId, payload) {
  const { data } = await api.post(
    `/restaurants/${restaurantId}/modifier-groups`,
    payload
  );

  return data?.data;
}

export async function updateModifierGroup(restaurantId, groupId, payload) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/modifier-groups/${groupId}`,
    payload
  );

  return data?.data;
}

export async function deleteModifierGroup(restaurantId, groupId) {
  const { data } = await api.delete(
    `/restaurants/${restaurantId}/modifier-groups/${groupId}`
  );

  return data;
}