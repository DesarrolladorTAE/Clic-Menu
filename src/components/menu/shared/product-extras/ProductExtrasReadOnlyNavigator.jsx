//src/components/menu/shared/product-extras/ProductExtrasReadOnlyNavigator.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  formatModifierGroupSelectionInstruction,
  formatModifierOptionRepeatInstruction,
  getAvailabilityTone,
  getPublicAvailabilityPresentation,
  money,
} from "../../../../hooks/public/publicMenu.utils";

import usePagination from "../../../../hooks/usePagination";
import PaginationFooter from "../../../common/PaginationFooter";

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
  getSectionGroupCount,
  pluralize,
} from "./ProductExtrasNavigationShared";

const ENTITY_PAGE_SIZE = 6;
const OPTION_PAGE_SIZE = 4;

function getAvailabilityDataForOption(option) {
  if (
    option?.availability &&
    typeof option.availability === "object" &&
    !Array.isArray(option.availability)
  ) {
    return option.availability;
  }

  if (option?.is_available === false) {
    return {
      status: option?.availability_label || "no_longer_sellable",
      max_available_qty: null,
    };
  }

  return {
    status: "available",
    max_available_qty: null,
  };
}

function getAvailabilityColors(status) {
  const tone = getAvailabilityTone(status);

  if (tone === "ok") {
    return {
      background: "#E7F7ED",
      color: "#147A48",
      border: "#A7DCC0",
    };
  }

  if (tone === "warn") {
    return {
      background: "#FFF2DD",
      color: "#A65E00",
      border: "#F2C98D",
    };
  }

  if (tone === "danger") {
    return {
      background: "#FDE9E8",
      color: "#B42318",
      border: "#F2B8B5",
    };
  }

  return {
    background: "#EEF0F3",
    color: "#62606A",
    border: "#D4D6DB",
  };
}

function OptionReadOnlyCard({ group, option, themeColor }) {
  const safeThemeColor = getSafeModifierThemeColor(themeColor);
  const availability = getAvailabilityDataForOption(option);
  const presentation = getPublicAvailabilityPresentation(availability);

  const status = String(
    presentation?.status || availability?.status || "",
  ).trim().toLowerCase();

  const colors = getAvailabilityColors(status);
  const affectsTotal = !!option?.affects_total;
  const price = Number(option?.price || 0);
  const repeatInstruction = formatModifierOptionRepeatInstruction(option, group);

  return (
    <ModifierOptionCard themeColor={safeThemeColor}>
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
              marginTop: 5,
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
            marginTop: 7,
            fontSize: 12,
            fontWeight: 800,
            color: affectsTotal ? "#3F3A52" : "#6E6A6A",
            lineHeight: 1.45,
          }}
        >
          {affectsTotal ? `Extra: ${money(price)}` : "Sin costo extra"}
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
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <span
          title={presentation?.caption || presentation?.label || ""}
          style={{
            display: "inline-flex",
            alignItems: "center",
            minHeight: 25,
            padding: "4px 9px",
            borderRadius: 999,
            border: `1px solid ${colors.border}`,
            background: colors.background,
            color: colors.color,
            fontSize: 11,
            fontWeight: 900,
            lineHeight: 1.2,
          }}
        >
          {presentation?.label || "Disponible"}
        </span>
      </div>
    </ModifierOptionCard>
  );
}

function GroupReadOnlyCard({ group, themeColor }) {
  const safeThemeColor = getSafeModifierThemeColor(themeColor);
  const options = Array.isArray(group?.options) ? group.options : [];
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
      <div>
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
      </div>

      {options.length > 0 ? (
        <ModifierOptionsArea>
          <div className="cm-extras-readonly-option-grid">
            {paginatedItems.map((option, index) => {
              const optionKey =
                Number(option?.id || option?.modifier_option_id || 0) ||
                `${group?.id || "group"}-${index}`;

              return (
                <OptionReadOnlyCard
                  key={optionKey}
                  group={group}
                  option={option}
                  themeColor={safeThemeColor}
                />
              );
            })}
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
                border: `1px solid ${modifierHexToRgba(safeThemeColor, 0.16)}`,
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
            border: `1px dashed ${modifierHexToRgba(safeThemeColor, 0.22)}`,
            background: modifierHexToRgba(safeThemeColor, 0.035),
            color: "#6E6A6A",
            fontSize: 12,
            lineHeight: 1.45,
          }}
        >
          Este grupo no tiene opciones visibles.
        </div>
      )}
    </ModifierGroupCard>
  );
}

function EntityListView({ context, themeColor, onSelectSection }) {
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
          Selecciona qué extras quieres consultar.
        </div>
      </div>

      {paginatedItems.length > 0 ? (
        <div className="cm-extras-readonly-card-grid">
          {paginatedItems.map((section, index) => (
            <EntityCard
              key={section?.key || `${context?.type}-${index}`}
              section={section}
              themeColor={themeColor}
              onClick={onSelectSection}
            />
          ))}
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
          No hay elementos con extras en este contexto.
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

function GroupsView({ context, section, product, themeColor }) {
  const safeThemeColor = getSafeModifierThemeColor(themeColor);

  const groups = useMemo(() => {
    return Array.isArray(section?.groups) ? section.groups : [];
  }, [section]);

  const productLabel = getProductLabel(product);

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

    const selectedStillExists = groups.some((group, index) => {
      return getModifierGroupCarouselKey(group, index) === selectedGroupKey;
    });

    if (!selectedStillExists) {
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

  const entityLabel =
    context?.type === "product"
      ? productLabel
      : getEntityLabel(section);

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
          {entityLabel}
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
              Elige el grupo que quieras consultar para ver sus opciones disponibles.
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
            <div
              style={{
                width: "100%",
                minWidth: 0,
                maxWidth: "100%",
                boxSizing: "border-box",
              }}
            >
              <GroupReadOnlyCard
                key={effectiveSelectedGroupKey}
                group={selectedGroup}
                themeColor={safeThemeColor}
              />
            </div>
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

export default function ProductExtrasReadOnlyNavigator({
  product,
  sections = [],
  themeColor,
  navigationRef,
  onCanGoBackChange,
}) {
  const safeThemeColor = getSafeModifierThemeColor(themeColor);

  const [selectedContext, setSelectedContext] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);

  const contextCards = useMemo(
    () => buildContextCards(product, sections),
    [product, sections],
  );

  useEffect(() => {
    setSelectedContext(null);
    setSelectedSection(null);
  }, [product?.id, sections]);

  const handleContextClick = (context) => {
    if (!context || context.disabled) {
      return;
    }

    setSelectedContext(context);

    if (context.directToGroups) {
      const section = Array.isArray(context.sections)
        ? context.sections.find((row) => getSectionGroupCount(row) > 0) || null
        : null;

      if (!section) {
        return;
      }

      setSelectedSection(section);
      return;
    }

    setSelectedSection(null);
  };

  const handleSelectSection = (section) => {
    if (!section || getSectionGroupCount(section) <= 0) {
      return;
    }

    setSelectedSection(section);
  };

  const handleBack = useCallback(() => {
    if (selectedSection) {
      if (selectedContext?.directToGroups) {
        setSelectedContext(null);
        setSelectedSection(null);
        return;
      }

      setSelectedSection(null);
      return;
    }

    if (selectedContext) {
      setSelectedContext(null);
      setSelectedSection(null);
    }
  }, [selectedContext, selectedSection]);

  useEffect(() => {
    onCanGoBackChange?.(Boolean(selectedContext));
  }, [selectedContext, onCanGoBackChange]);

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
      className="cm-extras-readonly-navigator"
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
          .cm-extras-readonly-navigator,
          .cm-extras-readonly-navigator * {
            box-sizing: border-box;
          }

          .cm-extras-readonly-card-grid {
            width: 100%;
            min-width: 0;
            max-width: 100%;
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }

          .cm-extras-readonly-option-grid {
            width: 100%;
            min-width: 0;
            max-width: 100%;
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
          }

          @media (max-width: 600px) {
            .cm-extras-readonly-card-grid,
            .cm-extras-readonly-option-grid {
              grid-template-columns: minmax(0, 1fr);
            }
          }
        `}
      </style>

      {!selectedContext ? (
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
              ¿Qué extras quieres consultar?
            </div>

            <div
              style={{
                fontSize: 12,
                color: "#6E6A6A",
                lineHeight: 1.5,
              }}
            >
              Consulta los extras disponibles según el contexto de tu producto.
            </div>
          </div>

          {contextCards.length > 0 ? (
            <div className="cm-extras-readonly-card-grid">
              {contextCards.map((context) => (
                <ContextCard
                  key={context.type}
                  context={context}
                  themeColor={safeThemeColor}
                  onClick={handleContextClick}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: 16,
                borderRadius: 10,
                border: "1px dashed rgba(47,42,61,0.14)",
                background: "#FBF8F8",
                color: "#6E6A6A",
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              Este producto no tiene extras disponibles para consultar.
            </div>
          )}
        </>
      ) : selectedSection ? (
        <GroupsView
          key={`groups-${selectedSection?.key || "section"}`}
          context={selectedContext}
          section={selectedSection}
          product={product}
          themeColor={safeThemeColor}
        />
      ) : (
        <EntityListView
          key={`entities-${selectedContext?.type || "context"}`}
          context={selectedContext}
          themeColor={safeThemeColor}
          onSelectSection={handleSelectSection}
        />
      )}
    </div>
  );
}