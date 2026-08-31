import { Box, Stack, Typography } from "@mui/material";

export default function WhasapoConnectionHeader({ selectedBranch }) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", md: "center" }}
      spacing={2}
    >
      <Box>
        <Typography
          sx={{
            fontSize: { xs: 30, md: 42 },
            fontWeight: 800,
            color: "text.primary",
            lineHeight: 1.1,
          }}
        >
          Conexión de Whasapo
        </Typography>

        <Typography
          sx={{
            mt: 1,
            color: "text.secondary",
            fontSize: { xs: 14, md: 17 },
            lineHeight: 1.5,
          }}
        >
          Configura la cuenta de Whasapo utilizada para enviar tickets desde{" "}
          <Box component="span" sx={{ color: "primary.main", fontWeight: 800 }}>
            {selectedBranch?.name || "la sucursal seleccionada"}
          </Box>
          .
        </Typography>
      </Box>
    </Stack>
  );
}
