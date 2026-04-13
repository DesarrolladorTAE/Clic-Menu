import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import QrCode2OutlinedIcon from "@mui/icons-material/QrCode2Outlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";

export default function TicketSettingsContextCard({
  selectedBranch,
  ticketData,
}) {
  const logoContext = ticketData?.logo_context || {};
  const folioCounter = ticketData?.folio_counter || {};
  const ticketSetting = ticketData?.ticket_setting || {};

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
            icon={<ImageOutlinedIcon fontSize="small" />}
            title="Logo activo"
            value={logoContext?.has_active_logo ? "Disponible" : "No configurado"}
            chipLabel={logoContext?.has_active_logo ? "Listo" : "Pendiente"}
            chipColor={logoContext?.has_active_logo ? "success" : "default"}
          />

          <ContextMiniCard
            icon={<QrCode2OutlinedIcon fontSize="small" />}
            title="QR ticket"
            value={ticketSetting?.show_qr ? "Se mostrará si existe QR activo" : "Oculto"}
            chipLabel={ticketSetting?.show_qr ? "Activo" : "Oculto"}
            chipColor={ticketSetting?.show_qr ? "success" : "default"}
          />

          <ContextMiniCard
            icon={<ConfirmationNumberOutlinedIcon fontSize="small" />}
            title="Último folio"
            value={`#${folioCounter?.last_number ?? 0}`}
            chipLabel={ticketSetting?.folio_mode === "pattern" ? "Pattern" : "Secuencial"}
            chipColor="primary"
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
            ? `La configuración que guardes se aplicará únicamente a ${selectedBranch.name}.`
            : "Selecciona una sucursal para continuar."}
        </Typography>
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
