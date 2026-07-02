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
  accessType = "none",
  statusCode = null,
  statusMessage = "",
  currentPlanSlug,
  currentEndsAt,
  currentAccess = null,
  currentPaidSubscription = null,
  nextSubscription = null,
  hasNextSubscription = false,
  canChangeNow,
  isDemo = false,
  isPaid = false,
  isInternal = false,
  daysRemaining = null,
}) {
  const currentPlanName =
    currentAccess?.plan?.name ||
    currentPaidSubscription?.plan?.name ||
    currentPlanSlug ||
    null;

  const planLabel = isDemo
    ? "Demo"
    : currentPlanName || "Ninguno";

  const demoDaysLabel =
    daysRemaining === null || daysRemaining === undefined
      ? "Sin dato"
      : `${daysRemaining} día${Number(daysRemaining) === 1 ? "" : "s"}`;

  const accessLabel = (() => {
    if (statusCode === "RESTAURANT_SUSPENDED") return "Suspendido";
    if (isDemo) return "Demo activo";
    if (isPaid) return "Plan pagado";
    if (isInternal) return "Acceso interno";
    if (accessType === "none") return "Sin acceso";
    return "Acceso activo";
  })();

  const accessChipColor = (() => {
    if (statusCode === "RESTAURANT_SUSPENDED") return "warning";
    if (isDemo) return "warning";
    if (isPaid) return "success";
    if (isInternal) return "info";
    if (accessType === "none") return "default";
    return "primary";
  })();

  const planChipLabel = (() => {
    if (isDemo) return "Prueba gratuita";
    if (isPaid) return "Suscripción activa";
    if (isInternal) return "Interno";
    if (currentPlanSlug) return "Asignado";
    return "Pendiente";
  })();

  const planChipColor = (() => {
    if (isDemo) return "warning";
    if (isPaid) return "success";
    if (isInternal) return "info";
    if (currentPlanSlug) return "primary";
    return "default";
  })();

  const noticeConfig = (() => {
    if (statusCode === "RESTAURANT_SUSPENDED") {
      return {
        borderColor: "#F3D48B",
        backgroundColor: "#FFF7E8",
        color: "#8A5A00",
        text:
          statusMessage ||
          "El restaurante se encuentra suspendido administrativamente.",
      };
    }

    if (isDemo) {
      return {
        borderColor: "#F3D48B",
        backgroundColor: "#FFF7E8",
        color: "#8A5A00",
        text:
          "Tu restaurante está usando el plan Demo. Puedes contratar un plan de paga antes de que termine tu periodo de prueba.",
      };
    }

    if (isPaid && hasNextSubscription) {
      return {
        borderColor: "#B7E4C7",
        backgroundColor: "#ECFDF3",
        color: "#166534",
        text:
          "Tu restaurante cuenta con una suscripción vigente y ya tiene una renovación programada. La próxima vigencia iniciará cuando termine el periodo actual.",
      };
    }

    if (isPaid) {
      return {
        borderColor: "#B7E4C7",
        backgroundColor: "#ECFDF3",
        color: "#166534",
        text:
          "Tu restaurante cuenta con una suscripción vigente. Puedes renovar por adelantado y la nueva vigencia iniciará cuando termine el periodo actual.",
      };
    }

    if (isInternal) {
      return {
        borderColor: "#BFDBFE",
        backgroundColor: "#EFF6FF",
        color: "#1D4ED8",
        text:
          "Tu restaurante cuenta con acceso interno activo. Puedes revisar los planes comerciales disponibles cuando lo necesites.",
      };
    }

    if (!isOperational || accessType === "none") {
      return {
        borderColor: "#F3D48B",
        backgroundColor: "#FFF7E8",
        color: "#8A5A00",
        text:
          statusMessage ||
          "Este restaurante necesita un plan activo para comenzar a operar.",
      };
    }

    return null;
  })();

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
            title="Tipo de acceso"
            value={accessLabel}
            chipLabel={accessLabel}
            chipColor={accessChipColor}
          />

          <StateMiniCard
            title="Plan actual"
            value={planLabel}
            chipLabel={planChipLabel}
            chipColor={planChipColor}
          />

          <StateMiniCard
            title="Vigencia actual"
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

          {nextSubscription ? (
            <StateMiniCard
              title="Próxima renovación"
              value={nextSubscription.starts_at ? formatDate(nextSubscription.starts_at) : "Programada"}
              chipLabel="Futura"
              chipColor="info"
            />
          ) : null}
        </Stack>

        {noticeConfig ? (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              border: "1px solid",
              borderColor: noticeConfig.borderColor,
              backgroundColor: noticeConfig.backgroundColor,
            }}
          >
            <Typography
              sx={{
                fontSize: 13,
                color: noticeConfig.color,
                lineHeight: 1.5,
                fontWeight: 800,
              }}
            >
              {noticeConfig.text}
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