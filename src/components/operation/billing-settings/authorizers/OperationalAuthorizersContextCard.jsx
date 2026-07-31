import { Box, Chip, Paper, Typography } from "@mui/material";

import GroupsIcon from "@mui/icons-material/Groups";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import StorefrontIcon from "@mui/icons-material/Storefront";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

export default function OperationalAuthorizersContextCard({
  selectedBranch,
  authorizers = [],
  candidates = [],
}) {
  const total = authorizers.length;
  const active = authorizers.filter((item) => item?.is_active).length;
  const selfAuthorizers = authorizers.filter(
    (item) => item?.can_self_authorize
  ).length;
  const availableCandidates = candidates.filter(
    (item) => !item?.already_authorizer
  ).length;

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
          icon={<VerifiedUserIcon fontSize="small" />}
          title="Autorizadores activos"
          value={`${active} de ${total}`}
          chipLabel={active > 0 ? "Disponibles" : "Sin activos"}
          chipColor={active > 0 ? "success" : "default"}
        />

        <ContextMiniCard
          icon={<PersonAddAltIcon fontSize="small" />}
          title="Candidatos disponibles"
          value={`${availableCandidates} usuario${availableCandidates === 1 ? "" : "s"}`}
          chipLabel={availableCandidates > 0 ? "Listos" : "Sin candidatos"}
          chipColor={availableCandidates > 0 ? "primary" : "default"}
        />

        <ContextMiniCard
          icon={<GroupsIcon fontSize="small" />}
          title="Autoautorización"
          value={`${selfAuthorizers} usuario${selfAuthorizers === 1 ? "" : "s"} permitido${selfAuthorizers === 1 ? "" : "s"}`}
          chipLabel={selfAuthorizers > 0 ? "Permitida" : "No asignada"}
          chipColor={selfAuthorizers > 0 ? "primary" : "default"}
        />
      </Box>

      <Typography sx={{ mt: 2, fontSize: 13, color: "text.secondary", lineHeight: 1.6 }}>
        Los usuarios activos podrán autorizar operaciones sensibles únicamente
        dentro de {selectedBranch?.name || "la sucursal seleccionada"}.
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

