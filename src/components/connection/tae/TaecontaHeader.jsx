import { Box, Chip, Stack, Typography } from "@mui/material";

export default function TaecontaHeader({ restaurant, isConnected = false }) {
  return (
    <Stack spacing={2.5}>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", lg: "center" }}
        spacing={2}
      >
        <Box>
          <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap">
            <Typography
              sx={{
                fontSize: { xs: 30, md: 42 },
                fontWeight: 800,
                color: "text.primary",
                lineHeight: 1.1,
              }}
            >
              Conexión con Taeconta
            </Typography>

            <Chip
              label={isConnected ? "Conectado" : "Sin conexión"}
              size="small"
              color={isConnected ? "success" : "default"}
              variant={isConnected ? "filled" : "outlined"}
            />
          </Stack>

          <Typography
            sx={{
              mt: 1,
              color: "text.secondary",
              fontSize: { xs: 14, md: 17 },
              lineHeight: 1.55,
            }}
          >
            Vincula{" "}
            <Box component="span" sx={{ color: "primary.main", fontWeight: 800 }}>
              {restaurant?.trade_name || "este restaurante"}
            </Box>{" "}
            con Taeconta para consultar los datos fiscales y preparar la
            auto-facturación desde Clic Menu.
          </Typography>
        </Box>
      </Stack>
    </Stack>
  );
}