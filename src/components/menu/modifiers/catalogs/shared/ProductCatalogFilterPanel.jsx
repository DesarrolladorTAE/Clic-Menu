import { Box, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ProductCategoryTabs from "../../../../products/ProductCategoryTabs";
import { fieldLabelSx } from "./catalogShared";

export default function ProductCatalogFilterPanel({
  categories = [],
  categoryFilter,
  onCategoryChange,
  statusFilter,
  onStatusChange,
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
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "flex-end" }}
          justifyContent="space-between"
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={fieldLabelSx}>Categorías</Typography>

            <ProductCategoryTabs
              categories={categories}
              value={categoryFilter}
              onChange={onCategoryChange}
            />

            <Typography
              sx={{
                mt: 1,
                fontSize: 12,
                color: "text.secondary",
              }}
            >
              Filtra los productos por categoría para encontrarlos más rápido.
            </Typography>
          </Box>

          <Box sx={{ width: { xs: "100%", md: 240 } }}>
            <Typography sx={fieldLabelSx}>Mostrar</Typography>

            <TextField
              select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              SelectProps={{
                IconComponent: KeyboardArrowDownIcon,
              }}
            >
              <MenuItem value="active">Solo activos</MenuItem>
              <MenuItem value="inactive">Solo inactivos</MenuItem>
              <MenuItem value="all">Todos</MenuItem>
            </TextField>
          </Box>
        </Stack>
      </Stack>
    </Paper>
  );
}
