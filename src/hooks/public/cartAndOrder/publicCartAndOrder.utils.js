import {
  extractApiErrorInfo,
  normalizeCompositeComponentsForKey,
  normalizeModifierGroupsForKey,
  normalizePromotionPresentation,
  safeNum,
} from "../publicMenu.utils";
import {
  getCartLineProductId,
  getCartLineVariantId,
} from "../../menu/menuAvailability.utils";
import {
  isPreparedItemLine,
  serializePreparedItemLine,
} from "../../menu/preparedItem.utils";

/*
|--------------------------------------------------------------------------
| publicCartAndOrder.utils
|--------------------------------------------------------------------------
| Funciones puras internas del flujo Public de carrito y órdenes.
|
| Usa:
| - publicMenu.utils.js.
| - menuAvailability.utils.js.
| - preparedItem.utils.js.
|
| Lo usan:
| - usePublicCart.js.
| - usePublicWebOrdering.js.
| - usePublicTableOrder.js.
| - useCartAndOrder.js.
|--------------------------------------------------------------------------
*/

export function normalizeItemsForApi(cart) {
  const arr = Array.isArray(cart) ? cart : [];

  return arr.map((it) => {
    if (isPreparedItemLine(it)) {
      return serializePreparedItemLine(it);
    }

    const out = {
      product_id: Number(it.product_id),
      variant_id: it.variant_id ? Number(it.variant_id) : null,
      quantity: Number(it.quantity || 1),
      notes: it.notes ? String(it.notes).slice(0, 500) : null,
    };

    const parentModifiers = normalizeModifierGroupsForKey(it?.modifiers || []);

    if (parentModifiers.length > 0) {
      out.modifiers = parentModifiers.map((g) => ({
        ...g,
        options: g.options.map((o) => ({
          modifier_option_id: Number(o.modifier_option_id),
          quantity: Number(o.quantity || 1),
        })),
      }));
    }

    if (Array.isArray(it.components) && it.components.length > 0) {
      out.components = normalizeCompositeComponentsForKey(it.components).map((c) => {
        const componentPayload = {
          component_product_id: Number(c.component_product_id),
          variant_id: c.variant_id ? Number(c.variant_id) : null,
          quantity: c.quantity == null ? null : Number(c.quantity),
        };

        const componentModifiers = normalizeModifierGroupsForKey(c?.modifiers || []);

        if (componentModifiers.length > 0) {
          componentPayload.modifiers = componentModifiers.map((g) => ({
            ...g,
            options: g.options.map((o) => ({
              modifier_option_id: Number(o.modifier_option_id),
              quantity: Number(o.quantity || 1),
            })),
          }));
        }

        return componentPayload;
      });
    }

    return out;
  }).filter(Boolean);
}

export function normalizeOnlineOrderItemsForApi(cart) {
  const arr = Array.isArray(cart) ? cart : [];

  return arr.map((item) => {
    if (isPreparedItemLine(item)) {
      return serializePreparedItemLine(item);
    }

    const payload = {
      product_id: Number(item.product_id),
      variant_id: item.variant_id ? Number(item.variant_id) : null,
      quantity: Number(item.quantity || 1),
      notes: item.notes ? String(item.notes).slice(0, 500) : null,
    };

    const parentModifiers = normalizeModifierGroupsForKey(item?.modifiers || []);

    if (parentModifiers.length > 0) {
      payload.modifiers = parentModifiers.map((group) => ({
        modifier_group_id: Number(group.modifier_group_id),
        options: group.options.map((option) => ({
          modifier_option_id: Number(option.modifier_option_id),
          quantity: Number(option.quantity || 1),
        })),
      }));
    }

    if (Array.isArray(item.components) && item.components.length > 0) {
      payload.components = normalizeCompositeComponentsForKey(item.components).map((component) => {
        const componentPayload = {
          component_product_id: Number(component.component_product_id),
          variant_id: component.variant_id ? Number(component.variant_id) : null,
        };

        const componentModifiers = normalizeModifierGroupsForKey(component?.modifiers || []);

        if (componentModifiers.length > 0) {
          componentPayload.modifiers = componentModifiers.map((group) => ({
            modifier_group_id: Number(group.modifier_group_id),
            options: group.options.map((option) => ({
              modifier_option_id: Number(option.modifier_option_id),
              quantity: Number(option.quantity || 1),
            })),
          }));
        }

        return componentPayload;
      });
    }

    return payload;
  }).filter(Boolean);
}

export function isActiveOrderStatus(status) {
  return ["open", "ready", "paying", "paid"].includes(
    String(status || "").toLowerCase(),
  );
}

export function isPendingLikeStatus(status) {
  return ["pending", "pending_approval", "rejected", "expired", "cancelled"].includes(
    String(status || "").toLowerCase(),
  );
}

export function toSafeInt(value) {
  const num = Number(value);

  if (!Number.isFinite(num)) {
    return 0;
  }

  return Math.trunc(num);
}

function hasOwn(source, key) {
  return (
    source != null &&
    typeof source === "object" &&
    Object.prototype.hasOwnProperty.call(source, key)
  );
}

export function createOnlineOrderIdempotencyKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `oo_${crypto.randomUUID()}`;
  }

  const random = () => Math.random().toString(36).slice(2);

  return `oo_${Date.now().toString(36)}_${random()}_${random()}`;
}

function firstOnlineOrderValidationError(errors) {
  if (!errors || typeof errors !== "object") {
    return { field: "", message: "" };
  }

  const field = Object.keys(errors)[0] || "";
  const value = field ? errors[field] : null;
  const message = Array.isArray(value) ? value[0] : value;

  return {
    field,
    message: String(message || "").trim(),
  };
}

function isTechnicalOnlineOrderMessage(message) {
  const text = String(message || "").trim().toLowerCase();

  if (!text) {
    return false;
  }

  const technicalTerms = [
    "timing_type",
    "requested_for_at",
    "delivery_concept_id",
    "scheduled_point_id",
    "scheduled_point_time_block_id",
    "scheduled_date",
    "payment_type",
    "idempotency_key",
    "warehouse",
    "inventory",
    "inventario",
    "product_id",
    "variant_id",
    "backend",
    "frontend",
  ];

  return technicalTerms.some((term) => text.includes(term));
}

export function buildOnlineOrderPublicErrorMessage(error, fallback) {
  const apiError = extractApiErrorInfo(error);
  const responseData =
    error?.response?.data && typeof error.response.data === "object"
      ? error.response.data
      : {};

  const errors =
    apiError?.errors && typeof apiError.errors === "object"
      ? apiError.errors
      : responseData?.errors && typeof responseData.errors === "object"
        ? responseData.errors
        : null;

  const firstError = firstOnlineOrderValidationError(errors);
  const code = String(apiError?.code || responseData?.code || "").trim().toUpperCase();

  const friendlyByField = {
    order_name: "Escribe el nombre para tu pedido.",
    customer_phone: "Ingresa un teléfono válido de 10 dígitos.",
    customer_email: "Ingresa un correo electrónico válido.",
    customer_notes: "Revisa las notas del pedido.",
    fulfillment_type: "Selecciona una forma de entrega disponible.",
    timing_type: "Selecciona cuándo quieres recibir tu pedido.",
    requested_for_at: "Selecciona una fecha y hora válidas para tu pedido.",
    delivery_concept_id: "Selecciona una zona, código postal o ubicación disponible.",
    scheduled_point_id: "Selecciona un punto de entrega disponible.",
    scheduled_point_time_block_id: "Selecciona un horario disponible.",
    scheduled_date: "Selecciona una fecha válida.",
    payment_type: "Selecciona un método de pago disponible.",
    items: "Revisa los productos de tu pedido antes de continuar.",
    idempotency_key: "No se pudo preparar el envío. Intenta nuevamente.",
  };

  if (code === "ONLINE_ORDER_IDEMPOTENCY_CONFLICT") {
    return "Los datos del pedido cambiaron. Calcula nuevamente el total e intenta otra vez.";
  }

  if (code.includes("INVENTORY")) {
    return "La disponibilidad de uno o más productos cambió. Revisa tu pedido e intenta nuevamente.";
  }

  const firstMessage = firstError.message;

  if (
    firstMessage &&
    !firstMessage.startsWith("The ") &&
    !isTechnicalOnlineOrderMessage(firstMessage)
  ) {
    return firstMessage;
  }

  const backendMessage = String(
    apiError?.message || responseData?.message || "",
  ).trim();

  if (
    backendMessage &&
    !backendMessage.startsWith("The ") &&
    !isTechnicalOnlineOrderMessage(backendMessage)
  ) {
    return backendMessage;
  }

  return friendlyByField[firstError.field] || fallback;
}

export function buildCartPromotionMetadata(source, basePrice) {
  const safeSource =
    source && typeof source === "object"
      ? source
      : {};

  const normalized = normalizePromotionPresentation({
    ...safeSource,
    price: hasOwn(safeSource, "price") ? safeSource.price : basePrice,
    unit_price: hasOwn(safeSource, "unit_price") ? safeSource.unit_price : basePrice,
  });

  const hasActivePromotion = Boolean(normalized.hasActivePromotion);

  return {
    has_active_promotion: hasActivePromotion,

    promotion:
      hasActivePromotion &&
      normalized.promotion &&
      typeof normalized.promotion === "object"
        ? { ...normalized.promotion }
        : null,

    promotion_label:
      hasActivePromotion && normalized.promotionLabel
        ? String(normalized.promotionLabel)
        : null,

    promotion_type:
      hasActivePromotion && normalized.promotionType
        ? String(normalized.promotionType)
        : null,

    original_price: safeNum(normalized.originalPrice, basePrice),

    display_price: hasActivePromotion
      ? safeNum(normalized.displayPrice, basePrice)
      : safeNum(basePrice, 0),

    promotion_discount_preview: hasActivePromotion
      ? safeNum(normalized.promotionDiscountPreview, 0)
      : 0,
  };
}

export function buildCartAvailabilityMetadata(source) {
  const availability =
    source?.availability && typeof source.availability === "object"
      ? { ...source.availability }
      : null;

  if (!availability) {
    return {
      availability: null,
      availability_status: null,
      availability_reason: null,
      is_available_now: null,
    };
  }

  const status = String(availability?.status || "").trim().toLowerCase() || null;
  const reason = String(availability?.reason || "").trim() || null;
  const rawMax = availability?.max_available_qty;

  const parsedMax =
    rawMax === null || rawMax === undefined || rawMax === ""
      ? null
      : Number(rawMax);

  const maxAvailableQty =
    parsedMax === null || !Number.isFinite(parsedMax)
      ? null
      : Math.max(0, parsedMax);

  const isAvailableNow =
    typeof availability?.is_available_now === "boolean"
      ? availability.is_available_now
      : typeof source?.is_available === "boolean"
        ? source.is_available
        : status
          ? status === "available"
          : null;

  return {
    availability: { ...availability, max_available_qty: maxAvailableQty },
    availability_status: status,
    availability_reason: reason,
    is_available_now: isAvailableNow,
  };
}

export function mergeConfirmedOrderTotals(currentOrder, source, overrides = {}) {
  const current =
    currentOrder && typeof currentOrder === "object"
      ? currentOrder
      : {};

  const data =
    source && typeof source === "object"
      ? source
      : {};

  const next = {
    ...current,
    ...overrides,
  };

  const numericFields = [
    "total",
    "subtotal",
    "promotion_discount_total",
    "manual_discount_total",
    "discount_total",
    "net_total",
    "payable_total",
  ];

  numericFields.forEach((field) => {
    if (hasOwn(data, field)) {
      next[field] = safeNum(data[field], 0);
    }
  });

  if (!hasOwn(data, "payable_total") && hasOwn(data, "net_total")) {
    next.payable_total = safeNum(data.net_total, 0);
  }

  return next;
}

export function applyAvailabilityErrorToCart(items, apiError) {
  const rows = Array.isArray(items) ? items : [];
  const data =
    apiError?.data && typeof apiError.data === "object"
      ? apiError.data
      : {};

  const nestedAvailability =
    data?.availability && typeof data.availability === "object"
      ? data.availability
      : null;

  const sourceAvailability = nestedAvailability || {
    status: data?.availability_status || null,
    reason: data?.reason || null,
    max_available_qty: hasOwn(data, "max_available_qty")
      ? data.max_available_qty
      : null,
    is_available_now: false,
  };

  const code = String(apiError?.code || "").trim().toUpperCase();

  const fallbackStatus =
    code === "INSUFFICIENT_PRODUCT_AVAILABILITY"
      ? "insufficient_stock"
      : code.endsWith("_BY_SCHEDULE")
        ? "unavailable_by_schedule"
        : "no_longer_sellable";

  const status = String(sourceAvailability?.status || fallbackStatus)
    .trim()
    .toLowerCase();

  const reason = String(
    sourceAvailability?.reason ||
      apiError?.message ||
      "Este producto dejó de estar disponible.",
  ).trim();

  const availability = {
    ...sourceAvailability,
    status,
    reason,
    is_available_now: false,
    max_available_qty: hasOwn(sourceAvailability, "max_available_qty")
      ? sourceAvailability.max_available_qty
      : null,
    source:
      sourceAvailability?.source ||
      (status === "unavailable_by_schedule"
        ? "schedule"
        : status === "insufficient_stock"
          ? "inventory"
          : "catalog"),
  };

  const hasRawItemIndex =
    data?.item_index !== null &&
    data?.item_index !== undefined &&
    data?.item_index !== "";

  const itemIndex = hasRawItemIndex ? Number(data.item_index) : -1;

  const hasItemIndex =
    Number.isInteger(itemIndex) &&
    itemIndex >= 0 &&
    itemIndex < rows.length;

  const productId = Number(data?.product_id || 0);
  const parsedVariantId = Number(data?.variant_id || 0);
  const variantId = parsedVariantId > 0 ? parsedVariantId : null;

  let marked = false;

  return rows.map((item, index) => {
    if (isPreparedItemLine(item)) {
      return item;
    }

    const sameIndex = hasItemIndex && index === itemIndex;

    const sameIdentity =
      !hasItemIndex &&
      !marked &&
      productId > 0 &&
      getCartLineProductId(item) === productId &&
      getCartLineVariantId(item) === variantId;

    if (!sameIndex && !sameIdentity) {
      return item;
    }

    marked = true;

    return {
      ...item,
      availability_status: status,
      availability_reason: reason,
      is_available_now: false,
      availability,
    };
  });
}