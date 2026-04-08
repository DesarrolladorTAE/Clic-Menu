import { Card, Grid, Stack, Typography } from "@mui/material";

export default function InventoryMovementSummaryCards({ items = [] }) {
  const total = items.length;
  const entradas = items.filter((x) => x.type === "IN").length;
  const salidas = items.filter((x) => x.type === "OUT").length;
  const ajustes = items.filter((x) => x.type === "ADJUST").length;

  const cards = [
    { label: "Movimientos", value: total },
    { label: "Entradas", value: entradas },
    { label: "Salidas", value: salidas },
    { label: "Ajustes", value: ajustes },
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
