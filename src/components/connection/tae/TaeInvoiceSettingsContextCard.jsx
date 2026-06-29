import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import CloudDoneOutlinedIcon from "@mui/icons-material/CloudDoneOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";

function formatValue(value, fallback = "Sin datos") {
  if (value === null || typeof value === "undefined" || value === "") {
    return fallback;
  }

  return String(value);
}

function getModeLabel(value, options = []) {
  const found = options.find((item) => String(item.value) === String(value));
  return found?.label || formatValue(value);
}

export default function TaeInvoiceSettingsContextCard({ payload }) {
  const account = payload?.taeconta_account || null;
  const setting = payload?.taeconta_invoice_setting || null;
  const ui = payload?.ui || {};
  const options = Array.isArray(ui?.invoice_mode_options)
    ? ui.invoice_mode_options
    : [];

  const canEnable = !!ui?.can_enable;
  const enabled = !!setting?.enabled;

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
          Contexto de configuración
        </Typography>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          useFlexGap
          flexWrap="wrap"
        >
          <ContextMiniCard
            icon={<ReceiptLongOutlinedIcon fontSize="small" />}
            title="Auto-facturación"
            value={enabled ? "Activa para el restaurante" : "Inactiva"}
            chipLabel={enabled ? "Activa" : "Inactiva"}
            chipColor={enabled ? "success" : "default"}
          />

          <ContextMiniCard
            icon={<CloudDoneOutlinedIcon fontSize="small" />}
            title="Cuenta Taeconta"
            value={formatValue(account?.email, "Sin cuenta conectada")}
            chipLabel={canEnable ? "Conectada" : "Requerida"}
            chipColor={canEnable ? "success" : "default"}
          />

          <ContextMiniCard
            icon={<SettingsOutlinedIcon fontSize="small" />}
            title="Modo de facturación"
            value={getModeLabel(setting?.invoice_mode, options)}
            chipLabel={setting?.id ? "Configurado" : "Por definir"}
            chipColor={setting?.id ? "primary" : "default"}
          />

          <ContextMiniCard
            icon={<ConfirmationNumberOutlinedIcon fontSize="small" />}
            title="Serie"
            value={formatValue(setting?.serie)}
            chipLabel={setting?.serie ? "Con datos" : "Pendiente"}
            chipColor={setting?.serie ? "primary" : "default"}
          />
        </Stack>

        <Typography
          sx={{
            fontSize: 13,
            color: "text.secondary",
            lineHeight: 1.6,
          }}
        >
          {canEnable
            ? "La cuenta Taeconta está conectada. Ya puedes definir cómo se generará la auto-facturación."
            : "Primero conecta una cuenta Taeconta válida para activar la auto-facturación."}
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
              flexShrink: 0,
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
            wordBreak: "break-word",
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