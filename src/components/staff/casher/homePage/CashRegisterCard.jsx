import React from "react";
import {
  Box, Button, Card, CardContent, Chip, Stack, Typography,
} from "@mui/material";
import PointOfSaleRoundedIcon from "@mui/icons-material/PointOfSaleRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";

export default function CashRegisterCard({
  register,
  onOpen,
  disabled = false,
}) {
  const activeSession = register?.active_session || register?.activeSession || null;

  const activeUser = activeSession?.user
    ? [
        activeSession.user.name,
        activeSession.user.last_name_paternal,
        activeSession.user.last_name_maternal,
      ]
        .filter(Boolean)
        .join(" ")
    : null;

  const hasOpenSession =
    typeof register?.has_open_session === "boolean"
      ? register.has_open_session
      : !!activeSession;

  const isOpenByCurrentUser =
    register?.is_open_by_current_user === true;

  const canOpen =
    register?.can_open === true;

  const canResume =
    register?.can_resume === true &&
    isOpenByCurrentUser;

  const policyBlocked =
    register?.warehouse_policy?.ok === false;

  const policyMessage =
    register?.warehouse_policy?.message || "";

  const canUseRegister =
    canOpen || canResume;

  const statusLabel = policyBlocked
    ? "Bloqueada"
    : canResume
    ? "Tu caja abierta"
    : hasOpenSession
    ? "Ocupada"
    : canOpen
    ? "Disponible"
    : "No disponible";

  const statusMessage = policyBlocked
    ? policyMessage ||
      "Esta caja no puede operar con su configuración actual."
    : canResume
    ? "Tienes una sesión abierta en esta caja. Puedes retomarla."
    : hasOpenSession
    ? `Tiene sesión abierta por ${
        activeUser || "otro usuario"
      }`
    : canOpen
    ? "Lista para abrir una nueva sesión."
    : "Esta caja no está disponible para operar.";

  return (
    <Card
      sx={{
        minHeight: 250,
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
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <Stack spacing={1.5} sx={{ flex: 1, minHeight: 0 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={1}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "text.primary",
                  lineHeight: 1.1,
                  wordBreak: "break-word",
                }}
              >
                {register?.name || "Caja"}
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 13,
                  color: "text.secondary",
                }}
              >
                {register?.code || "Sin código"}
              </Typography>
            </Box>

            <Chip
              label={statusLabel}
              sx={{
                fontWeight: 800,
                bgcolor: policyBlocked
                  ? "#FDECEC"
                  : canResume
                  ? "#E8F0FE"
                  : hasOpenSession
                  ? "#FFF4D9"
                  : canOpen
                  ? "#E7F8EB"
                  : "#F2F2F2",
                color: policyBlocked
                  ? "#B42318"
                  : canResume
                  ? "#175CD3"
                  : hasOpenSession
                  ? "#8A6D3B"
                  : canOpen
                  ? "#0A7A2F"
                  : "#666666",
              }}
            />
          </Stack>

          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              backgroundColor: "#FCFCFC",
              p: 1.5,
              minHeight: 84,
            }}
          >
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 800,
                color: "text.secondary",
                textTransform: "uppercase",
              }}
            >
              Estado actual
            </Typography>

            <Typography
              sx={{
                mt: 0.75,
                fontSize: 14,
                color: policyBlocked
                  ? "error.main"
                  : "text.primary",
                lineHeight: 1.5,
                wordBreak: "break-word",
              }}
            >
              {statusMessage}
            </Typography>
          </Box>

          <Box sx={{ flex: 1 }} />

          <Button
            variant={
              canUseRegister
                ? "contained"
                : "outlined"
            }
            color={
              canUseRegister
                ? "primary"
                : "inherit"
            }
            disabled={
              disabled || !canUseRegister
            }
            onClick={() => onOpen?.(register)}
            startIcon={
              canUseRegister
                ? <PointOfSaleRoundedIcon />
                : <LockRoundedIcon />
            }
            sx={{
              height: 44,
              borderRadius: 2,
              fontWeight: 800,
            }}
          >
            {canResume
              ? "Retomar esta caja"
              : canOpen
              ? "Abrir esta caja"
              : policyBlocked
              ? "Caja bloqueada"
              : "No disponible"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
