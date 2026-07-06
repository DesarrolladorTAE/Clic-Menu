import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import StorefrontIcon from "@mui/icons-material/Storefront";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

export default function DiscountAuthorizersContextCard({
  selectedBranch,
  authorizers = [],
  candidates = [],
}) {
  const totalAuthorizers = authorizers.length;
  const activeAuthorizers = authorizers.filter((item) => item?.is_active).length;
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
            icon={<StorefrontIcon fontSize="small" />}
            title="Sucursal"
            value={selectedBranch?.name || "No seleccionada"}
            chipLabel={selectedBranch?.id ? "Seleccionada" : "Pendiente"}
            chipColor={selectedBranch?.id ? "primary" : "default"}
          />

          <ContextMiniCard
            icon={<VerifiedUserIcon fontSize="small" />}
            title="Autorizadores activos"
            value={`${activeAuthorizers} de ${totalAuthorizers}`}
            chipLabel={activeAuthorizers > 0 ? "Disponible" : "Pendiente"}
            chipColor={activeAuthorizers > 0 ? "success" : "default"}
          />

          <ContextMiniCard
            icon={<PersonAddAltIcon fontSize="small" />}
            title="Candidatos disponibles"
            value={`${availableCandidates} usuario${availableCandidates === 1 ? "" : "s"}`}
            chipLabel={availableCandidates > 0 ? "Listo" : "Sin candidatos"}
            chipColor={availableCandidates > 0 ? "primary" : "default"}
          />

          <ContextMiniCard
            icon={<GroupsIcon fontSize="small" />}
            title="Autoautorización"
            value={`${selfAuthorizers} usuario${selfAuthorizers === 1 ? "" : "s"} permitido${selfAuthorizers === 1 ? "" : "s"}`}
            chipLabel={selfAuthorizers > 0 ? "Permitida" : "No asignada"}
            chipColor={selfAuthorizers > 0 ? "primary" : "default"}
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
            ? `Los autorizadores configurados aquí solo podrán aprobar descuentos excedidos en ${selectedBranch.name}.`
            : "Selecciona una sucursal para continuar."}
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
