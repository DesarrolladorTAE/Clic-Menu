//Tarjetita de cancelaciones
import React, { useMemo } from "react";
import {
  Box, Button, Card, CardContent, Chip, Divider, IconButton, MenuItem, Stack, TextField, Typography,
} from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import PlaylistRemoveRoundedIcon from "@mui/icons-material/PlaylistRemoveRounded";
import RemoveShoppingCartRoundedIcon from "@mui/icons-material/RemoveShoppingCartRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

export default function CashierAdjustmentCard({
  sale,
  itemsFlat = [],
  summary = null,
  partialForm,
  onPartialFormChange,
  partialDrafts = [],
  onAddPartialDraft,
  onRemovePartialDraft,
  onPartialDraftChange,
  onSubmitPartial,
  cancelOrderReason = "",
  onCancelOrderReasonChange,
  onSubmitCancelOrder,
  busy = false,
  disabled = false,
}) {
  const normalizedItems = useMemo(() => {
    const rows = Array.isArray(itemsFlat) ? itemsFlat : [];
    return rows
      .map((item) => {
        const orderItemId = Number(item?.id ?? item?.order_item_id ?? 0);
        const quantity = Number(item?.quantity ?? 0);
        const unitPrice = Number(item?.unit_price ?? 0);
        const lineTotal = Number(item?.line_total ?? quantity * unitPrice);

        return {
          orderItemId,
          name: resolveItemName(item),
          quantity,
          unitPrice,
          lineTotal,
          parentOrderItemId: item?.parent_order_item_id ?? null,
          isCompositeParent: !!item?.is_composite_parent,
        };
      })
      .filter((item) => item.orderItemId > 0 && !item.parentOrderItemId);
  }, [itemsFlat]);

  const cancelledQtyMap = useMemo(() => {
    const map = new Map();

    const adjustments = Array.isArray(summary?.adjustments)
      ? summary.adjustments
      : [];

    adjustments.forEach((adjustment) => {
      if (String(adjustment?.status || "") !== "applied") return;

      const items = Array.isArray(adjustment?.items) ? adjustment.items : [];
      items.forEach((row) => {
        const orderItemId = Number(row?.order_item_id || 0);
        const qty = Number(row?.quantity || 0);
        if (!orderItemId || qty <= 0) return;

        map.set(orderItemId, Number(map.get(orderItemId) || 0) + qty);
      });
    });

    return map;
  }, [summary]);

  const selectedDraftItemIds = useMemo(() => {
    return partialDrafts
      .map((draft) => Number(draft?.orderItemId || 0))
      .filter(Boolean);
  }, [partialDrafts]);

  const selectableItems = useMemo(() => {
    return normalizedItems
      .map((item) => {
        const alreadyCancelled = Number(
          cancelledQtyMap.get(Number(item.orderItemId)) || 0
        );
        const availableQty = Math.max(Number(item.quantity) - alreadyCancelled, 0);

        return {
          ...item,
          alreadyCancelled,
          availableQty,
        };
      })
      .filter((item) => item.availableQty > 0);
  }, [normalizedItems, cancelledQtyMap]);

  const cancelAmount = Number(summary?.adjustment_summary?.cancel_amount || 0);
  const originalSubtotal = Number(
    summary?.adjustment_summary?.original_subtotal ?? sale?.subtotal ?? 0
  );
  const currentSubtotal = Number(
    summary?.adjustment_summary?.current_subtotal ?? sale?.subtotal ?? 0
  );
  const currentTotal = Number(
    summary?.adjustment_summary?.current_total ?? sale?.total ?? 0
  );

  const adjustments = Array.isArray(summary?.adjustments)
    ? summary.adjustments
    : [];

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
              Cancela ítems antes del pago o cancela la orden completa si el
              cliente ya no va a consumir.
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
              <InfoRow label="Subtotal original" value={formatCurrency(originalSubtotal)} />
              <InfoRow label="Monto cancelado" value={formatCurrency(cancelAmount)} />
              <InfoRow label="Subtotal actual" value={formatCurrency(currentSubtotal)} />
              <InfoRow label="Total actual" value={formatCurrency(currentTotal)} />
            </Stack>
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
            <Stack spacing={1.75}>
              <Stack direction="row" spacing={1} alignItems="center">
                <PlaylistRemoveRoundedIcon color="primary" />
                <Typography sx={{ fontSize: 18, fontWeight: 800 }}>
                  Cancelación parcial por ítems
                </Typography>
              </Stack>

              <FieldBlock
                label="Motivo *"
                input={
                  <TextField
                    fullWidth
                    value={partialForm?.reason || ""}
                    onChange={(e) =>
                      onPartialFormChange?.("reason", e.target.value)
                    }
                    placeholder="Ej. Cliente ya no quiere una bebida"
                    disabled={busy || disabled}
                  />
                }
              />

              {partialDrafts.length > 0 ? (
                <Stack spacing={1.25}>
                  {partialDrafts.map((draft, index) => {
                    const selectedItem = selectableItems.find(
                      (item) =>
                        Number(item.orderItemId) === Number(draft?.orderItemId || 0)
                    );

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
                            alignItems={{ xs: "stretch", sm: "center" }}
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
                              onClick={() => onRemovePartialDraft?.(draft.localId)}
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

                          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                            <FieldBlock
                              label="Ítem *"
                              input={
                                <TextField
                                  select
                                  fullWidth
                                  value={draft.orderItemId || ""}
                                  onChange={(e) =>
                                    onPartialDraftChange?.(
                                      draft.localId,
                                      "orderItemId",
                                      e.target.value
                                    )
                                  }
                                  disabled={busy || disabled}
                                >
                                  <MenuItem value="">Selecciona un ítem</MenuItem>

                                  {selectableItems.map((item) => {
                                    const usedByOtherDraft =
                                      selectedDraftItemIds.includes(
                                        Number(item.orderItemId)
                                      ) &&
                                      Number(draft.orderItemId || 0) !==
                                        Number(item.orderItemId);

                                    return (
                                      <MenuItem
                                        key={item.orderItemId}
                                        value={String(item.orderItemId)}
                                        disabled={usedByOtherDraft}
                                      >
                                        {item.quantity} × {item.name}
                                      </MenuItem>
                                    );
                                  })}
                                </TextField>
                              }
                            />

                            <FieldBlock
                              label="Cantidad *"
                              input={
                                <TextField
                                  select
                                  fullWidth
                                  value={draft.quantity || ""}
                                  onChange={(e) =>
                                    onPartialDraftChange?.(
                                      draft.localId,
                                      "quantity",
                                      e.target.value
                                    )
                                  }
                                  disabled={busy || disabled || !selectedItem}
                                >
                                  <MenuItem value="">Selecciona</MenuItem>
                                  {Array.from(
                                    { length: Number(selectedItem?.availableQty || 0) },
                                    (_, idx) => idx + 1
                                  ).map((qty) => (
                                    <MenuItem key={qty} value={String(qty)}>
                                      {qty}
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
                                Disponible para cancelar: {selectedItem.availableQty} ·
                                Precio unitario: {formatCurrency(selectedItem.unitPrice)}
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
                  Agrega uno o más ítems a cancelar. Si el ajuste dejara la orden
                  en cero, el sistema te pedirá usar cancelación total.
                </HelperBox>
              )}

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.25}
                justifyContent="space-between"
              >
                <Button
                  variant="outlined"
                  onClick={onAddPartialDraft}
                  disabled={busy || disabled || selectableItems.length === 0}
                  startIcon={<AddRoundedIcon />}
                  sx={{
                    minWidth: { xs: "100%", sm: 220 },
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
                  onClick={onSubmitPartial}
                  disabled={busy || disabled || partialDrafts.length === 0}
                  startIcon={<PlaylistRemoveRoundedIcon />}
                  sx={{
                    minWidth: { xs: "100%", sm: 240 },
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
                  No se encontraron ítems principales disponibles para cancelar.
                </HelperBox>
              ) : null}
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
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <RemoveShoppingCartRoundedIcon color="error" />
                <Typography sx={{ fontSize: 18, fontWeight: 800 }}>
                  Cancelación total de la orden
                </Typography>
              </Stack>

              <FieldBlock
                label="Motivo *"
                input={
                  <TextField
                    fullWidth
                    value={cancelOrderReason || ""}
                    onChange={(e) => onCancelOrderReasonChange?.(e.target.value)}
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
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <WarningAmberRoundedIcon
                    sx={{ mt: 0.15, color: "warning.main", fontSize: 18 }}
                  />
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: "text.secondary",
                      lineHeight: 1.55,
                    }}
                  >
                    La cancelación total dejará la orden y la venta en estado
                    cancelado, liberará la mesa y cerrará la sesión QR si existe.
                  </Typography>
                </Stack>
              </Box>

              <Button
                variant="outlined"
                color="error"
                onClick={onSubmitCancelOrder}
                disabled={busy || disabled}
                startIcon={<RemoveShoppingCartRoundedIcon />}
                sx={{
                  alignSelf: "flex-end",
                  minWidth: { xs: "100%", sm: 260 },
                  height: 42,
                  borderRadius: 2,
                  fontWeight: 800,
                }}
              >
                Cancelar orden completa
              </Button>
            </Stack>
          </Box>

          <Divider />

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
                  const adjustmentItems = Array.isArray(adjustment?.items)
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
                          direction={{ xs: "column", sm: "row" }}
                          justifyContent="space-between"
                          spacing={1}
                        >
                          <Box>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                              <Chip
                                size="small"
                                label={
                                  adjustment.type === "cancel_order"
                                    ? "Cancelación total"
                                    : "Cancelación parcial"
                                }
                              />
                              <Chip
                                size="small"
                                label={`Estado: ${adjustment.status || "—"}`}
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
                              {adjustment.reason || "Sin motivo"}
                            </Typography>

                            <Typography
                              sx={{
                                mt: 0.5,
                                fontSize: 12,
                                color: "text.secondary",
                              }}
                            >
                              {formatDate(adjustment.created_at)}
                            </Typography>
                          </Box>
                        </Stack>

                        {adjustmentItems.length > 0 ? (
                          <Stack spacing={0.5}>
                            {adjustmentItems.map((row) => {
                              const itemName =
                                row?.order_item?.id
                                  ? resolveAdjustmentItemName(row)
                                  : `Ítem #${row?.order_item_id || "—"}`;

                              return (
                                <Typography
                                  key={row.id}
                                  sx={{
                                    fontSize: 13,
                                    color: "text.secondary",
                                    lineHeight: 1.5,
                                  }}
                                >
                                  • {itemName} · Cantidad: {Number(row?.quantity || 0)} ·
                                  Monto: {formatCurrency(row?.amount || 0)}
                                </Typography>
                              );
                            })}
                          </Stack>
                        ) : null}
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            ) : (
              <HelperBox>No hay ajustes aplicados en esta venta.</HelperBox>
            )}
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

function resolveAdjustmentItemName(row) {
  const orderItem = row?.order_item || null;
  if (!orderItem) return `Ítem #${row?.order_item_id || "—"}`;

  return `Ítem #${orderItem.id}`;
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

function formatDate(value) {
  if (!value) return "Fecha no disponible";

  try {
    return new Intl.DateTimeFormat("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
  mb: 1,
};