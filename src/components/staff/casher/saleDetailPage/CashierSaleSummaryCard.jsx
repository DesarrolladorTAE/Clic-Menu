import React from "react";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

export default function CashierSaleSummaryCard({
  sale,
  liveTip = 0,
  preview = null,
}) {
  const subtotal = Number(sale?.subtotal || 0);
  const discount = Number(sale?.discount_total || 0);
  const tip = Number(liveTip || 0);

  const liveTotal = subtotal - discount + tip;
  const finalTotal = Number(preview?.final_total ?? liveTotal);
  const totalChange = Number(preview?.total_change ?? 0);
  const sumPayments = Number(preview?.sum_payments ?? 0);

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
        <Stack spacing={2}>
          <Typography
            sx={{
              fontSize: 22,
              fontWeight: 800,
              color: "text.primary",
            }}
          >
            Resumen de cobro
          </Typography>

          <Stack spacing={1}>
            <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />
            <SummaryRow label="Descuento" value={formatCurrency(discount)} />
            <SummaryRow label="Propina" value={formatCurrency(tip)} />
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <SummaryRow
              label="Total final"
              value={formatCurrency(finalTotal)}
              strong
            />

            <SummaryRow
              label="Suma de pagos"
              value={formatCurrency(sumPayments)}
            />

            <SummaryRow
              label="Cambio"
              value={formatCurrency(totalChange)}
            />
          </Stack>

          {preview ? (
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                backgroundColor: "#FCFCFC",
                p: 1.5,
              }}
            >
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: "text.primary",
                }}
              >
                Vista previa validada
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 13,
                  color: "text.secondary",
                  lineHeight: 1.5,
                }}
              >
                La suma de pagos coincide con el total y la venta está lista para
                cobrarse.
              </Typography>
            </Box>
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
                Agrega los pagos y genera una vista previa para validar el cobro
                antes de confirmar.
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function SummaryRow({ label, value, strong = false }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={1}>
      <Typography
        sx={{
          fontSize: strong ? 15 : 14,
          fontWeight: strong ? 800 : 700,
          color: strong ? "text.primary" : "text.secondary",
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: strong ? 16 : 14,
          fontWeight: 800,
          color: "text.primary",
          textAlign: "right",
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
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
