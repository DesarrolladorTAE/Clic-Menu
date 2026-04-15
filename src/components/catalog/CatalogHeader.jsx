import { Box, Stack, Typography } from "@mui/material";

export default function CatalogHeader({
  selectedBranch,
  mode = "global",
  modeHelp = "",
}) {
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
        Catálogo por sucursal
      </Typography>

      <Typography
        sx={{
          color: "text.secondary",
          fontSize: { xs: 14, md: 17 },
          lineHeight: 1.6,
        }}
      >
        Administra qué productos estarán disponibles en{" "}
        <Box component="span" sx={{ color: "primary.main", fontWeight: 800 }}>
          {selectedBranch?.name || "la sucursal seleccionada"}
        </Box>
        . El modo actual del restaurante es{" "}
        <Box component="span" sx={{ color: "text.primary", fontWeight: 800 }}>
          {mode}
        </Box>
        .
      </Typography>

      {modeHelp ? (
        <Typography
          sx={{
            fontSize: 13,
            color: "text.secondary",
            lineHeight: 1.5,
          }}
        >
          {modeHelp}
        </Typography>
      ) : null}
    </Stack>
  );
}
