import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Alert, Box, Button, Card, Chip, CircularProgress, FormControl, FormControlLabel, IconButton,
  MenuItem, Paper, Select, Stack, Switch, Tooltip, Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalDiningOutlinedIcon from "@mui/icons-material/LocalDiningOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import { getRestaurantSettings } from "../../services/restaurant/restaurantSettings.service";
import { getBranchesByRestaurant } from "../../services/restaurant/branch.service";
import { getCategories } from "../../services/menu/categories.service";

import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductImages,
  uploadProductImage,
  deleteProductImage,
  reorderProductImages,
} from "../../services/products/products.service";

import PageContainer from "../../components/common/PageContainer";
import AppAlert from "../../components/common/AppAlert";
import PaginationFooter from "../../components/common/PaginationFooter";
import usePagination from "../../hooks/usePagination";

import ProductCategoryTabs from "../../components/products/ProductCategoryTabs";
import ProductFormModal from "../../components/products/ProductFormModal";

const PAGE_SIZE = 4;

// UI en español, values en inglés (BD)
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

function apiErrorToMessage(e, fallback = "Ocurrió un error") {
  return (
    e?.response?.data?.message ||
    (e?.response?.data?.errors
      ? Object.entries(e.response.data.errors)
          .map(([k, arr]) =>
            `${k}: ${Array.isArray(arr) ? arr.join(", ") : String(arr)}`
          )
          .join("\n")
      : "") ||
    fallback
  );
}

function allowedInventoryTypesForProductType(productType) {
  if (productType === "composite") return ["none"];
  return ["ingredients", "product"];
}

function normalizeInventoryForProductType(productType, inventoryType) {
  const allowed = allowedInventoryTypesForProductType(productType);
  return allowed.includes(inventoryType) ? inventoryType : allowed[0];
}

function getModeKey(productType, inventoryType) {
  const pt = productType || "simple";
  const it = inventoryType || (pt === "composite" ? "none" : "ingredients");
  return `${pt}:${it}`;
}

function buttonsRules(productType, inventoryType) {
  const key = getModeKey(productType, inventoryType);
  const rules = { recipes: false, variants: false, components: false };

  if (key === "simple:ingredients") {
    rules.recipes = true;
    rules.variants = true;
  }
  if (key === "simple:product") {
    rules.variants = true;
  }
  if (key === "composite:none") {
    rules.components = true;
  }
  return rules;
}

export default function ProductsPage() {
  const nav = useNavigate();
  const { restaurantId } = useParams();

  const [loading, setLoading] = useState(true);
  const [pageBusy, setPageBusy] = useState(false);
  const [err, setErr] = useState("");

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  // settings + mode
  const [settings, setSettings] = useState(null);
  const productsMode = settings?.products_mode || "global";
  const requiresBranch = productsMode === "branch";

  // branches
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");

  const effectiveBranchId = useMemo(() => {
    if (!requiresBranch) return null;
    return branchId ? Number(branchId) : null;
  }, [requiresBranch, branchId]);

  // categories / products
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [products, setProducts] = useState([]);

  // filtros estado
  const [statusFilter, setStatusFilter] = useState("active"); // all | active | inactive

  // modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);

  const reqRef = useRef(0);

  const showAlert = ({
    severity = "error",
    title = "Error",
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

  const listParams = useMemo(() => {
    const p = {};

    if (requiresBranch && effectiveBranchId) {
      p.branch_id = effectiveBranchId;
    }

    if (categoryId) {
      p.category_id = categoryId;
    }

    if (statusFilter === "active" || statusFilter === "inactive") {
      p.include_inactive = true;
      p.status = statusFilter;
    }

    if (statusFilter === "all") {
      p.include_inactive = true;
    }

    return p;
  }, [requiresBranch, effectiveBranchId, categoryId, statusFilter]);

  const loadProducts = async ({ silent = false } = {}) => {
    const myReq = ++reqRef.current;

    if (!silent) setPageBusy(true);

    try {
      const list = await getProducts(restaurantId, listParams);
      if (myReq !== reqRef.current) return;
      setProducts(list || []);
    } catch (e) {
      if (myReq !== reqRef.current) return;
      setErr(apiErrorToMessage(e, "No se pudieron cargar los productos"));
    } finally {
      if (myReq !== reqRef.current) return;
      setPageBusy(false);
    }
  };

  const loadAll = async () => {
    setErr("");
    setLoading(true);

    try {
      const st = await getRestaurantSettings(restaurantId);
      setSettings(st);

      let br = [];
      let chosenBranchId = null;

      if (st?.products_mode === "branch") {
        br = await getBranchesByRestaurant(restaurantId);
        setBranches(br || []);

        chosenBranchId = branchId
          ? Number(branchId)
          : br?.[0]?.id
          ? Number(br[0].id)
          : null;

        if (!branchId && chosenBranchId) {
          setBranchId(String(chosenBranchId));
        }
      } else {
        setBranches([]);
        setBranchId("");
      }

      const catQuery =
        st?.products_mode === "branch" && chosenBranchId
          ? { status: "active", branch_id: chosenBranchId }
          : { status: "active" };

      const cats = await getCategories(restaurantId, catQuery);
      setCategories(cats || []);

      const firstCatId = cats?.[0]?.id ? String(cats[0].id) : "";
      const nextCategoryId = categoryId || firstCatId || "";

      if (!categoryId && firstCatId) {
        setCategoryId(firstCatId);
      }

      const prodQuery =
        st?.products_mode === "branch" && chosenBranchId
          ? {
              branch_id: chosenBranchId,
              category_id: nextCategoryId || undefined,
              include_inactive: statusFilter === "all" || statusFilter === "inactive",
              status:
                statusFilter === "active" || statusFilter === "inactive"
                  ? statusFilter
                  : undefined,
            }
          : {
              category_id: nextCategoryId || undefined,
              include_inactive: statusFilter === "all" || statusFilter === "inactive",
              status:
                statusFilter === "active" || statusFilter === "inactive"
                  ? statusFilter
                  : undefined,
            };

      const list = await getProducts(restaurantId, prodQuery);
      setProducts(list || []);
    } catch (e) {
      setErr(apiErrorToMessage(e, "No se pudo cargar productos"));
    } finally {
      setLoading(false);
      setPageBusy(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  useEffect(() => {
    if (loading) return;
    if (requiresBranch && !effectiveBranchId) return;

    (async () => {
      try {
        if (requiresBranch && effectiveBranchId) {
          const cats = await getCategories(restaurantId, {
            status: "active",
            branch_id: effectiveBranchId,
          });

          setCategories(cats || []);

          const exists = (cats || []).some(
            (c) => String(c.id) === String(categoryId)
          );

          if (!exists) {
            const first = cats?.[0]?.id ? String(cats[0].id) : "";
            setCategoryId(first);
            return;
          }
        }

        await loadProducts({ silent: true });
      } catch {
        // silencio administrativo
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, requiresBranch, effectiveBranchId]);

  useEffect(() => {
    if (loading) return;
    if (requiresBranch && !effectiveBranchId) return;

    const t = setTimeout(() => {
      loadProducts({ silent: true });
    }, 120);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listParams, restaurantId]);

  const openCreateModal = () => {
    setErr("");
    setModalProduct({
      id: null,
      category_id: categoryId || categories?.[0]?.id || "",
      name: "",
      description: "",
      status: "active",
      product_type: "simple",
      inventory_type: "ingredients",
    });
    setModalOpen(true);
  };

  const onEdit = async (p) => {
    setErr("");
    try {
      const fresh = await getProduct(restaurantId, p.id);
      setModalProduct({
        id: fresh.id,
        category_id: String(fresh.category_id),
        name: fresh.name || "",
        description: fresh.description || "",
        status: fresh.status || "active",
        product_type: fresh.product_type || "simple",
        inventory_type:
          fresh.inventory_type ||
          normalizeInventoryForProductType(
            fresh.product_type || "simple",
            "ingredients"
          ),
      });
      setModalOpen(true);
    } catch (e) {
      setErr(apiErrorToMessage(e, "No se pudo cargar producto"));
    }
  };

  const onDelete = async (p) => {
    const ok = window.confirm(`¿Eliminar producto?\n\n${p.name}`);
    if (!ok) return;

    const snapshot = products;
    setProducts((prev) => prev.filter((x) => x.id !== p.id));

    try {
      setErr("");
      await deleteProduct(restaurantId, p.id);

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Producto eliminado correctamente.",
      });
    } catch (e) {
      setProducts(snapshot);
      setErr(apiErrorToMessage(e, "No se pudo eliminar"));
    }
  };

  const buildBranchQuery = () => {
    if (requiresBranch && effectiveBranchId) {
      return `?branch_id=${encodeURIComponent(effectiveBranchId)}`;
    }
    return "";
  };

  const onVariants = (p) => {
    if (!p?.id) return;
    nav(`/owner/restaurants/${restaurantId}/operation/menu/products/${p.id}/variants`, {
      state: {
        product_name: p?.name || "",
        products_mode: productsMode,
        branch_id: effectiveBranchId,
      },
    });
  };

  const onRecipes = (p) => {
    if (!p?.id) return;
    nav(`/owner/restaurants/${restaurantId}/operation/menu/products/${p.id}/recipes`, {
      state: {
        product_name: p?.name || "",
        products_mode: productsMode,
        branch_id: effectiveBranchId,
      },
    });
  };

  const onComponents = (p) => {
    if (!p?.id) return;
    nav(
      `/owner/restaurants/${restaurantId}/operation/menu/products/${p.id}/components${buildBranchQuery()}`,
      {
        state: {
          product_name: p?.name || "",
          products_mode: productsMode,
          branch_id: effectiveBranchId,
        },
      }
    );
  };

  const onToggleStatus = async (row) => {
    const nextStatus = row.status === "active" ? "inactive" : "active";
    const snapshot = products;

    setProducts((prev) =>
      prev.map((x) => (x.id === row.id ? { ...x, status: nextStatus } : x))
    );

    try {
      await updateProduct(restaurantId, row.id, {
        category_id: Number(row.category_id),
        name: row.name,
        description: row.description || null,
        status: nextStatus,
      });

      showAlert({
        severity: "success",
        title: "Estado actualizado",
        message:
          nextStatus === "active"
            ? "El producto quedó activo."
            : "El producto quedó inactivo.",
      });
    } catch (e) {
      setProducts(snapshot);
      setErr(apiErrorToMessage(e, "No se pudo actualizar estado"));
    }
  };

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
  } = usePagination({
    items: products,
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
              Cargando productos…
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
              onClick={() => nav(`/owner/restaurants/${restaurantId}/operation/menu`)}
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
              onClick={openCreateModal}
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

            <InstructionRow
              icon={<LayersOutlinedIcon sx={{ fontSize: 18 }} />}
              text="Puede ser un producto compuesto porque es un producto que será compuesto de más productos, sin inventario directo."
            />

            <InstructionRow
              icon={<LocalDiningOutlinedIcon sx={{ fontSize: 18 }} />}
              text="Puede ser un producto simple con ingredientes, ideal para comidas con receta."
            />

            <InstructionRow
              icon={<Inventory2OutlinedIcon sx={{ fontSize: 18 }} />}
              text="Puede ser un producto simple de productos, pensado para artículos ya hechos y sin receta."
            />
          </Stack>
        </Paper>

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
                  onChange={(e) => setBranchId(e.target.value)}
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
                  onChange={setCategoryId}
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
                    onChange={(e) => setStatusFilter(e.target.value)}
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
              Mostrando {products.length} productos
            </Typography>
          </Stack>
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
                onClick={openCreateModal}
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
                    normalizeInventoryForProductType(pt, "ingredients");

                  const ptLabel = labelFromOptions(PRODUCT_TYPES, pt, pt);
                  const itLabel = labelFromOptions(INVENTORY_TYPES, it, it);
                  const rules = buttonsRules(pt, it);
                  const isActive = p.status === "active";

                  return (
                    <Card
                      key={p.id}
                      sx={{
                        borderRadius: 1,
                        boxShadow: "none",
                        border: "1px solid",
                        borderColor: "divider",
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
                              <Button
                                onClick={() => onComponents(p)}
                                disabled={!rules.components}
                                variant="outlined"
                                sx={{
                                  height: 40,
                                  borderRadius: 2,
                                  fontSize: 12,
                                  fontWeight: 800,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                Componentes
                              </Button>

                              <Button
                                onClick={() => onVariants(p)}
                                disabled={!rules.variants}
                                variant="outlined"
                                sx={{
                                  height: 40,
                                  borderRadius: 2,
                                  fontSize: 12,
                                  fontWeight: 800,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                Variantes
                              </Button>

                              <Button
                                onClick={() => onRecipes(p)}
                                disabled={!rules.recipes}
                                variant="outlined"
                                sx={{
                                  height: 40,
                                  borderRadius: 2,
                                  fontSize: 12,
                                  fontWeight: 800,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                Recetas
                              </Button>
                            </Stack>
                          </Box>
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
      </Stack>

      <ProductFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setModalProduct(null);
        }}
        restaurantId={restaurantId}
        productsMode={productsMode}
        requiresBranch={requiresBranch}
        effectiveBranchId={effectiveBranchId}
        categories={categories}
        initialData={modalProduct}
        getProduct={getProduct}
        createProduct={createProduct}
        updateProduct={updateProduct}
        getProductImages={getProductImages}
        uploadProductImage={uploadProductImage}
        deleteProductImage={deleteProductImage}
        reorderProductImages={reorderProductImages}
        onSaved={async () => {
          await loadProducts({ silent: true });
          showAlert({
            severity: "success",
            title: "Hecho",
            message: modalProduct?.id
              ? "Producto actualizado correctamente."
              : "Producto creado correctamente.",
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

const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
  mb: 1,
};

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