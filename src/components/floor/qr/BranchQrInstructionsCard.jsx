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
              ? "En modo directo puedes crear una Vista general, Pedidos por WhatsApp y, si tu plan lo permite, un QR para Canal específico. El QR de mesa no está disponible en este modo."
              : "Puedes crear una Vista general o un QR de mesa. Al elegir QR de mesa, solo tendrás que seleccionar la mesa correspondiente."
          }
        />

        <InstructionRow
          step="3"
          text={
            readonlyByChannelAllowed
              ? "Pedidos por WhatsApp está disponible sin seleccionar mesa. También puedes crear un QR de Canal específico para los canales externos disponibles en esta sucursal."
              : "Pedidos por WhatsApp está disponible sin seleccionar mesa. La opción Canal específico no está disponible con el plan actual."
          }
        />

        <InstructionRow
          step="4"
          text={
            isDirectAttentionMode
              ? "Los QRs de mesa que ya existan pueden aparecer bloqueados y no podrán reactivarse mientras la sucursal continúe en modo directo."
              : "La sucursal debe tener Configuración Operativa antes de poder crear y administrar sus códigos QR."
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