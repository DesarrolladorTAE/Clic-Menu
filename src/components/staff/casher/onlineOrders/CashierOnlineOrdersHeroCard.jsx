// src/components/staff/casher/onlineOrders/CashierOnlineOrdersHeroCard.jsx
import React from "react";
import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import PointOfSaleRoundedIcon from "@mui/icons-material/PointOfSaleRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";

import { formatCurrency } from "./onlineOrderDisplay";

export default function CashierOnlineOrdersHeroCard({
  availableCount = 0,
  myCount = 0,
  myTotal = 0,
}) {
  const theme = useTheme();

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
                Pedidos en línea
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  maxWidth: 820,
                  color: "text.secondary",
                  fontSize: { xs: 14, md: 16 },
                  lineHeight: 1.55,
                }}
              >
                Revisa los pedidos disponibles, administra los asignados a tu caja y continúa cada pedido según su estado.
              </Typography>
            </Box>

            <Chip
              icon={<PointOfSaleRoundedIcon />}
              label="Caja activa"
              sx={{
                fontWeight: 800,
                bgcolor: alpha(theme.palette.success.main, 0.12),
                color: "success.dark",
              }}
            />
          </Stack>

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
              },
            }}
          >
            <MetricCard
              icon={<ShoppingBagRoundedIcon />}
              label="Pedidos disponibles"
              value={String(availableCount)}
              helper="Pendientes por atender o tomar"
            />

            <MetricCard
              icon={<AssignmentTurnedInRoundedIcon />}
              label="Mis pedidos"
              value={String(myCount)}
              helper="Asignados a esta caja"
            />

            <MetricCard
              icon={<PaymentsRoundedIcon />}
              label="Total en mis pedidos"
              value={formatCurrency(myTotal)}
              helper="Importe de pedidos en gestión"
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function MetricCard({ icon, label, value, helper }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: 122,
        p: 2,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        backgroundColor: "background.paper",
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
            flexShrink: 0,
            borderRadius: 1,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
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
            wordBreak: "break-word",
          }}
        >
          {value}
        </Typography>

        <Typography sx={{ mt: 0.75, fontSize: 13, color: "text.secondary" }}>
          {helper}
        </Typography>
      </Box>
    </Box>
  );
}