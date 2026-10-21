import { Stack, Typography } from "@mui/material";

export default function BranchSettingsHeader() {
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
        Configuración
      </Typography>

      <Typography
        sx={{
          color: "text.secondary",
          fontSize: { xs: 14, md: 17 },
          lineHeight: 1.6,
        }}
      >
        Define cómo trabajará cada sucursal y cómo se realizarán sus ventas.
      </Typography>
    </Stack>
  );
}