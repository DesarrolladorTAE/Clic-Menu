import React from "react";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";

export default function WaiterTablesHeader({
  meta,
  summary,
  refreshing,
  onDashboard,
}) {
  const chips = [
    { label: `Libre: ${summary?.free || 0}`, bg: "#E7F8EB", color: "#0A7A2F" },
    { label: `Llamando: ${summary?.call || 0}`, bg: "#FFF4D9", color: "#8A6D3B" },
    { label: `Atendiendo: ${summary?.mine || 0}`, bg: "#EAF2FF", color: "#0B4DB3" },
    { label: `Ocupada: ${summary?.locked || 0}`, bg: "#F3F4F6", color: "#374151" },
    { label: `Bloqueada: ${summary?.blocked || 0}`, bg: "#EFEFF3", color: "#4B5563" },
    { label: `Pendiente: ${summary?.pending || 0}`, bg: "#FFF4D9", color: "#8A6D3B" },
  ];

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        backgroundColor: "background.paper",
        px: { xs: 2, sm: 2.5, md: 3 },
        py: { xs: 2, sm: 2.5 },
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
      >
        <Box>
          <Typography
            sx={{
              fontSize: { xs: 28, md: 38 },
              fontWeight: 800,
              lineHeight: 1.08,
              color: "text.primary",
            }}
          >
            Tablero de mesas
          </Typography>

          <Typography
            sx={{
              mt: 1,
              fontSize: { xs: 13, md: 15 },
              color: "text.secondary",
              lineHeight: 1.5,
            }}
          >
            Sucursal: <strong>{meta?.branch_id ?? "—"}</strong> · Staff:{" "}
            <strong>{meta?.staff_id ?? "—"}</strong> · Servicio:{" "}
            <strong>{meta?.table_service_mode ?? "—"}</strong> · Modo pedido:{" "}
            <strong>{meta?.ordering_mode ?? "—"}</strong>
            {refreshing ? (
              <span style={{ marginLeft: 10, opacity: 0.7 }}>Actualizando…</span>
            ) : null}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          onClick={onDashboard}
          startIcon={<DashboardRoundedIcon />}
          sx={{
            minWidth: { xs: "100%", sm: 190 },
            height: 42,
            borderRadius: 2,
          }}
        >
          Dashboard
        </Button>
      </Stack>

      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        flexWrap="wrap"
        sx={{ mt: 2 }}
      >
        {chips.map((chip) => (
          <Chip
            key={chip.label}
            label={chip.label}
            sx={{
              bgcolor: chip.bg,
              color: chip.color,
              fontWeight: 800,
              borderRadius: 999,
            }}
          />
        ))}
      </Stack>
    </Box>
  );
}