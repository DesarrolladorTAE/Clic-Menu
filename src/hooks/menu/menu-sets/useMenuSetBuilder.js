//src/hooks/menu/menu-sets/useMenuSetBuilder.js
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getMenuSetOptionById,
  getMenuSetStageByDefinitionId,
  isMenuSetOptionSelectable,
  normalizeMenuSet,
} from "./menuSet.utils";

import {
  buildMenuSetCartLine,
  buildMenuSetSelectionPayload,
} from "./menuSetPayload.utils";

const ERROR_DURATION = 3000;

function positiveId(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

function getDefinitionId(stage) {
  return positiveId(stage?.stageDefinitionId ?? stage?.menu_set_stage_definition_id);
}

function getOptionId(option) {
  return positiveId(
    option?.menuSetProductId ?? option?.menu_set_product_id ?? option?.option_id,
  );
}

function getPreparedId(selection) {
  return positiveId(selection?.preparedItemId ?? selection?.prepared_item_id);
}

function normalizeDraftMap(menuSet, source) {
  const stages = Array.isArray(source)
    ? source
    : Array.isArray(source?.selections)
      ? source.selections
      : Array.isArray(source?.stages) ? source.stages : [];

  const map = {};

  (menuSet?.stages || []).forEach((stage) => {
    const definitionId = getDefinitionId(stage);
    if (!definitionId) return;

    const saved = stages.find((row) => getDefinitionId(row) === definitionId);
    const seen = new Set();
    const items = [];

    (Array.isArray(saved?.items) ? saved.items : []).forEach((item) => {
      const optionId = getOptionId(item);
      if (!optionId || seen.has(optionId)) return;

      const option = getMenuSetOptionById(stage, optionId);
      if (!option) return;

      seen.add(optionId);
      items.push({ ...item, menuSetProductId: optionId, quantity: 1 });
    });

    map[definitionId] = items;
  });

  return map;
}

function buildDraftStages(menuSet, selectionsByStage) {
  return (menuSet?.stages || []).map((stage) => ({
    stageDefinitionId: getDefinitionId(stage),
    items: selectionsByStage?.[getDefinitionId(stage)] || [],
  }));
}

function validateStage(stage, selectedItems) {
  const items = Array.isArray(selectedItems) ? selectedItems : [];
  const count = items.length;
  const min = stage?.minSelections;
  const max = stage?.maxSelections;
  const required = stage?.required === true;
  const name = String(stage?.name || "Esta etapa");

  if (!getDefinitionId(stage) || min === null || max === null || max < 1 || min > max) {
    return {
      valid: false,
      message: `No se pudo comprobar la configuración de "${name}".`,
      count, min, max, missing: 0,
    };
  }

  if (required && min < 1) {
    return {
      valid: false,
      message: `La etapa "${name}" no tiene una cantidad obligatoria válida.`,
      count, min, max, missing: 0,
    };
  }

  if (!required && min !== 0) {
    return {
      valid: false,
      message: `La etapa "${name}" no tiene una configuración opcional válida.`,
      count, min, max, missing: 0,
    };
  }

  const seen = new Set();

  for (const item of items) {
    const optionId = getOptionId(item);
    const option = getMenuSetOptionById(stage, optionId);

    if (!option || seen.has(optionId)) {
      return {
        valid: false,
        message: `Revisa los productos seleccionados en "${name}".`,
        count, min, max, missing: 0,
      };
    }

    seen.add(optionId);

    if (item.quantity !== undefined && Number(item.quantity) !== 1) {
      return {
        valid: false,
        message: "Cada producto del Conjunto representa una unidad.",
        count, min, max, missing: 0,
      };
    }

    if (!isMenuSetOptionSelectable(option, getPreparedId(item))) {
      const requiresPrepared = option?.availability?.requiresPreparedSelection;

      return {
        valid: false,
        message: requiresPrepared && !getPreparedId(item)
          ? `Selecciona una preparación disponible para "${option.name}".`
          : `"${option.name}" ya no está disponible con la selección actual.`,
        count, min, max, missing: 0,
      };
    }
  }

  if (count > max) {
    return {
      valid: false,
      message: `"${name}" permite máximo ${max} productos.`,
      count, min, max, missing: 0,
    };
  }

  const effectiveMin = required ? Math.max(1, min) : min;
  const missing = Math.max(0, effectiveMin - count);

  if (missing > 0) {
    return {
      valid: false,
      message: missing === 1
        ? `Selecciona 1 producto más en "${name}".`
        : `Selecciona ${missing} productos más en "${name}".`,
      count, min, max, missing,
    };
  }

  return {
    valid: true,
    message: "",
    count, min, max, missing: 0,
    skipped: !required && count === 0,
  };
}

export function useMenuSetBuilder({
  menuSet,
  contextKey = "",
  initialSelections = null,
  readOnly = false,
  onError = null,
} = {}) {
  const normalizedSet = useMemo(() => {
    if (!menuSet) return null;

    const alreadyNormalized = Array.isArray(menuSet.stages)
      && menuSet.stages.some((stage) => stage?.stageDefinitionId !== undefined);

    return alreadyNormalized ? menuSet : normalizeMenuSet(menuSet);
  }, [menuSet]);

  const menuSetId = positiveId(normalizedSet?.id);
  const stages = useMemo(() => normalizedSet?.stages || [], [normalizedSet]);

  const [selectionsByStage, setSelectionsByStage] = useState(() => {
    const initialSet = menuSet
      ? (menuSet.stages?.some((stage) => stage?.stageDefinitionId !== undefined)
          ? menuSet : normalizeMenuSet(menuSet))
      : null;

    return normalizeDraftMap(initialSet, readOnly ? null : initialSelections);
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");

  const selectionsRef = useRef(selectionsByStage);
  const sequenceRef = useRef(0);
  const errorTimerRef = useRef(null);

  const commitSelections = useCallback((next) => {
    selectionsRef.current = next;
    setSelectionsByStage(next);
  }, []);

  const clearError = useCallback(() => {
    if (errorTimerRef.current !== null) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }

    setError("");
  }, []);

  const reportError = useCallback((message) => {
    const finalMessage = String(message || "Revisa tu selección.");

    if (errorTimerRef.current !== null) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }

    if (typeof onError === "function") {
      setError("");
      onError(finalMessage, { duration: ERROR_DURATION });
    } else {
      setError(finalMessage);
      errorTimerRef.current = setTimeout(() => {
        setError("");
        errorTimerRef.current = null;
      }, ERROR_DURATION);
    }

    return { ok: false, message: finalMessage };
  }, [onError]);

  useEffect(() => {
    const next = normalizeDraftMap(normalizedSet, readOnly ? null : initialSelections);
    commitSelections(next);
    setCurrentStep(0);
    clearError();

    // Reiniciar al cambiar el Conjunto, el contexto o el modo de consulta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuSetId, contextKey, readOnly]);

  useEffect(() => {
    return () => {
      if (errorTimerRef.current !== null) clearTimeout(errorTimerRef.current);
    };
  }, []);

  const stageValidations = useMemo(() => {
    return stages.map((stage) => ({
      stageDefinitionId: getDefinitionId(stage),
      name: stage.name,
      required: stage.required,
      ...validateStage(stage, selectionsByStage[getDefinitionId(stage)] || []),
    }));
  }, [stages, selectionsByStage]);

  const selectedCount = useMemo(() => {
    return Object.values(selectionsByStage).reduce((total, items) => {
      return total + (Array.isArray(items) ? items.length : 0);
    }, 0);
  }, [selectionsByStage]);

  // Las validaciones comerciales siguen siendo obligatorias para realizar pedidos.
  const isComplete = Boolean(
    !readOnly
    && menuSetId
    && stages.length > 0
    && normalizedSet?.isActive !== false
    && normalizedSet?.isSellable !== false
    && selectedCount > 0
    && stageValidations.every((stage) => stage.valid),
  );

  const isSummaryStep = currentStep === stages.length && stages.length > 0;
  const currentStage = !isSummaryStep ? stages[currentStep] || null : null;
  const currentValidation = !isSummaryStep ? stageValidations[currentStep] || null : null;

  const selectOption = useCallback((stageDefinitionId, optionId, configuration = {}) => {
    if (readOnly) return { ok: false, message: "Esta vista es solo de consulta." };

    const stage = getMenuSetStageByDefinitionId(normalizedSet, stageDefinitionId);
    const option = getMenuSetOptionById(stage, optionId);

    if (!stage || !option) return reportError("No se encontró el producto seleccionado.");

    if (normalizedSet?.isActive === false || normalizedSet?.isSellable === false) {
      return reportError("Este Conjunto ya no está disponible.");
    }

    const definitionId = getDefinitionId(stage);
    const id = getOptionId(option);
    const current = selectionsRef.current[definitionId] || [];
    const alreadySelected = current.some((item) => getOptionId(item) === id);

    if (alreadySelected) {
      const next = {
        ...selectionsRef.current,
        [definitionId]: current.filter((item) => getOptionId(item) !== id),
      };

      commitSelections(next);
      clearError();
      return { ok: true, selected: false };
    }

    const preparedItemId = getPreparedId(configuration);

    if (!isMenuSetOptionSelectable(option, preparedItemId)) {
      const message = option.availability?.requiresPreparedSelection && !preparedItemId
        ? "Selecciona primero una preparación disponible."
        : option.availability?.reason || "Este producto no está disponible.";

      return reportError(message);
    }

    const max = stage.maxSelections;

    if (max === null || max < 1) {
      return reportError("No se pudo comprobar el límite de esta etapa.");
    }

    const selected = { ...configuration, menuSetProductId: id, quantity: 1 };

    if (preparedItemId !== null) {
      selected.prepared_item_id = preparedItemId;
      selected.variant_id = null;
      selected.variantId = null;
      selected.modifiers = [];
      selected.components = [];
    }

    let nextItems;

    if (max === 1) {
      nextItems = [selected];
    } else {
      if (current.length >= max) {
        return reportError(`Esta etapa permite máximo ${max} productos.`);
      }

      nextItems = [...current, selected];
    }

    commitSelections({
      ...selectionsRef.current,
      [definitionId]: nextItems,
    });

    clearError();
    return { ok: true, selected: true };
  }, [readOnly, normalizedSet, commitSelections, clearError, reportError]);

  const removeOption = useCallback((stageDefinitionId, optionId) => {
    if (readOnly) return false;

    const definitionId = positiveId(stageDefinitionId);
    const id = positiveId(optionId);

    if (!definitionId || !id) return false;

    const current = selectionsRef.current[definitionId] || [];

    commitSelections({
      ...selectionsRef.current,
      [definitionId]: current.filter((item) => getOptionId(item) !== id),
    });

    clearError();
    return true;
  }, [readOnly, commitSelections, clearError]);

  const configureOption = useCallback((stageDefinitionId, optionId, configuration = {}) => {
    if (readOnly) return { ok: false, message: "Esta vista es solo de consulta." };

    const stage = getMenuSetStageByDefinitionId(normalizedSet, stageDefinitionId);
    const option = getMenuSetOptionById(stage, optionId);

    if (!stage || !option) return reportError("No se encontró el producto.");

    const definitionId = getDefinitionId(stage);
    const id = getOptionId(option);
    const current = selectionsRef.current[definitionId] || [];
    const existing = current.find((item) => getOptionId(item) === id);

    if (!existing) return reportError("Selecciona primero el producto.");

    const updated = {
      ...existing,
      ...configuration,
      menuSetProductId: id,
      quantity: 1,
    };

    const preparedItemId = getPreparedId(updated);

    if (preparedItemId !== null) {
      updated.prepared_item_id = preparedItemId;
      updated.variant_id = null;
      updated.variantId = null;
      updated.modifiers = [];
      updated.components = [];
    }

    if (!isMenuSetOptionSelectable(option, preparedItemId)) {
      return reportError("La configuración elegida ya no está disponible.");
    }

    commitSelections({
      ...selectionsRef.current,
      [definitionId]: current.map((item) =>
        getOptionId(item) === id ? updated : item
      ),
    });

    clearError();
    return { ok: true };
  }, [readOnly, normalizedSet, commitSelections, clearError, reportError]);

  const goToStep = useCallback((requestedStep) => {
    const index = Number(requestedStep);

    if (!Number.isInteger(index) || index < 0 || index > stages.length) {
      return reportError("No se encontró la etapa solicitada.");
    }

    // La vista general recorre cualquier etapa y el resumen sin seleccionar.
    if (readOnly) {
      setCurrentStep(index);
      clearError();
      return { ok: true };
    }

    if (index > currentStep) {
      for (let i = 0; i < index; i++) {
        const validation = stageValidations[i];

        if (!validation?.valid) {
          setCurrentStep(i);
          return reportError(validation?.message || "Completa esta etapa para continuar.");
        }
      }
    }

    if (index === stages.length && !isComplete) {
      return reportError(
        selectedCount === 0
          ? "Selecciona al menos un producto para completar tu Conjunto."
          : "Revisa las etapas antes de continuar al resumen.",
      );
    }

    setCurrentStep(index);
    clearError();
    return { ok: true };
  }, [
    readOnly, stages.length, currentStep, stageValidations,
    isComplete, selectedCount, clearError, reportError,
  ]);

  const nextStep = useCallback(() => {
    return goToStep(Math.min(currentStep + 1, stages.length));
  }, [goToStep, currentStep, stages.length]);

  const previousStep = useCallback(() => {
    return goToStep(Math.max(0, currentStep - 1));
  }, [goToStep, currentStep]);

  const buildResult = useCallback(() => {
    if (readOnly) {
      return { ok: false, message: "Esta vista no permite agregar productos al pedido." };
    }

    if (!normalizedSet || !menuSetId) {
      return reportError("No se pudo identificar el Conjunto.");
    }

    if (!isComplete) {
      const invalidStage = stageValidations.find((stage) => !stage.valid);

      return reportError(
        invalidStage?.message ||
        (selectedCount === 0
          ? "Selecciona al menos un producto."
          : "Este Conjunto todavía no se puede completar."),
      );
    }

    try {
      const draftStages = buildDraftStages(normalizedSet, selectionsRef.current);

      const payload = buildMenuSetSelectionPayload({
        menuSetId,
        stages: draftStages,
      });

      sequenceRef.current += 1;

      const key = [
        "menu-set",
        menuSetId,
        Date.now(),
        sequenceRef.current,
      ].join(":");

      const cartLine = buildMenuSetCartLine({
        menuSet: normalizedSet,
        stages: draftStages,
        key,
      });

      clearError();

      return { ok: true, payload, cartLine };
    } catch (error) {
      return reportError(error?.message || "No se pudo preparar el Conjunto.");
    }
  }, [
    readOnly, normalizedSet, menuSetId, isComplete,
    stageValidations, selectedCount, clearError, reportError,
  ]);

  const exportDraft = useCallback(() => ({
    menuSetId,
    currentStep,
    selections: buildDraftStages(normalizedSet, selectionsRef.current),
  }), [menuSetId, currentStep, normalizedSet]);

  const restoreDraft = useCallback((draft) => {
    if (readOnly) {
      return { ok: false, message: "Esta vista es solo de consulta." };
    }

    if (positiveId(draft?.menuSetId) !== menuSetId) {
      return reportError("La selección guardada pertenece a otro Conjunto.");
    }

    commitSelections(normalizeDraftMap(normalizedSet, draft?.selections));

    const requestedStep = Number(draft?.currentStep ?? 0);

    setCurrentStep(
      Number.isInteger(requestedStep)
        ? Math.max(0, Math.min(stages.length, requestedStep))
        : 0,
    );

    clearError();
    return { ok: true };
  }, [
    readOnly, menuSetId, normalizedSet, stages.length,
    commitSelections, clearError, reportError,
  ]);

  const resetBuilder = useCallback(() => {
    commitSelections(normalizeDraftMap(normalizedSet, null));
    setCurrentStep(0);
    clearError();
  }, [normalizedSet, commitSelections, clearError]);

  return {
    menuSet: normalizedSet,
    menuSetId,
    stages,
    readOnly,
    selectionsByStage,
    stageValidations,
    selectedCount,
    currentStep,
    currentStage,
    currentValidation,
    isSummaryStep,
    isComplete,
    error,
    clearError,
    selectOption,
    removeOption,
    configureOption,
    goToStep,
    nextStep,
    previousStep,
    buildResult,
    exportDraft,
    restoreDraft,
    resetBuilder,
  };
}

export default useMenuSetBuilder;