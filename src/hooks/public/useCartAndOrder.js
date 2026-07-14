import { useCallback, useMemo, useRef, useState } from "react";
import {
  appendPublicOrderItems,
  createPublicOrder,
  getPublicOrder,
  sendPublicWhatsapp
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

function buildWhatsAppPayload(cart) {
  const items = Array.isArray(cart) ? cart : [];

  const lines = items.map((it) => {
    const name = it.name || "Producto";
    const qty = it.quantity || 1;

    return `• ${qty} x ${name}`;
  });

  return lines.join("\n");
}


function isActiveOrderStatus(status) {
  return ["open", "ready", "paying", "paid"].includes(String(status || "").toLowerCase());
}

function isPendingLikeStatus(status) {
  return ["pending", "rejected", "expired", "cancelled"].includes(
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

function stripPromotionMetadata(item) {
  const {
    has_active_promotion,
    promotion,
    promotion_label,
    promotion_type,
    original_price,
    display_price,
    promotion_discount_preview,
    ...payloadItem
  } = item || {};

  return payloadItem;
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
  isWebMenu,
}) {
  const isWebType = activeMenuType === "web";
  /**
   * NUEVA FUENTE DE VERDAD SOLO PARA PUBLIC MENU WEB
   * (no afecta otros sistemas)
   */
  const isPublicWebMenu =
    typeof window !== "undefined" &&
    activeMenuType === "web" &&
    !!activeMenuPayload;

  const [cart, setCart] = useState([]);
  const [sendOpen, setSendOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [partySize, setPartySize] = useState("");
  const [adultCount, setAdultCount] = useState("");
  const [childCount, setChildCount] = useState("");
  const [sending, setSending] = useState(false);
  const [sendToast, setSendToast] = useState("");

  const [pendingOrder, setPendingOrder] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [oldItems, setOldItems] = useState([]);

  const lastOrderIdRef = useRef(null);

  const sendWhatsAppOrder = useCallback(async () => {
    try {
      if (activeMenuType !== "web") {
        setSendToast("Este menú no permite envío por WhatsApp.");
        return { ok: false };
      }

      const res = await sendPublicWhatsapp({
        token,
        items: cart.map(stripPromotionMetadata),
      });

      if (res?.ok === false) {
        setSendToast(res?.message || "No se pudo enviar el mensaje.");
        return { ok: false };
      }

      const url = res?.whatsapp_url;

      setCart([]);
      setSendOpen(false);
      setCustomerName("");
      setPartySize("");
      setAdultCount("");
      setChildCount("");

      if (url) {
        window.open(url, "_blank");
      }

      setSendToast("Pedido enviado por WhatsApp");

      return { ok: true };
    } catch (e) {
      setSendToast("No se pudo enviar el mensaje, intente más tarde.");
      return { ok: false };
    }
  }, [cart, token]);

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
    setCart((prev) => {
      const idx = prev.findIndex((x) => x.key === nextItem.key);

      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],

          quantity: Math.min(
            99,
            safeNum(next[idx].quantity, 1) +
              safeNum(nextItem.quantity, 1),
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

  const tableOk = isWebMenu || isPublicWebMenu ? true : !!hasTable;
  const sessionOk = isWebMenu || isPublicWebMenu ? true : !!sessionActive;
  const modeOk =
    isWebMenu || isPublicWebMenu
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

  const orderUiOk = isWebMenu
    ? true
    : canAppend
      ? orderUi?.can_add_items !== false && orderUi?.can_send_items !== false
      : true;

  const hasPending =
    !!pendingOrder?.id &&
    String(pendingOrder?.status || "pending").toLowerCase() === "pending";

  const isPublicRoute =
  typeof window !== "undefined" &&
  window.location.pathname.startsWith("/menu");

  const allowBase =
    (isWebMenu || isPublicWebMenu)
      ? selectableOk && hasItems && orderUiOk && payingOk
      : tableOk &&
        sessionOk &&
        modeOk &&
        selectableOk &&
        busyOk &&
        unavailableOk &&
        hasItems &&
        orderUiOk &&
        payingOk;

  const allowSendNow =
    (isWebMenu || isPublicWebMenu)
      ? allowBase
      : allowBase && (canAppend || !hasPending);

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

        if (isAvailabilityErrorCode(apiError.code)) {
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
    [cart, token, refreshOrder],
  );

  const appendToOpenOrder = useCallback(
    async (orderId) => {
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
    [cart, token, refreshOrder],
  );

  function buildBlockerMessage() {
    const reasons = [];

    if (!isWebMenu && !sessionOk) reasons.push("sesión no activa");
    if (!isWebMenu && !tableOk) reasons.push("mesa no detectada");
    if (!modeOk) reasons.push("modo no permitido");
    if (!selectableOk) reasons.push("menú no seleccionable");
    if (!busyOk) reasons.push("mesa ocupada por otro dispositivo");
    if (!unavailableOk) reasons.push("sesión no disponible");
    if (!hasItems) reasons.push("sin productos");
    if (!orderUiOk) reasons.push("orden bloqueada para agregar");
    if (!payingOk) reasons.push("cuenta en proceso de pago");

    return reasons.length
      ? `⚠️ No se puede enviar en este momento: ${reasons.join(", ")}.`
      : "⚠️ No se puede enviar en este momento.";
  }

  // ==========================================
  // 1. CONTROLADOR PRINCIPAL DEL BOTÓN ENVIAR
  // ==========================================
  async function submitOrderOrAppend() {
    if (sending) return;

    // A. FLUJO WEB (WHATSAPP)
    if (activeMenuType === "web") {
      const res = await sendWhatsAppOrder();
      if (!res.ok) return;
      setTimeout(() => setSendToast(""), 4000);
      return;
    }

    // B. APPEND A ORDEN EXISTENTE (No necesita modal)
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

    // C. VALIDACIÓN BASE ANTES DE ABRIR MODAL
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
    setPendingOrder(null);
    setActiveOrder(null);
    setOldItems([]);
    lastOrderIdRef.current = null;
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
    submitOrderOrAppend,
    confirmAndCreateOrder,

    resetOnChannelChange,
  };
}