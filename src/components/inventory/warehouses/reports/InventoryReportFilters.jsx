import {
  Box, Button, FormControlLabel, MenuItem, Paper, Stack, Switch, TextField, Typography,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export default function InventoryReportFilters({
  branches,
  warehouses,
  filters,
  loading,
  onChange,
  onSubmit,
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
        <Box>
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 800,
              color: "text.primary",
            }}
          >
            Filtros del reporte
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              fontSize: 13,
              color: "text.secondary",
            }}
          >
            Selecciona el contexto del inventario antes de consultar o descargar.
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <FieldBlock
            label="Sucursal"
            input={
              <TextField
                select
                value={filters.branch_id}
                onChange={(e) => onChange("branch_id", e.target.value)}
                SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
              >
                <MenuItem value="">Todas</MenuItem>
                {branches.map((branch) => (
                  <MenuItem key={branch.id} value={String(branch.id)}>
                    {branch.name || `Sucursal ${branch.id}`}
                  </MenuItem>
                ))}
              </TextField>
            }
          />

          <FieldBlock
            label="Almacén"
            input={
              <TextField
                select
                value={filters.warehouse_id}
                onChange={(e) => onChange("warehouse_id", e.target.value)}
                SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
              >
                <MenuItem value="">Todos</MenuItem>
                {warehouses.map((warehouse) => (
                  <MenuItem key={warehouse.id} value={String(warehouse.id)}>
                    {warehouse.name || `Almacén ${warehouse.id}`}
                  </MenuItem>
                ))}
              </TextField>
            }
          />
        </Stack>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <FieldBlock
            label="Tipo de recurso"
            input={
              <TextField
                select
                value={filters.resource_type}
                onChange={(e) => onChange("resource_type", e.target.value)}
                SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="ingredient">Ingredientes</MenuItem>
                <MenuItem value="product">Productos</MenuItem>
              </TextField>
            }
          />

          <FieldBlock
            label="Estado de stock"
            input={
              <TextField
                select
                value={filters.stock_status}
                onChange={(e) => onChange("stock_status", e.target.value)}
                SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
              >
                <MenuItem value="with_stock">Con stock</MenuItem>
                <MenuItem value="without_stock">Sin stock</MenuItem>
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="negative">Negativo</MenuItem>
              </TextField>
            }
          />

          <FieldBlock
            label="Estado de costo"
            input={
              <TextField
                select
                value={filters.cost_status}
                onChange={(e) => onChange("cost_status", e.target.value)}
                SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="with_cost">Con costo</MenuItem>
                <MenuItem value="without_cost">Sin costo</MenuItem>
              </TextField>
            }
          />
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={2}
        >
          <FormControlLabel
            sx={{ m: 0 }}
            control={
              <Switch
                checked={!!filters.include_inactive}
                onChange={(e) =>
                  onChange("include_inactive", e.target.checked)
                }
                color="primary"
              />
            }
            label={
              <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                Incluir inactivos
              </Typography>
            }
          />

          <Button
            onClick={onSubmit}
            disabled={loading}
            variant="contained"
            startIcon={<SearchRoundedIcon />}
            sx={{
              minWidth: { xs: "100%", sm: 180 },
              height: 44,
              borderRadius: 2,
              fontWeight: 800,
            }}
          >
            {loading ? "Consultando…" : "Consultar"}
          </Button>
        </Stack>
      </Stack>
    </Paper>
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