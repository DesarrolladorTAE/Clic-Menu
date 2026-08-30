import { Box, ButtonBase, Typography } from "@mui/material";

import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import LocalDrinkOutlinedIcon from "@mui/icons-material/LocalDrinkOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import FastfoodOutlinedIcon from "@mui/icons-material/FastfoodOutlined";

const PRODUCT_MODES = [
  {
    key: "simple:none",
    product_type: "simple",
    inventory_type: "none",
    title: "Producto sin inventario",
    description: "Sin receta ni control directo de existencias.",
    icon: SellOutlinedIcon,
  },
  {
    key: "simple:product",
    product_type: "simple",
    inventory_type: "product",
    title: "Producto sin receta",
    description: "Para productos ya elaborados con control de existencias.",
    icon: LocalDrinkOutlinedIcon,
  },
  {
    key: "simple:ingredients",
    product_type: "simple",
    inventory_type: "ingredients",
    title: "Producto con receta",
    description: "Trabaja recetas y descuenta ingredientes.",
    icon: MenuBookOutlinedIcon,
  },
  {
    key: "composite:none",
    product_type: "composite",
    inventory_type: "none",
    title: "Producto compuesto",
    description: "Agrupa otros productos para crear combos.",
    icon: FastfoodOutlinedIcon,
  },
];

const DEFAULT_ALLOWED_PRODUCTS = {
  allowed_product_types: ["simple"],
  allowed_inventory_types: ["none"],
  allowed_combinations: [{ product_type: "simple", inventory_type: "none" }],
};

function combinationAllowed(allowedProducts, productType, inventoryType) {
  const allowed = allowedProducts || DEFAULT_ALLOWED_PRODUCTS;

  const productTypes = Array.isArray(allowed?.allowed_product_types)
    ? allowed.allowed_product_types
    : DEFAULT_ALLOWED_PRODUCTS.allowed_product_types;

  const inventoryTypes = Array.isArray(allowed?.allowed_inventory_types)
    ? allowed.allowed_inventory_types
    : DEFAULT_ALLOWED_PRODUCTS.allowed_inventory_types;

  const combinations = Array.isArray(allowed?.allowed_combinations)
    ? allowed.allowed_combinations
    : DEFAULT_ALLOWED_PRODUCTS.allowed_combinations;

  return (
    productTypes.includes(productType) &&
    inventoryTypes.includes(inventoryType) &&
    combinations.some(
      (combo) =>
        combo.product_type === productType &&
        combo.inventory_type === inventoryType
    )
  );
}

export default function ProductTypeModeCards({
  allowedProducts = DEFAULT_ALLOWED_PRODUCTS,
  productType = "simple",
  inventoryType = "none",
  disabled = false,
  onChange,
}) {
  const currentKey = `${productType}:${inventoryType}`;

  const allowedModes = PRODUCT_MODES.filter((mode) =>
    combinationAllowed(
      allowedProducts,
      mode.product_type,
      mode.inventory_type
    )
  );

  const currentMode = PRODUCT_MODES.find((mode) => mode.key === currentKey);
  const currentIsAllowed = allowedModes.some((mode) => mode.key === currentKey);

  const visibleModes =
    disabled && currentMode && !currentIsAllowed
      ? PRODUCT_MODES.filter(
          (mode) =>
            allowedModes.some((allowed) => allowed.key === mode.key) ||
            mode.key === currentKey
        )
      : allowedModes;

  if (!visibleModes.length) {
    return (
      <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
        No hay tipos de producto disponibles con el plan actual.
      </Typography>
    );
  }

  const total = visibleModes.length;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
        },
        gap: 1.25,
      }}
    >
      {visibleModes.map((mode, index) => {
        const Icon = mode.icon;
        const selected = mode.key === currentKey;

        const allowed = combinationAllowed(
          allowedProducts,
          mode.product_type,
          mode.inventory_type
        );

        const fullRow = total === 1 || (total === 3 && index === 2);

        return (
          <ButtonBase
            key={mode.key}
            disabled={disabled || !allowed}
            onClick={() =>
              onChange?.({
                product_type: mode.product_type,
                inventory_type: mode.inventory_type,
              })
            }
            sx={{
              gridColumn: {
                xs: "auto",
                sm: fullRow ? "1 / -1" : "auto",
              },
              width: "100%",
              minHeight: 88,
              px: { xs: 1.5, sm: 1.75 },
              py: 1.4,
              borderRadius: 1.5,
              border: "1.5px solid",
              borderColor: selected ? "primary.main" : "divider",
              bgcolor: selected
                ? "rgba(255, 152, 0, 0.05)"
                : "background.paper",
              textAlign: "left",
              alignItems: "center",
              justifyContent: "flex-start",
              transition:
                "border-color 0.18s ease, background-color 0.18s ease, transform 0.12s ease",
              "&:hover": {
                borderColor: selected
                  ? "primary.main"
                  : "rgba(255, 152, 0, 0.45)",
                bgcolor: "rgba(255, 152, 0, 0.05)",
              },
              "&:active": {
                transform: "scale(0.99)",
              },
              "&.Mui-disabled": {
                opacity: selected ? 1 : 0.55,
              },
            }}
          >
            <Box
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 1.25,
              }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  minWidth: 38,
                  borderRadius: 1.25,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: selected
                    ? "primary.main"
                    : "rgba(255, 152, 0, 0.10)",
                  color: selected ? "#fff" : "primary.main",
                }}
              >
                <Icon sx={{ fontSize: 21 }} />
              </Box>

              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: 14, sm: 15 },
                      fontWeight: 800,
                      color: "text.primary",
                      lineHeight: 1.25,
                    }}
                  >
                    {mode.title}
                  </Typography>

                  {selected ? (
                    <CheckCircleRoundedIcon
                      sx={{
                        fontSize: 20,
                        color: "primary.main",
                        flexShrink: 0,
                      }}
                    />
                  ) : null}
                </Box>

                <Typography
                  sx={{
                    mt: 0.35,
                    fontSize: 12.5,
                    color: "text.secondary",
                    lineHeight: 1.35,
                  }}
                >
                  {mode.description}
                </Typography>

                {!allowed && selected ? (
                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: 11,
                      color: "warning.dark",
                      fontWeight: 800,
                      lineHeight: 1.3,
                    }}
                  >
                    Configuración actual protegida por el plan.
                  </Typography>
                ) : null}
              </Box>
            </Box>
          </ButtonBase>
        );
      })}
    </Box>
  );
}