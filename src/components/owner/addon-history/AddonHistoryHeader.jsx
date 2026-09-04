import { Box, Button, Stack, Typography } from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExtensionRoundedIcon from "@mui/icons-material/ExtensionRounded";

export default function AddonHistoryHeader({
  restaurant,
  restaurantId,
  onBack,
}) {
  const restaurantName = restaurant?.trade_name || `Restaurante #${restaurantId}`;

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "stretch", md: "center" }}
      spacing={2}
    >
      <Stack spacing={1.25} sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            sx={{
              width: { xs: 42, sm: 48 },
              height: { xs: 42, sm: 48 },
              borderRadius: 1,
              display: "grid",
              placeItems: "center",
              bgcolor: "primary.main",
              color: "#fff",
              flexShrink: 0,
            }}
          >
            <ExtensionRoundedIcon sx={{ fontSize: { xs: 25, sm: 29 } }} />
          </Box>

          <Typography
            sx={{
              fontSize: { xs: 30, md: 42 },
              fontWeight: 800,
              color: "text.primary",
              lineHeight: 1.1,
            }}
          >
            Complementos del restaurante
          </Typography>
        </Stack>

        <Typography
          sx={{
            color: "text.secondary",
            fontSize: { xs: 14, md: 17 },
            lineHeight: 1.6,
          }}
        >
          Consulta tus complementos vigentes, opciones disponibles e historial para{" "}
          <Box component="span" sx={{ color: "primary.main", fontWeight: 800 }}>
            {restaurantName}
          </Box>
        </Typography>
      </Stack>

      <Button
        type="button"
        onClick={onBack}
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        sx={{
          minWidth: { xs: "100%", sm: 150 },
          height: 44,
          fontWeight: 800,
          flexShrink: 0,
        }}
      >
        Volver
      </Button>
    </Stack>
  );
}