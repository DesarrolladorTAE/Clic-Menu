import { Box, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";

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

function getYears() {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 8 }, (_, index) => currentYear - index);
}

export default function AddonHistoryFilters({
  tab = "current",
  filters,
  branches = [],
  total = 0,
  onChange,
}) {
  const isHistory = tab === "history";
  const branchId = filters?.branchId || "";
  const period = filters?.period || "all";
  const year = Number(filters?.year || new Date().getFullYear());
  const month = Number(filters?.month || new Date().getMonth() + 1);

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
          <Typography sx={{ fontSize: 18, fontWeight: 900, color: "text.primary" }}>
            Filtros
          </Typography>

          <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary", lineHeight: 1.5 }}>
            {isHistory
              ? "Filtra los movimientos por sucursal y periodo. Los cambios se aplican automáticamente."
              : "Selecciona la sucursal que deseas consultar."}
          </Typography>
        </Box>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.75}
          alignItems={{ xs: "stretch", md: "flex-end" }}
        >
          <FilterField label="Sucursal" width={260}>
            <TextField
              select
              value={branchId}
              onChange={(e) => onChange({ branchId: e.target.value })}
              fullWidth
            >
              {isHistory ? (
                <MenuItem value="">Todas las sucursales</MenuItem>
              ) : (
                <MenuItem value="" disabled>
                  Selecciona una sucursal
                </MenuItem>
              )}

              {branches.map((branch) => (
                <MenuItem key={branch.id} value={String(branch.id)}>
                  {branch.name || `Sucursal #${branch.id}`}
                </MenuItem>
              ))}
            </TextField>
          </FilterField>

          {isHistory ? (
            <>
              <FilterField label="Periodo">
                <TextField
                  select
                  value={period}
                  onChange={(e) => onChange({ period: e.target.value })}
                  fullWidth
                >
                  <MenuItem value="all">Todo el historial</MenuItem>
                  <MenuItem value="year">Por año</MenuItem>
                  <MenuItem value="month">Por mes</MenuItem>
                </TextField>
              </FilterField>

              {period === "year" || period === "month" ? (
                <FilterField label="Año" width={160}>
                  <TextField
                    select
                    value={year}
                    onChange={(e) => onChange({ year: Number(e.target.value) })}
                    fullWidth
                  >
                    {getYears().map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </TextField>
                </FilterField>
              ) : null}

              {period === "month" ? (
                <FilterField label="Mes">
                  <TextField
                    select
                    value={month}
                    onChange={(e) => onChange({ month: Number(e.target.value) })}
                    fullWidth
                  >
                    {MONTHS.map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {item.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </FilterField>
              ) : null}

              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  pb: { xs: 0, md: 1.2 },
                }}
              >
                <Typography
                  sx={{
                    fontSize: 13,
                    color: "text.secondary",
                    fontWeight: 700,
                    textAlign: { xs: "left", md: "right" },
                  }}
                >
                  {total} movimiento{Number(total) === 1 ? "" : "s"} encontrado
                  {Number(total) === 1 ? "" : "s"}
                </Typography>
              </Box>
            </>
          ) : null}
        </Stack>
      </Stack>
    </Paper>
  );
}

function FilterField({ label, children, width = 220 }) {
  return (
    <Box sx={{ width: { xs: "100%", md: width }, flexShrink: 0 }}>
      <Typography sx={fieldLabelSx}>{label}</Typography>
      {children}
    </Box>
  );
}

const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 900,
  color: "text.primary",
  mb: 1,
};