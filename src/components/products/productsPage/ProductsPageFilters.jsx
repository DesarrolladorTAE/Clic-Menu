import {
  Alert, Box, FormControl, MenuItem, Paper, Select, Stack, Typography,
} from "@mui/material";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import ProductCategoryTabs from "../ProductCategoryTabs";

export default function ProductsPageFilters({
  requiresBranch,
  branches,
  branchId,
  onBranchChange,
  err,
  categories,
  categoryId,
  onCategoryChange,
  statusFilter,
  onStatusFilterChange,
  productsCount,
}) {
  return (
    <>
      {requiresBranch ? (
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
          <Stack spacing={1.25}>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              Sucursal
            </Typography>

            <FormControl fullWidth>
              <Select
                value={branchId}
                onChange={(e) => onBranchChange(e.target.value)}
                IconComponent={KeyboardArrowDownIcon}
                sx={selectSx}
              >
                {branches.map((b) => (
                  <MenuItem key={b.id} value={String(b.id)}>
                    {b.name || `Sucursal ${b.id}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography
              sx={{
                fontSize: 12,
                color: "text.secondary",
                lineHeight: 1.5,
              }}
            >
              Estás administrando el catálogo base de esta sucursal.
            </Typography>
          </Stack>
        </Paper>
      ) : null}

      {err ? (
        <Alert
          severity="error"
          sx={{
            borderRadius: 1,
            alignItems: "flex-start",
            whiteSpace: "pre-line",
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 800, mb: 0.5 }}>
              Ocurrió un problema
            </Typography>
            <Typography variant="body2">{err}</Typography>
          </Box>
        </Alert>
      ) : null}

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
                value={categoryId}
                onChange={onCategoryChange}
              />

              <Typography
                sx={{
                  mt: 1,
                  fontSize: 12,
                  color: "text.secondary",
                }}
              >
                Toca una categoría para mostrar únicamente los productos relacionados.
              </Typography>
            </Box>

            <Box sx={{ width: { xs: "100%", md: 240 } }}>
              <Typography sx={fieldLabelSx}>Mostrar</Typography>

              <FormControl fullWidth>
                <Select
                  value={statusFilter}
                  onChange={(e) => onStatusFilterChange(e.target.value)}
                  IconComponent={KeyboardArrowDownIcon}
                  sx={selectSx}
                >
                  <MenuItem value="active">Solo activos</MenuItem>
                  <MenuItem value="inactive">Solo inactivos</MenuItem>
                  <MenuItem value="all">Todos</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Stack>

          <Typography
            sx={{
              fontSize: 13,
              color: "text.secondary",
              fontWeight: 700,
            }}
          >
            Mostrando {productsCount} productos
          </Typography>
        </Stack>
      </Paper>
    </>
  );
}

const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
  mb: 1,
};

const selectSx = {
  bgcolor: "#F4F4F4",
  borderRadius: 0,
  minHeight: 44,
  "& .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    border: "1.5px solid #FF9800",
  },
  "& .MuiSelect-select": {
    py: 1.25,
    px: 1.5,
    fontSize: 14,
    color: "text.primary",
  },
};