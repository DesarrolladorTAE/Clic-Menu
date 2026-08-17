// Para poner las imágenes de la parte de seguimiento
import React, { useMemo } from "react";
import {
  Box, Card, Chip, Divider, Stack, Typography,
} from "@mui/material";

import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";

const TRACKING_IMAGE_BASE = "/images/order-tracking";

const STATUS_ARTWORK = {
  processing: `${TRACKING_IMAGE_BASE}/online-order-pending-acceptance.png`,
  pending_confirmation: `${TRACKING_IMAGE_BASE}/online-order-pending-acceptance.png`,
  pending_acceptance: `${TRACKING_IMAGE_BASE}/online-order-pending-acceptance.png`,

  accepted: `${TRACKING_IMAGE_BASE}/online-order-accepted.png`,
  confirmed_for_preparation: `${TRACKING_IMAGE_BASE}/online-order-accepted.png`,
  received: `${TRACKING_IMAGE_BASE}/online-order-accepted.png`,

  preparing: `${TRACKING_IMAGE_BASE}/online-order-preparing.png`,
  ready: `${TRACKING_IMAGE_BASE}/online-order-ready.png`,
  out_for_delivery: `${TRACKING_IMAGE_BASE}/online-order-out-for-delivery.png`,

  delivered: `${TRACKING_IMAGE_BASE}/online-order-completed.png`,
  completed: `${TRACKING_IMAGE_BASE}/online-order-completed.png`,

  rejected: `${TRACKING_IMAGE_BASE}/online-order-rejected.png`,
  cancelled: `${TRACKING_IMAGE_BASE}/online-order-rejected.png`,

  unknown: `${TRACKING_IMAGE_BASE}/online-order-pending-acceptance.png`,
};

export default function TrackingTab({ data, themeColor }) {
  const status = String(data?.status || "unknown");
  const isNegative = ["rejected", "cancelled"].includes(status);

  const artworkUrl = STATUS_ARTWORK[status] || STATUS_ARTWORK.unknown;

  const timelineCodes = useMemo(
    () => new Set(
      (Array.isArray(data?.timeline) ? data.timeline : [])
        .map((item) => String(item?.status || "")),
    ),
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
          pt: { xs: 4.25, sm: 5.25 },
          pb: { xs: 3.5, sm: 4.5 },
          textAlign: "center",
          background: isNegative
            ? "linear-gradient(180deg, rgba(242,100,42,0.08) 0%, rgba(255,255,255,0) 100%)"
            : `linear-gradient(180deg, ${themeColor}14 0%, rgba(255,255,255,0) 100%)`,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: { xs: 210, sm: 285 },
            height: { xs: 210, sm: 285 },
            borderRadius: "50%",
            backgroundColor: isNegative
              ? "rgba(242,100,42,0.06)"
              : `${themeColor}0D`,
            top: { xs: -75, sm: -105 },
            right: { xs: -75, sm: -85 },
          }}
        />

        {/* Círculo principal de la ilustración */}
        <Box
          sx={{
            width: { xs: 190, sm: 220, md: 240 },
            height: { xs: 190, sm: 220, md: 240 },
            mx: "auto",
            mb: { xs: 3, sm: 3.5 },
            position: "relative",
            zIndex: 1,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            border: "1px solid",
            borderColor: `${themeColor}30`,
            background: `radial-gradient(circle at 50% 42%, ${themeColor}16 0%, ${themeColor}0D 45%, ${themeColor}08 72%, rgba(255,255,255,0.92) 100%)`,
            boxShadow: `0 8px 28px ${themeColor}12`,
            "@keyframes trackingPulse": {
              "0%, 100%": {
                transform: "scale(1)",
                boxShadow: `0 8px 28px ${themeColor}12, 0 0 0 0 ${themeColor}00`,
              },
              "50%": {
                transform: "scale(1.025)",
                boxShadow: `0 10px 34px ${themeColor}18, 0 0 0 11px ${themeColor}0A`,
              },
            },
            animation:
              ["completed", "rejected", "cancelled"].includes(status)
                ? "none"
                : "trackingPulse 2.4s ease-in-out infinite",
          }}
        >
          {/* Segundo círculo: aquí queda centrada realmente la imagen */}
          <Box
            sx={{
              position: "absolute",
              inset: { xs: 12, sm: 14, md: 15 },
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              overflow: "hidden",
              border: "1px solid",
              borderColor: `${themeColor}18`,
              backgroundColor: `${themeColor}08`,
            }}
          >
            <Box
              component="img"
              src={artworkUrl}
              alt=""
              aria-hidden="true"
              sx={{
                width: "92%",
                height: "92%",
                objectFit: "contain",
                objectPosition: "center center",
                display: "block",
                pointerEvents: "none",
                userSelect: "none",
              }}
            />
          </Box>
        </Box>

        <Chip
          label={`Pedido ${data?.public_number || ""}`}
          size="small"
          sx={{
            mb: 1.5,
            backgroundColor: isNegative
              ? "rgba(242,100,42,0.10)"
              : `${themeColor}16`,
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
            <Typography
              sx={{
                fontSize: 13,
                color: "text.primary",
                lineHeight: 1.55,
              }}
            >
              {data.status_reason}
            </Typography>
          </Box>
        ) : null}
      </Box>

      <Divider />

      <Box
        sx={{
          px: { xs: 1.5, sm: 3 },
          py: { xs: 3, sm: 3.5 },
        }}
      >
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
                    borderColor:
                      reached || current
                        ? themeColor
                        : "divider",
                    backgroundColor:
                      reached || current
                        ? themeColor
                        : "background.paper",
                    color:
                      reached || current
                        ? "#fff"
                        : "text.secondary",
                    transition: "all 300ms ease",
                    boxShadow: current
                      ? `0 0 0 5px ${themeColor}18`
                      : "none",
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
                    color: current
                      ? themeColor
                      : reached
                        ? "text.primary"
                        : "text.secondary",
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
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={0.8}
            sx={{ mt: 2 }}
          >
            <AccessTimeRoundedIcon
              sx={{
                color: themeColor,
                fontSize: 18,
              }}
            />

            <Typography
              sx={{
                fontSize: 12.5,
                color: "text.secondary",
              }}
            >
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