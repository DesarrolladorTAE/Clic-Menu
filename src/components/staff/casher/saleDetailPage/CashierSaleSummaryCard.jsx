//Tarjetita Resumen de Cobro

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
  selectedTaxOption = null,
}) {
  const subtotal = Number(sale?.subtotal || 0);
  const discount = Number(sale?.discount_total || 0);
  const tip = Number(liveTip || 0);

  const estimatedTotal = subtotal - discount + tip;
  const validatedTotal = Number(preview?.final_total || 0);
  const totalChange = Number(preview?.total_change || 0);
  const sumPayments = Number(preview?.sum_payments || 0);

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
            <SummaryRow label="Propina capturada" value={formatCurrency(tip)} />
          </Stack>

          <Divider />

          {!preview ? (
            <Stack spacing={1}>
              <SummaryRow
                label="Total estimado"
                value={formatCurrency(estimatedTotal)}
                strong
              />
              <SummaryRow
                label="Impuesto seleccionado"
                value={selectedTaxOption?.name || "Pendiente"}
              />
            </Stack>
          ) : (
            <Stack spacing={1}>
              <SummaryRow
                label="Subtotal gravable"
                value={formatCurrency(preview?.taxable_amount ?? 0)}
              />
              <SummaryRow
                label="Tasa"
                value={preview?.tax_option?.name || selectedTaxOption?.name || "—"}
              />
              <SummaryRow
                label="Base"
                value={formatCurrency(preview?.tax?.tax_base ?? 0)}
              />
              <SummaryRow
                label="Impuesto"
                value={formatCurrency(preview?.tax?.tax_total ?? 0)}
              />
              <SummaryRow
                label="Total validado"
                value={formatCurrency(validatedTotal)}
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
          )}

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
                Ya se validó el impuesto, el total, la suma de pagos y el
                cambio.
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
                El total mostrado aquí todavía es estimado. Genera la vista
                previa para validar el cobro real antes de confirmarlo.
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