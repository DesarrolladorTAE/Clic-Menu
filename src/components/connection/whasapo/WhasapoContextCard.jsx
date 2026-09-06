import { Box, Chip, Paper, Stack, Typography } from "@mui/material";

import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";

export default function WhasapoContextCard({ selectedBranch, form }) {
  const usesCustomToken = Boolean(form?.use_custom_token);
  const hasCustomToken = String(form?.custom_token || "").trim() !== "";

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

        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} useFlexGap flexWrap="wrap">
          <ContextMiniCard
            icon={<StorefrontOutlinedIcon fontSize="small" />}
            title="Sucursal"
            value={selectedBranch?.name || "No seleccionada"}
            chipLabel={selectedBranch ? "Seleccionada" : "Pendiente"}
            chipColor={selectedBranch ? "primary" : "default"}
          />

          <ContextMiniCard
            icon={<WhatsAppIcon fontSize="small" />}
            title="Tipo de conexión"
            value={
              usesCustomToken
                ? "Conexión propia mediante Whasapo"
                : "Conexión principal del sistema"
            }
            chipLabel={usesCustomToken ? "Personalizada" : "Sistema"}
            chipColor={usesCustomToken ? "success" : "default"}
          />

          <ContextMiniCard
            icon={<KeyOutlinedIcon fontSize="small" />}
            title="Token de Whasapo"
            value={
              usesCustomToken
                ? hasCustomToken
                  ? "Token configurado"
                  : "Falta capturar el token"
                : "No requerido"
            }
            chipLabel={
              usesCustomToken
                ? hasCustomToken
                  ? "Configurado"
                  : "Pendiente"
                : "No requerido"
            }
            chipColor={usesCustomToken && hasCustomToken ? "success" : "default"}
          />
        </Stack>

        <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.6 }}>
          {selectedBranch?.name
            ? `La configuración de Whasapo que guardes se aplicará únicamente a ${selectedBranch.name}.`
            : "Selecciona una sucursal para consultar y modificar su configuración de Whasapo."}
        </Typography>
      </Stack>
    </Paper>
  );
}

function ContextMiniCard({ icon, title, value, chipLabel, chipColor = "default" }) {
  return (
    <Box
      sx={{
        flex: { xs: "0 0 auto", md: "1 1 240px" },
        width: { xs: "100%", md: "auto" },
        minWidth: { xs: 0, md: 220 },
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

          <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
            {title}
          </Typography>
        </Stack>

        <Typography
          sx={{
            fontSize: 14,
            color: "text.primary",
            lineHeight: 1.45,
            minHeight: { xs: 0, md: 42 },
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