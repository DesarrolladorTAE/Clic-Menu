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

import { getProductVariants } from "../../../../services/menu/modifiers/modifierCatalog.service";
import {
  getVariantModifierGroups,
  createVariantModifierGroup,
  updateVariantModifierGroup,
  deleteVariantModifierGroup,
} from "../../../../services/menu/modifiers/variantModifierGroups.service";

import VariantModifierGroupUpsertModal from "../../../../components/menu/modifiers/catalogs/VariantModifierGroupUpsertModal";

import ModifierCatalogInstructionsCard from "../../../../components/menu/modifiers/catalogs/shared/ModifierCatalogInstructionsCard";
import ModifierCatalogBranchSelector from "../../../../components/menu/modifiers/catalogs/shared/ModifierCatalogBranchSelector";
import ModifierCatalogSelectionCard from "../../../../components/menu/modifiers/catalogs/shared/ModifierCatalogSelectionCard";
import ModifierAssignmentsPanel from "../../../../components/menu/modifiers/catalogs/shared/ModifierAssignmentsPanel";

import {
  PAGE_SIZE,
  getBranchHelpText,
} from "../../../../components/menu/modifiers/catalogs/shared/catalogShared";

export default function VariantModifierCatalogPage() {
  const { restaurantId } = useParams();
  const nav = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [variants, setVariants] = useState([]);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [variantLoading, setVariantLoading] = useState(false);

  const [assignments, setAssignments] = useState([]);
  const [savingMap, setSavingMap] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

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

    catalogEmpty,
    catalogEmptyMessage,

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
    catalogContext: "variant",
    allowedGroupAppliesTo: ["variant", "any"],
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

  const selectedVariantRow = useMemo(() => {
    return variants.find(
      (row) => String(row?.variant?.id) === String(selectedVariantId)
    ) || null;
  }, [variants, selectedVariantId]);

  const selectedVariant = selectedVariantRow?.variant || null;

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

  const refreshAssignments = async (
    productId = selectedProductId,
    variantId = selectedVariantId
  ) => {
    if (!productId || !variantId) {
      setAssignments([]);
      return [];
    }

    const response = await getVariantModifierGroups(
      restaurantId,
      productId,
      variantId,
      getModifierParams()
    );

    const rows = Array.isArray(response?.data) ? response.data : [];
    setAssignments(rows);

    return rows;
  };

  useEffect(() => {
    if (!selectedProductId) {
      setVariants([]);
      setSelectedVariantId("");
      setAssignments([]);
      return;
    }

    let active = true;

    setVariantLoading(true);
    setSelectedVariantId("");
    setAssignments([]);

    (async () => {
      try {
        const rows = await getProductVariants(restaurantId, selectedProductId);

        if (!active) {
          return;
        }

        const safeRows = Array.isArray(rows)
          ? rows.filter((row) => row?.variant?.id)
          : [];

        setVariants(safeRows);

        if (!safeRows.length) {
          setSelectedVariantId("");
          return;
        }

        setSelectedVariantId(String(safeRows[0].variant.id));
      } catch (e) {
        if (!active) {
          return;
        }

        setVariants([]);
        setSelectedVariantId("");
        setAssignments([]);

        showAlert({
          severity: "error",
          title: "Error",
          message:
            e?.response?.data?.message ||
            "No se pudieron cargar las variantes del producto.",
        });
      } finally {
        if (active) {
          setVariantLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [restaurantId, selectedProductId]);

  useEffect(() => {
    if (!selectedProductId || !selectedVariantId) {
      setAssignments([]);
      return;
    }

    if (modifiersAreByBranch && !effectiveBranchId) {
      setAssignments([]);
      return;
    }

    let active = true;
    setAssignments([]);

    (async () => {
      try {
        const response = await getVariantModifierGroups(
          restaurantId,
          selectedProductId,
          selectedVariantId,
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
            "No se pudieron cargar los grupos asignados a la variante.",
        });
      }
    })();

    return () => {
      active = false;
    };
  }, [
    restaurantId,
    selectedProductId,
    selectedVariantId,
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

    if (
      !assignmentId ||
      !selectedProduct?.id ||
      !selectedVariant?.id ||
      isSaving(assignmentId)
    ) {
      return;
    }

    const currentActive =
      row?.is_active === true || Number(row?.is_active) === 1;

    const nextActive = !currentActive;
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

      await updateVariantModifierGroup(
        restaurantId,
        selectedProduct.id,
        selectedVariant.id,
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
    if (!selectedProduct?.id || !selectedVariant?.id || !row?.id) {
      return;
    }

    const confirmed = window.confirm(
      "¿Deseas eliminar esta asignación de la variante?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const params = modifiersAreByBranch
        ? { branch_id: effectiveBranchId }
        : {};

      await deleteVariantModifierGroup(
        restaurantId,
        selectedProduct.id,
        selectedVariant.id,
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
              Cargando catálogo por variante…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  const noVariantProductsMessage =
    catalogEmptyMessage || "No cuentas con productos que tengan variantes.";

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
              Catálogo de modificadores por variante
            </Typography>

            <Typography
              sx={{
                mt: 1,
                color: "text.secondary",
                fontSize: { xs: 14, md: 17 },
              }}
            >
              Define qué grupos de modificadores estarán disponibles en cada variante.
            </Typography>
          </Box>

          <Button
            onClick={() => nav(`/owner/restaurants/${restaurantId}/operation/modifiers`)}
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
            "Usa la sección y la categoría para encontrar más rápido un producto que tenga variantes.",
            "Selecciona el producto, elige su variante y administra los grupos que tendrá disponibles.",
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
          description="Solo se muestran secciones y categorías que contienen productos con variantes."
        >
          <FieldBlock
            label="Sección"
            input={
              <TextField
                select
                fullWidth
                value={sectionId || ""}
                onChange={(e) => changeSection(e.target.value)}
                disabled={catalogEmpty || !sections.length}
              >
                <MenuItem value="">Todas las secciones</MenuItem>

                {sections.map((section) => (
                  <MenuItem key={section.id} value={String(section.id)}>
                    {section.name}
                  </MenuItem>
                ))}
              </TextField>
            }
          />

          <FieldBlock
            label="Categoría"
            input={
              <TextField
                select
                fullWidth
                value={categoryId || ""}
                onChange={(e) => changeCategory(e.target.value)}
                disabled={catalogEmpty || !visibleCategories.length}
              >
                <MenuItem value="">Todas las categorías</MenuItem>

                {visibleCategories.map((category) => (
                  <MenuItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>
            }
          />
        </ModifierCatalogSelectionCard>

        <ModifierCatalogSelectionCard
          title="Producto y variante"
          description="Selecciona un producto con variantes y después la variante que deseas configurar."
        >
          <FieldBlock
            label="Producto"
            input={
              <TextField
                select
                fullWidth
                value={selectedProductId || ""}
                onChange={(e) => changeProduct(e.target.value)}
                disabled={catalogEmpty || !filteredProducts.length}
              >
                {catalogEmpty ? (
                  <MenuItem value="" disabled>
                    {noVariantProductsMessage}
                  </MenuItem>
                ) : !filteredProducts.length ? (
                  <MenuItem value="" disabled>
                    No hay productos con variantes en los filtros seleccionados
                  </MenuItem>
                ) : null}

                {filteredProducts.map((product) => (
                  <MenuItem key={product.id} value={String(product.id)}>
                    {product.name}
                  </MenuItem>
                ))}
              </TextField>
            }
            help={catalogEmpty ? noVariantProductsMessage : null}
          />

          <FieldBlock
            label="Variante"
            input={
              <TextField
                select
                fullWidth
                value={selectedVariantId || ""}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                disabled={
                  catalogEmpty ||
                  !selectedProduct ||
                  variantLoading ||
                  !variants.length
                }
              >
                {variantLoading ? (
                  <MenuItem value="" disabled>
                    Cargando variantes…
                  </MenuItem>
                ) : null}

                {!variantLoading && !variants.length ? (
                  <MenuItem value="" disabled>
                    No hay variantes disponibles
                  </MenuItem>
                ) : null}

                {!variantLoading &&
                  variants.map((row) => {
                    const variant = row?.variant;
                    const inactive =
                      variant?.is_enabled === false ||
                      Number(variant?.is_enabled) === 0;

                    return (
                      <MenuItem key={variant.id} value={String(variant.id)}>
                        {variant.name || "Variante sin nombre"}
                        {inactive ? " · Inactiva" : ""}
                      </MenuItem>
                    );
                  })}
              </TextField>
            }
          />
        </ModifierCatalogSelectionCard>

        <ModifierAssignmentsPanel
          isMobile={isMobile}
          title="Grupos asignados a la variante"
          addButtonText="Asignar grupo"
          emptyTitle="No hay grupos asignados"
          emptyMessage="Asigna tu primer grupo de modificadores a esta variante."
          missingSelectionTitle={
            catalogEmpty
              ? "No hay productos con variantes"
              : !selectedProduct
                ? "Selecciona un producto"
                : "Selecciona una variante"
          }
          missingSelectionMessage={
            catalogEmpty
              ? noVariantProductsMessage
              : !selectedProduct
                ? "Primero elige un producto para consultar sus variantes."
                : "Elige la variante a la que deseas asignar grupos de modificadores."
          }
          canAssign={
            !!selectedProduct &&
            !!selectedVariant &&
            groups.length > 0
          }
          hasSelection={!!selectedProduct && !!selectedVariant}
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

      <VariantModifierGroupUpsertModal
        open={modalOpen}
        onClose={closeModal}
        restaurantId={restaurantId}
        product={selectedProduct}
        variant={selectedVariant}
        requiresBranch={modifiersAreByBranch}
        effectiveBranchId={effectiveBranchId}
        availableGroups={groups}
        editing={editing}
        onSaved={async () => {
          setModalOpen(false);
          setEditing(null);

          if (selectedProduct?.id && selectedVariant?.id) {
            try {
              await refreshAssignments(
                selectedProduct.id,
                selectedVariant.id
              );
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
          createVariantModifierGroup,
          updateVariantModifierGroup,
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

function FieldBlock({ label, input, help }) {
  return (
    <Box sx={{ flex: 1, width: "100%" }}>
      {label ? (
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 800,
            color: "text.primary",
            mb: 1,
          }}
        >
          {label}
        </Typography>
      ) : null}

      {input}

      {help ? (
        <Typography
          sx={{
            mt: 0.75,
            fontSize: 12,
            color: "text.secondary",
            lineHeight: 1.45,
          }}
        >
          {help}
        </Typography>
      ) : null}
    </Box>
  );
}