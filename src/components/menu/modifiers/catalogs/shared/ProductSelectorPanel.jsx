import {
  ListSubheader, MenuItem, Paper, Stack, TextField, Typography,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { fieldLabelSx } from "./catalogShared";

export default function ProductSelectorPanel({
  groupedProducts = [],
  products = [],
  selectedProductId,
  onChange,
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
      <Stack spacing={1.25}>
        <Typography sx={fieldLabelSx}>Producto</Typography>

        <TextField
          select
          value={selectedProductId}
          onChange={(e) => onChange(e.target.value)}
          SelectProps={{
            IconComponent: KeyboardArrowDownIcon,
          }}
          disabled={!products.length}
        >
          {groupedProducts.length === 0 ? (
            <MenuItem disabled value="">
              No hay productos disponibles
            </MenuItem>
          ) : (
            groupedProducts.flatMap((group) => [
              <ListSubheader
                key={`subheader-${group.categoryName}`}
                sx={{
                  lineHeight: "36px",
                  fontSize: 12,
                  fontWeight: 800,
                  color: "text.secondary",
                  bgcolor: "background.paper",
                }}
              >
                {group.categoryName}
              </ListSubheader>,
              ...group.products.map((product) => (
                <MenuItem key={product.id} value={String(product.id)}>
                  {product.name}
                  {product.status === "inactive" ? " · Inactivo" : ""}
                </MenuItem>
              )),
            ])
          )}
        </TextField>

        <Typography
          sx={{
            fontSize: 12,
            color: "text.secondary",
          }}
        >
          {products.length
            ? `Mostrando ${products.length} producto${products.length === 1 ? "" : "s"} según tus filtros.`
            : "No hay productos disponibles para este contexto."}
        </Typography>
      </Stack>
    </Paper>
  );
}
