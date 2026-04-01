//Tarjetita Pagos
import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";

export default function CashierPaymentFormCard({
  methods = [],
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
}) {
  const hasMaxPayments = payments.length >= 3;

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
                Pagos
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 14,
                  color: "text.secondary",
                }}
              >
                Puedes dividir el cobro en varios métodos si lo necesitas.
              </Typography>
            </Box>

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
              {hasMaxPayments ? "Máximo 3 pagos" : "Agregar pago"}
            </Button>
          </Stack>

          <Box>
            <Typography sx={fieldLabelSx}>Propina</Typography>
            <TextField
              fullWidth
              value={tip}
              onChange={(e) => onTipChange(e.target.value)}
              inputProps={{ inputMode: "decimal" }}
              placeholder="0.00"
              disabled={disabled || previewing || paying}
            />
          </Box>

          <Stack spacing={2}>
            {payments.map((payment, index) => {
              const method = methods.find(
                (m) => Number(m.id) === Number(payment.payment_method_id)
              );

              const usedMethodIds = payments
                .filter((row) => row.localId !== payment.localId)
                .map((row) => Number(row.payment_method_id || 0))
                .filter(Boolean);

              return (
                <Box
                  key={payment.localId}
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

                      <IconButton
                        onClick={() => onRemovePayment(payment.localId)}
                        disabled={payments.length <= 1 || disabled || previewing || paying}
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
                        label="Método de pago *"
                        input={
                          <TextField
                            select
                            fullWidth
                            value={payment.payment_method_id}
                            onChange={(e) =>
                              onPaymentChange(
                                payment.localId,
                                "payment_method_id",
                                e.target.value
                              )
                            }
                            disabled={disabled || previewing || paying}
                          >
                            <MenuItem value="">Selecciona un método</MenuItem>

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
                            onChange={(e) =>
                              onPaymentChange(payment.localId, "amount", e.target.value)
                            }
                            inputProps={{ inputMode: "decimal" }}
                            placeholder="0.00"
                            disabled={disabled || previewing || paying}
                          />
                        }
                      />
                    </Stack>

                    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                      <FieldBlock
                        label={`Referencia${method?.requires_reference ? " *" : ""}`}
                        input={
                          <TextField
                            fullWidth
                            value={payment.reference}
                            onChange={(e) =>
                              onPaymentChange(payment.localId, "reference", e.target.value)
                            }
                            placeholder={
                              method?.requires_reference ? "Requerida" : "No aplica"
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
                        label={`Últimos 4 dígitos${method?.requires_last4 ? " *" : ""}`}
                        input={
                          <TextField
                            fullWidth
                            value={payment.last4}
                            onChange={(e) =>
                              onPaymentChange(
                                payment.localId,
                                "last4",
                                String(e.target.value || "")
                                  .replace(/\D/g, "")
                                  .slice(0, 4)
                              )
                            }
                            inputProps={{ inputMode: "numeric", maxLength: 4 }}
                            placeholder={
                              method?.requires_last4 ? "0000" : "No aplica"
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

                    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                      <FieldBlock
                        label={`Recibido${method?.requires_received_amount ? " *" : ""}`}
                        input={
                          <TextField
                            fullWidth
                            value={payment.received}
                            onChange={(e) =>
                              onPaymentChange(payment.localId, "received", e.target.value)
                            }
                            inputProps={{ inputMode: "decimal" }}
                            placeholder={
                              method?.requires_received_amount ? "0.00" : "No aplica"
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
                              calculateEstimatedChange(payment, method)
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
          </Stack>

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
              Máximo 3 métodos de pago por venta. No se puede repetir el mismo
              método en la misma operación.
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
              {previewing ? "Validando…" : "Generar vista previa"}
            </Button>

            <Button
              variant="contained"
              onClick={onPay}
              disabled={disabled || !hasPreview || previewing || paying}
              startIcon={<PaymentsRoundedIcon />}
              sx={{
                minWidth: { xs: "100%", sm: 180 },
                height: 44,
                borderRadius: 2,
                fontWeight: 800,
              }}
            >
              {paying ? "Cobrando…" : "Cobrar venta"}
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

const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
  mb: 1,
};

function calculateEstimatedChange(payment, method) {
  if (!method?.requires_received_amount) return 0;

  const amount = Number(payment?.amount || 0);
  const received = Number(payment?.received || 0);

  if (!Number.isFinite(amount) || !Number.isFinite(received)) return 0;
  return Math.max(0, received - amount);
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