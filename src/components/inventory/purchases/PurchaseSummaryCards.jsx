import { Card, Grid, Stack, Typography } from "@mui/material";

export default function PurchaseSummaryCards({ items = [] }) {
  const total = items.length;
  const draft = items.filter((x) => x.status === "draft").length;
  const completed = items.filter((x) => x.status === "completed").length;
  const totalAmount = items.reduce(
    (acc, item) => acc + Number(item.total_amount || 0),
    0
  );

  const cards = [
    { label: "Compras", value: total },
    { label: "Draft", value: draft },
    { label: "Completadas", value: completed },
    {
      label: "Monto total",
      value: totalAmount.toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
      }),
    },
  ];

  return (
    <Grid container spacing={2}>
      {cards.map((card) => (
        <Grid item xs={12} sm={6} md={3} key={card.label}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 1,
              boxShadow: "none",
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "#fff",
            }}
          >
            <Stack spacing={0.5} sx={{ p: 2 }}>
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: 0.35,
                }}
              >
                {card.label}
              </Typography>

              <Typography
                sx={{
                  fontSize: card.label === "Monto total" ? 22 : 28,
                  fontWeight: 800,
                  color: "text.primary",
                  lineHeight: 1.1,
                }}
              >
                {card.value}
              </Typography>
            </Stack>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
