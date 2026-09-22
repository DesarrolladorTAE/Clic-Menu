import { Box, Stack, Typography } from "@mui/material";

export default function PreparedItemSettingsHeader({ selectedBranch }) {
  return (
    <Stack spacing={1}>
      <Typography
        sx={{
          fontSize: { xs: 30, md: 42 },
          fontWeight: 800,
          color: "text.primary",
          lineHeight: 1.1,
        }}
      >
        Preparación rápida
      </Typography>

      <Typography
        sx={{
          color: "text.secondary",
          fontSize: { xs: 14, md: 17 },
          lineHeight: 1.6,
        }}
      >
        Configura qué productos preparados pueden volver a ofrecerse en{" "}
        <Box component="span" sx={{ color: "primary.main", fontWeight: 800 }}>
          {selectedBranch?.name || "la sucursal seleccionada"}
        </Box>{" "}
        y durante cuánto tiempo pueden mantenerse disponibles.
      </Typography>

    </Stack>
  );
}