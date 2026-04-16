import React from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

export default function CashierRefundSummaryCard({
  summary,
}) {
  const sale = summary?.sale || null;
  const order = summary?.order || null;
  const ticket = summary?.ticket || null;
  const customer = summary?.customer || null;
  const contactData = summary?.contact_data || null;
  const refunds = Array.isArray(summary?.refunds) ? summary.refunds : [];

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
            Resumen histórico
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip label={`Venta #${sale?.id || "—"}`} size="small" />
            <Chip label={`Orden #${order?.id || "—"}`} size="small" />
            <Chip
              label={ticket?.folio ? `Folio ${ticket.folio}` : "Sin ticket"}
              size="small"
            />
            <Chip label={`Refunds ${refunds.length}`} size="small" />
          </Stack>

          <Stack spacing={1}>
            <SummaryRow label="Subtotal" value={formatCurrency(sale?.subtotal)} />
            <SummaryRow
              label="Descuento"
              value={formatCurrency(sale?.discount_total)}
            />
            <SummaryRow label="Propina" value={formatCurrency(sale?.tip)} />
            <SummaryRow label="Total cobrado" value={formatCurrency(sale?.total)} />
            <Divider />
            <SummaryRow
              label="Refundado acumulado"
              value={formatCurrency(sale?.refunded_total)}
            />
            <SummaryRow
              label="Disponible para refund"
              value={formatCurrency(sale?.available_to_refund)}
              strong
            />
          </Stack>

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
              Cliente y contacto
            </Typography>

            <Stack spacing={1}>
              <SummaryRow
                label="Cliente formal"
                value={customer?.name_alias || "No asociado"}
              />
              <SummaryRow
                label="Teléfono"
                value={customer?.phone || contactData?.phone || "—"}
              />
              <SummaryRow
                label="Correo"
                value={customer?.email || contactData?.email || "—"}
              />
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
              Esta vista es de postventa. El ticket original permanece como snapshot
              histórico y el refund no reabre operación, mesa ni sesión.
            </Typography>
          </Box>
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
        {value || "—"}
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
