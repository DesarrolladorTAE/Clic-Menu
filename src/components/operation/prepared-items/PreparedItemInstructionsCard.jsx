import { Box, Paper, Stack, Typography } from "@mui/material";

export default function PreparedItemInstructionsCard() {
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
          text="Selecciona la sucursal que deseas configurar. Cada sucursal conserva su propia configuración."
        />

        <InstructionRow
          step="2"
          text="Define el tiempo general durante el cual un producto preparado puede mantenerse disponible para una nueva operación."
        />

        <InstructionRow
          step="3"
          text="Activa únicamente los productos que realmente puedan ofrecerse nuevamente después de haber sido preparados."
        />

        <InstructionRow
          step="4"
          text="Si un producto necesita un tiempo diferente, puedes asignarle un tiempo particular sin modificar la configuración general."
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