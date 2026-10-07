import React, { useEffect, useMemo, useRef, useState } from "react";

import { Modal, PillButton } from "../../../pages/public/publicMenu.ui";
import {
  buildModifierContextSections,
  buildModifierDisplayGroupsFromApiGroups,
  formatModifierGroupMeta,
  getPublicAvailabilityPresentation,
  isAvailabilityBlocked,
  money,
} from "../../../hooks/public/publicMenu.utils";

import usePagination from "../../../hooks/usePagination";
import PaginationFooter from "../../common/PaginationFooter";
import ProductExtrasReadOnlyNavigator from "./product-extras/ProductExtrasReadOnlyNavigator";

import {
  getSafeModifierThemeColor,
  modifierHexToRgba,
  ModifierGroupCard,
  ModifierOptionCard,
  ModifierOptionsArea,
} from "./product-extras/ModifierCardShells";

const GROUP_PAGE_SIZE = 2;
const OPTION_PAGE_SIZE = 4;
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

function makeGroupSelectionKey(section, group) {
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

function buildPreparedSections(product, sections) {
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

function countDistinctSelectedOptions(selectedMapForGroup) {
  return Object.values(selectedMapForGroup || {}).filter(
    (qty) => Number(qty || 0) > 0,
  ).length;
}

function countTotalSelectedUnits(selectedMapForGroup) {
  return Object.values(selectedMapForGroup || {}).reduce(
    (sum, qty) => sum + Math.max(0, Number(qty || 0)),
    0,
  );
}

function getGroupMinSelect(group) {
  const min = Number(group?.min_select || 0);
  const normalizedMin = Number.isFinite(min) ? Math.max(0, Math.floor(min)) : 0;

  if (group?.is_required) {
    return Math.max(1, normalizedMin);
  }

  return normalizedMin;
}

function getGroupMaxSelect(group) {
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

function getGroupCompliance(group, selected) {
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
        ? " Falta 1 selección"
        : ` Faltan ${missingUnits} selecciones`;
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

function buildInitialSelectionMap(initialValue, preparedSections) {
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

function normalizeSelectionForResult(preparedSections, selectionMap) {
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

function validatePreparedSections(preparedSections, selectionMap) {
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

function getOptionQuantityLimit(option) {
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

function getAvailabilityUi(option) {
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

function getOptionSelectionState(group, option, selected) {
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

function getStatusStyles(status) {
  if (status === "completed") {
    return {
      background: "#E7F7ED",
      color: "#147A48",
      border: "#A7DCC0",
    };
  }

  if (status === "required") {
    return {
      background: "#FFF1DC",
      color: "#A85C00",
      border: "#F0C27D",
    };
  }

  return {
    background: "#EEF1F6",
    color: "#555B6A",
    border: "#CCD2DD",
  };
}

function getSectionDisplayLabel(section, product) {
  const productName = product?.display_name || product?.name || "Producto";

  if (section?.context_type === "variant") {
    const variantName = section?.variant?.name || "Variante";
    return `${productName} · ${variantName}`;
  }

  if (section?.context_type === "component") {
    return (
      section?.component?.component_product?.display_name ||
      section?.component?.component_product?.name ||
      section?.component?.name ||
      section?.subtitle ||
      "Componente"
    );
  }

  if (section?.context_type === "component_variant") {
    const componentName =
      section?.component?.component_product?.display_name ||
      section?.component?.component_product?.name ||
      section?.component?.name ||
      "Componente";

    const variantName =
      section?.option?.label ||
      section?.option?.name ||
      section?.option?.variant_name ||
      "Variante";

    return `${componentName} · ${variantName}`;
  }

  return productName;
}

function buildSelectionContextLabels(product, sections) {
  const rows = Array.isArray(sections) ? sections : [];
  const labels = [];

  rows.forEach((section) => {
    const label = getSectionDisplayLabel(section, product);

    if (label && !labels.includes(label)) {
      labels.push(label);
    }
  });

  return labels;
}

function OptionRow({
  group,
  option,
  selected,
  themeColor,
  onSelectOption,
  onIncrementQty,
  onDecrementQty,
  onRemoveOption,
}) {
  const safeThemeColor = getSafeModifierThemeColor(themeColor);
  const state = getOptionSelectionState(group, option, selected);

  const selectedQty = state.currentQty;
  const availabilityUi = state.availability;
  const affectsPrice = !!option?.affects_total;
  const price = Number(option?.price || 0);
  const maxPerSelection = state.quantityLimit.configuredMax;

  const incrementTitle = !availabilityUi.isAvailable
    ? "Esta opción ya no está disponible"
    : selectedQty >= state.quantityLimit.effectiveMax
      ? "Se alcanzó el máximo permitido para esta opción"
      : state.groupRemaining <= 0
        ? "El grupo ya alcanzó su máximo"
        : "Sumar";

  return (
    <ModifierOptionCard
      themeColor={safeThemeColor}
      selected={selectedQty > 0}
      muted={!availabilityUi.isAvailable && selectedQty <= 0}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 900,
            color: "#3F3A52",
            lineHeight: 1.3,
            wordBreak: "break-word",
          }}
        >
          {option?.name || "Opción"}
        </div>

        {option?.description ? (
          <div
            style={{
              marginTop: 4,
              fontSize: 12,
              color: "#6E6A6A",
              lineHeight: 1.45,
            }}
          >
            {option.description}
          </div>
        ) : null}

        <div
          style={{
            marginTop: 6,
            fontSize: 12,
            color: "#6E6A6A",
            lineHeight: 1.45,
          }}
        >
          {affectsPrice ? `Ajuste: ${money(price)}` : "Sin ajuste al total"}
          {maxPerSelection > 1
            ? ` · Máx. por selección: ${maxPerSelection}`
            : ""}
          {option?.is_default ? " · Sugerido por defecto" : ""}
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            alignItems: "center",
            marginTop: 8,
          }}
        >
          <span
            title={availabilityUi.caption || availabilityUi.label}
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "4px 9px",
              borderRadius: 999,
              border: `1px solid ${availabilityUi.border}`,
              background: availabilityUi.bg,
              color: availabilityUi.color,
              fontSize: 11,
              fontWeight: 900,
            }}
          >
            {availabilityUi.label}
          </span>
        </div>
      </div>

      {selectedQty > 0 ? (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <PillButton
              tone="default"
              onClick={() => onDecrementQty?.(group, option)}
              disabled={selectedQty <= 0}
              title="Restar"
            >
              −
            </PillButton>

            <div
              style={{
                minWidth: 30,
                textAlign: "center",
                fontWeight: 950,
                color: "#3F3A52",
              }}
            >
              {selectedQty}
            </div>

            <PillButton
              tone="soft"
              themeColor={safeThemeColor}
              onClick={() => onIncrementQty?.(group, option)}
              disabled={!state.canIncrement}
              title={incrementTitle}
            >
              +
            </PillButton>
          </div>

          <PillButton
            tone="soft"
            themeColor={safeThemeColor}
            onClick={() => onRemoveOption?.(group, option)}
            title="Quitar opción"
          >
            Quitar
          </PillButton>
        </div>
      ) : (
        <div>
          <PillButton
            tone={state.canSelect ? "orange" : "default"}
            themeColor={safeThemeColor}
            onClick={() => onSelectOption?.(group, option)}
            disabled={!state.canSelect}
            title={
              state.canSelect
                ? "Seleccionar"
                : !availabilityUi.isAvailable
                  ? "Esta opción no está disponible"
                  : "El grupo ya alcanzó su máximo"
            }
          >
            {availabilityUi.isAvailable ? "Seleccionar" : "No disponible"}
          </PillButton>
        </div>
      )}
    </ModifierOptionCard>
  );
}

function GroupCard({
  group,
  selectedMap,
  themeColor,
  onSelectOption,
  onIncrementQty,
  onDecrementQty,
  onRemoveOption,
}) {
  const safeThemeColor = getSafeModifierThemeColor(themeColor);
  const options = Array.isArray(group?.options) ? group.options : [];
  const selected = selectedMap?.[group.__selection_key] || {};
  const compliance = getGroupCompliance(group, selected);
  const statusStyles = getStatusStyles(compliance.status);

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
    items: options,
    initialPage: 1,
    pageSize: OPTION_PAGE_SIZE,
    mode: "frontend",
  });

  return (
    <ModifierGroupCard themeColor={safeThemeColor}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "flex-start",
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontWeight: 900,
              fontSize: 15,
              color: "#3F3A52",
              lineHeight: 1.25,
            }}
          >
            {group?.name || "Grupo de extras"}
          </div>

          {group?.description ? (
            <div
              style={{
                marginTop: 4,
                fontSize: 12,
                color: "#6E6A6A",
                lineHeight: 1.45,
              }}
            >
              {group.description}
            </div>
          ) : null}

          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              color: "#6E6A6A",
              lineHeight: 1.45,
            }}
          >
            {formatModifierGroupMeta(group)}
          </div>

          <div
            style={{
              marginTop: 5,
              fontSize: 11,
              color: "#6E6A6A",
              fontWeight: 800,
            }}
          >
            Seleccionadas: {compliance.totalUnits}
            {compliance.max !== null ? ` de ${compliance.max}` : ""}
          </div>
        </div>

        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "5px 10px",
            borderRadius: 999,
            border: `1px solid ${statusStyles.border}`,
            background: statusStyles.background,
            color: statusStyles.color,
            fontSize: 11,
            fontWeight: 950,
            whiteSpace: "nowrap",
          }}
        >
          {compliance.label}
        </span>
      </div>

      {options.length > 0 ? (
        <ModifierOptionsArea>
          <div className="cm-extras-selection-option-grid">
            {paginatedItems.map((option, index) => (
              <OptionRow
                key={
                  Number(option?.id || 0) ||
                  `${group?.__selection_key}-${index}`
                }
                group={group}
                option={option}
                selected={selected}
                themeColor={safeThemeColor}
                onSelectOption={onSelectOption}
                onIncrementQty={onIncrementQty}
                onDecrementQty={onDecrementQty}
                onRemoveOption={onRemoveOption}
              />
            ))}
          </div>

          {totalPages > 1 ? (
            <div
              style={{
                overflow: "hidden",
                borderRadius: 10,
                border: `1px solid ${modifierHexToRgba(safeThemeColor, 0.14)}`,
                background: modifierHexToRgba(safeThemeColor, 0.025),
              }}
            >
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
                itemLabel="opciones"
              />
            </div>
          ) : null}
        </ModifierOptionsArea>
      ) : (
        <div
          style={{
            padding: 12,
            borderRadius: 10,
            border: `1px dashed ${modifierHexToRgba(safeThemeColor, 0.25)}`,
            background: modifierHexToRgba(safeThemeColor, 0.035),
            color: "#6E6A6A",
            fontSize: 12,
          }}
        >
          Este grupo no tiene opciones visibles en este contexto.
        </div>
      )}
    </ModifierGroupCard>
  );
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

  const [readOnlyCanGoBack, setReadOnlyCanGoBack] = useState(false);
  const [selectionMap, setSelectionMap] = useState({});
  const [errorMsg, setErrorMsg] = useState("");

  const contextSections = useMemo(() => {
    return buildModifierContextSections(product, {
      variantId,
      compositeDraft,
      selectionScope,
    });
  }, [product, variantId, compositeDraft, selectionScope]);

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

  useEffect(() => {
    if (!open || !readOnly) {
      setReadOnlyCanGoBack(false);
    }
  }, [open, readOnly, product?.id]);

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
    items: flatGroups,
    initialPage: 1,
    pageSize: GROUP_PAGE_SIZE,
    mode: "frontend",
  });

  const paginatedGroupsBySection = useMemo(() => {
    const grouped = {};

    paginatedItems.forEach((item) => {
      if (!grouped[item.sectionKey]) {
        grouped[item.sectionKey] = {
          sectionKey: item.sectionKey,
          sectionTitle: item.sectionTitle,
          sectionSubtitle: item.sectionSubtitle,
          section: item.section,
          items: [],
        };
      }

      grouped[item.sectionKey].items.push(item.group);
    });

    return Object.values(grouped);
  }, [paginatedItems]);

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

  const selectionContextLabels = useMemo(() => {
    return buildSelectionContextLabels(product, sections);
  }, [product, sections]);

  if (!product) {
    return null;
  }

  const title = product?.display_name || product?.name || "Producto";

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

  const handleConfirm = () => {
    if (readOnly) {
      onClose?.();
      return;
    }

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
            return;
          }

          if (quantity > quantityLimit.effectiveMax) {
            setErrorMsg(
              `La opción "${option?.name || "Extra"}" permite actualmente un máximo de ${quantityLimit.effectiveMax}.`,
            );
            return;
          }
        }
      }
    }

    const errors = validatePreparedSections(sections, selectionMap);

    if (errors.length > 0) {
      setErrorMsg(errors[0]);
      return;
    }

    const normalized = normalizeSelectionForResult(
      sections,
      selectionMap,
    );

    setErrorMsg("");
    onConfirm?.(normalized);
  };

  const handleReadOnlyBack = () => {
    readOnlyNavigationRef.current?.goBack?.();
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

          <PillButton
            tone="default"
            onClick={onClose}
            title="Cerrar"
          >
            {readOnly ? "Cerrar" : "Cancelar"}
          </PillButton>

          <PillButton
            tone={readOnly ? "soft" : "orange"}
            themeColor={safeThemeColor}
            onClick={handleConfirm}
            disabled={!readOnly && !complianceSummary.isValid}
            title={
              readOnly
                ? "Cerrar vista de extras"
                : complianceSummary.isValid
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
          <div style={{ display: "grid", gap: 14 }}>
            <style>
              {`
                .cm-extras-selection-option-grid {
                  display: grid;
                  grid-template-columns: repeat(2, minmax(0, 1fr));
                  gap: 8px;
                }

                @media (max-width: 600px) {
                  .cm-extras-selection-option-grid {
                    grid-template-columns: minmax(0, 1fr);
                  }
                }
              `}
            </style>

            <div
              style={{
                display: "grid",
                gap: 8,
                padding: 14,
                borderRadius: 10,
                border: "1px solid #D9D3D3",
                background: "#FBF8F8",
              }}
            >
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 950,
                  color: "#3F3A52",
                  lineHeight: 1.25,
                }}
              >
                Configura tus extras
              </div>

              {selectionContextLabels.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    gap: 7,
                    flexWrap: "wrap",
                  }}
                >
                  {selectionContextLabels.map((label) => (
                    <span
                      key={label}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "5px 9px",
                        borderRadius: 999,
                        border: `1px solid ${modifierHexToRgba(safeThemeColor, 0.22)}`,
                        background: modifierHexToRgba(safeThemeColor, 0.05),
                        color: "#3F3A52",
                        fontSize: 11,
                        fontWeight: 850,
                      }}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              ) : null}

              {complianceSummary.total > 0 ? (
                <div
                  style={{
                    fontSize: 12,
                    color: "#6E6A6A",
                    lineHeight: 1.45,
                  }}
                >
                  {complianceSummary.isValid
                    ? "Todos los grupos requeridos están completos."
                    : complianceSummary.invalidCount === 1
                      ? "Falta completar 1 grupo requerido."
                      : `Faltan completar ${complianceSummary.invalidCount} grupos requeridos.`}
                </div>
              ) : null}
            </div>

            {errorMsg ? (
              <div
                role="alert"
                style={{
                  border: "1px solid rgba(180,35,24,0.22)",
                  background: "#FDECEC",
                  color: "#A10000",
                  borderRadius: 10,
                  padding: "10px 12px",
                  fontSize: 12,
                  fontWeight: 900,
                  lineHeight: 1.45,
                }}
              >
                {errorMsg}
              </div>
            ) : null}

            {total > 0 ? (
              <>
                <div style={{ display: "grid", gap: 12 }}>
                  {paginatedGroupsBySection.map((section) => (
                    <div
                      key={section.sectionKey}
                      style={{
                        display: "grid",
                        gap: 10,
                        padding: 14,
                        borderRadius: 10,
                        border: "1px solid #D9D3D3",
                        background: "#FFFFFF",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: 900,
                            fontSize: 15,
                            color: "#3F3A52",
                            lineHeight: 1.25,
                          }}
                        >
                          {section.sectionTitle}
                        </div>

                        {section.sectionSubtitle ? (
                          <div
                            style={{
                              marginTop: 4,
                              fontSize: 12,
                              color: "#6E6A6A",
                              lineHeight: 1.4,
                            }}
                          >
                            {section.sectionSubtitle}
                          </div>
                        ) : null}
                      </div>

                      <div style={{ display: "grid", gap: 10 }}>
                        {section.items.map((group) => (
                          <GroupCard
                            key={group.__selection_key}
                            group={group}
                            selectedMap={selectionMap}
                            themeColor={safeThemeColor}
                            onSelectOption={handleSelectOption}
                            onIncrementQty={handleIncrementQty}
                            onDecrementQty={handleDecrementQty}
                            onRemoveOption={handleRemoveOption}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 ? (
                  <div
                    style={{
                      overflow: "hidden",
                      borderRadius: 10,
                      border: "1px solid #D9D3D3",
                      background: "#FFFFFF",
                    }}
                  >
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
                      itemLabel="grupos"
                    />
                  </div>
                ) : null}
              </>
            ) : (
              <div
                style={{
                  padding: 16,
                  borderRadius: 10,
                  border: "1px dashed rgba(0,0,0,0.12)",
                  background: "#FBF8F8",
                  color: "#6E6A6A",
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                Este producto no tiene extras configurables para la selección actual.
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}