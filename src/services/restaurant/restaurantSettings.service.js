import api from "../api";

export async function getRestaurantSettings(restaurantId) {
  const { data } = await api.get(`/restaurants/${restaurantId}/settings`);

  return {
    ...(data?.data ?? {}),
    _meta: {
      ui: data?.ui ?? null,
      plan_access: data?.plan_access ?? null,
    },
  };
}

export async function upsertRestaurantSettings(restaurantId, payload) {
  const { data } = await api.put(`/restaurants/${restaurantId}/settings`, payload);

  return {
    settings: data?.data ?? null,
    ui: data?.ui ?? null,
    plan_access: data?.plan_access ?? null,
    recipe_mode_forced: Boolean(data?.recipe_mode_forced),
    message: data?.message ?? null,
  };
}