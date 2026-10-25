//src/hooks/public/cartAndOrder/usePublicCart.js
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { useTransientMessage } from "../../menu/useTransientMessage";

import {
  getMenuSetById,
  getMenuSetOptionById,
  getMenuSetStageByDefinitionId,
  isMenuSetOptionSelectable,
  normalizeMenuSetCatalog,
} from "../../menu/menu-sets/menuSet.utils";
import {
  buildMenuSetSelectionPayload,
  isMenuSetCartLine,
} from "../../menu/menu-sets/menuSetPayload.utils";
import {
  getMenuSetCart,
  saveMenuSetCart,
} from "../../menu/menu-sets/menuSetNavigationStore";

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
function reconcileMenuSetLine(item, menuSets) {
  const menuSet = getMenuSetById(menuSets, item.menu_set_id);
  let reason = "";

  if (!menuSet || menuSet.isActive === false || menuSet.isSellable === false) {
    reason = "Este Conjunto ya no está disponible.";
  } else {
    const selections = Array.isArray(item.selections) ? item.selections : [];
    const knownStages = new Set();

    if (selections.length === 0) {
      reason = "Este Conjunto no tiene productos seleccionados.";
    }

    for (const stage of menuSet.stages || []) {
      if (reason) break;

      const stageId = Number(stage.stageDefinitionId);
      knownStages.add(stageId);

      const savedStage = selections.find((row) =>
        Number(row.menu_set_stage_definition_id) === stageId
      );

      const chosen = Array.isArray(savedStage?.items) ? savedStage.items : [];
      const minimum = stage.required
        ? Math.max(1, Number(stage.minSelections || 0))
        : Number(stage.minSelections || 0);

      const maximum = Number(stage.maxSelections || 0);

      if (chosen.length < minimum || chosen.length > maximum) {
        reason = `Revisa las selecciones de "${stage.name}".`;
        break;
      }

      const selectedOptionIds = new Set();

      for (const selection of chosen) {
        const optionId = Number(selection.menu_set_product_id);
        const option = getMenuSetOptionById(stage, optionId);

        if (!option || selectedOptionIds.has(optionId)) {
          reason = `Revisa los productos elegidos en "${stage.name}".`;
          break;
        }

        selectedOptionIds.add(optionId);

        if (!isMenuSetOptionSelectable(option, selection.prepared_item_id)) {
          reason = `"${option.name}" ya no está disponible.`;
          break;
        }

        const variantId = Number(selection.variant_id || 0);

        if (variantId > 0) {
          const variant = (option.variants || []).find((row) =>
            Number(row.id) === variantId
          );

          if (!variant || variant.is_available === false) {
            reason = `La variante elegida de "${option.name}" ya no está disponible.`;
            break;
          }
        }
      }
    }

    if (!reason && selections.some((stage) =>
      !knownStages.has(Number(stage.menu_set_stage_definition_id))
    )) {
      reason = "La configuración de este Conjunto cambió. Revisa tu selección.";
    }
  }

  return {
    ...item,
    menu_set_invalid: Boolean(reason),
    menu_set_invalid_reason: reason,
  };
}

export function usePublicCart({
  activeMenuPayload,
  isWhatsappFlow,
  onPreparedItemsRefresh = null,
  navigationKey = null,
}) {
  const [cart, setCart] = useState(() => getMenuSetCart(navigationKey) || []);
  const currentNavigationKeyRef = useRef(navigationKey);

  useEffect(() => {
    if (currentNavigationKeyRef.current !== navigationKey) {
      currentNavigationKeyRef.current = navigationKey;
      setCart(getMenuSetCart(navigationKey) || []);
      return;
    }

    if (navigationKey) saveMenuSetCart(navigationKey, cart);
  }, [navigationKey, cart]);

  const persistNavigationCart = useCallback(() => {
    if (!navigationKey) {
      return { ok: false, message: "No se pudo identificar el pedido actual." };
    }

    return saveMenuSetCart(navigationKey, cart);
  }, [navigationKey, cart]);
  const [preparedCartMessage, setPreparedCartMessage, clearPreparedCartMessage] =
    useTransientMessage();
  const cartLineSequenceRef = useRef(0);

  const invalidCartItemsCount = useMemo(() => {
    const normalItems = cart.filter((item) => !isMenuSetCartLine(item));
    const invalidMenuSets = cart.filter((item) =>
      isMenuSetCartLine(item) && item.menu_set_invalid === true
    );

    return countInvalidCartItems(normalItems) + invalidMenuSets.length;
  }, [cart]);

  const hasInvalidCartItems = invalidCartItemsCount > 0;

  const reconcileCartAvailability = useCallback((menuSource = activeMenuPayload) => {
    if (!menuSource) return;

    const rawMenuSets =
      menuSource?.menu_sets ??
      menuSource?.menuSets ??
      menuSource?.menu_set_catalog?.menu_sets ??
      null;

    const hasMenuSetCatalog = Array.isArray(rawMenuSets);

    const menuSets = !hasMenuSetCatalog
      ? []
      : rawMenuSets.every((item) => item?.kind === "menu_set")
        ? rawMenuSets
        : normalizeMenuSetCatalog({ menu_sets: rawMenuSets }).menuSets;

    setCart((previous) => {
      const normalItems = previous.filter((item) => !isMenuSetCartLine(item));
      const reconciledNormal = reconcilePendingCartAvailability(normalItems, menuSource);
      const normalByKey = new Map(
        reconciledNormal.map((item) => [String(item.key), item])
      );

      return previous.map((item) => {
        if (isMenuSetCartLine(item)) {
          return hasMenuSetCatalog
            ? reconcileMenuSetLine(item, menuSets)
            : item;
        }

        return normalByKey.get(String(item.key)) || item;
      });
    });
  }, [activeMenuPayload]);

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

    return uniqueLineKey;
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

  function normalizeIncomingMenuSetLine(line) {
    const payload = buildMenuSetSelectionPayload(line);

    return {
      ...line,
      kind: "menu_set",
      commercial_type: "menu_set",
      menu_set_id: payload.menu_set_id,
      product_id: null,
      variant_id: null,
      quantity: 1,
      selections: payload.selections,
      menu_set_invalid: false,
      menu_set_invalid_reason: "",
    };
  }

  function addMenuSetCartLine(line) {
    try {
      const normalized = normalizeIncomingMenuSetLine(line);
      const key = upsertCartItem(normalized);

      return { ok: true, key };
    } catch (error) {
      return {
        ok: false,
        message: error?.message || "No fue posible agregar el Conjunto.",
      };
    }
  }

  function replaceMenuSetCartLine(itemKey, line) {
    const existing = cart.find((item) =>
      item.key === itemKey && isMenuSetCartLine(item)
    );

    if (!existing) {
      return { ok: false, message: "No se encontró el Conjunto que deseas modificar." };
    }

    try {
      const normalized = normalizeIncomingMenuSetLine(line);

      setCart((previous) => previous.map((item) =>
        item.key === itemKey
          ? { ...normalized, key: itemKey }
          : item
      ));

      return { ok: true, key: itemKey };
    } catch (error) {
      return {
        ok: false,
        message: error?.message || "No fue posible modificar el Conjunto.",
      };
    }
  }

  function removeMenuSetCartLine(itemKey) {
    const existing = cart.find((item) =>
      item.key === itemKey && isMenuSetCartLine(item)
    );

    if (!existing) {
      return { ok: false, message: "No se encontró el Conjunto seleccionado." };
    }

    setCart((previous) => previous.filter((item) => item.key !== itemKey));
    return { ok: true };
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
          !isPreparedItemLine(item) &&
          !isMenuSetCartLine(item)
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
          isPreparedItemLine(item) ||
          isMenuSetCartLine(item)
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
        item.key === key && !isMenuSetCartLine(item)
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
    clearPreparedCartMessage();
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

    addMenuSetCartLine,
    replaceMenuSetCartLine,
    removeMenuSetCartLine,
    persistNavigationCart,

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