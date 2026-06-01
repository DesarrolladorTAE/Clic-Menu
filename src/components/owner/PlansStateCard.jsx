import { Box, Chip, Paper, Stack, Typography } from "@mui/material";

//función para formatear la fecha
function formatDate(value) {
  if (!value) return "Sin fecha";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

export default function PlansStateCard({
  isOperational,
  currentPlanSlug,
  currentEndsAt,
  canChangeNow,
  isDemo = false,
  daysRemaining = null,
}) {
  const planLabel = isDemo ? "Demo" : currentPlanSlug || "Ninguno";

  const demoDaysLabel =
    daysRemaining === null || daysRemaining === undefined
      ? "Sin dato"
      : `${daysRemaining} día${Number(daysRemaining) === 1 ? "" : "s"}`;

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
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          useFlexGap
          flexWrap="wrap"
        >
          <StateMiniCard
            title="Estado"
            value={isOperational ? "Operativo" : "Bloqueado"}
            chipLabel={isOperational ? "Activo" : "Restringido"}
            chipColor={isOperational ? "success" : "default"}
          />

          <StateMiniCard
            title="Plan actual"
            value={planLabel}
            chipLabel={isDemo ? "Prueba gratuita" : currentPlanSlug ? "Asignado" : "Pendiente"}
            chipColor={isDemo ? "warning" : currentPlanSlug ? "primary" : "default"}
          />

          <StateMiniCard
            title="Vigencia"
            value={currentEndsAt ? formatDate(currentEndsAt) : "Sin fecha"}
            chipLabel={currentEndsAt ? "Con vencimiento" : "Sin registro"}
            chipColor={currentEndsAt ? "primary" : "default"}
          />

          {isDemo ? (
            <StateMiniCard
              title="Demo restante"
              value={demoDaysLabel}
              chipLabel="Demo activo"
              chipColor="warning"
            />
          ) : null}
        </Stack>

        {isDemo ? (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              border: "1px solid",
              borderColor: "#F3D48B",
              backgroundColor: "#FFF7E8",
            }}
          >
            <Typography
              sx={{
                fontSize: 13,
                color: "#8A5A00",
                lineHeight: 1.5,
                fontWeight: 800,
              }}
            >
              Tu restaurante está usando el plan Demo. Puedes contratar un plan
              de paga antes de que termine tu periodo de prueba.
            </Typography>
          </Box>
        ) : !canChangeNow ? (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              border: "1px solid",
              borderColor: "#F3D48B",
              backgroundColor: "#FFF7E8",
            }}
          >
            <Typography
              sx={{
                fontSize: 13,
                color: "#8A5A00",
                lineHeight: 1.5,
                fontWeight: 800,
              }}
            >
              Tu restaurante ya cuenta con una suscripción vigente. Solo podrás
              cambiar de plan cuando termine el periodo actual.
            </Typography>
          </Box>
        ) : null}
      </Stack>
    </Paper>
  );
}

function StateMiniCard({ title, value, chipLabel, chipColor = "default" }) {
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
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 800,
            color: "text.secondary",
            textTransform: "uppercase",
            letterSpacing: 0.3,
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 800,
            color: "text.primary",
            lineHeight: 1.35,
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