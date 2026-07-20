import api from "../api";

export async function getRestaurantSettings(restaurantId) {
  const { data } = await api.get(`/restaurants/${restaurantId}/settings`);

  return {
    ...(data?.data ?? {}),
    _meta: {
      ui: data?.ui ?? null,
      plan_access: data?.plan_access ?? null,
      cash_register_reconfiguration:
        data?.cash_register_reconfiguration ?? null,
    },
  };
}

export async function upsertRestaurantSettings(restaurantId, payload) {
  const { data } = await api.put(`/restaurants/${restaurantId}/settings`, payload);

  return {
    settings: data?.data ?? null,
    ui: data?.ui ?? null,
    plan_access: data?.plan_access ?? null,

    inventory_mode_changed:
      Boolean(data?.inventory_mode_changed),

    previous_inventory_mode:
      data?.previous_inventory_mode ?? null,

    cash_register_reconfiguration:
      data?.cash_register_reconfiguration ?? null,

    recipe_mode_forced:
      Boolean(data?.recipe_mode_forced),

    attention_mode_sync:
      data?.attention_mode_sync ?? null,

    message: data?.message ?? null,
  };
}