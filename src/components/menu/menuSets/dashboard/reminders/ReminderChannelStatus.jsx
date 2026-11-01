//src/components/menu/menuSets/dashboard/reminders/ReminderChannelStatus.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box, Button, Chip, CircularProgress, Paper,
  Stack, Typography,
} from "@mui/material";

import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";

import {
  getReminderWhatsappSetting,
  getReminderWhatsappQrConnection,
} from "../../../../../services/menu/menuSets/dashboard/ownerReminders.service";

const panelSx = {
  p: { xs: 2, sm: 2.5 }, border: "1px solid",
  borderColor: "divider", borderRadius: 1,
  bgcolor: "background.paper", boxShadow: "none",
};

function getErrorMessage(error) {
  const data = error?.response?.data;
  const errors = data?.errors && typeof data.errors === "object"
    ? Object.values(data.errors).flat() : [];

  return errors.find((value) => typeof value === "string")
    || data?.message || error?.message
    || "No fue posible consultar la configuración de WhatsApp.";
}

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "—"
    : new Intl.DateTimeFormat("es-MX", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: false,
    }).format(date);
}

function effectiveChannel(setting) {
  if (setting.effective_channel === "chatingboot") {
    return "WhatsApp QR";
  }

  if (setting.using_system_fallback) {
    return "WhatsApp del sistema (alternativo)";
  }

  if (setting.whasapo_available) {
    return "WhatsApp personalizado";
  }

  return "WhatsApp del sistema";
}

function preferredChannel(value) {
  if (value === "chatingboot") return "WhatsApp QR";
  if (value === "whasapo") return "WhatsApp tradicional";
  return "Selección automática";
}

function qrConnectionLabel(status) {
  const statuses = {
    connected: "Conectada",
    disconnected: "Desconectada",
    pending: "Pendiente",
    connecting: "Conectando",
    created: "Creada",
    failed: "Con error",
    error: "Con error",
  };

  return statuses[status] || "Sin estado confirmado";
}

function StatusField({ label, value, detail }) {
  return (
    <Box sx={{
      p: 1.5, minHeight: 102, height: "100%",
      border: "1px solid", borderColor: "divider",
      borderRadius: 1, bgcolor: "background.default",
    }}>
      <Stack spacing={0.7}>
        <Typography sx={{ fontSize: 12, fontWeight: 800, color: "text.secondary" }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: 14, fontWeight: 800, overflowWrap: "anywhere" }}>
          {value}
        </Typography>
        {detail ? (
          <Typography sx={{ fontSize: 11.5, color: "text.secondary", lineHeight: 1.5 }}>
            {detail}
          </Typography>
        ) : null}
      </Stack>
    </Box>
  );
}

export default function ReminderChannelStatus({ restaurantId, branchId, onAlert }) {
  const navigate = useNavigate();

  const [configuration, setConfiguration] = useState(null);
  const [qr, setQr] = useState(null);
  const [qrAvailable, setQrAvailable] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setConfiguration(null);
    setQr(null);
    setQrAvailable(true);
  }, [restaurantId, branchId]);

  useEffect(() => {
    if (!restaurantId || !branchId) {
      setLoading(false);
      return undefined;
    }

    let active = true;
    const controller = new AbortController();
    setLoading(true);

    const load = async () => {
      const [settingResult, qrResult] = await Promise.allSettled([
        getReminderWhatsappSetting(restaurantId, branchId, controller.signal),
        getReminderWhatsappQrConnection(restaurantId, branchId, controller.signal),
      ]);

      if (!active || controller.signal.aborted) return;

      if (settingResult.status === "fulfilled") {
        setConfiguration(settingResult.value);
      } else {
        setConfiguration(null);
        onAlert?.({ message: getErrorMessage(settingResult.reason) });
      }

      if (qrResult.status === "fulfilled") {
        setQr(qrResult.value);
        setQrAvailable(true);
      } else {
        setQr(null);
        setQrAvailable(false);
      }

      setLoading(false);
    };

    load();

    return () => {
      active = false;
      controller.abort();
    };
  }, [restaurantId, branchId, onAlert]);

  const openSettings = () => {
    navigate(`/owner/restaurants/${restaurantId}/operation/connections/whasapo`, {
      state: { branchId },
    });
  };

  const setting = configuration?.setting;
  const connection = qr?.connection;

  return (
    <Paper sx={panelSx}>
      <Stack spacing={2}>
        <Stack direction={{ xs: "column", md: "row" }}
          justifyContent="space-between" alignItems={{ md: "center" }} spacing={1.5}>
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <WhatsAppIcon sx={{ fontSize: 26, color: "primary.main" }} />
            <Box>
              <Typography sx={{ fontSize: 18, fontWeight: 800 }}>
                Canal de WhatsApp
              </Typography>
              <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}>
                Estado informativo del canal configurado para esta sucursal.
              </Typography>
            </Box>
          </Stack>

          <Button variant="outlined" startIcon={<SettingsOutlinedIcon />}
            endIcon={<OpenInNewOutlinedIcon />} onClick={openSettings}
            sx={{ alignSelf: { xs: "stretch", md: "center" }, flexShrink: 0 }}>
            Configurar WhatsApp
          </Button>
        </Stack>

        {loading ? (
          <Box sx={{ minHeight: 115, display: "grid", placeItems: "center" }}>
            <Stack alignItems="center" spacing={1.25}>
              <CircularProgress size={25} />
              <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                Consultando configuración…
              </Typography>
            </Stack>
          </Box>
        ) : setting ? (
          <>
            <Stack direction="row" flexWrap="wrap" gap={0.75}>
              <Chip size="small" color="primary" label={effectiveChannel(setting)} />

              {setting.reconnect_required ? (
                <Chip size="small" color="warning" label="Requiere reconexión" />
              ) : null}

              {setting.qr_connected && setting.addon_whatsapp_qr_available ? (
                <Chip size="small" color="success" variant="outlined"
                  label="WhatsApp QR conectado" />
              ) : null}
            </Stack>

            <Box sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr", sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
              },
              gridAutoRows: "1fr", gap: 1.5,
            }}>
              <StatusField
                label="Canal utilizado"
                value={effectiveChannel(setting)}
                detail="El canal se determina con la configuración vigente de la sucursal."
              />
              <StatusField
                label="Canal preferido"
                value={preferredChannel(setting.preferred_channel)}
              />
              <StatusField
                label="WhatsApp personalizado"
                value={setting.whasapo_available ? "Disponible" : "No disponible"}
                detail={setting.use_custom_token && !setting.has_custom_token
                  ? "No se encontró una credencial personalizada."
                  : null}
              />
              <StatusField
                label="Complemento WhatsApp QR"
                value={setting.addon_whatsapp_qr_available ? "Disponible" : "No disponible"}
              />
              <StatusField
                label="Conexión QR"
                value={setting.qr_connected ? "Conectada" : qrConnectionLabel(setting.qr_connection_status)}
              />
              <StatusField
                label="Selección de canal"
                value={setting.can_choose_channel ? "Ambos canales disponibles" : "Según disponibilidad"}
              />
            </Box>

            {qrAvailable && connection ? (
              <Box sx={{
                p: 1.5, border: "1px solid", borderColor: "divider",
                borderRadius: 1, bgcolor: "background.default",
              }}>
                <Stack spacing={0.75}>
                  <Typography sx={{ fontSize: 13, fontWeight: 800 }}>
                    Conexión QR almacenada
                  </Typography>

                  <Typography sx={{ fontSize: 12.5 }}>
                    {connection.name || "Conexión de la sucursal"}
                  </Typography>

                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    Teléfono asociado: {connection.phone_number || "No informado"}
                  </Typography>

                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    Última consulta registrada: {formatDateTime(connection.last_synced_at)}
                  </Typography>
                </Stack>
              </Box>
            ) : !qrAvailable ? (
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                No fue posible consultar el registro almacenado de la conexión QR.
                El canal utilizado se muestra según la configuración disponible.
              </Typography>
            ) : null}

            {setting.reconnect_required ? (
              <Typography sx={{ fontSize: 12.5, color: "text.secondary", lineHeight: 1.6 }}>
                La conexión WhatsApp QR necesita revisión. El sistema conserva
                el canal alternativo determinado por la configuración vigente.
              </Typography>
            ) : null}
          </>
        ) : (
          <Typography sx={{ py: 2, fontSize: 13, color: "text.secondary" }}>
            No se pudo consultar el estado del canal de WhatsApp.
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}