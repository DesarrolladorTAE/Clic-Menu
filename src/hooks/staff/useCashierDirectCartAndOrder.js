import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  appendCashierDirectOrderItems,
  createCashierDirectOrder,
  fetchCashierDirectOrder,
  removeCashierDirectOrderItem,
  reviewCashierDirectOrderStock,
} from "../../services/staff/casher/cashierDirectOrder.service";

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
} from "../public/publicMenu.utils";

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
      out.modifiers = parentModifiers.map((group) => ({
        ...group,
        options: group.options.map((option) => ({
          modifier_option_id: Number(option.modifier_option_id),
          quantity: Number(option.quantity || 1),
        })),
      }));
    }

    if (Array.isArray(it.components) && it.components.length > 0) {
      out.components = normalizeCompositeComponentsForKey(it.components).map(
        (component) => {
          const componentPayload = {
            component_product_id: Number(component.component_product_id),
            variant_id: component.variant_id
              ? Number(component.variant_id)
              : null,
            quantity:
              component.quantity === null || component.quantity === undefined
                ? null
                : Number(component.quantity),
          };

          const componentModifiers = normalizeModifierGroupsForKey(
            component?.modifiers || []
          );

          if (componentModifiers.length > 0) {
            componentPayload.modifiers = componentModifiers.map((group) => ({
              ...group,
              options: group.options.map((option) => ({
                modifier_option_id: Number(option.modifier_option_id),
                quantity: Number(option.quantity || 1),
              })),
            }));
          }

          return componentPayload;
        }
      );
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
    normalized.hasActivePromotion
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
      basePrice
    ),

    display_price: hasActivePromotion
      ? safeNum(normalized.displayPrice, basePrice)
      : safeNum(basePrice, 0),

    promotion_discount_preview: hasActivePromotion
      ? safeNum(normalized.promotionDiscountPreview, 0)
      : 0,
  };
}

function buildCashierConfirmedPricingSummary(
  activeOrder,
  activeSale
) {
  const order =
    activeOrder && typeof activeOrder === "object"
      ? activeOrder
      : null;

  const sale =
    activeSale && typeof activeSale === "object"
      ? activeSale
      : null;

  if (!order && !sale) {
    return normalizeConfirmedPricingSummary(null);
  }

  const source = {
    ...(order || {}),
  };

  if (!hasOwn(source, "subtotal") && hasOwn(sale, "subtotal")) {
    source.subtotal = sale.subtotal;
  }

  if (
    !hasOwn(source, "promotion_discount_total") &&
    hasOwn(sale, "promotion_discount_total")
  ) {
    source.promotion_discount_total =
      sale.promotion_discount_total;
  }

  if (hasOwn(sale, "manual_discount_total")) {
    source.manual_discount_total =
      sale.manual_discount_total;
  }

  if (hasOwn(sale, "discount_total")) {
    source.discount_total = sale.discount_total;
  }

  if (!hasOwn(source, "total") && hasOwn(sale, "total")) {
    source.total = sale.total;
  }

  source.payable_total = hasOwn(sale, "total")
    ? safeNum(sale.total, 0)
    : hasOwn(source, "payable_total")
      ? safeNum(source.payable_total, 0)
      : hasOwn(source, "net_total")
        ? safeNum(source.net_total, 0)
        : safeNum(source.total, 0);

  return normalizeConfirmedPricingSummary(source);
}

function normalizeOldItemsFromResponse(data) {
  if (Array.isArray(data?.items_flat)) return data.items_flat;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.items_tree)) return data.items_tree;
  return [];
}

function getSaleIdFromCreateResponse(res) {
  return Number(
    res?.data?.sale_id ||
      res?.data?.sale?.id ||
      res?.sale_id ||
      res?.sale?.id ||
      0
  );
}

function getOrderIdFromCreateResponse(res) {
  return Number(
    res?.data?.order_id ||
      res?.data?.order?.id ||
      res?.order_id ||
      res?.order?.id ||
      0
  );
}

function getSaleIdFromAppendResponse(res) {
  return Number(
    res?.data?.sale_id ||
      res?.data?.sale?.id ||
      res?.sale_id ||
      res?.sale?.id ||
      0
  );
}

function getSaleIdFromReviewResponse(res) {
  return Number(
    res?.data?.sale?.id ||
      res?.data?.sale_id ||
      res?.sale?.id ||
      res?.sale_id ||
      0
  );
}

function buildReviewErrorMessage(res) {
  return (
    res?.message ||
    res?.data?.message ||
    res?.data?.stock_review?.message ||
    "La venta todavía no puede regresar a cobro. Revisa stock y productos."
  );
}

export function useCashierDirectCartAndOrder({ returnSaleId = null } = {}) {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);

  const [sendOpen, setSendOpen] = useState(false);
  const [customerName, setCustomerName] = useState("Cliente mostrador");
  const [kitchenFlow, setKitchenFlow] = useState("");
  const [sending, setSending] = useState(false);
  const [sendToast, setSendToast] = useState("");

  const [activeOrder, setActiveOrder] = useState(null);
  const [activeSale, setActiveSale] = useState(null);
  const [oldItems, setOldItems] = useState([]);
  const [stockReview, setStockReview] = useState(null);

  const lastLoadedRef = useRef({ orderId: null });

  const normalizedReturnSaleId = Number(returnSaleId || 0);

  const canAppend =
    !!activeOrder?.id &&
    String(activeOrder?.source || "") === "cashier_direct" &&
    String(activeOrder?.status || "") === "paying" &&
    String(activeSale?.status || "") === "taken";

  function upsertCartItem(nextItem) {
    setCart((prev) => {
      const idx = prev.findIndex((row) => row.key === nextItem.key);

      if (idx >= 0) {
        const next = [...prev];

        next[idx] = {
          ...next[idx],

          quantity: Math.min(
            99,
            safeNum(next[idx].quantity, 1) +
              safeNum(nextItem.quantity, 1)
          ),

          has_active_promotion:
            nextItem.has_active_promotion,

          promotion:
            nextItem.promotion ?? null,

          promotion_label:
            nextItem.promotion_label ?? null,

          promotion_type:
            nextItem.promotion_type ?? null,

          original_price:
            nextItem.original_price,

          display_price:
            nextItem.display_price,

          promotion_discount_preview:
            nextItem.promotion_discount_preview,

          components:
            nextItem.components ??
            next[idx].components ??
            [],

          components_detail:
            nextItem.components_detail ??
            next[idx].components_detail ??
            [],

          modifiers:
            nextItem.modifiers ??
            next[idx].modifiers ??
            [],

          modifier_groups_display:
            nextItem.modifier_groups_display ??
            next[idx].modifier_groups_display ??
            [],
        };
        return next;
      }

      return [...prev, nextItem];
    });
  }

  function addToCartFromProduct(
    product,
    componentsOverride = [],
    componentsDetailOverride = [],
    modifiersOverride = [],
    modifierGroupsDisplayOverride = []
  ) {
    const productId = Number(product?.id || 0);
    if (!productId) return;

    const normalizedComponents =
      normalizeCompositeComponentsForKey(componentsOverride);
    const normalizedModifiers = normalizeModifierGroupsForKey(modifiersOverride);
    const isComposite =
      String(product?.product_type || "simple") === "composite";

    const key = buildCartKey(
      productId,
      null,
      normalizedComponents,
      normalizedModifiers
    );

    const baseUnitPrice = safeNum(
      product?.price,
      0
    );

    const promotionMetadata =
      buildCartPromotionMetadata(
        product,
        baseUnitPrice
      );

    upsertCartItem({
      key,
      product_id: productId,
      variant_id: null,
      name: product?.display_name || product?.name || "Producto",
      variant_name: null,

      unit_price: baseUnitPrice,
      ...promotionMetadata,

      quantity: 1,
      notes: "",
      product_type: String(product?.product_type || "simple"),
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
    product,
    variant,
    componentsOverride = [],
    componentsDetailOverride = [],
    modifiersOverride = [],
    modifierGroupsDisplayOverride = []
  ) {
    const productId = Number(product?.id || 0);
    const variantId = Number(variant?.id || 0);

    if (!productId || !variantId) return;

    const normalizedComponents =
      normalizeCompositeComponentsForKey(componentsOverride);
    const normalizedModifiers = normalizeModifierGroupsForKey(modifiersOverride);
    const isComposite =
      String(product?.product_type || "simple") === "composite";

    const key = buildCartKey(
      productId,
      variantId,
      normalizedComponents,
      normalizedModifiers
    );

    const baseUnitPrice = safeNum(
      variant?.price,
      safeNum(product?.price, 0)
    );

    const promotionMetadata =
      buildCartPromotionMetadata(
        variant,
        baseUnitPrice
      );

    upsertCartItem({
      key,
      product_id: productId,
      variant_id: variantId,
      name: product?.display_name || product?.name || "Producto",
      variant_name: variant?.name || "Variante",

      unit_price: baseUnitPrice,
      ...promotionMetadata,

      quantity: 1,
      notes: "",
      product_type: String(product?.product_type || "simple"),
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
      prev.map((item) =>
        item.key === itemKey
          ? {
              ...item,
              components: normalized,
              components_detail: Array.isArray(componentsDetail)
                ? componentsDetail
                : item.components_detail || [],
            }
          : item
      )
    );
  }

  function removeCartItem(key) {
    setCart((prev) => prev.filter((item) => item.key !== key));
  }

  function setCartQty(key, qty) {
    const nextQty = Math.max(1, Math.min(99, Number(qty || 1)));

    setCart((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, quantity: nextQty } : item
      )
    );
  }

  function setCartNotes(key, notes) {
    setCart((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, notes: String(notes || "") } : item
      )
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
    return buildCashierConfirmedPricingSummary(
      activeOrder,
      activeSale
    );
  }, [activeOrder, activeSale]);

  const pricingSummary = useMemo(() => {
    return buildCombinedPricingSummary(
      confirmedPricingSummary,
      newItemsPricingSummary
    );
  }, [
    confirmedPricingSummary,
    newItemsPricingSummary,
  ]);

  const displayTotal = safeNum(
    pricingSummary?.displayTotal,
    0
  );

  const totalLabel =
    pricingSummary?.totalLabel || "Total";

  const isEstimated = Boolean(
    pricingSummary?.isEstimated
  );

  /*
  * Aliases temporales de compatibilidad.
  */
  const cartTotal = safeNum(
    newItemsPricingSummary?.totalApproximate,
    0
  );

  const oldTotal = safeNum(
    confirmedPricingSummary?.confirmedTotal,
    0
  );

  const totalGlobal = displayTotal;

  const loadExisting = useCallback(
    async ({ orderId, force = false } = {}) => {
      const nextOrderId = Number(orderId || activeOrder?.id || 0);
      if (!nextOrderId) return null;

      if (
        !force &&
        Number(lastLoadedRef.current.orderId || 0) === nextOrderId &&
        activeOrder?.id
      ) {
        return {
          order: activeOrder,
          sale: activeSale,
          items: oldItems,
          skipped: true,
        };
      }

      lastLoadedRef.current = { orderId: nextOrderId };

      const res = await fetchCashierDirectOrder(nextOrderId);

      if (res?.ok) {
        const data = res?.data || null;
        const order = data?.order || null;
        const sale = data?.sale || null;
        const items = normalizeOldItemsFromResponse(data);

        setActiveOrder(order);
        setActiveSale(sale);
        setOldItems(items);

        if (order?.customer_name) {
          setCustomerName(String(order.customer_name));
        }

        if (order?.kitchen_flow) {
          setKitchenFlow(String(order.kitchen_flow));
        }

        return {
          order,
          sale,
          items,
        };
      }

      return null;
    },
    [activeOrder, activeSale, oldItems]
  );

  const reviewStock = useCallback(
    async (orderId = null) => {
      const targetOrderId = Number(orderId || activeOrder?.id || 0);

      if (!targetOrderId) {
        setStockReview(null);
        return null;
      }

      const res = await reviewCashierDirectOrderStock(targetOrderId);
      setStockReview(res?.data || null);

      return res;
    },
    [activeOrder]
  );

  const createFirstOrder = useCallback(
    async ({ name, requestedKitchenFlow = "" } = {}) => {
      const items = normalizeItemsForApi(cart);

      if (!items.length) {
        setSendToast("⚠️ No hay productos seleccionados.");
        return { ok: false };
      }

      const payload = {
        customer_name: String(name || customerName || "Cliente mostrador").trim(),
        items,
      };

      if (requestedKitchenFlow) {
        payload.kitchen_flow = requestedKitchenFlow;
      }

      const res = await createCashierDirectOrder(payload);

      if (res?.ok) {
        const orderId = getOrderIdFromCreateResponse(res);
        const saleId = getSaleIdFromCreateResponse(res);

        setCart([]);
        setSendOpen(false);
        setSendToast("✅ Venta directa creada correctamente.");

        if (orderId) {
          await loadExisting({ orderId, force: true }).catch(() => {});
        }

        if (saleId) {
          navigate(`/staff/cashier/sales/${saleId}`, { replace: true });
        }

        return {
          ok: true,
          orderId,
          saleId,
          data: res?.data || null,
        };
      }

      if (isAvailabilityErrorCode(res?.code)) {
        const apiError = {
          code: res?.code,
          message: res?.message,
          data: res?.data,
        };

        setSendToast(`⚠️ ${buildAvailabilityErrorMessage(apiError)}`);

        return {
          ok: false,
          availabilityError: true,
          data: res?.data || null,
        };
      }

      setSendToast(`⚠️ ${res?.message || "No se pudo crear la venta directa."}`);

      return {
        ok: false,
        data: res?.data || null,
      };
    },
    [cart, customerName, loadExisting, navigate]
  );

  const appendToDirectOrder = useCallback(
    async (orderId, options = {}) => {
      const shouldReturnToSaleDetail = options?.returnToSaleDetail !== false;
      const targetOrderId = Number(orderId || activeOrder?.id || 0);
      const items = normalizeItemsForApi(cart);

      if (!targetOrderId) {
        setSendToast("⚠️ No hay una orden activa para agregar productos.");
        return { ok: false };
      }

      if (!items.length) {
        setSendToast("⚠️ No hay productos seleccionados.");
        return { ok: false };
      }

      const res = await appendCashierDirectOrderItems(targetOrderId, { items });

      if (res?.ok) {
        setCart([]);
        setSendOpen(false);
        setSendToast("✅ Productos agregados a la venta directa.");

        const data = res?.data || null;
        const saleIdFromResponse = getSaleIdFromAppendResponse(res);
        const nextSaleId =
          normalizedReturnSaleId ||
          saleIdFromResponse ||
          Number(activeSale?.id || activeSale?.sale_id || 0);

        if (data?.stock_review) {
          setStockReview(data.stock_review);
        }

        await loadExisting({ orderId: targetOrderId, force: true }).catch(
          () => {}
        );

        if (shouldReturnToSaleDetail && nextSaleId) {
          navigate(`/staff/cashier/sales/${nextSaleId}`, { replace: true });
        }

        return {
          ok: true,
          data,
          saleId: nextSaleId || null,
        };
      }

      if (isAvailabilityErrorCode(res?.code)) {
        const apiError = {
          code: res?.code,
          message: res?.message,
          data: res?.data,
        };

        setSendToast(`⚠️ ${buildAvailabilityErrorMessage(apiError)}`);

        return {
          ok: false,
          availabilityError: true,
          data: res?.data || null,
        };
      }

      setSendToast(
        `⚠️ ${res?.message || "No se pudieron agregar los productos."}`
      );

      return {
        ok: false,
        data: res?.data || null,
      };
    },
    [
      cart,
      activeOrder,
      activeSale,
      normalizedReturnSaleId,
      loadExisting,
      navigate,
    ]
  );

  const removeExistingOrderItem = useCallback(
    async (orderItemId, options = {}) => {
      const shouldReturnToSaleDetail = Boolean(options?.returnToSaleDetail);
      const targetOrderId = Number(activeOrder?.id || 0);
      const targetItemId = Number(orderItemId || 0);

      if (!targetOrderId || !targetItemId) {
        setSendToast("⚠️ No se pudo identificar el producto a eliminar.");
        return { ok: false };
      }

      const res = await removeCashierDirectOrderItem(targetOrderId, targetItemId);

      if (res?.ok) {
        const data = res?.data || null;
        const nextSaleId =
          normalizedReturnSaleId ||
          Number(data?.sale_id || 0) ||
          Number(activeSale?.id || activeSale?.sale_id || 0);

        setStockReview(data?.stock_review || null);
        setSendToast("✅ Producto eliminado de la venta directa.");

        await loadExisting({ orderId: targetOrderId, force: true }).catch(
          () => {}
        );

        if (shouldReturnToSaleDetail && nextSaleId) {
          navigate(`/staff/cashier/sales/${nextSaleId}`, { replace: true });
        }

        return {
          ok: true,
          data,
          saleId: nextSaleId || null,
        };
      }

      setSendToast(`⚠️ ${res?.message || "No se pudo eliminar el producto."}`);

      return {
        ok: false,
        data: res?.data || null,
      };
    },
    [activeOrder, activeSale, normalizedReturnSaleId, loadExisting, navigate]
  );

  const validateAndGoToPayment = useCallback(
    async (options = {}) => {
      if (sending) return { ok: false };

      const targetOrderId = Number(options?.orderId || activeOrder?.id || 0);
      const currentSaleId =
        normalizedReturnSaleId || Number(activeSale?.id || activeSale?.sale_id || 0);

      if (!targetOrderId) {
        setSendToast("⚠️ No hay una orden activa para validar.");
        return { ok: false };
      }

      setSending(true);
      setSendToast("");

      try {
        let appendResult = null;

        if (cart.length > 0) {
          appendResult = await appendToDirectOrder(targetOrderId, {
            returnToSaleDetail: false,
          });

          if (!appendResult?.ok) {
            setTimeout(() => setSendToast(""), 6500);
            return appendResult;
          }
        }

        const reviewRes = await reviewCashierDirectOrderStock(targetOrderId);
        const reviewData = reviewRes?.data || null;

        setStockReview(reviewData);

        const nextSaleId =
          normalizedReturnSaleId ||
          getSaleIdFromReviewResponse(reviewRes) ||
          Number(reviewData?.sale?.id || reviewData?.sale_id || 0) ||
          Number(appendResult?.saleId || 0) ||
          currentSaleId;

        if (reviewRes?.ok && reviewData?.can_return_to_payment === true) {
          setSendToast("✅ Venta validada. Regresando a cobro.");

          await loadExisting({ orderId: targetOrderId, force: true }).catch(
            () => {}
          );

          if (nextSaleId) {
            navigate(`/staff/cashier/sales/${nextSaleId}`, { replace: true });
          }

          return {
            ok: true,
            data: reviewData,
            saleId: nextSaleId || null,
          };
        }

        setSendToast(`⚠️ ${buildReviewErrorMessage(reviewRes)}`);
        setTimeout(() => setSendToast(""), 6500);

        return {
          ok: false,
          data: reviewData,
          saleId: nextSaleId || null,
        };
      } catch (e) {
        const apiError = extractApiErrorInfo(e);

        if (isAvailabilityErrorCode(apiError.code)) {
          setSendToast(`⚠️ ${buildAvailabilityErrorMessage(apiError)}`);

          return {
            ok: false,
            availabilityError: true,
            data: apiError.data || null,
          };
        }

        const msg =
          apiError?.message ||
          "No se pudo validar la venta directa para regresar a cobro.";

        setSendToast(`⚠️ ${msg}`);

        return {
          ok: false,
          error: apiError,
        };
      } finally {
        setSending(false);
      }
    },
    [
      sending,
      cart,
      activeOrder,
      activeSale,
      normalizedReturnSaleId,
      appendToDirectOrder,
      loadExisting,
      navigate,
    ]
  );

  async function submitOrderOrAppend() {
    if (sending) return { ok: false };

    if (cart.length <= 0) {
      setSendToast("⚠️ No hay productos seleccionados.");
      setTimeout(() => setSendToast(""), 3500);
      return { ok: false };
    }

    setSending(true);
    setSendToast("");

    try {
      let result;

      if (canAppend && activeOrder?.id) {
        result = await appendToDirectOrder(activeOrder.id);
      } else {
        result = await createFirstOrder({
          name: customerName,
          requestedKitchenFlow: kitchenFlow,
        });
      }

      setTimeout(() => setSendToast(""), 6500);

      return result;
    } catch (e) {
      const apiError = extractApiErrorInfo(e);

      if (isAvailabilityErrorCode(apiError.code)) {
        setSendToast(`⚠️ ${buildAvailabilityErrorMessage(apiError)}`);

        return {
          ok: false,
          availabilityError: true,
          data: apiError.data || null,
        };
      }

      const msg =
        apiError?.message ||
        "No se pudo procesar la venta directa desde caja.";

      setSendToast(`⚠️ ${msg}`);

      return {
        ok: false,
        error: apiError,
      };
    } finally {
      setSending(false);
    }
  }

  function goToSaleDetail() {
    const saleId =
      normalizedReturnSaleId ||
      Number(activeSale?.id || activeSale?.sale_id || 0);

    if (!saleId) return;

    navigate(`/staff/cashier/sales/${saleId}`);
  }

  function resetAll() {
    setCart([]);
    setSendOpen(false);
    setCustomerName("Cliente mostrador");
    setKitchenFlow("");
    setSending(false);
    setSendToast("");
    setActiveOrder(null);
    setActiveSale(null);
    setOldItems([]);
    setStockReview(null);
    lastLoadedRef.current = { orderId: null };
  }

  return {
    cart,
    setCart,
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
    customerName,
    setCustomerName,
    kitchenFlow,
    setKitchenFlow,

    sending,
    sendToast,
    setSendToast,

    activeOrder,
    activeSale,
    oldItems,
    stockReview,
    canAppend,

    loadExisting,
    reviewStock,
    submitOrderOrAppend,
    validateAndGoToPayment,
    createFirstOrder,
    appendToDirectOrder,
    removeExistingOrderItem,
    goToSaleDetail,
    resetAll,
  };
}