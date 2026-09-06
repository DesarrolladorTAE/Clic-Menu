import { Box, Chip, Paper, Stack, Typography } from "@mui/material";

import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import ExtensionOutlinedIcon from "@mui/icons-material/ExtensionOutlined";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";

function connectionState(connection, reconnectRequired) {
  if (connection?.connected) {
    return {
      value: "WhatsApp vinculado correctamente",
      chip: "Conectado",
      color: "success",
    };
  }

  const status = String(connection?.status || "").toLowerCase();

  if (status === "qr" || status === "qrcode") {
    return {
      value: "Esperando que escanees el código QR",
      chip: "Esperando escaneo",
      color: "warning",
    };
  }

  if (status === "opening") {
    return {
      value: "WhatsApp está terminando de vincular el dispositivo",
      chip: "Vinculando",
      color: "warning",
    };
  }

  if (status === "pending") {
    return {
      value: "La conexión se está preparando",
      chip: "Preparando",
      color: "warning",
    };
  }

  if (
    reconnectRequired ||
    status === "disconnected" ||
    status === "closed"
  ) {
    return {
      value: "La cuenta necesita volver a vincularse",
      chip: "Desconectado",
      color: "error",
    };
  }

  if (connection) {
    return {
      value: "La conexión está pendiente de vinculación",
      chip: "Pendiente",
      color: "default",
    };
  }

  return {
    value: "Todavía no has creado una conexión",
    chip: "Sin conexión",
    color: "default",
  };
}

export default function ChatingBootContextCard({
  selectedBranch,
  addonAvailable = false,
  connection = null,
  reconnectRequired = false,
}) {
  const state = connectionState(connection, reconnectRequired);

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
        <Typography sx={{ fontSize: 16, fontWeight: 800, color: "text.primary" }}>
          Contexto actual
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(3, minmax(0, 1fr))",
            },
            gap: 1.5,
          }}
        >
          <ContextMiniCard
            icon={<StorefrontOutlinedIcon fontSize="small" />}
            title="Sucursal"
            value={selectedBranch?.name || "No seleccionada"}
            chipLabel={selectedBranch ? "Seleccionada" : "Pendiente"}
            chipColor={selectedBranch ? "primary" : "default"}
          />

          <ContextMiniCard
            icon={<ExtensionOutlinedIcon fontSize="small" />}
            title="Complemento WhatsApp QR"
            value={
              addonAvailable
                ? "Disponible para esta sucursal"
                : "No disponible para esta sucursal"
            }
            chipLabel={addonAvailable ? "Vigente" : "No vigente"}
            chipColor={addonAvailable ? "success" : "default"}
          />

          <ContextMiniCard
            icon={<LinkRoundedIcon fontSize="small" />}
            title="Estado de la conexión"
            value={state.value}
            chipLabel={state.chip}
            chipColor={state.color}
          />
        </Box>

        <Typography
          sx={{
            fontSize: 13,
            color: "text.secondary",
            lineHeight: 1.6,
          }}
        >
          {selectedBranch?.name
            ? `La conexión por código QR pertenece únicamente a ${selectedBranch.name}.`
            : "Selecciona una sucursal para consultar su conexión de WhatsApp QR."}
        </Typography>
      </Stack>
    </Paper>
  );
}

function ContextMiniCard({
  icon,
  title,
  value,
  chipLabel,
  chipColor = "default",
}) {
  return (
    <Box
      sx={{
        minWidth: 0,
        minHeight: 150,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        p: 1.75,
        backgroundColor: "background.default",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack spacing={1} sx={{ height: "100%" }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1,
              display: "grid",
              placeItems: "center",
              bgcolor: "action.hover",
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
            flex: 1,
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