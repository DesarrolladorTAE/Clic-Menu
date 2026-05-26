import React from "react";
import {
  Alert, Box,Button, Dialog, DialogContent, DialogTitle, IconButton, Stack, TextField, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

export default function CashierRefundFullCancelDialog({
  open = false,
  onClose,
  summary = null,
  reason = "",
  onReasonChange,
  onSubmit,
  busy = false,
  disabled = false,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const sale = summary?.sale || null;
  const available = Number(sale?.available_to_refund || 0);
  const canSubmit =
    !busy &&
    !disabled &&
    available > 0 &&
    String(reason || "").trim().length > 0;

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 1 },
          overflow: "hidden",
          backgroundColor: "background.paper",
          boxShadow: "none",
          border: "1px solid",
          borderColor: "divider",
        },
      }}
    >
      <DialogTitle
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          bgcolor: "#111111",
          color: "#fff",
        }}
      >
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 1.5,
                display: "grid",
                placeItems: "center",
                bgcolor: "error.main",
                color: "#fff",
              }}
            >
              <ReplayRoundedIcon />
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: { xs: 20, sm: 24 }, color: "#fff" }}>
                Cancelaciones/devoluciones
              </Typography>

              <Typography sx={{ mt: 0.5, fontSize: 13, color: "rgba(255,255,255,0.82)" }}>
                Aplica una devolución total sobre la venta seleccionada.
              </Typography>
            </Box>
          </Stack>

          <IconButton
            onClick={onClose}
            disabled={busy}
            sx={{
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.08)",
              borderRadius: 1,
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: "background.default" }}>
        <Stack spacing={2.5}>
          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              bgcolor: "background.paper",
              p: 2,
            }}
          >
            <Stack spacing={1}>
              <Typography sx={{ fontSize: 16, fontWeight: 800, color: "text.primary" }}>
                Venta #{sale?.id || "—"}
              </Typography>

              <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.55 }}>
                Total cobrado: <strong>{formatCurrency(sale?.total)}</strong>
              </Typography>

              <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.55 }}>
                Disponible para devolución: <strong>{formatCurrency(sale?.available_to_refund)}</strong>
              </Typography>
            </Stack>
          </Box>

          {available <= 0 ? (
            <Alert severity="warning" sx={{ borderRadius: 1 }}>
              Esta venta ya no tiene saldo disponible para devolución.
            </Alert>
          ) : null}

          {disabled ? (
            <Alert severity="warning" sx={{ borderRadius: 1 }}>
              Esta venta solo está disponible para consulta. No se puede aplicar devolución desde esta caja.
            </Alert>
          ) : null}

          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              bgcolor: "background.paper",
              p: 2,
            }}
          >
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <WarningAmberRoundedIcon color="error" />
                <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
                  Devolución total
                </Typography>
              </Stack>

              <FieldBlock
                label="Motivo de la cancelación/devolución *"
                input={
                  <TextField
                    fullWidth
                    value={reason || ""}
                    onChange={(e) => onReasonChange?.(e.target.value)}
                    placeholder="Ej. Cliente canceló completamente después del cobro"
                    disabled={busy || disabled || available <= 0}
                    multiline
                    minRows={3}
                  />
                }
                help="Este motivo quedará registrado en el historial de la venta."
              />

              <Stack
                direction={{ xs: "column-reverse", sm: "row" }}
                justifyContent="flex-end"
                spacing={1.5}
              >
                <Button
                  variant="outlined"
                  onClick={onClose}
                  disabled={busy}
                  sx={{
                    minWidth: { xs: "100%", sm: 140 },
                    height: 44,
                    borderRadius: 2,
                    fontWeight: 800,
                  }}
                >
                  Cancelar
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  onClick={onSubmit}
                  disabled={!canSubmit}
                  startIcon={<ReplayRoundedIcon />}
                  sx={{
                    minWidth: { xs: "100%", sm: 240 },
                    height: 44,
                    borderRadius: 2,
                    fontWeight: 800,
                  }}
                >
                  {busy ? "Procesando…" : "Aplicar devolución total"}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

function FieldBlock({ label, input, help }) {
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

      {help ? (
        <Typography
          sx={{
            mt: 0.75,
            fontSize: 12,
            color: "text.secondary",
            lineHeight: 1.45,
          }}
        >
          {help}
        </Typography>
      ) : null}
    </Box>
  );
}

function formatCurrency(value) {
  const safe = Number(value || 0);

  try {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    }).format(safe);
  } catch {
    return `$${safe.toFixed(2)}`;
  }
}