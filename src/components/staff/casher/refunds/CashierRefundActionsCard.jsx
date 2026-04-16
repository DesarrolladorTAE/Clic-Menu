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
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

export default function CashierRefundActionsCard({
  summary,
  fullReason = "",
  onFullReasonChange,
  onSubmitFull,
  amountForm,
  onAmountFormChange,
  onSubmitAmount,
  itemDrafts = [],
  onAddItemDraft,
  onRemoveItemDraft,
  onItemDraftChange,
  onSubmitItems,
  busy = false,
  disabled = false,
}) {
  const sale = summary?.sale || null;
  const refunds = Array.isArray(summary?.refunds) ? summary.refunds : [];
  const orderItems = Array.isArray(summary?.order_items) ? summary.order_items : [];

  const selectableItems = useMemo(() => {
    return orderItems.filter(
      (row) => Number(row?.available_to_refund || 0) > 0
    );
  }, [orderItems]);

  const selectedDraftIds = useMemo(() => {
    return itemDrafts
      .map((draft) => Number(draft?.order_item_id || 0))
      .filter(Boolean);
  }, [itemDrafts]);

  const canRefund = Number(sale?.available_to_refund || 0) > 0;

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
              Refunds
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 14,
                color: "text.secondary",
                lineHeight: 1.5,
              }}
            >
              Aplica devolución total, parcial por monto o parcial por ítems mientras
              exista saldo disponible.
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
                <ReplayRoundedIcon color="primary" />
                <Typography sx={{ fontSize: 18, fontWeight: 800 }}>
                  Refund total
                </Typography>
              </Stack>

              <FieldBlock
                label="Motivo *"
                input={
                  <TextField
                    fullWidth
                    value={fullReason || ""}
                    onChange={(e) => onFullReasonChange?.(e.target.value)}
                    placeholder="Ej. Cliente canceló completamente después del cobro"
                    disabled={busy || disabled || !canRefund}
                  />
                }
              />

              <Button
                variant="outlined"
                color="error"
                onClick={onSubmitFull}
                disabled={busy || disabled || !canRefund}
                startIcon={<ReplayRoundedIcon />}
                sx={{
                  alignSelf: "flex-end",
                  minWidth: { xs: "100%", sm: 260 },
                  height: 42,
                  borderRadius: 2,
                  fontWeight: 800,
                }}
              >
                Refund total
              </Button>
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
                <PaidRoundedIcon color="primary" />
                <Typography sx={{ fontSize: 18, fontWeight: 800 }}>
                  Refund parcial por monto
                </Typography>
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <FieldBlock
                  label="Monto *"
                  input={
                    <TextField
                      fullWidth
                      value={amountForm?.amount || ""}
                      onChange={(e) =>
                        onAmountFormChange?.("amount", e.target.value)
                      }
                      inputProps={{ inputMode: "decimal" }}
                      placeholder="0.00"
                      disabled={busy || disabled || !canRefund}
                    />
                  }
                />

                <FieldBlock
                  label="Motivo *"
                  input={
                    <TextField
                      fullWidth
                      value={amountForm?.reason || ""}
                      onChange={(e) =>
                        onAmountFormChange?.("reason", e.target.value)
                      }
                      placeholder="Ej. Ajuste parcial posterior al cobro"
                      disabled={busy || disabled || !canRefund}
                    />
                  }
                />
              </Stack>

              <Button
                variant="contained"
                onClick={onSubmitAmount}
                disabled={busy || disabled || !canRefund}
                startIcon={<PaidRoundedIcon />}
                sx={{
                  alignSelf: "flex-end",
                  minWidth: { xs: "100%", sm: 280 },
                  height: 42,
                  borderRadius: 2,
                  fontWeight: 800,
                }}
              >
                Aplicar refund por monto
              </Button>
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
                  <ReplayRoundedIcon color="primary" />
                  <Typography sx={{ fontSize: 18, fontWeight: 800 }}>
                    Refund parcial por ítems
                  </Typography>
                </Stack>

                <Button
                  variant="outlined"
                  onClick={onAddItemDraft}
                  disabled={busy || disabled || !canRefund || selectableItems.length === 0}
                  startIcon={<AddRoundedIcon />}
                  sx={{
                    minWidth: { xs: "100%", sm: 220 },
                    height: 40,
                    borderRadius: 2,
                    fontWeight: 800,
                  }}
                >
                  Agregar ítem
                </Button>
              </Stack>

              {itemDrafts.length > 0 ? (
                <Stack spacing={1.25}>
                  {itemDrafts.map((draft, index) => {
                    const selectedItem = selectableItems.find(
                      (item) =>
                        Number(item.order_item_id) === Number(draft?.order_item_id || 0)
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
                              Ítem a devolver {index + 1}
                            </Typography>

                            <IconButton
                              onClick={() => onRemoveItemDraft?.(draft.localId)}
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
                                  value={draft.order_item_id || ""}
                                  onChange={(e) =>
                                    onItemDraftChange?.(
                                      draft.localId,
                                      "order_item_id",
                                      e.target.value
                                    )
                                  }
                                  disabled={busy || disabled || !canRefund}
                                >
                                  <MenuItem value="">Selecciona un ítem</MenuItem>

                                  {selectableItems.map((item) => {
                                    const usedByOtherDraft =
                                      selectedDraftIds.includes(Number(item.order_item_id)) &&
                                      Number(draft.order_item_id || 0) !==
                                        Number(item.order_item_id);

                                    return (
                                      <MenuItem
                                        key={item.order_item_id}
                                        value={String(item.order_item_id)}
                                        disabled={usedByOtherDraft}
                                      >
                                        Ítem #{item.order_item_id}
                                      </MenuItem>
                                    );
                                  })}
                                </TextField>
                              }
                            />

                            <FieldBlock
                              label="Monto *"
                              input={
                                <TextField
                                  fullWidth
                                  value={draft.amount || ""}
                                  onChange={(e) =>
                                    onItemDraftChange?.(
                                      draft.localId,
                                      "amount",
                                      e.target.value
                                    )
                                  }
                                  inputProps={{ inputMode: "decimal" }}
                                  placeholder="0.00"
                                  disabled={busy || disabled || !canRefund}
                                />
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
                                Referencia línea: {formatCurrency(selectedItem.line_total_reference)} ·
                                Ya refundado: {formatCurrency(selectedItem.refunded_amount)} ·
                                Disponible: {formatCurrency(selectedItem.available_to_refund)}
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
                  Agrega uno o más ítems para registrar un refund parcial por líneas.
                </HelperBox>
              )}

              <FieldBlock
                label="Motivo *"
                input={
                  <TextField
                    fullWidth
                    value={itemDrafts?.reason || ""}
                    onChange={() => {}}
                    placeholder="El motivo se captura al confirmar abajo"
                    disabled
                  />
                }
              />

              <Button
                variant="contained"
                onClick={onSubmitItems}
                disabled={busy || disabled || !canRefund || itemDrafts.length === 0}
                startIcon={<ReplayRoundedIcon />}
                sx={{
                  alignSelf: "flex-end",
                  minWidth: { xs: "100%", sm: 300 },
                  height: 42,
                  borderRadius: 2,
                  fontWeight: 800,
                }}
              >
                Aplicar refund por ítems
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
              Historial de refunds
            </Typography>

            {refunds.length > 0 ? (
              <Stack spacing={1.25}>
                {refunds.map((refund) => (
                  <Box
                    key={refund.id}
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
                          <Typography
                            sx={{
                              fontSize: 15,
                              fontWeight: 800,
                              color: "text.primary",
                            }}
                          >
                            {refund.type === "full"
                              ? "Refund total"
                              : "Refund parcial"}
                          </Typography>

                          <Typography
                            sx={{
                              mt: 0.35,
                              fontSize: 13,
                              color: "text.secondary",
                            }}
                          >
                            {refund.reason || "Sin motivo"}
                          </Typography>
                        </Box>

                        <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
                          <Typography
                            sx={{
                              fontSize: 15,
                              fontWeight: 800,
                              color: "text.primary",
                            }}
                          >
                            {formatCurrency(refund.total_refunded)}
                          </Typography>

                          <Typography
                            sx={{
                              mt: 0.35,
                              fontSize: 12,
                              color: "text.secondary",
                            }}
                          >
                            {formatDateTime(refund.created_at)}
                          </Typography>
                        </Box>
                      </Stack>

                      {Array.isArray(refund?.items) && refund.items.length > 0 ? (
                        <Stack spacing={0.5}>
                          {refund.items.map((row) => (
                            <Typography
                              key={row.id}
                              sx={{
                                fontSize: 13,
                                color: "text.secondary",
                                lineHeight: 1.5,
                              }}
                            >
                              • Ítem #{row.order_item_id || "—"} · Monto:{" "}
                              {formatCurrency(row.amount)}
                            </Typography>
                          ))}
                        </Stack>
                      ) : null}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            ) : (
              <HelperBox>No hay refunds aplicados en esta venta.</HelperBox>
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

const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
  mb: 1,
};

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

function formatDateTime(value) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}
