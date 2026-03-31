import api from "../api";


const buildBase = (restaurantId) => `/restaurants/${restaurantId}/cash-registers`;

export async function getCashRegisters(restaurantId) {
  const { data } = await api.get(buildBase(restaurantId));
  return Array.isArray(data?.data) ? data.data : [];
}

export async function createCashRegister(restaurantId, payload) {
  const { data } = await api.post(buildBase(restaurantId), payload);
  return data?.data;
}

export async function updateCashRegister(restaurantId, cashRegisterId, payload) {
  const { data } = await api.put(
    `${buildBase(restaurantId)}/${cashRegisterId}`,
    payload
  );
  return data?.data;
}

export async function deleteCashRegister(restaurantId, cashRegisterId) {
  const { data } = await api.delete(
    `${buildBase(restaurantId)}/${cashRegisterId}`
  );
  return data;
}