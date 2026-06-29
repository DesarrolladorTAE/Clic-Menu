import { Box, Paper, Stack, Typography } from "@mui/material";

export default function TaecontaInstructionsCard({ isConnected = false }) {
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
          text="Captura el correo y la contraseña de la cuenta Taeconta que se usará para consultar la información fiscal del restaurante."
        />

        <InstructionRow
          step="2"
          text={
            isConnected
              ? "La cuenta ya está vinculada. Si actualizas las credenciales, el sistema volverá a validar la conexión."
              : "Al guardar, el sistema intentará iniciar sesión en Taeconta y sincronizará los datos fiscales si las credenciales son correctas."
          }
        />

        <InstructionRow
          step="3"
          text="Los datos fiscales obtenidos son solo de lectura. No se editan desde Clic Menu porque provienen directamente de Taeconta."
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