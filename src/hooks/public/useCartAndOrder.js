import { useCallback, useMemo, useRef, useState } from "react";
import {
  appendPublicOrderItems,
  createPublicOnlineOrder,
  createPublicOrder,
  getPublicOrder,
  quotePublicOnlineOrder,
  sendPublicWhatsapp,
} from "../../services/public/publicMenu.service";
import {
  buildAvailabilityErrorMessage,
  buildCartKey,
  buildCombinedPricingSummary,
  buildNewItemsPricingSummary,
  extractApiErrorInfo,
  isAvailabilityErrorCode,
  normalizeCompositeComponentsForKey,
  normalizeConfirmedPricingSummary,
  normalizeModifierGroupsForKey,
  normalizePromotionPresentation,
  safeNum,
} from "./publicMenu.utils";

import {
  countInvalidCartItems,
  getCartLineProductId,
  getCartLineVariantId,
  reconcilePendingCartAvailability,
} from "../menu/menuAvailability.utils";

function normalizeItemsForApi(cart) {
  const arr = Array.isArray(cart) ? cart : [];

  return arr.map((it) => {
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
  });
}

function normalizeOnlineOrderItemsForApi(cart) {
  const arr = Array.isArray(cart) ? cart : [];

  return arr.map((item) => {
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
  });
}

function isActiveOrderStatus(status) {
  return ["open", "ready", "paying", "paid"].includes(String(status || "").toLowerCase());
}

function isPendingLikeStatus(status) {
  return ["pending", "pending_approval", "rejected", "expired", "cancelled"].includes(
    String(status || "").toLowerCase(),
  );
}

function toSafeInt(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.trunc(num);
}

function hasOwn(source, key) {
  return (
    source != null &&
    typeof source === "object" &&
    Object.prototype.hasOwnProperty.call(source, key)
  );
}

function createOnlineOrderIdempotencyKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `oo_${crypto.randomUUID()}`;
  }

  const random = () => Math.random().toString(36).slice(2);
  return `oo_${Date.now().toString(36)}_${random()}_${random()}`;
}

function firstOnlineOrderValidationError(errors) {
  if (!errors || typeof errors !== "object") return { field: "", message: "" };

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
  if (!text) return false;

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

function buildOnlineOrderPublicErrorMessage(error, fallback) {
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

  const backendMessage = String(apiError?.message || responseData?.message || "").trim();

  if (
    backendMessage &&
    !backendMessage.startsWith("The ") &&
    !isTechnicalOnlineOrderMessage(backendMessage)
  ) {
    return backendMessage;
  }

  return friendlyByField[firstError.field] || fallback;
}

function buildCartPromotionMetadata(source, basePrice) {
  const safeSource =
    source && typeof source === "object"
      ? source
      : {};

  const normalized = normalizePromotionPresentation({
    ...safeSource,
    price: hasOwn(safeSource, "price")
      ? safeSource.price
      : basePrice,
    unit_price: hasOwn(safeSource, "unit_price")
      ? safeSource.unit_price
      : basePrice,
  });

  const hasActivePromotion = Boolean(
    normalized.hasActivePromotion,
  );

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

    original_price: safeNum(
      normalized.originalPrice,
      basePrice,
    ),

    display_price: hasActivePromotion
      ? safeNum(normalized.displayPrice, basePrice)
      : safeNum(basePrice, 0),

    promotion_discount_preview: hasActivePromotion
      ? safeNum(normalized.promotionDiscountPreview, 0)
      : 0,
  };
}

function buildCartAvailabilityMetadata(source) {
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

function mergeConfirmedOrderTotals(
  currentOrder,
  source,
  overrides = {},
) {
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

  if (
    !hasOwn(data, "payable_total") &&
    hasOwn(data, "net_total")
  ) {
    next.payable_total = safeNum(data.net_total, 0);
  }

  return next;
}

function applyAvailabilityErrorToCart(items, apiError) {
  const rows = Array.isArray(items) ? items : [];
  const data = apiError?.data && typeof apiError.data === "object" ? apiError.data : {};

  const nestedAvailability =
    data?.availability && typeof data.availability === "object"
      ? data.availability
      : null;

  const sourceAvailability = nestedAvailability || {
    status: data?.availability_status || null,
    reason: data?.reason || null,
    max_available_qty: hasOwn(data, "max_available_qty") ? data.max_available_qty : null,
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
    Number.isInteger(itemIndex) && itemIndex >= 0 && itemIndex < rows.length;

  const productId = Number(data?.product_id || 0);
  const parsedVariantId = Number(data?.variant_id || 0);
  const variantId = parsedVariantId > 0 ? parsedVariantId : null;

  let marked = false;

  return rows.map((item, index) => {
    const sameIndex = hasItemIndex && index === itemIndex;
    const sameIdentity =
      !hasItemIndex &&
      !marked &&
      productId > 0 &&
      getCartLineProductId(item) === productId &&
      getCartLineVariantId(item) === variantId;

    if (!sameIndex && !sameIdentity) return item;

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

export function useCartAndOrder({
  token,
  canSelect,
  hasTable,
  sessionActive,
  orderingMode,
  sessionBusy,
  sessionUnavailable,
  activeMenuType,
  activeMenuPayload,
  publicFlow,
  qrType,
  salesChannelCode,
}) {
  const normalizedQrType = String(
    qrType || activeMenuPayload?.qr_type || activeMenuType || "",
  ).trim().toLowerCase();

  const normalizedSalesChannelCode = String(
    salesChannelCode ||
    activeMenuPayload?.sales_channel_code ||
    activeMenuPayload?.sales_channel?.code ||
    "",
  ).trim().toUpperCase();

  const normalizedPublicFlow = String(
    publicFlow || activeMenuPayload?.public_flow || "catalog_only",
  ).trim().toLowerCase();

  const isWhatsappFlow =
    normalizedQrType === "web" &&
    normalizedSalesChannelCode === "WHATSAPP" &&
    normalizedPublicFlow === "whatsapp";

  const isOnlineOrderFlow =
    normalizedQrType === "web" &&
    normalizedSalesChannelCode === "ONLINE_ORDER" &&
    normalizedPublicFlow === "online_order";

  const isWebOrderingFlow = isWhatsappFlow || isOnlineOrderFlow;

  const onlineOrderCheckout =
    isOnlineOrderFlow &&
    activeMenuPayload?.online_order_checkout &&
    typeof activeMenuPayload.online_order_checkout === "object"
      ? activeMenuPayload.online_order_checkout
      : null;

  const customerOrderUi =
    activeMenuPayload?.ui &&
    typeof activeMenuPayload.ui === "object"
      ? activeMenuPayload.ui
      : {};

  const canStartCustomerOrder =
    typeof customerOrderUi?.can_start_customer_order === "boolean"
      ? customerOrderUi.can_start_customer_order
      : null;

  const canContinueExistingCustomerOrder =
    typeof customerOrderUi?.can_continue_existing_customer_order === "boolean"
      ? customerOrderUi.can_continue_existing_customer_order
      : null;

  const customerOrderStartReasonCode =
    customerOrderUi?.customer_order_start_reason_code || null;

  const customerOrderStartReason = String(
    customerOrderUi?.customer_order_start_reason || "",
  ).trim();

  const [cart, setCart] = useState([]);
  const [sendOpen, setSendOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [partySize, setPartySize] = useState("");
  const [adultCount, setAdultCount] = useState("");
  const [childCount, setChildCount] = useState("");
  const [sending, setSending] = useState(false);
  const [sendToast, setSendToast] = useState("");

  const [onlineOrderQuoting, setOnlineOrderQuoting] = useState(false);
  const [onlineOrderCreating, setOnlineOrderCreating] = useState(false);
  const [onlineOrderCreated, setOnlineOrderCreated] = useState(null);
  const onlineOrderAttemptRef = useRef({ signature: "", key: "" });

  const [pendingOrder, setPendingOrder] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [oldItems, setOldItems] = useState([]);

  const lastOrderIdRef = useRef(null);
  const cartLineSequenceRef = useRef(0);

  const invalidCartItemsCount = useMemo(() => countInvalidCartItems(cart), [cart]);
  const hasInvalidCartItems = invalidCartItemsCount > 0;

  const reconcileCartAvailability = useCallback(
    (menuSource = activeMenuPayload) => {
      if (!menuSource) return;

      setCart((previous) =>
        reconcilePendingCartAvailability(previous, menuSource),
      );
    },
    [activeMenuPayload],
  );

  const markCartAvailabilityError = useCallback((apiError) => {
    setCart((previous) => applyAvailabilityErrorToCart(previous, apiError));
  }, []);

  const sendWhatsAppOrder = useCallback(async () => {
    try {
      if (hasInvalidCartItems) {
        setSendToast(
          "⚠️ Hay productos que ya no están disponibles. Quítalos para continuar.",
        );

        return {
          ok: false,
          availabilityError: true,
        };
      }

      if (!isWhatsappFlow) {
        setSendToast("Este menú no permite enviar pedidos por WhatsApp.");
        return { ok: false };
      }

      const items = normalizeItemsForApi(cart);

      const res = await sendPublicWhatsapp({
        token: String(token || ""),
        items,
      });

      if (res?.ok === false) {
        setSendToast(
          res?.message ||
            "No se pudo construir el mensaje de WhatsApp.",
        );

        return { ok: false };
      }

      const url = String(
        res?.whatsapp_url || "",
      ).trim();

      if (!url) {
        setSendToast("No se pudo abrir WhatsApp. Intenta nuevamente.");
        return { ok: false };
      }

      /*
      * Primero se abre el enlace calculado por backend.
      * Después se limpia el carrito local.
      */
      window.open(
        url,
        "_blank",
        "noopener,noreferrer",
      );

      setCart([]);
      setSendOpen(false);
      setCustomerName("");
      setPartySize("");
      setAdultCount("");
      setChildCount("");

      setSendToast(
        "Pedido preparado para enviar por WhatsApp.",
      );

      return {
        ok: true,
        pricing:
          res?.pricing &&
          typeof res.pricing === "object"
            ? res.pricing
            : null,
      };
    } catch (error) {
      const apiError = extractApiErrorInfo(error);

      if (isAvailabilityErrorCode(apiError.code)) {
        markCartAvailabilityError(apiError);
        setSendToast(`⚠️ ${buildAvailabilityErrorMessage(apiError)}`);

        return {
          ok: false,
          availabilityError: true,
          data: apiError.data || null,
        };
      }

      const responseData =
        error?.response?.data &&
        typeof error.response.data === "object"
          ? error.response.data
          : {};

      const validationErrors =
        responseData?.errors &&
        typeof responseData.errors === "object"
          ? responseData.errors
          : null;

      if (validationErrors) {
        const firstKey =
          Object.keys(validationErrors)[0];

        const firstValue =
          validationErrors[firstKey];

        const firstMessage =
          Array.isArray(firstValue)
            ? firstValue[0]
            : firstValue;

        if (firstMessage) {
          setSendToast(
            `⚠️ ${String(firstMessage)}`,
          );

          return { ok: false };
        }
      }

      setSendToast(
        responseData?.message ||
          "No se pudo construir el mensaje de WhatsApp.",
      );

      return { ok: false };
    }
  }, [
    isWhatsappFlow,
    cart,
    token,
    hasInvalidCartItems,
    markCartAvailabilityError,
  ]);

  const quoteOnlineOrder = useCallback(
    async (selection) => {
      if (!isOnlineOrderFlow) {
        return { ok: false, message: "Pedidos en línea no está disponible en este menú." };
      }

      if (hasInvalidCartItems) {
        return {
          ok: false,
          message: "Hay productos que ya no están disponibles. Revisa tu pedido para continuar.",
        };
      }

      const items = normalizeOnlineOrderItemsForApi(cart);

      if (items.length === 0) {
        return { ok: false, message: "Agrega al menos un producto para continuar." };
      }

      setOnlineOrderQuoting(true);

      try {
        const res = await quotePublicOnlineOrder({
          token: String(token || ""),
          payload: { ...(selection || {}), items },
        });

        const quote =
          res?.data && typeof res.data === "object"
            ? res.data
            : null;

        if (!quote) {
          return {
            ok: false,
            message: "No se pudo calcular el total del pedido. Intenta nuevamente.",
          };
        }

        return { ok: true, data: quote };
      } catch (error) {
        const apiError = extractApiErrorInfo(error);

        if (isAvailabilityErrorCode(apiError.code)) {
          markCartAvailabilityError(apiError);

          return {
            ok: false,
            availabilityError: true,
            message: buildAvailabilityErrorMessage(apiError),
          };
        }

        return {
          ok: false,
          message: buildOnlineOrderPublicErrorMessage(
            error,
            "No se pudo calcular el total del pedido. Intenta nuevamente.",
          ),
        };
      } finally {
        setOnlineOrderQuoting(false);
      }
    },
    [
      isOnlineOrderFlow,
      hasInvalidCartItems,
      cart,
      token,
      markCartAvailabilityError,
    ],
  );

  const createOnlineOrder = useCallback(
    async (selection) => {
      if (!isOnlineOrderFlow) {
        return { ok: false, message: "Pedidos en línea no está disponible en este menú." };
      }

      if (hasInvalidCartItems) {
        return {
          ok: false,
          message: "Hay productos que ya no están disponibles. Revisa tu pedido para continuar.",
        };
      }

      const items = normalizeOnlineOrderItemsForApi(cart);

      if (items.length === 0) {
        return { ok: false, message: "Agrega al menos un producto para continuar." };
      }

      const basePayload = { ...(selection || {}), items };
      const signature = JSON.stringify(basePayload);

      if (
        onlineOrderAttemptRef.current.signature !== signature ||
        !onlineOrderAttemptRef.current.key
      ) {
        onlineOrderAttemptRef.current = {
          signature,
          key: createOnlineOrderIdempotencyKey(),
        };
      }

      const payload = {
        idempotency_key: onlineOrderAttemptRef.current.key,
        ...basePayload,
      };

      setOnlineOrderCreating(true);

      try {
        const res = await createPublicOnlineOrder({
          token: String(token || ""),
          payload,
        });

        if (res?.ok !== true) {
          return {
            ok: false,
            message: String(res?.message || "No se pudo enviar el pedido. Intenta nuevamente."),
          };
        }

        const responseData =
          res?.data && typeof res.data === "object"
            ? res.data
            : {};

        const created = {
          public_number: String(responseData?.public_number || ""),
          tracking_token: String(responseData?.tracking_token || ""),
          tracking_url: String(responseData?.tracking_url || ""),
          status: String(responseData?.status || ""),
          idempotent: Boolean(responseData?.idempotent),
          message: String(res?.message || "Pedido enviado correctamente."),
        };

        setOnlineOrderCreated(created);
        setCart([]);

        return { ok: true, data: created };
      } catch (error) {
        const apiError = extractApiErrorInfo(error);

        if (isAvailabilityErrorCode(apiError.code)) {
          markCartAvailabilityError(apiError);

          return {
            ok: false,
            availabilityError: true,
            message: buildAvailabilityErrorMessage(apiError),
          };
        }

        return {
          ok: false,
          message: buildOnlineOrderPublicErrorMessage(
            error,
            "No se pudo enviar el pedido. Intenta nuevamente.",
          ),
        };
      } finally {
        setOnlineOrderCreating(false);
      }
    },
    [
      isOnlineOrderFlow,
      hasInvalidCartItems,
      cart,
      token,
      markCartAvailabilityError,
    ],
  );


  const currentOrderId = useMemo(() => {
    return Number(
      activeOrder?.id || pendingOrder?.id || lastOrderIdRef.current || 0,
    );
  }, [activeOrder?.id, pendingOrder?.id]);

  const reconcileOrderState = useCallback((order) => {
    const o = order ? { ...order } : null;
    const status = String(o?.status || "").toLowerCase();
    const oid = Number(o?.id || 0);

    if (oid) {
      lastOrderIdRef.current = oid;
    }

    if (!o) return;

    /*
    * Cuando la orden ya entró a caja, la etapa anterior de
    * solicitud al mesero queda concluida.
    */
    if (status === "paying") {
      setPendingOrder(null);
      setSendToast("");

      setActiveOrder({
        ...o,
        id: oid || o?.id,
        status: "paying",

        customer_ui: {
          ...(o?.customer_ui || {}),
          show_payment_message: true,
          can_add_items: false,
          can_send_items: false,
        },

        bill_flow: {
          ...(o?.bill_flow || {}),
          can_request_bill: false,
          already_sent: false,
          request_status: null,
        },
      });

      return;
    }

    if (isActiveOrderStatus(status)) {
      setPendingOrder(null);
      setActiveOrder(o);
      return;
    }

    if (isPendingLikeStatus(status)) {
      setPendingOrder({
        ...o,
        id: oid || null,
        status: status || "pending",
      });

      if (
        status === "pending" ||
        status === "pending_approval" ||
        status === "rejected" ||
        status === "expired" ||
        status === "cancelled"
      ) {
        setActiveOrder(null);
      }

      return;
    }

    setActiveOrder(o);
  }, []);

  function upsertCartItem(nextItem) {
    cartLineSequenceRef.current += 1;

    const uniqueLineKey = [
      String(nextItem?.key || "cart-item"),
      "line",
      Date.now(),
      cartLineSequenceRef.current,
    ].join(":");

    setCart((prev) => [
      ...prev,
      {
        ...nextItem,
        key: uniqueLineKey,
      },
    ]);
  }

  function addToCartFromProduct(
    p,
    componentsOverride = [],
    componentsDetailOverride = [],
    modifiersOverride = [],
    modifierGroupsDisplayOverride = [],
  ) {
    if (String(activeOrder?.status || "").toLowerCase() === "paying") return;

    const pid = Number(p?.id);
    if (!pid) return;

    const normalizedComponents =
      normalizeCompositeComponentsForKey(
        componentsOverride,
      );

    const normalizedModifiers =
      normalizeModifierGroupsForKey(
        modifiersOverride,
      );

    const key = buildCartKey(
      pid,
      null,
      normalizedComponents,
      normalizedModifiers,
    );

    const isComposite =
      String(p?.product_type || "simple") ===
      "composite";

    const baseUnitPrice = safeNum(p?.price, 0);

    const promotionMetadata = buildCartPromotionMetadata(p, baseUnitPrice);
    const availabilityMetadata = buildCartAvailabilityMetadata(p);

    upsertCartItem({
      key,
      product_id: pid,
      variant_id: null,
      name: p?.display_name || p?.name || "Producto",
      variant_name: null,

      unit_price: baseUnitPrice,
      ...promotionMetadata,
      ...availabilityMetadata,

      quantity: 1,
      notes: "",
      product_type: String(p?.product_type || "simple"),
      components: isComposite ? normalizedComponents : [],
      components_detail: isComposite
        ? Array.isArray(componentsDetailOverride)
          ? componentsDetailOverride
          : []
        : [],
      modifiers: normalizedModifiers,
      modifier_groups_display: Array.isArray(modifierGroupsDisplayOverride)
        ? modifierGroupsDisplayOverride
        : [],
    });
  }

  function addToCartFromVariant(
    p,
    v,
    componentsOverride = [],
    componentsDetailOverride = [],
    modifiersOverride = [],
    modifierGroupsDisplayOverride = [],
  ) {
    if (String(activeOrder?.status || "").toLowerCase() === "paying") return;

    const pid = Number(p?.id);
    const vid = Number(v?.id);
    if (!pid || !vid) return;

    const normalizedComponents =
      normalizeCompositeComponentsForKey(
        componentsOverride,
      );

    const normalizedModifiers =
      normalizeModifierGroupsForKey(
        modifiersOverride,
      );

    const key = buildCartKey(
      pid,
      vid,
      normalizedComponents,
      normalizedModifiers,
    );

    const isComposite =
      String(p?.product_type || "simple") ===
      "composite";

    const baseUnitPrice = safeNum(
      v?.price,
      safeNum(p?.price, 0),
    );

    const promotionMetadata = buildCartPromotionMetadata(v, baseUnitPrice);
    const availabilityMetadata = buildCartAvailabilityMetadata(v);

    upsertCartItem({
      key,
      product_id: pid,
      variant_id: vid,
      name: p?.display_name || p?.name || "Producto",
      variant_name: v?.name || "Variante",

      unit_price: baseUnitPrice,
      ...promotionMetadata,
      ...availabilityMetadata,

      quantity: 1,
      notes: "",
      product_type: String(p?.product_type || "simple"),
      components: isComposite ? normalizedComponents : [],
      components_detail: isComposite
        ? Array.isArray(componentsDetailOverride)
          ? componentsDetailOverride
          : []
        : [],
      modifiers: normalizedModifiers,
      modifier_groups_display: Array.isArray(modifierGroupsDisplayOverride)
        ? modifierGroupsDisplayOverride
        : [],
    });
  }

  function setCartComponents(itemKey, components, componentsDetail = null) {
    const normalized = normalizeCompositeComponentsForKey(components);

    setCart((prev) =>
      prev.map((x) =>
        x.key === itemKey
          ? {
              ...x,
              components: normalized,
              components_detail: Array.isArray(componentsDetail)
                ? componentsDetail
                : x.components_detail || [],
            }
          : x,
      ),
    );
  }

  function removeCartItem(key) {
    setCart((prev) => prev.filter((x) => x.key !== key));
  }

  function setCartQty(key, qty) {
    const requestedQty = Math.max(1, Math.min(99, Math.trunc(Number(qty || 1))));

    setCart((prev) =>
      prev.map((item) => {
        if (item.key !== key) return item;

        const rawMax = item?.availability?.max_available_qty;

        if (rawMax === null || rawMax === undefined || rawMax === "") {
          return { ...item, quantity: requestedQty };
        }

        const maxAvailable = Math.floor(Number(rawMax));
        if (!Number.isFinite(maxAvailable) || maxAvailable <= 0) return item;

        const productId = getCartLineProductId(item);
        const variantId = getCartLineVariantId(item);

        const usedByOtherLines = prev.reduce((sum, other) => {
          if (other.key === key) return sum;

          const sameProduct = getCartLineProductId(other) === productId;
          const sameVariant = getCartLineVariantId(other) === variantId;

          return sameProduct && sameVariant
            ? sum + Math.max(0, Number(other?.quantity || 0))
            : sum;
        }, 0);

        const availableForThisLine = Math.floor(maxAvailable - usedByOtherLines);
        if (availableForThisLine <= 0) return item;

        return {
          ...item,
          quantity: Math.max(1, Math.min(requestedQty, availableForThisLine)),
        };
      }),
    );
  }

  function setCartNotes(key, notes) {
    setCart((prev) =>
      prev.map((x) => (x.key === key ? { ...x, notes: String(notes || "") } : x)),
    );
  }

  const newItemsPricingSummary = useMemo(() => {
    const summary = buildNewItemsPricingSummary(cart);

    return {
      ...summary,
      lines: (
        Array.isArray(summary?.lines)
          ? summary.lines
          : []
      ).map((line, index) => ({
        ...line,
        name:
          cart[index]?.name ||
          "Producto",
        variantName:
          cart[index]?.variant_name ||
          "",
      })),
    };
  }, [cart]);

  const activeOrderPricingSummary = useMemo(() => {
    return normalizeConfirmedPricingSummary(
      activeOrder,
    );
  }, [activeOrder]);

  const pendingOrderPricingSummary = useMemo(() => {
    return normalizeConfirmedPricingSummary(
      pendingOrder,
    );
  }, [pendingOrder]);

  const confirmedPricingSummary =
    activeOrderPricingSummary.hasConfirmedData
      ? activeOrderPricingSummary
      : pendingOrderPricingSummary;

  const pricingSummary = useMemo(() => {
    return buildCombinedPricingSummary(
      confirmedPricingSummary,
      newItemsPricingSummary,
    );
  }, [
    confirmedPricingSummary,
    newItemsPricingSummary,
  ]);

  const displayTotal = safeNum(
    pricingSummary?.displayTotal,
    0,
  );

  const totalLabel =
    pricingSummary?.totalLabel || "Total";

  const isEstimated = Boolean(
    pricingSummary?.isEstimated,
  );

  /*
  * Aliases temporales de compatibilidad.
  * Los componentes nuevos deben usar los resúmenes.
  */
  const cartTotal = safeNum(
    newItemsPricingSummary?.totalApproximate,
    0,
  );

  const oldTotal = safeNum(
    confirmedPricingSummary?.confirmedTotal,
    0,
  );

  const totalGlobal = displayTotal;

  const tableOk = isWebOrderingFlow ? true : !!hasTable;
  const sessionOk = isWebOrderingFlow ? true : !!sessionActive;
  const modeOk = isWebOrderingFlow
    ? true
    : String(orderingMode || "") === "customer_assisted";

  const selectableOk = !!canSelect;
  const busyOk = !sessionBusy;
  const unavailableOk = !sessionUnavailable;
  const hasItems = cart.length > 0;

  const orderUi = activeOrder?.customer_ui || {};
  const payingOk = String(activeOrder?.status || "").toLowerCase() !== "paying";

  const canAppend =
    !!activeOrder?.id &&
    ["open", "ready"].includes(String(activeOrder?.status || "").toLowerCase());

  const orderUiOk = isWebOrderingFlow
    ? true
    : canAppend
      ? orderUi?.can_add_items !== false && orderUi?.can_send_items !== false
      : true;

  const hasPending =
    !!pendingOrder?.id &&
    ["pending", "pending_approval"].includes(
      String(pendingOrder?.status || "pending").toLowerCase(),
    );

  const allowBase =
    (isWebOrderingFlow
      ? selectableOk && hasItems && orderUiOk && payingOk
      : tableOk &&
        sessionOk &&
        modeOk &&
        selectableOk &&
        busyOk &&
        unavailableOk &&
        hasItems &&
        orderUiOk &&
        payingOk) &&
    !hasInvalidCartItems;

  const allowSendNow = isWebOrderingFlow
    ? allowBase
    : allowBase && (canAppend || (!hasPending && canStartCustomerOrder !== false));

  const refreshOrder = useCallback(
    async (orderId) => {
      const oid = Number(orderId || activeOrder?.id || pendingOrder?.id || lastOrderIdRef.current || 0);
      if (!oid) return null;

      const res = await getPublicOrder({
        orderId: oid,
        token: String(token || ""),
      });

      if (res?.ok) {
        const o = res?.data?.order || null;
        const items = Array.isArray(res?.data?.items) ? res.data.items : [];

        if (o) {
          reconcileOrderState({ ...o });
        } else {
          setActiveOrder((prev) => ({
            ...(prev || {}),
            id: oid,
          }));
        }

        setOldItems(items);
        lastOrderIdRef.current = oid;

        return { order: o, items };
      }

      return null;
    },
    [token, activeOrder?.id, pendingOrder?.id, reconcileOrderState],
  );

  const createFirstOrder = useCallback(
    async (name, occupancyPayload) => {
      if (hasInvalidCartItems) {
        setSendToast(
          "⚠️ Hay productos que ya no están disponibles. Quítalos para continuar.",
        );

        return {
          ok: false,
          availabilityError: true,
        };
      }

      if (canStartCustomerOrder === false) {
        const message =
          customerOrderStartReason ||
          "No se pueden iniciar nuevos pedidos desde QR en este momento.";

        setSendToast(`⚠️ ${message}`);

        return {
          ok: false,
          planBlocked: true,
          code:
            customerOrderStartReasonCode ||
            "QR_ORDERING_NOT_ALLOWED_BY_PLAN",
        };
      }

      const items = normalizeItemsForApi(cart);

      try {
        const res = await createPublicOrder({
          token: String(token || ""),
          customer_name: name,
          party_size: occupancyPayload.party_size,
          adult_count: occupancyPayload.adult_count,
          child_count: occupancyPayload.child_count,
          items,
        });

        if (res?.ok) {
          const responseData =
            res?.data &&
            typeof res.data === "object"
              ? res.data
              : {};

          const orderId =
            responseData?.order_id ||
            responseData?.id ||
            res?.order_id ||
            null;

          if (orderId) {
            const numericOrderId = Number(orderId);

            setPendingOrder((previous) =>
              mergeConfirmedOrderTotals(
                previous,
                responseData,
                {
                  id: numericOrderId,
                  status:
                    String(responseData?.status || "") ||
                    "pending",
                },
              ),
            );

            lastOrderIdRef.current = numericOrderId;

            try {
              await refreshOrder(numericOrderId);
            } catch {
              /*
              * La orden ya fue creada.
              * Se conservan como respaldo los totales confirmados
              * de la respuesta de creación.
              */
            }
          } else {
            setPendingOrder({
              id: null,
              status: "pending",
            });
          }

          setCart([]);
          setCustomerName("");
          setPartySize("");
          setAdultCount("");
          setChildCount("");
          setSendOpen(false);

          setSendToast(
            "✅ Comanda enviada. En espera de aprobación.",
          );

          return {
            ok: true,
            orderId,
          };
        }

        setSendToast(`⚠️ ${res?.message || "No se pudo crear la comanda."}`);
        return { ok: false };
      } catch (e) {
        const apiError = extractApiErrorInfo(e);
        const apiErrorCode = String(apiError?.code || "").toUpperCase();

        if (
          apiError?.status === 403 &&
          apiErrorCode === "QR_ORDERING_NOT_ALLOWED_BY_PLAN"
        ) {
          setSendToast(`⚠️ ${apiError.message}`);

          return {
            ok: false,
            planBlocked: true,
            code: apiErrorCode,
          };
        }

        if (isAvailabilityErrorCode(apiError.code)) {
          markCartAvailabilityError(apiError);
          setSendToast(`⚠️ ${buildAvailabilityErrorMessage(apiError)}`);

          return {
            ok: false,
            availabilityError: true,
            data: apiError.data || null,
          };
        }

        const validationErrors = apiError?.errors || e?.response?.data?.errors || null;
        if (validationErrors && typeof validationErrors === "object") {
          const firstKey = Object.keys(validationErrors)[0];
          const firstMessage = Array.isArray(validationErrors[firstKey])
            ? validationErrors[firstKey][0]
            : validationErrors[firstKey];

          if (firstMessage) {
            setSendToast(`⚠️ ${firstMessage}`);
            return { ok: false };
          }
        }

        const msg =
          apiError?.message ||
          "No se pudo crear la comanda.";

        setSendToast(`⚠️ ${msg}`);
        return { ok: false };
      }
    },
    [
      cart,
      token,
      refreshOrder,
      hasInvalidCartItems,
      markCartAvailabilityError,
      canStartCustomerOrder,
      customerOrderStartReason,
      customerOrderStartReasonCode,
    ],
  );

  const appendToOpenOrder = useCallback(
    async (orderId) => {
      if (hasInvalidCartItems) {
        setSendToast(
          "⚠️ Hay productos que ya no están disponibles. Quítalos para continuar.",
        );

        return {
          ok: false,
          availabilityError: true,
        };
      }

      const items = normalizeItemsForApi(cart);

      try {
        const res = await appendPublicOrderItems({
          orderId: Number(orderId),
          token: String(token || ""),
          items,
        });

        if (res?.ok) {
          const responseData =
            res?.data &&
            typeof res.data === "object"
              ? res.data
              : {};

          setActiveOrder((previous) =>
            mergeConfirmedOrderTotals(
              previous,
              responseData,
              {
                id: Number(orderId),
                status:
                  previous?.status || "open",
              },
            ),
          );

          setCart([]);

          setSendToast(
            "✅ Productos agregados a la orden.",
          );

          try {
            await refreshOrder(orderId);
          } catch {
            /*
            * El append ya fue procesado.
            * Se conservan los totales confirmados de su respuesta.
            */
          }

          return { ok: true };
        }

        setSendToast(`⚠️ ${res?.message || "No se pudieron agregar productos."}`);
        return { ok: false };
      } catch (e) {
        const apiError = extractApiErrorInfo(e);

        if (isAvailabilityErrorCode(apiError.code)) {
          markCartAvailabilityError(apiError);
          setSendToast(`⚠️ ${buildAvailabilityErrorMessage(apiError)}`);

          return {
            ok: false,
            availabilityError: true,
            data: apiError.data || null,
          };
        }

        const msg =
          apiError?.message ||
          "No se pudieron agregar productos.";

        setSendToast(`⚠️ ${msg}`);
        return { ok: false };
      }
    },
    [cart, token, refreshOrder, hasInvalidCartItems, markCartAvailabilityError, ],
  );

  function buildBlockerMessage() {
    if (hasInvalidCartItems) {
      return "Hay productos que ya no están disponibles. Quítalos para continuar.";
    }

    if (!hasItems) return "Agrega al menos un producto para continuar.";

    if (!isWebOrderingFlow && !sessionOk) {
      return "La sesión de la mesa ya no está activa. Escanea nuevamente el QR.";
    }

    if (!isWebOrderingFlow && !tableOk) {
      return "No se pudo identificar la mesa de este QR.";
    }

    if (!selectableOk || !modeOk) {
      return "Este menú no permite realizar pedidos en este momento.";
    }

    if (!busyOk) return "Esta mesa está siendo atendida desde otro dispositivo.";
    if (!unavailableOk) return "La sesión de esta mesa ya no está disponible.";

    if (!orderUiOk || !payingOk) {
      return "La orden ya no permite agregar productos.";
    }

    return "No se puede continuar en este momento.";
  }

  // ==========================================
  // 1. CONTROLADOR PRINCIPAL DEL BOTÓN ENVIAR
  // ==========================================
  async function submitOrderOrAppend() {
    if (sending) return;

    if (hasInvalidCartItems) {
      setSendToast(
        "⚠️ Hay productos que ya no están disponibles. Quítalos para continuar.",
      );
      setTimeout(() => setSendToast(""), 5000);
      return;
    }

    // A. WEB + WHATSAPP
    if (isWhatsappFlow) {
      const res = await sendWhatsAppOrder();
      if (!res.ok) return;

      setTimeout(() => setSendToast(""), 4000);
      return;
    }

    // B. WEB + ONLINE_ORDER
    if (isOnlineOrderFlow) {
      if (!allowBase) {
        setSendToast(`⚠️ ${buildBlockerMessage()}`);
        setTimeout(() => setSendToast(""), 3000);
        return;
      }

      setOnlineOrderCreated(null);
      setSendOpen(true);
      return;
    }

    // C. APPEND A ORDEN DE MESA EXISTENTE
    if (canAppend && activeOrder?.id) {
      setSending(true);
      setSendToast("");
      try {
        await appendToOpenOrder(activeOrder.id);
        setTimeout(() => setSendToast(""), 6500);
      } finally {
        setSending(false);
      }
      return;
    }

    // D. BLOQUEO EXCLUSIVO PARA EL NACIMIENTO DE UNA NUEVA ORDER
    if (
      canStartCustomerOrder === false &&
      !activeOrder?.id &&
      !pendingOrder?.id
    ) {
      const message =
        customerOrderStartReason ||
        "No se pueden iniciar nuevos pedidos desde QR en este momento.";

      setSendToast(`⚠️ ${message}`);
      setTimeout(() => setSendToast(""), 6500);
      return;
    }

    // E. VALIDACIÓN BASE ANTES DE ABRIR MODAL
    if (!allowBase) {
      setSendToast(buildBlockerMessage());
      setTimeout(() => setSendToast(""), 5000);
      return;
    }

    if (hasPending) {
      setSendToast("⏳ Ya hay una comanda en espera de aprobación. No puedes enviar otra.");
      setTimeout(() => setSendToast(""), 5000);
      return;
    }

    // Si todo está bien y es una orden nueva, abrimos el modal
    setSendOpen(true);
  }

  // ==========================================
  // 2. CONTROLADOR PARA EL BOTÓN "MANDAR" DEL MODAL
  // ==========================================
  async function confirmAndCreateOrder() {
    if (sending) return;

    // WHATSAPP y ONLINE_ORDER no crean la orden pública de mesa.
    if (isWebOrderingFlow) return;

    if (hasInvalidCartItems) {
      setSendToast(
        "⚠️ Hay productos que ya no están disponibles. Quítalos para continuar.",
      );
      setTimeout(() => setSendToast(""), 5000);
      return;
    }

    const name = String(customerName || "").trim();
    if (!name) {
      setSendToast("⚠️ Escribe tu nombre para enviar la comanda.");
      setTimeout(() => setSendToast(""), 3500);
      return;
    }

    const party = toSafeInt(partySize);
    const adults = toSafeInt(adultCount);
    const children = toSafeInt(childCount);

    if (party < 1) {
      setSendToast("⚠️ Debe haber al menos una persona en la mesa.");
      setTimeout(() => setSendToast(""), 4000);
      return;
    }

    if (adultCount === "") {
      setSendToast("⚠️ Captura el número de adultos. Usa 0 si no hay.");
      setTimeout(() => setSendToast(""), 4000);
      return;
    }

    if (childCount === "") {
      setSendToast("⚠️ Captura el número de niños. Usa 0 si no hay.");
      setTimeout(() => setSendToast(""), 4000);
      return;
    }

    if (adults < 0 || children < 0) {
      setSendToast("⚠️ Adultos y niños no pueden ser menores a 0.");
      setTimeout(() => setSendToast(""), 4000);
      return;
    }

    if (adults + children !== party) {
      setSendToast("⚠️ La suma de adultos y niños debe coincidir con el total de personas.");
      setTimeout(() => setSendToast(""), 4500);
      return;
    }

    // EJECUCIÓN DE LA ORDEN
    setSending(true);
    setSendToast("");

    try {
      await createFirstOrder(name, {
        party_size: party,
        adult_count: adults,
        child_count: children,
      });
      setTimeout(() => setSendToast(""), 6500);
    } finally {
      setSending(false);
    }
  }

  const applyRealtimeOrderReason = useCallback(
    (reason, orderId) => {
      const rs = String(reason || "").toLowerCase();
      const oid = Number(
        orderId || pendingOrder?.id || activeOrder?.id || lastOrderIdRef.current || 0,
      );
      if (!oid) return;

      lastOrderIdRef.current = oid;

      if (rs === "pending_order_created") {
        setPendingOrder((previous) => ({
          ...(previous || {}),
          id: oid,
          status: "pending",
        }));

        return;
      }

      if (rs === "pending_order_accepted") {
        setPendingOrder(null);
        setActiveOrder((prev) => ({
          ...(prev || {}),
          id: oid,
          status: "open",
          customer_ui: {
            ...(prev?.customer_ui || {}),
            can_add_items: true,
            can_send_items: true,
            show_payment_message: false,
          },
        }));
        return;
      }

      if (rs === "order_items_appended") {
        setPendingOrder(null);
        setActiveOrder((prev) => ({
          ...(prev || {}),
          id: oid,
          status: ["ready", "paying", "paid"].includes(
            String(prev?.status || "").toLowerCase(),
          )
            ? prev?.status
            : "open",
          customer_ui: {
            ...(prev?.customer_ui || {}),
            can_add_items: true,
            can_send_items: true,
          },
        }));
        return;
      }

      if (rs === "pending_order_rejected") {
        setPendingOrder({ id: oid, status: "rejected" });
        setActiveOrder(null);
        return;
      }

      if (rs === "ready_notice_read") {
        setPendingOrder(null);
        setActiveOrder((prev) => ({
          ...(prev || {}),
          id: oid,
          status: "ready",
          customer_ui: {
            ...(prev?.customer_ui || {}),
            can_add_items: true,
            can_send_items: true,
            show_payment_message: false,
          },
          bill_flow: {
            ...(prev?.bill_flow || {}),
            can_request_bill: true,
          },
        }));
        return;
      }

      if (rs === "bill_requested") {
        setPendingOrder(null);

        setActiveOrder((prev) => {
          const currentStatus = String(
            prev?.status || "",
          ).toLowerCase();

          /*
          * Un evento atrasado de solicitud no debe reactivar
          * la etapa anterior cuando la cuenta ya está en caja.
          */
          if (
            currentStatus === "paying" ||
            currentStatus === "paid"
          ) {
            return prev;
          }

          return {
            ...(prev || {}),
            id: oid,
            bill_flow: {
              ...(prev?.bill_flow || {}),
              already_sent: true,
              request_status: "sent",
            },
          };
        });

        return;
      }

      if (rs === "bill_request_read") {
        setPendingOrder(null);

        setActiveOrder((prev) => {
          const currentStatus = String(
            prev?.status || "",
          ).toLowerCase();

          /*
          * Si la orden ya está pagando o pagada, una lectura
          * atrasada no debe volver a mostrar la solicitud.
          */
          if (
            currentStatus === "paying" ||
            currentStatus === "paid"
          ) {
            return prev;
          }

          return {
            ...(prev || {}),
            id: oid,
            bill_flow: {
              ...(prev?.bill_flow || {}),
              already_sent: true,
              request_status: "read",
            },
          };
        });

        return;
      }

      if (rs === "payment_started") {
        setPendingOrder(null);
        setSendToast("");

        setActiveOrder((prev) => ({
          ...(prev || {}),
          id: oid,
          status: "paying",

          customer_ui: {
            ...(prev?.customer_ui || {}),
            show_payment_message: true,
            can_add_items: false,
            can_send_items: false,
          },

          bill_flow: {
            ...(prev?.bill_flow || {}),
            can_request_bill: false,
            already_sent: false,
            request_status: null,
          },
        }));

        return;
      }

      if (rs === "order_paid") {
        setPendingOrder(null);
        setActiveOrder((prev) => ({
          ...(prev || {}),
          id: oid,
          status: "paid",
          customer_ui: {
            ...(prev?.customer_ui || {}),
            show_payment_message: false,
            can_add_items: false,
            can_send_items: false,
          },
          bill_flow: {
            ...(prev?.bill_flow || {}),
            can_request_bill: false,
          },
        }));
      }
    },
    [pendingOrder?.id, activeOrder?.id],
  );

  const syncOrderStatusFromSession = useCallback(
    async (sessionOrderStatus) => {
      const st = String(sessionOrderStatus || "").toLowerCase();
      const oid = pendingOrder?.id || activeOrder?.id || lastOrderIdRef.current;
      if (!oid) return;

      if (st.includes("open") || st.includes("ready")) {
        setPendingOrder(null);

        setActiveOrder((prev) => ({
          ...(prev || {}),
          id: Number(oid),
          status: st.includes("ready") ? "ready" : "open",
          customer_ui: {
            ...(prev?.customer_ui || {}),
            can_add_items: true,
            can_send_items: true,
            show_payment_message: false,
          },
        }));

        await refreshOrder(oid);
        return;
      }

      if (st.includes("paying")) {
        setPendingOrder(null);
        setSendToast("");

        setActiveOrder((prev) => ({
          ...(prev || {}),
          id: Number(oid),
          status: "paying",

          customer_ui: {
            ...(prev?.customer_ui || {}),
            show_payment_message: true,
            can_add_items: false,
            can_send_items: false,
          },

          bill_flow: {
            ...(prev?.bill_flow || {}),
            can_request_bill: false,
            already_sent: false,
            request_status: null,
          },
        }));

        await refreshOrder(oid);
        return;
      }

      if (st.includes("pending")) {
        setPendingOrder((previous) => ({
          ...(previous || {}),
          id: Number(oid),
          status: "pending",
        }));

        return;
      }

      if (st.includes("rejected")) {
        setPendingOrder({ id: Number(oid), status: "rejected" });
        setActiveOrder(null);
        return;
      }

      if (st.includes("expired")) {
        setPendingOrder({ id: Number(oid), status: "expired" });
        setActiveOrder(null);
      }
    },
    [pendingOrder?.id, activeOrder?.id, refreshOrder],
  );

  function resetOnChannelChange() {
    setCart([]);
    setSendOpen(false);
    setCustomerName("");
    setPartySize("");
    setAdultCount("");
    setChildCount("");
    setSendToast("");
    setOnlineOrderQuoting(false);
    setOnlineOrderCreating(false);
    setOnlineOrderCreated(null);
    onlineOrderAttemptRef.current = { signature: "", key: "" };
    setPendingOrder(null);
    setActiveOrder(null);
    setOldItems([]);
    lastOrderIdRef.current = null;
  }

  return {
    cart,
    setCart,
    reconcileCartAvailability,
    hasInvalidCartItems,
    invalidCartItemsCount,
    addToCartFromProduct,
    addToCartFromVariant,
    setCartComponents,
    removeCartItem,
    setCartQty,
    setCartNotes,

    newItemsPricingSummary,
    confirmedPricingSummary,
    pricingSummary,

    displayTotal,
    totalLabel,
    isEstimated,

    /*
    * Aliases temporales para consumidores anteriores.
    */
    cartTotal,
    oldTotal,
    totalGlobal,

    sendOpen,
    setSendOpen,

    onlineOrderCheckout,
    onlineOrderQuoting,
    onlineOrderCreating,
    onlineOrderCreated,
    quoteOnlineOrder,
    createOnlineOrder,

    customerName,
    setCustomerName,
    partySize,
    setPartySize,
    adultCount,
    setAdultCount,
    childCount,
    setChildCount,

    sending,
    sendToast,
    setSendToast,

    pendingOrder,
    activeOrder,
    oldItems,
    currentOrderId,
    refreshOrder,
    syncOrderStatusFromSession,
    applyRealtimeOrderReason,

    allowSendNow,
    canAppend,

    canStartCustomerOrder,
    canContinueExistingCustomerOrder,
    customerOrderStartReasonCode,
    customerOrderStartReason,

    submitOrderOrAppend,
    confirmAndCreateOrder,

    resetOnChannelChange,
  };
}