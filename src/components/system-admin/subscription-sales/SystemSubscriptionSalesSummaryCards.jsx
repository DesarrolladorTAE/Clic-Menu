import React from "react";
import { Box, Card, Chip, Paper, Stack, Typography } from "@mui/material";

import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import StarsRoundedIcon from "@mui/icons-material/StarsRounded";

function money(value, currency = "MXN") {
  const n = Number(value || 0);

  return n.toLocaleString("es-MX", {
    style: "currency",
    currency,
  });
}

function statusLabel(status) {
  if (status === "trialing") return "Demo / prueba";
  if (status === "active") return "Activas";
  if (status === "expired") return "Expiradas";
  if (status === "cancelled") return "Canceladas";
  if (status === "pending_payment") return "Pendientes";
  return status || "Sin estatus";
}

function typeLabel(type) {
  if (type === "demo") return "Demo";
  if (type === "normal") return "Normal";
  if (type === "paid") return "Pagadas";
  if (type === "internal") return "Internas";
  return type || "Sin tipo";
}

export default function SystemSubscriptionSalesSummaryCards({
  summary,
  byType = [],
  byPlan = [],
  byStatus = [],
  byProvider = [],
}) {
  const currency = summary?.currency || "MXN";

  return (
    <Stack spacing={3} sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
          gap: 2.5,
          width: "100%",
        }}
      >
        <SummaryCard
          icon={<PaymentsRoundedIcon />}
          title="Ventas totales"
          value={money(summary?.total_sales, currency)}
          caption="Importe registrado en el periodo"
        />

        <SummaryCard
          icon={<ReceiptLongRoundedIcon />}
          title="Suscripciones"
          value={summary?.total_records || 0}
          caption="Total de registros del periodo"
        />

        <SummaryCard
          icon={<TrendingUpRoundedIcon />}
          title="Promedio"
          value={money(summary?.average_sale, currency)}
          caption="Promedio de suscripciones pagadas"
        />

        <SummaryCard
          icon={<StarsRoundedIcon />}
          title="Demos"
          value={summary?.demo_count || 0}
          caption="Planes de prueba registrados"
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
          gap: 2.5,
          width: "100%",
        }}
      >
        <BreakdownCard
          title="Registros por tipo"
          rows={byType.map((item) => ({
            label: typeLabel(item?.type),
            value: money(item?.total_sales, currency),
            chip: `${item?.total_subscriptions || 0}`,
          }))}
        />

        <BreakdownCard
          title="Ventas por plan"
          rows={byPlan.map((item) => ({
            label: item?.plan?.name || "Sin plan",
            value: money(item?.total_sales, currency),
            chip: `${item?.total_subscriptions || 0}`,
          }))}
        />

        <BreakdownCard
          title="Ventas por estatus"
          rows={byStatus.map((item) => ({
            label: statusLabel(item?.status),
            value: money(item?.total_sales, currency),
            chip: `${item?.total_subscriptions || 0}`,
          }))}
        />

        <BreakdownCard
          title="Ventas por proveedor"
          rows={byProvider.map((item) => ({
            label: item?.provider || "Sin proveedor",
            value: money(item?.total_sales, currency),
            chip: `${item?.total_subscriptions || 0}`,
          }))}
        />
      </Box>
    </Stack>
  );
}

function SummaryCard({ icon, title, value, caption }) {
  return (
    <Card
      sx={{
        width: "100%",
        height: "100%",
        minHeight: 190,
        borderRadius: 1,
        boxShadow: "none",
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
      }}
    >
      <Box sx={{ height: "100%", p: { xs: 2.2, sm: 2.5 } }}>
        <Stack
          spacing={1.5}
          sx={{
            height: "100%",
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 1.5,
              bgcolor: "primary.main",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              "& svg": { fontSize: 28 },
            }}
          >
            {icon}
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 14,
                color: "text.secondary",
                fontWeight: 800,
              }}
            >
              {title}
            </Typography>

            <Typography
              sx={{
                mt: 0.4,
                fontSize: { xs: 26, md: 28 },
                fontWeight: 900,
                color: "text.primary",
                lineHeight: 1.05,
                wordBreak: "break-word",
              }}
            >
              {value}
            </Typography>

            <Typography
              sx={{
                mt: 0.9,
                fontSize: 13,
                color: "text.secondary",
                lineHeight: 1.45,
              }}
            >
              {caption}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Card>
  );
}

function BreakdownCard({ title, rows }) {
  return (
    <Paper
      sx={{
        width: "100%",
        p: 0,
        overflow: "hidden",
        borderRadius: 1,
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
        height: "100%",
        minHeight: 260,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 1.8,
          borderBottom: "1px solid",
          borderColor: "divider",
          backgroundColor: "primary.main",
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: 18, md: 19 },
            fontWeight: 900,
            color: "#fff",
            letterSpacing: 0.2,
          }}
        >
          {title}
        </Typography>
      </Box>

      <Stack
        spacing={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          flex: 1,
        }}
      >
        {rows.length === 0 ? (
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            Sin información para mostrar.
          </Typography>
        ) : (
          rows.map((row, index) => (
            <Stack
              key={`${row.label}-${index}`}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
              sx={{
                py: 1.25,
                borderBottom:
                  index < rows.length - 1 ? "1px solid" : "none",
                borderColor: "divider",
                minWidth: 0,
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1.2}
                sx={{ minWidth: 0 }}
              >
                <Chip
                  label={row.chip}
                  size="small"
                  sx={{
                    fontWeight: 800,
                    minWidth: 42,
                    flexShrink: 0,
                  }}
                />

                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "text.primary",
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={row.label}
                >
                  {row.label}
                </Typography>
              </Stack>

              <Typography
                sx={{
                  fontSize: 14,
                  color: "text.secondary",
                  fontWeight: 800,
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                {row.value}
              </Typography>
            </Stack>
          ))
        )}
      </Stack>
    </Paper>
  );
}