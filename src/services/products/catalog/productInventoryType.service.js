import api from "../../api";

export async function changeInventoryType(restaurantId, productId, inventory_type) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/products/${productId}/inventory-type`,
    { inventory_type }
  );
  return data;
}
