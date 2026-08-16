import {
  Box, Button, Chip, Divider, LinearProgress, Paper, Stack, Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import QrCode2RoundedIcon from "@mui/icons-material/QrCode2Rounded";

export default function ActivationReadinessCard({
  items = [],
  qr,
  onOpenQr,
}) {
  const theme = useTheme();

  const readyCount = items.filter((item) => item.ready).length;
  const total = items.length;
  const complete = total > 0 && readyCount === total;
  const progress = total > 0 ? Math.round((readyCount / total) * 100) : 0;

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
      <Stack spacing={2.5}>
        <Box>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1.25}
          >
            <Box>
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
                Preparación de la sucursal
              </Typography>

              <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary", lineHeight: 1.55 }}>
                Revisa los elementos necesarios antes de comenzar a recibir Pedidos en línea.
              </Typography>
            </Box>

            <Chip
              size="small"
              label={complete ? "Todo listo" : `${readyCount} de ${total} listos`}
              color={complete ? "success" : "warning"}
            />
          </Stack>

          <Box sx={{ mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              color={complete ? "success" : "primary"}
              sx={{
                height: 7,
                bgcolor: "background.default",
                "& .MuiLinearProgress-bar": { transition: "transform 0.25s ease" },
              }}
            />

            <Typography sx={{ mt: 0.75, fontSize: 12, color: "text.secondary" }}>
              {progress}% completado
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },
            gap: 1.5,
            alignItems: "stretch",
          }}
        >
          {items.map((item) => (
            <RequirementCard
              key={item.key}
              item={item}
              successBackground={alpha(theme.palette.success.main, 0.06)}
              pendingBackground={alpha(theme.palette.warning.main, 0.06)}
            />
          ))}
        </Box>

        <Divider />

        <QrPreparation
          qr={qr}
          onOpenQr={onOpenQr}
        />
      </Stack>
    </Paper>
  );
}

function RequirementCard({ item, successBackground, pendingBackground }) {
  return (
    <Box
      sx={{
        p: 1.75,
        minHeight: 170,
        height: "100%",
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: item.ready ? successBackground : pendingBackground,
      }}
    >
      <Stack spacing={1.25} height="100%">
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 1,
              display: "grid",
              placeItems: "center",
              bgcolor: "background.paper",
              color: item.ready ? "success.main" : "warning.main",
              border: "1px solid",
              borderColor: "divider",
              flexShrink: 0,
            }}
          >
            {item.icon}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
              {item.title}
            </Typography>

            <Chip
              size="small"
              label={item.ready ? "Listo" : "Pendiente"}
              color={item.ready ? "success" : "warning"}
              sx={{ mt: 0.75 }}
            />
          </Box>

          {item.ready ? (
            <CheckCircleRoundedIcon color="success" fontSize="small" />
          ) : (
            <ErrorOutlineRoundedIcon color="warning" fontSize="small" />
          )}
        </Stack>

        <Typography
          sx={{
            fontSize: 12.5,
            color: "text.secondary",
            lineHeight: 1.5,
            flex: 1,
          }}
        >
          {item.message}
        </Typography>

        {!item.ready && item.actionLabel && item.onAction ? (
          <Button
            type="button"
            variant="outlined"
            size="small"
            onClick={item.onAction}
            sx={{ alignSelf: { xs: "stretch", sm: "flex-start" } }}
          >
            {item.actionLabel}
          </Button>
        ) : null}
      </Stack>
    </Box>
  );
}

function QrPreparation({ qr, onOpenQr }) {
  let chipLabel = "No creado";
  let chipColor = "default";
  let message =
    "Puedes crear el QR de Pedidos en línea desde la administración de códigos QR. No es necesario para activar esta configuración.";

  if (!qr?.available) {
    chipLabel = "Sin consultar";
    message =
      "La comprobación del QR no está disponible en este momento. Esto no impide preparar ni activar Pedidos en línea.";
  } else if (qr?.exists && qr?.activeCount > 0) {
    chipLabel = "Activo";
    chipColor = "success";
    message =
      "La sucursal ya tiene un QR activo para Pedidos en línea. Su administración continúa realizándose desde la sección de códigos QR.";
  } else if (qr?.exists) {
    chipLabel = "Preparado";
    chipColor = "primary";
    message =
      "Ya existe un QR de Pedidos en línea, aunque actualmente está inactivo. Esto no bloquea la activación del servicio.";
  }

  return (
    <Box
      sx={{
        p: 1.75,
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.default",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={1.5}
      >
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1,
              display: "grid",
              placeItems: "center",
              bgcolor: "background.paper",
              color: "primary.main",
              border: "1px solid",
              borderColor: "divider",
              flexShrink: 0,
            }}
          >
            <QrCode2RoundedIcon />
          </Box>

          <Box>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ xs: "flex-start", sm: "center" }}
            >
              <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
                QR para Pedidos en línea
              </Typography>

              <Chip
                size="small"
                label={chipLabel}
                color={chipColor}
                variant={chipColor === "default" ? "outlined" : "filled"}
              />
            </Stack>

            <Typography sx={{ mt: 0.6, fontSize: 12.5, color: "text.secondary", lineHeight: 1.5 }}>
              {message}
            </Typography>
          </Box>
        </Stack>

        <Button
          type="button"
          variant="outlined"
          onClick={onOpenQr}
          sx={{ flexShrink: 0 }}
        >
          Ir a códigos QR
        </Button>
      </Stack>
    </Box>
  );
}
