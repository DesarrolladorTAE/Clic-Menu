import {
  Box, Button, Chip, Paper, Stack, Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalDiningOutlinedIcon from "@mui/icons-material/LocalDiningOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";

function planAllowsCombination(allowedProducts, productType, inventoryType) {
  const combos = allowedProducts?.allowed_combinations || [];

  return combos.some(
    (combo) =>
      combo.product_type === productType && combo.inventory_type === inventoryType
  );
}

function planAllowsComposite(allowedProducts) {
  return Boolean(
    allowedProducts?.allowed_product_types?.includes("composite") ||
      planAllowsCombination(allowedProducts, "composite", "none")
  );
}

export default function ProductsPageHeader({
  restaurantId,
  productsMode,
  pageBusy,
  allowedProducts,
  onBack,
  onCreate,
}) {
  return (
    <>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
      >
        <Box>
          <Typography
            sx={{
              fontSize: { xs: 30, md: 42 },
              fontWeight: 800,
              color: "text.primary",
              lineHeight: 1.1,
            }}
          >
            Productos
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: "text.secondary",
              fontSize: { xs: 15, md: 18 },
            }}
          >
            Administra el catálogo base de productos respetando el modo operativo de tu restaurante.
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
            sx={{ mt: 1.5 }}
          >
            <Chip
              size="small"
              label={`Restaurante ${restaurantId}`}
              sx={{ fontWeight: 800 }}
            />
            <Chip
              size="small"
              color="secondary"
              label={
                productsMode === "global"
                  ? "Modo global"
                  : "Modo por sucursal"
              }
              sx={{ fontWeight: 800 }}
            />
            {pageBusy ? (
              <Typography
                sx={{
                  fontSize: 12,
                  color: "text.secondary",
                  fontWeight: 700,
                }}
              >
                Actualizando cambios…
              </Typography>
            ) : null}
          </Stack>
        </Box>

        <Stack
          direction={{ xs: "column-reverse", sm: "row" }}
          spacing={1.5}
          width={{ xs: "100%", md: "auto" }}
        >
          <Button
            onClick={onBack}
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            sx={{
              minWidth: { xs: "100%", sm: 180 },
              height: 44,
              borderRadius: 2,
            }}
          >
            Volver al menú
          </Button>

          <Button
            onClick={onCreate}
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              minWidth: { xs: "100%", sm: 210 },
              height: 44,
              borderRadius: 2,
              fontWeight: 800,
            }}
          >
            Nuevo producto
          </Button>
        </Stack>
      </Stack>

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
        <Stack spacing={1.5}>
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 800,
              color: "text.primary",
            }}
          >
            Tu producto:
          </Typography>

          {planAllowsComposite(allowedProducts) ? (
            <InstructionRow
              icon={<LayersOutlinedIcon sx={{ fontSize: 18 }} />}
              text="Puede ser un producto compuesto porque es un producto que será compuesto de más productos, sin inventario directo."
            />
          ) : null}

          {planAllowsCombination(allowedProducts, "simple", "ingredients") ? (
            <InstructionRow
              icon={<LocalDiningOutlinedIcon sx={{ fontSize: 18 }} />}
              text="Puede ser un producto simple con ingredientes, ideal para comidas con receta."
            />
          ) : null}

          {planAllowsCombination(allowedProducts, "simple", "product") ? (
            <InstructionRow
              icon={<Inventory2OutlinedIcon sx={{ fontSize: 18 }} />}
              text="Puede ser un producto simple de productos, pensado para artículos ya hechos y sin receta."
            />
          ) : null}

          {planAllowsCombination(allowedProducts, "simple", "none") ? (
            <InstructionRow
              icon={<Inventory2OutlinedIcon sx={{ fontSize: 18 }} />}
              text="Puede ser un producto simple sin inventario, ideal para catálogos básicos donde el producto siempre está vendible si está activo."
            />
          ) : null}
        </Stack>
      </Paper>
    </>
  );
}

function InstructionRow({ icon, text }) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Box
        sx={{
          minWidth: 28,
          height: 28,
          borderRadius: 999,
          bgcolor: "primary.main",
          color: "#fff",
          display: "grid",
          placeItems: "center",
        }}
      >
        {icon}
      </Box>

      <Typography
        sx={{
          fontSize: 14,
          color: "text.primary",
          lineHeight: 1.6,
        }}
      >
        {text}
      </Typography>
    </Stack>
  );
}