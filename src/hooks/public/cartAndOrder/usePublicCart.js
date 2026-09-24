import { useCallback, useMemo, useRef, useState } from "react";
import {
  buildCartKey,
  buildNewItemsPricingSummary,
  buildPreparedItemErrorMessage,
  extractApiErrorInfo,
  isPreparedItemError,
  normalizeCompositeComponentsForKey,
  normalizeModifierGroupsForKey,
  safeNum,
} from "../publicMenu.utils";
import {
  countInvalidCartItems,
  getCartLineProductId,
  getCartLineVariantId,
  reconcilePendingCartAvailability,
} from "../../menu/menuAvailability.utils";
import {
  buildPreparedItemCartLine,
  getPreparedItemCartKey,
  getPreparedItemId,
  isPreparedItemAlreadySelected,
  isPreparedItemLine,
} from "../../menu/preparedItem.utils";
import {
  applyAvailabilityErrorToCart,
  buildCartAvailabilityMetadata,
  buildCartPromotionMetadata,
} from "./publicCartAndOrder.utils";

/*
|--------------------------------------------------------------------------
| usePublicCart
|--------------------------------------------------------------------------
| Administra el carrito local Public, incluyendo productos normales,
| variantes, composites, PreparedItems, availability y pricing local.
|
| Usa:
| - publicMenu.utils.js.
| - menuAvailability.utils.js.
| - preparedItem.utils.js.
| - publicCartAndOrder.utils.js.
|
| Lo usa:
| - useCartAndOrder.js.
|--------------------------------------------------------------------------
*/

export function usePublicCart({
  activeMenuPayload,
  isWhatsappFlow,
  onPreparedItemsRefresh = null,
}) {
  const [cart, setCart] = useState([]);
  const [preparedCartMessage, setPreparedCartMessage] = useState("");
  const cartLineSequenceRef = useRef(0);

  const invalidCartItemsCount = useMemo(
    () => countInvalidCartItems(cart),
    [cart],
  );

  const hasInvalidCartItems = invalidCartItemsCount > 0;

  const reconcileCartAvailability = useCallback(
    (menuSource = activeMenuPayload) => {
      if (!menuSource) {
        return;
      }

      setCart((previous) =>
        reconcilePendingCartAvailability(previous, menuSource),
      );
    },
    [activeMenuPayload],
  );

  const markCartAvailabilityError = useCallback((apiError) => {
    setCart((previous) =>
      applyAvailabilityErrorToCart(previous, apiError),
    );
  }, []);

  const reconcilePreparedItems = useCallback(
    (availablePreparedItems = []) => {
      const available = Array.isArray(availablePreparedItems)
        ? availablePreparedItems
        : [];

      const missingLines = cart.filter((item) => {
        return (
          isPreparedItemLine(item) &&
          !isPreparedItemAlreadySelected(available, item)
        );
      });

      if (missingLines.length === 0) {
        return {
          ok: true,
          removed_prepared_item_ids: [],
          message: "",
        };
      }

      const missingIds = new Set(
        missingLines.map(getPreparedItemId).filter(Boolean),
      );

      setCart((previous) =>
        previous.filter((item) => {
          if (!isPreparedItemLine(item)) {
            return true;
          }

          return !missingIds.has(getPreparedItemId(item));
        }),
      );

      const message =
        missingLines.length === 1
          ? `⚠️ ${String(missingLines[0]?.name || "El producto")} de Preparación rápida ya no está disponible y se quitó del pedido.`
          : `⚠️ ${missingLines.length} productos de Preparación rápida dejaron de estar disponibles y se quitaron del pedido.`;

      setPreparedCartMessage(message);

      return {
        ok: false,
        code: "PREPARED_ITEMS_REMOVED_FROM_CART",
        removed_prepared_item_ids: Array.from(missingIds),
        message,
      };
    },
    [cart],
  );

  const refreshPreparedItemsPool = useCallback(async () => {
    if (typeof onPreparedItemsRefresh !== "function") {
      return null;
    }

    try {
      return await onPreparedItemsRefresh();
    } catch {
      return null;
    }
  }, [onPreparedItemsRefresh]);

  const handlePreparedItemRequestError = useCallback(
    async (error) => {
      const apiError = extractApiErrorInfo(error);

      if (!isPreparedItemError(apiError)) {
        return null;
      }

      let message = buildPreparedItemErrorMessage(apiError);
      const refreshedItems = await refreshPreparedItemsPool();

      if (Array.isArray(refreshedItems)) {
        const reconciliation = reconcilePreparedItems(refreshedItems);

        if (reconciliation?.message) {
          message = reconciliation.message;
        }
      }

      const finalMessage = String(message || "").startsWith("⚠️")
        ? String(message)
        : `⚠️ ${String(message)}`;

      setPreparedCartMessage(finalMessage);

      return {
        ok: false,
        preparedItemError: true,
        message: finalMessage,
        data: apiError?.data || null,
      };
    },
    [reconcilePreparedItems, refreshPreparedItemsPool],
  );

  function upsertCartItem(nextItem) {
    cartLineSequenceRef.current += 1;

    const uniqueLineKey = [
      String(nextItem?.key || "cart-item"),
      "line",
      Date.now(),
      cartLineSequenceRef.current,
    ].join(":");

    setCart((previous) => [
      ...previous,
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

    if (!pid) {
      return;
    }

    const normalizedComponents =
      normalizeCompositeComponentsForKey(componentsOverride);

    const normalizedModifiers =
      normalizeModifierGroupsForKey(modifiersOverride);

    const key = buildCartKey(
      pid,
      null,
      normalizedComponents,
      normalizedModifiers,
    );

    const isComposite =
      String(p?.product_type || "simple") === "composite";

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

      components: isComposite
        ? normalizedComponents
        : [],

      components_detail: isComposite
        ? Array.isArray(componentsDetailOverride)
          ? componentsDetailOverride
          : []
        : [],

      modifiers: normalizedModifiers,

      modifier_groups_display:
        Array.isArray(modifierGroupsDisplayOverride)
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

    if (!pid || !vid) {
      return;
    }

    const normalizedComponents =
      normalizeCompositeComponentsForKey(componentsOverride);

    const normalizedModifiers =
      normalizeModifierGroupsForKey(modifiersOverride);

    const key = buildCartKey(
      pid,
      vid,
      normalizedComponents,
      normalizedModifiers,
    );

    const isComposite =
      String(p?.product_type || "simple") === "composite";

    const baseUnitPrice = safeNum(
      v?.price,
      safeNum(p?.price, 0),
    );

    const promotionMetadata = buildCartPromotionMetadata(
      v,
      baseUnitPrice,
    );

    const availabilityMetadata =
      buildCartAvailabilityMetadata(v);

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

      components: isComposite
        ? normalizedComponents
        : [],

      components_detail: isComposite
        ? Array.isArray(componentsDetailOverride)
          ? componentsDetailOverride
          : []
        : [],

      modifiers: normalizedModifiers,

      modifier_groups_display:
        Array.isArray(modifierGroupsDisplayOverride)
          ? modifierGroupsDisplayOverride
          : [],
    });
  }

  function setCartComponents(
    itemKey,
    components,
    componentsDetail = null,
  ) {
    const normalized =
      normalizeCompositeComponentsForKey(components);

    setCart((previous) =>
      previous.map((item) =>
        item.key === itemKey &&
        !isPreparedItemLine(item)
          ? {
              ...item,
              components: normalized,
              components_detail:
                Array.isArray(componentsDetail)
                  ? componentsDetail
                  : item.components_detail || [],
            }
          : item,
      ),
    );
  }

  function removeCartItem(key) {
    setCart((previous) =>
      previous.filter((item) => item.key !== key),
    );
  }

  function addPreparedItem(preparedItem) {
    if (isWhatsappFlow) {
      const message =
        "⚠️ Preparación rápida no está disponible para pedidos por WhatsApp.";

      setPreparedCartMessage(message);

      return {
        ok: false,
        code: "PREPARED_ITEM_NOT_AVAILABLE_FOR_WHATSAPP",
        message,
      };
    }

    const line = buildPreparedItemCartLine(preparedItem);

    if (!line) {
      const message =
        "⚠️ La unidad de Preparación rápida no es válida.";

      setPreparedCartMessage(message);

      return {
        ok: false,
        message,
      };
    }

    if (isPreparedItemAlreadySelected(cart, line)) {
      const message =
        "⚠️ Esta unidad de Preparación rápida ya está en el pedido.";

      setPreparedCartMessage(message);

      return {
        ok: false,
        code: "PREPARED_ITEM_ALREADY_SELECTED",
        message,
        prepared_item_id: getPreparedItemId(line),
      };
    }

    setCart((previous) => [...previous, line]);
    setPreparedCartMessage("");

    return {
      ok: true,
      prepared_item_id: getPreparedItemId(line),
      key: line.key,
    };
  }

  function removePreparedItem(preparedItemOrId) {
    const preparedKey =
      getPreparedItemCartKey(preparedItemOrId);

    if (!preparedKey) {
      return;
    }

    setCart((previous) =>
      previous.filter((item) => {
        if (!isPreparedItemLine(item)) {
          return true;
        }

        return getPreparedItemCartKey(item) !== preparedKey;
      }),
    );
  }

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
    const requestedQty = Math.max(
      1,
      Math.min(
        99,
        Math.trunc(Number(qty || 1)),
      ),
    );

    setCart((previous) =>
      previous.map((item) => {
        if (
          item.key !== key ||
          isPreparedItemLine(item)
        ) {
          return item;
        }

        const rawMax =
          item?.availability?.max_available_qty;

        if (
          rawMax === null ||
          rawMax === undefined ||
          rawMax === ""
        ) {
          return {
            ...item,
            quantity: requestedQty,
          };
        }

        const maxAvailable =
          Math.floor(Number(rawMax));

        if (
          !Number.isFinite(maxAvailable) ||
          maxAvailable <= 0
        ) {
          return item;
        }

        const productId =
          getCartLineProductId(item);

        const variantId =
          getCartLineVariantId(item);

        const usedByOtherLines = previous.reduce(
          (sum, other) => {
            if (other.key === key) {
              return sum;
            }

            const sameProduct =
              getCartLineProductId(other) ===
              productId;

            const sameVariant =
              getCartLineVariantId(other) ===
              variantId;

            return sameProduct && sameVariant
              ? sum +
                  Math.max(
                    0,
                    Number(other?.quantity || 0),
                  )
              : sum;
          },
          0,
        );

        const availableForThisLine =
          Math.floor(
            maxAvailable - usedByOtherLines,
          );

        if (availableForThisLine <= 0) {
          return item;
        }

        return {
          ...item,
          quantity: Math.max(
            1,
            Math.min(
              requestedQty,
              availableForThisLine,
            ),
          ),
        };
      }),
    );
  }

  function setCartNotes(key, notes) {
    setCart((previous) =>
      previous.map((item) =>
        item.key === key
          ? {
              ...item,
              notes: String(notes || ""),
            }
          : item,
      ),
    );
  }

  const newItemsPricingSummary = useMemo(() => {
    const summary =
      buildNewItemsPricingSummary(cart);

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

  function resetCartState() {
    setCart([]);
    setPreparedCartMessage("");
  }

  return {
    cart,
    setCart,

    reconcileCartAvailability,
    markCartAvailabilityError,

    hasInvalidCartItems,
    invalidCartItemsCount,

    addToCartFromProduct,
    addToCartFromVariant,

    addPreparedItem,
    removePreparedItem,
    reconcilePreparedItems,
    selectedPreparedItemIds,

    preparedCartMessage,
    setPreparedCartMessage,
    clearPreparedCartMessage,

    refreshPreparedItemsPool,
    handlePreparedItemRequestError,

    setCartComponents,
    removeCartItem,
    setCartQty,
    setCartNotes,

    newItemsPricingSummary,

    resetCartState,
  };
}