//src/services/products/variants/productVariantImages.service.js
import api from "../../api";

/**
 * GET /api/restaurants/{restaurant}/products/{product}/variants/{variant}/image
 *
 * Obtiene la imagen propia de la variante.
 * Si la variante no tiene imagen, variant_image y effective_image son null.
 */
export async function getProductVariantImage(restaurantId, productId, variantId) {
  const { data } = await api.get(
    `/restaurants/${restaurantId}/products/${productId}/variants/${variantId}/image`
  );

  return data?.data ?? null;
}

/**
 * POST /api/restaurants/{restaurant}/products/{product}/variants/{variant}/image
 *
 * Crea la imagen propia de la variante o reemplaza la existente.
 */
export async function uploadProductVariantImage(
  restaurantId,
  productId,
  variantId,
  file
) {
  const formData = new FormData();
  formData.append("image", file);

  const { data } = await api.post(
    `/restaurants/${restaurantId}/products/${productId}/variants/${variantId}/image`,
    formData
  );

  return data?.data ?? null;
}

/**
 * DELETE /api/restaurants/{restaurant}/products/{product}/variants/{variant}/image
 *
 * Elimina la imagen propia de la variante.
 * Después de eliminarla, la variante queda sin imagen.
 */
export async function deleteProductVariantImage(
  restaurantId,
  productId,
  variantId
) {
  const { data } = await api.delete(
    `/restaurants/${restaurantId}/products/${productId}/variants/${variantId}/image`
  );

  return data?.data ?? null;
}