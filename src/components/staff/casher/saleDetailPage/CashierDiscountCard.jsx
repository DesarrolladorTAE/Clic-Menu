// src/components/staff/casher/saleDetailPage/CashierDiscountCard.jsx
//Tarjetita de descuentos
import React, { useMemo, useState } from "react";
import {
  Box, Button, Card, CardContent, Chip, IconButton, MenuItem, Stack, TextField, Typography,
} from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SellRoundedIcon from "@mui/icons-material/SellRounded";
import PercentRoundedIcon from "@mui/icons-material/PercentRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

export default function CashierDiscountCard({
  sale,
  orderCheckId = null,
  itemsFlat = [],
  summary = null,
  globalForm,
  onGlobalFormChange,
  itemDiscountDrafts = [],
  onAddItemDiscountDraft,
  onRemoveItemDiscountDraft,
  onItemDiscountDraftChange,
  onApplyGlobal,
  onRemoveGlobal,
  onApplyItemDraft,
  onRemoveItem,
  busy = false,
  disabled = false,
}) {
  const [activeSection, setActiveSection] = useState("global");

  const globalDiscount = summary?.global_discount || null;
  const itemDiscounts = Array.isArray(summary?.item_discounts)
    ? summary.item_discounts
    : [];

  const hasGlobalDiscount = Boolean(globalDiscount);
  const hasItemDiscounts = itemDiscounts.length > 0;

  const promotionDiscountTotal = toNumber(
    summary?.sale?.promotion_discount_total ??
      sale?.promotion_discount_total,
    0
  );

  const currentOrderCheckId = normalizePositiveId(
    orderCheckId ??
      summary?.sale?.order_check_id ??
      sale?.order_check_id
  );

  const normalizedItems = useMemo(() => {
    return (Array.isArray(itemsFlat) ? itemsFlat : [])
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

        const parentOrderItemId = normalizePositiveId(
          item?.parent_order_item_id
        );

        const itemKind = String(item?.item_kind || "").trim();
        const isChild =
          parentOrderItemId !== null ||
          itemKind === "composite_child";

        const belongsToCurrentCheck =
          currentOrderCheckId === null ||
          itemOrderCheckId === null ||
          itemOrderCheckId === currentOrderCheckId;

        const qty = toNumber(item?.quantity ?? item?.qty, 1);
        const baseLineTotal = toNumber(item?.base_line_total, 0);
        const modifiersTotal = toNumber(item?.modifiers_total, 0);
        const promotionDiscountTotal = toNumber(
          item?.promotion_discount_total,
          0
        );
        const manualDiscountTotal = toNumber(
          item?.manual_discount_total,
          0
        );
        const cancellationTotal = toNumber(
          item?.cancellation_total,
          0
        );
        const netTotal = toNumber(
          item?.net_line_total ??
            item?.line_total ??
            item?.total,
          0
        );

        return {
          orderCheckItemId,
          orderItemId,
          orderCheckId: itemOrderCheckId,
          parentOrderItemId,
          qty,
          baseLineTotal,
          modifiersTotal,
          promotionDiscountTotal,
          manualDiscountTotal,
          cancellationTotal,
          netTotal,
          discountBaseAmount: resolveDiscountBaseAmount({
            baseLineTotal,
            modifiersTotal,
            promotionDiscountTotal,
            cancellationTotal,
          }),
          name: resolveItemName(item),
          itemKind,
          isChild,
          belongsToCurrentCheck,
          isCompositeParent: Boolean(item?.is_composite_parent),
        };
      })
      .filter(
        (row) =>
          row.orderItemId !== null &&
          row.belongsToCurrentCheck
      );
  }, [itemsFlat, currentOrderCheckId]);

  const itemsMap = useMemo(() => {
    const map = new Map();

    normalizedItems.forEach((item) => {
      map.set(Number(item.orderItemId), item);
    });

    return map;
  }, [normalizedItems]);

  const itemDiscountMap = useMemo(() => {
    const map = new Map();

    itemDiscounts.forEach((row) => {
      const orderItemId = normalizePositiveId(row?.order_item_id);

      if (orderItemId !== null) {
        map.set(orderItemId, row);
      }
    });

    return map;
  }, [itemDiscounts]);

  const selectedDraftItemIds = useMemo(() => {
    return itemDiscountDrafts
      .map((draft) => normalizePositiveId(draft?.orderItemId))
      .filter((id) => id !== null);
  }, [itemDiscountDrafts]);

  const selectableItems = useMemo(() => {
    return normalizedItems.filter((item) => {
      if (item.isChild) return false;
      if (!item.belongsToCurrentCheck) return false;
      if (item.discountBaseAmount <= 0) return false;

      return !itemDiscountMap.has(Number(item.orderItemId));
    });
  }, [normalizedItems, itemDiscountMap]);

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
              Descuentos manuales
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 14,
                color: "text.secondary",
                lineHeight: 1.5,
              }}
            >
              Puedes aplicar un descuento manual a toda la cuenta o a productos
              específicos, pero no ambos al mismo tiempo.
            </Typography>
          </Box>

          {promotionDiscountTotal > 0 ? (
            <HelperBox>
              Esta cuenta ya tiene{" "}
              <strong>{formatCurrency(promotionDiscountTotal)}</strong>{" "}
              en promociones aplicadas. Los descuentos manuales se aplican de
              forma adicional.
            </HelperBox>
          ) : null}

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.25}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              p: 1,
              backgroundColor: "#FCFCFC",
            }}
          >
            <SectionButton
              active={activeSection === "global"}
              icon={<SellRoundedIcon fontSize="small" />}
              label="Descuento manual total"
              helper={
                hasGlobalDiscount
                  ? `Activo: ${formatCurrency(globalDiscount?.amount_applied || 0)}`
                  : "Aplicar a toda la cuenta"
              }
              onClick={() => setActiveSection("global")}
            />

            <SectionButton
              active={activeSection === "item"}
              icon={<PercentRoundedIcon fontSize="small" />}
              label="Descuento manual por ítem"
              helper={
                hasItemDiscounts
                  ? `${itemDiscounts.length} aplicado(s)`
                  : "Aplicar a productos"
              }
              onClick={() => setActiveSection("item")}
            />
          </Stack>

          {activeSection === "global" ? (
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
                <Stack direction="row" spacing={1} alignItems="center">
                  <SellRoundedIcon color="primary" />

                  <Typography sx={{ fontSize: 18, fontWeight: 800 }}>
                    Descuento manual total
                  </Typography>
                </Stack>

                {hasGlobalDiscount ? (
                  <Box
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      backgroundColor: "#fff",
                      p: 1.5,
                    }}
                  >
                    <Stack spacing={1}>
                      <InfoRow
                        label="Tipo"
                        value={
                          globalDiscount.type === "percent"
                            ? "Porcentaje"
                            : "Monto fijo"
                        }
                      />

                      <InfoRow
                        label="Valor"
                        value={String(globalDiscount.value)}
                      />

                      <InfoRow
                        label="Aplicado"
                        value={formatCurrency(globalDiscount.amount_applied)}
                      />

                      <Button
                        variant="outlined"
                        color="error"
                        onClick={onRemoveGlobal}
                        disabled={busy || disabled}
                        startIcon={<DeleteOutlineRoundedIcon />}
                        sx={{
                          mt: 1,
                          height: 42,
                          borderRadius: 2,
                          fontWeight: 800,
                        }}
                      >
                        Quitar descuento total
                      </Button>
                    </Stack>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                      <FieldBlock
                        label="Tipo *"
                        input={
                          <TextField
                            select
                            fullWidth
                            value={globalForm?.type || "fixed"}
                            onChange={(event) =>
                              onGlobalFormChange?.("type", event.target.value)
                            }
                            disabled={busy || disabled || hasItemDiscounts}
                          >
                            <MenuItem value="fixed">Monto fijo</MenuItem>
                            <MenuItem value="percent">Porcentaje</MenuItem>
                          </TextField>
                        }
                      />

                      <FieldBlock
                        label={`Valor ${
                          globalForm?.type === "percent" ? "(%)" : "($)"
                        } *`}
                        input={
                          <TextField
                            fullWidth
                            value={globalForm?.value || ""}
                            onChange={(event) =>
                              onGlobalFormChange?.("value", event.target.value)
                            }
                            inputProps={{ inputMode: "decimal" }}
                            placeholder="0.00"
                            disabled={busy || disabled || hasItemDiscounts}
                          />
                        }
                      />
                    </Stack>

                    <FieldBlock
                      label="Motivo"
                      input={
                        <TextField
                          fullWidth
                          value={globalForm?.reason || ""}
                          onChange={(event) =>
                            onGlobalFormChange?.("reason", event.target.value)
                          }
                          placeholder="Opcional"
                          disabled={busy || disabled || hasItemDiscounts}
                        />
                      }
                    />

                    <Button
                      variant="contained"
                      onClick={onApplyGlobal}
                      disabled={busy || disabled || hasItemDiscounts}
                      startIcon={<PercentRoundedIcon />}
                      sx={{
                        alignSelf: "flex-end",
                        minWidth: { xs: "100%", sm: 220 },
                        height: 42,
                        borderRadius: 2,
                        fontWeight: 800,
                      }}
                    >
                      Aplicar descuento total
                    </Button>

                    {hasItemDiscounts ? (
                      <HelperBox>
                        Ya existen descuentos por producto en esta cuenta. Quita
                        esos descuentos antes de aplicar uno global.
                      </HelperBox>
                    ) : null}
                  </Stack>
                )}
              </Stack>
            </Box>
          ) : null}

          {activeSection === "item" ? (
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
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.25}
                  justifyContent="space-between"
                  alignItems={{ xs: "stretch", sm: "center" }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PercentRoundedIcon color="primary" />

                    <Typography sx={{ fontSize: 18, fontWeight: 800 }}>
                      Descuento manual por ítem
                    </Typography>
                  </Stack>

                  <Button
                    variant="outlined"
                    onClick={onAddItemDiscountDraft}
                    disabled={
                      busy ||
                      disabled ||
                      hasGlobalDiscount ||
                      selectableItems.length === 0
                    }
                    startIcon={<AddRoundedIcon />}
                    sx={{
                      minWidth: { xs: "100%", sm: 200 },
                      height: 40,
                      borderRadius: 2,
                      fontWeight: 800,
                    }}
                  >
                    Nuevo descuento ítem
                  </Button>
                </Stack>

                {hasGlobalDiscount ? (
                  <HelperBox>
                    Ya existe un descuento global. Quita el descuento total
                    antes de aplicar descuentos por ítem.
                  </HelperBox>
                ) : null}

                {!hasGlobalDiscount &&
                itemDiscounts.length === 0 &&
                itemDiscountDrafts.length === 0 ? (
                  <HelperBox>
                    No hay descuentos por ítem capturados. Usa el botón{" "}
                    <strong>Nuevo descuento ítem</strong> para agregar uno.
                  </HelperBox>
                ) : null}

                {itemDiscounts.length > 0 ? (
                  <Stack spacing={1.25}>
                    {itemDiscounts.map((discount) => {
                      const orderItemId = normalizePositiveId(
                        discount?.order_item_id
                      );

                      const item =
                        orderItemId !== null
                          ? itemsMap.get(orderItemId)
                          : null;

                      const backendBase = toNumber(
                        discount?.base_amount ??
                          discount?.item_base_amount,
                        0
                      );

                      const discountBaseAmount =
                        backendBase > 0
                          ? backendBase
                          : item?.discountBaseAmount ?? 0;

                      return (
                        <Box
                          key={
                            discount?.id ||
                            `discount-${orderItemId || "unknown"}`
                          }
                          sx={{
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1,
                            backgroundColor: "#fff",
                            p: 1.5,
                          }}
                        >
                          <Stack
                            direction={{ xs: "column", md: "row" }}
                            justifyContent="space-between"
                            spacing={1.25}
                          >
                            <Box sx={{ minWidth: 0 }}>
                              <Typography
                                sx={{
                                  fontSize: 15,
                                  fontWeight: 800,
                                  color: "text.primary",
                                  wordBreak: "break-word",
                                }}
                              >
                                {item
                                  ? `${formatQuantity(item.qty)} × ${item.name}`
                                  : `Ítem #${orderItemId || "—"}`}
                              </Typography>

                              <Typography
                                sx={{
                                  mt: 0.35,
                                  fontSize: 13,
                                  color: "text.secondary",
                                }}
                              >
                                Base para descuento manual:{" "}
                                {formatCurrency(discountBaseAmount)}
                              </Typography>

                              <Typography
                                sx={{
                                  mt: 0.35,
                                  fontSize: 13,
                                  color: "text.secondary",
                                }}
                              >
                                Tipo:{" "}
                                {discount.type === "percent"
                                  ? "Porcentaje"
                                  : "Monto fijo"}{" "}
                                · Valor: {discount.value}
                              </Typography>
                            </Box>

                            <Stack
                              direction={{ xs: "column", sm: "row" }}
                              spacing={1}
                              alignItems={{ xs: "stretch", sm: "center" }}
                            >
                              <Box
                                sx={{
                                  borderRadius: 1,
                                  px: 1.25,
                                  py: 0.85,
                                  bgcolor: "rgba(255, 152, 0, 0.08)",
                                  alignSelf: { xs: "flex-start", sm: "center" },
                                }}
                              >
                                <Typography
                                  sx={{ fontSize: 13, fontWeight: 800 }}
                                >
                                  Aplicado:{" "}
                                  {formatCurrency(discount.amount_applied)}
                                </Typography>
                              </Box>

                              <Button
                                variant="outlined"
                                color="error"
                                onClick={() =>
                                  orderItemId !== null
                                    ? onRemoveItem?.(orderItemId)
                                    : undefined
                                }
                                disabled={
                                  busy ||
                                  disabled ||
                                  orderItemId === null
                                }
                                startIcon={<DeleteOutlineRoundedIcon />}
                                sx={{
                                  minWidth: { xs: "100%", sm: 180 },
                                  height: 40,
                                  borderRadius: 2,
                                  fontWeight: 800,
                                }}
                              >
                                Quitar descuento
                              </Button>
                            </Stack>
                          </Stack>
                        </Box>
                      );
                    })}
                  </Stack>
                ) : null}

                {itemDiscountDrafts.length > 0 ? (
                  <Stack spacing={1.25}>
                    {itemDiscountDrafts.map((draft, index) => {
                      const selectedOrderItemId = normalizePositiveId(
                        draft?.orderItemId
                      );

                      const selectedItem =
                        selectedOrderItemId !== null
                          ? itemsMap.get(selectedOrderItemId) || null
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
                              direction={{ xs: "column", sm: "row" }}
                              justifyContent="space-between"
                              spacing={1}
                              alignItems={{ xs: "stretch", sm: "center" }}
                            >
                              <Typography
                                sx={{
                                  fontSize: 15,
                                  fontWeight: 800,
                                  color: "text.primary",
                                }}
                              >
                                Nuevo descuento ítem {index + 1}
                              </Typography>

                              <IconButton
                                onClick={() =>
                                  onRemoveItemDiscountDraft?.(draft.localId)
                                }
                                disabled={busy || disabled}
                                sx={{
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
                                }}
                              >
                                <DeleteOutlineRoundedIcon fontSize="small" />
                              </IconButton>
                            </Stack>

                            <FieldBlock
                              label="Ítem *"
                              input={
                                <TextField
                                  select
                                  fullWidth
                                  value={draft.orderItemId || ""}
                                  onChange={(event) =>
                                    onItemDiscountDraftChange?.(
                                      draft.localId,
                                      "orderItemId",
                                      event.target.value
                                    )
                                  }
                                  disabled={
                                    busy || disabled || hasGlobalDiscount
                                  }
                                >
                                  <MenuItem value="">
                                    Selecciona un ítem
                                  </MenuItem>

                                  {selectableItems.map((item) => {
                                    const isUsedByOtherDraft =
                                      selectedDraftItemIds.includes(
                                        Number(item.orderItemId)
                                      ) &&
                                      Number(draft.orderItemId || 0) !==
                                        Number(item.orderItemId);

                                    return (
                                      <MenuItem
                                        key={
                                          item.orderCheckItemId ||
                                          item.orderItemId
                                        }
                                        value={String(item.orderItemId)}
                                        disabled={isUsedByOtherDraft}
                                      >
                                        {formatQuantity(item.qty)} × {item.name}
                                      </MenuItem>
                                    );
                                  })}
                                </TextField>
                              }
                            />

                            {selectedItem ? (
                              <Box
                                sx={{
                                  borderRadius: 1,
                                  px: 1.25,
                                  py: 1,
                                  bgcolor: "rgba(255, 152, 0, 0.06)",
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: "text.primary",
                                  }}
                                >
                                  Base disponible para descuento manual:{" "}
                                  {formatCurrency(
                                    selectedItem.discountBaseAmount
                                  )}
                                </Typography>
                              </Box>
                            ) : null}

                            <Stack
                              direction={{ xs: "column", md: "row" }}
                              spacing={2}
                            >
                              <FieldBlock
                                label="Tipo *"
                                input={
                                  <TextField
                                    select
                                    fullWidth
                                    value={draft.type || "fixed"}
                                    onChange={(event) =>
                                      onItemDiscountDraftChange?.(
                                        draft.localId,
                                        "type",
                                        event.target.value
                                      )
                                    }
                                    disabled={
                                      busy || disabled || hasGlobalDiscount
                                    }
                                  >
                                    <MenuItem value="fixed">Monto fijo</MenuItem>
                                    <MenuItem value="percent">
                                      Porcentaje
                                    </MenuItem>
                                  </TextField>
                                }
                              />

                              <FieldBlock
                                label={`Valor ${
                                  draft.type === "percent" ? "(%)" : "($)"
                                } *`}
                                input={
                                  <TextField
                                    fullWidth
                                    value={draft.value || ""}
                                    onChange={(event) =>
                                      onItemDiscountDraftChange?.(
                                        draft.localId,
                                        "value",
                                        event.target.value
                                      )
                                    }
                                    inputProps={{ inputMode: "decimal" }}
                                    placeholder="0.00"
                                    disabled={
                                      busy || disabled || hasGlobalDiscount
                                    }
                                  />
                                }
                              />
                            </Stack>

                            <FieldBlock
                              label="Motivo"
                              input={
                                <TextField
                                  fullWidth
                                  value={draft.reason || ""}
                                  onChange={(event) =>
                                    onItemDiscountDraftChange?.(
                                      draft.localId,
                                      "reason",
                                      event.target.value
                                    )
                                  }
                                  placeholder="Opcional"
                                  disabled={
                                    busy || disabled || hasGlobalDiscount
                                  }
                                />
                              }
                            />

                            <Stack
                              direction={{ xs: "column", sm: "row" }}
                              spacing={1.25}
                              justifyContent="flex-end"
                            >
                              <Button
                                variant="contained"
                                onClick={() =>
                                  onApplyItemDraft?.(draft.localId)
                                }
                                disabled={
                                  busy ||
                                  disabled ||
                                  hasGlobalDiscount ||
                                  selectedOrderItemId === null
                                }
                                sx={{
                                  minWidth: { xs: "100%", sm: 220 },
                                  height: 40,
                                  borderRadius: 2,
                                  fontWeight: 800,
                                }}
                              >
                                Aplicar descuento
                              </Button>
                            </Stack>
                          </Stack>
                        </Box>
                      );
                    })}
                  </Stack>
                ) : null}

                {!hasGlobalDiscount &&
                selectableItems.length === 0 &&
                itemDiscounts.length === 0 ? (
                  <HelperBox>
                    No se encontraron productos disponibles para descuento en
                    esta cuenta.
                  </HelperBox>
                ) : null}
              </Stack>
            </Box>
          ) : null}

          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              backgroundColor: "#FCFCFC",
              p: 1.5,
            }}
          >
            <Stack spacing={0.75}>
              <InfoRow
                label="Subtotal bruto"
                value={formatCurrency(
                  summary?.sale?.subtotal ??
                    sale?.subtotal ??
                    0
                )}
              />

              <InfoRow
                label="Promociones automáticas"
                value={formatDiscountCurrency(
                  summary?.sale?.promotion_discount_total ??
                    sale?.promotion_discount_total ??
                    0
                )}
              />

              <InfoRow
                label="Descuentos manuales"
                value={formatDiscountCurrency(
                  summary?.sale?.manual_discount_total ??
                    sale?.manual_discount_total ??
                    0
                )}
              />

              <InfoRow
                label="Descuento total"
                value={formatDiscountCurrency(
                  summary?.sale?.discount_total ??
                    sale?.discount_total ??
                    0
                )}
              />

              <InfoRow
                label="Neto antes de propina"
                value={formatCurrency(
                  summary?.sale?.net_total ??
                    sale?.net_total ??
                    0
                )}
              />

              <InfoRow
                label="Propina"
                value={formatCurrency(
                  summary?.sale?.tip ??
                    sale?.tip ??
                    0
                )}
              />

              <InfoRow
                label="Total actual"
                value={formatCurrency(
                  summary?.sale?.payable_total ??
                    sale?.payable_total ??
                    summary?.sale?.total ??
                    sale?.total ??
                    0
                )}
              />
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function SectionButton({ active, icon, label, helper, onClick }) {
  return (
    <Button
      fullWidth
      onClick={onClick}
      variant={active ? "contained" : "outlined"}
      startIcon={icon}
      sx={{
        minHeight: 58,
        borderRadius: 2,
        justifyContent: "flex-start",
        textAlign: "left",
        fontWeight: 800,
        bgcolor: active ? "#FF9800" : "#fff",
        borderColor: active ? "#FF9800" : "divider",
        color: active ? "#fff" : "text.primary",
        "&:hover": {
          bgcolor: active ? "#F08C00" : "rgba(255, 152, 0, 0.06)",
          borderColor: "#FF9800",
        },
        "& .MuiButton-startIcon": {
          color: active ? "#fff" : "#FF9800",
        },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 900,
            lineHeight: 1.2,
            color: "inherit",
          }}
        >
          {label}
        </Typography>

        <Typography
          sx={{
            mt: 0.35,
            fontSize: 12,
            fontWeight: 700,
            lineHeight: 1.25,
            color: active ? "rgba(255,255,255,0.86)" : "text.secondary",
          }}
        >
          {helper}
        </Typography>
      </Box>
    </Button>
  );
}

function FieldBlock({ label, input }) {
  return (
    <Box sx={{ flex: 1, width: "100%" }}>
      <Typography sx={fieldLabelSx}>{label}</Typography>
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
    <Stack direction="row" justifyContent="space-between" spacing={1}>
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

function resolveDiscountBaseAmount({
  baseLineTotal,
  modifiersTotal,
  promotionDiscountTotal,
  cancellationTotal,
}) {
  return Math.max(
    toNumber(baseLineTotal, 0) +
      toNumber(modifiersTotal, 0) -
      toNumber(promotionDiscountTotal, 0) -
      toNumber(cancellationTotal, 0),
    0
  );
}

function resolveItemName(item) {
  const displayName =
    typeof item?.display_name === "string"
      ? item.display_name.trim()
      : "";

  const productName =
    typeof item?.product_name === "string"
      ? item.product_name.trim()
      : "";

  const variantName =
    typeof item?.variant_name === "string"
      ? item.variant_name.trim()
      : "";

  const snapshotName =
    typeof item?.name_snapshot === "string"
      ? item.name_snapshot.trim()
      : "";

  if (displayName) return displayName;
  if (productName && variantName) {
    return `${productName} · ${variantName}`;
  }
  if (productName) return productName;
  if (variantName) return variantName;
  if (snapshotName) return snapshotName;

  return "Producto";
}

function normalizePositiveId(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const normalized = Number(value);

  return Number.isInteger(normalized) && normalized > 0
    ? normalized
    : null;
}

function toNumber(value, fallback = 0) {
  const normalized = Number(value);

  return Number.isFinite(normalized)
    ? normalized
    : fallback;
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

function formatDiscountCurrency(value) {
  const amount = Math.abs(toNumber(value, 0));

  if (amount <= 0) {
    return formatCurrency(0);
  }

  return `-${formatCurrency(amount)}`;
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

const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
  mb: 1,
};
