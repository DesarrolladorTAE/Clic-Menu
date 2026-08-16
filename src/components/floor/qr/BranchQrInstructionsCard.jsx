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
              ? "En modo directo puedes crear una Vista general, Pedidos por WhatsApp y Pedidos en línea. El QR de mesa no se utiliza en este modo."
              : "Puedes crear una Vista general o un QR de mesa. El QR de mesa queda vinculado únicamente a la mesa seleccionada."
          }
        />

        <InstructionRow
          step="3"
          text={
            readonlyByChannelAllowed
              ? "Pedidos por WhatsApp y Pedidos en línea funcionan sin mesa vinculada. También puedes crear un QR de Canal específico para otros canales de venta."
              : "Pedidos por WhatsApp y Pedidos en línea funcionan sin mesa vinculada."
          }
        />

        <InstructionRow
          step="4"
          text="Cada código QR se administra de forma individual y conserva el tipo, canal y contexto para el que fue creado."
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