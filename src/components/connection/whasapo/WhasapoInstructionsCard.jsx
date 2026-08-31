import { Box, Paper, Stack, Typography } from "@mui/material";

export default function WhasapoInstructionsCard() {
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
          text="La configuración de Whasapo se guarda por sucursal. Primero selecciona la sucursal que deseas configurar."
        />

        <InstructionRow
          step="2"
          text="Si no utilizas un token personalizado, los tickets se enviarán utilizando la conexión principal de WhatsApp configurada en el sistema."
        />

        <InstructionRow
          step="3"
          text="Si activas el token personalizado, la sucursal utilizará su propia conexión de Whasapo para el envío de tickets."
        />

        <InstructionRow
          step="4"
          text="El token debe corresponder a una conexión válida de Whasapo. Si la sesión se desconecta, deberás volver a vincularla desde tu cuenta de Whasapo."
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