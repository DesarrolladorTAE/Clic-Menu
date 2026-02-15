import api from "../../api";

export async function changeProductType(restaurantId, productId, product_type) {
  const { data } = await api.put(
    `/restaurants/${restaurantId}/products/${productId}/type`,
    { product_type }
  );
  return data;
}
