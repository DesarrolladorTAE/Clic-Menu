import { Box, Paper, Stack, Typography } from "@mui/material";

export default function PublicMenuInstructionsCard() {
  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 1,
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
      }}
    >
      <Stack spacing={1.25}>
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 800,
            color: "text.primary",
          }}
        >
          Antes de comenzar
        </Typography>

        <InstructionRow
          step="1"
          text="Esta configuración se guarda por sucursal. Primero selecciona la sucursal que deseas personalizar."
        />

        <InstructionRow
          step="2"
          text="El logo se toma del logo activo de la sucursal. Aquí configurarás portada, color, redes sociales y galería."
        />

        <InstructionRow
          step="3"
          text="La portada debe ser horizontal para evitar recortes incómodos en el menú del cliente."
        />

        <InstructionRow
          step="4"
          text="La galería se mostrará como carrusel únicamente con las imágenes activas."
        />
      </Stack>
    </Paper>
  );
}

function InstructionRow({ step, text }) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Box
        sx={{
          minWidth: 28,
          height: 28,
          borderRadius: 999,
          bgcolor: "primary.main",
          color: "#fff",
          display: "grid",
          placeItems: "center",
          fontSize: 13,
          fontWeight: 800,
        }}
      >
        {step}
      </Box>

      <Typography
        sx={{
          fontSize: 14,
          color: "text.primary",
          lineHeight: 1.6,
        }}
      >
        {text}
      </Typography>
    </Stack>
  );
}