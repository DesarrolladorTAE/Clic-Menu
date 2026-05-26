import React from "react";
import {
  Box, Card, CardContent, Chip, Dialog, DialogContent, DialogTitle, Divider, IconButton, Stack, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import TableRestaurantRoundedIcon from "@mui/icons-material/TableRestaurantRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";

export default function CashierRefundSaleDetailDialog({
  open = false,
  onClose,
  summary = null,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const sale = summary?.sale || null;
  const order = summary?.order || null;
  const ticket = summary?.ticket || null;
  const customer = summary?.customer || null;
  const contactData = summary?.contact_data || null;
  const refunds = Array.isArray(summary?.refunds) ? summary.refunds : [];

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 1 },
          overflow: "hidden",
          backgroundColor: "background.paper",
          boxShadow: "none",
          border: "1px solid",
          borderColor: "divider",
        },
      }}
    >
      <DialogTitle
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          bgcolor: "#111111",
          color: "#fff",
        }}
      >
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 1.5,
                display: "grid",
                placeItems: "center",
                bgcolor: "primary.main",
                color: "#fff",
              }}
            >
              <ReceiptLongRoundedIcon />
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: { xs: 20, sm: 24 }, color: "#fff" }}>
                Detalle de venta
              </Typography>
              <Typography sx={{ mt: 0.5, fontSize: 13, color: "rgba(255,255,255,0.82)" }}>
                Consulta información general, cliente, ticket y totales.
              </Typography>
            </Box>
          </Stack>

          <IconButton
            onClick={onClose}
            sx={{
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.08)",
              borderRadius: 1,
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: "background.default" }}>
        <Stack spacing={2.5}>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(4, minmax(0, 1fr))",
              },
            }}
          >
            <MetricCard
              icon={<ReceiptLongRoundedIcon />}
              label="Venta"
              value={`#${sale?.id || "—"}`}
              helper={`Orden #${order?.id || "—"}`}
            />

            <MetricCard
              icon={<PersonRoundedIcon />}
              label="Cliente"
              value={customer?.name_alias || "Sin cliente formal"}
              helper={customer?.phone || contactData?.phone || "—"}
            />

            <MetricCard
              icon={<TableRestaurantRoundedIcon />}
              label="Ticket"
              value={ticket?.folio || "Sin ticket"}
              helper={sale?.paid_at ? formatDateTime(sale.paid_at) : "—"}
            />

            <MetricCard
              icon={<ReplayRoundedIcon />}
              label="Disponible"
              value={formatCurrency(sale?.available_to_refund)}
              helper={`Devuelto ${formatCurrency(sale?.refunded_total)}`}
            />
          </Box>

          <Card sx={cardSx}>
            <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Stack spacing={2}>
                <Typography sx={sectionTitleSx}>Resumen histórico</Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip label={`Venta #${sale?.id || "—"}`} size="small" />
                  <Chip label={`Orden #${order?.id || "—"}`} size="small" />
                  <Chip label={ticket?.folio ? `Folio ${ticket.folio}` : "Sin ticket"} size="small" />
                  <Chip label={`Devoluciones ${refunds.length}`} size="small" />
                </Stack>

                <Stack spacing={1}>
                  <SummaryRow label="Subtotal" value={formatCurrency(sale?.subtotal)} />
                  <SummaryRow label="Descuento" value={formatCurrency(sale?.discount_total)} />
                  <SummaryRow label="Propina" value={formatCurrency(sale?.tip)} />
                  <SummaryRow label="Total cobrado" value={formatCurrency(sale?.total)} strong />
                  <Divider />
                  <SummaryRow label="Devuelto acumulado" value={formatCurrency(sale?.refunded_total)} />
                  <SummaryRow label="Disponible para devolución" value={formatCurrency(sale?.available_to_refund)} strong />
                </Stack>

                <Divider />

                <Box>
                  <Typography sx={sectionTitleSx}>Cliente y contacto</Typography>

                  <Stack spacing={1}>
                    <SummaryRow label="Cliente formal" value={customer?.name_alias || "No asociado"} />
                    <SummaryRow label="Teléfono" value={customer?.phone || contactData?.phone || "—"} />
                    <SummaryRow label="Correo" value={customer?.email || contactData?.email || "—"} />
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

function MetricCard({ icon, label, value, helper }) {
  return (
    <Box
      sx={{
        minHeight: 116,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        backgroundColor: "#fff",
        p: 2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1,
            bgcolor: "rgba(255, 152, 0, 0.10)",
            color: "primary.main",
            display: "grid",
            placeItems: "center",
          }}
        >
          {icon}
        </Box>

        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 800,
            color: "text.secondary",
            textTransform: "uppercase",
            letterSpacing: 0.3,
          }}
        >
          {label}
        </Typography>
      </Stack>

      <Box sx={{ mt: 2 }}>
        <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
          {value || "—"}
        </Typography>
        <Typography sx={{ mt: 0.75, fontSize: 13, color: "text.secondary" }}>
          {helper || "—"}
        </Typography>
      </Box>
    </Box>
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

const cardSx = {
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1,
  boxShadow: "none",
  backgroundColor: "background.paper",
};

const sectionTitleSx = {
  fontSize: 20,
  fontWeight: 800,
  color: "text.primary",
};

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

function formatDateTime(value) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}