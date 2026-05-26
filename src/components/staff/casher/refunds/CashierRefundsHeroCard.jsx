// src/components/staff/casher/refunds/CashierRefundsHeroCard.jsx
import React from "react";
import {
  Box, Card, CardContent, Chip, Stack, Typography,
} from "@mui/material";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

export default function CashierRefundsHeroCard({
  syncing = false,
  rows = [],
}) {
  const paidCount = rows.filter((row) => String(row?.status) === "paid").length;
  const refundedCount = rows.filter(
    (row) => String(row?.status) === "refunded"
  ).length;

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
                Historial / Postventa
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
                Consulta ventas cobradas, revisa cancelaciones aplicadas y abre el
                detalle histórico de cada operación.
              </Typography>
            </Box>

            <Chip
              icon={<HistoryRoundedIcon />}
              label={syncing ? "Sincronizando…" : "Vista histórica"}
              sx={{
                fontWeight: 800,
                bgcolor: syncing ? "#FFF4D9" : "#E7F8EB",
                color: syncing ? "#8A6D3B" : "#0A7A2F",
              }}
            />
          </Stack>

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "repeat(1, minmax(0, 1fr))",
                md: "repeat(2, minmax(0, 1fr))",
              },
            }}
          >
            <MetricCard
              icon={<ReceiptLongRoundedIcon />}
              label="Ventas pagadas"
              value={String(paidCount)}
              helper="Disponibles para cancelación total"
            />

            <MetricCard
              icon={<CheckCircleRoundedIcon />}
              label="Canceladas / devueltas"
              value={String(refundedCount)}
              helper="Solo consulta histórica"
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
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