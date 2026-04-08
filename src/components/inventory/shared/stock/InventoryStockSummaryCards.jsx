import { Card, Grid, Stack, Typography } from "@mui/material";

export default function InventoryStockSummaryCards({ items = [] }) {
  const total = items.length;
  const withStock = items.filter((x) => Number(x.on_hand || 0) > 0).length;
  const withoutStock = items.filter((x) => Number(x.on_hand || 0) <= 0).length;
  const active = items.filter((x) => {
    const entity = x.ingredient || x.product;
    return entity?.status === "active";
  }).length;

  const cards = [
    { label: "Registros", value: total },
    { label: "Con existencia", value: withStock },
    { label: "Sin existencia", value: withoutStock },
    { label: "Activos", value: active },
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
                  fontSize: 28,
                  fontWeight: 800,
                  color: "text.primary",
                  lineHeight: 1,
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
