// Tarjetita Resumen de Cobro

import React from "react";
import {
  Box,  Card, CardContent, Divider, Stack, Typography,
} from "@mui/material";

export default function CashierSaleSummaryCard({
  sale,
  liveTip = 0,
  preview = null,
  selectedTaxOption = null,
}) {
  const subtotal = Number(
    preview?.subtotal ??
      sale?.subtotal ??
      0
  );

  const promotionDiscountTotal = Number(
    preview?.promotion_discount_total ??
      sale?.promotion_discount_total ??
      0
  );

  const manualDiscountTotal = Number(
    preview?.manual_discount_total ??
      sale?.manual_discount_total ??
      0
  );

  const discountTotal = Number(
    preview?.discount_total ??
      sale?.discount_total ??
      0
  );

  const saleNetTotal = Number(
    sale?.net_total ??
      sale?.taxable_amount ??
      0
  );

  const liveTipAmount = Number(liveTip || 0);

  const provisionalTotal =
    saleNetTotal + liveTipAmount;

  const validatedNetTotal = Number(
    preview?.taxable_amount ?? 0
  );

  const validatedTip = Number(
    preview?.tip ?? 0
  );

  const validatedTotal = Number(
    preview?.final_total ?? 0
  );

  const totalChange = Number(
    preview?.total_change ?? 0
  );

  const sumPayments = Number(
    preview?.sum_payments ?? 0
  );

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
            <SummaryRow
              label="Subtotal bruto"
              value={formatCurrency(subtotal)}
            />

            <SummaryRow
              label="Promociones"
              value={formatDiscountCurrency(
                promotionDiscountTotal
              )}
            />

            <SummaryRow
              label="Descuentos manuales"
              value={formatDiscountCurrency(
                manualDiscountTotal
              )}
            />

            <SummaryRow
              label="Descuento total"
              value={formatDiscountCurrency(
                discountTotal
              )}
            />
          </Stack>

          <Divider />

          {!preview ? (
            <Stack spacing={1}>
              <SummaryRow
                label="Neto antes de propina"
                value={formatCurrency(saleNetTotal)}
              />

              <SummaryRow
                label="Propina capturada"
                value={formatCurrency(liveTipAmount)}
              />

              <SummaryRow
                label="Total provisional"
                value={formatCurrency(provisionalTotal)}
                strong
              />

              <SummaryRow
                label="Impuesto seleccionado"
                value={
                  selectedTaxOption?.label ||
                  selectedTaxOption?.name ||
                  "Pendiente"
                }
              />
            </Stack>
          ) : (
            <Stack spacing={1}>
              <SummaryRow
                label="Neto validado antes de propina"
                value={formatCurrency(validatedNetTotal)}
              />

              <SummaryRow
                label="Propina validada"
                value={formatCurrency(validatedTip)}
              />

              <SummaryRow
                label="Tasa"
                value={
                  preview?.tax_option?.name ||
                  selectedTaxOption?.label ||
                  selectedTaxOption?.name ||
                  "—"
                }
              />

              <SummaryRow
                label="Base"
                value={formatCurrency(
                  preview?.tax?.tax_base ?? 0
                )}
              />

              <SummaryRow
                label="Impuesto incluido"
                value={formatCurrency(
                  preview?.tax?.tax_total ?? 0
                )}
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
                Ya se validaron las promociones, los descuentos,
                el impuesto, el total, la suma de pagos y el cambio.
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
                El total mostrado todavía es provisional. Genera la
                vista previa para validar el cobro real antes de
                confirmarlo.
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
    <Stack
      direction="row"
      justifyContent="space-between"
      spacing={1}
    >
      <Typography
        sx={{
          fontSize: strong ? 15 : 14,
          fontWeight: strong ? 800 : 700,
          color: strong
            ? "text.primary"
            : "text.secondary",
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

function formatDiscountCurrency(value) {
  const amount = Math.abs(Number(value || 0));

  if (amount <= 0) {
    return formatCurrency(0);
  }

  return `-${formatCurrency(amount)}`;
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
