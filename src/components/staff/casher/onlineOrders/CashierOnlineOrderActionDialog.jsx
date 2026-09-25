import React, { useEffect, useState } from "react";
import {
  Box, Button, Card, CardContent, CircularProgress, Stack, TextField, Typography,
} from "@mui/material";

import AssignmentReturnRoundedIcon from "@mui/icons-material/AssignmentReturnRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";

import CashierDialogShell from "../shared/CashierDialogShell";

export default function CashierOnlineOrderActionDialog({
  open,
  action,
  order,
  submitting = false,
  onClose,
  onConfirm,
}) {
  const [reason, setReason] = useState("");
  const config = getActionConfig(action);

  useEffect(() => {
    if (open) setReason("");
  }, [open, action]);

  if (!config) return null;

  const requiresReason = Boolean(config.requiresReason);
  const canSubmit = !submitting && (!requiresReason || reason.trim().length > 0);

  return (
    <CashierDialogShell
      open={open}
      title={config.title}
      description={config.description}
      icon={action === "reject" ? null : config.icon}
      busy={submitting}
      maxWidth="sm"
      onClose={onClose}
    >
      <Card
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          boxShadow: "none",
          backgroundColor: "background.paper",
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 }, "&:last-child": { pb: { xs: 2, sm: 3 } } }}>
          <Stack spacing={2.5}>
            <Stack spacing={0.5}>
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: "text.secondary" }}>
                Pedido
              </Typography>

              <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary", wordBreak: "break-word" }}>
                {order?.public_number || "Sin número"}
              </Typography>

              <Typography sx={{ fontSize: 14, color: "text.secondary", wordBreak: "break-word" }}>
                {order?.order_name || "Cliente sin nombre"}
              </Typography>
            </Stack>

            {requiresReason ? (
              <FieldBlock
                label={config.reasonLabel}
                input={
                  <TextField
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    multiline
                    minRows={3}
                    fullWidth
                    disabled={submitting}
                    placeholder={config.reasonPlaceholder}
                  />
                }
              />
            ) : null}

            <Box
              sx={{
                px: 2,
                py: 1.5,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                backgroundColor: "background.default",
              }}
            >
              <Typography
                sx={{
                  fontSize: 13,
                  color: "text.secondary",
                  lineHeight: 1.55,
                  fontWeight: 500,
                }}
              >
                {config.notice}
              </Typography>
            </Box>

            <Stack
              direction={{ xs: "column-reverse", sm: "row" }}
              justifyContent="flex-end"
              spacing={1.5}
              sx={{
                "& > .MuiButton-root": {
                  width: { xs: "100%", sm: "auto" },
                  minWidth: { sm: 140 },
                },
              }}
            >
              <Button
                type="button"
                variant="outlined"
                onClick={onClose}
                disabled={submitting}
              >
                Regresar
              </Button>

              <Button
                type="button"
                variant="contained"
                color={config.color}
                disabled={!canSubmit}
                onClick={() => onConfirm?.({ reason: reason.trim() })}
                startIcon={
                  submitting
                    ? <CircularProgress size={17} color="inherit" />
                    : config.icon
                }
              >
                {submitting ? config.loadingLabel : config.confirmLabel}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </CashierDialogShell>
  );
}

function FieldBlock({ label, input }) {
  return (
    <Box sx={{ flex: 1, width: "100%" }}>
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 800,
          color: "text.primary",
          mb: 1,
        }}
      >
        {label}
      </Typography>

      {input}
    </Box>
  );
}

function getActionConfig(action) {
  const configs = {
    reject: {
      title: "Rechazar pedido",
      description: "Indica por qué este pedido no podrá ser atendido.",
      notice: "Una vez rechazado, el pedido dejará de estar disponible para las cajas.",
      confirmLabel: "Rechazar pedido",
      loadingLabel: "Rechazando…",
      color: "error",
      icon: <CloseRoundedIcon />,
      requiresReason: true,
      reasonLabel: "Motivo *",
      reasonPlaceholder: "Escribe el motivo por el que no se atenderá este pedido",
    },
    release: {
      title: "Liberar pedido",
      description: "El pedido dejará de estar asignado a esta caja.",
      notice: "Otra caja podrá tomarlo posteriormente y continuar su atención.",
      confirmLabel: "Liberar pedido",
      loadingLabel: "Liberando…",
      color: "secondary",
      icon: <AssignmentReturnRoundedIcon />,
    },
    deliver: {
      title: "Confirmar entrega",
      description: "Confirma que el cliente ya recibió su pedido.",
      notice: "El pedido debe estar pagado. Al confirmar la entrega, finalizará su atención.",
      confirmLabel: "Marcar entregado",
      loadingLabel: "Finalizando…",
      color: "primary",
      icon: <DoneAllRoundedIcon />,
    },
  };

  return configs[action] || null;
}