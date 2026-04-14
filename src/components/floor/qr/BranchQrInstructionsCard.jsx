import { Box, Paper, Stack, Typography } from "@mui/material";

export default function BranchQrInstructionsCard() {
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
          text="Selecciona la sucursal que deseas administrar para ver únicamente sus códigos QR."
        />

        <InstructionRow
          step="2"
          text="Los QRs físicos pueden ser generales o ligarse a una mesa. Los web y delivery siempre se generan sin mesa."
        />

        <InstructionRow
          step="3"
          text="Si la Configuración Operativa no existe o el QR está desactivado en la sucursal, no podrás crear nuevos códigos."
        />

        <InstructionRow
          step="4"
          text="Los cambios se reflejan en la vista de forma fluida, sin recargar manualmente la página."
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