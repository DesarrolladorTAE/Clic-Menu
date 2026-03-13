import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import {
  Alert, Box, Button, Card, Chip, CircularProgress, FormControlLabel, IconButton, Paper, Stack,
  Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography,
  useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import EditIcon from "@mui/icons-material/Edit";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";

import { getRestaurantSettings } from "../../services/restaurant/restaurantSettings.service";
import { getBranchesByRestaurant } from "../../services/restaurant/branch.service";
import { getIngredients } from "../../services/inventory/ingredients/ingredients.service";

import {
  getProductRecipes,
  setProductRecipeItemStatus,
} from "../../services/inventory/recipes/productRecipes.service";

import PageContainer from "../../components/common/PageContainer";
import AppAlert from "../../components/common/AppAlert";
import PaginationFooter from "../../components/common/PaginationFooter";
import usePagination from "../../hooks/usePagination";

import ProductRecipeEditorModal from "../../components/products/recipes/ProductRecipeEditorModal";

const PAGE_SIZE = 5;

function normalizeErr(e) {
  return (
    e?.response?.data?.message ||
    (e?.response?.data?.errors
      ? Object.values(e.response.data.errors).flat().join("\n")
      : "") ||
    "Ocurrió un error"
  );
}

export default function ProductRecipesPage() {
  const nav = useNavigate();
  const { restaurantId, productId } = useParams();
  const location = useLocation();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const productNameFromState = location?.state?.product_name || "";

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "success",
    title: "",
    message: "",
  });

  const [settings, setSettings] = useState(null);
  const recipeMode = settings?.recipe_mode || "global";
  const branchMode = recipeMode === "branch";

  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");

  const effectiveBranchId = useMemo(() => {
    if (!branchMode) return null;
    return branchId ? Number(branchId) : null;
  }, [branchMode, branchId]);

  const [ingredients, setIngredients] = useState([]);
  const ingredientsById = useMemo(() => {
    const m = new Map();
    (ingredients || []).forEach((it) => m.set(Number(it.id), it));
    return m;
  }, [ingredients]);

  const [product, setProduct] = useState({ id: null, name: "" });
  const [baseItems, setBaseItems] = useState([]);
  const [variants, setVariants] = useState([]);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorTitle, setEditorTitle] = useState("");
  const [editorVariantId, setEditorVariantId] = useState(null);
  const [editorItems, setEditorItems] = useState([]);

  const canUseBranch = !branchMode || !!effectiveBranchId;

  const showAlert = ({
    severity = "success",
    title = "",
    message = "",
  }) => {
    setAlertState({
      open: true,
      severity,
      title,
      message,
    });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    if (!err) return;
    const timer = setTimeout(() => setErr(""), 5000);
    return () => clearTimeout(timer);
  }, [err]);

  const hydrateFromRecipes = (recipesResp) => {
    const d = recipesResp?.data || {};
    setProduct({
      id: d?.product?.id || Number(productId),
      name: d?.product?.name || productNameFromState || "",
    });
    setBaseItems(d?.base_items || []);
    setVariants(d?.variants || []);
  };

  const loadRecipes = async ({
    settingsSnapshot = settings,
    branchSnapshot = effectiveBranchId,
  } = {}) => {
    const branchParam =
      (settingsSnapshot?.recipe_mode || "global") === "branch"
        ? branchSnapshot
        : null;

    const recipes = await getProductRecipes(restaurantId, productId, {
      branch_id: branchParam,
    });

    hydrateFromRecipes(recipes);
  };

  const loadAll = async () => {
    setErr("");
    setLoading(true);

    try {
      const st = await getRestaurantSettings(restaurantId);
      setSettings(st);

      let selectedBranchId = null;

      if ((st?.recipe_mode || "global") === "branch") {
        const br = await getBranchesByRestaurant(restaurantId);
        const branchList = Array.isArray(br) ? br : [];
        setBranches(branchList);

        selectedBranchId = branchId
          ? Number(branchId)
          : branchList?.[0]?.id
          ? Number(branchList[0].id)
          : null;

        if (!branchId && selectedBranchId) {
          setBranchId(String(selectedBranchId));
        }
      } else {
        setBranches([]);
        setBranchId("");
      }

      const ingResp = await getIngredients(restaurantId, {
        only_active: true,
        q: "",
      });
      setIngredients(ingResp?.data || []);

      try {
        const recipes = await getProductRecipes(restaurantId, productId, {
          branch_id:
            (st?.recipe_mode || "global") === "branch"
              ? selectedBranchId
              : null,
        });
        hydrateFromRecipes(recipes);
      } catch (e) {
        setErr(normalizeErr(e, "No se pudieron cargar recetas"));
      }
    } catch (e) {
      setErr(
        e?.response?.data?.message ||
          "No se pudo cargar la pantalla de recetas"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, productId]);

  useEffect(() => {
    if (loading) return;
    if (!branchMode) return;

    if (!effectiveBranchId) {
      setBaseItems([]);
      setVariants([]);
      return;
    }

    (async () => {
      try {
        setErr("");
        await loadRecipes({
          settingsSnapshot: settings,
          branchSnapshot: effectiveBranchId,
        });
      } catch (e) {
        setErr(normalizeErr(e, "No se pudieron cargar recetas"));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveBranchId, branchMode]);

  const normalizeItemsForEditor = (items) => {
    return (items || []).map((it) => ({
      id: it.id ?? null,
      ingredient_id: Number(it.ingredient_id),
      qty: Number(it.qty),
      notes: it.notes ?? "",
      status: it.status || "active",
      ingredient: it.ingredient || null,
      branch_id: it.branch_id ?? null,
      product_variant_id: it.product_variant_id ?? null,
    }));
  };

  const openBaseEditor = () => {
    setErr("");
    setEditorVariantId(null);
    setEditorTitle("Receta del producto principal");
    setEditorItems(normalizeItemsForEditor(baseItems));
    setEditorOpen(true);
  };

  const openVariantEditor = (variant) => {
    setErr("");
    setEditorVariantId(variant?.id);
    setEditorTitle(`Receta de variante: ${variant?.name || "Variante"}`);
    setEditorItems(normalizeItemsForEditor(variant?.items || []));
    setEditorOpen(true);
  };

  const onToggleItemStatus = async (item, nextStatus) => {
    if (!item?.id) return;

    try {
      setErr("");
      await setProductRecipeItemStatus(
        restaurantId,
        productId,
        item.id,
        nextStatus
      );

      await loadRecipes();
      showAlert({
        severity: "success",
        title: "Estado actualizado",
        message:
          nextStatus === "active"
            ? "El ingrediente quedó activo."
            : "El ingrediente quedó inactivo.",
      });
    } catch (e) {
      setErr(normalizeErr(e, "No se pudo cambiar el estado"));
    }
  };

  const basePagination = usePagination({
    items: baseItems,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  const variantCarousel = usePagination({
    items: variants,
    initialPage: 1,
    pageSize: 1,
    mode: "frontend",
  });

  const activeVariant = variantCarousel.paginatedItems?.[0] || null;

  const activeVariantItemsPagination = usePagination({
    items: activeVariant?.items || [],
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  if (loading) {
    return (
      <PageContainer>
        <Box
          sx={{
            minHeight: "60vh",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Stack spacing={2} alignItems="center">
            <CircularProgress color="primary" />
            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
              Cargando recetas…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
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
              Recetas del producto
            </Typography>

            <Typography
              sx={{
                mt: 1,
                color: "text.secondary",
                fontSize: { xs: 15, md: 18 },
              }}
            >
              Administra las recetas de <strong>{product.name || "este producto"}</strong>.
            </Typography>
          </Box>

          <Button
            onClick={() =>
              nav(`/owner/restaurants/${restaurantId}/operation/menu/products`)
            }
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            sx={{
              minWidth: { xs: "100%", sm: 220 },
              height: 44,
              borderRadius: 2,
            }}
          >
            Volver a productos
          </Button>
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
              Antes de comenzar
            </Typography>

            <InstructionRow
              icon={<AutoStoriesOutlinedIcon sx={{ fontSize: 18 }} />}
              text="Crea la receta del producto principal. Es obligatoria porque funciona como base de consumo."
            />

            <InstructionRow
              icon={<CategoryOutlinedIcon sx={{ fontSize: 18 }} />}
              text="Las recetas de variantes son opcionales. Si una variante no tiene receta propia, puede seguir usando la receta base."
            />

            <InstructionRow
              icon={<Inventory2OutlinedIcon sx={{ fontSize: 18 }} />}
              text="Puedes activar o desactivar ingredientes desde esta pantalla para afectar consumos futuros sin borrar la receta."
            />

            <InstructionRow
              icon={<StorefrontOutlinedIcon sx={{ fontSize: 18 }} />}
              text={
                recipeMode === "branch"
                  ? "Modo receta por sucursal: los cambios se guardan únicamente en la sucursal seleccionada."
                  : "Modo receta global: la misma receta aplica de forma general y no depende de sucursal."
              }
            />

            {branchMode ? (
              <Box sx={{ pt: 1 }}>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "text.primary",
                    mb: 1,
                  }}
                >
                  Sucursal
                </Typography>

                <Paper
                  sx={{
                    p: 1,
                    borderRadius: 0,
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "none",
                    backgroundColor: "#fff",
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    useFlexGap
                  >
                    {branches.map((b) => {
                      const selected = String(b.id) === String(branchId);

                      return (
                        <Button
                          key={b.id}
                          variant={selected ? "contained" : "outlined"}
                          onClick={() => setBranchId(String(b.id))}
                          sx={{
                            minHeight: 40,
                            borderRadius: 2,
                            fontWeight: 800,
                          }}
                        >
                          {b.name || "Sucursal"}
                        </Button>
                      );
                    })}
                  </Stack>
                </Paper>
              </Box>
            ) : null}
          </Stack>
        </Paper>

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

        {!canUseBranch ? (
          <Alert
            severity="warning"
            sx={{
              borderRadius: 1,
              alignItems: "flex-start",
            }}
          >
            <Box>
              <Typography sx={{ fontWeight: 800, mb: 0.5 }}>
                Falta seleccionar sucursal
              </Typography>
              <Typography variant="body2">
                En modo por sucursal necesitas elegir una sucursal para ver o editar recetas.
              </Typography>
            </Box>
          </Alert>
        ) : null}

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
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={1.5}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "text.primary",
                  }}
                >
                  Receta del producto principal
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: 13,
                    color: "text.secondary",
                  }}
                >
                  Esta receta sirve como base general del producto.
                </Typography>
              </Box>

              <Button
                onClick={openBaseEditor}
                variant="contained"
                startIcon={<EditIcon />}
                disabled={!canUseBranch}
                sx={{
                  minWidth: { xs: "100%", sm: 190 },
                  height: 44,
                  borderRadius: 2,
                  fontWeight: 800,
                }}
              >
                {baseItems?.length ? "Editar receta base" : "Crear receta base"}
              </Button>
            </Stack>
          </Box>

          {!baseItems?.length ? (
            <Box
              sx={{
                px: 3,
                py: 5,
                textAlign: "center",
              }}
            >
              <MenuBookOutlinedIcon
                sx={{
                  fontSize: 34,
                  color: "text.secondary",
                }}
              />

              <Typography
                sx={{
                  mt: 1,
                  fontSize: 20,
                  fontWeight: 800,
                  color: "text.primary",
                }}
              >
                Este producto no tiene receta base
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  color: "text.secondary",
                  fontSize: 14,
                }}
              >
                Créala para definir el consumo principal de ingredientes.
              </Typography>
            </Box>
          ) : (
            <>
              <RecipeItemsSection
                items={basePagination.paginatedItems}
                allItems={baseItems}
                onToggleStatus={onToggleItemStatus}
                isMobile={isMobile}
                ingredientsById={ingredientsById}
              />

              <PaginationFooter
                page={basePagination.page}
                totalPages={basePagination.totalPages}
                startItem={basePagination.startItem}
                endItem={basePagination.endItem}
                total={basePagination.total}
                hasPrev={basePagination.hasPrev}
                hasNext={basePagination.hasNext}
                onPrev={basePagination.prevPage}
                onNext={basePagination.nextPage}
                itemLabel="ingredientes"
              />
            </>
          )}
        </Paper>

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
            <Stack spacing={1.5}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={1.5}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: "text.primary",
                    }}
                  >
                    Recetas por variante
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: 13,
                      color: "text.secondary",
                    }}
                  >
                    Define recetas específicas para cada variante cuando lo necesites.
                  </Typography>
                </Box>

                {variants.length ? (
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Variante anterior">
                      <span>
                        <IconButton
                          onClick={variantCarousel.prevPage}
                          disabled={!variantCarousel.hasPrev}
                          sx={navIconSx}
                        >
                          <NavigateBeforeIcon />
                        </IconButton>
                      </span>
                    </Tooltip>

                    <Tooltip title="Siguiente variante">
                      <span>
                        <IconButton
                          onClick={variantCarousel.nextPage}
                          disabled={!variantCarousel.hasNext}
                          sx={navIconSx}
                        >
                          <NavigateNextIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                ) : null}
              </Stack>

              {variants.length ? (
                <Typography
                  sx={{
                    fontSize: 13,
                    color: "text.secondary",
                  }}
                >
                  Variante {variantCarousel.page} de {variantCarousel.totalPages}
                </Typography>
              ) : null}
            </Stack>
          </Box>

          {!variants?.length ? (
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
                Este producto no tiene variantes
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  color: "text.secondary",
                  fontSize: 14,
                }}
              >
                Cuando existan variantes, aquí podrás asignarles recetas propias.
              </Typography>
            </Box>
          ) : activeVariant ? (
            <>
              <Box sx={{ p: 2 }}>
                <Card
                  sx={{
                    borderRadius: 1,
                    boxShadow: "none",
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "#fff",
                  }}
                >
                  <Box sx={{ p: 2 }}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      spacing={1.5}
                    >
                      <Box>
                        <Typography
                          sx={{
                            fontSize: 18,
                            fontWeight: 800,
                            color: "text.primary",
                          }}
                        >
                          {activeVariant.name || "Variante"}
                        </Typography>

                        <Typography
                          sx={{
                            mt: 0.5,
                            fontSize: 13,
                            color: "text.secondary",
                          }}
                        >
                          {(activeVariant?.items || []).length
                            ? "Esta variante usa su propia receta."
                            : "Esta variante no tiene receta propia y puede apoyarse en la receta base."}
                        </Typography>
                      </Box>

                      <Button
                        onClick={() => openVariantEditor(activeVariant)}
                        variant="contained"
                        startIcon={<EditIcon />}
                        disabled={!canUseBranch}
                        sx={{
                          minWidth: { xs: "100%", sm: 210 },
                          height: 44,
                          borderRadius: 2,
                          fontWeight: 800,
                        }}
                      >
                        {(activeVariant?.items || []).length
                          ? "Editar receta variante"
                          : "Crear receta variante"}
                      </Button>
                    </Stack>
                  </Box>
                </Card>
              </Box>

              {(activeVariant?.items || []).length ? (
                <>
                  <RecipeItemsSection
                    items={activeVariantItemsPagination.paginatedItems}
                    allItems={activeVariant.items || []}
                    onToggleStatus={onToggleItemStatus}
                    isMobile={isMobile}
                    ingredientsById={ingredientsById}
                  />

                  <PaginationFooter
                    page={activeVariantItemsPagination.page}
                    totalPages={activeVariantItemsPagination.totalPages}
                    startItem={activeVariantItemsPagination.startItem}
                    endItem={activeVariantItemsPagination.endItem}
                    total={activeVariantItemsPagination.total}
                    hasPrev={activeVariantItemsPagination.hasPrev}
                    hasNext={activeVariantItemsPagination.hasNext}
                    onPrev={activeVariantItemsPagination.prevPage}
                    onNext={activeVariantItemsPagination.nextPage}
                    itemLabel="ingredientes"
                  />
                </>
              ) : (
                <Box
                  sx={{
                    px: 3,
                    py: 4,
                    textAlign: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: "text.primary",
                    }}
                  >
                    Esta variante no tiene receta propia
                  </Typography>

                  <Typography
                    sx={{
                      mt: 1,
                      fontSize: 14,
                      color: "text.secondary",
                    }}
                  >
                    Puedes crearla si esta combinación necesita consumir ingredientes distintos.
                  </Typography>
                </Box>
              )}
            </>
          ) : null}
        </Paper>
      </Stack>

      <ProductRecipeEditorModal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        restaurantId={restaurantId}
        productId={productId}
        branchMode={branchMode}
        effectiveBranchId={effectiveBranchId}
        ingredients={ingredients}
        initialItems={editorItems}
        title={editorTitle}
        variantId={editorVariantId}
        onSaved={async () => {
          setEditorOpen(false);
          await loadRecipes();
          showAlert({
            severity: "success",
            title: "Receta guardada",
            message: "La receta se actualizó correctamente.",
          });
        }}
      />

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={alertState.severity}
        title={alertState.title}
        message={alertState.message}
        autoHideDuration={4000}
      />
    </PageContainer>
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

function RecipeItemsSection({
  items,
  allItems,
  onToggleStatus,
  isMobile,
  ingredientsById,
}) {
  if (!isMobile) {
    return (
      <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
        <Table sx={{ minWidth: 980 }}>
          <TableHead>
            <TableRow
              sx={{
                "& th": {
                  backgroundColor: "primary.main",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 13,
                  borderBottom: "none",
                  whiteSpace: "nowrap",
                },
              }}
            >
              <TableCell>Ingrediente</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Unidad</TableCell>
              <TableCell>Notas</TableCell>
              <TableCell>Estado</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {items.map((it) => {
              const ing = it.ingredient || ingredientsById.get(Number(it.ingredient_id)) || null;
              const unit = ing?.unit || ing?.unidad || "—";
              const status = it.status || "active";

              return (
                <TableRow
                  key={it.id || `${it.ingredient_id}-${it.qty}`}
                  hover
                  sx={{
                    "& td": {
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      fontSize: 14,
                      color: "text.primary",
                      verticalAlign: "top",
                    },
                  }}
                >
                  <TableCell>
                    <Typography sx={{ fontWeight: 800 }}>
                      {ing?.name || "Ingrediente"}
                    </Typography>
                  </TableCell>

                  <TableCell>{it.qty}</TableCell>
                  <TableCell>{unit}</TableCell>
                  <TableCell>{it.notes || "—"}</TableCell>

                  <TableCell>
                    <FormControlLabel
                      sx={{ m: 0 }}
                      control={
                        <Switch
                          checked={status === "active"}
                          onChange={(e) =>
                            onToggleStatus?.(
                              it,
                              e.target.checked ? "active" : "inactive"
                            )
                          }
                          color="primary"
                        />
                      }
                      label={
                        <Typography sx={switchLabelSx}>
                          {status === "active" ? "Activo" : "Inactivo"}
                        </Typography>
                      }
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <Stack spacing={1.5} sx={{ p: 2 }}>
      {items.map((it) => {
        const ing = it.ingredient || ingredientsById.get(Number(it.ingredient_id)) || null;
        const unit = ing?.unit || ing?.unidad || "—";
        const status = it.status || "active";

        return (
          <Card
            key={it.id || `${it.ingredient_id}-${it.qty}`}
            sx={{
              borderRadius: 1,
              boxShadow: "none",
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "#fff",
            }}
          >
            <Box sx={{ p: 2 }}>
              <Stack spacing={1.25}>
                <InfoRow label="Ingrediente" value={ing?.name || "Ingrediente"} />
                <InfoRow label="Cantidad" value={String(it.qty)} />
                <InfoRow label="Unidad" value={unit} />
                <InfoRow label="Notas" value={it.notes || "—"} />

                <Box>
                  <Typography sx={mobileLabelSx}>Estado</Typography>

                  <FormControlLabel
                    sx={{ m: 0, mt: 0.5 }}
                    control={
                      <Switch
                        checked={status === "active"}
                        onChange={(e) =>
                          onToggleStatus?.(
                            it,
                            e.target.checked ? "active" : "inactive"
                          )
                        }
                        color="primary"
                      />
                    }
                    label={
                      <Typography sx={switchLabelSx}>
                        {status === "active" ? "Activo" : "Inactivo"}
                      </Typography>
                    }
                  />
                </Box>
              </Stack>
            </Box>
          </Card>
        );
      })}
    </Stack>
  );
}

function InfoRow({ label, value }) {
  return (
    <Box>
      <Typography sx={mobileLabelSx}>{label}</Typography>
      <Typography sx={mobileValueSx}>{value}</Typography>
    </Box>
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
  mt: 0.25,
  fontSize: 14,
  color: "text.primary",
  wordBreak: "break-word",
  lineHeight: 1.5,
};

const navIconSx = {
  width: 40,
  height: 40,
  bgcolor: "#F4F4F4",
  color: "text.primary",
  borderRadius: 1.5,
  border: "1px solid",
  borderColor: "divider",
  "&:hover": {
    bgcolor: "#ECECEC",
  },
  "&.Mui-disabled": {
    opacity: 0.45,
  },
};