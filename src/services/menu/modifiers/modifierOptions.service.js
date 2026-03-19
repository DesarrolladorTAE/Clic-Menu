import api from "../../api";

export async function getModifierOptions(restaurantId, groupId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/modifier-groups/${groupId}/options`
  );

  return data?.data ?? [];
}

export async function getModifierOption(restaurantId, groupId, optionId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/modifier-groups/${groupId}/options/${optionId}`
  );

  return data?.data;
}

export async function createModifierOption(restaurantId, groupId, payload) {
  const { data } = await api.post(
    `/restaurants/${restaurantId}/modifier-groups/${groupId}/options`,
    payload
  );

  return data?.data;
}

export async function updateModifierOption(
  restaurantId,
  groupId,
  optionId,
  payload
) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/modifier-groups/${groupId}/options/${optionId}`,
    payload
  );

  return data?.data;
}

export async function deleteModifierOption(restaurantId, groupId, optionId) {
  const { data } = await api.delete(
    `/restaurants/${restaurantId}/modifier-groups/${groupId}/options/${optionId}`
  );

  return data;
}

export async function getAllModifierOptions(restaurantId, groups = []) {
  if (!Array.isArray(groups) || groups.length === 0) {
    return [];
  }

  const responses = await Promise.all(
    groups.map(async (group) => {
      const rows = await getModifierOptions(restaurantId, group.id);

      return (Array.isArray(rows) ? rows : []).map((option) => ({
        ...option,
        modifier_group_id: option?.modifier_group_id ?? group.id,
      }));
    })
  );

  return responses.flat();
}