import { Box, Paper, Stack, Typography } from "@mui/material";

export default function CatalogInstructionsCard() {
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
          text="Selecciona la sucursal que deseas administrar para visualizar únicamente su catálogo."
        />

        <InstructionRow
          step="2"
          text="Aquí decides qué productos se usan o no en la sucursal, sin necesidad de recargar manualmente la vista."
        />

        <InstructionRow
          step="3"
          text="Si un producto está inactivo a nivel general, primero debes activarlo en Administrar productos."
        />

        <InstructionRow
          step="4"
          text="La tabla muestra el estado efectivo del producto en la sucursal, considerando la lógica global o branch."
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
