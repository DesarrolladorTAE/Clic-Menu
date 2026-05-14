import {
  Alert, Box, Button, Card, Chip, FormControlLabel, IconButton, Paper, Stack, Switch, Tooltip, Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import PaginationFooter from "../../common/PaginationFooter";

const PRODUCT_TYPES = [
  { value: "simple", label: "Simple" },
  { value: "composite", label: "Compuesto" },
];

const INVENTORY_TYPES = [
  { value: "ingredients", label: "Ingredientes" },
  { value: "product", label: "Producto" },
  { value: "none", label: "Sin inventario" },
];

function labelFromOptions(options, value, fallback = "—") {
  const v = value ?? "";
  const found = options.find((x) => x.value === v);
  return found ? found.label : fallback;
}

function allowedInventoryTypesForProductType(productType) {
  if (productType === "composite") return ["none"];
  return ["ingredients", "product", "none"];
}

function normalizeInventoryForProductType(productType, inventoryType) {
  const allowed = allowedInventoryTypesForProductType(productType);
  return allowed.includes(inventoryType) ? inventoryType : allowed[0];
}

function getModeKey(productType, inventoryType) {
  const pt = productType || "simple";
  const it = inventoryType || (pt === "composite" ? "none" : "none");
  return `${pt}:${it}`;
}

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

function planAllowsRecipes(allowedProducts) {
  return planAllowsCombination(allowedProducts, "simple", "ingredients");
}

function planAllowsVariants(allowedProducts) {
  return (
    planAllowsCombination(allowedProducts, "simple", "ingredients") ||
    planAllowsCombination(allowedProducts, "simple", "product")
  );
}

function buttonsRules(productType, inventoryType, allowedProducts, planMeta = null) {
  const key = getModeKey(productType, inventoryType);
  const isBlockedByPlan = Boolean(planMeta?.blocked_by_plan);

  const rules = { recipes: false, variants: false, components: false };

  if (isBlockedByPlan) return rules;

  if (key === "simple:ingredients" && planAllowsRecipes(allowedProducts)) {
    rules.recipes = true;
    rules.variants = true;
  }

  if (key === "simple:product" && planAllowsVariants(allowedProducts)) {
    rules.variants = true;
  }

  if (key === "composite:none" && planAllowsComposite(allowedProducts)) {
    rules.components = true;
  }

  return rules;
}

export default function ProductsPageList({
  products,
  productsMode,
  allowedProducts,
  pagination,
  onCreate,
  onEdit,
  onDelete,
  onToggleStatus,
  onComponents,
  onVariants,
  onRecipes,
}) {
  const {
    page,
    nextPage,
    prevPage,
    total,
    totalPages,
    startItem,
    endItem,
    hasPrev,
    hasNext,
    paginatedItems,
  } = pagination;

  return (
    <>
      <Paper
        sx={{
          p: 0,
          overflow: "hidden",
          borderRadius: 0,
          backgroundColor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: "1px solid",
            borderColor: "divider",
            backgroundColor: "#fff",
          }}
        >
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 800,
              color: "text.primary",
            }}
          >
            Lista de productos
          </Typography>
        </Box>

        {products.length === 0 ? (
          <Box
            sx={{
              px: 3,
              py: 5,
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              No hay productos en este filtro
            </Typography>

            <Typography
              sx={{
                mt: 1,
                color: "text.secondary",
                fontSize: 14,
              }}
            >
              Crea un producto nuevo o cambia la categoría o el estado visible.
            </Typography>

            <Button
              onClick={onCreate}
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                mt: 2.5,
                minWidth: 220,
                height: 44,
                borderRadius: 2,
                fontWeight: 800,
              }}
            >
              Nuevo producto
            </Button>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                p: 2,
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                },
                gap: 2,
              }}
            >
              {paginatedItems.map((p) => {
                const pt = p.product_type || "simple";
                const it =
                  p.inventory_type ||
                  normalizeInventoryForProductType(pt, "none");

                const ptLabel = labelFromOptions(PRODUCT_TYPES, pt, pt);
                const itLabel = labelFromOptions(INVENTORY_TYPES, it, it);
                const planMeta = p.plan_meta || null;
                const isBlockedByPlan = Boolean(planMeta?.blocked_by_plan);
                const canActivate = planMeta?.can_activate !== false;
                const rules = buttonsRules(pt, it, allowedProducts, planMeta);
                const isActive = p.status === "active";
                const showRelatedActions =
                  rules.components || rules.variants || rules.recipes;

                return (
                  <Card
                    key={p.id}
                    sx={{
                      borderRadius: 1,
                      boxShadow: "none",
                      border: "1px solid",
                      borderColor: isBlockedByPlan ? "warning.main" : "divider",
                      backgroundColor: "#fff",
                    }}
                  >
                    <Box sx={{ p: 2 }}>
                      <Stack spacing={1.75}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          spacing={1.5}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              sx={{
                                fontSize: 18,
                                fontWeight: 800,
                                color: "text.primary",
                                lineHeight: 1.25,
                                wordBreak: "break-word",
                              }}
                            >
                              {p.name}
                            </Typography>

                            <Stack
                              direction="row"
                              spacing={1}
                              flexWrap="wrap"
                              useFlexGap
                              sx={{ mt: 1 }}
                            >
                              <Chip
                                size="small"
                                label={ptLabel}
                                sx={{
                                  fontWeight: 800,
                                  bgcolor: "#FFF1DD",
                                  color: "#8A4F00",
                                }}
                              />
                              <Chip
                                size="small"
                                label={itLabel}
                                sx={{
                                  fontWeight: 800,
                                  bgcolor: "#EEF2FF",
                                  color: "#3F3A52",
                                }}
                              />
                              <Chip
                                size="small"
                                label={p.is_global ? "Global" : "Sucursal"}
                                color="secondary"
                                sx={{ fontWeight: 800 }}
                              />
                              {isBlockedByPlan ? (
                                <Chip
                                  size="small"
                                  icon={<LockOutlinedIcon />}
                                  label="Bloqueado por plan"
                                  color="warning"
                                  sx={{ fontWeight: 800 }}
                                />
                              ) : null}
                            </Stack>
                          </Box>

                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Editar">
                              <IconButton
                                onClick={() => onEdit(p)}
                                sx={iconEditSx}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Eliminar">
                              <IconButton
                                onClick={() => onDelete(p)}
                                sx={iconDeleteSx}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Stack>

                        {isBlockedByPlan ? (
                          <Alert
                            severity="warning"
                            sx={{
                              borderRadius: 1,
                              alignItems: "flex-start",
                            }}
                          >
                            <Typography variant="body2">
                              {planMeta?.blocked_reason ||
                                "Este producto está deshabilitado por el plan actual. Solo puedes editar datos básicos."}
                            </Typography>
                          </Alert>
                        ) : null}

                        <Stack spacing={1}>
                          <InfoRow
                            label="Categoría"
                            value={p.category?.name || "—"}
                          />

                          <InfoRow
                            label="Estado"
                            value={
                              <FormControlLabel
                                sx={{
                                  m: 0,
                                  "& .MuiFormControlLabel-label": {
                                    minWidth: 0,
                                  },
                                }}
                                control={
                                  <Switch
                                    checked={isActive}
                                    onChange={() => onToggleStatus(p)}
                                    color="primary"
                                    disabled={!canActivate && !isActive}
                                  />
                                }
                                label={
                                  <Typography sx={switchLabelSx}>
                                    {isActive ? "Activo" : "Inactivo"}
                                  </Typography>
                                }
                              />
                            }
                          />

                          <InfoRow
                            label="Descripción"
                            value={
                              p.description ? (
                                <Typography
                                  sx={{
                                    fontSize: 14,
                                    color: "text.primary",
                                    lineHeight: 1.55,
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {p.description}
                                </Typography>
                              ) : (
                                "Sin descripción"
                              )
                            }
                          />
                        </Stack>

                        {showRelatedActions ? (
                          <Box
                            sx={{
                              pt: 1,
                              borderTop: "1px solid",
                              borderColor: "divider",
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: 12,
                                fontWeight: 800,
                                color: "text.secondary",
                                mb: 1,
                                textTransform: "uppercase",
                                letterSpacing: 0.35,
                              }}
                            >
                              Configuración relacionada
                            </Typography>

                            <Stack
                              direction={{ xs: "column", sm: "row" }}
                              spacing={1}
                              flexWrap="wrap"
                              useFlexGap
                            >
                              {rules.components ? (
                                <Button
                                  onClick={() => onComponents(p)}
                                  variant="outlined"
                                  sx={relatedButtonSx}
                                >
                                  Componentes
                                </Button>
                              ) : null}

                              {rules.variants ? (
                                <Button
                                  onClick={() => onVariants(p)}
                                  variant="outlined"
                                  sx={relatedButtonSx}
                                >
                                  Variantes
                                </Button>
                              ) : null}

                              {rules.recipes ? (
                                <Button
                                  onClick={() => onRecipes(p)}
                                  variant="outlined"
                                  sx={relatedButtonSx}
                                >
                                  Recetas
                                </Button>
                              ) : null}
                            </Stack>
                          </Box>
                        ) : null}
                      </Stack>
                    </Box>
                  </Card>
                );
              })}
            </Box>

            <PaginationFooter
              page={page}
              totalPages={totalPages}
              startItem={startItem}
              endItem={endItem}
              total={total}
              hasPrev={hasPrev}
              hasNext={hasNext}
              onPrev={prevPage}
              onNext={nextPage}
              itemLabel="productos"
            />
          </>
        )}
      </Paper>

      {productsMode === "global" ? (
        <Typography
          sx={{
            fontSize: 12,
            color: "text.secondary",
            lineHeight: 1.5,
          }}
        >
          Nota: estos productos corresponden al catálogo base. Lo que vende cada sucursal puede ajustarse después desde su propio catálogo.
        </Typography>
      ) : null}
    </>
  );
}

function InfoRow({ label, value }) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={{ xs: 0.5, sm: 1.25 }}
      alignItems={{ xs: "flex-start", sm: "center" }}
    >
      <Typography sx={mobileLabelSx}>{label}</Typography>

      {typeof value === "string" ? (
        <Typography sx={mobileValueSx}>{value}</Typography>
      ) : (
        value
      )}
    </Stack>
  );
}

const switchLabelSx = {
  fontSize: 14,
  fontWeight: 700,
  color: "text.primary",
};

const mobileLabelSx = {
  fontSize: 11,
  fontWeight: 800,
  color: "text.secondary",
  textTransform: "uppercase",
  letterSpacing: 0.3,
};

const mobileValueSx = {
  fontSize: 14,
  color: "text.primary",
  wordBreak: "break-word",
  lineHeight: 1.5,
};

const iconEditSx = {
  width: 40,
  height: 40,
  bgcolor: "#E3C24A",
  color: "#fff",
  borderRadius: 1.5,
  "&:hover": {
    bgcolor: "#C9AA39",
  },
};

const iconDeleteSx = {
  width: 40,
  height: 40,
  bgcolor: "error.main",
  color: "#fff",
  borderRadius: 1.5,
  "&:hover": {
    bgcolor: "error.dark",
  },
};

const relatedButtonSx = {
  height: 40,
  borderRadius: 2,
  fontSize: 12,
  fontWeight: 800,
  whiteSpace: "nowrap",
};