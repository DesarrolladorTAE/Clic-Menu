import { Box, Card, Chip, Stack, Typography } from "@mui/material";

export default function ProductSelectionSummaryCard({
  product,
  productsAreByBranch = false,
  extraChips = [],
  title = "Producto seleccionado",
}) {
  if (!product) return null;

  return (
    <Card
      sx={{
        borderRadius: 1,
        boxShadow: "none",
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
      }}
    >
      <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Stack spacing={1.25}>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 800,
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: 0.3,
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: 22, sm: 28 },
              fontWeight: 800,
              color: "text.primary",
              lineHeight: 1.15,
            }}
          >
            {product.name}
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip
              label={product.status === "active" ? "Activo" : "Inactivo"}
              size="small"
              sx={{ fontWeight: 800 }}
            />

            {product.category?.name ? (
              <Chip
                label={product.category.name}
                size="small"
                sx={{
                  fontWeight: 800,
                  bgcolor: "#FFF3E0",
                  color: "#A75A00",
                }}
              />
            ) : null}

            {productsAreByBranch && product?.branch?.name ? (
              <Chip
                label={product.branch.name}
                size="small"
                sx={{ fontWeight: 800 }}
              />
            ) : null}

            {extraChips.map((chip, index) => (
              <Chip
                key={`${chip.label}-${index}`}
                label={chip.label}
                size="small"
                color={chip.color || "default"}
                sx={{ fontWeight: 800, ...(chip.sx || {}) }}
              />
            ))}
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
}
