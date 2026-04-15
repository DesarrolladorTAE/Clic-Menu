import { Box, Button, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function PlansHeader({
  restaurantId,
  totalPlans = 0,
  onBack,
}) {
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
          Planes del restaurante
        </Typography>

        <Typography
          sx={{
            color: "text.secondary",
            fontSize: { xs: 14, md: 17 },
            lineHeight: 1.6,
          }}
        >
          Elige el plan que mejor se adapte a tu operación. Aquí puedes revisar la
          información del restaurante{" "}
          <Box component="span" sx={{ color: "primary.main", fontWeight: 800 }}>
            #{restaurantId}
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
          borderRadius: 2,
          fontWeight: 800,
        }}
      >
        Volver
      </Button>
    </Stack>
  );
}