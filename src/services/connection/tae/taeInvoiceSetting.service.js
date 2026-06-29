import api from "../../api";

export async function getTaecontaInvoiceSetting(restaurantId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/taeconta-invoice-setting`
  );

  return data?.data ?? null;
}

export async function upsertTaecontaInvoiceSetting(restaurantId, payload) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/taeconta-invoice-setting`,
    payload
  );

  return data;
}

export async function deleteTaecontaInvoiceSetting(restaurantId) {
  const { data } = await api.delete(
    `/restaurants/${restaurantId}/taeconta-invoice-setting`
  );

  return data;
}