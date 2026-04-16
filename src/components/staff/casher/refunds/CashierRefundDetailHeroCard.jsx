import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import TableRestaurantRoundedIcon from "@mui/icons-material/TableRestaurantRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";

export default function CashierRefundDetailHeroCard({
  summary,
  onBack,
}) {
  const sale = summary?.sale || null;
  const order = summary?.order || null;
  const customer = summary?.customer || null;

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
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: { xs: 28, md: 40 },
                  fontWeight: 800,
                  color: "text.primary",
                  lineHeight: 1.06,
                }}
              >
                Detalle histórico de venta
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  color: "text.secondary",
                  fontSize: { xs: 14, md: 16 },
                  lineHeight: 1.55,
                  maxWidth: 820,
                }}
              >
                Revisa ticket, cliente y devoluciones aplicadas. Desde aquí puedes
                gestionar refunds sobre el saldo disponible de la venta.
              </Typography>
            </Box>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.25}
              sx={{ width: { xs: "100%", md: "auto" } }}
            >
              <Button
                variant="outlined"
                color="inherit"
                onClick={onBack}
                startIcon={<ArrowBackRoundedIcon />}
                sx={{
                  minWidth: { xs: "100%", md: 200 },
                  height: 44,
                  borderRadius: 2,
                  fontWeight: 800,
                }}
              >
                Volver al historial
              </Button>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip
              label={`Estado venta: ${getRefundStatusLabel(sale?.status)}`}
              size="small"
              sx={{
                fontWeight: 800,
                bgcolor:
                  sale?.status === "refunded"
                    ? "#F5F5F5"
                    : sale?.status === "partially_refunded"
                    ? "#FFF4D9"
                    : "#E7F8EB",
                color:
                  sale?.status === "refunded"
                    ? "#444"
                    : sale?.status === "partially_refunded"
                    ? "#8A6D3B"
                    : "#0A7A2F",
              }}
            />
            <Chip
              label={`Estado orden: ${getOrderStatusLabel(order?.status)}`}
              size="small"
            />
          </Stack>

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "repeat(1, minmax(0, 1fr))",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(4, minmax(0, 1fr))",
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
              helper={customer?.phone || "—"}
            />

            <MetricCard
              icon={<TableRestaurantRoundedIcon />}
              label="Folio"
              value={summary?.ticket?.folio || "Sin ticket"}
              helper={sale?.paid_at ? formatDateTime(sale.paid_at) : "—"}
            />

            <MetricCard
              icon={<ReplayRoundedIcon />}
              label="Disponible a devolver"
              value={formatCurrency(sale?.available_to_refund)}
              helper={`Devuelto ${formatCurrency(sale?.refunded_total)}`}
            />
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip label={`Subtotal ${formatCurrency(sale?.subtotal)}`} size="small" />
            <Chip
              label={`Descuento ${formatCurrency(sale?.discount_total)}`}
              size="small"
            />
            <Chip label={`Propina ${formatCurrency(sale?.tip)}`} size="small" />
            <Chip
              label={`Total ${formatCurrency(sale?.total)}`}
              size="small"
              sx={{
                fontWeight: 800,
                bgcolor: "#FFF3E0",
                color: "#A75A00",
              }}
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
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
        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 800,
            color: "text.primary",
            lineHeight: 1.15,
            wordBreak: "break-word",
          }}
        >
          {value || "—"}
        </Typography>

        <Typography
          sx={{
            mt: 0.75,
            fontSize: 13,
            color: "text.secondary",
          }}
        >
          {helper}
        </Typography>
      </Box>
    </Box>
  );
}

function getRefundStatusLabel(status) {
  switch (String(status || "").toLowerCase()) {
    case "paid":
      return "Pagada";
    case "partially_refunded":
      return "Parcialmente devuelta";
    case "refunded":
      return "Devuelta";
    default:
      return status || "—";
  }
}

function getOrderStatusLabel(status) {
  switch (String(status || "").toLowerCase()) {
    case "open":
      return "Abierta";
    case "ready":
      return "Lista";
    case "paying":
      return "En cobro";
    case "paid":
      return "Pagada";
    case "cancelled":
      return "Cancelada";
    default:
      return status || "—";
  }
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