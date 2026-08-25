import { Box, Paper, Stack, Typography } from "@mui/material";

export default function NetpayInstructionsCard() {
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
          text="Las terminales aparecen automáticamente cuando un cajero utiliza Clic Menu desde una PAX compatible con NetPay."
        />

        <InstructionRow
          step="2"
          text="Puedes asignar un nombre para identificar cada terminal, cambiar su sucursal y definir si estará activa."
        />

        <InstructionRow
          step="3"
          text="Una terminal desactivada permanecerá registrada, pero no estará disponible para realizar cobros con NetPay."
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