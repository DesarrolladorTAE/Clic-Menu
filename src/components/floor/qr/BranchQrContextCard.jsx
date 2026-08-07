import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import QrCode2OutlinedIcon from "@mui/icons-material/QrCode2Outlined";
import TableRestaurantOutlinedIcon from "@mui/icons-material/TableRestaurantOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import SettingsSuggestOutlinedIcon from "@mui/icons-material/SettingsSuggestOutlined";

const ORDERING_MODE_LABELS = {
  waiter_only: "Solo mesero",
  customer_assisted: "Cliente asistido",
};

export default function BranchQrContextCard({
  selectedBranch,
  contextData,
  qrUiMeta = null,
}) {
  const isDirectAttentionMode =
    contextData?.isDirectAttentionMode || qrUiMeta?.attention_mode === "direct";

  const readonlyByChannelAllowed =
    contextData?.qrReadonlyByChannelAllowed ||
    !!qrUiMeta?.qr_readonly_by_channel_allowed;

  const readonlyByChannelBlockedReason =
    contextData?.qrReadonlyByChannelBlockedReason ||
    qrUiMeta?.qr_readonly_by_channel_blocked_reason ||
    "Disponible desde Plan Gestión.";

  const tableContext = isDirectAttentionMode
    ? {
        title: "QR físico general",
        value: "Sin mesa vinculada",
        chipLabel: "Modo directo",
        chipColor: "warning",
      }
    : {
        title: "Mesas disponibles",
        value: `${contextData?.totalTables || 0} mesa(s)`,
        chipLabel: "Sucursal",
        chipColor: "success",
      };

  const channelContext = {
    value: readonlyByChannelAllowed
      ? `${contextData?.totalSpecificChannels || 0} canal(es) disponible(s)`
      : "No disponible con el plan actual",
    chipLabel: readonlyByChannelAllowed
      ? "Canal específico"
      : "Limitado por plan",
    chipColor: readonlyByChannelAllowed ? "success" : "warning",
  };

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
      <Stack spacing={2}>
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 800,
            color: "text.primary",
          }}
        >
          Contexto actual
        </Typography>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          useFlexGap
          flexWrap="wrap"
        >
          <ContextMiniCard
            icon={<QrCode2OutlinedIcon fontSize="small" />}
            title="QRs registrados"
            value={`${contextData?.totalQrs || 0} QR(s)`}
            chipLabel={contextData?.totalQrs ? "Con datos" : "Vacío"}
            chipColor={contextData?.totalQrs ? "primary" : "default"}
          />

          <ContextMiniCard
            icon={<TableRestaurantOutlinedIcon fontSize="small" />}
            title={tableContext.title}
            value={tableContext.value}
            chipLabel={tableContext.chipLabel}
            chipColor={tableContext.chipColor}
          />

          <ContextMiniCard
            icon={<CampaignOutlinedIcon fontSize="small" />}
            title="Canales específicos"
            value={channelContext.value}
            chipLabel={channelContext.chipLabel}
            chipColor={channelContext.chipColor}
          />

          <ContextMiniCard
            icon={<SettingsSuggestOutlinedIcon fontSize="small" />}
            title="Administración QR"
            value="Activación individual por código"
            chipLabel={
              isDirectAttentionMode
                ? "Modo directo"
                : ORDERING_MODE_LABELS[contextData?.orderingMode] || "Configurado"
            }
            chipColor={isDirectAttentionMode ? "warning" : "primary"}
          />

        </Stack>

        <Typography
          sx={{
            fontSize: 13,
            color: "text.secondary",
            lineHeight: 1.6,
          }}
        >
          {selectedBranch?.name
            ? isDirectAttentionMode
              ? `La administración de QRs se aplicará únicamente a ${selectedBranch.name}. En modo directo no se permite crear ni activar QRs ligados a una mesa.`
              : `La configuración y administración de códigos QR se aplicará únicamente a ${selectedBranch.name}.`
            : "Selecciona una sucursal para continuar."}
        </Typography>

        {!readonlyByChannelAllowed ? (
          <Typography
            sx={{
              fontSize: 12,
              color: "#8A5A00",
              lineHeight: 1.5,
              fontWeight: 700,
            }}
          >
            Pedidos por WhatsApp sigue disponible. La opción Canal específico no está disponible con el plan actual.{" "}
            {readonlyByChannelBlockedReason}
          </Typography>
        ) : null}
      </Stack>
    </Paper>
  );
}

function ContextMiniCard({ icon, title, value, chipLabel, chipColor = "default" }) {
  return (
    <Box
      sx={{
        flex: "1 1 240px",
        minWidth: 220,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        p: 1.75,
        backgroundColor: "background.default",
      }}
    >
      <Stack spacing={1}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1.5,
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(255, 152, 0, 0.12)",
              color: "primary.main",
            }}
          >
            {icon}
          </Box>

          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 800,
              color: "text.primary",
            }}
          >
            {title}
          </Typography>
        </Stack>

        <Typography
          sx={{
            fontSize: 14,
            color: "text.primary",
            lineHeight: 1.45,
            minHeight: 42,
          }}
        >
          {value}
        </Typography>

        <Box>
          <Chip
            label={chipLabel}
            size="small"
            color={chipColor}
            variant={chipColor === "default" ? "outlined" : "filled"}
          />
        </Box>
      </Stack>
    </Box>
  );
}