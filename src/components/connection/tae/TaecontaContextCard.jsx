import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import CloudDoneOutlinedIcon from "@mui/icons-material/CloudDoneOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";

function formatValue(value, fallback = "Sin datos") {
  if (value === null || typeof value === "undefined" || value === "") {
    return fallback;
  }

  return String(value);
}

function formatDate(value) {
  if (!value) return "Sin datos";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TaecontaContextCard({
  restaurant,
  account,
  contextData,
}) {
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
            icon={<CloudDoneOutlinedIcon fontSize="small" />}
            title="Estado de conexión"
            value={
              contextData?.isConnected
                ? "Cuenta vinculada"
                : "Sin conexión activa"
            }
            chipLabel={contextData?.isConnected ? "Conectado" : "Pendiente"}
            chipColor={contextData?.isConnected ? "success" : "default"}
          />

          <ContextMiniCard
            icon={<AccountCircleOutlinedIcon fontSize="small" />}
            title="Cuenta Taeconta"
            value={formatValue(account?.email, "Sin cuenta configurada")}
            chipLabel={contextData?.hasAccount ? "Guardada" : "Pendiente"}
            chipColor={contextData?.hasAccount ? "primary" : "default"}
          />

          <ContextMiniCard
            icon={<AccessTimeOutlinedIcon fontSize="small" />}
            title="Actualizada"
            value={formatDate(account?.updated_at)}
            chipLabel={account?.updated_at ? "Con datos" : "Sin datos"}
            chipColor={account?.updated_at ? "primary" : "default"}
          />
        </Stack>

        <Typography
          sx={{
            fontSize: 13,
            color: "text.secondary",
            lineHeight: 1.6,
          }}
        >
          {restaurant?.trade_name
            ? `La conexión que configures aquí aplicará únicamente a ${restaurant.trade_name}.`
            : "Configura la cuenta Taeconta para continuar con la integración fiscal."}
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