import { Box, Paper, Stack, Typography } from "@mui/material";

export default function DiscountsInstructionsCard() {
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
          text="La configuración de descuentos se guarda por sucursal. Primero selecciona la sucursal que deseas editar."
        />

        <InstructionRow
          step="2"
          text="La política define el porcentaje y monto máximo que caja puede aplicar sin autorización."
        />

        <InstructionRow
          step="3"
          text="Si un descuento excede los límites, puedes bloquearlo o pedir autorización con PIN."
        />

        <InstructionRow
          step="4"
          text="En autorizadores podrás definir qué usuarios tendrán permiso para aprobar descuentos excedidos."
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
