/**
 * Centraliza el contrato Front de una unidad de Preparación rápida.
 *
 * Qué usa:
 * - El payload de PreparedItems entregado por los endpoints de Mesero, Público y Caja.
 * - prepared_item_id como única identidad física de la unidad.
 *
 * Qué archivos lo usarán:
 * - src/hooks/staff/useStaffCartAndOrder.js
 * - src/hooks/public/useCartAndOrder.js
 * - src/hooks/staff/useCashierDirectCartAndOrder.js
 * - src/hooks/menu/menuAvailability.utils.js
 * - componentes compartidos de Preparación rápida y carrito.
 *
 * No calcula disponibilidad normal, no reconstruye configuración física,
 * no modifica variantes/modifiers/components y no permite quantity > 1.
 */

export const PREPARED_ITEM_KIND = "prepared";
export const PREPARED_ITEM_KEY_PREFIX = "prepared:";

function toPositiveInt(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return null;

  return Math.trunc(number);
}

function toNullablePositiveInt(value) {
  if (value === null || value === undefined || value === "") return null;
  return toPositiveInt(value);
}

function normalizeNotes(value) {
  if (value === null || value === undefined || value === "") return null;
  return String(value).slice(0, 500);
}

function collectModifierNames(modifiers, lines) {
  (Array.isArray(modifiers) ? modifiers : []).forEach((modifier) => {
    const name = String(modifier?.name || "").trim();
    if (!name) return;

    const quantity = Math.max(1, Number(modifier?.quantity || 1));
    lines.push(quantity > 1 ? `${name} x${quantity}` : name);
  });
}

function collectComponentModifierNames(components, lines) {
  (Array.isArray(components) ? components : []).forEach((component) => {
    collectModifierNames(component?.modifiers, lines);
    collectComponentModifierNames(component?.components, lines);
  });
}

/**
 * Resuelve el nombre comercial visible de un PreparedItem sin depender
 * del endpoint que originó la unidad.
 */
export function getPreparedItemDisplayName(item) {
  if (!item || typeof item !== "object") return "Producto";

  const name = String(
    item.product_name ??
      item?.product?.name ??
      item.name ??
      "Producto",
  ).trim();

  return name || "Producto";
}

/**
 * Normaliza la configuración visible de Preparación rápida.
 *
 * Soporta:
 * - configuration_summary de endpoints dedicados;
 * - configuration de quick_preparation incluido en el menú inicial.
 */
export function getPreparedItemConfigurationSummary(item) {
  if (!item || typeof item !== "object") return [];

  const direct = Array.isArray(item.configuration_summary)
    ? item.configuration_summary.map((line) => String(line || "").trim()).filter(Boolean)
    : [];

  if (direct.length > 0) return Array.from(new Set(direct));

  const configuration =
    item.configuration && typeof item.configuration === "object"
      ? item.configuration
      : null;

  if (!configuration) return [];

  const lines = [];
  collectModifierNames(configuration?.modifiers, lines);
  collectComponentModifierNames(configuration?.components, lines);

  return Array.from(new Set(lines));
}

/**
 * Resuelve el precio comercial visible sin depender del origen del payload.
 */
export function getPreparedItemCurrentPrice(item) {
  if (!item || typeof item !== "object") return null;

  const raw =
    item.current_price ??
    item.price ??
    item.unit_price ??
    item?.pricing?.unit_price;

  const price = Number(raw);
  return Number.isFinite(price) ? Math.max(0, price) : null;
}

/**
 * Obtiene la identidad física de un PreparedItem.
 *
 * No utiliza product_id, variant_id ni id como fallback.
 */
export function getPreparedItemId(item) {
  if (!item || typeof item !== "object") return null;

  return toPositiveInt(item.prepared_item_id);
}

/**
 * Indica si una línea pertenece a Preparación rápida.
 *
 * prepared_item_id es la autoridad. `kind` sirve como metadato visual,
 * pero nunca sustituye la identidad física.
 */
export function isPreparedItemLine(item) {
  return getPreparedItemId(item) !== null;
}

/**
 * Construye la key estable de una unidad física.
 *
 * Ejemplo:
 * prepared:25
 */
export function getPreparedItemCartKey(item) {
  const preparedItemId =
    item && typeof item === "object"
      ? getPreparedItemId(item)
      : toPositiveInt(item);

  return preparedItemId ? `${PREPARED_ITEM_KEY_PREFIX}${preparedItemId}` : null;
}

/**
 * Construye una línea local de carrito desde el payload de Preparación rápida.
 *
 * No arrastra availability, modifiers, components ni ninguna configuración
 * física que el Backend reconstruye desde el snapshot del PreparedItem.
 */
export function buildPreparedItemCartLine(preparedItem) {
  if (!preparedItem || typeof preparedItem !== "object") return null;

  const preparedItemId = getPreparedItemId(preparedItem);
  const productId = toPositiveInt(preparedItem.product_id ?? preparedItem?.product?.id);

  if (!preparedItemId || !productId) return null;

  const productName = getPreparedItemDisplayName(preparedItem);
  const currentPrice = getPreparedItemCurrentPrice(preparedItem) ?? 0;

  const pricing =
    preparedItem.pricing && typeof preparedItem.pricing === "object"
      ? { ...preparedItem.pricing }
      : null;

  return {
    key: getPreparedItemCartKey(preparedItemId),
    kind: PREPARED_ITEM_KIND,
    prepared_item_id: preparedItemId,
    product_id: productId,
    name: productName,
    product_name: productName,
    variant_id: toNullablePositiveInt(preparedItem.variant_id ?? preparedItem?.variant?.id),
    configuration_summary: getPreparedItemConfigurationSummary(preparedItem),
    current_price: currentPrice,
    unit_price: currentPrice,
    pricing,
    expires_at: preparedItem.expires_at || null,
    prepared_at: preparedItem.prepared_at || null,
    quantity: 1,
    notes: "",
  };
}

/**
 * Comprueba si una unidad física ya fue agregada.
 *
 * Puede recibir el PreparedItem completo o directamente su prepared_item_id.
 */
export function isPreparedItemAlreadySelected(items, preparedItemOrId) {
  const rows = Array.isArray(items) ? items : [];

  const preparedItemId =
    preparedItemOrId && typeof preparedItemOrId === "object"
      ? getPreparedItemId(preparedItemOrId)
      : toPositiveInt(preparedItemOrId);

  if (!preparedItemId) return false;

  return rows.some((item) => getPreparedItemId(item) === preparedItemId);
}

/**
 * Serializa una línea PreparedItem para enviarla al Backend.
 *
 * La configuración física nunca sale del Front. OrderPricingResolver
 * reconstruye product_id, variant_id, modifiers y components desde el snapshot.
 */
export function serializePreparedItemLine(item) {
  const preparedItemId = getPreparedItemId(item);
  if (!preparedItemId) return null;

  return {
    prepared_item_id: preparedItemId,
    quantity: 1,
    notes: normalizeNotes(item?.notes),
  };
}