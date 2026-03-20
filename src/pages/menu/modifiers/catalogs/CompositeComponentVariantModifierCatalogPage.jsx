import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Box, Button, CircularProgress, Stack, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import PageContainer from "../../../../components/common/PageContainer";
import AppAlert from "../../../../components/common/AppAlert";
import usePagination from "../../../../hooks/usePagination";

import { getRestaurantSettings } from "../../../../services/restaurant/restaurantSettings.service";
import { getBranchesByRestaurant } from "../../../../services/restaurant/branch.service";
import { getCategories } from "../../../../services/menu/categories.service";
import { getModifierGroups } from "../../../../services/menu/modifiers/modifierGroups.service";
import {
  getCatalogProducts,
  getProductComponentsCatalog,
  getComponentProductVariants,
  getCompositeComponentVariantModifierGroups,
  createCompositeComponentVariantModifierGroup,
  updateCompositeComponentVariantModifierGroup,
  deleteCompositeComponentVariantModifierGroup,
} from "../../../../services/menu/modifiers/compositeComponentVariantModifierGroups.service";

import CompositeComponentVariantModifierGroupUpsertModal from "../../../../components/menu/modifiers/catalogs/CompositeComponentVariantModifierGroupUpsertModal";

import ModifierCatalogInstructionsCard from "../../../../components/menu/modifiers/catalogs/shared/ModifierCatalogInstructionsCard";
import ModifierCatalogBranchSelector from "../../../../components/menu/modifiers/catalogs/shared/ModifierCatalogBranchSelector";
import ProductCatalogFilterPanel from "../../../../components/menu/modifiers/catalogs/shared/ProductCatalogFilterPanel";
import ProductSelectorPanel from "../../../../components/menu/modifiers/catalogs/shared/ProductSelectorPanel";
import ProductSelectionSummaryCard from "../../../../components/menu/modifiers/catalogs/shared/ProductSelectionSummaryCard";
import ComponentSelectorPanel from "../../../../components/menu/modifiers/catalogs/shared/ComponentSelectorPanel";
import VariantSelectorPanel from "../../../../components/menu/modifiers/catalogs/shared/VariantSelectorPanel";
import ModifierAssignmentsPanel from "../../../../components/menu/modifiers/catalogs/shared/ModifierAssignmentsPanel";

import {
  ALL_CATEGORIES_VALUE,
  PAGE_SIZE,
  getBranchHelpText,
  groupProductsByCategory,
} from "../../../../components/menu/modifiers/catalogs/shared/catalogShared";

export default function CompositeComponentVariantModifierCatalogPage() {
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

  const modifiersAreByBranch = modifiersMode === "branch";
  const productsAreByBranch = productsMode === "branch";
  const needsBranchSelector = productsAreByBranch || modifiersAreByBranch;

  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");

  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES_VALUE);
  const [statusFilter, setStatusFilter] = useState("active");

  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");

  const [components, setComponents] = useState([]);
  const [selectedComponentId, setSelectedComponentId] = useState("");

  const [variants, setVariants] = useState([]);
  const [selectedVariantId, setSelectedVariantId] = useState("");

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
    if (!needsBranchSelector) return null;
    return branchId ? Number(branchId) : null;
  }, [needsBranchSelector, branchId]);

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

  const variantAllowedComponents = useMemo(() => {
    return (Array.isArray(components) ? components : []).filter(
      (row) => !!row?.allow_variant
    );
  }, [components]);

  const selectedComponentRow = useMemo(() => {
    return (
      variantAllowedComponents.find(
        (row) => String(row?.component_product_id) === String(selectedComponentId)
      ) || null
    );
  }, [variantAllowedComponents, selectedComponentId]);

  const selectedComponent = selectedComponentRow?.component_product || null;

  const selectedVariantRow = useMemo(() => {
    return (
      variants.find((row) => String(row?.variant?.id) === String(selectedVariantId)) ||
      null
    );
  }, [variants, selectedVariantId]);

  const selectedVariant = selectedVariantRow?.variant || null;

  const availableGroups = useMemo(() => {
    return (Array.isArray(groups) ? groups : []).filter((group) =>
      ["variant", "any"].includes(group?.applies_to)
    );
  }, [groups]);

  const groupedProducts = useMemo(() => {
    return groupProductsByCategory(compositeProducts);
  }, [compositeProducts]);

  const filteredAssignments = useMemo(() => {
    let rows = [...assignments];

    if (selectedComponentId) {
      rows = rows.filter(
        (row) => String(row?.component_product_id) === String(selectedComponentId)
      );
    }

    if (selectedVariantId) {
      rows = rows.filter(
        (row) => String(row?.component_variant_id) === String(selectedVariantId)
      );
    }

    return rows.sort((a, b) => {
      const byOrder = Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0);
      if (byOrder !== 0) return byOrder;

      const aName = a?.modifier_group?.name || a?.modifierGroup?.name || "";
      const bName = b?.modifier_group?.name || b?.modifierGroup?.name || "";

      return aName.localeCompare(bName, "es", { sensitivity: "base" });
    });
  }, [assignments, selectedComponentId, selectedVariantId]);

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
    if (!modifiersAreByBranch || !effectiveBranchId) return {};
    return { branch_id: effectiveBranchId };
  };

  const getCategoryParams = () => {
    const params = {
      status: "active",
    };

    if (productsAreByBranch && effectiveBranchId) {
      params.branch_id = effectiveBranchId;
    }

    return params;
  };

  const getProductParams = () => {
    const params = {};

    if (productsAreByBranch && effectiveBranchId) {
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
    if (productsAreByBranch && effectiveBranchId) {
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
    const onlyAllowed = safeRows.filter((row) => !!row?.allow_variant);

    setComponents(onlyAllowed);

    if (!onlyAllowed.length) {
      setSelectedComponentId("");
      return [];
    }

    const exists = onlyAllowed.some(
      (row) => String(row?.component_product_id) === String(selectedComponentId)
    );

    if (!exists) {
      setSelectedComponentId(String(onlyAllowed[0]?.component_product_id || ""));
    }

    return onlyAllowed;
  };

  const refreshVariants = async (componentProductIdOverride = null) => {
    const targetComponentProductId =
      componentProductIdOverride || selectedComponentId;

    if (!targetComponentProductId) {
      setVariants([]);
      setSelectedVariantId("");
      return [];
    }

    const rows = await getComponentProductVariants(
      restaurantId,
      targetComponentProductId
    );

    const safeRows = Array.isArray(rows) ? rows : [];
    setVariants(safeRows);

    if (!safeRows.length) {
      setSelectedVariantId("");
      return [];
    }

    const exists = safeRows.some(
      (row) => String(row?.variant?.id) === String(selectedVariantId)
    );

    if (!exists) {
      setSelectedVariantId(String(safeRows[0]?.variant?.id || ""));
    }

    return safeRows;
  };

  const refreshAssignments = async (productIdOverride = null) => {
    const targetProductId = productIdOverride || selectedProductId;

    if (!targetProductId) {
      setAssignments([]);
      return [];
    }

    const response = await getCompositeComponentVariantModifierGroups(
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

      if (st?.products_mode === "branch" || st?.modifiers_mode === "branch") {
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

      const categoryParams = {
        status: "active",
        ...(st?.products_mode === "branch" && selectedBranch
          ? { branch_id: selectedBranch }
          : {}),
      };

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
        const variantAllowed = safeComponentRows.filter((row) => !!row?.allow_variant);
        setComponents(variantAllowed);

        const initialComponentId = variantAllowed?.[0]?.component_product_id
          ? String(variantAllowed[0].component_product_id)
          : "";

        setSelectedComponentId(initialComponentId);

        if (initialComponentId) {
          const variantRows = await getComponentProductVariants(
            restaurantId,
            initialComponentId
          );

          const safeVariantRows = Array.isArray(variantRows) ? variantRows : [];
          setVariants(safeVariantRows);

          const initialVariantId = safeVariantRows?.[0]?.variant?.id
            ? String(safeVariantRows[0].variant.id)
            : "";

          setSelectedVariantId(initialVariantId);
        } else {
          setVariants([]);
          setSelectedVariantId("");
        }

        const assignmentResponse = await getCompositeComponentVariantModifierGroups(
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
        setVariants([]);
        setSelectedVariantId("");
        setAssignments([]);
      }
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo cargar el catálogo de modificadores por variante de componente",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [restaurantId]);

  useEffect(() => {
    if (!settings) return;

    if (needsBranchSelector && !effectiveBranchId) {
      setCategories([]);
      setProducts([]);
      setSelectedProductId("");
      setComponents([]);
      setSelectedComponentId("");
      setVariants([]);
      setSelectedVariantId("");
      setAssignments([]);
      if (modifiersAreByBranch) {
        setGroups([]);
      }
      return;
    }

    (async () => {
      try {
        if (modifiersAreByBranch || !groups.length) {
          await refreshGroups();
        }

        await refreshCategories();

        const refreshedProducts = await refreshProducts();

        if (!refreshedProducts.length) {
          setComponents([]);
          setSelectedComponentId("");
          setVariants([]);
          setSelectedVariantId("");
          setAssignments([]);
          return;
        }

        const targetProductId = refreshedProducts.some(
          (p) => String(p.id) === String(selectedProductId)
        )
          ? selectedProductId
          : String(refreshedProducts[0].id);

        const componentRows = await refreshComponents(targetProductId);

        if (componentRows.length) {
          const targetComponentId = componentRows.some(
            (row) => String(row?.component_product_id) === String(selectedComponentId)
          )
            ? selectedComponentId
            : String(componentRows[0]?.component_product_id || "");

          await refreshVariants(targetComponentId);
        } else {
          setVariants([]);
          setSelectedVariantId("");
        }

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
  }, [effectiveBranchId]);

  useEffect(() => {
    if (!settings) return;
    if (needsBranchSelector && !effectiveBranchId) return;

    (async () => {
      try {
        await refreshCategories();

        const refreshedProducts = await refreshProducts();

        if (!refreshedProducts.length) {
          setComponents([]);
          setSelectedComponentId("");
          setVariants([]);
          setSelectedVariantId("");
          setAssignments([]);
          return;
        }

        const targetProductId = refreshedProducts.some(
          (p) => String(p.id) === String(selectedProductId)
        )
          ? selectedProductId
          : String(refreshedProducts[0].id);

        const componentRows = await refreshComponents(targetProductId);

        if (componentRows.length) {
          const targetComponentId = componentRows.some(
            (row) => String(row?.component_product_id) === String(selectedComponentId)
          )
            ? selectedComponentId
            : String(componentRows[0]?.component_product_id || "");

          await refreshVariants(targetComponentId);
        } else {
          setVariants([]);
          setSelectedVariantId("");
        }

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
  }, [categoryFilter, statusFilter]);

  useEffect(() => {
    if (!selectedProductId) {
      setComponents([]);
      setSelectedComponentId("");
      setVariants([]);
      setSelectedVariantId("");
      setAssignments([]);
      return;
    }

    (async () => {
      try {
        const componentRows = await refreshComponents(selectedProductId);

        if (componentRows.length) {
          const targetComponentId = componentRows.some(
            (row) => String(row?.component_product_id) === String(selectedComponentId)
          )
            ? selectedComponentId
            : String(componentRows[0]?.component_product_id || "");

          await refreshVariants(targetComponentId);
        } else {
          setVariants([]);
          setSelectedVariantId("");
        }

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
  }, [selectedProductId]);

  useEffect(() => {
    if (!selectedComponentId) {
      setVariants([]);
      setSelectedVariantId("");
      return;
    }

    (async () => {
      try {
        await refreshVariants(selectedComponentId);
      } catch (e) {
        showAlert({
          severity: "error",
          title: "Error",
          message:
            e?.response?.data?.message ||
            "No se pudieron cargar las variantes del componente",
        });
      }
    })();
  }, [selectedComponentId]);

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
        component_variant_id: row.component_variant_id,
        modifier_group_id: row.modifier_group_id,
        sort_order: Number(row.sort_order ?? 0),
        is_active: !row.is_active,
      };

      if (modifiersAreByBranch) {
        payload.branch_id = effectiveBranchId;
      }

      await updateCompositeComponentVariantModifierGroup(
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
      await deleteCompositeComponentVariantModifierGroup(
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
              Cargando catálogo por variante de componente…
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
              Catálogo de modificadores por variante de componente
            </Typography>

            <Typography
              sx={{
                mt: 1,
                color: "text.secondary",
                fontSize: { xs: 14, md: 17 },
              }}
            >
              Define qué grupos de modificadores estarán disponibles en una variante específica de cada componente.
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

        <ModifierCatalogInstructionsCard
          steps={[
            needsBranchSelector
              ? "Selecciona la sucursal si este escenario trabaja productos o modificadores por sucursal."
              : "Este escenario trabaja todo de forma global, así que no necesitas seleccionar sucursal.",
            "Elige un producto compuesto, luego un componente que permita variantes y después una variante específica.",
            "Administra los grupos que estarán disponibles solo para esa variante del componente.",
          ]}
        />

        <ModifierCatalogBranchSelector
          visible={needsBranchSelector}
          branches={branches}
          branchId={branchId}
          onChange={setBranchId}
          helpText={getBranchHelpText({
            productsAreByBranch,
            modifiersAreByBranch,
          })}
        />

        <ProductCatalogFilterPanel
          categories={categoryTabs}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />

        <ProductSelectorPanel
          groupedProducts={groupedProducts}
          products={compositeProducts}
          selectedProductId={selectedProductId}
          onChange={setSelectedProductId}
        />

        <ComponentSelectorPanel
          label="Componente"
          items={variantAllowedComponents}
          selectedValue={selectedComponentId}
          onChange={setSelectedComponentId}
          disabled={!variantAllowedComponents.length}
          getItemValue={(item) => item?.component_product_id}
          getItemLabel={(item) =>
            item?.component_product?.name || "Componente sin nombre"
          }
          emptyText="No hay componentes con variantes disponibles"
          helperText={
            variantAllowedComponents.length
              ? `Este producto compuesto tiene ${variantAllowedComponents.length} componente${variantAllowedComponents.length === 1 ? "" : "s"} con variantes disponibles.`
              : "El producto seleccionado no tiene componentes con variantes disponibles en este contexto."
          }
        />

        <VariantSelectorPanel
          label="Variante del componente"
          items={variants}
          selectedValue={selectedVariantId}
          onChange={setSelectedVariantId}
          disabled={!variants.length}
          getItemValue={(item) => item?.variant?.id}
          getItemLabel={(item) => item?.variant?.name || "Variante sin nombre"}
          emptyText="No hay variantes disponibles"
          helperText={
            variants.length
              ? `Este componente tiene ${variants.length} variante${variants.length === 1 ? "" : "s"} disponibles.`
              : "No hay variantes disponibles para el componente seleccionado."
          }
        />

        <ProductSelectionSummaryCard
          product={selectedProduct}
          productsAreByBranch={productsAreByBranch}
          title="Selección actual"
          extraChips={[
            ...(selectedComponent
              ? [
                  {
                    label: `Componente: ${selectedComponent.name}`,
                    color: "secondary",
                  },
                ]
              : []),
            ...(selectedVariant
              ? [
                  {
                    label: `Variante: ${selectedVariant.name}`,
                    sx: {
                      bgcolor: "#EEF2FF",
                      color: "#3F3A52",
                    },
                  },
                ]
              : []),
          ]}
        />

        <ModifierAssignmentsPanel
          isMobile={isMobile}
          title="Grupos asignados a la variante del componente"
          addButtonText="Asignar grupo"
          emptyTitle="No hay grupos asignados"
          emptyMessage="Asigna tu primer grupo de modificadores a esta variante del componente."
          missingSelectionTitle={
            !selectedProduct
              ? "Selecciona un producto compuesto"
              : !selectedComponent
                ? "Selecciona un componente"
                : "Selecciona una variante"
          }
          missingSelectionMessage={
            !selectedProduct
              ? "Primero elige un producto compuesto para administrar sus componentes."
              : !selectedComponent
                ? "Elige un componente que permita variantes."
                : "Elige la variante del componente a la que quieres asignarle grupos."
          }
          canAssign={
            !!selectedProduct &&
            !!selectedComponent &&
            !!selectedVariant &&
            availableGroups.length > 0
          }
          hasSelection={!!selectedProduct && !!selectedComponent && !!selectedVariant}
          rows={filteredAssignments}
          paginatedItems={paginatedItems}
          page={page}
          totalPages={totalPages}
          startItem={startItem}
          endItem={endItem}
          total={total}
          hasPrev={hasPrev}
          hasNext={hasNext}
          onPrev={prevPage}
          onNext={nextPage}
          onCreate={openCreate}
          onEdit={openEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
          isSaving={isSaving}
          itemLabel="asignaciones"
        />
      </Stack>

      <CompositeComponentVariantModifierGroupUpsertModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        restaurantId={restaurantId}
        product={selectedProduct}
        component={selectedComponent}
        variant={selectedVariant}
        requiresBranch={modifiersAreByBranch}
        effectiveBranchId={effectiveBranchId}
        availableGroups={availableGroups}
        availableComponents={variantAllowedComponents}
        availableVariants={variants}
        editing={editing}
        onSaved={async () => {
          setModalOpen(false);
          setEditing(null);
          if (selectedProduct?.id) {
            await refreshAssignments(selectedProduct.id);
          }
        }}
        api={{
          createCompositeComponentVariantModifierGroup,
          updateCompositeComponentVariantModifierGroup,
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
