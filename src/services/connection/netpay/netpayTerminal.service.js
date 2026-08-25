import api from "../../api";

export async function getRestaurantNetpayTerminals(restaurantId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/netpay-terminals`
  );

  return data;
}

export async function updateRestaurantNetpayTerminal(
  restaurantId,
  terminalId,
  payload
) {
  const { data } = await api.patch(
    `/restaurants/${restaurantId}/netpay-terminals/${terminalId}`,
    payload
  );

  return data;
}