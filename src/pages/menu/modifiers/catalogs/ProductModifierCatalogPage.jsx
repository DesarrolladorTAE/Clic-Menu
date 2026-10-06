import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Box, Button, CircularProgress, MenuItem, Stack, TextField, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import PageContainer from "../../../../components/common/PageContainer";
import AppAlert from "../../../../components/common/AppAlert";
import usePagination from "../../../../hooks/usePagination";
import useModifierCatalogBase from "../../../../hooks/menu/modifiers/useModifierCatalogBase";

import {
  getProductModifierGroups,
  createProductModifierGroup,
  updateProductModifierGroup,
  deleteProductModifierGroup,
} from "../../../../services/menu/modifiers/productModifierGroups.service";

import ProductModifierGroupUpsertModal from "../../../../components/menu/modifiers/catalogs/ProductModifierGroupUpsertModal";

import ModifierCatalogInstructionsCard from "../../../../components/menu/modifiers/catalogs/shared/ModifierCatalogInstructionsCard";
import ModifierCatalogBranchSelector from "../../../../components/menu/modifiers/catalogs/shared/ModifierCatalogBranchSelector";
import ModifierCatalogSelectionCard from "../../../../components/menu/modifiers/catalogs/shared/ModifierCatalogSelectionCard";
import ModifierAssignmentsPanel from "../../../../components/menu/modifiers/catalogs/shared/ModifierAssignmentsPanel";

import {
  PAGE_SIZE,
  getBranchHelpText,
} from "../../../../components/menu/modifiers/catalogs/shared/catalogShared";

export default function ProductModifierCatalogPage() {
  const { restaurantId } = useParams();
  const nav = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [savingMap, setSavingMap] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [assignments, setAssignments] = useState([]);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const {
    branches,
    branchId,
    effectiveBranchId,

    sections,
    sectionId,

    categoryId,
    visibleCategories,

    filteredProducts,
    selectedProductId,
    selectedProduct,

    groups,

    productsAreByBranch,
    modifiersAreByBranch,
    needsBranchSelector,

    loading,
    error: catalogError,
    clearError: clearCatalogError,

    changeBranch,
    changeSection,
    changeCategory,
    changeProduct,
  } = useModifierCatalogBase({
    restaurantId,
    allowedGroupAppliesTo: ["product", "any"],
  });

  const showAlert = ({ severity = "error", title = "Error", message = "" }) => {
    setAlertState({ open: true, severity, title, message });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setAlertState((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    if (!catalogError) {
      return;
    }

    showAlert({
      severity: "error",
      title: "Error",
      message: catalogError,
    });

    clearCatalogError();
  }, [catalogError]);

  const sortedAssignments = useMemo(() => {
    return [...assignments].sort((a, b) => {
      const byOrder = Number(a?.sort_order ?? 0) - Number(b?.sort_order ?? 0);

      if (byOrder !== 0) {
        return byOrder;
      }

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
    if (!modifiersAreByBranch || !effectiveBranchId) {
      return {};
    }

    return { branch_id: effectiveBranchId };
  };

  const refreshAssignments = async (productId = selectedProductId) => {
    if (!productId) {
      setAssignments([]);
      return [];
    }

    const response = await getProductModifierGroups(
      restaurantId,
      productId,
      getModifierParams()
    );

    const rows = Array.isArray(response?.data) ? response.data : [];
    setAssignments(rows);

    return rows;
  };

  useEffect(() => {
    if (!selectedProductId) {
      setAssignments([]);
      return;
    }

    if (modifiersAreByBranch && !effectiveBranchId) {
      setAssignments([]);
      return;
    }

    let active = true;

    (async () => {
      try {
        const response = await getProductModifierGroups(
          restaurantId,
          selectedProductId,
          getModifierParams()
        );

        if (!active) {
          return;
        }

        setAssignments(Array.isArray(response?.data) ? response.data : []);
      } catch (e) {
        if (!active) {
          return;
        }

        setAssignments([]);

        showAlert({
          severity: "error",
          title: "Error",
          message:
            e?.response?.data?.message ||
            "No se pudieron cargar los grupos asignados al producto.",
        });
      }
    })();

    return () => {
      active = false;
    };
  }, [
    restaurantId,
    selectedProductId,
    modifiersAreByBranch,
    effectiveBranchId,
  ]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const onToggleStatus = async (row) => {
    const assignmentId = row?.id;

    if (!assignmentId || !selectedProduct?.id || isSaving(assignmentId)) {
      return;
    }

    const nextActive = !Boolean(row?.is_active);
    setSaving(assignmentId, true);

    try {
      const payload = {
        modifier_group_id: Number(row.modifier_group_id),
        sort_order: Number(row.sort_order ?? 0),
        is_active: nextActive,
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

      setAssignments((prev) =>
        prev.map((item) =>
          String(item.id) === String(assignmentId)
            ? { ...item, is_active: nextActive }
            : item
        )
      );
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo actualizar el estado de la asignación.",
      });
    } finally {
      setSaving(assignmentId, false);
    }
  };

  const onDelete = async (row) => {
    if (!selectedProduct?.id || !row?.id) {
      return;
    }

    const confirmed = window.confirm(
      "¿Deseas eliminar esta asignación del producto?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const params = modifiersAreByBranch
        ? { branch_id: effectiveBranchId }
        : {};

      await deleteProductModifierGroup(
        restaurantId,
        selectedProduct.id,
        row.id,
        params
      );

      setAssignments((prev) =>
        prev.filter((item) => String(item.id) !== String(row.id))
      );

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
          "No se pudo eliminar la asignación.",
      });
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
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
              fontWeight: 800,
            }}
          >
            Regresar
          </Button>
        </Stack>

        <ModifierCatalogInstructionsCard
          steps={[
            needsBranchSelector
              ? "Selecciona la sucursal en la que deseas trabajar."
              : "La configuración de este restaurante se aplica de forma general.",
            "Usa la sección y la categoría para encontrar más rápido el producto.",
            "Selecciona el producto y administra los grupos que tendrá disponibles.",
          ]}
        />

        <ModifierCatalogBranchSelector
          visible={needsBranchSelector}
          branches={branches}
          branchId={branchId}
          onChange={changeBranch}
          helpText={getBranchHelpText({
            productsAreByBranch,
            modifiersAreByBranch,
          })}
        />

        <ModifierCatalogSelectionCard
          title="Ubica el producto"
          description="Puedes reducir la lista seleccionando una sección y una categoría."
        >
          <TextField
            select
            fullWidth
            label="Sección"
            value={sectionId || ""}
            onChange={(e) => changeSection(e.target.value)}
          >
            <MenuItem value="">Todas las secciones</MenuItem>

            {sections.map((section) => (
              <MenuItem key={section.id} value={String(section.id)}>
                {section.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            fullWidth
            label="Categoría"
            value={categoryId || ""}
            onChange={(e) => changeCategory(e.target.value)}
            disabled={!visibleCategories.length}
          >
            <MenuItem value="">Todas las categorías</MenuItem>

            {visibleCategories.map((category) => (
              <MenuItem key={category.id} value={String(category.id)}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
        </ModifierCatalogSelectionCard>

        <ModifierCatalogSelectionCard
          title="Producto"
          description="Selecciona el producto al que deseas asignar grupos de modificadores."
        >
          <TextField
            select
            fullWidth
            label="Producto"
            value={selectedProductId || ""}
            onChange={(e) => changeProduct(e.target.value)}
            disabled={!filteredProducts.length}
          >
            {!filteredProducts.length && (
              <MenuItem value="" disabled>
                No hay productos disponibles
              </MenuItem>
            )}

            {filteredProducts.map((product) => (
              <MenuItem key={product.id} value={String(product.id)}>
                {product.name}
              </MenuItem>
            ))}
          </TextField>
        </ModifierCatalogSelectionCard>

        <ModifierAssignmentsPanel
          isMobile={isMobile}
          title="Grupos asignados al producto"
          addButtonText="Asignar grupo"
          emptyTitle="No hay grupos asignados"
          emptyMessage="Asigna tu primer grupo de modificadores a este producto."
          missingSelectionTitle="Selecciona un producto"
          missingSelectionMessage="Primero elige un producto para administrar sus grupos de modificadores."
          canAssign={!!selectedProduct && groups.length > 0}
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
        onClose={closeModal}
        restaurantId={restaurantId}
        product={selectedProduct}
        requiresBranch={modifiersAreByBranch}
        effectiveBranchId={effectiveBranchId}
        availableGroups={groups}
        editing={editing}
        onSaved={async () => {
          setModalOpen(false);
          setEditing(null);

          if (selectedProduct?.id) {
            try {
              await refreshAssignments(selectedProduct.id);
            } catch (e) {
              showAlert({
                severity: "error",
                title: "Error",
                message:
                  e?.response?.data?.message ||
                  "La asignación se guardó, pero no se pudo actualizar la lista.",
              });
            }
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
        autoHideDuration={3000}
      />
    </PageContainer>
  );
}