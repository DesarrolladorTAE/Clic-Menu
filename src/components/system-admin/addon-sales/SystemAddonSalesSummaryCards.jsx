import React from "react";
import { Box, Card, Stack, Typography } from "@mui/material";

import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";

function money(value, currency = "MXN") {
  const n = Number(value || 0);

  return n.toLocaleString("es-MX", {
    style: "currency",
    currency,
  });
}

export default function SystemAddonSalesSummaryCards({ summary }) {
  const currency = summary?.currency || "MXN";
  const monthsPaid = Number(summary?.months_paid || 0);
  const monthsGranted = Number(summary?.months_granted || 0);
  const internalMonths = Number(summary?.internal_months_granted || 0);

  return (
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
        caption="Importe comercial registrado en el periodo"
      />

      <SummaryCard
        icon={<ReceiptLongRoundedIcon />}
        title="Ventas"
        value={summary?.payment_count || 0}
        caption={`${monthsPaid} meses pagados · ${monthsGranted} meses otorgados`}
      />

      <SummaryCard
        icon={<TrendingUpRoundedIcon />}
        title="Promedio"
        value={money(summary?.average_sale, currency)}
        caption="Promedio de los movimientos comerciales"
      />

      <SummaryCard
        icon={<AdminPanelSettingsRoundedIcon />}
        title="Accesos internos"
        value={summary?.internal_count || 0}
        caption={`${internalMonths} meses otorgados para uso interno`}
      />
    </Box>
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
        <Stack spacing={1.5} sx={{ height: "100%", justifyContent: "space-between" }}>
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
            <Typography sx={{ fontSize: 14, color: "text.secondary", fontWeight: 800 }}>
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

            <Typography sx={{ mt: 0.9, fontSize: 13, color: "text.secondary", lineHeight: 1.45 }}>
              {caption}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Card>
  );
}