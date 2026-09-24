import { useCallback, useMemo, useRef, useState } from "react";
import {
  appendWaiterOrderItems,
  cancelOrderItems,
  createWaiterOrder,
  fetchCancellationContext,
  getCurrentTableOrder,
  getOrderById,
} from "../../services/staff/waiter/staffOrders.service";
import {
  buildAvailabilityErrorMessage,
  buildCartKey,
  buildCombinedPricingSummary,
  buildNewItemsPricingSummary,
  extractApiErrorInfo,
  isAvailabilityErrorCode,
  isWarehouseSelectionErrorCode,
  normalizeCompositeComponentsForKey,
  normalizeConfirmedPricingSummary,
  normalizeModifierGroupsForKey,
  normalizePromotionPresentation,
  safeNum,
} from "../public/publicMenu.utils";
import {
  countInvalidCartItems,
  getCartLineProductId,
  getCartLineVariantId,
  reconcilePendingCartAvailability,
} from "../menu/menuAvailability.utils";

import {
  buildPreparedItemCartLine,
  getPreparedItemCartKey,
  getPreparedItemId,
  isPreparedItemAlreadySelected,
  isPreparedItemLine,
  serializePreparedItemLine,
} from "../menu/preparedItem.utils";

import { buildOrderCancellationSelectionPayload } from "../../components/menu/shared/cancellation/OrderCancellationSelection";

const INVALID_CART_MESSAGE =
  "⚠️ Hay productos que ya no están disponibles. Quítalos para continuar.";

function getCancellationEffectiveQuantity(item) {
  const quantity = Number(item?.effective_quantity || 0);
  if (!Number.isFinite(quantity)) return 0;

  return Math.max(0, Math.floor(quantity));
}

function normalizeItemsForApi(cart) {
  const arr = Array.isArray(cart) ? cart : [];

  return arr.map((it) => {
    if (isPreparedItemLine(it)) return serializePreparedItemLine(it);

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

function hasOwn(source, key) {
  return (
    source != null &&
    typeof source === "object" &&
    Object.prototype.hasOwnProperty.call(source, key)
  );
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
  const sourceAvailability =
    data?.availability && typeof data.availability === "object"
      ? data.availability
      : {};

  const code = String(apiError?.code || "").trim().toUpperCase();
  const fallbackStatus =
    code === "INSUFFICIENT_PRODUCT_AVAILABILITY"
      ? "insufficient_stock"
      : code.endsWith("_BY_SCHEDULE")
        ? "unavailable_by_schedule"
        : "no_longer_sellable";

  const receivedStatus = String(sourceAvailability?.status || "").trim().toLowerCase();
  const status =
    receivedStatus && receivedStatus !== "available"
      ? receivedStatus
      : fallbackStatus;

  const reason = String(
    sourceAvailability?.reason ||
      apiError?.message ||
      "Este producto dejó de estar disponible.",
  ).trim();

  const availability = {
    ...sourceAvailability,
    status,
    is_available_now: false,
    reason,
    source:
      sourceAvailability?.source ||
      (status === "unavailable_by_schedule"
        ? "schedule"
        : status === "insufficient_stock"
          ? "inventory"
          : "catalog"),
  };

  const rawItemIndex = data?.item_index;
  const itemIndex =
    rawItemIndex === null || rawItemIndex === undefined || rawItemIndex === ""
      ? -1
      : Number(rawItemIndex);

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

export function useStaffCartAndOrder({ tableId }) {
  const [cart, setCart] = useState([]);

  const [sendOpen, setSendOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [sending, setSending] = useState(false);
  const [sendToast, setSendToast] = useState("");
  const [preparedCartMessage, setPreparedCartMessage] = useState("");

  const [activeOrder, setActiveOrder] = useState(null);
  const [oldItems, setOldItems] = useState([]);

  const [cancellationContext, setCancellationContext] = useState(null);
  const [cancellationSelection, setCancellationSelection] = useState({});
  const [cancellationActive, setCancellationActive] = useState(false);
  const [cancellationLoading, setCancellationLoading] = useState(false);
  const [cancellationSubmitting, setCancellationSubmitting] = useState(false);
  const [cancellationError, setCancellationError] = useState("");

  const [warehouseDialogOpen, setWarehouseDialogOpen] = useState(false);
  const [warehouseSelectionContext, setWarehouseSelectionContext] = useState(null);

  const lastLoadedRef = useRef({ tableId: null, orderId: null });
  const cartLineSequenceRef = useRef(0);

  const invalidCartItemsCount = useMemo(() => countInvalidCartItems(cart), [cart]);
  const hasInvalidCartItems = invalidCartItemsCount > 0;

  const cancellationSummary = useMemo(() => {
    return buildOrderCancellationSelectionPayload(
      cancellationContext?.items || [],
      cancellationSelection,
    );
  }, [cancellationContext, cancellationSelection]);

  const selectedCancellationItems = useMemo(() => {
    const selectedById = new Map(
      cancellationSummary.items.map((item) => [
        Number(item.order_item_id),
        Number(item.quantity),
      ]),
    );

    return (Array.isArray(cancellationContext?.items) ? cancellationContext.items : [])
      .filter((item) => selectedById.has(Number(item?.order_item_id || 0)))
      .map((item) => ({
        ...item,
        selected_quantity: selectedById.get(Number(item.order_item_id)),
      }));
  }, [cancellationContext, cancellationSummary.items]);

  const cancellationRequiresAuthorization = useMemo(() => {
    if (!cancellationSummary.can_continue) return false;

    if (
      cancellationSummary.is_full &&
      Boolean(cancellationContext?.order?.full_cancellation_requires_authorization)
    ) {
      return true;
    }

    return selectedCancellationItems.some((item) => Boolean(item?.requires_authorization));
  }, [
    cancellationContext,
    cancellationSummary.can_continue,
    cancellationSummary.is_full,
    selectedCancellationItems,
  ]);

  const reconcileCartAvailability = useCallback((menuSource) => {
    if (!menuSource) return;
    setCart((previous) => reconcilePendingCartAvailability(previous, menuSource));
  }, []);

  const markCartAvailabilityError = useCallback((apiError) => {
    setCart((previous) => applyAvailabilityErrorToCart(previous, apiError));
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

    const promotionMetadata =
      buildCartPromotionMetadata(
        p,
        baseUnitPrice,
      );

    upsertCartItem({
      key,
      product_id: pid,
      variant_id: null,
      name: p?.display_name || p?.name || "Producto",
      variant_name: null,

      unit_price: baseUnitPrice,
      ...promotionMetadata,

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

    const promotionMetadata =
      buildCartPromotionMetadata(
        v,
        baseUnitPrice,
      );

    upsertCartItem({
      key,
      product_id: pid,
      variant_id: vid,
      name: p?.display_name || p?.name || "Producto",
      variant_name: v?.name || "Variante",

      unit_price: baseUnitPrice,
      ...promotionMetadata,

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
        x.key === itemKey && !isPreparedItemLine(x)
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

  function addPreparedItem(preparedItem) {
    const line = buildPreparedItemCartLine(preparedItem);

    if (!line) {
      const message = "⚠️ La unidad de Preparación rápida no es válida.";
      setPreparedCartMessage(message);
      return { ok: false, message };
    }

    if (isPreparedItemAlreadySelected(cart, line)) {
      const message = "⚠️ Esta unidad de Preparación rápida ya está en la comanda.";
      setPreparedCartMessage(message);

      return {
        ok: false,
        code: "PREPARED_ITEM_ALREADY_SELECTED",
        message,
        prepared_item_id: getPreparedItemId(line),
      };
    }

    setCart((prev) => [...prev, line]);
    setPreparedCartMessage("");

    return {
      ok: true,
      prepared_item_id: getPreparedItemId(line),
      key: line.key,
    };
  }

  function removePreparedItem(preparedItemOrId) {
    const preparedKey = getPreparedItemCartKey(preparedItemOrId);
    if (!preparedKey) return;

    setCart((prev) => prev.filter((item) => {
      return !isPreparedItemLine(item) || getPreparedItemCartKey(item) !== preparedKey;
    }));
  }

  const reconcilePreparedItems = useCallback((availablePreparedItems = []) => {
    const availableIds = new Set(
      (Array.isArray(availablePreparedItems) ? availablePreparedItems : [])
        .map(getPreparedItemId)
        .filter(Boolean),
    );

    const missingLines = cart.filter((item) => {
      if (!isPreparedItemLine(item)) return false;

      const preparedItemId = getPreparedItemId(item);
      return preparedItemId && !availableIds.has(preparedItemId);
    });

    if (missingLines.length === 0) {
      return {
        ok: true,
        removed_prepared_item_ids: [],
        message: "",
      };
    }

    const missingIds = new Set(missingLines.map(getPreparedItemId).filter(Boolean));

    setCart((prev) => prev.filter((item) => {
      if (!isPreparedItemLine(item)) return true;
      return !missingIds.has(getPreparedItemId(item));
    }));

    const message = missingLines.length === 1
      ? `⚠️ ${String(missingLines[0]?.name || "El producto")} de Preparación rápida ya no está disponible y se quitó de la comanda.`
      : `⚠️ ${missingLines.length} productos de Preparación rápida dejaron de estar disponibles y se quitaron de la comanda.`;

    setPreparedCartMessage(message);

    return {
      ok: false,
      code: "PREPARED_ITEMS_REMOVED_FROM_CART",
      removed_prepared_item_ids: Array.from(missingIds),
      message,
    };
  }, [cart]);

  function clearPreparedCartMessage() {
    setPreparedCartMessage("");
  }

  const selectedPreparedItemIds = useMemo(() => {
    return Array.from(
      new Set(
        cart
          .map(getPreparedItemId)
          .filter(Boolean),
      ),
    );
  }, [cart]);

  function setCartQty(key, qty) {
    const qn = Math.max(1, Math.min(99, Number(qty || 1)));

    setCart((prev) => prev.map((x) => {
      if (x.key !== key || isPreparedItemLine(x)) return x;

      return { ...x, quantity: qn };
    }));
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

  const confirmedPricingSummary = useMemo(() => {
    return normalizeConfirmedPricingSummary(
      activeOrder,
    );
  }, [activeOrder]);

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

  const canAppend =
    !!activeOrder?.id &&
    ["open", "ready"].includes(String(activeOrder?.status || "").toLowerCase());

  const closeWarehouseDialog = useCallback(() => {
    if (sending) return;
    setWarehouseDialogOpen(false);
    setWarehouseSelectionContext(null);
  }, [sending]);

  const loadExisting = useCallback(
    async ({ orderId, force = false } = {}) => {
      const tid = Number(tableId || 0);
      if (!tid) return;

      const oIdNum = orderId ? Number(orderId) : null;

      if (
        !force &&
        lastLoadedRef.current.tableId === tid &&
        lastLoadedRef.current.orderId === (oIdNum || null) &&
        (Array.isArray(oldItems) ? oldItems.length : 0) > 0
      ) {
        return {
          order: activeOrder,
          items: oldItems,
          skipped: true,
        };
      }

      lastLoadedRef.current = { tableId: tid, orderId: oIdNum || null };

      let res = null;

      if (oIdNum) {
        try {
          res = await getOrderById(oIdNum);
        } catch {
          res = null;
        }
      }

      if (!res) {
        res = await getCurrentTableOrder(tid);
      }

      if (res?.ok) {
        const o =
          res?.data?.order || null;

        const items =
          Array.isArray(res?.data?.items_flat)
            ? res.data.items_flat
            : Array.isArray(res?.data?.items)
              ? res.data.items
              : [];

        setActiveOrder(o);
        setOldItems(items);

        return {
          order: o,
          items,
        };
      }

      return null;
    },
    [tableId, oldItems, activeOrder],
  );

  const startCancellation = useCallback(async () => {
    const orderId = Number(activeOrder?.id || 0);

    if (!orderId) {
      const message = "No hay una comanda activa para cancelar.";
      setCancellationError(message);
      return { ok: false, message };
    }

    if (cancellationLoading || cancellationSubmitting) {
      return { ok: false, message: "La cancelación ya se está procesando." };
    }

    setCancellationLoading(true);
    setCancellationError("");
    setCancellationActive(false);
    setCancellationContext(null);
    setCancellationSelection({});

    try {
      const res = await fetchCancellationContext(orderId);

      if (!res?.ok) {
        const message = res?.message || "No fue posible cargar el contexto de cancelación.";
        setCancellationError(message);
        return { ok: false, message };
      }

      const context = res?.data && typeof res.data === "object" ? res.data : null;

      if (!context?.order?.can_cancel) {
        const message = "La comanda ya no permite cancelaciones.";
        setCancellationError(message);
        return { ok: false, message, data: context };
      }

      const hasCancelableItems = (Array.isArray(context?.items) ? context.items : [])
        .some((item) => Boolean(item?.can_cancel) && getCancellationEffectiveQuantity(item) > 0);

      if (!hasCancelableItems) {
        const message = "La comanda ya no tiene productos disponibles para cancelar.";
        setCancellationError(message);
        return { ok: false, message, data: context };
      }

      setCancellationContext(context);
      setCancellationActive(true);

      return {
        ok: true,
        data: context,
      };
    } catch (error) {
      const apiError = extractApiErrorInfo(error);
      const message = apiError?.message || "No fue posible cargar el contexto de cancelación.";

      setCancellationError(message);

      return {
        ok: false,
        code: apiError?.code || null,
        message,
        data: apiError?.data || null,
      };
    } finally {
      setCancellationLoading(false);
    }
  }, [
    activeOrder?.id,
    cancellationLoading,
    cancellationSubmitting,
  ]);

  function exitCancellation() {
    if (cancellationSubmitting) return;

    setCancellationActive(false);
    setCancellationContext(null);
    setCancellationSelection({});
    setCancellationError("");
  }

  function toggleCancellationItem(item, selected) {
    const orderItemId = Number(item?.order_item_id || 0);
    const maxQuantity = getCancellationEffectiveQuantity(item);

    if (!orderItemId || maxQuantity <= 0) return;

    setCancellationSelection((previous) => {
      const next = { ...previous };

      if (!selected) {
        delete next[orderItemId];
        return next;
      }

      const currentQuantity = Number(previous?.[orderItemId] || 1);
      next[orderItemId] = Math.max(1, Math.min(maxQuantity, Math.floor(currentQuantity)));

      return next;
    });
  }

  function setCancellationQuantity(item, quantity) {
    const orderItemId = Number(item?.order_item_id || 0);
    const maxQuantity = getCancellationEffectiveQuantity(item);
    const requestedQuantity = Number(quantity);

    if (!orderItemId || maxQuantity <= 0 || !Number.isFinite(requestedQuantity)) return;

    setCancellationSelection((previous) => {
      if (!previous?.[orderItemId]) return previous;

      return {
        ...previous,
        [orderItemId]: Math.max(1, Math.min(maxQuantity, Math.floor(requestedQuantity))),
      };
    });
  }

  const submitCancellation = useCallback(async (resolution = {}) => {
    const orderId = Number(activeOrder?.id || cancellationContext?.order?.id || 0);

    if (!orderId || !cancellationActive) {
      const message = "No hay una cancelación activa.";
      setCancellationError(message);
      return { ok: false, message };
    }

    if (cancellationSubmitting) {
      return { ok: false, message: "La cancelación ya se está procesando." };
    }

    if (!cancellationSummary.can_continue || !cancellationSummary.type) {
      const message = "Selecciona al menos un producto para cancelar.";
      setCancellationError(message);
      return { ok: false, message };
    }

    const allowedTypes = Array.isArray(cancellationContext?.order?.allowed_types)
      ? cancellationContext.order.allowed_types.map((type) => String(type))
      : [];

    if (allowedTypes.length > 0 && !allowedTypes.includes(cancellationSummary.type)) {
      const message = "El tipo de cancelación seleccionado ya no está permitido.";
      setCancellationError(message);
      return { ok: false, message };
    }

    const reasonCode = String(resolution?.reason_code || "").trim();

    if (!reasonCode) {
      const message = "Debes indicar el motivo de la cancelación.";
      setCancellationError(message);
      return { ok: false, message };
    }

    const decisions =
      resolution?.item_decisions &&
      typeof resolution.item_decisions === "object" &&
      !Array.isArray(resolution.item_decisions)
        ? resolution.item_decisions
        : {};

    const items = cancellationSummary.items.map((selectedItem) => {
      const orderItemId = Number(selectedItem.order_item_id);
      const decision = decisions[orderItemId] || decisions[String(orderItemId)] || {};
      const item = { ...selectedItem };

      const reuseIntent = String(decision?.reuse_intent || "").trim();
      const deliveryState = String(decision?.delivery_state || "").trim();

      if (reuseIntent) item.reuse_intent = reuseIntent;
      if (deliveryState) item.delivery_state = deliveryState;

      return item;
    });

    const payload = {
      type: cancellationSummary.type,
      items,
      reason_code: reasonCode,
      reason_note: String(resolution?.reason_note || "").trim() || null,
    };

    const authorizerUserId = Number(resolution?.authorizer_user_id || 0);
    const pin = String(resolution?.pin || "").trim();

    if (Number.isInteger(authorizerUserId) && authorizerUserId > 0) {
      payload.authorizer_user_id = authorizerUserId;
    }

    if (pin) payload.pin = pin;

    setCancellationSubmitting(true);
    setCancellationError("");

    try {
      const res = await cancelOrderItems(orderId, payload);

      if (!res?.ok) {
        const message = res?.message || "No fue posible aplicar la cancelación.";
        setCancellationError(message);

        return {
          ok: false,
          code: res?.code || null,
          message,
          data: res?.data || null,
        };
      }

      await loadExisting({
        orderId,
        force: true,
      });

      const appliedType = cancellationSummary.type;

      setCancellationActive(false);
      setCancellationContext(null);
      setCancellationSelection({});
      setCancellationError("");
      setSendToast(
        appliedType === "full"
          ? "✅ Comanda cancelada correctamente."
          : "✅ Cancelación aplicada correctamente.",
      );

      return {
        ok: true,
        type: appliedType,
        data: res?.data || null,
        response: res,
      };
    } catch (error) {
      const apiError = extractApiErrorInfo(error);
      const message = apiError?.message || "No fue posible aplicar la cancelación.";

      setCancellationError(message);

      return {
        ok: false,
        code: apiError?.code || null,
        message,
        data: apiError?.data || null,
      };
    } finally {
      setCancellationSubmitting(false);
    }
  }, [
    activeOrder?.id,
    cancellationActive,
    cancellationContext,
    cancellationSubmitting,
    cancellationSummary,
    loadExisting,
  ]);

  const createFirstOrder = useCallback(
    async (name, preferredWarehouseId = null) => {
      if (hasInvalidCartItems) {
        setSendToast(INVALID_CART_MESSAGE);
        return { ok: false, availabilityError: true };
      }

      const tid = Number(tableId || 0);
      if (!tid) {
        setSendToast("⚠️ Mesa inválida.");
        return { ok: false };
      }

      const items = normalizeItemsForApi(cart);

      try {
        const payload = {
          customer_name: name,
          items,
          ...(preferredWarehouseId
            ? { preferred_warehouse_id: Number(preferredWarehouseId) }
            : {}),
        };

        const res = await createWaiterOrder(tid, payload);

        if (res?.ok) {
          const responseData =
            res?.data &&
            typeof res.data === "object"
              ? res.data
              : {};

          const orderId =
            responseData?.order_id ||
            responseData?.id ||
            null;

          if (orderId) {
            const numericOrderId = Number(orderId);

            setActiveOrder((previous) =>
              mergeConfirmedOrderTotals(
                previous,
                responseData,
                {
                  id: numericOrderId,

                  status:
                    String(responseData?.status || "") ||
                    "open",

                  customer_name:
                    String(
                      responseData?.customer_name ||
                      name ||
                      "",
                    ),

                  preferred_warehouse_id:
                    responseData?.preferred_warehouse_id
                      ? Number(
                          responseData.preferred_warehouse_id,
                        )
                      : null,
                },
              ),
            );
          }

          setCart([]);
          setCustomerName("");
          setSendOpen(false);
          setWarehouseDialogOpen(false);
          setWarehouseSelectionContext(null);

          if (responseData?.preferred_warehouse_auto_selected) {
            setSendToast(
              "✅ Comanda creada. El almacén se resolvió automáticamente.",
            );
          } else {
            setSendToast("✅ Comanda creada.");
          }

          if (orderId) {
            await loadExisting({
              orderId,
              force: true,
            });
          } else {
            await loadExisting({
              force: true,
            });
          }

          return {
            ok: true,
            orderId,
          };
        }

        if (isWarehouseSelectionErrorCode(res?.code)) {
          setWarehouseSelectionContext(res?.data || null);
          setWarehouseDialogOpen(true);
          setSendOpen(false);
          setSendToast(`⚠️ ${res?.message || "Debes seleccionar un almacén."}`);

          return {
            ok: false,
            requiresWarehouseSelection: true,
            data: res?.data || null,
          };
        }

        if (isAvailabilityErrorCode(res?.code)) {
          const apiError = {
            code: res?.code,
            message: res?.message,
            data: res?.data,
          };

          markCartAvailabilityError(apiError);
          setSendToast(`⚠️ ${buildAvailabilityErrorMessage(apiError)}`);

          return {
            ok: false,
            availabilityError: true,
            data: res?.data || null,
          };
        }

        setSendToast(`⚠️ ${res?.message || "No se pudo crear la comanda."}`);
        return { ok: false };
      } catch (e) {
        const apiError = extractApiErrorInfo(e);

        if (isWarehouseSelectionErrorCode(apiError.code)) {
          setWarehouseSelectionContext(apiError.data || null);
          setWarehouseDialogOpen(true);
          setSendOpen(false);
          setSendToast(`⚠️ ${apiError.message}`);
          return {
            ok: false,
            requiresWarehouseSelection: true,
            data: apiError.data || null,
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

        const msg = apiError?.message || "No se pudo crear la comanda.";
        setSendToast(`⚠️ ${msg}`);
        return { ok: false };
      }
    },
    [tableId, cart, loadExisting, hasInvalidCartItems, markCartAvailabilityError, ],
  );

  const appendToOpenOrder = useCallback(
    async (orderId) => {
      if (hasInvalidCartItems) {
        setSendToast(INVALID_CART_MESSAGE);
        return { ok: false, availabilityError: true };
      }

      const items = normalizeItemsForApi(cart);

      try {
        const res = await appendWaiterOrderItems(Number(orderId), { items });

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
                  String(
                    responseData?.status ||
                    previous?.status ||
                    "",
                  ) || "open",
              },
            ),
          );

          setCart([]);

          setSendToast(
            "✅ Productos agregados a la orden.",
          );

          await loadExisting({
            orderId,
            force: true,
          });

          return {
            ok: true,
          };
        }

        if (isAvailabilityErrorCode(res?.code)) {
          const apiError = {
            code: res?.code,
            message: res?.message,
            data: res?.data,
          };

          markCartAvailabilityError(apiError);
          setSendToast(`⚠️ ${buildAvailabilityErrorMessage(apiError)}`);

          return {
            ok: false,
            availabilityError: true,
            data: res?.data || null,
          };
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
    [cart, loadExisting, hasInvalidCartItems, markCartAvailabilityError, ],
  );

  const confirmWarehouseSelection = useCallback(
    async (warehouseId) => {
      if (hasInvalidCartItems) {
        setSendToast(INVALID_CART_MESSAGE);
        return;
      }

      const name = String(customerName || "").trim();

      if (!name) {
        setSendToast("⚠️ Escribe el nombre del cliente para crear la comanda.");
        return;
      }

      if (!warehouseId) {
        setSendToast("⚠️ Debes seleccionar un almacén.");
        return;
      }

      if (sending) return;

      setSending(true);
      try {
        await createFirstOrder(name, Number(warehouseId));
        setTimeout(() => setSendToast(""), 6500);
      } finally {
        setSending(false);
      }
    },
    [customerName, sending, createFirstOrder,hasInvalidCartItems, ],
  );

  async function submitOrderOrAppend() {
    if (sending) return;

    if (hasInvalidCartItems) {
      setSendToast(INVALID_CART_MESSAGE);
      setTimeout(() => setSendToast(""), 5000);
      return;
    }

    if (cart.length <= 0) {
      setSendToast("⚠️ No hay items seleccionados.");
      setTimeout(() => setSendToast(""), 3000);
      return;
    }

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

    const name = String(customerName || "").trim();
    if (!name) {
      setSendToast("⚠️ Escribe el nombre del cliente para crear la comanda.");
      setTimeout(() => setSendToast(""), 3500);
      return;
    }

    setSending(true);
    setSendToast("");
    try {
      await createFirstOrder(name);
      setTimeout(() => setSendToast(""), 6500);
    } finally {
      setSending(false);
    }
  }

  function resetAll() {
    setCart([]);
    setSendOpen(false);
    setCustomerName("");
    setSendToast("");
    setPreparedCartMessage("");

    setActiveOrder(null);
    setOldItems([]);

    setCancellationContext(null);
    setCancellationSelection({});
    setCancellationActive(false);
    setCancellationLoading(false);
    setCancellationSubmitting(false);
    setCancellationError("");

    setWarehouseDialogOpen(false);
    setWarehouseSelectionContext(null);
    lastLoadedRef.current = { tableId: null, orderId: null };
  }

  return {
    cart,
    setCart,
    reconcileCartAvailability,
    hasInvalidCartItems,
    invalidCartItemsCount,

    addToCartFromProduct,
    addToCartFromVariant,

    addPreparedItem,
    removePreparedItem,
    reconcilePreparedItems,
    selectedPreparedItemIds,
    preparedCartMessage,
    clearPreparedCartMessage,

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
    customerName,
    setCustomerName,

    sending,
    sendToast,
    setSendToast,

    activeOrder,
    oldItems,
    canAppend,

    cancellationContext,
    cancellationSelection,
    cancellationSummary,
    selectedCancellationItems,
    cancellationRequiresAuthorization,
    cancellationActive,
    cancellationLoading,
    cancellationSubmitting,
    cancellationError,

    startCancellation,
    exitCancellation,
    toggleCancellationItem,
    setCancellationQuantity,
    submitCancellation,

    warehouseDialogOpen,
    warehouseSelectionContext,
    closeWarehouseDialog,
    confirmWarehouseSelection,

    loadExisting,
    submitOrderOrAppend,
    resetAll,
  };
}