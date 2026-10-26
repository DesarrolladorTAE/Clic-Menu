//src/pages/public/public-menu-entry/menu-sets/MenuSetBuilderPage.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Snackbar } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { PillButton } from "../../publicMenu.ui";

import useMenuSetBuilder from "../../../../hooks/menu/menu-sets/useMenuSetBuilder";
import { normalizeMenuSet } from "../../../../hooks/menu/menu-sets/menuSet.utils";

import {
  createMenuSetNavigationKey,
  getMenuSetCart,
  getMenuSetDraft,
  getMenuSetReturnPath,
  saveMenuSetCart,
  saveMenuSetDraft,
  clearMenuSetDraft,
} from "../../../../hooks/menu/menu-sets/menuSetNavigationStore";

import MenuSetStageNavigation from "../../../../components/menu/shared/menu-sets/MenuSetStageNavigation";
import MenuSetStageContent from "../../../../components/menu/shared/menu-sets/MenuSetStageContent";
import MenuSetSummary from "../../../../components/menu/shared/menu-sets/MenuSetSummary";

function positiveId(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

function isValidColor(value) {
  return /^#[0-9A-Fa-f]{6}$/.test(String(value || ""));
}

function isSafeInternalPath(path) {
  return typeof path === "string"
    && path.startsWith("/")
    && !path.startsWith("//")
    && !path.includes("\\");
}

function resolveMenuSet(source) {
  if (!source || typeof source !== "object") return null;

  const normalized = Array.isArray(source.stages)
    && source.stages.some((stage) => stage?.stageDefinitionId !== undefined);

  return normalized ? source : normalizeMenuSet(source);
}

function getChannelFromContext(context) {
  if (context && typeof context === "object") {
    return String(context.channel || "").toLowerCase();
  }

  if (typeof context === "string" && context.startsWith("menu-set-navigation:")) {
    try {
      const data = JSON.parse(context.slice("menu-set-navigation:".length));
      return String(data?.channel || "").toLowerCase();
    } catch {
      return "";
    }
  }

  return "";
}

export default function MenuSetBuilderPage({
  menuSet = null,
  menuSets = [],
  menuSetId = null,
  navigationContext = null,
  contextKey = "",
  initialSelections = null,
  themeColor,
  canSelect = true,
  onBack,
  onConfirm,
  onAdded,
  onError,
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const [localError, setLocalError] = useState("");
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const completedRef = useRef(false);

  const routeState = location.state || {};
  const editCartKey = typeof routeState.editCartKey === "string"
    ? routeState.editCartKey.trim() : "";

  const requestedMenuSetId = positiveId(
    menuSetId ?? params.menuSetId ?? params.setId
    ?? routeState.menuSetId ?? routeState.menuSet?.id,
  );

  const context = navigationContext
    || routeState.navigationContext
    || routeState.menuSetNavigationContext
    || null;

  const navigationKey = useMemo(() => {
    if (typeof contextKey === "string" && contextKey.startsWith("menu-set-navigation:")) {
      return contextKey;
    }

    if (typeof context === "string" && context.startsWith("menu-set-navigation:")) {
      return context;
    }

    return createMenuSetNavigationKey(context);
  }, [context, contextKey]);

  const channel = String(
    getChannelFromContext(context)
    || getChannelFromContext(contextKey)
    || routeState.channel
    || "",
  ).toLowerCase();

  const isEmployeeFlow = channel === "mesero" || channel === "caja";
  const readOnly = !canSelect
    || routeState.canSelect === false
    || routeState.readOnly === true
    || channel === "vista_general";

  const selectionAllowed = !readOnly;

  const requestedColor = themeColor || routeState.themeColor || "";
  const color = isEmployeeFlow
    ? "#FF7A00"
    : isValidColor(requestedColor) ? requestedColor : "#FF7A00";

  const resolvedSet = useMemo(() => {
    const candidates = [
      menuSet,
      routeState.menuSet,
      ...(
        Array.isArray(menuSets) && menuSets.length > 0
          ? menuSets
          : Array.isArray(routeState.menuSets) ? routeState.menuSets : []
      ),
    ];

    const selected = candidates.find((candidate) => {
      const id = positiveId(candidate?.menu_set_id ?? candidate?.id);
      return id && (!requestedMenuSetId || id === requestedMenuSetId);
    });

    return resolveMenuSet(selected);
  }, [menuSet, menuSets, routeState.menuSet, routeState.menuSets, requestedMenuSetId]);

  const activeMenuSetId = positiveId(resolvedSet?.id);

  const savedDraft = useMemo(() => {
    if (readOnly) {
      return null;
    }

    const explicitSelections =
      initialSelections ||
      routeState.initialSelections ||
      null;

    /*
    * Al editar una partida, sus selecciones originales
    * tienen prioridad sobre cualquier borrador anterior
    * del mismo Conjunto.
    */
    if (editCartKey && explicitSelections) {
      return explicitSelections;
    }

    if (navigationKey && activeMenuSetId) {
      return (
        getMenuSetDraft(navigationKey, activeMenuSetId) ||
        explicitSelections
      );
    }

    return explicitSelections;
  }, [
    readOnly,
    editCartKey,
    navigationKey,
    activeMenuSetId,
    initialSelections,
    routeState.initialSelections,
  ]);

  const showError = useCallback((message, options = {}) => {
    const text = String(message || "No se pudo completar la operación.");

    if (typeof onError === "function") {
      onError(text, { ...options, duration: 3000 });
      return;
    }

    setLocalError(text);
  }, [onError]);

  const builder = useMenuSetBuilder({
    menuSet: resolvedSet,
    contextKey: navigationKey || contextKey || `conjunto:${activeMenuSetId || 0}`,
    initialSelections: savedDraft,
    readOnly,
    onError: showError,
  });

  useEffect(() => {
    const editingWithOriginalSelections = Boolean(
      editCartKey &&
      (initialSelections || routeState.initialSelections)
    );

    if (
      !selectionAllowed ||
      !navigationKey ||
      !builder.menuSetId ||
      completedRef.current ||
      editingWithOriginalSelections
    ) {
      return;
    }

    const result = saveMenuSetDraft(
      navigationKey,
      builder.exportDraft(),
    );

    if (!result?.ok) {
      // Se conserva la selección visible si falla el guardado temporal.
      return;
    }
  }, [
    selectionAllowed,
    navigationKey,
    editCartKey,
    initialSelections,
    routeState.initialSelections,
    builder.menuSetId,
    builder.currentStep,
    builder.selectionsByStage,
    builder.exportDraft,
  ]);

  const returnPath = useMemo(() => {
    const candidates = [
      routeState.returnPath,
      navigationKey ? getMenuSetReturnPath(navigationKey) : null,
    ];

    return candidates.find(isSafeInternalPath) || null;
  }, [routeState.returnPath, navigationKey]);

  const handleBack = useCallback(() => {
    if (savingRef.current) return;

    if (typeof onBack === "function") {
      onBack({
        menuSetId: activeMenuSetId,
        draft: readOnly ? null : builder.exportDraft(),
      });
      return;
    }

    if (returnPath) {
      navigate(returnPath);
      return;
    }

    navigate(-1);
  }, [onBack, activeMenuSetId, readOnly, builder.exportDraft, returnPath, navigate]);

  const handleConfirm = useCallback(async (result) => {
    if (!selectionAllowed || savingRef.current || !result?.ok) return;

    savingRef.current = true;
    setSaving(true);

    try {
      if (typeof onConfirm === "function") {
        const response = await onConfirm(result);

        if (response === false || response?.ok === false) {
          showError(response?.message || "No fue posible agregar el Conjunto al pedido.");
          return;
        }
      } else {
        if (!navigationKey) {
          showError("No se pudo identificar el pedido al que deseas agregar este Conjunto.");
          return;
        }

        const currentCart = getMenuSetCart(navigationKey) || [];

        if (editCartKey && !currentCart.some((item) =>
          item.key === editCartKey && Number(item.menu_set_id) === activeMenuSetId
        )) {
          showError("No se encontró la selección original que deseas modificar.");
          return;
        }

        const nextCart = editCartKey
          ? currentCart.map((item) =>
              item.key === editCartKey
                ? { ...result.cartLine, key: editCartKey }
                : item
            )
          : [...currentCart, result.cartLine];

        const saved = saveMenuSetCart(navigationKey, nextCart);

        if (!saved?.ok) {
          showError(saved?.message || "No fue posible guardar el Conjunto en tu pedido.");
          return;
        }
      }

      completedRef.current = true;

      if (navigationKey && activeMenuSetId) {
        clearMenuSetDraft(navigationKey, activeMenuSetId);
      }

      if (typeof onAdded === "function") {
        onAdded(result);
      }

      if (typeof onBack === "function") {
        onBack({ menuSetId: activeMenuSetId, added: true });
      } else if (returnPath) {
        navigate(returnPath);
      } else {
        navigate(-1);
      }
    } catch (error) {
      showError(error?.message || "No fue posible agregar el Conjunto al pedido.");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }, [
    selectionAllowed, onConfirm, navigationKey, activeMenuSetId,
    onAdded, onBack, returnPath, navigate, showError, editCartKey,
  ]);

  const closeError = (_event, reason) => {
    if (reason === "clickaway") return;
    setLocalError("");
  };

  if (!resolvedSet || !activeMenuSetId) {
    return (
      <div style={{
        minHeight: "100dvh", padding: "24px 12px",
        background: theme.palette.background.default,
        color: theme.palette.text.primary,
      }}>
        <div style={{
          maxWidth: 700, margin: "0 auto",
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 12, background: theme.palette.background.paper,
          padding: 20, display: "grid", gap: 12,
        }}>
          <strong style={{ fontSize: 18 }}>No se encontró el Conjunto</strong>
          <div style={{
            fontSize: 13, color: theme.palette.text.secondary, lineHeight: 1.5,
          }}>
            No se pudo recuperar la información del menú seleccionado.
            Regresa al catálogo para elegirlo nuevamente.
          </div>
          <div>
            <PillButton tone="default" onClick={handleBack}>
              Volver al menú
            </PillButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="cm-menu-set-builder-page"
      style={{
        "--cm-builder-color": color,
        "--cm-builder-border": alpha(color, 0.19),
        "--cm-builder-surface": theme.palette.background.paper,
        "--cm-builder-text": theme.palette.text.primary,
        "--cm-builder-muted": theme.palette.text.secondary,
        width: "100%",
        minWidth: 0,
        minHeight: "100dvh",
        height: "auto",
        paddingBottom: "max(32px, env(safe-area-inset-bottom))",
        background: `linear-gradient(180deg, ${alpha(color, 0.055)} 0%, ${theme.palette.background.default} 320px)`,
        color: theme.palette.text.primary,
      }}
    >
      <style>
        {`
          .cm-menu-set-builder-page,
          .cm-menu-set-builder-page * {
            box-sizing: border-box;
          }

          .cm-menu-set-builder-page {
            position: relative;
            overflow: visible;
          }

          .cm-menu-set-builder-inner {
            width: 100%;
            max-width: 1300px;
            min-width: 0;
            margin: 0 auto;
            padding: 16px clamp(10px, 3vw, 20px);
          }

          .cm-menu-set-builder-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 12px;
            margin-bottom: 14px;
          }

          .cm-menu-set-builder-back {
            display: inline-flex;
            align-items: center;
            gap: 9px;
            padding: 4px 0;
            border: 0;
            background: transparent;
            color: var(--cm-builder-text);
            font: inherit;
            font-weight: 850;
            font-size: 12.5px;
            cursor: pointer;
          }

          .cm-menu-set-builder-back-icon {
            width: 33px;
            height: 33px;
            display: grid;
            flex-shrink: 0;
            place-items: center;
            border-radius: 50%;
            background: var(--cm-builder-color);
            color: #FFFFFF;
          }

          .cm-menu-set-builder-back:focus-visible {
            outline: 2px solid var(--cm-builder-color);
            outline-offset: 3px;
            border-radius: 6px;
          }

          .cm-menu-set-builder-context {
            min-width: 0;
            font-size: 11.5px;
            color: var(--cm-builder-muted);
            text-align: right;
            line-height: 1.4;
          }

          .cm-menu-set-builder-block {
            width: 100%;
            min-width: 0;
          }

          @media (max-width: 767px) {
            .cm-menu-set-builder-inner {
              padding: 10px 9px max(28px, env(safe-area-inset-bottom));
            }

            .cm-menu-set-builder-top {
              flex-wrap: nowrap;
              gap: 8px;
              margin-bottom: 11px;
            }

            .cm-menu-set-builder-back {
              gap: 7px;
              font-size: 12px;
              flex-shrink: 0;
            }

            .cm-menu-set-builder-back-icon {
              width: 30px;
              height: 30px;
            }

            .cm-menu-set-builder-context {
              font-size: 10.5px;
              max-width: 52%;
            }
          }

          @media (max-width: 359px) {
            .cm-menu-set-builder-back { font-size: 11px; }
            .cm-menu-set-builder-context { font-size: 10px; }
          }
        `}
      </style>

      <div className="cm-menu-set-builder-inner">
        <div className="cm-menu-set-builder-top">
          <button
            type="button"
            className="cm-menu-set-builder-back"
            onClick={handleBack}
            disabled={saving}
          >
            <span className="cm-menu-set-builder-back-icon">
              <ArrowBackRoundedIcon sx={{ fontSize: 19 }} />
            </span>
            Volver al menú
          </button>

          <div className="cm-menu-set-builder-context">
            {builder.isSummaryStep
              ? readOnly ? "Vista general · Resumen" : "Revisa tu selección"
              : `${readOnly ? "Vista general" : "Personalizando tu menú"} · Etapa ${builder.currentStep + 1} de ${builder.stages.length}`}
          </div>
        </div>

        <div className="cm-menu-set-builder-block">
          <MenuSetStageNavigation
            builder={builder}
            themeColor={color}
            readOnly={readOnly}
            canSelect={selectionAllowed && !saving}
            showMobileControls={false}
            onBack={handleBack}
            onConfirm={selectionAllowed && !saving ? handleConfirm : undefined}
            confirmLabel={editCartKey ? "Guardar cambios" : "Agregar al pedido"}
            summaryContent={
              <MenuSetSummary
                builder={builder}
                themeColor={color}
                readOnly={readOnly}
                canSelect={selectionAllowed && !saving}
              />
            }
          >
            <MenuSetStageContent
              builder={builder}
              themeColor={color}
              canSelect={selectionAllowed && !saving}
              onError={showError}
            />
          </MenuSetStageNavigation>
        </div>
      </div>

      <Snackbar
        open={Boolean(localError)}
        autoHideDuration={3000}
        onClose={closeError}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="error"
          variant="filled"
          onClose={closeError}
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {localError}
        </Alert>
      </Snackbar>
    </div>
  );
}