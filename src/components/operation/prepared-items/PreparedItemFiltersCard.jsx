import {
  FormControlLabel, MenuItem, Paper, Stack, Switch, TextField, Typography,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export default function PreparedItemFiltersCard({
  search,
  onChangeSearch,
  reusableFilter,
  onChangeReusableFilter,
  sections = [],
  sectionId,
  onChangeSection,
  categories = [],
  categoryId,
  onChangeCategory,
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
          alignItems={{ xs: "stretch", lg: "flex-end" }}
        >
          <Stack spacing={1} sx={{ flex: 1 }}>
            <Typography sx={fieldLabelSx}>Buscar</Typography>

            <TextField
              fullWidth
              value={search}
              onChange={(event) => onChangeSearch(event.target.value)}
              placeholder="Buscar por nombre, descripción, categoría o sección..."
            />
          </Stack>

          <Stack spacing={1} sx={{ minWidth: { xs: "100%", lg: 250 } }}>
            <Typography sx={fieldLabelSx}>Reutilización</Typography>

            <TextField
              select
              fullWidth
              value={reusableFilter}
              onChange={(event) => onChangeReusableFilter(event.target.value)}
              SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
            >
              <MenuItem value="all">Todos los productos</MenuItem>
              <MenuItem value="reusable">Sólo reutilizables</MenuItem>
              <MenuItem value="not_reusable">No reutilizables</MenuItem>
              <MenuItem value="custom">Con tiempo particular</MenuItem>
            </TextField>
          </Stack>

          <Stack spacing={1} sx={{ minWidth: { xs: "100%", lg: 230 } }}>
            <Typography sx={fieldLabelSx}>Estado del producto</Typography>

            <FormControlLabel
              sx={{
                m: 0,
                minHeight: 56,
                display: "flex",
                alignItems: "center",
              }}
              control={
                <Switch
                  checked={onlyActiveProducts}
                  onChange={(event) =>
                    onChangeOnlyActiveProducts(event.target.checked)
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
                  Sólo productos activos
                </Typography>
              }
            />
          </Stack>
        </Stack>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <Stack spacing={1} sx={{ flex: 1 }}>
            <Typography sx={fieldLabelSx}>Sección</Typography>

            <TextField
              select
              fullWidth
              value={sectionId}
              onChange={(event) => onChangeSection(event.target.value)}
              SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
            >
              <MenuItem value="">Todas las secciones</MenuItem>

              {sections.map((section) => (
                <MenuItem key={section.id} value={String(section.id)}>
                  {section.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Stack spacing={1} sx={{ flex: 1 }}>
            <Typography sx={fieldLabelSx}>Categoría</Typography>

            <TextField
              select
              fullWidth
              value={categoryId}
              onChange={(event) => onChangeCategory(event.target.value)}
              SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
            >
              <MenuItem value="">Todas las categorías</MenuItem>

              {categories.map((category) => (
                <MenuItem key={category.id} value={String(category.id)}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
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
            sx={{
              fontSize: 12,
              fontWeight: 800,
              color: "text.primary",
            }}
          >
            {filteredCount}
          </Typography>{" "}
          de{" "}
          <Typography
            component="span"
            sx={{
              fontSize: 12,
              fontWeight: 800,
              color: "text.primary",
            }}
          >
            {totalCount}
          </Typography>{" "}
          producto(s).
        </Typography>
      </Stack>
    </Paper>
  );
}

const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
};