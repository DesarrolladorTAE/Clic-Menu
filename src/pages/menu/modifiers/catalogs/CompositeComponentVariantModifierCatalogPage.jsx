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
  getProductComponentsCatalog,
  getComponentProductVariants,
} from "../../../../services/menu/modifiers/modifierCatalog.service";

import {
  getCompositeComponentVariantModifierGroups,
  createCompositeComponentVariantModifierGroup,
  updateCompositeComponentVariantModifierGroup,
  deleteCompositeComponentVariantModifierGroup,
} from "../../../../services/menu/modifiers/compositeComponentVariantModifierGroups.service";

import CompositeComponentVariantModifierGroupUpsertModal from "../../../../components/menu/modifiers/catalogs/CompositeComponentVariantModifierGroupUpsertModal";

import ModifierCatalogInstructionsCard from "../../../../components/menu/modifiers/catalogs/shared/ModifierCatalogInstructionsCard";
import ModifierCatalogBranchSelector from "../../../../components/menu/modifiers/catalogs/shared/ModifierCatalogBranchSelector";
import ModifierCatalogSelectionCard from "../../../../components/menu/modifiers/catalogs/shared/ModifierCatalogSelectionCard";
import ModifierAssignmentsPanel from "../../../../components/menu/modifiers/catalogs/shared/ModifierAssignmentsPanel";

import {
  PAGE_SIZE,
  getBranchHelpText,
} from "../../../../components/menu/modifiers/catalogs/shared/catalogShared";

export default function CompositeComponentVariantModifierCatalogPage() {
  const { restaurantId } = useParams();
  const nav = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [components, setComponents] = useState([]);
  const [selectedComponentId, setSelectedComponentId] = useState("");
  const [componentsLoading, setComponentsLoading] = useState(false);

  const [variants, setVariants] = useState([]);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [variantsLoading, setVariantsLoading] = useState(false);

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
    catalogContext: "component_variant",
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

  /*
   * El contexto component_variant ya llega reducido desde backend a
   * productos compuestos que tienen al menos un componente apto.
   */
  const compositeProducts = useMemo(() => {
    return Array.isArray(filteredProducts) ? filteredProducts : [];
  }, [filteredProducts]);

  const effectiveSelectedProductId = useMemo(() => {
    const selectedExists = compositeProducts.some(
      (product) => String(product.id) === String(selectedProductId)
    );

    if (selectedExists) {
      return String(selectedProductId);
    }

    return compositeProducts?.[0]?.id ? String(compositeProducts[0].id) : "";
  }, [compositeProducts, selectedProductId]);

  const selectedProduct = useMemo(() => {
    return compositeProducts.find(
      (product) => String(product.id) === String(effectiveSelectedProductId)
    ) || null;
  }, [compositeProducts, effectiveSelectedProductId]);

  /*
   * Dentro del compuesto seguimos respetando allow_variant.
   * El backend del catálogo ya garantiza que el compuesto tiene al menos
   * un componente que además cuenta con variantes.
   */
  const variantAllowedComponents = useMemo(() => {
    return (Array.isArray(components) ? components : []).filter(
      (row) => !!row?.allow_variant
    );
  }, [components]);

  const selectedComponentRow = useMemo(() => {
    return variantAllowedComponents.find(
      (row) => String(row?.component_product_id) === String(selectedComponentId)
    ) || null;
  }, [variantAllowedComponents, selectedComponentId]);

  const selectedComponent = selectedComponentRow?.component_product || null;

  const selectedVariantRow = useMemo(() => {
    return variants.find(
      (row) => String(row?.variant?.id) === String(selectedVariantId)
    ) || null;
  }, [variants, selectedVariantId]);

  const selectedVariant = selectedVariantRow?.variant || null;

  const filteredAssignments = useMemo(() => {
    if (!selectedComponentId || !selectedVariantId) {
      return [];
    }

    return assignments
      .filter(
        (row) =>
          String(row?.component_product_id) === String(selectedComponentId) &&
          String(row?.component_variant_id) === String(selectedVariantId)
      )
      .sort((a, b) => {
        const byOrder = Number(a?.sort_order ?? 0) - Number(b?.sort_order ?? 0);

        if (byOrder !== 0) {
          return byOrder;
        }

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

  /*
   * Las asignaciones de componente-variante pueden necesitar branch_id
   * por products_mode, modifiers_mode o ambos.
   */
  const getContextParams = () => {
    if (!needsBranchSelector || !effectiveBranchId) {
      return {};
    }

    return { branch_id: effectiveBranchId };
  };

  const getComponentParams = () => {
    if (!productsAreByBranch || !effectiveBranchId) {
      return {};
    }

    return { branch_id: effectiveBranchId };
  };

  const refreshAssignments = async (
    productId = effectiveSelectedProductId
  ) => {
    if (!productId) {
      setAssignments([]);
      return [];
    }

    const response = await getCompositeComponentVariantModifierGroups(
      restaurantId,
      productId,
      getContextParams()
    );

    const rows = Array.isArray(response?.data) ? response.data : [];
    setAssignments(rows);

    return rows;
  };

  useEffect(() => {
    if (loading) {
      return;
    }

    if (needsBranchSelector && !effectiveBranchId) {
      setComponents([]);
      setSelectedComponentId("");
      setVariants([]);
      setSelectedVariantId("");
      setAssignments([]);
      return;
    }

    if (!effectiveSelectedProductId) {
      setComponents([]);
      setSelectedComponentId("");
      setVariants([]);
      setSelectedVariantId("");
      setAssignments([]);
      return;
    }

    let active = true;

    setComponentsLoading(true);
    setSelectedComponentId("");
    setVariants([]);
    setSelectedVariantId("");
    setAssignments([]);

    (async () => {
      try {
        const [componentRows, assignmentResponse] = await Promise.all([
          getProductComponentsCatalog(
            restaurantId,
            effectiveSelectedProductId,
            getComponentParams()
          ),
          getCompositeComponentVariantModifierGroups(
            restaurantId,
            effectiveSelectedProductId,
            getContextParams()
          ),
        ]);

        if (!active) {
          return;
        }

        const safeComponents = Array.isArray(componentRows)
          ? componentRows.filter(
              (row) =>
                !!row?.allow_variant &&
                row?.component_product_id &&
                row?.component_product
            )
          : [];

        const safeAssignments = Array.isArray(assignmentResponse?.data)
          ? assignmentResponse.data
          : [];

        setComponents(safeComponents);
        setAssignments(safeAssignments);

        if (!safeComponents.length) {
          setSelectedComponentId("");
          return;
        }

        setSelectedComponentId(String(safeComponents[0].component_product_id));
      } catch (e) {
        if (!active) {
          return;
        }

        setComponents([]);
        setSelectedComponentId("");
        setVariants([]);
        setSelectedVariantId("");
        setAssignments([]);

        showAlert({
          severity: "error",
          title: "Error",
          message:
            e?.response?.data?.message ||
            "No se pudieron cargar los componentes del producto seleccionado.",
        });
      } finally {
        if (active) {
          setComponentsLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [
    restaurantId,
    effectiveSelectedProductId,
    effectiveBranchId,
    productsAreByBranch,
    modifiersAreByBranch,
    needsBranchSelector,
    loading,
  ]);

  useEffect(() => {
    if (!selectedComponentId) {
      setVariants([]);
      setSelectedVariantId("");
      return;
    }

    const componentExists = variantAllowedComponents.some(
      (row) =>
        String(row?.component_product_id) === String(selectedComponentId)
    );

    if (!componentExists) {
      setVariants([]);
      setSelectedVariantId("");
      return;
    }

    let active = true;

    setVariantsLoading(true);
    setVariants([]);
    setSelectedVariantId("");

    (async () => {
      try {
        const rows = await getComponentProductVariants(
          restaurantId,
          selectedComponentId
        );

        if (!active) {
          return;
        }

        const safeRows = Array.isArray(rows)
          ? rows.filter(
              (row) =>
                row?.variant?.id &&
                String(row?.variant?.product_id) === String(selectedComponentId)
            )
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

        showAlert({
          severity: "error",
          title: "Error",
          message:
            e?.response?.data?.message ||
            "No se pudieron cargar las variantes del componente seleccionado.",
        });
      } finally {
        if (active) {
          setVariantsLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [
    restaurantId,
    selectedComponentId,
    variantAllowedComponents,
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
      !selectedComponent?.id ||
      !selectedVariant?.id ||
      isSaving(assignmentId)
    ) {
      return;
    }

    const currentActive =
      row?.is_active === true ||
      Number(row?.is_active) === 1;

    const nextActive = !currentActive;
    setSaving(assignmentId, true);

    try {
      const payload = {
        component_product_id: Number(row.component_product_id),
        component_variant_id: Number(row.component_variant_id),
        modifier_group_id: Number(row.modifier_group_id),
        sort_order: Number(row.sort_order ?? 0),
        is_active: nextActive,
      };

      if (needsBranchSelector && effectiveBranchId) {
        payload.branch_id = effectiveBranchId;
      }

      await updateCompositeComponentVariantModifierGroup(
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
      "¿Deseas eliminar esta asignación de la variante?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteCompositeComponentVariantModifierGroup(
        restaurantId,
        selectedProduct.id,
        row.id,
        getContextParams()
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
              Cargando catálogo por variante de componente…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  const noComponentVariantProductsMessage =
    catalogEmptyMessage ||
    "No cuentas con productos compuestos que tengan componentes con variantes disponibles.";

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
            "Usa la sección y la categoría para encontrar el producto compuesto.",
            "Selecciona un componente que permita variantes, después elige su variante y administra los grupos disponibles.",
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
          title="Ubica el producto compuesto"
          description="Solo se muestran secciones y categorías que contienen productos compuestos con componentes que pueden trabajar con variantes."
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
          title="Producto compuesto y componente"
          description="Selecciona el producto compuesto y después un componente que permita variantes."
        >
          <FieldBlock
            label="Producto compuesto"
            input={
              <TextField
                select
                fullWidth
                value={effectiveSelectedProductId}
                onChange={(e) => changeProduct(e.target.value)}
                disabled={catalogEmpty || !compositeProducts.length}
              >
                {catalogEmpty ? (
                  <MenuItem value="" disabled>
                    {noComponentVariantProductsMessage}
                  </MenuItem>
                ) : !compositeProducts.length ? (
                  <MenuItem value="" disabled>
                    No hay productos compuestos con variantes en los filtros seleccionados
                  </MenuItem>
                ) : null}

                {compositeProducts.map((product) => (
                  <MenuItem key={product.id} value={String(product.id)}>
                    {product.name}
                  </MenuItem>
                ))}
              </TextField>
            }
            help={catalogEmpty ? noComponentVariantProductsMessage : null}
          />

          <FieldBlock
            label="Componente"
            input={
              <TextField
                select
                fullWidth
                value={selectedComponentId || ""}
                onChange={(e) => setSelectedComponentId(e.target.value)}
                disabled={
                  catalogEmpty ||
                  !selectedProduct ||
                  componentsLoading ||
                  !variantAllowedComponents.length
                }
              >
                {componentsLoading ? (
                  <MenuItem value="" disabled>
                    Cargando componentes…
                  </MenuItem>
                ) : null}

                {!componentsLoading && !variantAllowedComponents.length ? (
                  <MenuItem value="" disabled>
                    No hay componentes con variantes disponibles
                  </MenuItem>
                ) : null}

                {!componentsLoading &&
                  variantAllowedComponents.map((row) => (
                    <MenuItem
                      key={row.component_product_id}
                      value={String(row.component_product_id)}
                    >
                      {row?.component_product?.name || "Componente sin nombre"}
                    </MenuItem>
                  ))}
              </TextField>
            }
          />
        </ModifierCatalogSelectionCard>

        <ModifierCatalogSelectionCard
          title="Variante del componente"
          description="Selecciona la variante específica a la que deseas asignar grupos de modificadores."
        >
          <FieldBlock
            input={
              <TextField
                select
                fullWidth
                value={selectedVariantId || ""}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                disabled={
                  catalogEmpty ||
                  !selectedComponent ||
                  variantsLoading ||
                  !variants.length
                }
              >
                {variantsLoading ? (
                  <MenuItem value="" disabled>
                    Cargando variantes…
                  </MenuItem>
                ) : null}

                {!variantsLoading && !variants.length ? (
                  <MenuItem value="" disabled>
                    No hay variantes disponibles
                  </MenuItem>
                ) : null}

                {!variantsLoading &&
                  variants.map((row) => {
                    const variant = row?.variant;
                    const inactive =
                      variant?.is_enabled === false ||
                      Number(variant?.is_enabled) === 0;

                    return (
                      <MenuItem
                        key={variant?.id}
                        value={String(variant?.id)}
                      >
                        {variant?.name || "Variante sin nombre"}
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
          title="Grupos asignados a la variante del componente"
          addButtonText="Asignar grupo"
          emptyTitle="No hay grupos asignados"
          emptyMessage="Asigna tu primer grupo de modificadores a esta variante del componente."
          missingSelectionTitle={
            catalogEmpty
              ? "No hay productos compuestos con variantes"
              : !selectedProduct
                ? "Selecciona un producto compuesto"
                : !selectedComponent
                  ? "Selecciona un componente"
                  : "Selecciona una variante"
          }
          missingSelectionMessage={
            catalogEmpty
              ? noComponentVariantProductsMessage
              : !selectedProduct
                ? "Primero elige un producto compuesto para consultar sus componentes."
                : !selectedComponent
                  ? "Elige un componente que tenga variantes disponibles."
                  : "Elige la variante del componente a la que deseas asignar grupos de modificadores."
          }
          canAssign={
            !!selectedProduct &&
            !!selectedComponent &&
            !!selectedVariant &&
            groups.length > 0
          }
          hasSelection={
            !!selectedProduct &&
            !!selectedComponent &&
            !!selectedVariant
          }
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
        onClose={closeModal}
        restaurantId={restaurantId}
        product={selectedProduct}
        component={selectedComponent}
        variant={selectedVariant}
        requiresBranch={needsBranchSelector}
        effectiveBranchId={effectiveBranchId}
        availableGroups={groups}
        availableComponents={variantAllowedComponents}
        availableVariants={variants}
        editing={editing}
        onSaved={async () => {
          setModalOpen(false);
          setEditing(null);

          if (!selectedProduct?.id) {
            return;
          }

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
        }}
        api={{
          createCompositeComponentVariantModifierGroup,
          updateCompositeComponentVariantModifierGroup,
          getComponentProductVariants,
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