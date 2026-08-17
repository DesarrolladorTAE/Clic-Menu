//Para poner las imagenes de la parte de seguimiento
import React, { useMemo } from "react";
import {
  Box, Card, Chip, Divider, Stack, Typography,
} from "@mui/material";

import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import DeliveryDiningRoundedIcon from "@mui/icons-material/DeliveryDiningRounded";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import RestaurantMenuRoundedIcon from "@mui/icons-material/RestaurantMenuRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import TakeoutDiningRoundedIcon from "@mui/icons-material/TakeoutDiningRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";

const STATUS_ARTWORK = {
  processing: HourglassTopRoundedIcon,
  pending_acceptance: AccessTimeRoundedIcon,
  received: ReceiptLongRoundedIcon,
  preparing: RestaurantMenuRoundedIcon,
  ready: TakeoutDiningRoundedIcon,
  out_for_delivery: DeliveryDiningRoundedIcon,
  delivered: DoneAllRoundedIcon,
  completed: VerifiedRoundedIcon,
  rejected: CancelOutlinedIcon,
  cancelled: CancelOutlinedIcon,
  unknown: HourglassTopRoundedIcon,
};

export default function TrackingTab({ data, themeColor }) {
  const status = String(data?.status || "unknown");
  const isNegative = ["rejected", "cancelled"].includes(status);
  const ArtworkIcon = STATUS_ARTWORK[status] || HourglassTopRoundedIcon;

  const timelineCodes = useMemo(
    () => new Set((Array.isArray(data?.timeline) ? data.timeline : []).map((item) => String(item?.status || ""))),
    [data?.timeline],
  );

  const steps = useMemo(() => {
    if (String(data?.fulfillment_type || "") === "home_delivery") {
      return [
        { code: "received", label: "Recibido" },
        { code: "preparing", label: "Preparando" },
        { code: "ready", label: "Listo" },
        { code: "out_for_delivery", label: "En camino" },
        { code: "delivered", label: "Entregado" },
      ];
    }

    return [
      { code: "received", label: "Recibido" },
      { code: "preparing", label: "Preparando" },
      { code: "ready", label: "Listo" },
      { code: "delivered", label: "Entregado" },
    ];
  }, [data?.fulfillment_type]);

  const completedAll = status === "completed";

  const isReached = (code) => completedAll || timelineCodes.has(code);
  const isCurrent = (code) => status === code;

  return (
    <Card
      sx={{
        width: "100%",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          px: { xs: 2, sm: 4 },
          pt: { xs: 3, sm: 4 },
          pb: { xs: 3, sm: 4 },
          textAlign: "center",
          background: isNegative
            ? "linear-gradient(180deg, rgba(242,100,42,0.08) 0%, rgba(255,255,255,0) 100%)"
            : `linear-gradient(180deg, ${themeColor}14 0%, rgba(255,255,255,0) 100%)`,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: { xs: 190, sm: 260 },
            height: { xs: 190, sm: 260 },
            borderRadius: "50%",
            backgroundColor: isNegative ? "rgba(242,100,42,0.06)" : `${themeColor}0D`,
            top: { xs: -70, sm: -100 },
            right: { xs: -70, sm: -80 },
          }}
        />

        <Box
          sx={{
            width: { xs: 142, sm: 170 },
            height: { xs: 142, sm: 170 },
            mx: "auto",
            mb: 2.5,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            position: "relative",
            color: isNegative ? "error.main" : themeColor,
            background: isNegative
              ? "linear-gradient(145deg, rgba(242,100,42,0.14), rgba(255,255,255,0.88))"
              : `linear-gradient(145deg, ${themeColor}20, rgba(255,255,255,0.92))`,
            border: "1px solid",
            borderColor: isNegative ? "rgba(242,100,42,0.22)" : `${themeColor}30`,
            "@keyframes trackingPulse": {
              "0%, 100%": { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(0,0,0,0)" },
              "50%": {
                transform: "scale(1.025)",
                boxShadow: isNegative
                  ? "0 0 0 10px rgba(242,100,42,0.05)"
                  : `0 0 0 10px ${themeColor}0A`,
              },
            },
            animation:
              ["completed", "rejected", "cancelled"].includes(status)
                ? "none"
                : "trackingPulse 2.4s ease-in-out infinite",
          }}
        >
          <ArtworkIcon sx={{ fontSize: { xs: 72, sm: 88 } }} />
        </Box>

        <Chip
          label={`Pedido ${data?.public_number || ""}`}
          size="small"
          sx={{
            mb: 1.5,
            backgroundColor: isNegative ? "rgba(242,100,42,0.10)" : `${themeColor}16`,
            color: isNegative ? "error.main" : themeColor,
            fontWeight: 900,
          }}
        />

        <Typography
          component="h1"
          sx={{
            fontSize: { xs: 25, sm: 31 },
            fontWeight: 900,
            color: isNegative ? "error.main" : "text.primary",
            lineHeight: 1.15,
          }}
        >
          {data?.status_label || "Estado del pedido"}
        </Typography>

        <Typography
          sx={{
            maxWidth: 610,
            mx: "auto",
            mt: 1.2,
            fontSize: { xs: 14, sm: 15 },
            color: "text.secondary",
            lineHeight: 1.65,
          }}
        >
          {data?.status_message || "Consulta aquí el estado actual de tu pedido."}
        </Typography>

        {data?.estimated_for_at ? (
          <Typography
            sx={{
              mt: 1.5,
              fontSize: 13,
              fontWeight: 800,
              color: themeColor,
            }}
          >
            Entrega estimada: {formatDateTime(data.estimated_for_at)}
          </Typography>
        ) : null}

        {isNegative && data?.status_reason ? (
          <Box
            sx={{
              maxWidth: 620,
              mx: "auto",
              mt: 2,
              p: 1.5,
              border: "1px solid",
              borderColor: "rgba(242,100,42,0.30)",
              borderRadius: 1,
              backgroundColor: "rgba(242,100,42,0.07)",
            }}
          >
            <Typography sx={{ fontSize: 13, color: "text.primary", lineHeight: 1.55 }}>
              {data.status_reason}
            </Typography>
          </Box>
        ) : null}
      </Box>

      <Divider />

      <Box sx={{ px: { xs: 1.5, sm: 3 }, py: { xs: 2.5, sm: 3 } }}>
        <Typography
          sx={{
            mb: 2.5,
            fontSize: 15,
            fontWeight: 900,
            color: "text.primary",
            textAlign: "center",
          }}
        >
          Progreso de tu pedido
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            width: "100%",
            overflowX: "auto",
            pb: 0.5,
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {steps.map((step, index) => {
            const reached = isReached(step.code);
            const current = isCurrent(step.code);

            return (
              <Box
                key={step.code}
                sx={{
                  position: "relative",
                  flex: "1 0 72px",
                  minWidth: 72,
                  textAlign: "center",
                  px: 0.5,
                }}
              >
                {index < steps.length - 1 ? (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 15,
                      left: "50%",
                      width: "100%",
                      height: 3,
                      backgroundColor: isReached(steps[index + 1].code)
                        ? themeColor
                        : "divider",
                      transition: "background-color 300ms ease",
                    }}
                  />
                ) : null}

                <Box
                  sx={{
                    width: current ? 34 : 30,
                    height: current ? 34 : 30,
                    mx: "auto",
                    position: "relative",
                    zIndex: 1,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    border: "2px solid",
                    borderColor: reached || current ? themeColor : "divider",
                    backgroundColor: reached || current ? themeColor : "background.paper",
                    color: reached || current ? "#fff" : "text.secondary",
                    transition: "all 300ms ease",
                    boxShadow: current ? `0 0 0 5px ${themeColor}18` : "none",
                  }}
                >
                  {reached && !current ? (
                    <CheckCircleRoundedIcon sx={{ fontSize: 18 }} />
                  ) : current ? (
                    <TaskAltRoundedIcon sx={{ fontSize: 19 }} />
                  ) : null}
                </Box>

                <Typography
                  sx={{
                    mt: 1,
                    fontSize: { xs: 10.5, sm: 12 },
                    fontWeight: current || reached ? 800 : 600,
                    color: current ? themeColor : reached ? "text.primary" : "text.secondary",
                    lineHeight: 1.25,
                  }}
                >
                  {step.label}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {status === "pending_acceptance" ? (
          <Stack direction="row" justifyContent="center" alignItems="center" spacing={0.8} sx={{ mt: 2 }}>
            <AccessTimeRoundedIcon sx={{ color: themeColor, fontSize: 18 }} />
            <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
              La sucursal todavía debe aceptar tu pedido.
            </Typography>
          </Stack>
        ) : null}
      </Box>
    </Card>
  );
}

function formatDateTime(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
