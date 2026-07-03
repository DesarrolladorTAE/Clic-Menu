import { Box, Button, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function SubscriptionHistoryHeader({
  restaurant,
  restaurantId,
  onBack,
}) {
  const restaurantName = restaurant?.trade_name || `Restaurante #${restaurantId}`;

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", md: "center" }}
      spacing={2}
    >
      <Stack spacing={1.25} sx={{ flex: 1 }}>
        <Typography
          sx={{
            fontSize: { xs: 30, md: 42 },
            fontWeight: 800,
            color: "text.primary",
            lineHeight: 1.1,
          }}
        >
          Historial de suscripciones
        </Typography>

        <Typography
          sx={{
            color: "text.secondary",
            fontSize: { xs: 14, md: 17 },
            lineHeight: 1.6,
          }}
        >
          Consulta pagos, renovaciones futuras y vigencias del restaurante{" "}
          <Box component="span" sx={{ color: "primary.main", fontWeight: 800 }}>
            {restaurantName}
          </Box>
        </Typography>
      </Stack>

      <Button
        onClick={onBack}
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        sx={{
          minWidth: { xs: "100%", sm: 150 },
          height: 44,
          fontWeight: 800,
        }}
      >
        Volver
      </Button>
    </Stack>
  );
}
