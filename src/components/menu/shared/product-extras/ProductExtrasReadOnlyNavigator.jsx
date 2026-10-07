import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";

import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";

import {
  formatModifierGroupMeta,
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

const ENTITY_PAGE_SIZE = 6;
const GROUP_PAGE_SIZE = 2;
const OPTION_PAGE_SIZE = 4;

function pluralize(count, singular, plural) {
  return Number(count) === 1 ? singular : plural;
}

function getSectionGroupCount(section) {
  return Array.isArray(section?.groups) ? section.groups.length : 0;
}

function getProductLabel(product) {
  return product?.display_name || product?.name || "Producto";
}

function getEntityLabel(section) {
  if (section?.entity_label) {
    return String(section.entity_label);
  }

  if (section?.context_type === "variant") {
    return section?.variant?.name || "Variante";
  }

  if (section?.context_type === "component") {
    return (
      section?.component?.component_product?.display_name ||
      section?.component?.component_product?.name ||
      section?.component?.name ||
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

  return section?.subtitle || "Producto";
}

function getContextTitle(contextType) {
  const titles = {
    product: "Producto",
    variant: "Variantes",
    component: "Componentes",
    component_variant: "Variantes de componente",
  };

  return titles[contextType] || "Extras";
}

function getContextIcon(contextType) {
  const icons = {
    product: RestaurantMenuOutlinedIcon,
    variant: TuneOutlinedIcon,
    component: WidgetsOutlinedIcon,
    component_variant: AccountTreeOutlinedIcon,
  };

  return icons[contextType] || RestaurantMenuOutlinedIcon;
}

function getEntityScreenTitle(contextType) {
  const titles = {
    variant: "Variantes con extras",
    component: "Componentes con extras",
    component_variant: "Variantes de componente con extras",
  };

  return titles[contextType] || "Extras disponibles";
}

function getContextDescription(contextType, sections) {
  const rows = Array.isArray(sections) ? sections : [];

  if (contextType === "product") {
    const groupCount = rows.reduce(
      (total, section) => total + getSectionGroupCount(section),
      0,
    );

    if (groupCount <= 0) {
      return {
        description: "Sin extras",
        detail: "No tiene extras generales",
      };
    }

    return {
      description: "Extras generales",
      detail: `${groupCount} ${pluralize(groupCount, "grupo", "grupos")}`,
    };
  }

  const entityCount = rows.length;

  if (contextType === "variant") {
    return {
      description: "Extras específicos",
      detail: `${entityCount} ${pluralize(
        entityCount,
        "variante con extras",
        "variantes con extras",
      )}`,
    };
  }

  if (contextType === "component") {
    return {
      description: "Extras por componente",
      detail: `${entityCount} ${pluralize(
        entityCount,
        "componente con extras",
        "componentes con extras",
      )}`,
    };
  }

  return {
    description: "Extras por variante",
    detail: `${entityCount} ${pluralize(
      entityCount,
      "variante con extras",
      "variantes con extras",
    )}`,
  };
}

function buildContextCards(product, sections) {
  const rows = Array.isArray(sections) ? sections : [];

  const grouped = {
    product: rows.filter((section) => section?.context_type === "product"),
    variant: rows.filter((section) => section?.context_type === "variant"),
    component: rows.filter((section) => section?.context_type === "component"),
    component_variant: rows.filter(
      (section) => section?.context_type === "component_variant",
    ),
  };

  const cards = [];

  if (grouped.product.length > 0) {
    const info = getContextDescription("product", grouped.product);
    const groupCount = grouped.product.reduce(
      (total, section) => total + getSectionGroupCount(section),
      0,
    );

    cards.push({
      type: "product",
      title: "PRODUCTO",
      description: info.description,
      detail: info.detail,
      sections: grouped.product,
      disabled: groupCount <= 0,
      directToGroups: true,
    });
  }

  if (grouped.variant.length > 0) {
    const info = getContextDescription("variant", grouped.variant);

    cards.push({
      type: "variant",
      title: "VARIANTES",
      description: info.description,
      detail: info.detail,
      sections: grouped.variant,
      disabled: false,
      directToGroups: false,
    });
  }

  if (grouped.component.length > 0) {
    const info = getContextDescription("component", grouped.component);

    cards.push({
      type: "component",
      title: "COMPONENTES",
      description: info.description,
      detail: info.detail,
      sections: grouped.component,
      disabled: false,
      directToGroups: false,
    });
  }

  if (grouped.component_variant.length > 0) {
    const info = getContextDescription(
      "component_variant",
      grouped.component_variant,
    );

    cards.push({
      type: "component_variant",
      title: "VARIANTES DE COMPONENTE",
      description: info.description,
      detail: info.detail,
      sections: grouped.component_variant,
      disabled: false,
      directToGroups: false,
    });
  }

  if (
    cards.length > 0 &&
    !cards.some((card) => card.type === "product")
  ) {
    cards.unshift({
      type: "product",
      title: "PRODUCTO",
      description: "Sin extras",
      detail: "No tiene extras generales",
      sections: [],
      disabled: true,
      directToGroups: true,
    });
  }

  return cards;
}

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

function OptionReadOnlyCard({ option, themeColor }) {
  const safeThemeColor = getSafeModifierThemeColor(themeColor);
  const availability = getAvailabilityDataForOption(option);
  const presentation = getPublicAvailabilityPresentation(availability);

  const status = String(
    presentation?.status || availability?.status || "",
  ).trim().toLowerCase();

  const colors = getAvailabilityColors(status);
  const affectsTotal = !!option?.affects_total;
  const price = Number(option?.price || 0);
  const maxPerSelection = Math.max(
    1,
    Number(option?.max_quantity_per_selection || 1),
  );

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
          {affectsTotal ? `Ajuste: ${money(price)}` : "Sin ajuste al total"}
        </div>

        {maxPerSelection > 1 ? (
          <div
            style={{
              marginTop: 3,
              fontSize: 11,
              color: "#6E6A6A",
              lineHeight: 1.4,
            }}
          >
            Máx. por selección: {maxPerSelection}
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
            marginTop: 6,
            fontSize: 12,
            color: "#6E6A6A",
            lineHeight: 1.45,
          }}
        >
          {formatModifierGroupMeta(group)}
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
                  option={option}
                  themeColor={safeThemeColor}
                />
              );
            })}
          </div>

          {totalPages > 1 ? (
            <div
              style={{
                overflow: "hidden",
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

function ContextCard({ context, themeColor, onClick }) {
  const accentColor = getSafeModifierThemeColor(themeColor);
  const disabled = !!context?.disabled;
  const ContextIcon = getContextIcon(context?.type);

  return (
    <Box
      component="button"
      type="button"
      disabled={disabled}
      onClick={() => {
        if (disabled) {
          return;
        }

        onClick?.(context);
      }}
      sx={{
        width: "100%",
        minWidth: 0,
        minHeight: { xs: 118, sm: 132 },
        p: { xs: 1.25, sm: 1.5 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 0.7,
        font: "inherit",
        color: disabled ? "#8A858F" : "text.primary",
        border: "1px solid",
        borderColor: disabled ? "rgba(47,42,61,0.10)" : "divider",
        borderRadius: 2,
        backgroundColor: disabled ? "#F1EFEF" : "#FFFFFF",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.65 : 1,
        boxShadow: "none",
        transition:
          "border-color 160ms ease, background-color 160ms ease, transform 160ms ease",
        "&:hover": disabled
          ? {}
          : {
              borderColor: accentColor,
              backgroundColor: modifierHexToRgba(accentColor, 0.035),
              transform: "translateY(-1px)",
            },
      }}
    >
      <Box
        sx={{
          width: { xs: 38, sm: 42 },
          height: { xs: 38, sm: 42 },
          flexShrink: 0,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          color: disabled ? "#928D96" : accentColor,
          backgroundColor: disabled
            ? "rgba(47,42,61,0.07)"
            : modifierHexToRgba(accentColor, 0.1),
        }}
      >
        <ContextIcon sx={{ fontSize: { xs: 21, sm: 23 } }} />
      </Box>

      <Typography
        sx={{
          mt: 0.15,
          fontSize: { xs: 12.5, sm: 14 },
          fontWeight: 850,
          lineHeight: 1.2,
          color: disabled ? "#8A858F" : "text.primary",
        }}
      >
        {context?.title || "EXTRAS"}
      </Typography>

      <Typography
        sx={{
          fontSize: 11.5,
          fontWeight: 700,
          lineHeight: 1.3,
          color: disabled ? "#928D96" : "text.secondary",
        }}
      >
        {context?.description || "Extras"}
      </Typography>

      {context?.detail ? (
        <Typography
          sx={{
            maxWidth: 260,
            fontSize: 11,
            fontWeight: 700,
            lineHeight: 1.3,
            color: disabled ? "#928D96" : "text.secondary",
          }}
        >
          {context.detail}
        </Typography>
      ) : null}
    </Box>
  );
}

function EntityCard({ section, themeColor, onClick }) {
  const safeThemeColor = getSafeModifierThemeColor(themeColor);
  const groupCount = getSectionGroupCount(section);
  const label = getEntityLabel(section);

  return (
    <button
      type="button"
      onClick={() => onClick?.(section)}
      style={{
        width: "100%",
        minHeight: 112,
        display: "grid",
        alignContent: "center",
        gap: 7,
        padding: 15,
        borderRadius: 12,
        border: `1px solid ${modifierHexToRgba(safeThemeColor, 0.25)}`,
        borderLeft: `4px solid ${safeThemeColor}`,
        background: "#FFFFFF",
        color: "#3F3A52",
        boxShadow: "0 4px 15px rgba(47,42,61,0.055)",
        cursor: "pointer",
        textAlign: "left",
        transition: "transform 160ms ease, box-shadow 160ms ease",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.transform = "translateY(-1px)";
        event.currentTarget.style.boxShadow =
          "0 8px 20px rgba(47,42,61,0.09)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform = "translateY(0)";
        event.currentTarget.style.boxShadow =
          "0 4px 15px rgba(47,42,61,0.055)";
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 900,
          lineHeight: 1.3,
          wordBreak: "break-word",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: "#6E6A6A",
        }}
      >
        {groupCount} {pluralize(groupCount, "grupo de extras", "grupos de extras")}
      </div>
    </button>
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
    <div style={{ display: "grid", gap: 14 }}>
      <div>
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
            itemLabel="elementos"
          />
        </div>
      ) : null}
    </div>
  );
}

function GroupsView({ context, section, product, themeColor }) {
  const groups = Array.isArray(section?.groups) ? section.groups : [];
  const productLabel = getProductLabel(product);

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
    items: groups,
    initialPage: 1,
    pageSize: GROUP_PAGE_SIZE,
    mode: "frontend",
  });

  const entityLabel =
    context?.type === "product"
      ? productLabel
      : getEntityLabel(section);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 950,
            color: "#3F3A52",
            lineHeight: 1.25,
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
        <div style={{ display: "grid", gap: 12 }}>
          {paginatedItems.map((group, index) => (
            <GroupReadOnlyCard
              key={
                Number(group?.id || group?.modifier_group_id || 0) ||
                `${section?.key || "section"}-${index}`
              }
              group={group}
              themeColor={themeColor}
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
          Este contexto no tiene grupos de extras.
        </div>
      )}

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
    <div style={{ display: "grid", gap: 14 }}>
      <style>
        {`
          .cm-extras-readonly-card-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }

          .cm-extras-readonly-option-grid {
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
              display: "grid",
              gap: 5,
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