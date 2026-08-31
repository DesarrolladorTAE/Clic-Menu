import {
  FormControlLabel, MenuItem, Paper, Stack, Switch, TextField, Typography,
} from "@mui/material";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export default function CatalogFiltersCard({
  search,
  onChangeSearch,
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
          alignItems={{ xs: "stretch", lg: "center" }}
        >
          <Stack spacing={1} sx={{ flex: 1 }}>
            <Typography sx={fieldLabelSx}>Buscar</Typography>

            <TextField
              fullWidth
              value={search}
              onChange={(e) => onChangeSearch(e.target.value)}
              placeholder="Buscar por nombre, descripción, categoría o sección..."
            />
          </Stack>

          <Stack spacing={1}>
            <Typography sx={fieldLabelSx}>Filtro rápido</Typography>

            <FormControlLabel
              sx={{ m: 0 }}
              control={
                <Switch
                  checked={onlyActiveProducts}
                  onChange={(e) => onChangeOnlyActiveProducts(e.target.checked)}
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

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <Stack spacing={1} sx={{ flex: 1 }}>
            <Typography sx={fieldLabelSx}>Sección</Typography>

            <TextField
              select
              fullWidth
              value={sectionId}
              onChange={(e) => onChangeSection(e.target.value)}
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
              onChange={(e) => onChangeCategory(e.target.value)}
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

const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
};