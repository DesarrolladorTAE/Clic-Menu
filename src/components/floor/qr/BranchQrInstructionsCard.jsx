import { Box, Paper, Stack, Typography } from "@mui/material";

export default function BranchQrInstructionsCard({ qrUiMeta = null }) {
  const isDirectAttentionMode = qrUiMeta?.attention_mode === "direct";
  const readonlyByChannelAllowed = !!qrUiMeta?.qr_readonly_by_channel_allowed;

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
          text={
            isDirectAttentionMode
              ? "En modo directo solo puedes crear QR físico general, sin mesa vinculada."
              : "Los QRs físicos pueden ser generales o ligarse a una mesa. Los web y delivery siempre se generan sin mesa."
          }
        />

        <InstructionRow
          step="3"
          text={
            readonlyByChannelAllowed
              ? "Web y Delivery estarán disponibles como QRs de solo lectura por canal cuando el plan y canal seleccionado lo permitan."
              : "Web y Delivery pueden no estar disponibles si el plan actual no permite QRs de solo lectura por canal."
          }
        />

        <InstructionRow
          step="4"
          text={
            isDirectAttentionMode
              ? "Los QRs físicos ligados a mesa que ya existan pueden aparecer bloqueados y no podrán reactivarse mientras siga activo el modo directo."
              : "Si la Configuración Operativa no existe o el QR está desactivado en la sucursal, no podrás crear nuevos códigos."
          }
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