//src/components/menu/shared/product-extras/useProductExtrasSelection.js
import { useEffect, useMemo, useState } from "react";

import {
  buildModifierDisplayGroupsFromApiGroups,
  formatModifierOptionRepeatInstruction,
  getPublicAvailabilityPresentation,
  isAvailabilityBlocked,
} from "../../../../hooks/public/publicMenu.utils";

import {
  buildContextRequirementSummary,
  buildSectionRequirementSummary,
  getGroupMinimumRequirement,
  getSectionNavigationKey,
} from "./ProductExtrasNavigationShared";

export function makeGroupSelectionKey(section, group) {
  const componentProductId = Number(section?.component?.component_product_id || 0);
  const componentVariantId = Number(section?.option?.variant_id || 0);
  const variantId = Number(section?.variant?.id || 0);

  return [
    section?.context_type || "product",
    Number(group?.id || 0),
    componentProductId || 0,
    componentVariantId || 0,
    variantId || 0,
  ].join("|");
}

export function buildPreparedSections(product, sections) {
  const title = product?.display_name || product?.name || "Producto";

  return (Array.isArray(sections) ? sections : []).map((section) => {
    const contextSource =
      section?.context_type === "variant"
        ? "variant"
        : section?.context_type === "component"
          ? "component"
          : section?.context_type === "component_variant"
            ? "component_variant"
            : "product";

    const appliesToLevel =
      section?.context_type === "component" ||
      section?.context_type === "component_variant"
        ? "composite_component"
        : "order_item";

    const contextLabel = section?.subtitle || title;

    const componentProductId =
      section?.context_type === "component" ||
      section?.context_type === "component_variant"
        ? Number(section?.component?.component_product_id || 0) || null
        : null;

    const componentVariantId =
      section?.context_type === "component_variant"
        ? Number(section?.option?.variant_id || 0) || null
        : null;

    return {
      ...section,
      groups: (Array.isArray(section?.groups) ? section.groups : []).map((group) => ({
        ...group,
        __selection_key: makeGroupSelectionKey(section, group),
        __context_source: contextSource,
        __applies_to_level: appliesToLevel,
        __context_label: contextLabel,
        __component_product_id: componentProductId,
        __component_variant_id: componentVariantId,
      })),
    };
  });
}

export function countDistinctSelectedOptions(selectedMapForGroup) {
  return Object.values(selectedMapForGroup || {}).filter(
    (qty) => Number(qty || 0) > 0,
  ).length;
}

export function countTotalSelectedUnits(selectedMapForGroup) {
  return Object.values(selectedMapForGroup || {}).reduce(
    (sum, qty) => sum + Math.max(0, Number(qty || 0)),
    0,
  );
}

export function getGroupMinSelect(group) {
  return getGroupMinimumRequirement(group);
}

export function getGroupMaxSelect(group) {
  if (
    group?.max_select === null ||
    group?.max_select === undefined ||
    group?.max_select === ""
  ) {
    return null;
  }

  const max = Number(group.max_select);

  if (!Number.isFinite(max)) {
    return null;
  }

  return Math.max(0, Math.floor(max));
}

export function getGroupCompliance(group, selected) {
  const totalUnits = countTotalSelectedUnits(selected);
  const distinctOptions = countDistinctSelectedOptions(selected);
  const min = getGroupMinSelect(group);
  const max = getGroupMaxSelect(group);
  const mode = String(group?.selection_mode || "").trim().toLowerCase();

  const missingUnits = Math.max(0, min - totalUnits);
  const exceedsMax = max !== null && totalUnits > max;
  const violatesSingle = mode === "single" && distinctOptions > 1;
  const hasRequirement = min > 0;

  let status = "optional";
  let label = "○ Opcional";

  if (missingUnits > 0) {
    status = "required";
    label =
      missingUnits === 1
        ? "Falta 1 selección"
        : `Faltan ${missingUnits} selecciones`;
  } else if (exceedsMax) {
    status = "required";
    label = `! Máximo ${max}`;
  } else if (violatesSingle) {
    status = "required";
    label = "! Solo una opción distinta";
  } else if (hasRequirement || totalUnits > 0) {
    status = "completed";
    label = "✓ Completado";
  }

  return {
    status,
    label,
    min,
    max,
    totalUnits,
    distinctOptions,
    missingUnits,
    hasRequirement,
    isValid: missingUnits <= 0 && !exceedsMax && !violatesSingle,
  };
}

export function buildInitialSelectionMap(initialValue, preparedSections) {
  const groups = Array.isArray(initialValue) ? initialValue : [];
  const map = {};

  preparedSections
    .flatMap((section) => section.groups || [])
    .forEach((preparedGroup) => {
      const match = groups.find((group) => {
        return (
          Number(group?.modifier_group_id || group?.id || 0) ===
            Number(preparedGroup?.id || 0) &&
          String(group?.applies_to_level || "order_item") ===
            String(preparedGroup?.__applies_to_level || "order_item") &&
          Number(group?.component_product_id || 0) ===
            Number(preparedGroup?.__component_product_id || 0) &&
          Number(group?.component_variant_id || 0) ===
            Number(preparedGroup?.__component_variant_id || 0)
        );
      });

      if (!match) {
        return;
      }

      const optionMap = {};

      (Array.isArray(match?.options) ? match.options : []).forEach((option) => {
        const optionId = Number(option?.modifier_option_id || option?.id || 0);
        const quantity = Number(option?.quantity || 0);

        if (optionId > 0 && quantity > 0) {
          optionMap[optionId] = quantity;
        }
      });

      if (Object.keys(optionMap).length > 0) {
        map[preparedGroup.__selection_key] = optionMap;
      }
    });

  return map;
}

export function normalizeSelectionForResult(preparedSections, selectionMap) {
  const normalized = [];

  preparedSections
    .flatMap((section) => section.groups || [])
    .forEach((group) => {
      const selected = selectionMap?.[group.__selection_key] || {};
      const options = Array.isArray(group?.options) ? group.options : [];

      const normalizedOptions = options
        .map((option) => {
          const optionId = Number(option?.id || 0);
          const quantity = Number(selected?.[optionId] || 0);

          if (!optionId || quantity <= 0) {
            return null;
          }

          const unitPrice = Number(option?.price || 0);
          const affectsTotal = !!option?.affects_total;
          const totalPrice = affectsTotal ? unitPrice * quantity : 0;

          return {
            id: optionId,
            modifier_group_id: Number(group?.id || 0),
            modifier_option_id: optionId,
            name: String(option?.name || "Extra"),
            name_snapshot: String(option?.name || "Extra"),
            quantity,
            unit_price: unitPrice,
            total_price: Math.round(totalPrice * 100) / 100,
            affects_total: affectsTotal,
            description_snapshot: option?.description || null,
            meta: {
              track_inventory: !!option?.track_inventory,
              is_default: !!option?.is_default,
              max_quantity_per_selection: Number(
                option?.max_quantity_per_selection || 1,
              ),
              availability: option?.availability || null,
              is_available:
                typeof option?.is_available === "boolean"
                  ? option.is_available
                  : true,
              availability_label: option?.availability_label || null,
            },
          };
        })
        .filter(Boolean);

      if (!normalizedOptions.length) {
        return;
      }

      normalized.push({
        id: Number(group?.id || 0),
        modifier_group_id: Number(group?.id || 0),
        applies_to_level: String(group?.__applies_to_level || "order_item"),
        component_product_id: group?.__component_product_id || null,
        component_variant_id: group?.__component_variant_id || null,
        group_name_snapshot: String(group?.name || "Extras"),
        context_source: String(group?.__context_source || "product"),
        context_label: String(group?.__context_label || ""),
        group_description_snapshot: group?.description || null,
        selection_mode: String(group?.selection_mode || ""),
        is_required: !!group?.is_required,
        min_select: Number(group?.min_select || 0),
        max_select:
          group?.max_select === null ||
          group?.max_select === undefined ||
          group?.max_select === ""
            ? null
            : Number(group.max_select),
        options: normalizedOptions,
      });
    });

  const parentModifiers = normalized.filter(
    (group) => String(group.applies_to_level) === "order_item",
  );

  const componentModifiers = normalized.filter(
    (group) => String(group.applies_to_level) === "composite_component",
  );

  const total = normalized.reduce((acc, group) => {
    return (
      acc +
      (Array.isArray(group?.options) ? group.options : []).reduce(
        (sum, option) => sum + Number(option?.total_price || 0),
        0,
      )
    );
  }, 0);

  return {
    parentModifiers,
    componentModifiers,
    parentDisplayGroups: buildModifierDisplayGroupsFromApiGroups(parentModifiers),
    componentDisplayGroups:
      buildModifierDisplayGroupsFromApiGroups(componentModifiers),
    total: Math.round(total * 100) / 100,
  };
}

export function validatePreparedSections(preparedSections, selectionMap) {
  const errors = [];

  preparedSections.forEach((section) => {
    (Array.isArray(section?.groups) ? section.groups : []).forEach((group) => {
      const selected = selectionMap?.[group.__selection_key] || {};
      const compliance = getGroupCompliance(group, selected);

      if (compliance.missingUnits > 0) {
        errors.push(
          compliance.missingUnits === 1
            ? `El grupo "${group?.name || "Extras"}" requiere 1 selección más.`
            : `El grupo "${group?.name || "Extras"}" requiere ${compliance.missingUnits} selecciones más.`,
        );
        return;
      }

      if (compliance.max !== null && compliance.totalUnits > compliance.max) {
        errors.push(
          `El grupo "${group?.name || "Extras"}" permite máximo ${compliance.max} selecciones.`,
        );
        return;
      }

      if (
        String(group?.selection_mode || "").toLowerCase() === "single" &&
        compliance.distinctOptions > 1
      ) {
        errors.push(
          `El grupo "${group?.name || "Extras"}" permite únicamente una opción distinta.`,
        );
      }
    });
  });

  return errors;
}

export function getOptionQuantityLimit(option) {
  const configuredValue = Number(option?.max_quantity_per_selection || 1);

  const configuredMax = Number.isFinite(configuredValue)
    ? Math.max(1, Math.floor(configuredValue))
    : 1;

  const availabilityMaxRaw = option?.availability?.max_available_qty;

  const hasAvailabilityMax =
    availabilityMaxRaw !== null &&
    availabilityMaxRaw !== undefined &&
    availabilityMaxRaw !== "" &&
    Number.isFinite(Number(availabilityMaxRaw));

  const availabilityMax = hasAvailabilityMax
    ? Math.max(0, Math.floor(Number(availabilityMaxRaw)))
    : null;

  return {
    configuredMax,
    availabilityMax,
    effectiveMax:
      availabilityMax === null
        ? configuredMax
        : Math.min(configuredMax, availabilityMax),
  };
}

export function getAvailabilityUi(option) {
  const availability =
    option?.availability &&
    typeof option.availability === "object" &&
    !Array.isArray(option.availability)
      ? option.availability
      : null;

  const status = String(
    availability?.status || option?.availability_label || "available",
  )
    .trim()
    .toLowerCase();

  const maxQty = availability?.max_available_qty ?? null;
  const explicitlyUnavailable = option?.is_available === false;

  const blockedByBackend = availability
    ? isAvailabilityBlocked(availability)
    : !["available", "disponible"].includes(status);

  const hasZeroAvailability =
    maxQty !== null &&
    maxQty !== undefined &&
    maxQty !== "" &&
    Number.isFinite(Number(maxQty)) &&
    Number(maxQty) <= 0;

  const isAvailable =
    !explicitlyUnavailable &&
    !blockedByBackend &&
    !hasZeroAvailability;

  const presentation = availability
    ? getPublicAvailabilityPresentation(availability)
    : null;

  const fallbackLabels = {
    agotado: "Agotado",
    out_of_stock: "Agotado",
    stock_insuficiente: "Disponibilidad limitada",
    insufficient_stock: "Disponibilidad limitada",
    unavailable_by_schedule: "No disponible por horario",
  };

  const presentationLabel =
    !["available", "disponible"].includes(status)
      ? presentation?.label
      : "";

  const label = isAvailable
    ? presentation?.label || "Disponible"
    : presentationLabel || fallbackLabels[status] || "No disponible";

  const caption = isAvailable
    ? presentation?.caption || label
    : (!["available", "disponible"].includes(status)
        ? presentation?.caption
        : "") || label;

  const limited = ["insufficient_stock", "stock_insuficiente"].includes(status);

  const colors = isAvailable
    ? {
        bg: "#E7F7ED",
        color: "#147A48",
        border: "#A7DCC0",
      }
    : limited
      ? {
          bg: "#FFF2DD",
          color: "#A65E00",
          border: "#F2C98D",
        }
      : {
          bg: "#FDE9E8",
          color: "#B42318",
          border: "#F2B8B5",
        };

  return {
    isAvailable,
    status,
    label,
    caption,
    maxQty,
    ...colors,
  };
}

export function getOptionSelectionState(group, option, selected) {
  const optionId = Number(option?.id || 0);
  const currentQty = Number(selected?.[optionId] || 0);
  const groupTotal = countTotalSelectedUnits(selected);
  const groupMax = getGroupMaxSelect(group);
  const mode = String(group?.selection_mode || "").toLowerCase();

  const availability = getAvailabilityUi(option);
  const quantityLimit = getOptionQuantityLimit(option);

  const groupRemaining =
    groupMax === null
      ? Number.POSITIVE_INFINITY
      : Math.max(0, groupMax - groupTotal);

  const canSelectSingle =
    mode === "single" &&
    (groupMax === null || groupMax >= 1);

  const canSelectMultiple =
    mode !== "single" &&
    groupRemaining >= 1;

  const canSelect =
    optionId > 0 &&
    availability.isAvailable &&
    quantityLimit.effectiveMax >= 1 &&
    (canSelectSingle || canSelectMultiple);

  const canIncrement =
    optionId > 0 &&
    currentQty > 0 &&
    availability.isAvailable &&
    currentQty < quantityLimit.effectiveMax &&
    groupRemaining >= 1;

  const maxReachableQty =
    groupRemaining === Number.POSITIVE_INFINITY
      ? quantityLimit.effectiveMax
      : Math.min(
          quantityLimit.effectiveMax,
          currentQty + groupRemaining,
        );

  return {
    currentQty,
    groupTotal,
    groupMax,
    groupRemaining,
    availability,
    quantityLimit,
    canSelect,
    canIncrement,
    maxReachableQty,
  };
}

export function getDynamicOptionRepeatInstruction(group, option, state) {
  const baseRepeatInstruction = formatModifierOptionRepeatInstruction(option, group);

  if (!baseRepeatInstruction || !state?.availability?.isAvailable) {
    return "";
  }

  const currentQty = Math.max(0, Number(state?.currentQty || 0));
  const optionMax = Math.max(0, Number(state?.quantityLimit?.effectiveMax || 0));
  const mode = String(group?.selection_mode || "").trim().toLowerCase();

  if (optionMax <= 1) {
    return "";
  }

  if (currentQty > 0) {
    const optionRemaining = Math.max(0, optionMax - currentQty);

    const availableToAdd =
      state.groupRemaining === Number.POSITIVE_INFINITY
        ? optionRemaining
        : Math.min(optionRemaining, Math.max(0, state.groupRemaining));

    if (availableToAdd <= 0) {
      return "";
    }

    if (availableToAdd === 1) {
      return "Puedes agregar 1 más.";
    }

    return `Puedes agregar hasta ${availableToAdd} más.`;
  }

  let availableToChoose;

  if (mode === "single" && state.groupTotal > 0) {
    availableToChoose =
      state.groupMax === null
        ? optionMax
        : Math.min(optionMax, Math.max(0, state.groupMax));
  } else {
    availableToChoose =
      state.groupRemaining === Number.POSITIVE_INFINITY
        ? optionMax
        : Math.min(optionMax, Math.max(0, state.groupRemaining));
  }

  if (availableToChoose <= 0) {
    return "";
  }

  if (availableToChoose === 1) {
    return "Puedes elegir esta opción 1 vez.";
  }

  return `Puedes elegir esta opción hasta ${availableToChoose} veces.`;
}

export default function useProductExtrasSelection({
  open,
  product,
  contextSections = [],
  initialValue = [],
}) {
  const [selectionMap, setSelectionMap] = useState({});
  const [errorMsg, setErrorMsg] = useState("");

  const sections = useMemo(() => {
    return buildPreparedSections(product, contextSections);
  }, [product, contextSections]);

  const flatGroups = useMemo(() => {
    return sections.flatMap((section) =>
      (Array.isArray(section?.groups) ? section.groups : []).map((group) => ({
        sectionKey: section?.key || "section",
        sectionTitle: section?.title || "Extras",
        sectionSubtitle: section?.subtitle || "",
        section,
        group,
      })),
    );
  }, [sections]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setSelectionMap(buildInitialSelectionMap(initialValue, sections));
    setErrorMsg("");
  }, [open, initialValue, sections]);

  const complianceSummary = useMemo(() => {
    const rows = flatGroups.map(({ group }) => {
      const selected = selectionMap?.[group.__selection_key] || {};
      return getGroupCompliance(group, selected);
    });

    const invalidCount = rows.filter((row) => !row.isValid).length;
    const completedCount = rows.filter(
      (row) => row.status === "completed",
    ).length;

    return {
      total: rows.length,
      invalidCount,
      completedCount,
      isValid: invalidCount === 0,
    };
  }, [flatGroups, selectionMap]);

  const sectionRequirementSummaries = useMemo(() => {
    const summaries = {};

    sections.forEach((section, index) => {
      const key = getSectionNavigationKey(section, index);

      summaries[key] = buildSectionRequirementSummary(section, {
        selectionMap,
        getCompliance: getGroupCompliance,
      });
    });

    return summaries;
  }, [sections, selectionMap]);

  const contextRequirementSummaries = useMemo(() => {
    const grouped = {};

    sections.forEach((section) => {
      const type = String(section?.context_type || "product");

      if (!grouped[type]) {
        grouped[type] = [];
      }

      grouped[type].push(section);
    });

    const summaries = {};

    Object.entries(grouped).forEach(([type, contextRows]) => {
      summaries[type] = buildContextRequirementSummary(contextRows, {
        selectionMap,
        getCompliance: getGroupCompliance,
      });
    });

    return summaries;
  }, [sections, selectionMap]);

  const updateGroupMap = (group, nextOptionMap) => {
    setSelectionMap((previous) => ({
      ...previous,
      [group.__selection_key]: nextOptionMap,
    }));

    setErrorMsg("");
  };

  const handleSelectOption = (group, option) => {
    const optionId = Number(option?.id || 0);

    if (!optionId) {
      return;
    }

    const current = {
      ...(selectionMap?.[group.__selection_key] || {}),
    };

    const mode = String(group?.selection_mode || "").toLowerCase();
    const state = getOptionSelectionState(group, option, current);

    if (!state.canSelect) {
      return;
    }

    if (mode === "single") {
      updateGroupMap(group, {
        [optionId]: 1,
      });
      return;
    }

    current[optionId] = 1;
    updateGroupMap(group, current);
  };

  const handleIncrementQty = (group, option) => {
    const optionId = Number(option?.id || 0);

    if (!optionId) {
      return;
    }

    const current = {
      ...(selectionMap?.[group.__selection_key] || {}),
    };

    const state = getOptionSelectionState(group, option, current);
    const mode = String(group?.selection_mode || "").toLowerCase();
    const currentQty = Number(current?.[optionId] || 0);

    if (
      !state.availability.isAvailable ||
      state.quantityLimit.effectiveMax < 1
    ) {
      return;
    }

    if (currentQty <= 0) {
      if (!state.canSelect) {
        return;
      }

      if (mode === "single") {
        updateGroupMap(group, {
          [optionId]: 1,
        });
        return;
      }

      current[optionId] = 1;
      updateGroupMap(group, current);
      return;
    }

    if (!state.canIncrement) {
      return;
    }

    const nextQty = Math.min(
      currentQty + 1,
      state.maxReachableQty,
      state.quantityLimit.effectiveMax,
    );

    if (nextQty <= currentQty) {
      return;
    }

    current[optionId] = nextQty;
    updateGroupMap(group, current);
  };

  const handleDecrementQty = (group, option) => {
    const optionId = Number(option?.id || 0);

    if (!optionId) {
      return;
    }

    const current = {
      ...(selectionMap?.[group.__selection_key] || {}),
    };

    const nextQty = Math.max(
      0,
      Number(current?.[optionId] || 0) - 1,
    );

    if (nextQty <= 0) {
      delete current[optionId];
    } else {
      current[optionId] = nextQty;
    }

    updateGroupMap(group, current);
  };

  const handleRemoveOption = (group, option) => {
    const optionId = Number(option?.id || 0);

    if (!optionId) {
      return;
    }

    const current = {
      ...(selectionMap?.[group.__selection_key] || {}),
    };

    delete current[optionId];
    updateGroupMap(group, current);
  };

  const buildResult = () => {
    for (const section of sections) {
      const groups = Array.isArray(section?.groups) ? section.groups : [];

      for (const group of groups) {
        const selected = selectionMap?.[group.__selection_key] || {};
        const options = Array.isArray(group?.options) ? group.options : [];

        for (const option of options) {
          const optionId = Number(option?.id || 0);
          const quantity = Number(selected?.[optionId] || 0);

          if (quantity <= 0) {
            continue;
          }

          const availabilityUi = getAvailabilityUi(option);
          const quantityLimit = getOptionQuantityLimit(option);

          if (!availabilityUi.isAvailable) {
            setErrorMsg(
              `La opción "${option?.name || "Extra"}" ya no está disponible.`,
            );
            return null;
          }

          if (quantity > quantityLimit.effectiveMax) {
            setErrorMsg(
              `La opción "${option?.name || "Extra"}" permite actualmente un máximo de ${quantityLimit.effectiveMax}.`,
            );
            return null;
          }
        }
      }
    }

    const errors = validatePreparedSections(sections, selectionMap);

    if (errors.length > 0) {
      setErrorMsg(errors[0]);
      return null;
    }

    const normalized = normalizeSelectionForResult(sections, selectionMap);

    setErrorMsg("");
    return normalized;
  };

  return {
    sections,
    flatGroups,
    selectionMap,
    complianceSummary,
    sectionRequirementSummaries,
    contextRequirementSummaries,
    errorMsg,
    setErrorMsg,
    handleSelectOption,
    handleIncrementQty,
    handleDecrementQty,
    handleRemoveOption,
    buildResult,
  };
}