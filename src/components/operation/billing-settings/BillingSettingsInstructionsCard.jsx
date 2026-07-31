import { Box, Paper, Stack, Typography } from "@mui/material";

export default function BillingSettingsInstructionsCard() {
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
        <Typography sx={{ fontSize: 16, fontWeight: 800, color: "text.primary" }}>
          Antes de comenzar
        </Typography>

        <InstructionRow
          step="1"
          text="La configuración se guarda por sucursal. Primero selecciona la sucursal que deseas administrar."
        />

        <InstructionRow
          step="2"
          text="El límite máximo controla cuántas cuentas o partes pueden existir dentro de un mismo grupo de cobro."
        />

        <InstructionRow
          step="3"
          text="Los autorizadores operativos pueden aprobar acciones sensibles, como reabrir una cuenta o juntar mesas de distintos meseros."
        />

        <InstructionRow
          step="4"
          text="El PIN operativo es independiente del PIN utilizado para autorizar descuentos excedidos."
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

      <Typography sx={{ fontSize: 14, color: "text.primary", lineHeight: 1.6 }}>
        {text}
      </Typography>
    </Stack>
  );
}
