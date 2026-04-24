import { Box, Paper, Stack, Typography } from "@mui/material";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import PercentRoundedIcon from "@mui/icons-material/PercentRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

export default function ProfitReportSummary({ summary }) {
  const cards = [
    {
      label: "Ingreso total",
      value: money(summary?.income_total),
      icon: <MonetizationOnOutlinedIcon />,
    },
    {
      label: "Costo total",
      value: money(summary?.cost_total),
      icon: <Inventory2OutlinedIcon />,
    },
    {
      label: "Utilidad total",
      value: money(summary?.profit_total),
      icon: <TrendingUpRoundedIcon />,
    },
    {
      label: "Margen %",
      value: percent(summary?.margin_percent),
      icon: <PercentRoundedIcon />,
    },
    {
      label: "Ítems",
      value: summary?.items_count ?? 0,
      icon: <Inventory2OutlinedIcon />,
    },
  ];

  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} flexWrap="wrap">
      {cards.map((card) => (
        <Paper
          key={card.label}
          sx={{
            flex: { xs: "1 1 100%", md: "1 1 170px" },
            p: 2,
            borderRadius: 1,
            backgroundColor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "none",
          }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                bgcolor: "rgba(255, 152, 0, 0.12)",
                color: "primary.main",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              {card.icon}
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: 12,
                  color: "text.secondary",
                  fontWeight: 700,
                }}
              >
                {card.label}
              </Typography>

              <Typography
                sx={{
                  mt: 0.25,
                  fontSize: 18,
                  color: "text.primary",
                  fontWeight: 900,
                  wordBreak: "break-word",
                }}
              >
                {card.value}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}

function money(value) {
  const raw = String(value ?? "").replace(/[$,\s]/g, "");
  const number = Number(raw || 0);

  return number.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function percent(value) {
  const raw = String(value ?? "").replace(/[%\s]/g, "");
  const number = Number(raw || 0);

  return `${number.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}
