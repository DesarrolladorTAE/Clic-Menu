import { Box, Paper, Stack, Typography } from "@mui/material";

export default function TicketSettingsInstructionsCard() {
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
          text="La configuración del ticket se guarda por sucursal. Primero selecciona la sucursal que deseas editar."
        />

        <InstructionRow
          step="2"
          text="Si activas logo, el ticket usará el logo activo de esa sucursal. Si no existe logo activo, simplemente no se mostrará."
        />

        <InstructionRow
          step="3"
          text="Si activas QR, el sistema intentará usar el QR activo de la sucursal para mostrar el menú en el ticket."
        />

        <InstructionRow
          step="4"
          text="El folio se genera automáticamente al cobrar. Aquí solo defines el formato visual del folio, no el consecutivo real."
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
