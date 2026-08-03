// src/components/staff/casher/saleDetailPage/CashierAdjustmentCard.jsx
//Tarjetita de ajustes y cancelaciones
import React, { useMemo, useState } from "react";
import {
  Box, Button, Card, CardContent, Chip, IconButton, MenuItem, Stack, TextField, Typography,
} from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import PlaylistRemoveRoundedIcon from "@mui/icons-material/PlaylistRemoveRounded";
import RemoveShoppingCartRoundedIcon from "@mui/icons-material/RemoveShoppingCartRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

export default function CashierAdjustmentCard({
  sale,
  orderCheckId = null,
  itemsFlat = [],
  orders = [],
  summary = null,
  partialForm,
  onPartialFormChange,
  partialDrafts = [],
  onAddPartialDraft,
  onRemovePartialDraft,
  onPartialDraftChange,
  onSubmitPartial,
  cancelOrderId = "",
  onCancelOrderIdChange,
  cancelOrderReason = "",
  onCancelOrderReasonChange,
  onSubmitCancelOrder,
  busy = false,
  disabled = false,
}) {
  const [activeMode, setActiveMode] = useState("partial");

  const currentOrderCheckId = normalizePositiveId(
    orderCheckId ??
      summary?.sale?.order_check_id ??
      sale?.order_check_id
  );

  const normalizedItems = useMemo(() => {
    const rows = Array.isArray(itemsFlat) ? itemsFlat : [];

    return rows
      .map((item) => {
        const hasFinancialIdentity =
          item?.order_check_item_id !== undefined ||
          item?.order_check_id !== undefined;

        const orderCheckItemId = normalizePositiveId(
          item?.order_check_item_id ??
            (hasFinancialIdentity ? item?.id : null)
        );

        const orderItemId = normalizePositiveId(
          item?.order_item_id ??
            (!hasFinancialIdentity ? item?.id : null)
        );

        const itemOrderCheckId = normalizePositiveId(
          item?.order_check_id
        );

        const sourceOrderId = normalizePositiveId(
          item?.source_order_id ??
            item?.order_id
        );

        const sourceTableId = normalizePositiveId(
          item?.source_table_id ??
            item?.table_id
        );

        const parentOrderItemId = normalizePositiveId(
          item?.parent_order_item_id
        );

        const itemKind = String(item?.item_kind || "").trim();

        const belongsToCurrentCheck =
          currentOrderCheckId === null ||
          itemOrderCheckId === null ||
          itemOrderCheckId === currentOrderCheckId;

        const quantity = Math.max(
          toNumber(item?.quantity ?? item?.qty, 0),
          0
        );

        const availableQty = quantity;

        /*
         * El request de cancelación acepta enteros.
         * La cantidad visual conserva hasta cuatro decimales,
         * pero solo se crean opciones enteras permitidas.
         */
        const cancellableQty = Math.max(
          Math.floor(availableQty + 0.000001),
          0
        );

        return {
          orderCheckItemId,
          orderItemId,
          orderCheckId: itemOrderCheckId,
          sourceOrderId,
          sourceTableId,
          parentOrderItemId,
          name: resolveItemName(item),
          quantity,
          availableQty,
          cancellableQty,
          unitPrice: toNumber(item?.unit_price, 0),
          baseLineTotal: toNumber(item?.base_line_total, 0),
          modifiersTotal: toNumber(item?.modifiers_total, 0),
          promotionDiscountTotal: toNumber(
            item?.promotion_discount_total,
            0
          ),
          manualDiscountTotal: toNumber(
            item?.manual_discount_total,
            0
          ),
          cancellationTotal: toNumber(
            item?.cancellation_total,
            0
          ),
          netLineTotal: toNumber(
            item?.net_line_total ??
              item?.line_total ??
              item?.total,
            0
          ),
          itemKind,
          isChild:
            parentOrderItemId !== null ||
            itemKind === "composite_child",
          isCompositeParent: Boolean(item?.is_composite_parent),
          belongsToCurrentCheck,
        };
      })
      .filter(
        (item) =>
          item.orderItemId !== null &&
          item.belongsToCurrentCheck
      );
  }, [itemsFlat, currentOrderCheckId]);

  const selectableItems = useMemo(() => {
    return normalizedItems.filter(
      (item) =>
        !item.isChild &&
        item.belongsToCurrentCheck &&
        item.cancellableQty > 0
    );
  }, [normalizedItems]);

  const selectableItemsMap = useMemo(() => {
    const map = new Map();

    selectableItems.forEach((item) => {
      map.set(Number(item.orderItemId), item);
    });

    return map;
  }, [selectableItems]);

  const selectedDraftItemIds = useMemo(() => {
    return partialDrafts
      .map((draft) => normalizePositiveId(draft?.orderItemId))
      .filter((id) => id !== null);
  }, [partialDrafts]);

  const normalizedOrders = useMemo(() => {
    const map = new Map();

    const registerOrder = (order) => {
      const orderId = normalizePositiveId(
        order?.id ??
          order?.order_id
      );

      if (orderId === null) return;

      const previous = map.get(orderId) || {};

      map.set(orderId, {
        ...previous,
        ...order,
        id: orderId,
        order_id: orderId,
        table_id: normalizePositiveId(
          order?.table_id ??
            order?.table?.id ??
            previous?.table_id
        ),
        table_name:
          cleanText(
            order?.table_name ??
              order?.table?.name
          ) ||
          previous?.table_name ||
          "",
        customer_name:
          cleanText(order?.customer_name) ||
          previous?.customer_name ||
          "",
      });
    };

    (Array.isArray(orders) ? orders : []).forEach(registerOrder);

    normalizedItems.forEach((item) => {
      if (item.sourceOrderId === null) return;

      registerOrder({
        id: item.sourceOrderId,
        table_id: item.sourceTableId,
      });
    });

    registerOrder({
      id: sale?.order_id ?? sale?.order?.id,
      table_id:
        sale?.order?.table_id ??
        sale?.table?.id,
      table_name:
        sale?.order?.table?.name ??
        sale?.table?.name,
      customer_name:
        sale?.order?.customer_name,
    });

    return Array.from(map.values()).sort(
      (a, b) => Number(a.id) - Number(b.id)
    );
  }, [orders, normalizedItems, sale]);

  const hasMultipleOrders = normalizedOrders.length > 1;

  const requestedCancelOrderId = normalizePositiveId(
    cancelOrderId
  );

  const selectedCancelOrder = hasMultipleOrders
    ? normalizedOrders.find(
        (order) =>
          Number(order.id) === Number(requestedCancelOrderId)
      ) || null
    : normalizedOrders[0] || null;

  const resolvedCancelOrderId =
    selectedCancelOrder?.id ??
    (!hasMultipleOrders
      ? normalizePositiveId(
          sale?.order_id ??
            sale?.order?.id
        )
      : null);

  const normalizedPartialDrafts = useMemo(() => {
    return partialDrafts.map((draft) => ({
      orderItemId: normalizePositiveId(draft?.orderItemId),
      quantity: normalizePositiveInteger(draft?.quantity),
    }));
  }, [partialDrafts]);

  const partialReason = cleanText(partialForm?.reason);

  const canSubmitPartial = useMemo(() => {
    if (!partialReason || normalizedPartialDrafts.length === 0) {
      return false;
    }

    const usedOrderItemIds = new Set();

    return normalizedPartialDrafts.every((draft) => {
      if (
        draft.orderItemId === null ||
        draft.quantity === null ||
        usedOrderItemIds.has(draft.orderItemId)
      ) {
        return false;
      }

      const item = selectableItemsMap.get(draft.orderItemId);

      if (
        !item ||
        draft.quantity < 1 ||
        draft.quantity > item.cancellableQty
      ) {
        return false;
      }

      usedOrderItemIds.add(draft.orderItemId);

      return true;
    });
  }, [
    normalizedPartialDrafts,
    partialReason,
    selectableItemsMap,
  ]);

  const canSubmitCancelOrder =
    cleanText(cancelOrderReason) !== "" &&
    (!hasMultipleOrders || resolvedCancelOrderId !== null);

  const cancelAmount = toNumber(
    summary?.adjustment_summary?.cancel_amount,
    0
  );

  const originalSubtotal = toNumber(
    summary?.adjustment_summary?.original_subtotal ??
      sale?.subtotal,
    0
  );

  const currentSubtotal = toNumber(
    summary?.adjustment_summary?.current_subtotal ??
      sale?.subtotal,
    0
  );

  const currentTotal = toNumber(
    summary?.adjustment_summary?.current_total ??
      sale?.total,
    0
  );

  const adjustments = Array.isArray(summary?.adjustments)
    ? summary.adjustments
    : [];

  const handleSubmitPartial = () => {
    if (!canSubmitPartial) return;

    onSubmitPartial?.({
      reason: partialReason,
      items: normalizedPartialDrafts.map((draft) => ({
        order_item_id: draft.orderItemId,
        quantity: draft.quantity,
      })),
    });
  };

  const handleSubmitCancelOrder = () => {
    if (!canSubmitCancelOrder) return;

    onSubmitCancelOrder?.({
      order_id: resolvedCancelOrderId,
      reason: cleanText(cancelOrderReason),
    });
  };

  return (
    <Card
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        boxShadow: "none",
        backgroundColor: "background.paper",
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2.5}>
          <Box>
            <Typography
              sx={{
                fontSize: 22,
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              Ajustes y cancelaciones
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 14,
                color: "text.secondary",
                lineHeight: 1.5,
              }}
            >
              Cancela productos asignados a esta cuenta o cancela una orden
              completa del paquete antes de iniciar el pago.
            </Typography>
          </Box>

          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              backgroundColor: "#FCFCFC",
              p: 1.5,
            }}
          >
            <Stack spacing={1}>
              <InfoRow
                label="Subtotal original"
                value={formatCurrency(originalSubtotal)}
              />

              <InfoRow
                label="Monto cancelado"
                value={formatCurrency(cancelAmount)}
              />

              <InfoRow
                label="Subtotal actual"
                value={formatCurrency(currentSubtotal)}
              />

              <InfoRow
                label="Total actual"
                value={formatCurrency(currentTotal)}
              />
            </Stack>
          </Box>

          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              backgroundColor: "#FCFCFC",
              p: 1.25,
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                },
                gap: 1.25,
              }}
            >
              <ModeButton
                active={activeMode === "partial"}
                icon={<PlaylistRemoveRoundedIcon />}
                title="Cancelación parcial"
                subtitle="Cancelar productos"
                onClick={() => setActiveMode("partial")}
              />

              <ModeButton
                active={activeMode === "total"}
                icon={<RemoveShoppingCartRoundedIcon />}
                title="Cancelación total"
                subtitle="Cancelar una orden"
                onClick={() => setActiveMode("total")}
                danger
              />
            </Box>
          </Box>

          {activeMode === "partial" ? (
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                backgroundColor: "#FCFCFC",
                p: 2,
              }}
            >
              <Stack spacing={1.75}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <PlaylistRemoveRoundedIcon color="warning" />

                  <Typography
                    sx={{
                      fontSize: 18,
                      fontWeight: 800,
                    }}
                  >
                    Cancelación parcial por ítems
                  </Typography>
                </Stack>

                <FieldBlock
                  label="Motivo *"
                  input={
                    <TextField
                      fullWidth
                      value={partialForm?.reason || ""}
                      onChange={(event) =>
                        onPartialFormChange?.(
                          "reason",
                          event.target.value
                        )
                      }
                      placeholder="Ej. Cliente ya no quiere una bebida"
                      disabled={busy || disabled}
                    />
                  }
                />

                {partialDrafts.length > 0 ? (
                  <Stack spacing={1.25}>
                    {partialDrafts.map((draft, index) => {
                      const selectedOrderItemId =
                        normalizePositiveId(
                          draft?.orderItemId
                        );

                      const selectedItem =
                        selectedOrderItemId !== null
                          ? selectableItemsMap.get(
                              selectedOrderItemId
                            ) || null
                          : null;

                      return (
                        <Box
                          key={draft.localId}
                          sx={{
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1,
                            backgroundColor: "#fff",
                            p: 1.5,
                          }}
                        >
                          <Stack spacing={1.25}>
                            <Stack
                              direction={{
                                xs: "column",
                                sm: "row",
                              }}
                              justifyContent="space-between"
                              alignItems={{
                                xs: "stretch",
                                sm: "center",
                              }}
                              spacing={1}
                            >
                              <Typography
                                sx={{
                                  fontSize: 15,
                                  fontWeight: 800,
                                  color: "text.primary",
                                }}
                              >
                                Ítem a cancelar {index + 1}
                              </Typography>

                              <IconButton
                                onClick={() =>
                                  onRemovePartialDraft?.(
                                    draft.localId
                                  )
                                }
                                disabled={busy || disabled}
                                sx={iconDeleteSx}
                              >
                                <DeleteOutlineRoundedIcon fontSize="small" />
                              </IconButton>
                            </Stack>

                            <Stack
                              direction={{
                                xs: "column",
                                md: "row",
                              }}
                              spacing={2}
                            >
                              <FieldBlock
                                label="Ítem *"
                                input={
                                  <TextField
                                    select
                                    fullWidth
                                    value={
                                      draft.orderItemId || ""
                                    }
                                    onChange={(event) =>
                                      onPartialDraftChange?.(
                                        draft.localId,
                                        "orderItemId",
                                        event.target.value
                                      )
                                    }
                                    disabled={busy || disabled}
                                  >
                                    <MenuItem value="">
                                      Selecciona un ítem
                                    </MenuItem>

                                    {selectableItems.map(
                                      (item) => {
                                        const usedByOtherDraft =
                                          selectedDraftItemIds.includes(
                                            Number(
                                              item.orderItemId
                                            )
                                          ) &&
                                          Number(
                                            draft.orderItemId ||
                                              0
                                          ) !==
                                            Number(
                                              item.orderItemId
                                            );

                                        return (
                                          <MenuItem
                                            key={
                                              item.orderCheckItemId ||
                                              item.orderItemId
                                            }
                                            value={String(
                                              item.orderItemId
                                            )}
                                            disabled={
                                              usedByOtherDraft
                                            }
                                          >
                                            {formatQuantity(
                                              item.availableQty
                                            )}{" "}
                                            × {item.name}
                                            {hasMultipleOrders &&
                                            item.sourceOrderId
                                              ? ` · Orden #${item.sourceOrderId}`
                                              : ""}
                                          </MenuItem>
                                        );
                                      }
                                    )}
                                  </TextField>
                                }
                              />

                              <FieldBlock
                                label="Cantidad *"
                                input={
                                  <TextField
                                    select
                                    fullWidth
                                    value={
                                      draft.quantity || ""
                                    }
                                    onChange={(event) =>
                                      onPartialDraftChange?.(
                                        draft.localId,
                                        "quantity",
                                        event.target.value
                                      )
                                    }
                                    disabled={
                                      busy ||
                                      disabled ||
                                      !selectedItem
                                    }
                                  >
                                    <MenuItem value="">
                                      Selecciona
                                    </MenuItem>

                                    {Array.from(
                                      {
                                        length:
                                          selectedItem?.cancellableQty ||
                                          0,
                                      },
                                      (_, itemIndex) =>
                                        itemIndex + 1
                                    ).map((quantity) => (
                                      <MenuItem
                                        key={quantity}
                                        value={String(quantity)}
                                      >
                                        {quantity}
                                      </MenuItem>
                                    ))}
                                  </TextField>
                                }
                              />
                            </Stack>

                            {selectedItem ? (
                              <Box
                                sx={{
                                  borderRadius: 1,
                                  px: 1.25,
                                  py: 1,
                                  bgcolor:
                                    "rgba(255, 152, 0, 0.06)",
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: "text.primary",
                                  }}
                                >
                                  Disponible en esta cuenta:{" "}
                                  {formatQuantity(
                                    selectedItem.availableQty
                                  )}{" "}
                                  · Precio unitario:{" "}
                                  {formatCurrency(
                                    selectedItem.unitPrice
                                  )}
                                </Typography>
                              </Box>
                            ) : null}
                          </Stack>
                        </Box>
                      );
                    })}
                  </Stack>
                ) : (
                  <HelperBox>
                    Agrega uno o más productos de esta cuenta. Si la
                    cancelación dejara la orden en cero, deberás utilizar
                    la cancelación total.
                  </HelperBox>
                )}

                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  spacing={1.25}
                  justifyContent="space-between"
                >
                  <Button
                    variant="outlined"
                    onClick={onAddPartialDraft}
                    disabled={
                      busy ||
                      disabled ||
                      selectableItems.length === 0
                    }
                    startIcon={<AddRoundedIcon />}
                    sx={{
                      minWidth: {
                        xs: "100%",
                        sm: 220,
                      },
                      height: 42,
                      borderRadius: 2,
                      fontWeight: 800,
                    }}
                  >
                    Agregar ítem a cancelar
                  </Button>

                  <Button
                    variant="contained"
                    color="warning"
                    onClick={handleSubmitPartial}
                    disabled={
                      busy ||
                      disabled ||
                      !canSubmitPartial
                    }
                    startIcon={
                      <PlaylistRemoveRoundedIcon />
                    }
                    sx={{
                      minWidth: {
                        xs: "100%",
                        sm: 240,
                      },
                      height: 42,
                      borderRadius: 2,
                      fontWeight: 800,
                    }}
                  >
                    Aplicar cancelación parcial
                  </Button>
                </Stack>

                {selectableItems.length === 0 ? (
                  <HelperBox>
                    No se encontraron productos principales con cantidad
                    disponible en esta cuenta.
                  </HelperBox>
                ) : null}
              </Stack>
            </Box>
          ) : (
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                backgroundColor: "#FCFCFC",
                p: 2,
              }}
            >
              <Stack spacing={1.5}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <RemoveShoppingCartRoundedIcon color="error" />

                  <Typography
                    sx={{
                      fontSize: 18,
                      fontWeight: 800,
                    }}
                  >
                    Cancelación total de una orden
                  </Typography>
                </Stack>

                {hasMultipleOrders ? (
                  <FieldBlock
                    label="Orden a cancelar *"
                    input={
                      <TextField
                        select
                        fullWidth
                        value={cancelOrderId || ""}
                        onChange={(event) =>
                          onCancelOrderIdChange?.(
                            event.target.value
                          )
                        }
                        disabled={busy || disabled}
                      >
                        <MenuItem value="">
                          Selecciona una orden
                        </MenuItem>

                        {normalizedOrders.map((order) => (
                          <MenuItem
                            key={order.id}
                            value={String(order.id)}
                          >
                            {resolveOrderLabel(order)}
                          </MenuItem>
                        ))}
                      </TextField>
                    }
                  />
                ) : selectedCancelOrder ? (
                  <Box
                    sx={{
                      borderRadius: 1,
                      px: 1.25,
                      py: 1,
                      bgcolor:
                        "rgba(255, 152, 0, 0.06)",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "text.primary",
                      }}
                    >
                      Orden seleccionada:{" "}
                      {resolveOrderLabel(
                        selectedCancelOrder
                      )}
                    </Typography>
                  </Box>
                ) : null}

                <FieldBlock
                  label="Motivo *"
                  input={
                    <TextField
                      fullWidth
                      value={cancelOrderReason || ""}
                      onChange={(event) =>
                        onCancelOrderReasonChange?.(
                          event.target.value
                        )
                      }
                      placeholder="Ej. Cliente decidió no consumir"
                      disabled={busy || disabled}
                    />
                  }
                />

                <Box
                  sx={{
                    border: "1px dashed",
                    borderColor: "divider",
                    borderRadius: 1,
                    p: 1.5,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="flex-start"
                  >
                    <WarningAmberRoundedIcon
                      sx={{
                        mt: 0.15,
                        color: "warning.main",
                        fontSize: 18,
                      }}
                    />

                    <Typography
                      sx={{
                        fontSize: 13,
                        color: "text.secondary",
                        lineHeight: 1.55,
                      }}
                    >
                      La cancelación afectará únicamente la orden
                      seleccionada. La mesa se liberará solo cuando no
                      existan otras órdenes activas relacionadas. La sesión
                      asociada a la orden cancelada se cerrará cuando
                      corresponda.
                    </Typography>
                  </Stack>
                </Box>

                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleSubmitCancelOrder}
                  disabled={
                    busy ||
                    disabled ||
                    !canSubmitCancelOrder
                  }
                  startIcon={
                    <RemoveShoppingCartRoundedIcon />
                  }
                  sx={{
                    alignSelf: "flex-end",
                    minWidth: {
                      xs: "100%",
                      sm: 260,
                    },
                    height: 42,
                    borderRadius: 2,
                    fontWeight: 800,
                  }}
                >
                  {hasMultipleOrders
                    ? "Cancelar orden seleccionada"
                    : "Cancelar orden completa"}
                </Button>
              </Stack>
            </Box>
          )}

          <Box>
            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 800,
                color: "text.primary",
                mb: 1.25,
              }}
            >
              Historial de ajustes
            </Typography>

            {adjustments.length > 0 ? (
              <Stack spacing={1.25}>
                {adjustments.map((adjustment) => {
                  const adjustmentItems = Array.isArray(
                    adjustment?.items
                  )
                    ? adjustment.items
                    : [];

                  return (
                    <Box
                      key={adjustment.id}
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        backgroundColor: "#fff",
                        p: 1.5,
                      }}
                    >
                      <Stack spacing={1}>
                        <Stack
                          direction={{
                            xs: "column",
                            sm: "row",
                          }}
                          justifyContent="space-between"
                          spacing={1}
                        >
                          <Box>
                            <Stack
                              direction="row"
                              spacing={1}
                              flexWrap="wrap"
                            >
                              <Chip
                                size="small"
                                label={
                                  adjustment.type ===
                                  "cancel_order"
                                    ? "Cancelación total"
                                    : "Cancelación parcial"
                                }
                              />

                              <Chip
                                size="small"
                                label={`Estado: ${
                                  adjustment.status ||
                                  "—"
                                }`}
                              />
                            </Stack>

                            <Typography
                              sx={{
                                mt: 1,
                                fontSize: 14,
                                fontWeight: 800,
                                color: "text.primary",
                              }}
                            >
                              {adjustment.reason ||
                                "Sin motivo"}
                            </Typography>

                            <Typography
                              sx={{
                                mt: 0.5,
                                fontSize: 12,
                                color: "text.secondary",
                              }}
                            >
                              {formatDate(
                                adjustment.created_at
                              )}
                            </Typography>
                          </Box>
                        </Stack>

                        {adjustmentItems.length > 0 ? (
                          <Stack spacing={0.5}>
                            {adjustmentItems.map(
                              (row) => {
                                const orderItemId =
                                  normalizePositiveId(
                                    row?.order_item_id
                                  );

                                const currentItem =
                                  orderItemId !== null
                                    ? normalizedItems.find(
                                        (item) =>
                                          Number(
                                            item.orderItemId
                                          ) ===
                                          Number(
                                            orderItemId
                                          )
                                      )
                                    : null;

                                const itemName =
                                  currentItem?.name ||
                                  resolveAdjustmentItemName(
                                    row
                                  );

                                return (
                                  <Typography
                                    key={row.id}
                                    sx={{
                                      fontSize: 13,
                                      color: "text.secondary",
                                      lineHeight: 1.5,
                                    }}
                                  >
                                    • {itemName} · Cantidad:{" "}
                                    {formatQuantity(
                                      row?.quantity
                                    )}{" "}
                                    · Monto:{" "}
                                    {formatCurrency(
                                      row?.amount
                                    )}
                                  </Typography>
                                );
                              }
                            )}
                          </Stack>
                        ) : null}
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            ) : (
              <HelperBox>
                No hay ajustes aplicados para esta cuenta.
              </HelperBox>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function ModeButton({
  active,
  icon,
  title,
  subtitle,
  onClick,
  danger = false,
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      variant="outlined"
      sx={{
        justifyContent: "flex-start",
        minHeight: 72,
        px: 2,
        py: 1.25,
        borderRadius: 2,
        textTransform: "none",
        borderColor: active
          ? danger
            ? "error.main"
            : "#FF9800"
          : "divider",
        bgcolor: active
          ? danger
            ? "error.main"
            : "#FF9800"
          : "#fff",
        color: active ? "#fff" : "text.primary",
        "&:hover": {
          borderColor: danger
            ? "error.dark"
            : "#F57C00",
          bgcolor: active
            ? danger
              ? "error.dark"
              : "#F57C00"
            : "rgba(255, 152, 0, 0.06)",
        },
      }}
    >
      <Stack
        direction="row"
        spacing={1.25}
        alignItems="center"
        sx={{ minWidth: 0 }}
      >
        <Box
          sx={{
            display: "grid",
            placeItems: "center",
            color: active
              ? "#fff"
              : danger
                ? "error.main"
                : "#FF9800",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>

        <Box
          sx={{
            minWidth: 0,
            textAlign: "left",
          }}
        >
          <Typography
            sx={{
              fontSize: 15,
              fontWeight: 900,
              lineHeight: 1.15,
              color: "inherit",
              wordBreak: "break-word",
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              mt: 0.25,
              fontSize: 13,
              fontWeight: 800,
              lineHeight: 1.2,
              color: active
                ? "rgba(255,255,255,0.92)"
                : "text.secondary",
              wordBreak: "break-word",
            }}
          >
            {subtitle}
          </Typography>
        </Box>
      </Stack>
    </Button>
  );
}

function FieldBlock({ label, input }) {
  return (
    <Box
      sx={{
        flex: 1,
        width: "100%",
      }}
    >
      <Typography sx={fieldLabelSx}>
        {label}
      </Typography>

      {input}
    </Box>
  );
}

function HelperBox({ children }) {
  return (
    <Box
      sx={{
        border: "1px dashed",
        borderColor: "divider",
        borderRadius: 1,
        p: 1.5,
      }}
    >
      <Typography
        sx={{
          fontSize: 13,
          color: "text.secondary",
          lineHeight: 1.55,
        }}
      >
        {children}
      </Typography>
    </Box>
  );
}

function InfoRow({ label, value }) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      spacing={1}
    >
      <Typography
        sx={{
          fontSize: 14,
          color: "text.secondary",
          fontWeight: 700,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: 14,
          color: "text.primary",
          fontWeight: 800,
          textAlign: "right",
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

function resolveOrderLabel(order) {
  const orderId = normalizePositiveId(
    order?.id ??
      order?.order_id
  );

  const tableName = cleanText(
    order?.table_name ??
      order?.table?.name
  );

  const customerName = cleanText(
    order?.customer_name
  );

  const parts = [
    orderId !== null
      ? `Orden #${orderId}`
      : "Orden",
  ];

  if (tableName) {
    parts.push(`Mesa ${tableName}`);
  }

  if (customerName) {
    parts.push(customerName);
  }

  return parts.join(" · ");
}

function resolveItemName(item) {
  const meta =
    item?.meta_json &&
    typeof item.meta_json === "object"
      ? item.meta_json
      : {};

  const displayName = cleanText(
    item?.display_name ??
      meta?.display_name
  );

  const productName = cleanText(
    item?.product_name ??
      meta?.product_name
  );

  const variantName = cleanText(
    item?.variant_name ??
      meta?.variant_name
  );

  const snapshotName = cleanText(
    item?.name_snapshot ??
      meta?.name_snapshot
  );

  if (displayName) return displayName;

  if (productName && variantName) {
    return `${productName} · ${variantName}`;
  }

  if (productName) return productName;
  if (variantName) return variantName;
  if (snapshotName) return snapshotName;

  return "Producto";
}

function resolveAdjustmentItemName(row) {
  const orderItem = row?.order_item || null;

  if (!orderItem) {
    return `Ítem #${row?.order_item_id || "—"}`;
  }

  return `Ítem #${orderItem.id}`;
}

function normalizePositiveId(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const normalized = Number(value);

  return Number.isInteger(normalized) &&
    normalized > 0
    ? normalized
    : null;
}

function normalizePositiveInteger(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const normalized = Number(value);

  return Number.isInteger(normalized) &&
    normalized > 0
    ? normalized
    : null;
}

function toNumber(value, fallback = 0) {
  const normalized = Number(value);

  return Number.isFinite(normalized)
    ? normalized
    : fallback;
}

function cleanText(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
}

function formatQuantity(value) {
  const quantity = toNumber(value, 0);

  return Number.isInteger(quantity)
    ? String(quantity)
    : quantity.toLocaleString("es-MX", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 4,
      });
}

function formatCurrency(value) {
  const safe = toNumber(value, 0);

  try {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    }).format(safe);
  } catch {
    return `$${safe.toFixed(2)}`;
  }
}

function formatDate(value) {
  if (!value) {
    return "Fecha no disponible";
  }

  try {
    return new Intl.DateTimeFormat("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return String(value);
  }
}

const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
  mb: 1,
};

const iconDeleteSx = {
  width: 40,
  height: 40,
  bgcolor: "error.main",
  color: "#fff",
  borderRadius: 1.5,
  "&:hover": {
    bgcolor: "error.dark",
  },
  "&.Mui-disabled": {
    bgcolor: "action.disabledBackground",
    color: "action.disabled",
  },
};

