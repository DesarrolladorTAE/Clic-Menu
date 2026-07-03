import { Box, Paper, Stack, Typography } from "@mui/material";

function formatMoney(value, currency = "MXN") {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency || "MXN",
  }).format(amount);
}

export default function SubscriptionHistorySummary({ summary }) {
  const safeSummary = summary || {};

  const cards = [
    {
      title: "Total",
      value: safeSummary.total ?? 0,
      helper: "Suscripciones registradas",
    },
    {
      title: "Activas",
      value: safeSummary.currently_active_count ?? 0,
      helper: "Vigentes actualmente",
    },
    {
      title: "Pagadas",
      value: safeSummary.paid_commercial_count ?? 0,
      helper: "Planes comerciales",
    },
    {
      title: "Renovaciones",
      value: safeSummary.future_renewal_count ?? 0,
      helper: "Programadas",
    },
    {
      title: "Expiradas",
      value: safeSummary.expired_count ?? 0,
      helper: "Sin vigencia",
    },
    {
      title: "Total pagado",
      value: formatMoney(safeSummary.total_paid, safeSummary.currency),
      helper: safeSummary.currency || "MXN",
    },
  ];

  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 1,
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
      }}
    >
      <Stack spacing={2}>
        <Box>
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 900,
              color: "text.primary",
            }}
          >
            Resumen
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              fontSize: 13,
              color: "text.secondary",
              lineHeight: 1.5,
            }}
          >
            Vista general de las suscripciones registradas para este restaurante.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },
            gap: 1.5,
          }}
        >
          {cards.map((card) => (
            <Box
              key={card.title}
              sx={{
                p: 1.75,
                pl: 2,
                minHeight: 108,
                border: "1px solid",
                borderColor: "divider",
                borderLeft: "4px solid",
                borderLeftColor: "primary.main",
                borderRadius: 1,
                backgroundColor: "background.default",
              }}
            >
              <Stack
                spacing={0.75}
                sx={{
                  height: "100%",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 900,
                    color: "text.secondary",
                    textTransform: "uppercase",
                    letterSpacing: 0.3,
                    lineHeight: 1.3,
                  }}
                >
                  {card.title}
                </Typography>

                <Typography
                  sx={{
                    fontSize: {
                      xs: 21,
                      sm: 22,
                    },
                    fontWeight: 900,
                    color: "text.primary",
                    lineHeight: 1.1,
                    wordBreak: "break-word",
                  }}
                >
                  {card.value}
                </Typography>

                <Typography
                  sx={{
                    fontSize: 12,
                    color: "text.secondary",
                    lineHeight: 1.4,
                  }}
                >
                  {card.helper}
                </Typography>
              </Stack>
            </Box>
          ))}
        </Box>
      </Stack>
    </Paper>
  );
}