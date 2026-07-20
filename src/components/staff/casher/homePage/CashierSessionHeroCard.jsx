import React from "react";
import {
  Box, Button, Card, CardContent, Chip, Stack, Typography,
} from "@mui/material";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import LockOpenRoundedIcon from "@mui/icons-material/LockOpenRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

export default function CashierSessionHeroCard({
  currentSession,
  onCloseSession,
  onGoQueue,
  onExit,
  exitLabel = "Regresar",
  closing = false,
  showExitButton = true, // 👈 nueva prop
}) {
  const hasSession = !!currentSession?.id;

  const canOperate =
    hasSession &&
    currentSession?.can_operate === true;

  const policyMessage =
    currentSession?.warehouse_policy?.message ||
    "La caja abierta no puede operar con su configuración actual.";

  const isLogout = exitLabel === "Cerrar sesión";

  return (
    <Card
      sx={{
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
        borderRadius: 1,
        backgroundColor: "background.paper",
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2.25}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: { xs: 28, md: 40 },
                  fontWeight: 800,
                  color: "text.primary",
                  lineHeight: 1.06,
                }}
              >
                Caja
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  color: "text.secondary",
                  fontSize: { xs: 14, md: 16 },
                  lineHeight: 1.5,
                }}
              >
                {hasSession
                  ? canOperate
                    ? "Tu caja ya está abierta. Desde aquí puedes pasar al tablero de cobro o cerrarla cuando ya no tengas ventas tomadas."
                    : "Tu caja está abierta, pero no puede operar hasta corregir su configuración."
                  : "Antes de cobrar, necesitas abrir una caja activa de tu sucursal."}
              </Typography>
            </Box>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.25}
              alignItems={{ xs: "stretch", sm: "center" }}
              sx={{ width: { xs: "100%", md: "auto" } }}
            >
              <Chip
                icon={
                  hasSession && canOperate
                    ? <LockOpenRoundedIcon />
                    : <LockRoundedIcon />
                }
                label={
                  hasSession
                    ? canOperate
                      ? "Caja abierta"
                      : "Caja bloqueada"
                    : "Sin caja abierta"
                }
                sx={{
                  fontWeight: 800,
                  bgcolor:
                    hasSession && !canOperate
                      ? "#FDECEC"
                      : hasSession
                      ? "#E7F8EB"
                      : "#FFF4D9",
                  color:
                    hasSession && !canOperate
                      ? "#B42318"
                      : hasSession
                      ? "#0A7A2F"
                      : "#8A6D3B",
                }}
              />

              {showExitButton && (
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={onExit}
                  startIcon={
                    isLogout ? <LogoutRoundedIcon /> : <ArrowBackRoundedIcon />
                  }
                  sx={{
                    minWidth: { xs: "100%", sm: 170 },
                    height: 44,
                    borderRadius: 2,
                    fontWeight: 800,
                  }}
                >
                  {exitLabel}
                </Button>
              )}
            </Stack>
          </Stack>

          {hasSession ? (
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                backgroundColor: "#FCFCFC",
                p: 2,
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="space-between"
              >
                <InfoItem
                  label="Caja"
                  value={currentSession?.cash_register?.name || "—"}
                />

                <InfoItem
                  label="Sucursal"
                  value={currentSession?.branch?.name || "—"}
                />

                <InfoItem
                  label="Abierta desde"
                  value={formatDateTime(currentSession?.opened_at)}
                />
              </Stack>
            </Box>
          ) : null}

          {hasSession && !canOperate ? (
            <Box
              sx={{
                border: "1px solid",
                borderColor: "error.main",
                borderRadius: 1,
                bgcolor: "#FDECEC",
                p: 1.5,
              }}
            >
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "error.main",
                  lineHeight: 1.5,
                }}
              >
                {policyMessage}
              </Typography>
            </Box>
          ) : null}

          {hasSession ? (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              justifyContent="flex-end"
            >
              <Button
                variant="outlined"
                color="inherit"
                onClick={onCloseSession}
                disabled={closing}
                startIcon={<LockRoundedIcon />}
                sx={{
                  minWidth: { xs: "100%", sm: 170 },
                  height: 44,
                  borderRadius: 2,
                }}
              >
                {closing ? "Cerrando…" : "Cerrar caja"}
              </Button>

              <Button
                variant="contained"
                onClick={onGoQueue}
                disabled={!canOperate || closing}
                startIcon={<ArrowForwardRoundedIcon />}
                sx={{
                  minWidth: { xs: "100%", sm: 220 },
                  height: 44,
                  borderRadius: 2,
                  fontWeight: 800,
                }}
              >
                {canOperate
                  ? "Ir al tablero de cobro"
                  : "Tablero no disponible"}
              </Button>
            </Stack>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

function InfoItem({ label, value }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 800,
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          mt: 0.5,
          fontSize: 15,
          fontWeight: 800,
          color: "text.primary",
          wordBreak: "break-word",
        }}
      >
        {value || "—"}
      </Typography>
    </Box>
  );
}

function formatDateTime(value) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}