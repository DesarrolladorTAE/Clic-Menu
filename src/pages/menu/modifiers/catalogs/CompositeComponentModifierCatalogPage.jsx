import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Box, Button, Card, Chip, CircularProgress, FormControlLabel, IconButton, ListSubheader,
  MenuItem, Paper, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Tooltip, Typography, useMediaQuery, TextField,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import PageContainer from "../../../../components/common/PageContainer";
import AppAlert from "../../../../components/common/AppAlert";
import PaginationFooter from "../../../../components/common/PaginationFooter";
import usePagination from "../../../../hooks/usePagination";
import ProductCategoryTabs from "../../../../components/products/ProductCategoryTabs";

import { getRestaurantSettings } from "../../../../services/restaurant/restaurantSettings.service";
import { getBranchesByRestaurant } from "../../../../services/restaurant/branch.service";
import { getCategories } from "../../../../services/menu/categories.service";
import { getModifierGroups } from "../../../../services/menu/modifiers/modifierGroups.service";
import {
  getCatalogProducts,
  getProductComponentsCatalog,
  getCompositeComponentModifierGroups,
  createCompositeComponentModifierGroup,
  updateCompositeComponentModifierGroup,
  deleteCompositeComponentModifierGroup,
} from "../../../../services/menu/modifiers/compositeComponentModifierGroups.service";

import CompositeComponentModifierGroupUpsertModal from "../../../../components/menu/modifiers/catalogs/CompositeComponentModifierGroupUpsertModal";

const PAGE_SIZE = 5;
const ALL_CATEGORIES_VALUE = "__all__";

export default function CompositeComponentModifierCatalogPage() {
  const { restaurantId } = useParams();
  const nav = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [loading, setLoading] = useState(true);
  const [savingMap, setSavingMap] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [settings, setSettings] = useState(null);
  const modifiersMode = settings?.modifiers_mode || "global";
  const productsMode = settings?.products_mode || "global";
  const requiresBranch = modifiersMode === "branch";

  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");

  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES_VALUE);
  const [statusFilter, setStatusFilter] = useState("active");

  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");

  const [components, setComponents] = useState([]);
  const [selectedComponentId, setSelectedComponentId] = useState("");

  const [groups, setGroups] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

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

  const effectiveBranchId = useMemo(() => {
    if (!requiresBranch) return null;
    return branchId ? Number(branchId) : null;
  }, [requiresBranch, branchId]);

  const categoryTabs = useMemo(() => {
    return [
      { id: ALL_CATEGORIES_VALUE, name: "Todas" },
      ...(Array.isArray(categories) ? categories : []),
    ];
  }, [categories]);

  const compositeProducts = useMemo(() => {
    return (Array.isArray(products) ? products : []).filter(
      (p) => p?.product_type === "composite"
    );
  }, [products]);

  const selectedProduct = useMemo(() => {
    return (
      compositeProducts.find((p) => String(p.id) === String(selectedProductId)) ||
      null
    );
  }, [compositeProducts, selectedProductId]);

  const selectedComponentRow = useMemo(() => {
    return (
      components.find(
        (row) =>
          String(row?.component_product_id) === String(selectedComponentId)
      ) || null
    );
  }, [components, selectedComponentId]);

  const selectedComponent = selectedComponentRow?.component_product || null;

  const availableGroups = useMemo(() => {
    return (Array.isArray(groups) ? groups : []).filter((group) =>
      ["component", "any"].includes(group?.applies_to)
    );
  }, [groups]);

  const groupedProducts = useMemo(() => {
    const map = new Map();

    compositeProducts.forEach((product) => {
      const categoryName = product?.category?.name || "Sin categoría";

      if (!map.has(categoryName)) {
        map.set(categoryName, []);
      }

      map.get(categoryName).push(product);
    });

    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0], "es", { sensitivity: "base" }))
      .map(([categoryName, rows]) => ({
        categoryName,
        products: [...rows].sort((a, b) =>
          (a?.name || "").localeCompare(b?.name || "", "es", {
            sensitivity: "base",
          })
        ),
      }));
  }, [compositeProducts]);

  const filteredAssignments = useMemo(() => {
    let rows = [...assignments];

    if (selectedComponentId) {
      rows = rows.filter(
        (row) =>
          String(row?.component_product_id) === String(selectedComponentId)
      );
    }

    return rows.sort((a, b) => {
      const byOrder = Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0);
      if (byOrder !== 0) return byOrder;

      const aName = a?.modifier_group?.name || a?.modifierGroup?.name || "";
      const bName = b?.modifier_group?.name || b?.modifierGroup?.name || "";

      return aName.localeCompare(bName, "es", { sensitivity: "base" });
    });
  }, [assignments, selectedComponentId]);

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
    items: filteredAssignments,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  const setSaving = (assignmentId, value) => {
    setSavingMap((prev) => ({ ...prev, [assignmentId]: value }));
  };

  const isSaving = (assignmentId) => !!savingMap[assignmentId];

  const getModifierParams = () => {
    if (!requiresBranch || !effectiveBranchId) return {};
    return { branch_id: effectiveBranchId };
  };

  const getCategoryParams = () => {
    if (productsMode === "branch" && effectiveBranchId) {
      return {
        status: "active",
        branch_id: effectiveBranchId,
      };
    }

    return {
      status: "active",
    };
  };

  const getProductParams = () => {
    const params = {};

    if (productsMode === "branch" && effectiveBranchId) {
      params.branch_id = effectiveBranchId;
    }

    if (categoryFilter !== ALL_CATEGORIES_VALUE) {
      params.category_id = categoryFilter;
    }

    if (statusFilter === "all") {
      params.include_inactive = true;
    } else if (statusFilter === "inactive") {
      params.include_inactive = true;
      params.status = "inactive";
    } else {
      params.status = "active";
    }

    return params;
  };

  const getComponentParams = () => {
    if (productsMode === "branch" && effectiveBranchId) {
      return { branch_id: effectiveBranchId };
    }
    return {};
  };

  const refreshGroups = async () => {
    const response = await getModifierGroups(restaurantId, getModifierParams());
    const rows = Array.isArray(response?.data) ? response.data : [];
    setGroups(rows);
    return rows;
  };

  const refreshCategories = async () => {
    const rows = await getCategories(restaurantId, getCategoryParams());
    const safeRows = Array.isArray(rows) ? rows : [];
    setCategories(safeRows);

    const exists =
      categoryFilter === ALL_CATEGORIES_VALUE ||
      safeRows.some((c) => String(c.id) === String(categoryFilter));

    if (!exists) {
      setCategoryFilter(ALL_CATEGORIES_VALUE);
    }

    return safeRows;
  };

  const refreshProducts = async () => {
    const rows = await getCatalogProducts(restaurantId, getProductParams());
    const safeRows = Array.isArray(rows) ? rows : [];
    setProducts(safeRows);

    const compositeOnly = safeRows.filter((p) => p?.product_type === "composite");

    if (!compositeOnly.length) {
      setSelectedProductId("");
      return [];
    }

    const exists = compositeOnly.some(
      (p) => String(p.id) === String(selectedProductId)
    );

    if (!exists) {
      setSelectedProductId(String(compositeOnly[0].id));
    }

    return compositeOnly;
  };

  const refreshComponents = async (productIdOverride = null) => {
    const targetProductId = productIdOverride || selectedProductId;

    if (!targetProductId) {
      setComponents([]);
      setSelectedComponentId("");
      return [];
    }

    const rows = await getProductComponentsCatalog(
      restaurantId,
      targetProductId,
      getComponentParams()
    );

    const safeRows = Array.isArray(rows) ? rows : [];
    setComponents(safeRows);

    if (!safeRows.length) {
      setSelectedComponentId("");
      return [];
    }

    const exists = safeRows.some(
      (row) =>
        String(row?.component_product_id) === String(selectedComponentId)
    );

    if (!exists) {
      setSelectedComponentId(String(safeRows[0]?.component_product_id || ""));
    }

    return safeRows;
  };

  const refreshAssignments = async (productIdOverride = null) => {
    const targetProductId = productIdOverride || selectedProductId;

    if (!targetProductId) {
      setAssignments([]);
      return [];
    }

    const response = await getCompositeComponentModifierGroups(
      restaurantId,
      targetProductId,
      {
        ...getModifierParams(),
        ...getComponentParams(),
      }
    );

    const rows = Array.isArray(response?.data) ? response.data : [];
    setAssignments(rows);
    return rows;
  };

  const loadAll = async () => {
    setLoading(true);

    try {
      const st = await getRestaurantSettings(restaurantId);
      setSettings(st);

      let selectedBranch = null;
      let loadedBranches = [];

      if (st?.modifiers_mode === "branch") {
        loadedBranches = await getBranchesByRestaurant(restaurantId);
        loadedBranches = Array.isArray(loadedBranches) ? loadedBranches : [];
        setBranches(loadedBranches);

        selectedBranch = branchId
          ? Number(branchId)
          : loadedBranches?.[0]?.id
            ? Number(loadedBranches[0].id)
            : null;

        if (!branchId && selectedBranch) {
          setBranchId(String(selectedBranch));
        }
      } else {
        setBranches([]);
        setBranchId("");
      }

      const categoryParams =
        st?.products_mode === "branch" && selectedBranch
          ? { status: "active", branch_id: selectedBranch }
          : { status: "active" };

      const modifierParams =
        st?.modifiers_mode === "branch" && selectedBranch
          ? { branch_id: selectedBranch }
          : {};

      const productParams = {
        ...(st?.products_mode === "branch" && selectedBranch
          ? { branch_id: selectedBranch }
          : {}),
        status: "active",
      };

      const [groupResponse, loadedCategories, loadedProducts] = await Promise.all(
        [
          getModifierGroups(restaurantId, modifierParams),
          getCategories(restaurantId, categoryParams),
          getCatalogProducts(restaurantId, productParams),
        ]
      );

      const safeGroups = Array.isArray(groupResponse?.data)
        ? groupResponse.data
        : [];
      const safeCategories = Array.isArray(loadedCategories)
        ? loadedCategories
        : [];
      const safeProducts = Array.isArray(loadedProducts) ? loadedProducts : [];
      const compositeOnly = safeProducts.filter((p) => p?.product_type === "composite");

      setGroups(safeGroups);
      setCategories(safeCategories);
      setProducts(safeProducts);
      setCategoryFilter(ALL_CATEGORIES_VALUE);
      setStatusFilter("active");

      const initialProductId = compositeOnly?.[0]?.id
        ? String(compositeOnly[0].id)
        : "";

      setSelectedProductId(initialProductId);

      if (initialProductId) {
        const componentRows = await getProductComponentsCatalog(
          restaurantId,
          initialProductId,
          st?.products_mode === "branch" && selectedBranch
            ? { branch_id: selectedBranch }
            : {}
        );

        const safeComponentRows = Array.isArray(componentRows) ? componentRows : [];
        setComponents(safeComponentRows);

        const initialComponentId = safeComponentRows?.[0]?.component_product_id
          ? String(safeComponentRows[0].component_product_id)
          : "";

        setSelectedComponentId(initialComponentId);

        const assignmentResponse = await getCompositeComponentModifierGroups(
          restaurantId,
          initialProductId,
          {
            ...(st?.modifiers_mode === "branch" && selectedBranch
              ? { branch_id: selectedBranch }
              : {}),
            ...(st?.products_mode === "branch" && selectedBranch
              ? { branch_id: selectedBranch }
              : {}),
          }
        );

        setAssignments(
          Array.isArray(assignmentResponse?.data) ? assignmentResponse.data : []
        );
      } else {
        setComponents([]);
        setSelectedComponentId("");
        setAssignments([]);
      }
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo cargar el catálogo de modificadores por componente",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  useEffect(() => {
    if (!settings) return;

    if (requiresBranch && !effectiveBranchId) {
      setCategories([]);
      setProducts([]);
      setSelectedProductId("");
      setComponents([]);
      setSelectedComponentId("");
      setAssignments([]);
      return;
    }

    (async () => {
      try {
        await refreshGroups();
        await refreshCategories();

        const refreshedProducts = await refreshProducts();

        if (!refreshedProducts.length) {
          setComponents([]);
          setSelectedComponentId("");
          setAssignments([]);
          return;
        }

        const targetProductId = refreshedProducts.some(
          (p) => String(p.id) === String(selectedProductId)
        )
          ? selectedProductId
          : String(refreshedProducts[0].id);

        await refreshComponents(targetProductId);
        await refreshAssignments(targetProductId);
      } catch (e) {
        showAlert({
          severity: "error",
          title: "Error",
          message:
            e?.response?.data?.message ||
            "No se pudo actualizar la información del catálogo",
        });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveBranchId]);

  useEffect(() => {
    if (!settings) return;
    if (requiresBranch && !effectiveBranchId) return;

    (async () => {
      try {
        const refreshedProducts = await refreshProducts();

        if (!refreshedProducts.length) {
          setComponents([]);
          setSelectedComponentId("");
          setAssignments([]);
          return;
        }

        const targetProductId = refreshedProducts.some(
          (p) => String(p.id) === String(selectedProductId)
        )
          ? selectedProductId
          : String(refreshedProducts[0].id);

        await refreshComponents(targetProductId);
        await refreshAssignments(targetProductId);
      } catch (e) {
        showAlert({
          severity: "error",
          title: "Error",
          message:
            e?.response?.data?.message ||
            "No se pudieron actualizar los filtros",
        });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, statusFilter]);

  useEffect(() => {
    if (!selectedProductId) {
      setComponents([]);
      setSelectedComponentId("");
      setAssignments([]);
      return;
    }

    (async () => {
      try {
        await refreshComponents(selectedProductId);
        await refreshAssignments(selectedProductId);
      } catch (e) {
        showAlert({
          severity: "error",
          title: "Error",
          message:
            e?.response?.data?.message ||
            "No se pudieron cargar los componentes del producto",
        });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProductId]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setModalOpen(true);
  };

  const onToggleStatus = async (row) => {
    const assignmentId = row?.id;
    if (!assignmentId || !selectedProduct?.id || isSaving(assignmentId)) return;

    setSaving(assignmentId, true);

    try {
      const payload = {
        component_product_id: row.component_product_id,
        modifier_group_id: row.modifier_group_id,
        sort_order: Number(row.sort_order ?? 0),
        is_active: !row.is_active,
      };

      if (requiresBranch) {
        payload.branch_id = effectiveBranchId;
      }

      await updateCompositeComponentModifierGroup(
        restaurantId,
        selectedProduct.id,
        assignmentId,
        payload
      );

      await refreshAssignments(selectedProduct.id);
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo actualizar el estado de la asignación",
      });
    } finally {
      setSaving(assignmentId, false);
    }
  };

  const onDelete = async (row) => {
    if (!selectedProduct?.id) return;

    const ok = window.confirm("¿Eliminar esta asignación?");
    if (!ok) return;

    try {
      await deleteCompositeComponentModifierGroup(
        restaurantId,
        selectedProduct.id,
        row.id,
        {
          ...getModifierParams(),
          ...getComponentParams(),
        }
      );

      await refreshAssignments(selectedProduct.id);

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Asignación eliminada correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo eliminar la asignación",
      });
    }
  };

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
              Cargando catálogo por componente…
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
              Catálogo de modificadores por componente
            </Typography>

            <Typography
              sx={{
                mt: 1,
                color: "text.secondary",
                fontSize: { xs: 14, md: 17 },
              }}
            >
              Define qué grupos de modificadores estarán disponibles en cada componente dentro de un producto compuesto.
            </Typography>
          </Box>

          <Button
            onClick={() =>
              nav(`/owner/restaurants/${restaurantId}/operation/modifiers`)
            }
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            sx={{
              minWidth: { xs: "100%", sm: 210 },
              height: 44,
              borderRadius: 2,
              fontWeight: 800,
            }}
          >
            Regresar
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
          <Stack spacing={1.25}>
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
              step="1"
              text="Selecciona la sucursal si tu restaurante maneja productos o modificadores por sucursal."
            />

            <InstructionRow
              step="2"
              text="Elige un producto compuesto, luego selecciona uno de sus componentes."
            />

            <InstructionRow
              step="3"
              text="Administra los grupos que estarán disponibles solo para ese componente."
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
              <Typography sx={fieldLabelSx}>Sucursal</Typography>

              <TextField
                select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                SelectProps={{
                  IconComponent: KeyboardArrowDownIcon,
                }}
              >
                {branches.map((b) => (
                  <MenuItem key={b.id} value={String(b.id)}>
                    {b.name || `Sucursal ${b.id}`}
                  </MenuItem>
                ))}
              </TextField>

              <Typography
                sx={{
                  fontSize: 12,
                  color: "text.secondary",
                }}
              >
                Los cambios se aplicarán solo en la sucursal seleccionada.
              </Typography>
            </Stack>
          </Paper>
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
                  categories={categoryTabs}
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                />

                <Typography
                  sx={{
                    mt: 1,
                    fontSize: 12,
                    color: "text.secondary",
                  }}
                >
                  Filtra los productos compuestos por categoría para encontrarlos más rápido.
                </Typography>
              </Box>

              <Box sx={{ width: { xs: "100%", md: 240 } }}>
                <Typography sx={fieldLabelSx}>Mostrar</Typography>

                <TextField
                  select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
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
            <Typography sx={fieldLabelSx}>Producto compuesto</Typography>

            <TextField
              select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              SelectProps={{
                IconComponent: KeyboardArrowDownIcon,
              }}
              disabled={!compositeProducts.length}
            >
              {groupedProducts.length === 0 ? (
                <MenuItem disabled value="">
                  No hay productos compuestos disponibles
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
              {compositeProducts.length
                ? `Mostrando ${compositeProducts.length} producto${compositeProducts.length === 1 ? "" : "s"} compuesto${compositeProducts.length === 1 ? "" : "s"} según tus filtros.`
                : "No hay productos compuestos disponibles para este contexto."}
            </Typography>
          </Stack>
        </Paper>

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
            <Typography sx={fieldLabelSx}>Componente</Typography>

            <TextField
              select
              value={selectedComponentId}
              onChange={(e) => setSelectedComponentId(e.target.value)}
              SelectProps={{
                IconComponent: KeyboardArrowDownIcon,
              }}
              disabled={!components.length}
            >
              {components.length === 0 ? (
                <MenuItem disabled value="">
                  No hay componentes disponibles
                </MenuItem>
              ) : (
                components.map((row) => (
                  <MenuItem
                    key={row?.component_product_id}
                    value={String(row?.component_product_id)}
                  >
                    {row?.component_product?.name || "Componente sin nombre"}
                  </MenuItem>
                ))
              )}
            </TextField>

            <Typography
              sx={{
                fontSize: 12,
                color: "text.secondary",
              }}
            >
              {components.length
                ? `Este producto compuesto tiene ${components.length} componente${components.length === 1 ? "" : "s"} disponibles.`
                : "El producto seleccionado no tiene componentes registrados en este contexto."}
            </Typography>
          </Stack>
        </Paper>

        {selectedProduct ? (
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
                  Selección actual
                </Typography>

                <Typography
                  sx={{
                    fontSize: { xs: 22, sm: 28 },
                    fontWeight: 800,
                    color: "text.primary",
                    lineHeight: 1.15,
                  }}
                >
                  {selectedProduct.name}
                </Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip
                    label={
                      selectedProduct.status === "active" ? "Activo" : "Inactivo"
                    }
                    size="small"
                    sx={{ fontWeight: 800 }}
                  />

                  {selectedProduct.category?.name ? (
                    <Chip
                      label={selectedProduct.category.name}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        bgcolor: "#FFF3E0",
                        color: "#A75A00",
                      }}
                    />
                  ) : null}

                  {selectedComponent ? (
                    <Chip
                      label={`Componente: ${selectedComponent.name}`}
                      size="small"
                      color="secondary"
                      sx={{ fontWeight: 800 }}
                    />
                  ) : null}
                </Stack>
              </Stack>
            </Box>
          </Card>
        ) : null}

        <Paper
          sx={{
            p: 0,
            overflow: "hidden",
            borderRadius: 0,
            backgroundColor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "none",
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1.75,
              borderBottom: "1px solid",
              borderColor: "divider",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              Grupos asignados al componente
            </Typography>

            <Button
              onClick={openCreate}
              variant="contained"
              startIcon={<AddIcon />}
              disabled={!selectedProduct || !selectedComponent || availableGroups.length === 0}
              sx={{
                minWidth: { xs: "100%", sm: 170 },
                height: 42,
                borderRadius: 2,
                fontWeight: 800,
              }}
            >
              Asignar grupo
            </Button>
          </Box>

          {!selectedProduct ? (
            <Box sx={{ px: 3, py: 5, textAlign: "center" }}>
              <Typography
                sx={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "text.primary",
                }}
              >
                Selecciona un producto compuesto
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  color: "text.secondary",
                  fontSize: 14,
                }}
              >
                Primero elige un producto compuesto para administrar sus componentes.
              </Typography>
            </Box>
          ) : !selectedComponent ? (
            <Box sx={{ px: 3, py: 5, textAlign: "center" }}>
              <Typography
                sx={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "text.primary",
                }}
              >
                Selecciona un componente
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  color: "text.secondary",
                  fontSize: 14,
                }}
              >
                Elige el componente al que quieres asignarle grupos de modificadores.
              </Typography>
            </Box>
          ) : filteredAssignments.length === 0 ? (
            <Box sx={{ px: 3, py: 5, textAlign: "center" }}>
              <Typography
                sx={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "text.primary",
                }}
              >
                No hay grupos asignados
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  color: "text.secondary",
                  fontSize: 14,
                }}
              >
                Asigna tu primer grupo de modificadores a este componente.
              </Typography>

              <Button
                onClick={openCreate}
                variant="contained"
                startIcon={<AddIcon />}
                disabled={availableGroups.length === 0}
                sx={{
                  mt: 2.5,
                  minWidth: 220,
                  height: 44,
                  borderRadius: 2,
                  fontWeight: 800,
                }}
              >
                Asignar grupo
              </Button>
            </Box>
          ) : (
            <>
              {isMobile ? (
                <Stack spacing={1.5} sx={{ p: 2 }}>
                  {paginatedItems.map((row) => {
                    const active = !!row.is_active;
                    const busy = isSaving(row.id);
                    const group = row.modifier_group || row.modifierGroup || {};
                    const optionsCount = Array.isArray(group?.options)
                      ? group.options.length
                      : 0;

                    return (
                      <Card
                        key={row.id}
                        sx={{
                          borderRadius: 1,
                          boxShadow: "none",
                          border: "1px solid",
                          borderColor: "divider",
                          backgroundColor: "#fff",
                        }}
                      >
                        <Box sx={{ p: 2 }}>
                          <Stack spacing={1.5}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="flex-start"
                              spacing={1}
                            >
                              <Box sx={{ minWidth: 0 }}>
                                <Typography
                                  sx={{
                                    fontSize: 15,
                                    fontWeight: 800,
                                    color: "text.primary",
                                    lineHeight: 1.3,
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {group?.name || "Grupo sin nombre"}
                                </Typography>

                                {group?.description ? (
                                  <Typography
                                    sx={{
                                      mt: 0.5,
                                      fontSize: 13,
                                      color: "text.secondary",
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    {group.description}
                                  </Typography>
                                ) : null}
                              </Box>

                              <Chip
                                label={`Orden ${row.sort_order ?? 0}`}
                                size="small"
                                sx={{
                                  fontWeight: 800,
                                  bgcolor: "#FFF3E0",
                                  color: "#A75A00",
                                }}
                              />
                            </Stack>

                            <Stack direction="row" spacing={1} flexWrap="wrap">
                              <Chip
                                label={`${optionsCount} opción${optionsCount === 1 ? "" : "es"}`}
                                size="small"
                              />
                              <Chip
                                label={getAppliesToLabel(group?.applies_to)}
                                size="small"
                              />
                            </Stack>

                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 1,
                                flexWrap: "wrap",
                              }}
                            >
                              <FormControlLabel
                                sx={{ m: 0 }}
                                control={
                                  <Switch
                                    checked={active}
                                    onChange={() => onToggleStatus(row)}
                                    disabled={busy}
                                    color="primary"
                                  />
                                }
                                label={
                                  <Typography sx={switchLabelSx}>
                                    {active ? "Activo" : "Inactivo"}
                                  </Typography>
                                }
                              />

                              <Stack direction="row" spacing={1}>
                                <Tooltip title="Editar">
                                  <IconButton
                                    onClick={() => openEdit(row)}
                                    sx={iconEditSx}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>

                                <Tooltip title="Eliminar">
                                  <IconButton
                                    onClick={() => onDelete(row)}
                                    sx={iconDeleteSx}
                                  >
                                    <DeleteOutlineIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </Box>
                          </Stack>
                        </Box>
                      </Card>
                    );
                  })}
                </Stack>
              ) : (
                <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
                  <Table sx={{ minWidth: 1080 }}>
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
                        <TableCell>Grupo</TableCell>
                        <TableCell>Descripción</TableCell>
                        <TableCell>Aplica para</TableCell>
                        <TableCell>Opciones</TableCell>
                        <TableCell>Orden</TableCell>
                        <TableCell align="center">Estado</TableCell>
                        <TableCell align="right">Acciones</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {paginatedItems.map((row) => {
                        const active = !!row.is_active;
                        const busy = isSaving(row.id);
                        const group = row.modifier_group || row.modifierGroup || {};
                        const optionsCount = Array.isArray(group?.options)
                          ? group.options.length
                          : 0;

                        return (
                          <TableRow
                            key={row.id}
                            hover
                            sx={{
                              "& td": {
                                borderBottom: "1px solid",
                                borderColor: "divider",
                                fontSize: 14,
                                color: "text.primary",
                                whiteSpace: "nowrap",
                              },
                            }}
                          >
                            <TableCell>
                              <Typography sx={{ fontWeight: 800 }}>
                                {group?.name || "Grupo sin nombre"}
                              </Typography>
                            </TableCell>

                            <TableCell
                              sx={{
                                whiteSpace: "normal !important",
                                minWidth: 260,
                              }}
                            >
                              {group?.description || "—"}
                            </TableCell>

                            <TableCell>
                              {getAppliesToLabel(group?.applies_to)}
                            </TableCell>

                            <TableCell>{optionsCount}</TableCell>

                            <TableCell>{row.sort_order ?? 0}</TableCell>

                            <TableCell align="center">
                              <FormControlLabel
                                sx={{ m: 0 }}
                                control={
                                  <Switch
                                    checked={active}
                                    onChange={() => onToggleStatus(row)}
                                    disabled={busy}
                                    color="primary"
                                  />
                                }
                                label={
                                  <Typography sx={switchLabelSx}>
                                    {active ? "Activo" : "Inactivo"}
                                  </Typography>
                                }
                              />
                            </TableCell>

                            <TableCell align="right">
                              <Stack
                                direction="row"
                                spacing={1}
                                justifyContent="flex-end"
                                alignItems="center"
                                flexWrap="nowrap"
                              >
                                <Tooltip title="Editar">
                                  <IconButton
                                    onClick={() => openEdit(row)}
                                    sx={iconEditSx}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>

                                <Tooltip title="Eliminar">
                                  <IconButton
                                    onClick={() => onDelete(row)}
                                    sx={iconDeleteSx}
                                  >
                                    <DeleteOutlineIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

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
                itemLabel="asignaciones"
              />
            </>
          )}
        </Paper>
      </Stack>

      <CompositeComponentModifierGroupUpsertModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        restaurantId={restaurantId}
        product={selectedProduct}
        component={selectedComponent}
        requiresBranch={requiresBranch}
        effectiveBranchId={effectiveBranchId}
        availableGroups={availableGroups}
        availableComponents={components}
        editing={editing}
        onSaved={async () => {
          setModalOpen(false);
          setEditing(null);
          if (selectedProduct?.id) {
            await refreshAssignments(selectedProduct.id);
          }
        }}
        api={{
          createCompositeComponentModifierGroup,
          updateCompositeComponentModifierGroup,
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

function InstructionRow({ step, text }) {
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
          fontSize: 13,
          fontWeight: 800,
        }}
      >
        {step}
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

function getAppliesToLabel(value) {
  switch (value) {
    case "product":
      return "Producto";
    case "variant":
      return "Variante";
    case "component":
      return "Componente";
    case "any":
      return "Cualquiera";
    default:
      return "Producto";
  }
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
