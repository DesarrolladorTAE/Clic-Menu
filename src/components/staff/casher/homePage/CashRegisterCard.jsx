import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
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

  const isBusy = !!activeSession;

  return (
    <Card
      sx={{
        height: 250,
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
              label={isBusy ? "Ocupada" : "Disponible"}
              sx={{
                fontWeight: 800,
                bgcolor: isBusy ? "#FFF4D9" : "#E7F8EB",
                color: isBusy ? "#8A6D3B" : "#0A7A2F",
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
                color: "text.primary",
                lineHeight: 1.5,
                wordBreak: "break-word",
              }}
            >
              {isBusy
                ? `Tiene sesión abierta por ${activeUser || "otro usuario"}`
                : "Lista para abrir una nueva sesión."}
            </Typography>
          </Box>

          <Box sx={{ flex: 1 }} />

          <Button
            variant={isBusy ? "outlined" : "contained"}
            color={isBusy ? "inherit" : "primary"}
            disabled={disabled || isBusy}
            onClick={() => onOpen?.(register)}
            startIcon={isBusy ? <LockRoundedIcon /> : <PointOfSaleRoundedIcon />}
            sx={{
              height: 44,
              borderRadius: 2,
              fontWeight: 800,
            }}
          >
            {isBusy ? "No disponible" : "Abrir esta caja"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
