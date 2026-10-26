//src/components/menu/shared/menu-sets/MenuSetStageContent.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import { PillButton } from "../../../../pages/public/publicMenu.ui";
import { buildModifierContextSections } from "../../../../hooks/public/publicMenu.utils";
import { useCompositeDrafts } from "../../../../hooks/public/useCompositeDrafts";
import usePagination from "../../../../hooks/usePagination";
import PaginationFooter from "../../../common/PaginationFooter";

import CompositeProductModal from "../CompositeProductModal";
import ProductExtrasModal from "../ProductExtrasModal";
import ProductVariantsModal from "../ProductVariantsModal";
import MenuSetStageProductCard from "./MenuSetStageProductCard";
import MenuSetNotesModal from "./MenuSetNotesModal";

const PAGE_SIZE = 8;

function positiveId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function getOptionId(option) {
  return positiveId(option?.menuSetProductId ?? option?.menu_set_product_id ?? option?.id);
}

function getStageId(stage) {
  return positiveId(stage?.stageDefinitionId ?? stage?.menu_set_stage_definition_id);
}

function getSelectionId(selection) {
  return positiveId(selection?.menuSetProductId ?? selection?.menu_set_product_id ?? selection?.option_id);
}

function getSafeColor(theme, color) {
  if (/^#[0-9A-Fa-f]{6}$/.test(String(color || ""))) return color;
  return /^#[0-9A-Fa-f]{6}$/.test(theme.palette.primary.main)
    ? theme.palette.primary.main : "#FF7A00";
}

function getProductForOption(option, stageDefinitionId = null) {
  const original = option?.productSource || option?.source?.product || {};
  const source = option?.source || {};

  return {
    ...original,
    ...source,
    id: option?.productId,
    product_id: option?.productId,
    menu_set_product_id: option?.menuSetProductId ?? null,
    menu_set_stage_definition_id: stageDefinitionId,
    name: option?.name || original.name || "Producto",
    display_name: option?.name || original.display_name || original.name || "Producto",
    description: option?.description || original.description || "",
    product_type: option?.productType || original.product_type || "simple",
    image_url: option?.image || original.image_url || null,
    variants: Array.isArray(option?.variants) ? option.variants : [],
    modifier_groups: Array.isArray(option?.modifierGroups) ? option.modifierGroups : [],
    composite: option?.composite || original.composite || null,
  };
}

function collectComponentModifiers(components = [], result = []) {
  if (!Array.isArray(components)) return result;

  components.forEach((component) => {
    const groups = Array.isArray(component?.modifiers) ? component.modifiers : [];
    const componentId = positiveId(component?.component_product_id);
    const variantId = positiveId(component?.variant_id);

    groups.forEach((group) => {
      result.push({
        ...group,
        applies_to_level: "composite_component",
        component_product_id: componentId,
        component_variant_id: variantId,
      });
    });

    collectComponentModifiers(component?.components, result);
  });

  return result;
}

function applyComponentModifiers(components = [], groups = []) {
  if (!Array.isArray(components)) return [];

  return components.map((component) => {
    const componentId = positiveId(component?.component_product_id);
    const variantId = positiveId(component?.variant_id);

    const modifiers = groups.filter((group) => {
      return positiveId(group?.component_product_id) === componentId
        && positiveId(group?.component_variant_id) === variantId;
    });

    return {
      ...component,
      modifiers,
      ...(Array.isArray(component?.components)
        ? { components: applyComponentModifiers(component.components, groups) }
        : {}),
    };
  });
}

function hasModifierConfiguration(product, options = {}) {
  return buildModifierContextSections(product, options).length > 0;
}

export default function MenuSetStageContent({
  builder,
  stage = null,
  themeColor,
  canSelect = true,
  onError,
}) {
  const theme = useTheme();
  const color = getSafeColor(theme, themeColor);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const composite = useCompositeDrafts();

  const selectionAllowed = canSelect && builder?.readOnly !== true;
  const activeStage = stage || builder?.currentStage || null;
  const stageId = getStageId(activeStage);

  const options = useMemo(() => {
    return Array.isArray(activeStage?.options) ? activeStage.options : [];
  }, [activeStage]);

  const selectedItems = Array.isArray(builder?.selectionsByStage?.[stageId])
    ? builder.selectionsByStage[stageId] : [];

  const [flow, setFlow] = useState(null);
  const [activeDialog, setActiveDialog] = useState("");
  const [noteValue, setNoteValue] = useState("");

  const {
    page, nextPage, prevPage, total, totalPages,
    startItem, endItem, hasPrev, hasNext, paginatedItems,
  } = usePagination({
    items: options,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
    resetKey: `${builder?.menuSetId || 0}:${stageId || 0}`,
  });

  const closeDialog = useCallback(() => {
    setActiveDialog("");
    setFlow(null);
    setNoteValue("");
  }, []);

  useEffect(() => {
    if (!selectionAllowed && activeDialog) {
      closeDialog();
    }
  }, [selectionAllowed, activeDialog, closeDialog]);

  const reportError = useCallback((message) => {
    if (typeof onError === "function") {
      onError(message, { duration: 3000 });
    }
  }, [onError]);

  const saveSelection = useCallback((configuration = {}, activeFlow = flow) => {
    if (!selectionAllowed) return false;

    const optionId = getOptionId(activeFlow?.option);
    if (!stageId || !optionId || !builder) return false;

    const existing = builder.selectionsByStage?.[stageId]?.find(
      (item) => getSelectionId(item) === optionId,
    );

    const variantId = positiveId(configuration.variant_id ?? configuration.variantId);
    const nextConfiguration = {
      ...configuration,
      variant_id: variantId,
      variantId,
      notes: configuration.notes ?? existing?.notes ?? null,
      quantity: 1,
    };

    const result = existing
      ? builder.configureOption(stageId, optionId, nextConfiguration)
      : builder.selectOption(stageId, optionId, nextConfiguration);

    if (!result?.ok) return false;

    closeDialog();
    return true;
  }, [selectionAllowed, builder, stageId, flow, closeDialog]);

  const openModifiersOrSave = useCallback((nextFlow) => {
    if (!selectionAllowed) return;

    const existingVariantId = positiveId(
      nextFlow.existing?.variant_id ?? nextFlow.existing?.variantId,
    );
    const nextVariantId = positiveId(nextFlow.variantId);
    const sameVariant = existingVariantId === nextVariantId;

    const initialValue = sameVariant ? [
      ...(Array.isArray(nextFlow.existing?.modifiers) ? nextFlow.existing.modifiers : []),
      ...collectComponentModifiers(nextFlow.existing?.components || []),
    ] : [];

    if (hasModifierConfiguration(nextFlow.product, {
      variantId: nextFlow.variantId,
      compositeDraft: nextFlow.compositeDraft,
      selectionScope: nextFlow.selectionScope || "product_only",
    })) {
      setFlow({ ...nextFlow, initialModifiers: initialValue });
      setActiveDialog("extras");
      return;
    }

    saveSelection({
      variant_id: nextFlow.variantId || null,
      components: nextFlow.components || [],
      modifiers: [],
    }, nextFlow);
  }, [selectionAllowed, saveSelection]);

  const buildFlowForOption = useCallback((option) => {
    if (!selectionAllowed || !builder || !stageId) return null;

    const optionId = getOptionId(option);
    const product = getProductForOption(option, stageId);

    if (!optionId || !positiveId(product.id)) {
      reportError("No se pudo identificar el producto seleccionado.");
      return null;
    }

    const existing = selectedItems.find(
      (item) => getSelectionId(item) === optionId,
    ) || null;

    return {
      option,
      product,
      existing,
      variantId: positiveId(existing?.variant_id ?? existing?.variantId),
      components: Array.isArray(existing?.components) ? existing.components : [],
      compositeDraft: null,
      initialModifiers: [],
      selectionScope: "product_only",
    };
  }, [selectionAllowed, builder, stageId, selectedItems, reportError]);

  // Selecciona exclusivamente el producto original, sin abrir variantes.
  const beginSelection = useCallback((option) => {
    const nextFlow = buildFlowForOption(option);
    if (!nextFlow) return;

    setFlow(nextFlow);

    if (option?.availability?.requiresPreparedSelection === true) {
      setActiveDialog("prepared");
      return;
    }

    if (nextFlow.product.product_type === "composite") {
      composite.resetDraftForProduct?.(nextFlow.product);
      setActiveDialog("composite");
      return;
    }

    openModifiersOrSave({
      ...nextFlow,
      variantId: null,
      components: [],
      compositeDraft: null,
      selectionScope: "product_only",
    });
  }, [buildFlowForOption, composite, openModifiersOrSave]);

  // Abre las variantes solamente cuando se utiliza su botón independiente.
  const openVariantSelection = useCallback((option) => {
    const nextFlow = buildFlowForOption(option);
    if (!nextFlow) return;

    if (option?.availability?.requiresPreparedSelection === true) {
      reportError("Esta preparación conserva su configuración original.");
      return;
    }

    if (!Array.isArray(nextFlow.product.variants) || nextFlow.product.variants.length === 0) {
      reportError("Este producto no tiene variantes disponibles para consultar.");
      return;
    }

    setFlow({ ...nextFlow, selectionScope: "variant_only" });
    setActiveDialog("variants");
  }, [buildFlowForOption, reportError]);

  const handleVariantSelection = (_product, variant) => {
    if (!selectionAllowed) return;

    const variantId = positiveId(variant?.id);
    if (!flow || !variantId) return;

    setActiveDialog("");
    openModifiersOrSave({
      ...flow,
      variantId,
      components: [],
      compositeDraft: null,
      selectionScope: "variant_only",
    });
  };

  const handleCompositeConfirm = () => {
    if (!selectionAllowed || !flow?.product) return;

    const draft = composite.getOrInitCompositeDraft?.(flow.product) || [];
    const components = composite.buildSubmitComponentsFromProduct?.(flow.product) || [];

    if (!Array.isArray(components)) {
      reportError("No se pudo preparar la selección de componentes.");
      return;
    }

    setActiveDialog("");
    openModifiersOrSave({
      ...flow,
      variantId: null,
      components,
      compositeDraft: draft,
      selectionScope: "composite_only",
    });
  };

  const handleExtrasConfirm = (result) => {
    if (!selectionAllowed || !flow) return;

    const parentModifiers = Array.isArray(result?.parentModifiers)
      ? result.parentModifiers : [];
    const componentModifiers = Array.isArray(result?.componentModifiers)
      ? result.componentModifiers : [];

    const components = applyComponentModifiers(flow.components || [], componentModifiers);

    saveSelection({
      variant_id: flow.variantId || null,
      modifiers: parentModifiers,
      components,
    });
  };

  const handlePreparedSelection = (choice) => {
    if (!selectionAllowed) return;

    const preparedItemId = positiveId(choice?.preparedItemId);
    if (!preparedItemId) return;

    saveSelection({
      prepared_item_id: preparedItemId,
      variant_id: null,
      modifiers: [],
      components: [],
    });
  };

  const handleRemove = (option) => {
    if (!selectionAllowed || !stageId) return;

    builder?.removeOption?.(stageId, getOptionId(option));

    if (getOptionId(flow?.option) === getOptionId(option)) {
      closeDialog();
    }
  };

  const openNotes = (option, selection) => {
    if (!selectionAllowed) return;

    setFlow({ option, existing: selection });
    setNoteValue(String(selection?.notes || ""));
    setActiveDialog("notes");
  };

  const saveNotes = () => {
    if (!selectionAllowed || !flow) return;

    const result = builder?.configureOption?.(stageId, getOptionId(flow.option), {
      notes: noteValue.trim().slice(0, 500) || null,
    });

    if (result?.ok) closeDialog();
  };

  // Configura la opción ya elegida, respetando si es original o variante.
  const handleConfigureSelection = (option, selection) => {
    const selectedVariantId = positiveId(selection?.variant_id ?? selection?.variantId);

    if (selectedVariantId) {
      openVariantSelection(option);
      return;
    }

    beginSelection(option);
  };

  if (!activeStage) return null;

  const preparedChoices = Array.isArray(flow?.option?.availability?.preparedChoices)
    ? flow.option.availability.preparedChoices : [];

  return (
    <div className="cm-set-stage-content" style={{ width: "100%", minWidth: 0 }}>
      <style>
        {`
          .cm-set-stage-content,
          .cm-set-stage-content * {
            box-sizing: border-box;
          }

          .cm-set-stage-content {
            width: 100%;
            min-width: 0;
            max-width: 100%;
          }

          /*
           * Distribución fija:
           * Móvil: 1 columna.
           * Tableta: 2 columnas.
           * Escritorio: 4 columnas y hasta 2 filas por página.
           *
           * No se utiliza auto-fit ni auto-fill para evitar
           * que 1, 2 o 3 productos ocupen todo el ancho.
           */
          .cm-set-stage-content .cm-set-stage-products {
            display: grid;
            grid-template-columns: minmax(0, 1fr);
            gap: 12px;
            width: 100%;
            min-width: 0;
            max-width: 100%;
            align-items: stretch;
          }

          .cm-set-stage-content .cm-set-stage-products > * {
            min-width: 0;
            max-width: 100%;
          }

          .cm-set-stage-product-wrap {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            min-width: 0;
            max-width: 100%;
          }

          .cm-set-stage-content .cm-set-stage-pagination {
            margin-top: 15px;
            min-width: 0;
            overflow-x: auto;
          }

          @media (min-width: 640px) {
            .cm-set-stage-content .cm-set-stage-products {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          @media (min-width: 1200px) {
            .cm-set-stage-content .cm-set-stage-products {
              grid-template-columns: repeat(4, minmax(0, 1fr));
            }
          }

          @media (max-width: 639px) {
            .cm-set-stage-content .cm-set-stage-products {
              grid-template-columns: minmax(0, 1fr);
              gap: 10px;
            }
          }
        `}
      </style>

      {options.length > 0 ? (
        <div className="cm-set-stage-products">
          {paginatedItems.map((option) => {
            const optionId = getOptionId(option);
            const selection = selectedItems.find(
              (item) => getSelectionId(item) === optionId,
            ) || null;

            return (
              <div key={optionId} className="cm-set-stage-product-wrap">
                <MenuSetStageProductCard
                  option={option}
                  selection={selection}
                  selected={!!selection}
                  canSelect={selectionAllowed}
                  themeColor={color}
                  onSelect={selectionAllowed ? () => beginSelection(option) : undefined}
                  onRemove={selectionAllowed ? () => handleRemove(option) : undefined}
                  onOpenVariants={selectionAllowed ? () => openVariantSelection(option) : undefined}
                  onConfigure={selection && selectionAllowed
                    ? () => handleConfigureSelection(option, selection) : undefined}
                  onNotes={selection && selectionAllowed
                    ? () => openNotes(option, selection) : undefined}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{
          border: `1px solid ${alpha(color, 0.2)}`,
          borderRadius: 10,
          padding: 16,
          color: theme.palette.text.secondary,
          fontSize: 13,
        }}>
          Esta etapa no tiene productos disponibles para mostrar.
        </div>
      )}

      {totalPages > 1 ? (
        <div className="cm-set-stage-pagination">
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
        </div>
      ) : null}

      <ProductVariantsModal
        open={selectionAllowed && activeDialog === "variants"}
        product={flow?.product || null}
        canSelect={selectionAllowed}
        showSelectBtn={selectionAllowed}
        onClose={closeDialog}
        onAddVariant={handleVariantSelection}
      />

      <CompositeProductModal
        open={selectionAllowed && activeDialog === "composite"}
        product={flow?.product || null}
        draft={flow?.product ? composite.getOrInitCompositeDraft?.(flow.product) || [] : []}
        onClose={closeDialog}
        onToggleIncluded={(componentId, included) => {
          if (!selectionAllowed || !flow?.product) return;
          composite.setDraftIncluded?.(Number(flow.product.id), componentId, included);
        }}
        onVariantChange={(componentId, variantId) => {
          if (!selectionAllowed || !flow?.product) return;
          composite.setDraftVariant?.(Number(flow.product.id), componentId, variantId);
        }}
        onConfirm={handleCompositeConfirm}
        confirmLabel="Continuar"
      />

      <ProductExtrasModal
        open={selectionAllowed && activeDialog === "extras"}
        product={flow?.product || null}
        variantId={flow?.variantId || null}
        compositeDraft={flow?.compositeDraft || null}
        initialValue={flow?.initialModifiers || []}
        selectionScope={flow?.selectionScope || "all"}
        themeColor={color}
        readOnly={!selectionAllowed}
        onClose={closeDialog}
        onConfirm={handleExtrasConfirm}
        confirmLabel="Guardar selección"
      />

      <Dialog
        open={selectionAllowed && activeDialog === "prepared"}
        onClose={closeDialog}
        fullWidth
        fullScreen={isMobile}
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 2,
            border: `1px solid ${alpha(color, 0.2)}`,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 900 }}>
          Elegir preparación disponible
        </DialogTitle>

        <DialogContent dividers>
          <div style={{
            fontSize: 13,
            color: theme.palette.text.secondary,
            marginBottom: 12,
          }}>
            Este producto puede elegirse entre las unidades que ya están preparadas.
            Cada unidad conserva su configuración original.
          </div>

          <div style={{ display: "grid", gap: 9 }}>
            {preparedChoices.map((choice, index) => (
              <div key={choice.preparedItemId} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
                padding: 11,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 10,
              }}>
                <span style={{ fontSize: 13, fontWeight: 800 }}>
                  Preparación disponible {index + 1}
                </span>

                <PillButton
                  tone="orange"
                  themeColor={color}
                  onClick={() => handlePreparedSelection(choice)}
                >
                  Elegir
                </PillButton>
              </div>
            ))}

          </div>

          {preparedChoices.length === 0 ? (
            <div style={{ fontSize: 13, color: theme.palette.text.secondary }}>
              Ya no hay preparaciones disponibles para elegir.
            </div>
          ) : null}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <PillButton tone="default" onClick={closeDialog}>Cerrar</PillButton>
        </DialogActions>
      </Dialog>

      <MenuSetNotesModal
        open={selectionAllowed && activeDialog === "notes"}
        productName={flow?.option?.name || ""}
        value={noteValue}
        onChange={setNoteValue}
        onClose={closeDialog}
        onSave={saveNotes}
        themeColor={color}
        readOnly={!selectionAllowed}
      />
    </div>
  );
}