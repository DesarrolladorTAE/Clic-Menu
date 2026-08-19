import React, { useState } from "react";
import {
  Box, Button, Card, CardContent, Chip, CircularProgress, Divider, IconButton, Menu, MenuItem, Stack, Typography,
} from "@mui/material";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import AssignmentReturnRoundedIcon from "@mui/icons-material/AssignmentReturnRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import WhereToVoteRoundedIcon from "@mui/icons-material/WhereToVoteRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";

import {
  financialStatusColor,
  financialStatusLabel,
  formatCurrency,
  formatDateTime,
  fulfillmentLabel,
  onlineOrderStatusColor,
  onlineOrderStatusLabel,
  paymentTypeLabel,
  timingLabel,
} from "./onlineOrderDisplay";

const CARD_ACTIONS = [
  "accept",
  "reject",
  "take",
  "release",
  "confirm_preparation",
  "start_preparation",
  "mark_ready",
  "out_for_delivery",
  "arrived_at_destination",
  "deliver",
];

export default function CashierOnlineOrderCard({
  order,
  disabled = false,
  busyAction = "",
  onOpenDetail,
  onAction,
}) {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  const orderMissing = order?.order_missing === true;
  const scheduledValue = order?.requested_for_at || order?.estimated_for_at;
  const actionsDisabled = disabled || Boolean(busyAction);

  const backendActions = Array.isArray(order?.actions) ? order.actions : [];
  const canCancelOrder = backendActions.includes("cancel");
  const menuOpen = Boolean(menuAnchorEl);
  const paymentAction = backendActions.includes("pay")
    ? "pay"
    : backendActions.includes("prepare_payment")
    ? "prepare_payment"
    : null;

  const actions = [
    ...backendActions.filter((action) => CARD_ACTIONS.includes(action)),
    ...(paymentAction ? [paymentAction] : []),
  ];

  const handleOpenMenu = (event) => {
    if (actionsDisabled) return;
    setMenuAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => setMenuAnchorEl(null);

  const handleCancelOrder = () => {
    setMenuAnchorEl(null);
    onAction?.("cancel", order);
  };

  return (
    <Card
      sx={{
        height: "100%",
        minHeight: { xs: 390, sm: 410 },
        display: "flex",
        flexDirection: "column",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        boxShadow: "none",
        backgroundColor: "background.paper",
      }}
    >
      <CardContent
        sx={{
          p: 2,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          "&:last-child": { pb: 2 },
        }}
      >
        <Stack spacing={1.5} sx={{ flex: 1 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={1}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                sx={{
                  fontSize: 19,
                  fontWeight: 800,
                  color: "text.primary",
                  lineHeight: 1.15,
                  wordBreak: "break-word",
                }}
              >
                {order?.public_number ? `Pedido ${order.public_number}` : "Pedido sin número"}
              </Typography>

              <Typography
                sx={{
                  mt: 0.45,
                  fontSize: 14,
                  fontWeight: 700,
                  color: "text.primary",
                  wordBreak: "break-word",
                }}
              >
                {order?.order_name || "Cliente sin nombre"}
              </Typography>

              <Typography
                sx={{
                  mt: 0.35,
                  fontSize: 12,
                  color: "text.secondary",
                  wordBreak: "break-word",
                }}
              >
                {order?.customer_phone || "Teléfono no disponible"}
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={0.75}
              alignItems="center"
              justifyContent="flex-end"
              sx={{
                ml: { sm: "auto" },
                alignSelf: { xs: "flex-end", sm: "flex-start" },
                maxWidth: { xs: "100%", sm: "58%" },
              }}
            >
              <Chip
                label={financialStatusLabel(order?.financial_status)}
                size="small"
                color={financialStatusColor(order?.financial_status)}
                variant="outlined"
                sx={{ fontWeight: 800 }}
              />

              {canCancelOrder ? (
                <>
                  <IconButton
                    type="button"
                    size="small"
                    aria-label="Más opciones"
                    aria-controls={menuOpen ? `online-order-menu-${order?.id}` : undefined}
                    aria-haspopup="true"
                    aria-expanded={menuOpen ? "true" : undefined}
                    disabled={actionsDisabled}
                    onClick={handleOpenMenu}
                    sx={{
                      width: 32,
                      height: 32,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      color: "text.secondary",
                      "&:hover": { borderColor: "primary.main", color: "primary.main", bgcolor: "action.hover" },
                    }}
                  >
                    <MoreVertRoundedIcon fontSize="small" />
                  </IconButton>

                  <Menu
                    id={`online-order-menu-${order?.id}`}
                    anchorEl={menuAnchorEl}
                    open={menuOpen}
                    onClose={handleCloseMenu}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                    slotProps={{
                      paper: {
                        sx: {
                          mt: 0,
                          minWidth: 190,
                          borderRadius: 0,
                          border: "1px solid",
                          borderColor: "divider",
                          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                        },
                      },
                    }}
                  >
                    <MenuItem
                      onClick={handleCancelOrder}
                      disabled={actionsDisabled}
                      sx={{
                        minWidth: 190,
                        minHeight: 44,
                        gap: 1.25,
                        px: 2,
                        borderRadius: 0,
                        color: "text.primary",
                        fontSize: 14,
                        fontWeight: 500,
                        "&:hover": { bgcolor: "action.hover" },
                        "& .MuiSvgIcon-root": { color: "text.secondary" },
                      }}
                    >
                      <CloseRoundedIcon fontSize="small" />
                      Cancelar pedido
                    </MenuItem>
                  </Menu>
                </>
              ) : null}
            </Stack>
          </Stack>

          <Divider />

          <Stack spacing={1.1}>
            <DetailRow
              icon={<LocalShippingRoundedIcon fontSize="small" />}
              label="Entrega"
              value={fulfillmentLabel(order?.fulfillment_type)}
            />

            <DetailRow
              icon={<AccessTimeRoundedIcon fontSize="small" />}
              label="Horario"
              value={
                scheduledValue
                  ? `${timingLabel(order?.timing_type)} · ${formatDateTime(scheduledValue)}`
                  : timingLabel(order?.timing_type)
              }
            />

            <DetailRow
              icon={<PaymentsRoundedIcon fontSize="small" />}
              label="Pago"
              value={paymentTypeLabel(order?.payment_type)}
            />
          </Stack>

          <Box
            sx={{
              p: 1.5,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              bgcolor: "background.default",
            }}
          >
            <Stack spacing={0.8}>
              <InfoRow label="Costo de entrega" value={formatCurrency(order?.delivery_fee)} />
              <Divider />
              <InfoRow label="Total" value={formatCurrency(order?.total)} strong />
            </Stack>
          </Box>

          <Box>
            <Typography sx={helperLabelSx}>Recibido</Typography>
            <Typography sx={helperValueSx}>{formatDateTime(order?.created_at)}</Typography>
          </Box>

          {orderMissing ? (
            <Typography sx={{ fontSize: 13, lineHeight: 1.5, color: "error.main", fontWeight: 700 }}>
              No fue posible cargar toda la información de este pedido.
            </Typography>
          ) : null}

          <Box sx={{ flex: 1 }} />

          <Stack spacing={1}>
            <Button
              type="button"
              variant="contained"
              disabled={actionsDisabled || orderMissing || !Number(order?.id || 0)}
              onClick={() => onOpenDetail?.(order)}
              endIcon={<ArrowForwardRoundedIcon />}
              sx={{ minHeight: 44, width: "100%", fontWeight: 800 }}
            >
              Ver pedido
            </Button>

            {actions.length > 0 ? (
              <Box
                sx={{
                  display: "grid",
                  gap: 1,
                  gridTemplateColumns: actions.length > 1 ? "repeat(2, minmax(0, 1fr))" : "minmax(0, 1fr)",
                }}
              >
                {actions.map((action, index) => {
                  const config = actionConfig(action);
                  if (!config) return null;

                  const spansFullRow = actions.length > 1 && actions.length % 2 === 1 && index === actions.length - 1;

                  return (
                    <Button
                      key={action}
                      type="button"
                      variant={config.variant}
                      color={config.color}
                      disabled={actionsDisabled}
                      onClick={() => onAction?.(action, order)}
                      startIcon={busyAction === action ? <CircularProgress size={17} color="inherit" /> : config.icon}
                      sx={{
                        minWidth: 0,
                        minHeight: 44,
                        gridColumn: spansFullRow ? "1 / -1" : "auto",
                        px: { xs: 1, sm: 2 },
                        fontSize: { xs: 12.5, sm: 14 },
                        fontWeight: 800,
                      }}
                    >
                      {busyAction === action ? config.loadingLabel : config.label}
                    </Button>
                  );
                })}
              </Box>
            ) : null}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Box sx={{ mt: 0.1, color: "primary.main", flexShrink: 0 }}>{icon}</Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 11, fontWeight: 800, color: "text.secondary", textTransform: "uppercase" }}>
          {label}
        </Typography>

        <Typography sx={{ mt: 0.2, fontSize: 13, fontWeight: 700, color: "text.primary", wordBreak: "break-word" }}>
          {value || "—"}
        </Typography>
      </Box>
    </Stack>
  );
}

function InfoRow({ label, value, strong = false }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={1.5}>
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: strong ? 800 : 700,
          color: strong ? "text.primary" : "text.secondary",
        }}
      >
        {label}
      </Typography>

      <Typography sx={{ fontSize: 13, fontWeight: 800, color: "text.primary", textAlign: "right" }}>
        {value}
      </Typography>
    </Stack>
  );
}

function actionConfig(action) {
  const configs = {
    accept: {
      label: "Aceptar pedido",
      loadingLabel: "Aceptando…",
      color: "secondary",
      variant: "contained",
      icon: <CheckCircleRoundedIcon />,
    },
    reject: {
      label: "Rechazar",
      loadingLabel: "Rechazando…",
      color: "error",
      variant: "outlined",
      icon: <CloseRoundedIcon />,
    },
    take: {
      label: "Tomar pedido",
      loadingLabel: "Tomando…",
      color: "secondary",
      variant: "contained",
      icon: <AssignmentTurnedInRoundedIcon />,
    },
    release: {
      label: "Liberar pedido",
      loadingLabel: "Liberando…",
      color: "secondary",
      variant: "outlined",
      icon: <AssignmentReturnRoundedIcon />,
    },
    confirm_preparation: {
      label: "Confirmar preparación",
      loadingLabel: "Confirmando…",
      color: "secondary",
      variant: "contained",
      icon: <RestaurantRoundedIcon />,
    },
    start_preparation: {
      label: "Iniciar preparación",
      loadingLabel: "Iniciando…",
      color: "secondary",
      variant: "contained",
      icon: <PlayArrowRoundedIcon />,
    },
    mark_ready: {
      label: "Marcar como listo",
      loadingLabel: "Actualizando…",
      color: "secondary",
      variant: "contained",
      icon: <TaskAltRoundedIcon />,
    },
    out_for_delivery: {
      label: "Marcar en camino",
      loadingLabel: "Actualizando…",
      color: "secondary",
      variant: "contained",
      icon: <LocalShippingRoundedIcon />,
    },
    arrived_at_destination: {
      label: "Llegó al destino",
      loadingLabel: "Actualizando…",
      color: "secondary",
      variant: "contained",
      icon: <WhereToVoteRoundedIcon />,
    },
    prepare_payment: {
      label: "Registrar cobro",
      loadingLabel: "Abriendo cobro…",
      color: "secondary",
      variant: "contained",
      icon: <PaymentsRoundedIcon />,
    },
    pay: {
      label: "Registrar cobro",
      loadingLabel: "Abriendo cobro…",
      color: "secondary",
      variant: "contained",
      icon: <PaymentsRoundedIcon />,
    },
    deliver: {
      label: "Marcar entregado",
      loadingLabel: "Finalizando…",
      color: "secondary",
      variant: "contained",
      icon: <DoneAllRoundedIcon />,
    },
  };

  return configs[action] || null;
}

const helperLabelSx = {
  fontSize: 11,
  fontWeight: 800,
  color: "text.secondary",
  textTransform: "uppercase",
  letterSpacing: 0.3,
};

const helperValueSx = {
  mt: 0.2,
  fontSize: 13,
  color: "text.primary",
  wordBreak: "break-word",
};