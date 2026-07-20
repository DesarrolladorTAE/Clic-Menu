import { useCallback, useMemo, useRef, useState } from "react";
import {
  appendWaiterOrderItems,
  createWaiterOrder,
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

export function useStaffCartAndOrder({ tableId }) {
  const [cart, setCart] = useState([]);

  const [sendOpen, setSendOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [sending, setSending] = useState(false);
  const [sendToast, setSendToast] = useState("");

  const [activeOrder, setActiveOrder] = useState(null);
  const [oldItems, setOldItems] = useState([]);

  const [warehouseDialogOpen, setWarehouseDialogOpen] = useState(false);
  const [warehouseSelectionContext, setWarehouseSelectionContext] = useState(null);

  const lastLoadedRef = useRef({ tableId: null, orderId: null });
  const cartLineSequenceRef = useRef(0);

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
    const qn = Math.max(1, Math.min(99, Number(qty || 1)));
    setCart((prev) => prev.map((x) => (x.key === key ? { ...x, quantity: qn } : x)));
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

  const createFirstOrder = useCallback(
    async (name, preferredWarehouseId = null) => {
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
    [tableId, cart, loadExisting],
  );

  const appendToOpenOrder = useCallback(
    async (orderId) => {
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

        setSendToast(`⚠️ ${res?.message || "No se pudieron agregar productos."}`);
        return { ok: false };
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
          "No se pudieron agregar productos.";

        setSendToast(`⚠️ ${msg}`);
        return { ok: false };
      }
    },
    [cart, loadExisting],
  );

  const confirmWarehouseSelection = useCallback(
    async (warehouseId) => {
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
    [customerName, sending, createFirstOrder],
  );

  async function submitOrderOrAppend() {
    if (sending) return;

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
    setActiveOrder(null);
    setOldItems([]);
    setWarehouseDialogOpen(false);
    setWarehouseSelectionContext(null);
    lastLoadedRef.current = { tableId: null, orderId: null };
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

    sending,
    sendToast,
    setSendToast,

    activeOrder,
    oldItems,
    canAppend,

    warehouseDialogOpen,
    warehouseSelectionContext,
    closeWarehouseDialog,
    confirmWarehouseSelection,

    loadExisting,
    submitOrderOrAppend,
    resetAll,
  };
}
