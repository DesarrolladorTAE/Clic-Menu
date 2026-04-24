import { Box, Paper, Stack, Typography } from "@mui/material";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";

export default function SalesReportSummary({ summary, paymentBreakdown }) {
  const paymentTotal = Array.isArray(paymentBreakdown)
    ? paymentBreakdown.length
    : 0;

  const cards = [
    {
      label: "Ventas totales",
      value: money(summary?.sales_total),
      icon: <MonetizationOnOutlinedIcon />,
    },
    {
      label: "Tickets",
      value: summary?.tickets_count ?? 0,
      icon: <ReceiptLongOutlinedIcon />,
    },
    {
      label: "Ticket promedio",
      value: money(summary?.ticket_average),
      icon: <MonetizationOnOutlinedIcon />,
    },
    {
      label: "Métodos de pago",
      value: paymentTotal,
      icon: <CreditCardRoundedIcon />,
    },
  ];

  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} flexWrap="wrap">
      {cards.map((card) => (
        <Paper
          key={card.label}
          sx={{
            flex: { xs: "1 1 100%", md: "1 1 190px" },
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
