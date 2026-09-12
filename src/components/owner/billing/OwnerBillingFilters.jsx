import { useMemo } from "react";
import {
  Box, MenuItem, Paper, TextField, Typography,
} from "@mui/material";

const MONTHS = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
];

export default function OwnerBillingFilters({
  filters,
  restaurants = [],
  onChange,
  disabled = false,
}) {
  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: current - 2019 }, (_, index) => current - index);
  }, []);

  const update = (field, value) => {
    onChange?.({ ...filters, [field]: value });
  };

  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 2.5 },
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        boxShadow: "none",
        bgcolor: "background.paper",
      }}
    >
      <Typography
        sx={{
          mb: 2,
          fontSize: 16,
          fontWeight: 800,
          color: "text.primary",
        }}
      >
        Filtros
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
          gap: 2,
        }}
      >
        <FieldBlock
          label="Periodo"
          input={
            <TextField
              select
              fullWidth
              value={filters.period}
              disabled={disabled}
              onChange={(e) => update("period", e.target.value)}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="year">Por año</MenuItem>
              <MenuItem value="month">Por mes</MenuItem>
            </TextField>
          }
        />

        {filters.period !== "all" ? (
          <FieldBlock
            label="Año"
            input={
              <TextField
                select
                fullWidth
                value={filters.year}
                disabled={disabled}
                onChange={(e) => update("year", Number(e.target.value))}
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </TextField>
            }
          />
        ) : null}

        {filters.period === "month" ? (
          <FieldBlock
            label="Mes"
            input={
              <TextField
                select
                fullWidth
                value={filters.month}
                disabled={disabled}
                onChange={(e) => update("month", Number(e.target.value))}
              >
                {MONTHS.map((month) => (
                  <MenuItem key={month.value} value={month.value}>
                    {month.label}
                  </MenuItem>
                ))}
              </TextField>
            }
          />
        ) : null}

        <FieldBlock
          label="Restaurante"
          input={
            <TextField
              select
              fullWidth
              value={filters.restaurant_id}
              disabled={disabled}
              onChange={(e) => update("restaurant_id", e.target.value)}
            >
              <MenuItem value="">Todos los restaurantes</MenuItem>

              {restaurants.map((restaurant) => (
                <MenuItem key={restaurant.id} value={String(restaurant.id)}>
                  {restaurant.trade_name || restaurant.name || `Restaurante ${restaurant.id}`}
                </MenuItem>
              ))}
            </TextField>
          }
        />

        <FieldBlock
          label="Tipo de compra"
          input={
            <TextField
              select
              fullWidth
              value={filters.type}
              disabled={disabled}
              onChange={(e) => update("type", e.target.value)}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="plan">Planes</MenuItem>
              <MenuItem value="addon">Complementos</MenuItem>
            </TextField>
          }
        />

        <FieldBlock
          label="Estado fiscal"
          input={
            <TextField
              select
              fullWidth
              value={filters.status}
              disabled={disabled}
              onChange={(e) => update("status", e.target.value)}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="sin_facturar">Sin facturar</MenuItem>
              <MenuItem value="procesando">Procesando</MenuItem>
              <MenuItem value="fallido">Fallido</MenuItem>
              <MenuItem value="revision_requerida">Requiere revisión</MenuItem>
              <MenuItem value="facturado">Facturado</MenuItem>
              <MenuItem value="publico_general">Facturado a público general</MenuItem>
              <MenuItem value="ventana_vencida">Ventana vencida</MenuItem>
            </TextField>
          }
        />
      </Box>
    </Paper>
  );
}

function FieldBlock({ label, input }) {
  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
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