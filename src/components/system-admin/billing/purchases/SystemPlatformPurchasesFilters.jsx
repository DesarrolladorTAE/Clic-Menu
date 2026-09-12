import { useMemo } from "react";
import { Box, MenuItem, Paper, TextField, Typography } from "@mui/material";

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

export default function SystemPlatformPurchasesFilters({
  filters,
  owners = [],
  contextRows = [],
  loadingContext = false,
  onChange,
}) {
  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: current - 2019 }, (_, index) => current - index);
  }, []);

  const restaurants = useMemo(() => {
    if (!filters.owner_id) return [];

    const map = new Map();

    contextRows.forEach((row) => {
      const restaurant = row?.restaurant;
      if (!restaurant?.id) return;

      map.set(String(restaurant.id), {
        id: String(restaurant.id),
        name: restaurant.trade_name || restaurant.name || `Restaurante ${restaurant.id}`,
      });
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, "es"));
  }, [contextRows, filters.owner_id]);

  const branches = useMemo(() => {
    if (!filters.restaurant_id || filters.type === "plan") return [];

    const map = new Map();

    contextRows.forEach((row) => {
      if (String(row?.restaurant?.id || "") !== String(filters.restaurant_id)) return;

      const branch = row?.branch;
      if (!branch?.id) return;

      map.set(String(branch.id), {
        id: String(branch.id),
        name: branch.name || `Sucursal ${branch.id}`,
      });
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, "es"));
  }, [contextRows, filters.restaurant_id, filters.type]);

  const update = (changes) => {
    onChange?.({ ...filters, ...changes });
  };

  const changeOwner = (value) => {
    update({ owner_id: value, restaurant_id: "", branch_id: "" });
  };

  const changeRestaurant = (value) => {
    update({ restaurant_id: value, branch_id: "" });
  };

  const changeType = (value) => {
    update({ type: value, ...(value === "plan" ? { branch_id: "" } : {}) });
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
      <Typography sx={{ mb: 2, fontSize: 18, fontWeight: 800, color: "text.primary" }}>
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
          label="Buscar"
          sx={{ gridColumn: { xs: "auto", sm: "span 2" } }}
        >
          <TextField
            fullWidth
            value={filters.q}
            inputProps={{ maxLength: 120 }}
            placeholder="Propietario, restaurante, sucursal, plan o complemento…"
            onChange={(e) => update({ q: e.target.value })}
          />
        </FieldBlock>

        <FieldBlock label="Periodo">
          <TextField
            select
            fullWidth
            value={filters.period}
            onChange={(e) => update({ period: e.target.value })}
          >
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="year">Por año</MenuItem>
            <MenuItem value="month">Por mes</MenuItem>
          </TextField>
        </FieldBlock>

        {filters.period !== "all" ? (
          <FieldBlock label="Año">
            <TextField
              select
              fullWidth
              value={filters.year}
              onChange={(e) => update({ year: Number(e.target.value) })}
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </TextField>
          </FieldBlock>
        ) : null}

        {filters.period === "month" ? (
          <FieldBlock label="Mes">
            <TextField
              select
              fullWidth
              value={filters.month}
              onChange={(e) => update({ month: Number(e.target.value) })}
            >
              {MONTHS.map((month) => (
                <MenuItem key={month.value} value={month.value}>{month.label}</MenuItem>
              ))}
            </TextField>
          </FieldBlock>
        ) : null}

        <FieldBlock label="Propietario">
          <TextField
            select
            fullWidth
            value={filters.owner_id}
            onChange={(e) => changeOwner(e.target.value)}
          >
            <MenuItem value="">Todos los propietarios</MenuItem>

            {owners.map((owner) => (
              <MenuItem key={owner.id} value={String(owner.id)}>
                {owner.full_name || owner.name || `Propietario ${owner.id}`}
              </MenuItem>
            ))}
          </TextField>
        </FieldBlock>

        <FieldBlock label="Restaurante">
          <TextField
            select
            fullWidth
            value={filters.restaurant_id}
            disabled={!filters.owner_id || loadingContext}
            onChange={(e) => changeRestaurant(e.target.value)}
          >
            <MenuItem value="">
              {loadingContext ? "Cargando restaurantes…" : "Todos los restaurantes"}
            </MenuItem>

            {restaurants.map((restaurant) => (
              <MenuItem key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </MenuItem>
            ))}
          </TextField>
        </FieldBlock>

        <FieldBlock label="Sucursal">
          <TextField
            select
            fullWidth
            value={filters.branch_id}
            disabled={
              !filters.owner_id ||
              !filters.restaurant_id ||
              filters.type === "plan" ||
              loadingContext
            }
            onChange={(e) => update({ branch_id: e.target.value })}
          >
            <MenuItem value="">Todas las sucursales</MenuItem>

            {branches.map((branch) => (
              <MenuItem key={branch.id} value={branch.id}>
                {branch.name}
              </MenuItem>
            ))}
          </TextField>
        </FieldBlock>

        <FieldBlock label="Tipo de compra">
          <TextField
            select
            fullWidth
            value={filters.type}
            onChange={(e) => changeType(e.target.value)}
          >
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="plan">Planes</MenuItem>
            <MenuItem value="addon">Complementos</MenuItem>
          </TextField>
        </FieldBlock>

        <FieldBlock label="Estado fiscal">
          <TextField
            select
            fullWidth
            value={filters.status}
            onChange={(e) => update({ status: e.target.value })}
          >
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="sin_facturar">Sin facturar</MenuItem>
            <MenuItem value="procesando">Procesando</MenuItem>
            <MenuItem value="fallido">Fallido</MenuItem>
            <MenuItem value="revision_requerida">Requiere revisión</MenuItem>
            <MenuItem value="facturado">Facturado</MenuItem>
            <MenuItem value="publico_general">Facturado a Público General</MenuItem>
            <MenuItem value="ventana_vencida">Plazo administrativo vencido</MenuItem>
          </TextField>
        </FieldBlock>

        <FieldBlock label="Forma de compra">
          <TextField
            select
            fullWidth
            value={filters.payment_method}
            onChange={(e) => update({ payment_method: e.target.value })}
          >
            <MenuItem value="all">Todas</MenuItem>
            <MenuItem value="paypal">PayPal</MenuItem>
            <MenuItem value="transferencia">Transferencia</MenuItem>
          </TextField>
        </FieldBlock>
      </Box>
    </Paper>
  );
}

function FieldBlock({ label, children, sx = {} }) {
  return (
    <Box sx={{ minWidth: 0, ...sx }}>
      <Typography sx={fieldLabelSx}>{label}</Typography>
      {children}
    </Box>
  );
}

const fieldLabelSx = {
  mb: 1,
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
};