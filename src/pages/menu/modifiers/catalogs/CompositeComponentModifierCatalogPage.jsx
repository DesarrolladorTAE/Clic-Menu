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

import { getProductComponentsCatalog } from "../../../../services/menu/modifiers/modifierCatalog.service";
import {
  getCompositeComponentModifierGroups,
  createCompositeComponentModifierGroup,
  updateCompositeComponentModifierGroup,
  deleteCompositeComponentModifierGroup,
} from "../../../../services/menu/modifiers/compositeComponentModifierGroups.service";

import CompositeComponentModifierGroupUpsertModal from "../../../../components/menu/modifiers/catalogs/CompositeComponentModifierGroupUpsertModal";

import ModifierCatalogInstructionsCard from "../../../../components/menu/modifiers/catalogs/shared/ModifierCatalogInstructionsCard";
import ModifierCatalogBranchSelector from "../../../../components/menu/modifiers/catalogs/shared/ModifierCatalogBranchSelector";
import ModifierCatalogSelectionCard from "../../../../components/menu/modifiers/catalogs/shared/ModifierCatalogSelectionCard";
import ModifierAssignmentsPanel from "../../../../components/menu/modifiers/catalogs/shared/ModifierAssignmentsPanel";

import {
  PAGE_SIZE,
  getBranchHelpText,
} from "../../../../components/menu/modifiers/catalogs/shared/catalogShared";

export default function CompositeComponentModifierCatalogPage() {
  const { restaurantId } = useParams();
  const nav = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [components, setComponents] = useState([]);
  const [selectedComponentId, setSelectedComponentId] = useState("");
  const [componentLoading, setComponentLoading] = useState(false);

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
    catalogContext: "component",
    allowedGroupAppliesTo: ["component", "any"],
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
   * El backend ya entrega únicamente productos válidos para el contexto
   * "component". No volvemos a decidir aquí qué producto compuesto aplica.
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

  const selectedComponentRow = useMemo(() => {
    return components.find(
      (row) => String(row?.component_product_id) === String(selectedComponentId)
    ) || null;
  }, [components, selectedComponentId]);

  const selectedComponent = selectedComponentRow?.component_product || null;

  const filteredAssignments = useMemo(() => {
    if (!selectedComponentId) {
      return [];
    }

    return assignments
      .filter(
        (row) => String(row?.component_product_id) === String(selectedComponentId)
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

  const getComponentParams = () => {
    if (!productsAreByBranch || !effectiveBranchId) {
      return {};
    }

    return { branch_id: effectiveBranchId };
  };

  /*
   * Para componentes el mismo branch_id puede ser requerido por el contexto
   * de productos, por modificadores o por ambos.
   */
  const getAssignmentParams = () => {
    if (!needsBranchSelector || !effectiveBranchId) {
      return {};
    }

    return { branch_id: effectiveBranchId };
  };

  const refreshAssignments = async (productId = effectiveSelectedProductId) => {
    if (!productId) {
      setAssignments([]);
      return [];
    }

    const response = await getCompositeComponentModifierGroups(
      restaurantId,
      productId,
      getAssignmentParams()
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
      setAssignments([]);
      return;
    }

    if (!effectiveSelectedProductId) {
      setComponents([]);
      setSelectedComponentId("");
      setAssignments([]);
      return;
    }

    let active = true;

    setComponentLoading(true);
    setSelectedComponentId("");
    setAssignments([]);

    (async () => {
      try {
        const [componentRows, assignmentResponse] = await Promise.all([
          getProductComponentsCatalog(
            restaurantId,
            effectiveSelectedProductId,
            getComponentParams()
          ),
          getCompositeComponentModifierGroups(
            restaurantId,
            effectiveSelectedProductId,
            getAssignmentParams()
          ),
        ]);

        if (!active) {
          return;
        }

        const safeComponents = Array.isArray(componentRows)
          ? componentRows.filter(
              (row) => row?.component_product_id && row?.component_product
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
          setComponentLoading(false);
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
        modifier_group_id: Number(row.modifier_group_id),
        sort_order: Number(row.sort_order ?? 0),
        is_active: nextActive,
      };

      if (needsBranchSelector && effectiveBranchId) {
        payload.branch_id = effectiveBranchId;
      }

      await updateCompositeComponentModifierGroup(
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
      "¿Deseas eliminar esta asignación del componente?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteCompositeComponentModifierGroup(
        restaurantId,
        selectedProduct.id,
        row.id,
        getAssignmentParams()
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
              Cargando catálogo por componente…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  const noComponentProductsMessage =
    catalogEmptyMessage ||
    "No cuentas con productos compuestos que tengan componentes configurados.";

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
              Define qué grupos de modificadores estarán disponibles en cada componente de un producto compuesto.
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
            "Selecciona el producto, elige uno de sus componentes y administra los grupos que tendrá disponibles.",
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
          description="Solo se muestran secciones y categorías que contienen productos compuestos con componentes configurados."
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
          description="Selecciona el producto compuesto y después uno de los componentes que realmente tiene configurados."
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
                    {noComponentProductsMessage}
                  </MenuItem>
                ) : !compositeProducts.length ? (
                  <MenuItem value="" disabled>
                    No hay productos compuestos con componentes en los filtros seleccionados
                  </MenuItem>
                ) : null}

                {compositeProducts.map((product) => (
                  <MenuItem key={product.id} value={String(product.id)}>
                    {product.name}
                  </MenuItem>
                ))}
              </TextField>
            }
            help={catalogEmpty ? noComponentProductsMessage : null}
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
                  componentLoading ||
                  !components.length
                }
              >
                {componentLoading ? (
                  <MenuItem value="" disabled>
                    Cargando componentes…
                  </MenuItem>
                ) : null}

                {!componentLoading && !components.length ? (
                  <MenuItem value="" disabled>
                    No hay componentes disponibles
                  </MenuItem>
                ) : null}

                {!componentLoading &&
                  components.map((row) => (
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

        <ModifierAssignmentsPanel
          isMobile={isMobile}
          title="Grupos asignados al componente"
          addButtonText="Asignar grupo"
          emptyTitle="No hay grupos asignados"
          emptyMessage="Asigna tu primer grupo de modificadores a este componente."
          missingSelectionTitle={
            catalogEmpty
              ? "No hay productos compuestos con componentes"
              : !selectedProduct
                ? "Selecciona un producto compuesto"
                : "Selecciona un componente"
          }
          missingSelectionMessage={
            catalogEmpty
              ? noComponentProductsMessage
              : !selectedProduct
                ? "Primero elige un producto compuesto para consultar sus componentes."
                : "Elige el componente al que deseas asignar grupos de modificadores."
          }
          canAssign={
            !!selectedProduct &&
            !!selectedComponent &&
            groups.length > 0
          }
          hasSelection={
            !!selectedProduct &&
            !!selectedComponent
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

      <CompositeComponentModifierGroupUpsertModal
        open={modalOpen}
        onClose={closeModal}
        restaurantId={restaurantId}
        product={selectedProduct}
        component={selectedComponent}
        requiresBranch={needsBranchSelector}
        effectiveBranchId={effectiveBranchId}
        availableGroups={groups}
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