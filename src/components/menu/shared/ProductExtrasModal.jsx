
import React, { useEffect, useMemo, useRef, useState } from "react";

import { Modal, PillButton } from "../../../pages/public/publicMenu.ui";
import { buildModifierContextSections } from "../../../hooks/public/publicMenu.utils";

import ProductExtrasReadOnlyNavigator from "./product-extras/ProductExtrasReadOnlyNavigator";
import ProductExtrasSelectionNavigator from "./product-extras/ProductExtrasSelectionNavigator";
import useProductExtrasSelection from "./product-extras/useProductExtrasSelection";
import { getSafeModifierThemeColor } from "./product-extras/ModifierCardShells";

export default function ProductExtrasModal({
  open,
  product,
  variantId = null,
  compositeDraft = null,
  initialValue = [],
  readOnly = false,
  themeColor,
  onClose,
  onConfirm,
  confirmLabel = "Continuar",
  selectionScope = "all",
}) {
  const safeThemeColor = getSafeModifierThemeColor(themeColor);

  const readOnlyNavigationRef = useRef(null);
  const selectionNavigationRef = useRef(null);

  const [readOnlyCanGoBack, setReadOnlyCanGoBack] = useState(false);
  const [selectionCanGoBack, setSelectionCanGoBack] = useState(false);

  const contextSections = useMemo(() => {
    return buildModifierContextSections(product, {
      variantId,
      compositeDraft,
      selectionScope,
    });
  }, [product, variantId, compositeDraft, selectionScope]);

  const selection = useProductExtrasSelection({
    open: open && !readOnly,
    product,
    contextSections,
    initialValue,
  });

  useEffect(() => {
    if (!open || !readOnly) {
      setReadOnlyCanGoBack(false);
    }

    if (!open || readOnly) {
      setSelectionCanGoBack(false);
    }
  }, [open, readOnly, product?.id]);

  if (!product) return null;

  const title = product?.display_name || product?.name || "Producto";

  const handleReadOnlyBack = () => {
    readOnlyNavigationRef.current?.goBack?.();
  };

  const handleSelectionBack = () => {
    selectionNavigationRef.current?.goBack?.();
  };

  const handleConfirm = () => {
    if (readOnly) {
      onClose?.();
      return;
    }

    const normalized = selection.buildResult();
    if (!normalized) return;

    onConfirm?.(normalized);
  };

  return (
    <Modal
      open={open}
      title={`Extras: ${title}`}
      onClose={onClose}
      width="min(760px, 96vw)"
      maxHeight="min(88vh, 920px)"
      bodyPadding={16}
      backdropBlur={false}
      fullScreenMobile
      contentStyle={{
        boxSizing: "border-box",
        minWidth: 0,
      }}
      bodyStyle={{
        background: "#F5F3F3",
        boxSizing: "border-box",
        minHeight: 0,
        minWidth: 0,
        overflowY: "auto",
        overflowX: "hidden",
        overscrollBehaviorY: "contain",
        WebkitOverflowScrolling: "touch",
      }}
      footerStyle={{
        boxSizing: "border-box",
        width: "100%",
        minWidth: 0,
      }}
      actions={
        <>
          {readOnly && readOnlyCanGoBack ? (
            <PillButton
              tone="default"
              onClick={handleReadOnlyBack}
              title="Regresar"
            >
              Regresar
            </PillButton>
          ) : null}

          {!readOnly && selectionCanGoBack ? (
            <PillButton
              tone="default"
              onClick={handleSelectionBack}
              title="Regresar"
            >
              Regresar
            </PillButton>
          ) : null}

          {!readOnly ? (
            <PillButton
              tone="default"
              onClick={onClose}
              title="Cancelar"
            >
              Cancelar
            </PillButton>
          ) : null}

          <PillButton
            tone={readOnly ? "soft" : "orange"}
            themeColor={safeThemeColor}
            onClick={handleConfirm}
            disabled={!readOnly && !selection.complianceSummary.isValid}
            title={
              readOnly
                ? "Cerrar vista de extras"
                : selection.complianceSummary.isValid
                  ? "Guardar configuración de extras"
                  : "Completa los grupos requeridos antes de continuar"
            }
          >
            {readOnly ? "Listo" : confirmLabel}
          </PillButton>
        </>
      }
    >
      <div
        style={{
          width: "100%",
          minWidth: 0,
          maxWidth: "100%",
          margin: 0,
          boxSizing: "border-box",
          padding: 16,
          border: "1px solid rgba(47,42,61,0.08)",
          borderRadius: 10,
          background: "#FFFFFF",
          boxShadow: "0 2px 10px rgba(0,0,0,0.035)",
        }}
      >
        {readOnly ? (
          <ProductExtrasReadOnlyNavigator
            product={product}
            sections={contextSections}
            themeColor={safeThemeColor}
            navigationRef={readOnlyNavigationRef}
            onCanGoBackChange={setReadOnlyCanGoBack}
          />
        ) : (
          <ProductExtrasSelectionNavigator
            product={product}
            sections={selection.sections}
            selectionMap={selection.selectionMap}
            sectionRequirementSummaries={selection.sectionRequirementSummaries}
            contextRequirementSummaries={selection.contextRequirementSummaries}
            errorMsg={selection.errorMsg}
            themeColor={safeThemeColor}
            navigationRef={selectionNavigationRef}
            onCanGoBackChange={setSelectionCanGoBack}
            onSelectOption={selection.handleSelectOption}
            onIncrementQty={selection.handleIncrementQty}
            onDecrementQty={selection.handleDecrementQty}
            onRemoveOption={selection.handleRemoveOption}
          />
        )}
      </div>
    </Modal>
  );
}