// src/components/staff/casher/ticket/CashierTicketPreviewCard.jsx
import React from "react";
import {
  Alert, Box, Card, CardContent, Divider, Stack, Typography,
} from "@mui/material";

import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

function InfoRow({ label, value, highlight = false }) {
  const resolvedValue =
    value === null ||
    value === undefined ||
    value === ""
      ? "—"
      : value;

  return (
    <Stack
      direction="row"
      alignItems="flex-start"
      justifyContent="space-between"
      spacing={1.5}
    >
      <Typography
        sx={{
          minWidth: 0,
          pr: 1,
          fontSize: 14,
          color: "text.secondary",
          fontWeight: 700,
          lineHeight: 1.4,
          wordBreak: "break-word",
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          flexShrink: 0,
          fontSize: 14,
          color: highlight ? "primary.main" : "text.primary",
          fontWeight: highlight ? 900 : 800,
          textAlign: "right",
          lineHeight: 1.4,
          whiteSpace: "nowrap",
        }}
      >
        {resolvedValue}
      </Typography>
    </Stack>
  );
}

export default function CashierTicketPreviewCard({
  ticket,
  sale,
  order,
  table,
  settlement = null,
  ticketWarning = false,
  ticketErrorCode = null,
  ticketErrorMessage = null,
}) {
  const subtotal = Number(
    sale?.subtotal ?? 0
  );

  const promotionDiscountTotal = Number(
    sale?.promotion_discount_total ?? 0
  );

  const manualDiscountTotal = Number(
    sale?.manual_discount_total ?? 0
  );

  const discountTotal = Number(
    sale?.discount_total ?? 0
  );

  const netTotal = Number(
    sale?.net_total ??
      sale?.taxable_amount ??
      0
  );

  const tip = Number(
    sale?.tip ?? 0
  );

  const total = Number(
    sale?.payable_total ??
      sale?.total ??
      0
  );

  const saleIdentifier = Number(
    sale?.sale_id ??
      sale?.id ??
      0
  );

  const showDiscountBreakdown =
    discountTotal > 0 ||
    promotionDiscountTotal > 0 ||
    manualDiscountTotal > 0;

  const hasTicket = Boolean(ticket?.id);

  const normalizedSettlement =
    settlement?.settlement ??
    settlement ??
    null;

  const paymentCompleted =
    normalizedSettlement?.completed === true;

  const paymentPartiallyCompleted =
    normalizedSettlement?.partially_paid === true ||
    normalizedSettlement?.completed === false;

  const pendingChecksCount = Math.max(
    Number(
      normalizedSettlement?.pending_checks_count ??
        0
    ),
    0
  );

  const orderCheckId = Number(
    normalizedSettlement?.order_check_id ??
      sale?.order_check_id ??
      0
  );

  const paymentResultTitle = paymentCompleted
    ? "Última cuenta pagada"
    : "Cuenta pagada correctamente";

  const paymentResultMessage = paymentCompleted
    ? "El paquete quedó finalizado."
    : paymentPartiallyCompleted
    ? formatPendingChecksMessage(pendingChecksCount)
    : "El cobro de la cuenta fue registrado correctamente.";

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
            direction="row"
            spacing={1.5}
            alignItems="center"
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                bgcolor: hasTicket
                  ? "primary.main"
                  : "warning.main",
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {hasTicket ? (
                <ReceiptLongIcon />
              ) : (
                <WarningAmberRoundedIcon />
              )}
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: 21,
                  fontWeight: 800,
                  color: "text.primary",
                  lineHeight: 1.1,
                }}
              >
                {paymentResultTitle}
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 14,
                  color: "text.secondary",
                  lineHeight: 1.5,
                }}
              >
                {paymentResultMessage}
              </Typography>

              <Typography
                sx={{
                  mt: 0.35,
                  fontSize: 13,
                  color: "text.secondary",
                  lineHeight: 1.5,
                }}
              >
                {hasTicket
                  ? "El ticket de esta cuenta está listo para consultarse, imprimirse o descargarse."
                  : "El cobro se confirmó, pero el ticket no está disponible en este momento."}
              </Typography>
            </Box>
          </Stack>

          {ticketWarning ? (
            <Alert
              severity="warning"
              sx={{
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
                alignItems: "flex-start",
              }}
            >
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 800,
                  mb: 0.5,
                }}
              >
                Aviso del ticket
              </Typography>

              <Typography
                sx={{
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                {ticketErrorMessage ||
                  "La cuenta fue cobrada correctamente, pero ocurrió un problema con el ticket."}
              </Typography>

              {ticketErrorCode ? (
                <Typography
                  sx={{
                    mt: 0.75,
                    fontSize: 12,
                    color: "text.secondary",
                    fontWeight: 700,
                  }}
                >
                  Código: {ticketErrorCode}
                </Typography>
              ) : null}
            </Alert>
          ) : null}

          <Box
            sx={{
              p: { xs: 1.75, sm: 2 },
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.default",
            }}
          >
            <Stack spacing={1.5}>
              <Stack spacing={1.1}>
                <InfoRow
                  label="Folio"
                  value={ticket?.folio}
                  highlight={hasTicket}
                />

                <InfoRow
                  label="OrderCheck ID"
                  value={
                    orderCheckId > 0
                      ? `#${orderCheckId}`
                      : "—"
                  }
                />

                <InfoRow
                  label="Sale ID"
                  value={
                    saleIdentifier > 0
                      ? `#${saleIdentifier}`
                      : "—"
                  }
                />

                <InfoRow
                  label="Ticket ID"
                  value={
                    ticket?.id
                      ? `#${ticket.id}`
                      : "—"
                  }
                />

                <InfoRow
                  label="Orden"
                  value={
                    order?.id
                      ? `#${order.id}`
                      : "—"
                  }
                />

                <InfoRow
                  label="Mesa"
                  value={table?.name || "Sin mesa"}
                />

                {normalizedSettlement ? (
                  <>
                    <InfoRow
                      label="Estado del paquete"
                      value={
                        paymentCompleted
                          ? "Finalizado"
                          : paymentPartiallyCompleted
                          ? "Pago parcial"
                          : "—"
                      }
                    />

                    <InfoRow
                      label="Cuentas pendientes"
                      value={String(
                        pendingChecksCount
                      )}
                    />
                  </>
                ) : null}
              </Stack>

              <Divider />

              <Stack spacing={1.1}>
                <InfoRow
                  label="Subtotal bruto"
                  value={formatCurrency(subtotal)}
                />

                {showDiscountBreakdown ? (
                  <>
                    <InfoRow
                      label="Promociones aplicadas"
                      value={formatDiscountCurrency(
                        promotionDiscountTotal
                      )}
                    />

                    <InfoRow
                      label="Descuentos manuales"
                      value={formatDiscountCurrency(
                        manualDiscountTotal
                      )}
                    />
                  </>
                ) : null}

                <InfoRow
                  label="Neto antes de propina"
                  value={formatCurrency(netTotal)}
                />

                <InfoRow
                  label="Propina"
                  value={formatCurrency(tip)}
                />

                <Divider />

                <InfoRow
                  label="Total cobrado de esta cuenta"
                  value={formatCurrency(total)}
                  highlight
                />
              </Stack>
            </Stack>
          </Box>

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
              Este ticket corresponde únicamente a la cuenta pagada y a la
              Sale{" "}
              <Box
                component="span"
                sx={{
                  fontWeight: 800,
                  color: "text.primary",
                }}
              >
                {saleIdentifier > 0
                  ? `#${saleIdentifier}`
                  : "seleccionada"}
              </Box>
              . No incorpora los importes de otras cuentas del paquete.
            </Typography>
          </Box>

          <Divider />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.25}
            alignItems={{
              xs: "flex-start",
              sm: "center",
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <CheckCircleRoundedIcon
                sx={{
                  color:
                    hasTicket &&
                    ticket?.html_available
                      ? "success.main"
                      : "text.disabled",
                  fontSize: 20,
                }}
              />

              <Typography
                sx={{
                  fontSize: 13,
                  color: "text.secondary",
                  fontWeight: 700,
                }}
              >
                HTML disponible:{" "}
                {ticket?.html_available
                  ? "Sí"
                  : "No"}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <CheckCircleRoundedIcon
                sx={{
                  color:
                    hasTicket &&
                    ticket?.pdf_available
                      ? "success.main"
                      : "text.disabled",
                  fontSize: 20,
                }}
              />

              <Typography
                sx={{
                  fontSize: 13,
                  color: "text.secondary",
                  fontWeight: 700,
                }}
              >
                PDF disponible:{" "}
                {ticket?.pdf_available
                  ? "Sí"
                  : "No"}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function formatPendingChecksMessage(count) {
  const safeCount = Math.max(
    Number(count || 0),
    0
  );

  if (safeCount === 1) {
    return "Queda 1 cuenta pendiente.";
  }

  return `Quedan ${safeCount} cuentas pendientes.`;
}

function formatDiscountCurrency(value) {
  const amount = Math.abs(
    Number(value || 0)
  );

  if (amount <= 0) {
    return formatCurrency(0);
  }

  return `-${formatCurrency(amount)}`;
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