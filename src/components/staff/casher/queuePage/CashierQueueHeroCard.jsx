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
import PointOfSaleRoundedIcon from "@mui/icons-material/PointOfSaleRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import AddShoppingCartRoundedIcon from "@mui/icons-material/AddShoppingCartRounded";

export default function CashierQueueHeroCard({
  cashSession,
  availableCount = 0,
  myCount = 0,
  myTotal = 0,
  syncing = false,
  onBack,
  onGoHistory,
  onGoCustomers,
  onNewDirectOrder,
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
            direction={{ xs: "column", lg: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", lg: "center" }}
            spacing={2}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: { xs: 28, md: 40 },
                  fontWeight: 800,
                  color: "text.primary",
                  lineHeight: 1.06,
                }}
              >
                Tablero de cobro
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
                Toma ventas disponibles, revisa las que ya están asignadas a tu
                caja y continúa con el flujo de cobro sin salir de esta vista.
              </Typography>
            </Box>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems="center"
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              <Chip
                icon={<PointOfSaleRoundedIcon />}
                label={syncing ? "Sincronizando…" : "Caja activa"}
                sx={{
                  fontWeight: 800,
                  bgcolor: syncing ? "#FFF4D9" : "#E7F8EB",
                  color: syncing ? "#8A6D3B" : "#0A7A2F",
                }}
              />

              <Button
                variant="outlined"
                color="inherit"
                startIcon={<ArrowBackRoundedIcon />}
                onClick={onBack}
                sx={{
                  fontWeight: 800,
                  borderRadius: 2,
                  height: 40,
                  px: 3,
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                Regresar
              </Button>
            </Stack>
          </Stack>

          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              backgroundColor: "#FCFCFC",
              p: 2,
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="space-between"
            >
              <InfoItem
                label="Caja activa"
                value={
                  cashSession?.cash_register_id
                    ? `#${cashSession.cash_register_id}`
                    : "—"
                }
              />

              <InfoItem label="Estado" value={cashSession?.status || "—"} />

              <InfoItem
                label="Abierta desde"
                value={formatDateTime(cashSession?.opened_at)}
              />
            </Stack>
          </Box>

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "repeat(1, minmax(0, 1fr))",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
              },
            }}
          >
            <MetricCard
              icon={<ReceiptLongRoundedIcon />}
              label="Ventas disponibles"
              value={String(availableCount)}
              helper="Pendientes por tomar"
            />

            <MetricCard
              icon={<AssignmentTurnedInRoundedIcon />}
              label="Mis ventas"
              value={String(myCount)}
              helper="Tomadas por esta caja"
            />

            <MetricCard
              icon={<PaymentsRoundedIcon />}
              label="Total en mis ventas"
              value={formatCurrency(myTotal)}
              helper="Monto pendiente de cobrar"
            />
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems="center"
            sx={{ width: "100%" }}
          >
            <Button
              variant="contained"
              startIcon={<AddShoppingCartRoundedIcon />}
              onClick={onNewDirectOrder}
              sx={{
                fontWeight: 800,
                borderRadius: 2,
                height: 40,
                px: 3,
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Nueva venta directa
            </Button>

            <Button
              variant="outlined"
              color="inherit"
              startIcon={<HistoryRoundedIcon />}
              onClick={onGoHistory}
              sx={{
                fontWeight: 800,
                borderRadius: 2,
                height: 40,
                px: 3,
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Ver historial
            </Button>

            <Button
              variant="outlined"
              color="inherit"
              startIcon={<PeopleRoundedIcon />}
              onClick={onGoCustomers}
              sx={{
                fontWeight: 800,
                borderRadius: 2,
                height: 40,
                px: 3,
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Clientes
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function InfoItem({ label, value }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 800,
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          mt: 0.5,
          fontSize: 15,
          fontWeight: 800,
          color: "text.primary",
          wordBreak: "break-word",
        }}
      >
        {value || "—"}
      </Typography>
    </Box>
  );
}

function MetricCard({ icon, label, value, helper }) {
  return (
    <Box
      sx={{
        minHeight: 122,
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
            fontSize: { xs: 26, sm: 30 },
            fontWeight: 800,
            color: "text.primary",
            lineHeight: 1,
          }}
        >
          {value}
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