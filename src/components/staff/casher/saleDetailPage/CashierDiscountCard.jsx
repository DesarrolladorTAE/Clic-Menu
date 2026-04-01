// Tarjetita Descuentos
import React, { useMemo } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SellRoundedIcon from "@mui/icons-material/SellRounded";
import PercentRoundedIcon from "@mui/icons-material/PercentRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

export default function CashierDiscountCard({
  sale,
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
  const globalDiscount = summary?.global_discount || null;
  const itemDiscounts = Array.isArray(summary?.item_discounts)
    ? summary.item_discounts
    : [];

  const hasGlobalDiscount = !!globalDiscount;
  const hasItemDiscounts = itemDiscounts.length > 0;

  const normalizedItems = useMemo(() => {
    return (Array.isArray(itemsFlat) ? itemsFlat : [])
      .map((item) => {
        const orderItemId = Number(item?.id ?? item?.order_item_id ?? 0);
        const qty = Number(item?.quantity ?? item?.qty ?? 1);
        const unitPrice = Number(item?.unit_price ?? item?.price ?? 0);
        const total = Number(
          item?.line_total ?? item?.total ?? qty * unitPrice
        );

        return {
          orderItemId,
          qty,
          total,
          name: resolveItemName(item),
          itemKind: item?.item_kind || (item?.parent_order_item_id ? "composite_child" : "order_item"),
          isCompositeParent: !!item?.is_composite_parent,
        };
      })
      .filter((row) => row.orderItemId > 0);
  }, [itemsFlat]);

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
      map.set(Number(row.order_item_id), row);
    });
    return map;
  }, [itemDiscounts]);

  const selectedDraftItemIds = useMemo(() => {
    return itemDiscountDrafts
      .map((draft) => Number(draft?.orderItemId || 0))
      .filter(Boolean);
  }, [itemDiscountDrafts]);

  const selectableItems = useMemo(() => {
    return normalizedItems.filter(
      (item) => !itemDiscountMap.has(Number(item.orderItemId))
    );
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
              Descuentos
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 14,
                color: "text.secondary",
                lineHeight: 1.5,
              }}
            >
              Puedes aplicar descuento total o por ítem, pero no ambos al mismo
              tiempo.
            </Typography>
          </Box>

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
                  Descuento total
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
                    <InfoRow label="Valor" value={String(globalDiscount.value)} />
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
                          onChange={(e) =>
                            onGlobalFormChange?.("type", e.target.value)
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
                          onChange={(e) =>
                            onGlobalFormChange?.("value", e.target.value)
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
                        onChange={(e) =>
                          onGlobalFormChange?.("reason", e.target.value)
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
                      Ya existen descuentos por ítem en esta venta. Quita esos
                      descuentos antes de aplicar uno global.
                    </HelperBox>
                  ) : null}
                </Stack>
              )}
            </Stack>
          </Box>

          <Divider />

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
                    Descuento por ítem
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
                  Ya existe un descuento global. Quita el descuento total antes
                  de aplicar descuentos por ítem.
                </HelperBox>
              ) : null}

              {!hasGlobalDiscount && itemDiscounts.length === 0 && itemDiscountDrafts.length === 0 ? (
                <HelperBox>
                  No hay descuentos por ítem capturados. Usa el botón{" "}
                  <strong>Nuevo descuento ítem</strong> para agregar uno.
                </HelperBox>
              ) : null}

              {itemDiscounts.length > 0 ? (
                <Stack spacing={1.25}>
                  {itemDiscounts.map((discount) => {
                    const item = itemsMap.get(Number(discount.order_item_id));

                    return (
                      <Box
                        key={discount.id}
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
                                ? `${item.qty} × ${item.name}`
                                : `Ítem #${discount.order_item_id}`}
                            </Typography>

                            <Typography
                              sx={{
                                mt: 0.35,
                                fontSize: 13,
                                color: "text.secondary",
                              }}
                            >
                              Base del ítem:{" "}
                              {formatCurrency(item?.total ?? 0)}
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
                                onRemoveItem?.(discount.order_item_id)
                              }
                              disabled={busy || disabled}
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
                    const selectedOrderItemId = Number(draft?.orderItemId || 0);
                    const selectedItem =
                      itemsMap.get(selectedOrderItemId) || null;

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
                                onChange={(e) =>
                                  onItemDiscountDraftChange?.(
                                    draft.localId,
                                    "orderItemId",
                                    e.target.value
                                  )
                                }
                                disabled={busy || disabled || hasGlobalDiscount}
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
                                      key={item.orderItemId}
                                      value={String(item.orderItemId)}
                                      disabled={isUsedByOtherDraft}
                                    >
                                      {item.qty} × {item.name}
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
                                Base del ítem: {formatCurrency(selectedItem.total)}
                              </Typography>
                            </Box>
                          ) : null}

                          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                            <FieldBlock
                              label="Tipo *"
                              input={
                                <TextField
                                  select
                                  fullWidth
                                  value={draft.type || "fixed"}
                                  onChange={(e) =>
                                    onItemDiscountDraftChange?.(
                                      draft.localId,
                                      "type",
                                      e.target.value
                                    )
                                  }
                                  disabled={busy || disabled || hasGlobalDiscount}
                                >
                                  <MenuItem value="fixed">Monto fijo</MenuItem>
                                  <MenuItem value="percent">Porcentaje</MenuItem>
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
                                  onChange={(e) =>
                                    onItemDiscountDraftChange?.(
                                      draft.localId,
                                      "value",
                                      e.target.value
                                    )
                                  }
                                  inputProps={{ inputMode: "decimal" }}
                                  placeholder="0.00"
                                  disabled={busy || disabled || hasGlobalDiscount}
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
                                onChange={(e) =>
                                  onItemDiscountDraftChange?.(
                                    draft.localId,
                                    "reason",
                                    e.target.value
                                  )
                                }
                                placeholder="Opcional"
                                disabled={busy || disabled || hasGlobalDiscount}
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
                              onClick={() => onApplyItemDraft?.(draft.localId)}
                              disabled={
                                busy || disabled || hasGlobalDiscount
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
                  No se encontraron ítems disponibles para descuento.
                </HelperBox>
              ) : null}
            </Stack>
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
            <InfoRow
              label="Subtotal"
              value={formatCurrency(summary?.sale?.subtotal ?? sale?.subtotal ?? 0)}
            />
            <InfoRow
              label="Descuento acumulado"
              value={formatCurrency(
                summary?.sale?.discount_total ?? sale?.discount_total ?? 0
              )}
            />
            <InfoRow
              label="Total actual"
              value={formatCurrency(summary?.sale?.total ?? sale?.total ?? 0)}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
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
      <Typography sx={{ fontSize: 14, color: "text.secondary", fontWeight: 700 }}>
        {label}
      </Typography>

      <Typography sx={{ fontSize: 14, color: "text.primary", fontWeight: 800 }}>
        {value}
      </Typography>
    </Stack>
  );
}

function resolveItemName(item) {
  const displayName =
    typeof item?.display_name === "string" ? item.display_name.trim() : "";
  const productName =
    typeof item?.product_name === "string" ? item.product_name.trim() : "";
  const variantName =
    typeof item?.variant_name === "string" ? item.variant_name.trim() : "";

  if (displayName) return displayName;
  if (productName && variantName) return `${productName} · ${variantName}`;
  if (productName) return productName;
  if (variantName) return variantName;
  return "Producto";
}

function formatCurrency(value) {
  const safe = Number(value || 0);

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