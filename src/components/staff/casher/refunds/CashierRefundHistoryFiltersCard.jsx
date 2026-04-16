import React from "react";
import {
  Box,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export default function CashierRefundHistoryFiltersCard({
  filters,
  onChange,
  disabled = false,
}) {
  return (
    <Card
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        boxShadow: "none",
        backgroundColor: "background.paper",
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2}>
          <Box>
            <Typography
              sx={{
                fontSize: 22,
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              Filtros del historial
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 14,
                color: "text.secondary",
                lineHeight: 1.5,
              }}
            >
              Busca ventas ya cobradas y filtra por estado para ubicar rápidamente
              la operación que quieres revisar.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FieldBlock
              label="Buscar"
              input={
                <TextField
                  fullWidth
                  value={filters?.query || ""}
                  onChange={(e) => onChange?.("query", e.target.value)}
                  placeholder="Venta, orden, folio o cliente"
                  disabled={disabled}
                />
              }
            />

            <FieldBlock
              label="Estado"
              input={
                <TextField
                  select
                  fullWidth
                  value={filters?.status || "all"}
                  onChange={(e) => onChange?.("status", e.target.value)}
                  disabled={disabled}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="paid">Pagada</MenuItem>
                  <MenuItem value="partially_refunded">
                    Parcialmente devuelta
                  </MenuItem>
                  <MenuItem value="refunded">Devuelta</MenuItem>
                </TextField>
              }
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function FieldBlock({ label, input }) {
  return (
    <Box sx={{ flex: 1, width: "100%" }}>
      <Typography sx={fieldLabelSx}>{label}</Typography>
      {input}
    </Box>
  );
}

const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
  mb: 1,
};