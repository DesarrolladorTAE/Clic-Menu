import {
  Box, FormControlLabel, MenuItem, Paper, Stack, Switch, TextField, Typography,
} from "@mui/material";

const monthOptions = [
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

function getYearOptions() {
  const currentYear = new Date().getFullYear();

  return Array.from({ length: 8 }, (_, index) => currentYear - index);
}

function FilterField({ label, children }) {
  return (
    <Stack spacing={0.75} sx={{ width: "100%" }}>
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 900,
          color: "text.primary",
          lineHeight: 1.3,
        }}
      >
        {label}
      </Typography>

      {children}
    </Stack>
  );
}

export default function SubscriptionHistoryFilters({
  filters,
  activeOnly,
  onChange,
  onActiveOnlyChange,
}) {
  const period = filters?.period || "all";
  const year = filters?.year || new Date().getFullYear();
  const month = filters?.month || new Date().getMonth() + 1;

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
              fontWeight: 900,
              color: "text.primary",
            }}
          >
            Filtros
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              fontSize: 13,
              color: "text.secondary",
              lineHeight: 1.5,
            }}
          >
            Filtra el historial por periodo. Los cambios se aplican
            automáticamente.
          </Typography>
        </Box>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.75}
          alignItems={{ xs: "stretch", md: "flex-end" }}
        >
          <FilterField label="Periodo">
            <TextField
              select
              value={period}
              onChange={(event) => onChange({ period: event.target.value })}
            >
              <MenuItem value="all">Todo el historial</MenuItem>
              <MenuItem value="year">Por año</MenuItem>
              <MenuItem value="month">Por mes</MenuItem>
            </TextField>
          </FilterField>

          {period === "year" || period === "month" ? (
            <FilterField label="Año">
              <TextField
                select
                value={year}
                onChange={(event) =>
                  onChange({ year: Number(event.target.value) })
                }
              >
                {getYearOptions().map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
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
                onChange={(event) =>
                  onChange({ month: Number(event.target.value) })
                }
              >
                {monthOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </FilterField>
          ) : null}

          <Box
            sx={{
              width: {
                xs: "100%",
                md: "auto",
              },
              minWidth: {
                xs: "100%",
                md: 190,
              },
            }}
          >
            <Stack spacing={0.75}>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 900,
                  color: "text.primary",
                  lineHeight: 1.3,
                }}
              >
                Estado
              </Typography>

              <Box
                sx={{
                  minHeight: 42,
                  px: 1.5,
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "background.default",
                  border: "1px solid",
                  borderColor: activeOnly ? "primary.main" : "transparent",
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={activeOnly}
                      onChange={(event) =>
                        onActiveOnlyChange(event.target.checked)
                      }
                    />
                  }
                  label={activeOnly ? "Solo activas" : "Todas"}
                  sx={{
                    m: 0,
                    width: "100%",
                    "& .MuiFormControlLabel-label": {
                      fontSize: 14,
                      fontWeight: 800,
                      color: "text.primary",
                    },
                  }}
                />
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Stack>
    </Paper>
  );
}