// src/components/staff/casher/saleDetailPage/CashierPaymentFormCard.jsx
// Tarjetita pagos

import React from "react";
import {
  Box, Button, Card, CardContent, IconButton, MenuItem, Stack, TextField, Typography,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";

export default function CashierPaymentFormCard({
  methods = [],
  initialAmount = null,
  preview = null,
  previewMode = null,
  tip,
  onTipChange,
  payments = [],
  onAddPayment,
  onRemovePayment,
  onPaymentChange,
  onPreview,
  showPrebill = false,
  onPrebill,
  prebillDisabled = false,
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

  netpayAvailable = false,
  netpayMode = false,
  onNetpayModeChange,
  netpayBusy = false,
  netpayStatus = "",
  netpayStatusLabel = "",
  netpayTerminal = null,
  netpayFinancialPending = false,
  netpayDevicePending = false,
  netpayRecoveryAvailable = false,
  netpayPendingMessage = "",
  onRetryNetpayRecovery,

  paymentAmountLocked = false,
  bankFieldsLocked = false,

  // Alias utilizado actualmente por CashierOnlineOrderPaymentPage.
  amountLocked = false,
  hideManualCardFields = false,
}) {
  const normalizedMaxPayments = Math.max(1, Math.trunc(Number(maxPayments) || 3));
  const validatedPreview = preview?.preview ?? preview ?? null;

  const detectedPreviewMode =
    previewMode ||
    validatedPreview?.preview_type ||
    null;

  const isNetpay =
    Boolean(netpayMode) ||
    detectedPreviewMode === "netpay";

  const visibleMethods = isNetpay
    ? methods.filter((method) =>
        ["credit_card", "debit_card"].includes(
          String(method?.code || "").toLowerCase()
        )
      )
    : methods;

  const operationLocked =
    Boolean(netpayBusy) ||
    Boolean(netpayFinancialPending) ||
    Boolean(netpayDevicePending);

  const financialInteractionLocked =
    disabled ||
    previewing ||
    paying ||
    operationLocked;

  const canRetryNetpayRecovery =
    Boolean(netpayRecoveryAvailable) &&
    !netpayDevicePending &&
    typeof onRetryNetpayRecovery === "function";

  const isAmountLocked =
    isNetpay ||
    paymentAmountLocked ||
    amountLocked;

  const hideBankFields =
    isNetpay ||
    bankFieldsLocked ||
    hideManualCardFields;

  const canShowAddPayment =
    showAddPayment &&
    !isNetpay;

  const canShowRemovePayment =
    showRemovePayment &&
    !isNetpay;

  const hasMaxPayments =
    payments.length >= normalizedMaxPayments;

  const hasRawInitialAmount =
    initialAmount !== null &&
    initialAmount !== undefined &&
    initialAmount !== "";

  const normalizedInitialAmount =
    hasRawInitialAmount
      ? Number(initialAmount)
      : Number.NaN;

  const validatedFinalTotal = Number(
    validatedPreview?.final_total
  );

  const validatedNetpayTotal = Number(
    validatedPreview?.expected_total
  );

  const hasValidatedFinalTotal =
    Boolean(hasPreview) &&
    !isNetpay &&
    Number.isFinite(validatedFinalTotal) &&
    validatedFinalTotal > 0;

  const hasValidatedNetpayTotal =
    Boolean(hasPreview) &&
    isNetpay &&
    Number.isFinite(validatedNetpayTotal) &&
    validatedNetpayTotal > 0;

  const displayedAmount =
    hasValidatedNetpayTotal
      ? validatedNetpayTotal
      : hasValidatedFinalTotal
      ? validatedFinalTotal
      : normalizedInitialAmount;

  const hasDisplayedAmount =
    Number.isFinite(displayedAmount) &&
    displayedAmount > 0;

  const validatedChange = Number(
    validatedPreview?.total_change ?? 0
  );

  const hasValidatedChange =
    !isNetpay &&
    Boolean(hasPreview) &&
    validatedPreview !== null;

  const resolvedNetpayStatus = normalizeNetpayStatus(netpayStatus);

  const resolvedNetpayStatusLabel =
    netpayStatusLabel ||
    resolveNetpayStatusLabel({
      status: resolvedNetpayStatus,
      previewing,
      paying,
      netpayBusy,
      financialPending: netpayFinancialPending,
      devicePending: netpayDevicePending,
      recoveryAvailable: netpayRecoveryAvailable,
      pendingMessage: netpayPendingMessage,
    });

  const canToggleNetpay =
    typeof onNetpayModeChange === "function";

  const netpayToggleDisabled =
    previewing ||
    paying ||
    netpayBusy ||
    netpayFinancialPending ||
    netpayDevicePending ||
    (!netpayMode && !netpayAvailable);

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
                {description ||
                  (isNetpay
                    ? "El cobro se procesará mediante la terminal PAX con NetPay."
                    : "Captura uno, dos o hasta tres métodos para cobrar únicamente la cuenta seleccionada.")}
              </Typography>
            </Box>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{ flexShrink: 0 }}
            >
              {canToggleNetpay ? (
                <Button
                  variant={netpayMode ? "contained" : "outlined"}
                  onClick={() => onNetpayModeChange?.(!netpayMode)}
                  disabled={netpayToggleDisabled}
                  sx={{
                    minWidth: { xs: "100%", sm: 150 },
                    height: 42,
                    borderRadius: 2,
                    fontWeight: 800,
                  }}
                >
                  {netpayMode ? "Usando NetPay" : "Usar NetPay"}
                </Button>
              ) : null}

              {canShowAddPayment ? (
                <Button
                  variant="outlined"
                  onClick={onAddPayment}
                  disabled={financialInteractionLocked || hasMaxPayments}
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
                  {hasValidatedNetpayTotal
                    ? "Total esperado NetPay"
                    : hasValidatedFinalTotal
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
                  {hasValidatedNetpayTotal
                    ? "Importe calculado y validado por Clic Menu para enviarse a NetPay."
                    : hasValidatedFinalTotal
                    ? "Importe confirmado por la vista previa del cobro."
                    : isNetpay
                    ? "Este importe es informativo hasta que Clic Menu genere y valide la vista previa NetPay."
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

          {isNetpay ? (
            <Box
              sx={{
                border: "1px solid",
                borderColor:
                  netpayFinancialPending || netpayDevicePending
                    ? "warning.main"
                    : "divider",
                borderRadius: 1,
                backgroundColor: "#FCFCFC",
                p: 1.5,
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", sm: "center" }}
                spacing={1.25}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 800, color: "text.primary" }}>
                    Estado NetPay
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.35,
                      fontSize: 13,
                      color:
                        netpayFinancialPending || netpayDevicePending
                          ? "warning.main"
                          : "text.secondary",
                      lineHeight: 1.5,
                    }}
                  >
                    {resolvedNetpayStatusLabel}
                  </Typography>

                  {netpayTerminal ? (
                    <Typography sx={{ mt: 0.35, fontSize: 12, color: "text.secondary" }}>
                      Terminal PAX sincronizada con Clic Menu.
                    </Typography>
                  ) : null}
                </Box>

                {canRetryNetpayRecovery ? (
                  <Button
                    variant="outlined"
                    onClick={onRetryNetpayRecovery}
                    disabled={netpayBusy || previewing || paying}
                    sx={{
                      minWidth: { xs: "100%", sm: 190 },
                      height: 42,
                      borderRadius: 2,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    Recuperar operación
                  </Button>
                ) : null}
              </Stack>
            </Box>
          ) : null}

          <Box>
            <Typography sx={fieldLabelSx}>Propina</Typography>

            <TextField
              fullWidth
              value={tip}
              onChange={(event) => onTipChange?.(event.target.value)}
              inputProps={{ inputMode: "decimal" }}
              placeholder="0.00"
              disabled={financialInteractionLocked}
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                md: payments.length === 1 ? "1fr" : "repeat(2, minmax(0, 1fr))",
              },
            }}
          >
            {payments.map((payment, index) => {
              const method = methods.find(
                (row) => Number(row.id) === Number(payment.payment_method_id)
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

                      {canShowRemovePayment ? (
                        <IconButton
                          onClick={() => onRemovePayment?.(payment.localId)}
                          disabled={payments.length <= 1 || financialInteractionLocked}
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

                    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
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
                            disabled={
                              disabled ||
                              previewing ||
                              paying ||
                              operationLocked ||
                              paymentMethodLocked
                            }
                          >
                            <MenuItem value="">
                              {isNetpay ? "Selecciona Crédito o Débito" : "Selecciona un método"}
                            </MenuItem>

                            {visibleMethods.map((methodRow) => {
                              const isUsedByOther = usedMethodIds.includes(Number(methodRow.id));
                              const isSelected =
                                Number(payment.payment_method_id) === Number(methodRow.id);

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
                            disabled={
                              disabled ||
                              previewing ||
                              paying ||
                              operationLocked ||
                              isAmountLocked
                            }
                          />
                        }
                      />
                    </Stack>

                    {!hideBankFields ? (
                      <NormalPaymentExtraFields
                        method={method}
                        payment={payment}
                        onPaymentChange={onPaymentChange}
                        disabled={disabled}
                        previewing={previewing}
                        paying={paying}
                      />
                    ) : (
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
                            lineHeight: 1.5,
                          }}
                        >
                          La referencia bancaria, los últimos 4 dígitos y los datos de la tarjeta
                          serán obtenidos directamente de NetPay. No se capturan manualmente.
                        </Typography>
                      </Box>
                    )}
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

          {!(isNetpay && (netpayFinancialPending || netpayDevicePending)) ? (
            <Box
              sx={{
                border: "1px dashed",
                borderColor: "divider",
                borderRadius: 1,
                p: 1.5,
              }}
            >
              <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.55 }}>
                {helperText ||
                  (isNetpay
                    ? "NetPay permite exactamente un método de pago: tarjeta de crédito o débito. El importe será validado por Clic Menu antes de enviarse a la terminal."
                    : "Máximo 3 métodos de pago por cuenta. No se puede repetir el mismo método en la misma operación.")}
              </Typography>
            </Box>
          ) : null}

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            justifyContent="flex-end"
          >
            {showPrebill ? (
              <Button
                variant="outlined"
                onClick={onPrebill}
                disabled={prebillDisabled || previewing || paying || operationLocked}
                startIcon={<ReceiptLongRoundedIcon />}
                sx={{
                  minWidth: { xs: "100%", sm: 160 },
                  height: 44,
                  borderRadius: 2,
                  fontWeight: 800,
                }}
              >
                Precuenta
              </Button>
            ) : null}

            <Button
              variant="outlined"
              onClick={onPreview}
              disabled={financialInteractionLocked}
              startIcon={<VisibilityRoundedIcon />}
              sx={{
                minWidth: { xs: "100%", sm: 180 },
                height: 44,
                borderRadius: 2,
                fontWeight: 800,
              }}
            >
              {previewing
                ? isNetpay
                  ? "Validando NetPay…"
                  : "Validando…"
                : "Generar vista previa"}
            </Button>

            <Button
              variant="contained"
              onClick={onPay}
              disabled={
                disabled ||
                !hasPreview ||
                previewing ||
                paying ||
                operationLocked
              }
              startIcon={<PaymentsRoundedIcon />}
              sx={{
                minWidth: { xs: "100%", sm: 180 },
                height: 44,
                borderRadius: 2,
                fontWeight: 800,
              }}
            >
              {paying
                ? isNetpay
                  ? "Procesando NetPay…"
                  : "Cobrando…"
                : "Cobrar cuenta"}
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

function NormalPaymentExtraFields({
  method,
  payment,
  onPaymentChange,
  disabled,
  previewing,
  paying,
}) {
  if (!method) return null;

  const fields = [];

  if (method?.requires_reference) {
    fields.push({
      key: "reference",
      label: "Referencia *",
      input: (
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
          placeholder="Requerida"
          disabled={disabled || previewing || paying}
        />
      ),
    });
  }

  if (method?.requires_last4) {
    fields.push({
      key: "last4",
      label: "Últimos 4 dígitos *",
      input: (
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
          placeholder="0000"
          disabled={disabled || previewing || paying}
        />
      ),
    });
  }

  if (method?.requires_received_amount) {
    fields.push({
      key: "received",
      label: "Recibido *",
      input: (
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
          placeholder="0.00"
          disabled={disabled || previewing || paying}
        />
      ),
    });
  }

  fields.push({
    key: "change",
    label: "Cambio estimado",
    input: (
      <TextField
        fullWidth
        value={formatCurrency(calculateEstimatedChange(payment, method))}
        disabled
      />
    ),
  });

  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: {
          xs: "1fr",
          md: "repeat(2, minmax(0, 1fr))",
        },
      }}
    >
      {fields.map((field, index) => {
        const isLastOddField =
          fields.length % 2 !== 0 &&
          index === fields.length - 1;

        return (
          <Box
            key={field.key}
            sx={{
              minWidth: 0,
              gridColumn: {
                xs: "1 / -1",
                md: isLastOddField ? "1 / -1" : "auto",
              },
            }}
          >
            <FieldBlock
              label={field.label}
              input={field.input}
            />
          </Box>
        );
      })}
    </Box>
  );
}

function normalizeNetpayStatus(value) {
  if (typeof value === "string") return value;

  if (value && typeof value === "object") {
    return String(value.status || "");
  }

  return "";
}

function resolveNetpayStatusLabel({
  status,
  previewing,
  paying,
  netpayBusy,
  financialPending,
  devicePending,
  recoveryAvailable,
  pendingMessage,
}) {
  const labels = {
    resolving_terminal: "Validando NetPay…",
    creating_intent: "Preparando y enviando la operación a la terminal…",
    starting_sale: "Enviando a terminal…",
    waiting_sale_result: "Esperando respuesta de la terminal…",
    sending_sale_result: "Procesando resultado NetPay…",
    finalizing: "Procesando resultado y finalizando el cobro…",
    requesting_recovery: "Preparando recuperación NetPay…",
    starting_recovery: "Recuperando operación por folio…",
    waiting_recovery_result: "Esperando respuesta de recuperación…",
    sending_recovery_result: "Procesando resultado de recuperación…",
    recovery_required: "La operación requiere recuperación…",
    resuming_pending_operation: "Recuperando operación NetPay pendiente…",
    completed: "Operación NetPay completada.",
  };

  if (status && labels[status]) return labels[status];
  if (previewing) return "Validando NetPay…";
  if (paying || netpayBusy) return "Procesando operación NetPay…";
  if (pendingMessage) return pendingMessage;

  if (recoveryAvailable) {
    return "La operación NetPay pendiente ya puede volver a verificarse.";
  }

  if (financialPending) {
    return "Esta cuenta conserva una operación NetPay financieramente pendiente.";
  }

  if (devicePending) {
    return "La terminal PAX conserva una operación NetPay pendiente.";
  }

  return "NetPay listo para validar el cobro.";
}

function calculateEstimatedChange(payment, method) {
  if (!method?.requires_received_amount) return 0;

  const amount = Number(payment?.amount || 0);
  const received = Number(payment?.received || 0);

  if (!Number.isFinite(amount) || !Number.isFinite(received)) return 0;

  return Math.max(0, received - amount);
}

function formatCurrency(value) {
  const normalized = Number(value);
  const safe = Number.isFinite(normalized) ? normalized : 0;

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