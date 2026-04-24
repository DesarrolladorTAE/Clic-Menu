import {
  Box, Button, MenuItem, Paper, Stack, TextField, Typography,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export default function ProfitReportFilters({
  branches,
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
            Selecciona el rango de fechas y la sucursal antes de consultar o
            descargar.
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <FieldBlock
            label="Fecha inicial"
            input={
              <TextField
                type="date"
                value={filters.start_date}
                onChange={(e) => onChange("start_date", e.target.value)}
              />
            }
          />

          <FieldBlock
            label="Fecha final"
            input={
              <TextField
                type="date"
                value={filters.end_date}
                onChange={(e) => onChange("end_date", e.target.value)}
              />
            }
          />

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
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="flex-end"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={2}
        >
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
