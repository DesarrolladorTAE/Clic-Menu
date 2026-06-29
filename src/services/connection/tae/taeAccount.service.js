import api from "../../api";

export async function getTaecontaAccount(restaurantId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/taeconta-account`
  );

  return data?.data ?? null;
}

export async function upsertTaecontaAccount(restaurantId, payload) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/taeconta-account`,
    payload
  );

  return data;
}

export async function deleteTaecontaAccount(restaurantId) {
  const { data } = await api.delete(
    `/restaurants/${restaurantId}/taeconta-account`
  );

  return data;
}