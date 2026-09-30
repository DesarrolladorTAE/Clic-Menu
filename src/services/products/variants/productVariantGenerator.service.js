//src/services/products/variants/productVariantGenerator.service.js
import api from "../../api";


export async function generateProductVariants(restaurantId, productId, payload) {
  const selection = payload?.selections?.[0] || null;

  const body = {
    selections: selection
      ? [{
          attribute_id: Number(selection.attribute_id),
          value_ids: Array.from(
            new Set(
              (Array.isArray(selection.value_ids) ? selection.value_ids : [])
                .map(Number)
                .filter((id) => Number.isInteger(id) && id > 0)
            )
          ),
        }]
      : [],
  };

  const { data } = await api.post(
    `/restaurants/${restaurantId}/products/${productId}/variants/generate`,
    body,
  );

  return data;
}