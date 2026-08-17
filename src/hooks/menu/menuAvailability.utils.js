import {
  AVAILABILITY_STATUS_NO_LONGER_SELLABLE,
  AVAILABILITY_STATUS_UNAVAILABLE_BY_SCHEDULE,
  getAvailabilityData,
  translateAvailabilityStatus,
} from "../public/publicMenu.utils";

export const AVAILABILITY_STATUS_AVAILABLE = "available";

const MENU_AVAILABILITY_INDEX_TYPE = "menu_availability_index";

/* =========================
   Internal helpers
========================= */

function hasOwn(source, key) {
  return (
    source != null &&
    typeof source === "object" &&
    Object.prototype.hasOwnProperty.call(source, key)
  );
}

function normalizePositiveId(value) {
  if (value === null || value === undefined || value === "") return null;

  const id = Number(value);

  return Number.isFinite(id) && id > 0 ? id : null;
}

function normalizeStatus(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeReason(value) {
  const reason = String(value || "").trim();
  return reason !== "" ? reason : null;
}

function normalizeMaxAvailableQty(value) {
  if (value === null || value === undefined || value === "") return null;

  const quantity = Number(value);
  if (!Number.isFinite(quantity)) return null;

  return Math.max(0, Math.floor(quantity));
}

function extractMenuSections(source) {
  if (Array.isArray(source)) return source;
  if (Array.isArray(source?.sections)) return source.sections;
  if (Array.isArray(source?.data?.sections)) return source.data.sections;
  if (Array.isArray(source?.data?.data?.sections)) {
    return source.data.data.sections;
  }

  return [];
}

function buildProductIndexKey(productId) {
  return `product:${Number(productId)}`;
}

function buildVariantIndexKey(productId, variantId) {
  return ["variant", Number(productId), Number(variantId)].join(":");
}

function isMenuAvailabilityIndex(source) {
  return (
    source?.type === MENU_AVAILABILITY_INDEX_TYPE &&
    source?.products instanceof Map &&
    source?.variants instanceof Map
  );
}

/**
 * Normaliza únicamente el payload efectivo de disponibilidad.
 *
 * No calcula horarios ni inventario. Confía en:
 * - source.availability;
 * - o un objeto de disponibilidad recibido directamente.
 */
function normalizeEffectiveAvailability(source) {
  const availability = getAvailabilityData(source);

  if (!availability) return null;

  const status = normalizeStatus(availability?.status);

  if (status === "") return null;

  const hasExplicitAvailabilityFlag = hasOwn(
    availability,
    "is_available_now",
  );

  const isAvailableNow = hasExplicitAvailabilityFlag
    ? Boolean(availability.is_available_now)
    : status === AVAILABILITY_STATUS_AVAILABLE;

  let reason = normalizeReason(availability?.reason);

  if (!reason && status !== AVAILABILITY_STATUS_AVAILABLE) {
    reason = translateAvailabilityStatus(status);
  }

  return {
    ...availability,
    status,
    is_available_now: isAvailableNow,
    reason,
    max_available_qty: normalizeMaxAvailableQty(availability?.max_available_qty),
  };
}

function isScheduleAvailabilityBlocked(availability) {
  if (!availability) return false;

  const status = normalizeStatus(availability?.status);
  const source = normalizeStatus(availability?.source);

  if (status === AVAILABILITY_STATUS_UNAVAILABLE_BY_SCHEDULE) {
    return true;
  }

  return source === "schedule" && availability?.is_available_now === false;
}

/**
 * Backend ya entrega la disponibilidad efectiva de cada variante.
 *
 * Como protección adicional:
 * - si el producto padre está bloqueado por horario, bloquea la variante;
 * - en cualquier otro caso, se usa la disponibilidad de la variante;
 * - si la variante no tiene disponibilidad, se usa la del producto.
 */
function resolveVariantAvailability(product, variant) {
  const productAvailability = normalizeEffectiveAvailability(product);

  if (isScheduleAvailabilityBlocked(productAvailability)) {
    return productAvailability;
  }

  const variantAvailability = normalizeEffectiveAvailability(variant);

  return variantAvailability || productAvailability;
}

function buildMissingCatalogAvailability({
  productId,
  variantId = null,
  reason,
}) {
  return {
    product_id: productId,
    variant_id: variantId,
    status: AVAILABILITY_STATUS_NO_LONGER_SELLABLE,
    is_available_now: false,
    reason,
    source: "catalog",
  };
}

function buildAvailabilityFields(availability) {
  if (!availability) {
    return {
      availability_status: null,
      availability_reason: null,
      is_available_now: true,
      availability: null,
    };
  }

  return {
    availability_status: normalizeStatus(availability?.status) || null,
    availability_reason: normalizeReason(availability?.reason),
    is_available_now: availability?.is_available_now !== false,
    availability: { ...availability },
  };
}

/* =========================
   Cart line identity
========================= */

/**
 * Obtiene el product_id de una línea pendiente.
 *
 * Compatibilidad:
 * - product_id;
 * - product.id;
 * - id.
 */
export function getCartLineProductId(line) {
  return normalizePositiveId(
    line?.product_id ?? line?.product?.id ?? line?.id,
  );
}

/**
 * Obtiene la variante seleccionada de una línea pendiente.
 */
export function getCartLineVariantId(line) {
  return normalizePositiveId(
    line?.variant_id ??
      line?.product_variant_id ??
      line?.selected_variant_id ??
      line?.variant?.id,
  );
}

/* =========================
   Menu index
========================= */

/**
 * Construye un índice de productos y variantes a partir
 * del catálogo recibido del backend.
 *
 * El índice no modifica el menú original.
 */
export function buildMenuAvailabilityIndex(menuSource) {
  const sections = extractMenuSections(menuSource);
  const products = new Map();
  const variants = new Map();

  sections.forEach((section) => {
    const categories = Array.isArray(section?.categories)
      ? section.categories
      : [];

    categories.forEach((category) => {
      const categoryProducts = Array.isArray(category?.products)
        ? category.products
        : [];

      categoryProducts.forEach((product) => {
        const productId = normalizePositiveId(
          product?.id ?? product?.product_id,
        );

        if (!productId) return;

        const productAvailability = normalizeEffectiveAvailability(product);

        const productRecord = {
          productId,
          sectionId: normalizePositiveId(section?.id),
          categoryId: normalizePositiveId(category?.id),
          product,
          availability: productAvailability,
          variants: new Map(),
        };

        products.set(buildProductIndexKey(productId), productRecord);

        const productVariants = Array.isArray(product?.variants)
          ? product.variants
          : [];

        productVariants.forEach((variant) => {
          const variantId = normalizePositiveId(
            variant?.id ?? variant?.variant_id,
          );

          if (!variantId) return;

          const availability = resolveVariantAvailability(product, variant);

          const variantRecord = {
            productId,
            variantId,
            product,
            variant,
            availability,
          };

          productRecord.variants.set(variantId, variantRecord);

          variants.set(
            buildVariantIndexKey(productId, variantId),
            variantRecord,
          );
        });
      });
    });
  });

  return {
    type: MENU_AVAILABILITY_INDEX_TYPE,
    sections,
    products,
    variants,
    productsCount: products.size,
    variantsCount: variants.size,
  };
}

/**
 * Devuelve un índice ya construido o crea uno
 * a partir del catálogo recibido.
 */
export function ensureMenuAvailabilityIndex(source) {
  return isMenuAvailabilityIndex(source)
    ? source
    : buildMenuAvailabilityIndex(source);
}

/* =========================
   Availability lookup
========================= */

/**
 * Consulta el producto o variante actual dentro del catálogo.
 *
 * found:
 * - true: el producto o variante sigue presente;
 * - false: desapareció del catálogo recargado.
 */
export function getMenuAvailabilityRecord(
  indexSource,
  productIdValue,
  variantIdValue = null,
) {
  const index = ensureMenuAvailabilityIndex(indexSource);
  const productId = normalizePositiveId(productIdValue);
  const variantId = normalizePositiveId(variantIdValue);

  if (!productId) {
    return {
      found: false,
      missingType: "product",
      productId: null,
      variantId,
      productRecord: null,
      variantRecord: null,
      availability: null,
    };
  }

  const productRecord =
    index.products.get(buildProductIndexKey(productId)) || null;

  if (!productRecord) {
    return {
      found: false,
      missingType: "product",
      productId,
      variantId,
      productRecord: null,
      variantRecord: null,
      availability: null,
    };
  }

  if (!variantId) {
    return {
      found: true,
      missingType: null,
      productId,
      variantId: null,
      productRecord,
      variantRecord: null,
      availability: productRecord.availability,
    };
  }

  const variantRecord =
    index.variants.get(buildVariantIndexKey(productId, variantId)) || null;

  if (!variantRecord) {
    return {
      found: false,
      missingType: "variant",
      productId,
      variantId,
      productRecord,
      variantRecord: null,
      availability: null,
    };
  }

  return {
    found: true,
    missingType: null,
    productId,
    variantId,
    productRecord,
    variantRecord,
    availability: variantRecord.availability,
  };
}

/**
 * Devuelve solamente la disponibilidad efectiva
 * del producto o variante.
 */
export function getEffectiveMenuAvailability(
  indexSource,
  productId,
  variantId = null,
) {
  const record = getMenuAvailabilityRecord(
    indexSource,
    productId,
    variantId,
  );

  return record?.availability || null;
}

/* =========================
   Pending cart reconciliation
========================= */

/**
 * Reconciliación de líneas locales todavía no persistidas.
 * Actualiza exclusivamente el estado de disponibilidad recibido
 * nuevamente desde el catálogo del backend:
 * - availability_status;
 * - availability_reason;
 * - is_available_now;
 * - availability, incluyendo max_available_qty.
 *
 * No modifica:
 * - key;
 * - product_id;
 * - variant_id;
 * - quantity;
 * - unit_price;
 * - price;
 * - promociones;
 * - componentes;
 * - modificadores;
 * - notas;
 * - extras;
 * - importes.
 */
export function reconcilePendingCartAvailability(items, menuSource) {
  const rows = Array.isArray(items) ? items : [];
  const index = ensureMenuAvailabilityIndex(menuSource);

  return rows.map((line) => {
    if (!line || typeof line !== "object") return line;

    const productId = getCartLineProductId(line);
    const variantId = getCartLineVariantId(line);

    const record = getMenuAvailabilityRecord(
      index,
      productId,
      variantId,
    );

    let availability = record?.availability || null;

    if (!record?.found) {
      if (record?.missingType === "variant") {
        availability = buildMissingCatalogAvailability({
          productId,
          variantId,
          reason: "La variante seleccionada dejó de estar disponible.",
        });
      } else {
        availability = buildMissingCatalogAvailability({
          productId,
          variantId,
          reason: "Este producto dejó de estar disponible.",
        });
      }
    }

    return {
      ...line,
      ...buildAvailabilityFields(availability),
    };
  });
}

/* =========================
   Invalid cart lines
========================= */

/**
 * Determina si una línea pendiente está bloqueada.
 *
 * Autoridad:
 * - is_available_now;
 * - status;
 * - max_available_qty entregado por backend.
 *
 * No calcula inventario ni modifica quantity.
 */
export function isCartItemAvailabilityInvalid(item) {
  if (!item || typeof item !== "object") return false;
  if (item?.is_available_now === false) return true;

  const availability = getAvailabilityData(item);
  if (availability?.is_available_now === false) return true;

  const status = normalizeStatus(
    item?.availability_status || availability?.status,
  );

  if (status !== "" && status !== AVAILABILITY_STATUS_AVAILABLE) return true;

  const maxAvailableQty = normalizeMaxAvailableQty(
    availability?.max_available_qty,
  );

  if (maxAvailableQty !== null) {
    const quantity = Math.max(0, Number(item?.quantity || 0));
    if (quantity > maxAvailableQty) return true;
  }

  return false;
}

/**
 * Devuelve únicamente las líneas pendientes inválidas.
 */
export function getInvalidCartItems(items) {
  const rows = Array.isArray(items) ? items : [];

  return rows.filter(isCartItemAvailabilityInvalid);
}

/**
 * Cuenta líneas inválidas, no cantidades.
 *
 * Una línea con quantity = 5 cuenta como una sola línea inválida.
 */
export function countInvalidCartItems(items) {
  return getInvalidCartItems(items).length;
}

/**
 * Indica si existe al menos una línea inválida.
 */
export function hasInvalidCartItems(items) {
  return countInvalidCartItems(items) > 0;
}