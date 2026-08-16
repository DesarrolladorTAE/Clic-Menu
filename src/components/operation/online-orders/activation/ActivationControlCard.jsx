import { useState } from "react";
import {
  Box, Button, Chip, Dialog, DialogContent, DialogTitle, IconButton,
  Paper, Stack, Switch, Typography, useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import PowerSettingsNewRoundedIcon from "@mui/icons-material/PowerSettingsNewRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";

export default function ActivationControlCard({
  branchName,
  isActive = false,
  canActivate = false,
  saving = false,
  onChange,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [nextValue, setNextValue] = useState(false);

  const statusColor = isActive
    ? theme.palette.success.main
    : canActivate
      ? theme.palette.primary.main
      : theme.palette.warning.main;

  const requestChange = (value) => {
    if (saving) return;
    if (value && !canActivate) return;

    setNextValue(value);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    if (saving) return;
    setConfirmOpen(false);
  };

  const confirm = async () => {
    await onChange?.(nextValue);
    setConfirmOpen(false);
  };

  return (
    <>
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
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 1,
                display: "grid",
                placeItems: "center",
                bgcolor: alpha(statusColor, 0.1),
                color: statusColor,
                flexShrink: 0,
              }}
            >
              <PowerSettingsNewRoundedIcon />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
                Estado de Pedidos en línea
              </Typography>

              <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary", lineHeight: 1.55 }}>
                {branchName
                  ? `Controla si ${branchName} puede recibir y operar Pedidos en línea.`
                  : "Controla si esta sucursal puede recibir y operar Pedidos en línea."}
              </Typography>
            </Box>
          </Stack>

          <Box
            sx={{
              p: { xs: 2, sm: 2.25 },
              borderRadius: 1,
              border: "1px solid",
              borderColor: isActive
                ? "success.main"
                : canActivate
                  ? "primary.main"
                  : "divider",
              bgcolor: alpha(statusColor, 0.06),
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
              spacing={{ xs: 2, sm: 3 }}
            >
              <Stack
                direction="row"
                spacing={1.25}
                alignItems="flex-start"
                sx={{ flex: 1, minWidth: 0 }}
              >
                <Box sx={{ mt: 0.15, flexShrink: 0 }}>
                  {isActive ? (
                    <CheckCircleRoundedIcon color="success" />
                  ) : canActivate ? (
                    <CheckCircleRoundedIcon color="primary" />
                  ) : (
                    <ErrorOutlineRoundedIcon color="warning" />
                  )}
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    flexWrap="wrap"
                    useFlexGap
                  >
                    <Typography sx={{ fontSize: 15, fontWeight: 800, color: "text.primary" }}>
                      {isActive
                        ? "Pedidos en línea está activo"
                        : "Pedidos en línea está inactivo"}
                    </Typography>

                    <Chip
                      size="small"
                      label={isActive ? "Activo" : "Inactivo"}
                      color={isActive ? "success" : "default"}
                      variant={isActive ? "filled" : "outlined"}
                    />
                  </Stack>

                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: 12.5,
                      color: "text.secondary",
                      lineHeight: 1.5,
                    }}
                  >
                    {isActive
                      ? "La sucursal puede recibir nuevos Pedidos en línea."
                      : canActivate
                        ? "La sucursal ya está preparada. Activa el servicio cuando quieras comenzar."
                        : "Completa los elementos pendientes antes de poder activar el servicio."}
                  </Typography>
                </Box>
              </Stack>

              <Stack
                direction="row"
                alignItems="center"
                justifyContent={{ xs: "space-between", sm: "flex-end" }}
                spacing={1.25}
                sx={{
                  flexShrink: 0,
                  pl: { xs: 0, sm: 2 },
                }}
              >
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "text.primary",
                  }}
                >
                  {isActive ? "Desactivar" : "Activar"}
                </Typography>

                <Switch
                  checked={!!isActive}
                  disabled={saving || (!isActive && !canActivate)}
                  onChange={(event) => requestChange(event.target.checked)}
                  color="primary"
                  inputProps={{ "aria-label": "Estado de Pedidos en línea" }}
                  sx={{
                    transform: "scale(1.2)",
                    transformOrigin: "center",
                  }}
                />
              </Stack>
            </Stack>
          </Box>

          {!isActive && !canActivate ? (
            <Typography sx={{ fontSize: 12.5, color: "text.secondary", lineHeight: 1.55 }}>
              Revisa la preparación que aparece debajo para identificar qué falta configurar.
            </Typography>
          ) : null}
        </Stack>
      </Paper>

      <Dialog
        open={confirmOpen}
        onClose={saving ? undefined : closeConfirm}
        fullWidth
        maxWidth="sm"
        fullScreen={isMobile}
        slotProps={{
          paper: {
            sx: {
              borderRadius: { xs: 0, sm: 1 },
              overflow: "hidden",
              backgroundColor: "background.paper",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            bgcolor: "primary.main",
            color: "#fff",
          }}
        >
          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Box>
              <Typography
                sx={{
                  fontSize: { xs: 20, sm: 22 },
                  fontWeight: 800,
                  color: "#fff",
                }}
              >
                {nextValue
                  ? "Activar Pedidos en línea"
                  : "Desactivar Pedidos en línea"}
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.86)",
                }}
              >
                {branchName || "Sucursal seleccionada"}
              </Typography>
            </Box>

            <IconButton
              onClick={closeConfirm}
              disabled={saving}
              sx={{ color: "#fff" }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent
          sx={{
            p: { xs: 2, sm: 3 },
            bgcolor: "background.default",
          }}
        >
          <Paper
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "none",
              backgroundColor: "background.paper",
            }}
          >
            <Stack spacing={2.5}>
              <Typography
                sx={{
                  fontSize: 14,
                  color: "text.primary",
                  lineHeight: 1.65,
                }}
              >
                {nextValue
                  ? "La sucursal comenzará a operar Pedidos en línea con la configuración que preparaste."
                  : "La configuración se conservará, pero la sucursal dejará de recibir nuevos Pedidos en línea. Los QR activos correspondientes a este servicio también se desactivarán."}
              </Typography>

              <Stack
                direction={{ xs: "column-reverse", sm: "row" }}
                justifyContent="flex-end"
                spacing={1.5}
              >
                <Button
                  type="button"
                  variant="outlined"
                  onClick={closeConfirm}
                  disabled={saving}
                  sx={{
                    minWidth: { xs: "100%", sm: 140 },
                    height: 44,
                  }}
                >
                  Cancelar
                </Button>

                <Button
                  type="button"
                  variant="contained"
                  onClick={confirm}
                  disabled={saving}
                  sx={{
                    minWidth: { xs: "100%", sm: 180 },
                    height: 44,
                    fontWeight: 800,
                  }}
                >
                  {saving
                    ? "Guardando…"
                    : nextValue
                      ? "Sí, activar"
                      : "Sí, desactivar"}
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </DialogContent>
      </Dialog>
    </>
  );
}