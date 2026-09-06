import {
  Box, Chip, FormControlLabel, Paper, Stack, Switch, ToggleButton, ToggleButtonGroup, Typography,
} from "@mui/material";

import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import QrCode2RoundedIcon from "@mui/icons-material/QrCode2Rounded";

function channelLabel(channel) {
  if (channel === "chatingboot") return "WhatsApp QR";
  return "Whasapo";
}

export default function WhasapoChannelPreferenceCard({
  preferredChannel,
  effectiveChannel = "whasapo",
  canChooseChannel = false,
  whasapoAvailable = false,
  addonWhatsappQrAvailable = false,
  qrConnected = false,
  reconnectRequired = false,
  usingSystemFallback = false,
  saving = false,
  disabled = false,
  hasPendingWhasapoChanges = false,
  onChangePreferredChannel,
}) {
  const manualPreference =
    preferredChannel === "whasapo" ||
    preferredChannel === "chatingboot";

  const qrAvailable =
    Boolean(addonWhatsappQrAvailable) &&
    Boolean(qrConnected);

  const switchDisabled =
    disabled ||
    saving ||
    hasPendingWhasapoChanges ||
    (!manualPreference && !canChooseChannel);

  const selectionDisabled =
    disabled ||
    saving ||
    hasPendingWhasapoChanges ||
    !canChooseChannel;

  const handleManualModeChange = (event) => {
    const checked = event.target.checked;

    if (!checked) {
      onChangePreferredChannel(null);
      return;
    }

    const initialChannel =
      effectiveChannel === "chatingboot"
        ? "chatingboot"
        : "whasapo";

    onChangePreferredChannel(initialChannel);
  };

  const handleChannelChange = (_, value) => {
    if (!value || value === preferredChannel) return;
    onChangePreferredChannel(value);
  };

  const currentExplanation = reconnectRequired
    ? "WhatsApp QR requiere volver a vincularse. Mientras tanto, los envíos utilizan la conexión principal del sistema."
    : usingSystemFallback
    ? "Actualmente los mensajes utilizan la conexión principal de WhatsApp del sistema."
    : effectiveChannel === "chatingboot"
    ? "Actualmente los mensajes de esta sucursal se envían mediante WhatsApp QR."
    : "Actualmente los mensajes de esta sucursal se envían mediante Whasapo personalizado.";

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
      <Stack spacing={2.25}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                display: "grid",
                placeItems: "center",
                bgcolor: "rgba(255, 152, 0, 0.12)",
                color: "primary.main",
                flexShrink: 0,
              }}
            >
              <SwapHorizRoundedIcon />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: 17,
                  fontWeight: 800,
                  color: "text.primary",
                }}
              >
                Canal de envío
              </Typography>

              <Typography
                sx={{
                  mt: 0.35,
                  fontSize: 13,
                  color: "text.secondary",
                  lineHeight: 1.5,
                }}
              >
                Define cómo se enviarán los mensajes de WhatsApp de esta sucursal.
              </Typography>
            </Box>
          </Stack>

          <Chip
            label={`En uso: ${channelLabel(effectiveChannel)}`}
            color={
              reconnectRequired
                ? "warning"
                : effectiveChannel === "chatingboot"
                ? "success"
                : "primary"
            }
            size="small"
            sx={{
              fontWeight: 800,
              flexShrink: 0,
            }}
          />
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              md: "repeat(2, minmax(0, 1fr))",
            },
            gap: 1.5,
            minWidth: 0,
          }}
        >
          <AvailabilityCard
            icon={<WhatsAppIcon fontSize="small" />}
            title="Whasapo personalizado"
            available={whasapoAvailable}
            availableText="Disponible"
            unavailableText="Sin token personalizado"
          />

          <AvailabilityCard
            icon={<QrCode2RoundedIcon fontSize="small" />}
            title="WhatsApp QR"
            available={qrAvailable}
            availableText="Disponible"
            unavailableText={
              addonWhatsappQrAvailable
                ? "Pendiente de conexión"
                : "Complemento no disponible"
            }
          />
        </Box>

        {canChooseChannel ? (
          <>
            <Box
              sx={{
                p: 1.75,
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "background.default",
              }}
            >
              <Stack spacing={1.5}>
                <FormControlLabel
                  sx={{ m: 0 }}
                  control={
                    <Switch
                      checked={manualPreference}
                      onChange={handleManualModeChange}
                      disabled={switchDisabled}
                      color="primary"
                    />
                  }
                  label={
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: "text.primary",
                      }}
                    >
                      Elegir un canal preferido
                    </Typography>
                  }
                />

                <Typography
                  sx={{
                    fontSize: 12,
                    color: "text.secondary",
                    lineHeight: 1.6,
                  }}
                >
                  Si está desactivado, Clic Menu seleccionará automáticamente el
                  canal disponible de acuerdo con la configuración de la sucursal.
                </Typography>

                {manualPreference ? (
                  <ToggleButtonGroup
                    exclusive
                    value={preferredChannel}
                    onChange={handleChannelChange}
                    disabled={selectionDisabled}
                    fullWidth
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, minmax(0, 1fr))",
                      },
                      gap: 1,
                      "& .MuiToggleButtonGroup-grouped": {
                        m: 0,
                        border: "1px solid !important",
                        borderColor: "divider !important",
                        borderRadius: "4px !important",
                      },
                    }}
                  >
                    <ToggleButton
                      value="whasapo"
                      disabled={!whasapoAvailable}
                      sx={toggleSx}
                    >
                      <WhatsAppIcon fontSize="small" />
                      Whasapo
                    </ToggleButton>

                    <ToggleButton
                      value="chatingboot"
                      disabled={!qrAvailable}
                      sx={toggleSx}
                    >
                      <QrCode2RoundedIcon fontSize="small" />
                      WhatsApp QR
                    </ToggleButton>
                  </ToggleButtonGroup>
                ) : null}
              </Stack>
            </Box>

            <Typography
              sx={{
                fontSize: 13,
                color: hasPendingWhasapoChanges ? "warning.dark" : "text.secondary",
                lineHeight: 1.6,
                fontWeight: hasPendingWhasapoChanges ? 700 : 400,
              }}
            >
              {hasPendingWhasapoChanges
                ? "Guarda o restablece primero los cambios pendientes de Whasapo para poder modificar el canal preferido."
                : currentExplanation}
            </Typography>
          </>
        ) : null}
      </Stack>
    </Paper>
  );
}

function AvailabilityCard({
  icon,
  title,
  available,
  availableText,
  unavailableText,
}) {
  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        p: 1.5,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        backgroundColor: "background.default",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 1, sm: 1.25 }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        sx={{ minWidth: 0 }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ minWidth: 0, width: "100%" }}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              display: "grid",
              placeItems: "center",
              borderRadius: 1,
              color: available ? "primary.main" : "text.disabled",
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>

          <Typography
            sx={{
              minWidth: 0,
              fontSize: 13,
              fontWeight: 800,
              color: "text.primary",
              lineHeight: 1.3,
              overflowWrap: "anywhere",
            }}
          >
            {title}
          </Typography>
        </Stack>

        <Chip
          label={available ? availableText : unavailableText}
          size="small"
          color={available ? "success" : "default"}
          variant={available ? "filled" : "outlined"}
          sx={{
            maxWidth: "100%",
            alignSelf: { xs: "flex-start", sm: "center" },
            fontWeight: 800,
            flexShrink: 0,
            "& .MuiChip-label": {
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
          }}
        />
      </Stack>
    </Box>
  );
}

const toggleSx = {
  minHeight: 46,
  px: 2,
  gap: 1,
  fontSize: 13,
  fontWeight: 800,
  textTransform: "none",
  color: "text.secondary",
  "&.Mui-selected": {
    bgcolor: "primary.main",
    color: "#fff",
  },
  "&.Mui-selected:hover": {
    bgcolor: "primary.dark",
  },
};