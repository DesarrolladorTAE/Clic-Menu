import { Box, Paper, Stack, Typography } from "@mui/material";

function formatMoney(value, currency = "MXN") {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency || "MXN",
  }).format(Number(value || 0));
}

export default function AddonHistorySummary({ summary }) {
  const data = summary || {};
  const currency = data.currency || "MXN";

  const cards = [
    {
      title: "Movimientos",
      value: Number(data.total_records || 0),
      helper: "Activaciones y renovaciones",
    },
    {
      title: "Compras",
      value: Number(data.payment_count || 0),
      helper: "Movimientos comerciales",
    },
    {
      title: "Accesos internos",
      value: Number(data.internal_count || 0),
      helper: "Asignaciones sin cobro",
    },
    {
      title: "Total pagado",
      value: formatMoney(data.total_paid, currency),
      helper: "Importe comercial registrado",
    },
    {
      title: "Promedio",
      value: formatMoney(data.average_payment, currency),
      helper: "Promedio por compra",
    },
    {
      title: "Meses pagados",
      value: Number(data.months_paid || 0),
      helper: "Meses cobrados",
    },
    {
      title: "Meses otorgados",
      value: Number(data.months_granted || 0),
      helper: "Vigencia comercial otorgada",
    },
    {
      title: "Meses internos",
      value: Number(data.internal_months_granted || 0),
      helper: "Vigencia interna otorgada",
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
          <Typography sx={{ fontSize: 18, fontWeight: 900, color: "text.primary" }}>
            Resumen
          </Typography>

          <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary", lineHeight: 1.5 }}>
            Vista general de los movimientos de complementos del periodo seleccionado.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(4, minmax(0, 1fr))",
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
                width: "100%",
                minHeight: 112,
                height: "100%",
                border: "1px solid",
                borderColor: "divider",
                borderLeft: "4px solid",
                borderLeftColor: "primary.main",
                borderRadius: 1,
                backgroundColor: "background.default",
              }}
            >
              <Stack spacing={0.75} sx={{ height: "100%", justifyContent: "space-between" }}>
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
                    fontSize: { xs: 21, sm: 22 },
                    fontWeight: 900,
                    color: "text.primary",
                    lineHeight: 1.1,
                    wordBreak: "break-word",
                  }}
                >
                  {card.value}
                </Typography>

                <Typography sx={{ fontSize: 12, color: "text.secondary", lineHeight: 1.4 }}>
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