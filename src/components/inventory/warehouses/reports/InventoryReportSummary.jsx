import { Box, Paper, Stack, Typography } from "@mui/material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";

export default function InventoryReportSummary({
  summary,
  stockBreakdown,
  costBreakdown,
}) {
  const cards = [
    {
      label: "Valor total inventario",
      value: money(summary?.inventory_total_value),
      icon: <MonetizationOnOutlinedIcon />,
    },
    {
      label: "Total items",
      value: summary?.total_items ?? 0,
      icon: <Inventory2OutlinedIcon />,
    },
    {
      label: "Ingredientes",
      value: summary?.ingredients_count ?? 0,
      icon: <Inventory2OutlinedIcon />,
    },
    {
      label: "Productos",
      value: summary?.products_count ?? 0,
      icon: <Inventory2OutlinedIcon />,
    },
    {
      label: "Sin costo",
      value: costBreakdown?.sin_costo ?? 0,
      icon: <WarningAmberRoundedIcon />,
    },
    {
      label: "Negativos",
      value: stockBreakdown?.negativo ?? 0,
      icon: <WarningAmberRoundedIcon />,
    },
  ];

  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} flexWrap="wrap">
      {cards.map((card) => (
        <Paper
          key={card.label}
          sx={{
            flex: { xs: "1 1 100%", md: "1 1 160px" },
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
  const number = Number(value || 0);

  return number.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}