import React, { useMemo } from "react";
import { useTheme } from "@mui/material/styles";
import { Badge, PillButton } from "../../../../pages/public/publicMenu.ui";

import MenuCartPanelStyles from "../cartPanel/MenuCartPanelStyles";

/*
 * Selector compartido de partidas persistidas para cancelación.
 *
 * Qué usa:
 * - effective_quantity entregado por el Backend como cantidad cancelable actual.
 * - OrderItems raíz; los componentes estructurales nunca se seleccionan por separado.
 * - publicMenu.ui.jsx para reutilizar Badge y PillButton del diseño actual.
 * - MenuCartPanelStyles para conservar el mismo lenguaje visual del carrito,
 *   incluso cuando MenuCartPanel no está montado.
 *
 * Qué archivos lo usan:
 * - src/components/menu/shared/MenuCartPanel.jsx.
 * - Los flujos de Mesero y Cliente QR lo controlarán mediante el contrato `cancellation`.
 *
 * No ejecuta requests, no autoriza cancelaciones, no decide reutilización física
 * y no interpreta inventario. Solo normaliza la selección y determina partial/full.
 */

function toPositiveInt(value) {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    return null;
  }

  return Math.trunc(number);
}

function getOrderItemId(item) {
  return toPositiveInt(item?.order_item_id ?? item?.id);
}

function getEffectiveQuantity(item) {
  const quantity = Number(
    item?.effective_quantity ??
      item?.quantity ??
      0,
  );

  if (!Number.isFinite(quantity)) {
    return 0;
  }

  return Math.max(0, Math.floor(quantity));
}

function isRootOrderItem(item) {
  return (
    item?.parent_order_item_id === null ||
    item?.parent_order_item_id === undefined ||
    item?.parent_order_item_id === ""
  );
}

function getItemLabel(item) {
  const displayName = String(
    item?.display_name || "",
  ).trim();

  if (displayName) {
    return displayName;
  }

  const productName = String(
    item?.product_name || "",
  ).trim();

  const variantName = String(
    item?.variant_name || "",
  ).trim();

  if (productName && variantName) {
    return `${productName} · ${variantName}`;
  }

  if (productName) {
    return productName;
  }

  const productId = toPositiveInt(item?.product_id);

  return productId
    ? `Producto #${productId}`
    : "Producto";
}

function normalizeSelectedQuantity(value) {
  if (value === true) {
    return 1;
  }

  if (value && typeof value === "object") {
    return normalizeSelectedQuantity(value.quantity);
  }

  const quantity = Number(value);

  if (!Number.isFinite(quantity)) {
    return 0;
  }

  return Math.max(0, Math.floor(quantity));
}

function getSelectedQuantity(selection, orderItemId) {
  if (!orderItemId) {
    return 0;
  }

  if (selection instanceof Map) {
    return normalizeSelectedQuantity(
      selection.get(orderItemId),
    );
  }

  if (Array.isArray(selection)) {
    const row = selection.find((item) => {
      return Number(
        item?.order_item_id ??
          item?.id ??
          0,
      ) === orderItemId;
    });

    return normalizeSelectedQuantity(
      row?.quantity ??
        row?.selected_quantity,
    );
  }

  if (
    selection &&
    typeof selection === "object"
  ) {
    return normalizeSelectedQuantity(
      selection[orderItemId] ??
        selection[String(orderItemId)],
    );
  }

  return 0;
}

/**
 * Devuelve únicamente OrderItems raíz con cantidad efectiva mayor a cero.
 *
 * Se exporta para que MenuCartPanel no vuelva a duplicar esta regla.
 */
export function getOrderCancellationSelectableItems(items) {
  const rows = Array.isArray(items)
    ? items
    : [];

  return rows.filter((item) => {
    return (
      item &&
      typeof item === "object" &&
      isRootOrderItem(item) &&
      getOrderItemId(item) &&
      getEffectiveQuantity(item) > 0
    );
  });
}

/**
 * Construye el estado comercial de la selección.
 *
 * Vacío:
 * type = null
 *
 * Menos del total efectivo:
 * type = partial
 *
 * Exactamente todo el total efectivo:
 * type = full
 */
export function buildOrderCancellationSelectionPayload(
  items,
  selection,
) {
  const selectableItems =
    getOrderCancellationSelectableItems(items);

  const totalEffectiveQuantity =
    selectableItems.reduce((total, item) => {
      return total + getEffectiveQuantity(item);
    }, 0);

  const selectedItems =
    selectableItems.reduce((result, item) => {
      const orderItemId =
        getOrderItemId(item);

      const maxQuantity =
        getEffectiveQuantity(item);

      const requestedQuantity =
        getSelectedQuantity(
          selection,
          orderItemId,
        );

      const quantity = Math.min(
        maxQuantity,
        requestedQuantity,
      );

      if (
        orderItemId &&
        quantity > 0
      ) {
        result.push({
          order_item_id: orderItemId,
          quantity,
        });
      }

      return result;
    }, []);

  const selectedQuantity =
    selectedItems.reduce((total, item) => {
      return total + item.quantity;
    }, 0);

  const type =
    selectedQuantity <= 0
      ? null
      : selectedQuantity === totalEffectiveQuantity
        ? "full"
        : "partial";

  return {
    type,
    items: selectedItems,
    selected_quantity: selectedQuantity,
    total_effective_quantity: totalEffectiveQuantity,
    selected_items_count: selectedItems.length,
    is_full: type === "full",
    is_partial: type === "partial",
    can_continue: selectedQuantity > 0,
  };
}

function CancellationQuantityControl({
  item,
  quantity,
  maxQuantity,
  disabled = false,
  onQuantityChange,
}) {
  const handleQuantityChange = (nextQuantity) => {
    const normalized = Math.max(
      1,
      Math.min(
        maxQuantity,
        nextQuantity,
      ),
    );

    onQuantityChange?.(
      item,
      normalized,
    );
  };

  return (
    <div className="cm-cancellation-quantity-block">
      <span className="cm-cancellation-quantity-label">
        Cantidad a cancelar
      </span>

      <div className="cm-qty cm-cancellation-qty">
        <button
          type="button"
          className="cm-qty-btn cm-cancellation-qty-btn"
          disabled={
            disabled ||
            quantity <= 1
          }
          onClick={() =>
            handleQuantityChange(
              quantity - 1,
            )
          }
          title="Menos"
        >
          −
        </button>

        <span
          className="cm-qty-input cm-cancellation-qty-value"
          aria-label={`Cantidad seleccionada: ${quantity}`}
        >
          {quantity}
        </span>

        <button
          type="button"
          className="cm-qty-btn cm-cancellation-qty-btn"
          disabled={
            disabled ||
            quantity >= maxQuantity
          }
          onClick={() =>
            handleQuantityChange(
              quantity + 1,
            )
          }
          title={
            quantity >= maxQuantity
              ? "Se alcanzó la cantidad disponible"
              : "Más"
          }
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function OrderCancellationSelection({
  items = [],
  selection = {},
  themeColor = "",
  disabled = false,
  onExit,
  onToggleItem,
  onQuantityChange,
  onContinue,
}) {
  const theme = useTheme();

  const selectableItems = useMemo(() => {
    return getOrderCancellationSelectableItems(
      items,
    );
  }, [items]);

  const summary = useMemo(() => {
    return buildOrderCancellationSelectionPayload(
      selectableItems,
      selection,
    );
  }, [
    selectableItems,
    selection,
  ]);

  const accentColor =
    String(themeColor || "").trim() ||
    theme.palette.primary.main;

  const handleContinue = () => {
    if (
      disabled ||
      !summary.can_continue
    ) {
      return;
    }

    onContinue?.(summary);
  };

  return (
    <>
      <MenuCartPanelStyles />

      <div
        className="cm-section cm-cancellation-section"
        style={{
          "--cm-cancellation-accent": accentColor,
        }}
      >
        <div className="cm-cancellation-card">
          <div className="cm-cancellation-header">
            <div className="cm-cancellation-header-copy">
              <div className="cm-section-title cm-cancellation-title">
                Items ya enviados
              </div>

              <div className="cm-cancellation-help">
                Selecciona los productos que deseas cancelar.
              </div>
            </div>

            <Badge tone="dark">
              {summary.selected_items_count}/
              {selectableItems.length}
            </Badge>
          </div>

          {selectableItems.length > 0 ? (
            <div className="cm-cancellation-list">
              {selectableItems.map((item) => {
                const orderItemId =
                  getOrderItemId(item);

                const maxQuantity =
                  getEffectiveQuantity(item);

                const rawSelectedQuantity =
                  getSelectedQuantity(
                    selection,
                    orderItemId,
                  );

                const selected =
                  rawSelectedQuantity > 0;

                const selectedQuantity =
                  selected
                    ? Math.max(
                        1,
                        Math.min(
                          maxQuantity,
                          rawSelectedQuantity,
                        ),
                      )
                    : 0;

                const label =
                  getItemLabel(item);

                const availabilityLabel =
                  maxQuantity === 1
                    ? "Disponible: 1"
                    : `Disponibles: ${maxQuantity}`;

                return (
                  <div
                    key={`cancel-order-item-${orderItemId}`}
                    className={[
                      "cm-cancellation-item",
                      selected
                        ? "cm-cancellation-item-selected"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <div className="cm-cancellation-item-layout">
                      <label
                        className="cm-cancellation-item-main"
                        style={{
                          cursor: disabled
                            ? "default"
                            : "pointer",
                        }}
                      >
                        <span className="cm-cancellation-checkbox-wrap">
                          <input
                            type="checkbox"
                            className="cm-cancellation-checkbox"
                            checked={selected}
                            disabled={disabled}
                            onChange={() =>
                              onToggleItem?.(
                                item,
                                !selected,
                              )
                            }
                            style={{
                              accentColor,
                              cursor: disabled
                                ? "default"
                                : "pointer",
                            }}
                          />
                        </span>

                        <span className="cm-cancellation-item-copy">
                          <span className="cm-cancellation-item-name">
                            {label}
                          </span>

                          <span className="cm-cancellation-item-availability">
                            {availabilityLabel}
                          </span>
                        </span>
                      </label>

                      {selected &&
                      maxQuantity > 1 ? (
                        <CancellationQuantityControl
                          item={item}
                          quantity={
                            selectedQuantity
                          }
                          maxQuantity={
                            maxQuantity
                          }
                          disabled={disabled}
                          onQuantityChange={
                            onQuantityChange
                          }
                        />
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="cm-empty-history">
              No hay productos disponibles para cancelar.
            </div>
          )}

          <div className="cm-cancellation-actions">
            <PillButton
              tone="terracottaSoft"
              disabled={disabled}
              onClick={() => onExit?.()}
              title="Regresar al carrito"
            >
              Regresar
            </PillButton>

            <PillButton
              tone="terracotta"
              disabled={
                disabled ||
                !summary.can_continue
              }
              onClick={handleContinue}
              title={
                summary.can_continue
                  ? "Continuar con la cancelación"
                  : "Selecciona al menos un producto"
              }
            >
              Continuar
            </PillButton>
          </div>
        </div>
      </div>
    </>
  );
}