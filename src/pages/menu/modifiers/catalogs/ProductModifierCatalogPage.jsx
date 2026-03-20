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
  getProductModifierGroups,
  createProductModifierGroup,
  updateProductModifierGroup,
  deleteProductModifierGroup,
} from "../../../../services/menu/modifiers/productModifierGroups.service";

import ProductModifierGroupUpsertModal from "../../../../components/menu/modifiers/catalogs/ProductModifierGroupUpsertModal";

import ModifierCatalogInstructionsCard from "../../../../components/menu/modifiers/catalogs/shared/ModifierCatalogInstructionsCard";
import ModifierCatalogBranchSelector from "../../../../components/menu/modifiers/catalogs/shared/ModifierCatalogBranchSelector";
import ProductCatalogFilterPanel from "../../../../components/menu/modifiers/catalogs/shared/ProductCatalogFilterPanel";
import ProductSelectorPanel from "../../../../components/menu/modifiers/catalogs/shared/ProductSelectorPanel";
import ProductSelectionSummaryCard from "../../../../components/menu/modifiers/catalogs/shared/ProductSelectionSummaryCard";
import ModifierAssignmentsPanel from "../../../../components/menu/modifiers/catalogs/shared/ModifierAssignmentsPanel";

import {
  ALL_CATEGORIES_VALUE,
  PAGE_SIZE,
  getBranchHelpText,
  groupProductsByCategory,
} from "../../../../components/menu/modifiers/catalogs/shared/catalogShared";

export default function ProductModifierCatalogPage() {
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

  const [groups, setGroups] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const showAlert = ({ severity = "error", title = "Error", message = "" }) => {
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

  const selectedProduct = useMemo(() => {
    return (
      products.find((p) => String(p.id) === String(selectedProductId)) || null
    );
  }, [products, selectedProductId]);

  const availableGroups = useMemo(() => {
    return (Array.isArray(groups) ? groups : []).filter((group) =>
      ["product", "any"].includes(group?.applies_to)
    );
  }, [groups]);

  const groupedProducts = useMemo(() => {
    return groupProductsByCategory(products);
  }, [products]);

  const sortedAssignments = useMemo(() => {
    return [...assignments].sort((a, b) => {
      const byOrder = Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0);
      if (byOrder !== 0) return byOrder;

      const aName = a?.modifier_group?.name || a?.modifierGroup?.name || "";
      const bName = b?.modifier_group?.name || b?.modifierGroup?.name || "";

      return aName.localeCompare(bName, "es", { sensitivity: "base" });
    });
  }, [assignments]);

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
    items: sortedAssignments,
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
    const params = { status: "active" };

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

    if (!safeRows.length) {
      setSelectedProductId("");
      return [];
    }

    const exists = safeRows.some(
      (p) => String(p.id) === String(selectedProductId)
    );

    if (!exists) {
      setSelectedProductId(String(safeRows[0].id));
    }

    return safeRows;
  };

  const refreshAssignments = async (productIdOverride = null) => {
    const targetProductId = productIdOverride || selectedProductId;

    if (!targetProductId) {
      setAssignments([]);
      return [];
    }

    const response = await getProductModifierGroups(
      restaurantId,
      targetProductId,
      getModifierParams()
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

      setGroups(safeGroups);
      setCategories(safeCategories);
      setProducts(safeProducts);
      setCategoryFilter(ALL_CATEGORIES_VALUE);
      setStatusFilter("active");

      const initialProductId = safeProducts?.[0]?.id
        ? String(safeProducts[0].id)
        : "";

      setSelectedProductId(initialProductId);

      if (initialProductId) {
        const assignmentResponse = await getProductModifierGroups(
          restaurantId,
          initialProductId,
          modifierParams
        );

        setAssignments(
          Array.isArray(assignmentResponse?.data) ? assignmentResponse.data : []
        );
      } else {
        setAssignments([]);
      }
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo cargar el catálogo de modificadores por producto",
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
          setAssignments([]);
          return;
        }

        const targetProductId = refreshedProducts.some(
          (p) => String(p.id) === String(selectedProductId)
        )
          ? selectedProductId
          : String(refreshedProducts[0].id);

        if (targetProductId) {
          await refreshAssignments(targetProductId);
        }
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
          setAssignments([]);
          return;
        }

        const targetProductId = refreshedProducts.some(
          (p) => String(p.id) === String(selectedProductId)
        )
          ? selectedProductId
          : String(refreshedProducts[0].id);

        if (targetProductId) {
          await refreshAssignments(targetProductId);
        }
      } catch (e) {
        showAlert({
          severity: "error",
          title: "Error",
          message:
            e?.response?.data?.message ||
            "No se pudieron actualizar los productos filtrados",
        });
      }
    })();
  }, [categoryFilter, statusFilter]);

  useEffect(() => {
    if (!selectedProductId) {
      setAssignments([]);
      return;
    }

    (async () => {
      try {
        await refreshAssignments(selectedProductId);
      } catch (e) {
        showAlert({
          severity: "error",
          title: "Error",
          message:
            e?.response?.data?.message ||
            "No se pudieron cargar los grupos asignados al producto",
        });
      }
    })();
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
        modifier_group_id: row.modifier_group_id,
        sort_order: Number(row.sort_order ?? 0),
        is_active: !row.is_active,
      };

      if (modifiersAreByBranch) {
        payload.branch_id = effectiveBranchId;
      }

      await updateProductModifierGroup(
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
      const params = modifiersAreByBranch ? { branch_id: effectiveBranchId } : {};
      await deleteProductModifierGroup(
        restaurantId,
        selectedProduct.id,
        row.id,
        params
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
              Cargando catálogo por producto…
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
              Catálogo de modificadores por producto
            </Typography>

            <Typography
              sx={{
                mt: 1,
                color: "text.secondary",
                fontSize: { xs: 14, md: 17 },
              }}
            >
              Define qué grupos de modificadores estarán disponibles en cada producto.
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
            "Filtra por categoría o por estado para ubicar más fácil el producto que quieres configurar.",
            "Después elige el producto y administra los grupos que tendrá disponibles.",
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
          products={products}
          selectedProductId={selectedProductId}
          onChange={setSelectedProductId}
        />

        <ProductSelectionSummaryCard
          product={selectedProduct}
          productsAreByBranch={productsAreByBranch}
          title="Producto seleccionado"
        />

        <ModifierAssignmentsPanel
          isMobile={isMobile}
          title="Grupos asignados al producto"
          addButtonText="Asignar grupo"
          emptyTitle="No hay grupos asignados"
          emptyMessage="Asigna tu primer grupo de modificadores a este producto."
          missingSelectionTitle="Selecciona un producto"
          missingSelectionMessage="Primero elige un producto para poder administrar su catálogo de modificadores."
          canAssign={!!selectedProduct && availableGroups.length > 0}
          hasSelection={!!selectedProduct}
          rows={sortedAssignments}
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

      <ProductModifierGroupUpsertModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        restaurantId={restaurantId}
        product={selectedProduct}
        requiresBranch={modifiersAreByBranch}
        effectiveBranchId={effectiveBranchId}
        availableGroups={availableGroups}
        editing={editing}
        onSaved={async () => {
          setModalOpen(false);
          setEditing(null);
          if (selectedProduct?.id) {
            await refreshAssignments(selectedProduct.id);
          }
        }}
        api={{
          createProductModifierGroup,
          updateProductModifierGroup,
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