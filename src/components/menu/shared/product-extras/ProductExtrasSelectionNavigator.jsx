//src/components/menu/shared/product-extras/ProductExtrasSelectionNavigator.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  formatModifierGroupSelectionInstruction,
  money,
} from "../../../../hooks/public/publicMenu.utils";

import usePagination from "../../../../hooks/usePagination";
import PaginationFooter from "../../../common/PaginationFooter";
import { PillButton } from "../../../../pages/public/publicMenu.ui";

import {
  getSafeModifierThemeColor,
  modifierHexToRgba,
  ModifierGroupCard,
  ModifierOptionCard,
  ModifierOptionsArea,
} from "./ModifierCardShells";

import ModifierGroupCarousel, {
  getModifierGroupCarouselKey,
} from "./ModifierGroupCarousel";

import {
  buildContextCards,
  ContextCard,
  EntityCard,
  getContextTitle,
  getEntityLabel,
  getEntityScreenTitle,
  getProductLabel,
  getSectionDisplayLabel,
  getSectionGroupCount,
  getSectionNavigationKey,
  pluralize,
} from "./ProductExtrasNavigationShared";

import {
  getDynamicOptionRepeatInstruction,
  getGroupCompliance,
  getOptionSelectionState,
} from "./useProductExtrasSelection";

const ENTITY_PAGE_SIZE = 6;
const OPTION_PAGE_SIZE = 4;

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
  const repeatInstruction = getDynamicOptionRepeatInstruction(
    group,
    option,
    state,
  );

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
          {affectsPrice ? `Extra: ${money(price)}` : "Sin costo extra"}
          {option?.is_default ? " · Sugerido por defecto" : ""}
        </div>

        {repeatInstruction ? (
          <div
            style={{
              marginTop: 4,
              fontSize: 11.5,
              fontWeight: 800,
              color: "#3F3A52",
              lineHeight: 1.4,
            }}
          >
            {repeatInstruction}
          </div>
        ) : null}

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
  selectionMap,
  themeColor,
  onSelectOption,
  onIncrementQty,
  onDecrementQty,
  onRemoveOption,
}) {
  const safeThemeColor = getSafeModifierThemeColor(themeColor);
  const options = Array.isArray(group?.options) ? group.options : [];
  const selected = selectionMap?.[group.__selection_key] || {};
  const compliance = getGroupCompliance(group, selected);
  const statusStyles = getStatusStyles(compliance.status);
  const groupInstruction = formatModifierGroupSelectionInstruction(group);

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
              marginTop: 7,
              fontSize: 12,
              fontWeight: 850,
              color: "#3F3A52",
              lineHeight: 1.45,
            }}
          >
            {groupInstruction}
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
                width: "100%",
                minWidth: 0,
                maxWidth: "100%",
                overflow: "hidden",
                boxSizing: "border-box",
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

function SelectionGroupsView({
  section,
  product,
  themeColor,
  selectionMap,
  onSelectOption,
  onIncrementQty,
  onDecrementQty,
  onRemoveOption,
}) {
  const safeThemeColor = getSafeModifierThemeColor(themeColor);
  const groups = Array.isArray(section?.groups) ? section.groups : [];

  const [selectedGroupKey, setSelectedGroupKey] = useState(() => {
    if (groups.length === 0) {
      return null;
    }

    return getModifierGroupCarouselKey(groups[0], 0);
  });

  useEffect(() => {
    if (groups.length === 0) {
      if (selectedGroupKey !== null) {
        setSelectedGroupKey(null);
      }

      return;
    }

    const exists = groups.some((group, index) => {
      return getModifierGroupCarouselKey(group, index) === selectedGroupKey;
    });

    if (!exists) {
      setSelectedGroupKey(getModifierGroupCarouselKey(groups[0], 0));
    }
  }, [groups, selectedGroupKey]);

  const selectedGroupIndex = useMemo(() => {
    if (groups.length === 0) {
      return -1;
    }

    const index = groups.findIndex((group, groupIndex) => {
      return getModifierGroupCarouselKey(group, groupIndex) === selectedGroupKey;
    });

    return index >= 0 ? index : 0;
  }, [groups, selectedGroupKey]);

  const selectedGroup =
    selectedGroupIndex >= 0
      ? groups[selectedGroupIndex] || null
      : null;

  const effectiveSelectedGroupKey =
    selectedGroup && selectedGroupIndex >= 0
      ? getModifierGroupCarouselKey(selectedGroup, selectedGroupIndex)
      : null;

  const sectionLabel = getSectionDisplayLabel(section, product);

  return (
    <div
      style={{
        width: "100%",
        minWidth: 0,
        maxWidth: "100%",
        display: "grid",
        gap: 14,
        boxSizing: "border-box",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 950,
            color: "#3F3A52",
            lineHeight: 1.25,
            wordBreak: "break-word",
          }}
        >
          {sectionLabel}
        </div>

        <div
          style={{
            marginTop: 4,
            fontSize: 12,
            color: "#6E6A6A",
            lineHeight: 1.45,
          }}
        >
          {getContextTitle(section?.context_type)} ·{" "}
          {groups.length} {pluralize(groups.length, "grupo", "grupos")}
        </div>
      </div>

      {groups.length > 0 ? (
        <>
          <div
            style={{
              width: "100%",
              minWidth: 0,
              maxWidth: "100%",
              boxSizing: "border-box",
              display: "grid",
              gap: 10,
              padding: "12px 13px",
              borderRadius: 10,
              border: `1px solid ${modifierHexToRgba(safeThemeColor, 0.16)}`,
              background: modifierHexToRgba(safeThemeColor, 0.035),
            }}
          >
            <div
              style={{
                minWidth: 0,
                color: "#3F3A52",
                fontSize: 14,
                fontWeight: 950,
                lineHeight: 1.25,
              }}
            >
              Selecciona un grupo
            </div>

            <div
              style={{
                minWidth: 0,
                color: "#6E6A6A",
                fontSize: 12,
                lineHeight: 1.45,
              }}
            >
              Elige el grupo que quieras configurar para ver sus opciones disponibles.
            </div>

            <ModifierGroupCarousel
              groups={groups}
              selectedGroupKey={effectiveSelectedGroupKey}
              themeColor={safeThemeColor}
              onSelectGroup={(group, groupKey) => {
                if (!group || !groupKey) {
                  return;
                }

                setSelectedGroupKey(groupKey);
              }}
            />
          </div>

          {selectedGroup ? (
            <GroupCard
              key={selectedGroup.__selection_key}
              group={selectedGroup}
              selectionMap={selectionMap}
              themeColor={safeThemeColor}
              onSelectOption={onSelectOption}
              onIncrementQty={onIncrementQty}
              onDecrementQty={onDecrementQty}
              onRemoveOption={onRemoveOption}
            />
          ) : null}
        </>
      ) : (
        <div
          style={{
            padding: 14,
            borderRadius: 10,
            border: "1px dashed rgba(47,42,61,0.14)",
            background: "#FBF8F8",
            color: "#6E6A6A",
            fontSize: 12,
          }}
        >
          Este contexto no tiene grupos de extras.
        </div>
      )}
    </div>
  );
}

function SelectionEntityListView({
  context,
  themeColor,
  sectionRequirementSummaries,
  onSelectSection,
}) {
  const sections = Array.isArray(context?.sections)
    ? context.sections.filter((section) => getSectionGroupCount(section) > 0)
    : [];

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
    items: sections,
    initialPage: 1,
    pageSize: ENTITY_PAGE_SIZE,
    mode: "frontend",
  });

  return (
    <div
      style={{
        width: "100%",
        minWidth: 0,
        maxWidth: "100%",
        display: "grid",
        gap: 14,
        boxSizing: "border-box",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 950,
            color: "#3F3A52",
            lineHeight: 1.25,
          }}
        >
          {getEntityScreenTitle(context?.type)}
        </div>

        <div
          style={{
            marginTop: 4,
            fontSize: 12,
            color: "#6E6A6A",
            lineHeight: 1.45,
          }}
        >
          Selecciona qué elemento quieres configurar.
        </div>
      </div>

      {paginatedItems.length > 0 ? (
        <div className="cm-extras-selection-card-grid">
          {paginatedItems.map((section, index) => {
            const key = getSectionNavigationKey(section, index);

            return (
              <EntityCard
                key={key}
                section={section}
                themeColor={themeColor}
                requirementSummary={sectionRequirementSummaries?.[key] || null}
                interactiveRequirements
                onClick={onSelectSection}
              />
            );
          })}
        </div>
      ) : (
        <div
          style={{
            padding: 14,
            borderRadius: 10,
            border: "1px dashed rgba(47,42,61,0.14)",
            background: "#FBF8F8",
            color: "#6E6A6A",
            fontSize: 12,
          }}
        >
          No hay elementos con extras configurables en este contexto.
        </div>
      )}

      {totalPages > 1 ? (
        <div
          style={{
            width: "100%",
            minWidth: 0,
            maxWidth: "100%",
            overflow: "hidden",
            boxSizing: "border-box",
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
            itemLabel="elementos"
          />
        </div>
      ) : null}
    </div>
  );
}

export default function ProductExtrasSelectionNavigator({
  product,
  sections = [],
  selectionMap,
  sectionRequirementSummaries = {},
  contextRequirementSummaries = {},
  errorMsg = "",
  themeColor,
  navigationRef,
  onCanGoBackChange,
  onSelectOption,
  onIncrementQty,
  onDecrementQty,
  onRemoveOption,
}) {
  const safeThemeColor = getSafeModifierThemeColor(themeColor);

  const [selectedContextType, setSelectedContextType] = useState(null);
  const [selectedSectionKey, setSelectedSectionKey] = useState(null);

  const sectionsWithGroups = useMemo(() => {
    return (Array.isArray(sections) ? sections : []).filter(
      (section) => getSectionGroupCount(section) > 0,
    );
  }, [sections]);

  const hasCompositeNavigation = useMemo(() => {
    return sectionsWithGroups.some((section) =>
      ["component", "component_variant"].includes(section?.context_type),
    );
  }, [sectionsWithGroups]);

  const contextCards = useMemo(() => {
    if (!hasCompositeNavigation) {
      return [];
    }

    return buildContextCards(product, sectionsWithGroups, {
      includeProductFallback: false,
      interactiveRequirements: true,
      contextRequirementSummaries,
    });
  }, [
    product,
    sectionsWithGroups,
    hasCompositeNavigation,
    contextRequirementSummaries,
  ]);

  useEffect(() => {
    setSelectedContextType(null);
    setSelectedSectionKey(null);
  }, [product?.id, sections]);

  const activeContext = useMemo(() => {
    if (!hasCompositeNavigation) {
      return null;
    }

    if (selectedContextType) {
      return (
        contextCards.find((context) => context.type === selectedContextType) ||
        null
      );
    }

    if (contextCards.length === 1) {
      return contextCards[0];
    }

    return null;
  }, [
    hasCompositeNavigation,
    contextCards,
    selectedContextType,
  ]);

  const activeSections = useMemo(() => {
    if (!activeContext) {
      return [];
    }

    return (Array.isArray(activeContext.sections) ? activeContext.sections : [])
      .filter((section) => getSectionGroupCount(section) > 0);
  }, [activeContext]);

  const selectedSection = useMemo(() => {
    if (!selectedSectionKey) {
      return null;
    }

    const index = activeSections.findIndex((section, sectionIndex) => {
      return (
        getSectionNavigationKey(section, sectionIndex) ===
        selectedSectionKey
      );
    });

    return index >= 0 ? activeSections[index] : null;
  }, [activeSections, selectedSectionKey]);

  const effectiveCompositeSection =
    selectedSection ||
    (activeSections.length === 1 ? activeSections[0] : null);

  const directSection =
    !hasCompositeNavigation && sectionsWithGroups.length > 0
      ? sectionsWithGroups[0]
      : null;

  const effectiveSection = hasCompositeNavigation
    ? effectiveCompositeSection
    : directSection;

  const showContextScreen =
    hasCompositeNavigation &&
    contextCards.length > 1 &&
    !activeContext;

  const showEntityScreen =
    hasCompositeNavigation &&
    !!activeContext &&
    activeSections.length > 1 &&
    !selectedSection;

  const handleContextClick = (context) => {
    if (!context || context.disabled) {
      return;
    }

    setSelectedContextType(context.type);
    setSelectedSectionKey(null);
  };

  const handleSelectSection = (section) => {
    if (!section || getSectionGroupCount(section) <= 0) {
      return;
    }

    const index = activeSections.findIndex((row) => row === section);
    setSelectedSectionKey(getSectionNavigationKey(section, index >= 0 ? index : 0));
  };

  const canGoBack = useMemo(() => {
    if (!hasCompositeNavigation) {
      return false;
    }

    if (selectedSection && activeSections.length > 1) {
      return true;
    }

    if (selectedContextType && contextCards.length > 1) {
      return true;
    }

    return false;
  }, [
    hasCompositeNavigation,
    selectedSection,
    activeSections.length,
    selectedContextType,
    contextCards.length,
  ]);

  const handleBack = useCallback(() => {
    if (!hasCompositeNavigation) {
      return;
    }

    if (selectedSection && activeSections.length > 1) {
      setSelectedSectionKey(null);
      return;
    }

    if (selectedContextType && contextCards.length > 1) {
      setSelectedContextType(null);
      setSelectedSectionKey(null);
    }
  }, [
    hasCompositeNavigation,
    selectedSection,
    activeSections.length,
    selectedContextType,
    contextCards.length,
  ]);

  useEffect(() => {
    onCanGoBackChange?.(canGoBack);
  }, [canGoBack, onCanGoBackChange]);

  useEffect(() => {
    if (!navigationRef || typeof navigationRef !== "object") {
      return undefined;
    }

    navigationRef.current = {
      goBack: handleBack,
    };

    return () => {
      navigationRef.current = null;
    };
  }, [navigationRef, handleBack]);

  return (
    <div
      className="cm-extras-selection-navigator"
      style={{
        width: "100%",
        minWidth: 0,
        maxWidth: "100%",
        display: "grid",
        gap: 14,
        boxSizing: "border-box",
      }}
    >
      <style>
        {`
          .cm-extras-selection-navigator,
          .cm-extras-selection-navigator * {
            box-sizing: border-box;
          }

          .cm-extras-selection-card-grid {
            width: 100%;
            min-width: 0;
            max-width: 100%;
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }

          .cm-extras-selection-option-grid {
            width: 100%;
            min-width: 0;
            max-width: 100%;
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
          }

          .cm-extras-selection-option-grid > * {
            min-width: 0;
            max-width: 100%;
            box-sizing: border-box;
          }

          @media (max-width: 600px) {
            .cm-extras-selection-card-grid,
            .cm-extras-selection-option-grid {
              grid-template-columns: minmax(0, 1fr);
            }
          }
        `}
      </style>

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

      {sectionsWithGroups.length === 0 ? (
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
      ) : showContextScreen ? (
        <>
          <div
            style={{
              width: "100%",
              minWidth: 0,
              maxWidth: "100%",
              display: "grid",
              gap: 5,
              padding: 14,
              boxSizing: "border-box",
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
              ¿Qué extras quieres configurar?
            </div>

            <div
              style={{
                fontSize: 12,
                color: "#6E6A6A",
                lineHeight: 1.5,
              }}
            >
              Elige el contexto para configurar sus extras.
            </div>
          </div>

          <div className="cm-extras-selection-card-grid">
            {contextCards.map((context) => (
              <ContextCard
                key={context.type}
                context={context}
                themeColor={safeThemeColor}
                onClick={handleContextClick}
              />
            ))}
          </div>
        </>
      ) : showEntityScreen ? (
        <SelectionEntityListView
          key={`selection-entities-${activeContext?.type || "context"}`}
          context={activeContext}
          themeColor={safeThemeColor}
          sectionRequirementSummaries={sectionRequirementSummaries}
          onSelectSection={handleSelectSection}
        />
      ) : effectiveSection ? (
        <SelectionGroupsView
          key={`selection-groups-${getSectionNavigationKey(effectiveSection, 0)}`}
          section={effectiveSection}
          product={product}
          themeColor={safeThemeColor}
          selectionMap={selectionMap}
          onSelectOption={onSelectOption}
          onIncrementQty={onIncrementQty}
          onDecrementQty={onDecrementQty}
          onRemoveOption={onRemoveOption}
        />
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
          No hay extras configurables disponibles en este contexto.
        </div>
      )}
    </div>
  );
}