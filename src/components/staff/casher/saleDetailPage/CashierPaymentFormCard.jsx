// src/components/staff/casher/saleDetailPage/CashierPaymentFormCard.jsx
//Tarjetita pagos
import React from "react";
import {
  Box, Button, Card, CardContent, IconButton, MenuItem, Stack, TextField, Typography,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";

export default function CashierPaymentFormCard({
  methods = [],
  initialAmount = null,
  preview = null,
  tip,
  onTipChange,
  payments = [],
  onAddPayment,
  onRemovePayment,
  onPaymentChange,
  onPreview,
  previewing = false,
  paying = false,
  hasPreview = false,
  onPay,
  disabled = false,
  maxPayments = 3,
  showAddPayment = true,
  showRemovePayment = true,
  paymentMethodLocked = false,
  description = null,
  helperText = null,
}) {
  const normalizedMaxPayments = Math.max(1, Math.trunc(Number(maxPayments) || 3));
  const hasMaxPayments = payments.length >= normalizedMaxPayments;

  const hasRawInitialAmount =
    initialAmount !== null &&
    initialAmount !== undefined &&
    initialAmount !== "";

  const normalizedInitialAmount = hasRawInitialAmount
    ? Number(initialAmount)
    : Number.NaN;

  const hasInitialAmount =
    Number.isFinite(normalizedInitialAmount) &&
    normalizedInitialAmount > 0;

  const validatedPreview =
    preview?.preview ??
    preview ??
    null;

  const validatedFinalTotal = Number(
    validatedPreview?.final_total
  );

  const hasValidatedFinalTotal =
    Boolean(hasPreview) &&
    Number.isFinite(validatedFinalTotal) &&
    validatedFinalTotal > 0;

  const displayedAmount = hasValidatedFinalTotal
    ? validatedFinalTotal
    : normalizedInitialAmount;

  const hasDisplayedAmount =
    Number.isFinite(displayedAmount) &&
    displayedAmount > 0;

  const validatedChange = Number(
    validatedPreview?.total_change ?? 0
  );

  const hasValidatedChange =
    Boolean(hasPreview) &&
    validatedPreview !== null;

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
        <Stack spacing={2.25}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            spacing={1.5}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "text.primary",
                }}
              >
                Pagos de la cuenta
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 14,
                  color: "text.secondary",
                  lineHeight: 1.5,
                }}
              >
                {description || "Captura uno, dos o hasta tres métodos para cobrar únicamente la cuenta seleccionada."}
              </Typography>
            </Box>

            {showAddPayment ? (
              <Button
                variant="outlined"
                onClick={onAddPayment}
                disabled={disabled || hasMaxPayments || previewing || paying}
                startIcon={<AddRoundedIcon />}
                sx={{
                  minWidth: { xs: "100%", sm: 180 },
                  height: 42,
                  borderRadius: 2,
                  fontWeight: 800,
                }}
              >
                {hasMaxPayments
                  ? `Máximo ${normalizedMaxPayments} pago${normalizedMaxPayments === 1 ? "" : "s"}`
                  : "Agregar pago"}
              </Button>
            ) : null}
          </Stack>

          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              backgroundColor: "#FCFCFC",
              p: 1.5,
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={0.75}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: "text.primary",
                  }}
                >
                  {hasValidatedFinalTotal
                    ? "Total validado de la cuenta"
                    : "Importe actual de la cuenta"}
                </Typography>

                <Typography
                  sx={{
                    mt: 0.35,
                    fontSize: 12,
                    color: "text.secondary",
                    lineHeight: 1.45,
                  }}
                >
                  {hasValidatedFinalTotal
                    ? "Importe confirmado por la vista previa del cobro."
                    : "Incluye el neto sincronizado de la cuenta y la propina capturada. La vista previa validará el total definitivo."}
                </Typography>
              </Box>

              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: "text.primary",
                  whiteSpace: "nowrap",
                }}
              >
                {hasDisplayedAmount
                  ? formatCurrency(displayedAmount)
                  : "Pendiente"}
              </Typography>
            </Stack>
          </Box>

          <Box>
            <Typography sx={fieldLabelSx}>Propina</Typography>

            <TextField
              fullWidth
              value={tip}
              onChange={(event) => onTipChange?.(event.target.value)}
              inputProps={{ inputMode: "decimal" }}
              placeholder="0.00"
              disabled={disabled || previewing || paying}
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                md:
                  payments.length === 1
                    ? "1fr"
                    : "repeat(2, minmax(0, 1fr))",
              },
            }}
          >
            {payments.map((payment, index) => {
              const method = methods.find(
                (row) =>
                  Number(row.id) ===
                  Number(payment.payment_method_id)
              );

              const usedMethodIds = payments
                .filter((row) => row.localId !== payment.localId)
                .map((row) => Number(row.payment_method_id || 0))
                .filter(Boolean);

              const isThirdPayment = index === 2;

              return (
                <Box
                  key={payment.localId}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    backgroundColor: "#FCFCFC",
                    p: 2,
                    gridColumn: {
                      xs: "auto",
                      md: isThirdPayment ? "1 / -1" : "auto",
                    },
                  }}
                >
                  <Stack spacing={1.5}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      spacing={1}
                    >
                      <Typography
                        sx={{
                          fontSize: 16,
                          fontWeight: 800,
                          color: "text.primary",
                        }}
                      >
                        Pago {index + 1}
                      </Typography>

                      {showRemovePayment ? (
                        <IconButton
                          onClick={() => onRemovePayment?.(payment.localId)}
                          disabled={payments.length <= 1 || disabled || previewing || paying}
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: "error.main",
                            color: "#fff",
                            borderRadius: 1.5,
                            "&:hover": { bgcolor: "error.dark" },
                            "&.Mui-disabled": {
                              bgcolor: "action.disabledBackground",
                              color: "action.disabled",
                            },
                          }}
                        >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      ) : null}
                    </Stack>

                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      spacing={2}
                    >
                      <FieldBlock
                        label="Método de pago *"
                        input={
                          <TextField
                            select
                            fullWidth
                            value={payment.payment_method_id}
                            onChange={(event) =>
                              onPaymentChange?.(
                                payment.localId,
                                "payment_method_id",
                                event.target.value
                              )
                            }
                            disabled={disabled || previewing || paying || paymentMethodLocked}
                          >
                            <MenuItem value="">
                              Selecciona un método
                            </MenuItem>

                            {methods.map((methodRow) => {
                              const isUsedByOther = usedMethodIds.includes(
                                Number(methodRow.id)
                              );

                              const isSelected =
                                Number(payment.payment_method_id) ===
                                Number(methodRow.id);

                              return (
                                <MenuItem
                                  key={methodRow.id}
                                  value={String(methodRow.id)}
                                  disabled={isUsedByOther && !isSelected}
                                >
                                  {methodRow.name}
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
                            value={payment.amount}
                            onChange={(event) =>
                              onPaymentChange?.(
                                payment.localId,
                                "amount",
                                event.target.value
                              )
                            }
                            inputProps={{ inputMode: "decimal" }}
                            placeholder="0.00"
                            disabled={disabled || previewing || paying}
                          />
                        }
                      />
                    </Stack>

                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      spacing={2}
                    >
                      <FieldBlock
                        label={`Referencia${
                          method?.requires_reference ? " *" : ""
                        }`}
                        input={
                          <TextField
                            fullWidth
                            value={payment.reference}
                            onChange={(event) =>
                              onPaymentChange?.(
                                payment.localId,
                                "reference",
                                event.target.value
                              )
                            }
                            placeholder={
                              method?.requires_reference
                                ? "Requerida"
                                : "No aplica"
                            }
                            disabled={
                              disabled ||
                              previewing ||
                              paying ||
                              !method?.requires_reference
                            }
                          />
                        }
                      />

                      <FieldBlock
                        label={`Últimos 4 dígitos${
                          method?.requires_last4 ? " *" : ""
                        }`}
                        input={
                          <TextField
                            fullWidth
                            value={payment.last4}
                            onChange={(event) =>
                              onPaymentChange?.(
                                payment.localId,
                                "last4",
                                String(event.target.value || "")
                                  .replace(/\D/g, "")
                                  .slice(0, 4)
                              )
                            }
                            inputProps={{
                              inputMode: "numeric",
                              maxLength: 4,
                            }}
                            placeholder={
                              method?.requires_last4
                                ? "0000"
                                : "No aplica"
                            }
                            disabled={
                              disabled ||
                              previewing ||
                              paying ||
                              !method?.requires_last4
                            }
                          />
                        }
                      />
                    </Stack>

                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      spacing={2}
                    >
                      <FieldBlock
                        label={`Recibido${
                          method?.requires_received_amount ? " *" : ""
                        }`}
                        input={
                          <TextField
                            fullWidth
                            value={payment.received}
                            onChange={(event) =>
                              onPaymentChange?.(
                                payment.localId,
                                "received",
                                event.target.value
                              )
                            }
                            inputProps={{ inputMode: "decimal" }}
                            placeholder={
                              method?.requires_received_amount
                                ? "0.00"
                                : "No aplica"
                            }
                            disabled={
                              disabled ||
                              previewing ||
                              paying ||
                              !method?.requires_received_amount
                            }
                          />
                        }
                      />

                      <FieldBlock
                        label="Cambio estimado"
                        input={
                          <TextField
                            fullWidth
                            value={formatCurrency(
                              calculateEstimatedChange(
                                payment,
                                method
                              )
                            )}
                            disabled
                          />
                        }
                      />
                    </Stack>
                  </Stack>
                </Box>
              );
            })}
          </Box>

          {hasValidatedChange ? (
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                backgroundColor: "#FCFCFC",
                p: 1.5,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={1}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: "text.primary",
                    }}
                  >
                    Cambio validado
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.35,
                      fontSize: 12,
                      color: "text.secondary",
                    }}
                  >
                    Importe calculado por la vista previa del cobro.
                  </Typography>
                </Box>

                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: "text.primary",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatCurrency(validatedChange)}
                </Typography>
              </Stack>
            </Box>
          ) : null}

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
              {helperText || "Máximo 3 métodos de pago por cuenta. No se puede repetir el mismo método en la misma operación."}
            </Typography>
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            justifyContent="flex-end"
          >
            <Button
              variant="outlined"
              onClick={onPreview}
              disabled={disabled || previewing || paying}
              startIcon={<VisibilityRoundedIcon />}
              sx={{
                minWidth: { xs: "100%", sm: 180 },
                height: 44,
                borderRadius: 2,
                fontWeight: 800,
              }}
            >
              {previewing
                ? "Validando…"
                : "Generar vista previa"}
            </Button>

            <Button
              variant="contained"
              onClick={onPay}
              disabled={
                disabled ||
                !hasPreview ||
                previewing ||
                paying
              }
              startIcon={<PaymentsRoundedIcon />}
              sx={{
                minWidth: { xs: "100%", sm: 180 },
                height: 44,
                borderRadius: 2,
                fontWeight: 800,
              }}
            >
              {paying ? "Cobrando…" : "Cobrar cuenta"}
            </Button>
          </Stack>
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

function calculateEstimatedChange(payment, method) {
  if (!method?.requires_received_amount) return 0;

  const amount = Number(payment?.amount || 0);
  const received = Number(payment?.received || 0);

  if (
    !Number.isFinite(amount) ||
    !Number.isFinite(received)
  ) {
    return 0;
  }

  return Math.max(0, received - amount);
}

function formatCurrency(value) {
  const normalized = Number(value);
  const safe = Number.isFinite(normalized)
    ? normalized
    : 0;

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
