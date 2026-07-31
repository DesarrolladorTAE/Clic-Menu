import { Box, Chip, Paper, Typography } from "@mui/material";

import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import NumbersOutlinedIcon from "@mui/icons-material/NumbersOutlined";
import StorefrontIcon from "@mui/icons-material/Storefront";

const MIN_MAX_CHECKS_PER_GROUP = 2;
const MAX_MAX_CHECKS_PER_GROUP = 20;

export default function BillingRulesContextCard({ selectedBranch, setting }) {
  const limit = Number(setting?.max_checks_per_group);
  const hasSetting =
    Number.isInteger(limit) &&
    limit >= MIN_MAX_CHECKS_PER_GROUP &&
    limit <= MAX_MAX_CHECKS_PER_GROUP;

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
      <Typography sx={{ fontSize: 16, fontWeight: 800, color: "text.primary", mb: 2 }}>
        Contexto actual
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
          gap: 1.5,
        }}
      >
        <ContextMiniCard
          icon={<StorefrontIcon fontSize="small" />}
          title="Sucursal"
          value={selectedBranch?.name || "No seleccionada"}
          chipLabel={selectedBranch?.id ? "Seleccionada" : "Pendiente"}
          chipColor={selectedBranch?.id ? "primary" : "default"}
        />

        <ContextMiniCard
          icon={<NumbersOutlinedIcon fontSize="small" />}
          title="Límite actual"
          value={
            hasSetting
              ? `${limit} cuenta${limit === 1 ? "" : "s"} o parte${limit === 1 ? "" : "s"}`
              : "No disponible"
          }
          chipLabel={hasSetting ? "Configurado" : "Pendiente"}
          chipColor={hasSetting ? "primary" : "default"}
        />

        <ContextMiniCard
          icon={<AccountTreeOutlinedIcon fontSize="small" />}
          title="Rango permitido"
          value={`${MIN_MAX_CHECKS_PER_GROUP} a ${MAX_MAX_CHECKS_PER_GROUP} cuentas o partes`}
          chipLabel="Regla del sistema"
        />

        <ContextMiniCard
          icon={<CheckCircleOutlineIcon fontSize="small" />}
          title="Estado"
          value={
            hasSetting
              ? "Configuración disponible para esta sucursal"
              : "La configuración no está disponible"
          }
          chipLabel={hasSetting ? "Lista" : "Pendiente"}
          chipColor={hasSetting ? "success" : "default"}
        />
      </Box>

      <Typography sx={{ mt: 2, fontSize: 13, color: "text.secondary", lineHeight: 1.6 }}>
        Este límite se utiliza al crear cuentas nuevas o dividir una cuenta en
        partes dentro de {selectedBranch?.name || "la sucursal seleccionada"}.
      </Typography>
    </Paper>
  );
}

function ContextMiniCard({ icon, title, value, chipLabel, chipColor = "default" }) {
  return (
    <Box
      sx={{
        minWidth: 0,
        height: "100%",
        minHeight: 158,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        p: 1.75,
        backgroundColor: "background.default",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
      </Box>

      <Typography
        sx={{
          mt: 1,
          mb: 1.25,
          fontSize: 14,
          color: "text.primary",
          lineHeight: 1.45,
          wordBreak: "break-word",
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
    </Box>
  );
}
