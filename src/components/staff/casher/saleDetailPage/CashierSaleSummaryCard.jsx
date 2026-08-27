// src/components/staff/casher/saleDetailPage/CashierSaleSummaryCard.jsx
// Tarjetita de resumen de cobro

import React from "react";
import {
  Box, Card, CardContent, Divider, Stack, Typography,
} from "@mui/material";

export default function CashierSaleSummaryCard({
  sale,
  liveTip = 0,
  preview = null,
  previewMode = null,
  selectedTaxOption = null,
}) {
  const hasPreview =
    preview !== null &&
    typeof preview === "object" &&
    !Array.isArray(preview);

  const resolvedPreviewMode =
    previewMode ||
    preview?.preview_type ||
    null;

  const isNetpayPreview =
    hasPreview &&
    (
      resolvedPreviewMode === "netpay" ||
      (
        hasField(preview, "purchase_amount") &&
        hasField(preview, "expected_total") &&
        Object.prototype.hasOwnProperty.call(preview, "preview_valid")
      )
    );

  /*
   * Valores sincronizados de la cuenta antes de generar la vista previa.
   * No se calcula aquí ningún total final.
   */
  const saleSubtotal = toNumber(sale?.subtotal);
  const salePromotionDiscountTotal = toNumber(sale?.promotion_discount_total);
  const saleManualDiscountTotal = toNumber(sale?.manual_discount_total);
  const saleDiscountTotal = toNumber(sale?.discount_total);
  const saleNetTotal = toNumber(sale?.net_total ?? sale?.taxable_amount);
  const liveTipAmount = toNumber(liveTip);

  /*
   * Preview normal.
   */
  const previewSubtotal = toNumber(preview?.subtotal);
  const previewPromotionDiscountTotal = toNumber(preview?.promotion_discount_total);
  const previewManualDiscountTotal = toNumber(preview?.manual_discount_total);
  const previewDiscountTotal = toNumber(preview?.discount_total);
  const previewTaxableAmount = toNumber(preview?.taxable_amount);
  const previewTip = toNumber(preview?.tip);
  const previewTaxBase = toNumber(preview?.tax?.tax_base);
  const previewTaxTotal = toNumber(preview?.tax?.tax_total);
  const previewFinalTotal = toNumber(preview?.final_total);
  const previewSumPayments = toNumber(preview?.sum_payments);
  const previewTotalChange = toNumber(preview?.total_change);

  const selectedTaxLabel =
    selectedTaxOption?.label ||
    selectedTaxOption?.name ||
    "Pendiente";

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

          {!hasPreview ? (
            <Stack spacing={1}>
              <SummaryRow
                label="Subtotal de la cuenta"
                value={formatCurrency(saleSubtotal)}
              />

              <SummaryRow
                label="Promociones"
                value={formatDiscountCurrency(salePromotionDiscountTotal)}
              />

              <SummaryRow
                label="Descuento manual"
                value={formatDiscountCurrency(saleManualDiscountTotal)}
              />

              <SummaryRow
                label="Descuento total"
                value={formatDiscountCurrency(saleDiscountTotal)}
              />

              <Divider sx={{ my: 0.5 }} />

              <SummaryRow
                label="Neto sincronizado"
                value={formatCurrency(saleNetTotal)}
              />

              <SummaryRow
                label="Propina capturada"
                value={formatCurrency(liveTipAmount)}
              />

              <SummaryRow
                label="Total pendiente de validar"
                value="Pendiente"
                strong
              />
            </Stack>
          ) : isNetpayPreview ? (
            <NetpayPreviewSummary preview={preview} />
          ) : (
            <Stack spacing={1}>
              <SummaryRow
                label="Subtotal de la cuenta"
                value={formatCurrency(previewSubtotal)}
              />

              <SummaryRow
                label="Promociones"
                value={formatDiscountCurrency(previewPromotionDiscountTotal)}
              />

              <SummaryRow
                label="Descuento manual"
                value={formatDiscountCurrency(previewManualDiscountTotal)}
              />

              <SummaryRow
                label="Descuento total"
                value={formatDiscountCurrency(previewDiscountTotal)}
              />

              <Divider sx={{ my: 0.5 }} />

              <SummaryRow
                label="Neto validado"
                value={formatCurrency(previewTaxableAmount)}
              />

              <SummaryRow
                label="Propina validada"
                value={formatCurrency(previewTip)}
              />

              <SummaryRow
                label="Base gravable"
                value={formatCurrency(previewTaxBase)}
              />

              <SummaryRow
                label="Impuesto incluido"
                value={formatCurrency(previewTaxTotal)}
              />

              <SummaryRow
                label="Total validado"
                value={formatCurrency(previewFinalTotal)}
                strong
              />

              <SummaryRow
                label="Suma de pagos"
                value={formatCurrency(previewSumPayments)}
              />

              <SummaryRow
                label="Cambio"
                value={formatCurrency(previewTotalChange)}
              />
            </Stack>
          )}

          {hasPreview ? (
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
                {isNetpayPreview
                  ? "Vista previa NetPay validada por Clic Menu"
                  : "Vista previa validada"}
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 13,
                  color: "text.secondary",
                  lineHeight: 1.5,
                }}
              >
                {isNetpayPreview
                  ? "Los importes mostrados fueron calculados y validados por Clic Menu. React únicamente presenta la información recibida del Backend y no recalcula el importe que será enviado a NetPay."
                  : "Se validaron los importes de la cuenta, los descuentos, la propina, el impuesto incluido, la suma de pagos y el cambio."}
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
                Impuesto seleccionado:{" "}
                <Box
                  component="span"
                  sx={{
                    fontWeight: 800,
                    color: "text.primary",
                  }}
                >
                  {selectedTaxLabel}
                </Box>
                . Genera la vista previa para conocer y validar el total final de esta cuenta.
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function NetpayPreviewSummary({ preview }) {
  const hasPurchaseAmount = hasField(preview, "purchase_amount");
  const hasTip = hasField(preview, "tip");
  const hasMaxTip = hasField(preview, "max_tip_allowed");
  const hasTaxKind = hasField(preview, "tax_kind");
  const hasTaxRate = hasField(preview, "tax_rate");
  const hasTaxBase = hasField(preview, "tax_base");
  const hasTaxTotal = hasField(preview, "tax_total");
  const hasExpectedTotal = hasField(preview, "expected_total");
  const hasPreviewValid = Object.prototype.hasOwnProperty.call(preview, "preview_valid");

  return (
    <Stack spacing={1}>
      {hasPurchaseAmount ? (
        <SummaryRow
          label="Importe de compra"
          value={formatCurrency(preview.purchase_amount)}
        />
      ) : null}

      {hasTip ? (
        <SummaryRow
          label="Propina"
          value={formatCurrency(preview.tip)}
        />
      ) : null}

      {hasMaxTip ? (
        <SummaryRow
          label="Propina máxima permitida"
          value={formatCurrency(preview.max_tip_allowed)}
        />
      ) : null}

      {(hasPurchaseAmount || hasTip || hasMaxTip) &&
      (hasTaxKind || hasTaxRate || hasTaxBase || hasTaxTotal) ? (
        <Divider sx={{ my: 0.5 }} />
      ) : null}

      {hasTaxKind ? (
        <SummaryRow
          label="Tipo de impuesto"
          value={String(preview.tax_kind)}
        />
      ) : null}

      {hasTaxRate ? (
        <SummaryRow
          label="Tasa de impuesto"
          value={formatTaxRate(preview.tax_rate)}
        />
      ) : null}

      {hasTaxBase ? (
        <SummaryRow
          label="Base gravable"
          value={formatCurrency(preview.tax_base)}
        />
      ) : null}

      {hasTaxTotal ? (
        <SummaryRow
          label="Impuesto incluido"
          value={formatCurrency(preview.tax_total)}
        />
      ) : null}

      {hasExpectedTotal ? (
        <>
          <Divider sx={{ my: 0.5 }} />

          <SummaryRow
            label="Total esperado NetPay"
            value={formatCurrency(preview.expected_total)}
            strong
          />
        </>
      ) : null}

      {hasPreviewValid ? (
        <SummaryRow
          label="Validación"
          value={preview.preview_valid ? "Validada" : "No validada"}
        />
      ) : null}
    </Stack>
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

function hasField(object, field) {
  if (!object || typeof object !== "object") return false;
  if (!Object.prototype.hasOwnProperty.call(object, field)) return false;

  const value = object[field];

  return value !== null &&
    value !== undefined &&
    value !== "";
}

function toNumber(value, fallback = 0) {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : fallback;
}

function formatTaxRate(value) {
  const rate = Number(value);

  if (!Number.isFinite(rate)) return String(value ?? "");

  const percentage = Math.abs(rate) <= 1
    ? rate * 100
    : rate;

  return `${percentage.toLocaleString("es-MX", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  })}%`;
}

function formatDiscountCurrency(value) {
  const amount = Math.abs(toNumber(value));

  if (amount <= 0) return formatCurrency(0);

  return `-${formatCurrency(amount)}`;
}

function formatCurrency(value) {
  const safe = toNumber(value);

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