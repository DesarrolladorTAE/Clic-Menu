import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import PercentIcon from "@mui/icons-material/Percent";
import SecurityIcon from "@mui/icons-material/Security";
import StorefrontIcon from "@mui/icons-material/Storefront";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

export default function DiscountPolicyContextCard({ selectedBranch, payload }) {
  const policy = payload?.data || null;
  const hasPolicy = !!policy?.id;
  const rulesApply = !!payload?.rules_apply;

  const statusLabel = rulesApply
    ? "Reglas activas"
    : hasPolicy
      ? "Política inactiva"
      : "Sin política";

  const statusValue = rulesApply
    ? "Caja evalúa límites y autorización"
    : hasPolicy
      ? "Existe configuración, pero no se aplica"
      : "Caja trabaja sin límites ni autorización";

  const actionLabel =
    policy?.exceeded_discount_action === "block"
      ? "Bloquear"
      : policy?.exceeded_discount_action === "authorize"
        ? "Solicitar autorización"
        : "Sin definir";

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
            title="Estado"
            value={statusValue}
            chipLabel={statusLabel}
            chipColor={rulesApply ? "success" : "default"}
          />

          <ContextMiniCard
            icon={<PercentIcon fontSize="small" />}
            title="Límites"
            value={
              hasPolicy
                ? `${policy.max_discount_percent}% · $${policy.max_discount_amount}`
                : "Sin límites configurados"
            }
            chipLabel={hasPolicy ? "Configurado" : "Libre"}
            chipColor={hasPolicy ? "primary" : "default"}
          />

          <ContextMiniCard
            icon={<SecurityIcon fontSize="small" />}
            title="Acción al exceder"
            value={actionLabel}
            chipLabel={
              policy?.exceeded_discount_action === "block"
                ? "Bloqueo"
                : policy?.exceeded_discount_action === "authorize"
                  ? "Con autorización"
                  : "Pendiente"
            }
            chipColor={policy?.exceeded_discount_action ? "primary" : "default"}
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
