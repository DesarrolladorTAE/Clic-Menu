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
}) {
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
              startIcon={<AddRoundedIcon />}
              sx={{
                minWidth: { xs: "100%", sm: 180 },
                height: 42,
                borderRadius: 2,
                fontWeight: 800,
              }}
            >
              Agregar pago
            </Button>
          </Stack>

          <Box>
            <Typography sx={fieldLabelSx}>Propina</Typography>
            <TextField
              value={tip}
              onChange={(e) => onTipChange(e.target.value)}
              inputProps={{ inputMode: "decimal" }}
              placeholder="0.00"
            />
          </Box>

          <Stack spacing={2}>
            {payments.map((payment, index) => {
              const method = methods.find(
                (m) => Number(m.id) === Number(payment.payment_method_id)
              );

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
                        disabled={payments.length <= 1}
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
                            value={payment.payment_method_id}
                            onChange={(e) =>
                              onPaymentChange(payment.localId, "payment_method_id", e.target.value)
                            }
                          >
                            {methods.map((methodRow) => (
                              <MenuItem key={methodRow.id} value={String(methodRow.id)}>
                                {methodRow.name}
                              </MenuItem>
                            ))}
                          </TextField>
                        }
                      />

                      <FieldBlock
                        label="Monto *"
                        input={
                          <TextField
                            value={payment.amount}
                            onChange={(e) =>
                              onPaymentChange(payment.localId, "amount", e.target.value)
                            }
                            inputProps={{ inputMode: "decimal" }}
                            placeholder="0.00"
                          />
                        }
                      />
                    </Stack>

                    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                      <FieldBlock
                        label={`Referencia${method?.requires_reference ? " *" : ""}`}
                        input={
                          <TextField
                            value={payment.reference}
                            onChange={(e) =>
                              onPaymentChange(payment.localId, "reference", e.target.value)
                            }
                            placeholder="Opcional"
                            disabled={!method?.requires_reference}
                          />
                        }
                      />

                      <FieldBlock
                        label={`Últimos 4 dígitos${method?.requires_last4 ? " *" : ""}`}
                        input={
                          <TextField
                            value={payment.last4}
                            onChange={(e) =>
                              onPaymentChange(payment.localId, "last4", e.target.value)
                            }
                            inputProps={{ inputMode: "numeric", maxLength: 4 }}
                            placeholder="0000"
                            disabled={!method?.requires_last4}
                          />
                        }
                      />
                    </Stack>

                    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                      <FieldBlock
                        label={`Recibido${method?.requires_received_amount ? " *" : ""}`}
                        input={
                          <TextField
                            value={payment.received}
                            onChange={(e) =>
                              onPaymentChange(payment.localId, "received", e.target.value)
                            }
                            inputProps={{ inputMode: "decimal" }}
                            placeholder="0.00"
                            disabled={!method?.requires_received_amount}
                          />
                        }
                      />

                      <FieldBlock
                        label="Cambio estimado"
                        input={
                          <TextField
                            value={formatCurrency(calculateEstimatedChange(payment, method))}
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

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            justifyContent="flex-end"
          >
            <Button
              variant="outlined"
              onClick={onPreview}
              disabled={previewing || paying}
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
              disabled={!hasPreview || previewing || paying}
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
