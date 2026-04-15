import {
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
  FormControlLabel,
} from "@mui/material";

export default function CatalogFiltersCard({
  search,
  onChangeSearch,
  onlyActiveProducts,
  onChangeOnlyActiveProducts,
  filteredCount,
  totalCount,
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
          direction={{ xs: "column", lg: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", lg: "center" }}
        >
          <Stack spacing={1} sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              Buscar
            </Typography>

            <TextField
              fullWidth
              value={search}
              onChange={(e) => onChangeSearch(e.target.value)}
              placeholder="Buscar por nombre, descripción o categoría..."
            />
          </Stack>

          <Stack spacing={1}>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              Filtro rápido
            </Typography>

            <FormControlLabel
              sx={{ m: 0 }}
              control={
                <Switch
                  checked={onlyActiveProducts}
                  onChange={(e) =>
                    onChangeOnlyActiveProducts(e.target.checked)
                  }
                  color="primary"
                />
              }
              label={
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "text.primary",
                  }}
                >
                  Solo productos activos
                </Typography>
              }
            />
          </Stack>
        </Stack>

        <Typography
          sx={{
            fontSize: 12,
            color: "text.secondary",
            lineHeight: 1.45,
          }}
        >
          Mostrando{" "}
          <Typography
            component="span"
            sx={{ fontSize: 12, fontWeight: 800, color: "text.primary" }}
          >
            {filteredCount}
          </Typography>{" "}
          de{" "}
          <Typography
            component="span"
            sx={{ fontSize: 12, fontWeight: 800, color: "text.primary" }}
          >
            {totalCount}
          </Typography>{" "}
          registro(s).
        </Typography>
      </Stack>
    </Paper>
  );
}
