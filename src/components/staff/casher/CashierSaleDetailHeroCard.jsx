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

export default function CashierSaleDetailHeroCard({
  sale,
  cashSession,
  onBack,
}) {
  const order = sale?.order || null;
  const table = sale?.table || null;

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
                Cobrar venta
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
                Revisa el detalle de la orden, agrega los pagos, valida la vista
                previa y confirma el cobro cuando todo esté correcto.
              </Typography>
            </Box>

            <Button
              variant="outlined"
              color="inherit"
              onClick={onBack}
              startIcon={<ArrowBackRoundedIcon />}
              sx={{
                minWidth: { xs: "100%", md: 170 },
                height: 44,
                borderRadius: 2,
                fontWeight: 800,
              }}
            >
              Volver al tablero
            </Button>
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
              value={`#${sale?.sale_id || "—"}`}
              helper={`Orden #${order?.id || "—"}`}
            />

            <MetricCard
              icon={<PersonRoundedIcon />}
              label="Cliente"
              value={order?.customer_name?.trim() || "Cliente sin nombre"}
              helper={order?.status || "—"}
            />

            <MetricCard
              icon={<TableRestaurantRoundedIcon />}
              label="Mesa"
              value={table?.name || "Sin mesa"}
              helper={table?.status || "—"}
            />

            <MetricCard
              icon={<ReceiptLongRoundedIcon />}
              label="Caja activa"
              value={cashSession?.cash_register_id ? `#${cashSession.cash_register_id}` : "—"}
              helper={cashSession?.status || "—"}
            />
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip
              label={`Subtotal ${formatCurrency(sale?.subtotal)}`}
              size="small"
            />
            <Chip
              label={`Descuento ${formatCurrency(sale?.discount_total)}`}
              size="small"
            />
            <Chip
              label={`Propina ${formatCurrency(sale?.tip)}`}
              size="small"
            />
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
