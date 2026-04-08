import { Card, Grid, Stack, Typography } from "@mui/material";

export default function PurchaseMetaCard({ purchase }) {
  const items = [
    { label: "Sucursal", value: purchase?.branch?.name || "—" },
    { label: "Proveedor", value: purchase?.supplier?.name || "Sin proveedor" },
    { label: "Almacén", value: purchase?.warehouse?.name || "Pendiente" },
    { label: "Fecha", value: purchase?.purchase_date || "—" },
    { label: "Creado por", value: purchase?.created_by?.name || "Sistema" },
    {
      label: "Completado por",
      value: purchase?.completed_by?.name || "Pendiente",
    },
  ];

  return (
    <Grid container spacing={2}>
      {items.map((item) => (
        <Grid item xs={12} sm={6} md={4} key={item.label}>
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
                {item.label}
              </Typography>

              <Typography
                sx={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: "text.primary",
                  lineHeight: 1.35,
                }}
              >
                {item.value}
              </Typography>
            </Stack>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
