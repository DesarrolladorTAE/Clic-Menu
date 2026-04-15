import { Box, Paper, Stack, Typography } from "@mui/material";

export default function CustomerLoyaltySettingsInstructionsCard() {
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
          text="Esta configuración se guarda por restaurante, no por sucursal. Afectará el cálculo de puntos en todas las ventas del restaurante."
        />

        <InstructionRow
          step="2"
          text="Solo las ventas con cliente formal asociado acumulan puntos. Un contacto simple no participa en el programa."
        />

        <InstructionRow
          step="3"
          text="Los puntos se calculan al cobrar una venta pagada y pueden revertirse automáticamente si después se hace un refund."
        />

        <InstructionRow
          step="4"
          text="La vista previa te ayuda a revisar cuántos puntos generaría una venta ejemplo antes de guardar la configuración."
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
