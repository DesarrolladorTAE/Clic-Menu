import api from "../../api";

export async function getTaecontaTaxProfile(restaurantId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/taeconta-tax-profile`
  );

  return data?.data ?? null;
}

export async function syncTaecontaTaxProfile(restaurantId) {
  const { data } = await api.post(
    `/restaurants/${restaurantId}/taeconta-tax-profile/sync`
  );

  return data;
}