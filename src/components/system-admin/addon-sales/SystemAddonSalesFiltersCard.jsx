import React from "react";
import { Box, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";

const MONTHS = [
  { value: "1", label: "Enero" },
  { value: "2", label: "Febrero" },
  { value: "3", label: "Marzo" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Mayo" },
  { value: "6", label: "Junio" },
  { value: "7", label: "Julio" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

const PERIODS = [
  { value: "month", label: "Mensual" },
  { value: "year", label: "Anual" },
  { value: "all", label: "Todo el historial" },
];

export default function SystemAddonSalesFiltersCard({
  periodType,
  year,
  month,
  addonId,
  addons = [],
  q,
  total = 0,
  onChangePeriodType,
  onChangeYear,
  onChangeMonth,
  onChangeAddonId,
  onChangeQ,
}) {
  return (
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
      <Stack spacing={2}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "flex-start" }}>
          <Box sx={{ width: { xs: "100%", md: 190 } }}>
            <Typography sx={fieldLabelSx}>Periodo</Typography>

            <TextField select value={periodType} onChange={(e) => onChangePeriodType(e.target.value)} fullWidth>
              {PERIODS.map((item) => (
                <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
              ))}
            </TextField>
          </Box>

          {periodType !== "all" && (
            <Box sx={{ width: { xs: "100%", md: 150 } }}>
              <Typography sx={fieldLabelSx}>Año</Typography>

              <TextField
                value={year}
                onChange={(e) => onChangeYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="2026"
                inputProps={{ inputMode: "numeric", maxLength: 4 }}
                fullWidth
              />
            </Box>
          )}

          {periodType === "month" && (
            <Box sx={{ width: { xs: "100%", md: 210 } }}>
              <Typography sx={fieldLabelSx}>Mes</Typography>

              <TextField select value={month} onChange={(e) => onChangeMonth(e.target.value)} fullWidth>
                {MONTHS.map((item) => (
                  <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                ))}
              </TextField>
            </Box>
          )}

          <Box sx={{ flex: 1, width: "100%", minWidth: { md: 250 } }}>
            <Typography sx={fieldLabelSx}>Complemento</Typography>

            <TextField select value={addonId} onChange={(e) => onChangeAddonId(e.target.value)} fullWidth>
              <MenuItem value="">Todos</MenuItem>

              {addons.map((addon) => (
                <MenuItem key={addon.id} value={String(addon.id)}>
                  {addon.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Stack>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "flex-end" }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={fieldLabelSx}>Buscar</Typography>

            <TextField
              value={q}
              onChange={(e) => onChangeQ(e.target.value)}
              placeholder="Propietario, restaurante, sucursal o complemento…"
              fullWidth
            />
          </Box>

          <Box sx={{ width: { xs: "100%", md: 280 } }}>
            <Typography
              sx={{
                fontSize: 13,
                color: "text.secondary",
                fontWeight: 700,
                textAlign: { xs: "left", md: "right" },
                pb: { xs: 0, md: 1.2 },
              }}
            >
              {total} movimientos encontrados
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Paper>
  );
}

const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
  mb: 1,
};