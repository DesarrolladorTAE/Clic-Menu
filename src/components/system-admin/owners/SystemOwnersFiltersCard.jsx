import React from "react";
import {
  Box, MenuItem, Paper, Stack, TextField, Typography,
} from "@mui/material";

export default function SystemOwnersFiltersCard({
  q,
  status,
  filteredLabel,
  total = 0,
  onChangeQ,
  onChangeStatus,
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
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "flex-end" }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography sx={fieldLabelSx}>Buscar propietario</Typography>

            <TextField
              value={q}
              onChange={(e) => onChangeQ(e.target.value)}
              placeholder="Buscar por nombre, correo o teléfono…"
              fullWidth
            />

            <Typography
              sx={{
                mt: 1,
                fontSize: 12,
                color: "text.secondary",
              }}
            >
              Localiza rápidamente una cuenta por datos principales.
            </Typography>
          </Box>

          <Box sx={{ width: { xs: "100%", md: 240 } }}>
            <Typography sx={fieldLabelSx}>Estatus</Typography>

            <TextField
              select
              value={status}
              onChange={(e) => onChangeStatus(e.target.value)}
              fullWidth
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="active">Activos</MenuItem>
              <MenuItem value="inactive">Inactivos</MenuItem>
            </TextField>
          </Box>
        </Stack>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
        >
          <Typography sx={{ fontSize: 13, color: "text.secondary", fontWeight: 700 }}>
            Mostrando: {filteredLabel}
          </Typography>

          <Typography sx={{ fontSize: 13, color: "text.secondary", fontWeight: 700 }}>
            {total} propietarios encontrados
          </Typography>
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