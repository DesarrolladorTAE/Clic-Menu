import api from "../../api";

export async function getCompositeComponentVariantModifierGroups(
  restaurantId,
  productId,
  params = {}
) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/products/${productId}/component-variant-modifier-groups`,
    { params }
  );

  return {
    data: data?.data ?? [],
    branch_id: data?.branch_id ?? null,
    modifier_branch_id: data?.modifier_branch_id ?? null,
    modifiers_mode: data?.modifiers_mode ?? "global",
    products_mode: data?.products_mode ?? "global",
    message: data?.message ?? "",
  };
}

export async function createCompositeComponentVariantModifierGroup(
  restaurantId,
  productId,
  payload
) {
  const { data } = await api.post(
    `/restaurants/${restaurantId}/products/${productId}/component-variant-modifier-groups`,
    payload
  );

  return data?.data;
}

export async function updateCompositeComponentVariantModifierGroup(
  restaurantId,
  productId,
  assignmentId,
  payload
) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/products/${productId}/component-variant-modifier-groups/${assignmentId}`,
    payload
  );

  return data?.data;
}

export async function deleteCompositeComponentVariantModifierGroup(
  restaurantId,
  productId,
  assignmentId,
  params = {}
) {
  const { data } = await api.delete(
    `/restaurants/${restaurantId}/products/${productId}/component-variant-modifier-groups/${assignmentId}`,
    { params }
  );

  return data;
}