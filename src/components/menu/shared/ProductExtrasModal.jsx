//src/components/menu/shared/ProductExtrasModal.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

import { Modal, PillButton } from "../../../pages/public/publicMenu.ui";
import {
  buildModifierContextSections,
} from "../../../hooks/public/publicMenu.utils";

import ProductExtrasReadOnlyNavigator from "./product-extras/ProductExtrasReadOnlyNavigator";
import ProductExtrasSelectionNavigator from "./product-extras/ProductExtrasSelectionNavigator";
import useProductExtrasSelection from "./product-extras/useProductExtrasSelection";

import {
  getSafeModifierThemeColor,
} from "./product-extras/ModifierCardShells";

const MOBILE_BREAKPOINT = 600;

function useIsMobileViewport() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const handleChange = (event) => {
      setIsMobile(event.matches);
    };

    setIsMobile(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);

      return () => {
        mediaQuery.removeEventListener("change", handleChange);
      };
    }

    mediaQuery.addListener(handleChange);

    return () => {
      mediaQuery.removeListener(handleChange);
    };
  }, []);

  return isMobile;
}

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
  const isMobileViewport = useIsMobileViewport();

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

  if (!product) {
    return null;
  }

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

    if (!normalized) {
      return;
    }

    onConfirm?.(normalized);
  };

  return (
    <Modal
      open={open}
      title={`Extras: ${title}`}
      onClose={onClose}
      width={isMobileViewport ? "100vw" : "920px"}
      maxHeight={isMobileViewport ? "100dvh" : "650px"}
      bodyPadding={0}
      backdropBlur={false}
      fullScreenMobile
      contentStyle={{
        borderRadius: isMobileViewport ? 0 : 18,
        width: isMobileViewport ? "100vw" : "920px",
        maxWidth: isMobileViewport ? "100vw" : "920px",
        height: isMobileViewport ? "100dvh" : "650px",
        minHeight: isMobileViewport ? "100dvh" : "650px",
        maxHeight: isMobileViewport ? "100dvh" : "650px",
        margin: 0,
        boxSizing: "border-box",
      }}
      bodyStyle={{
        background: "#F5F3F3",
        boxSizing: "border-box",
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
          width: "calc(100% - 32px)",
          minWidth: 0,
          maxWidth: "calc(100% - 32px)",
          minHeight: "calc(100% - 16px)",
          margin: "0 16px 16px",
          boxSizing: "border-box",
          padding: 16,
          border: "1px solid rgba(47,42,61,0.08)",
          borderTop: "none",
          borderRadius: "0 0 10px 10px",
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