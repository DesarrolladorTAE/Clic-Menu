//src/components/menu/shared/product-extras/ProductExtrasNavigationShared.jsx
import React from "react";
import { Box, Typography } from "@mui/material";

import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";

import {
  getSafeModifierThemeColor,
  modifierHexToRgba,
} from "./ModifierCardShells";

export function pluralize(count, singular, plural) {
  return Number(count) === 1 ? singular : plural;
}

export function getSectionGroupCount(section) {
  return Array.isArray(section?.groups) ? section.groups.length : 0;
}

export function getProductLabel(product) {
  return product?.display_name || product?.name || "Producto";
}

export function getEntityLabel(section) {
  if (section?.entity_label) {
    return String(section.entity_label);
  }

  if (section?.context_type === "variant") {
    return section?.variant?.name || section?.subtitle || "Variante";
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

  return section?.subtitle || "Producto";
}

export function getSectionDisplayLabel(section, product) {
  const productName = getProductLabel(product);

  if (section?.context_type === "variant") {
    return section?.variant?.name || section?.subtitle || "Variante";
  }

  if (
    section?.context_type === "component" ||
    section?.context_type === "component_variant"
  ) {
    return getEntityLabel(section);
  }

  return productName;
}

export function getContextTitle(contextType) {
  const titles = {
    product: "Producto",
    variant: "Variantes",
    component: "Componentes",
    component_variant: "Variantes de componente",
  };

  return titles[contextType] || "Extras";
}

export function getEntityScreenTitle(contextType) {
  const titles = {
    product: "Producto con extras",
    variant: "Variantes con extras",
    component: "Componentes con extras",
    component_variant: "Variantes de componente con extras",
  };

  return titles[contextType] || "Extras disponibles";
}

export function getSectionNavigationKey(section, index = 0) {
  if (section?.key) {
    return String(section.key);
  }

  const contextType = String(section?.context_type || "product");
  const variantId = Number(section?.variant?.id || 0);
  const componentProductId = Number(section?.component?.component_product_id || 0);
  const componentVariantId = Number(section?.option?.variant_id || 0);

  return [
    contextType,
    variantId,
    componentProductId,
    componentVariantId,
    index,
  ].join(":");
}

export function getGroupMinimumRequirement(group) {
  const rawMin = Number(group?.min_select || 0);
  const normalizedMin = Number.isFinite(rawMin)
    ? Math.max(0, Math.floor(rawMin))
    : 0;

  if (group?.is_required) {
    return Math.max(1, normalizedMin);
  }

  return normalizedMin;
}

export function isModifierGroupRequired(group) {
  return getGroupMinimumRequirement(group) > 0;
}

export function buildRequirementSummary(
  groups,
  {
    selectionMap = null,
    getCompliance = null,
  } = {},
) {
  const rows = Array.isArray(groups) ? groups : [];
  const requiredGroups = rows.filter(isModifierGroupRequired);
  const hasSelectionState =
    selectionMap &&
    typeof selectionMap === "object" &&
    typeof getCompliance === "function";

  let pendingRequiredGroupCount = requiredGroups.length;
  let completedRequiredGroupCount = 0;

  if (hasSelectionState) {
    pendingRequiredGroupCount = 0;
    completedRequiredGroupCount = 0;

    requiredGroups.forEach((group) => {
      const selectionKey = group?.__selection_key;
      const selected = selectionKey ? selectionMap?.[selectionKey] || {} : {};
      const compliance = getCompliance(group, selected);

      if (compliance?.isValid) {
        completedRequiredGroupCount += 1;
      } else {
        pendingRequiredGroupCount += 1;
      }
    });
  }

  return {
    totalGroupCount: rows.length,
    requiredGroupCount: requiredGroups.length,
    optionalGroupCount: Math.max(0, rows.length - requiredGroups.length),
    pendingRequiredGroupCount,
    completedRequiredGroupCount,
    hasRequiredGroups: requiredGroups.length > 0,
    hasSelectionState,
    isRequiredComplete:
      requiredGroups.length > 0 &&
      hasSelectionState &&
      pendingRequiredGroupCount === 0,
  };
}

export function buildSectionRequirementSummary(section, options = {}) {
  return buildRequirementSummary(
    Array.isArray(section?.groups) ? section.groups : [],
    options,
  );
}

export function buildContextRequirementSummary(sections, options = {}) {
  const rows = Array.isArray(sections) ? sections : [];
  const groups = rows.flatMap((section) =>
    Array.isArray(section?.groups) ? section.groups : [],
  );

  const summary = buildRequirementSummary(groups, options);

  let requiredEntityCount = 0;
  let pendingRequiredEntityCount = 0;
  let completedRequiredEntityCount = 0;

  rows.forEach((section) => {
    const sectionSummary = buildSectionRequirementSummary(section, options);

    if (!sectionSummary.hasRequiredGroups) {
      return;
    }

    requiredEntityCount += 1;

    if (sectionSummary.isRequiredComplete) {
      completedRequiredEntityCount += 1;
    } else {
      pendingRequiredEntityCount += 1;
    }
  });

  return {
    ...summary,
    totalEntityCount: rows.length,
    requiredEntityCount,
    pendingRequiredEntityCount,
    completedRequiredEntityCount,
  };
}

export function getRequirementStatus(summary, interactive = false) {
  if (!summary?.hasRequiredGroups) {
    return null;
  }

  if (interactive && summary?.isRequiredComplete) {
    return "completed";
  }

  return "required";
}

export function getRequirementDetail(summary, interactive = false) {
  if (!summary?.hasRequiredGroups) {
    return "";
  }

  if (interactive) {
    const pending = Number(summary?.pendingRequiredGroupCount || 0);

    if (pending <= 0) {
      return "Requerido completo";
    }

    return `${pending} ${pluralize(
      pending,
      "grupo pendiente",
      "grupos pendientes",
    )}`;
  }

  const required = Number(summary?.requiredGroupCount || 0);

  return `${required} ${pluralize(
    required,
    "grupo obligatorio",
    "grupos obligatorios",
  )}`;
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

export function buildContextCards(
  product,
  sections,
  {
    includeProductFallback = true,
    allowedTypes = null,
    interactiveRequirements = false,
    selectionMap = null,
    getCompliance = null,
    contextRequirementSummaries = null,
  } = {},
) {
  const rows = Array.isArray(sections) ? sections : [];
  const allowed = Array.isArray(allowedTypes)
    ? new Set(allowedTypes)
    : null;

  const grouped = {
    product: rows.filter((section) => section?.context_type === "product"),
    variant: rows.filter((section) => section?.context_type === "variant"),
    component: rows.filter((section) => section?.context_type === "component"),
    component_variant: rows.filter(
      (section) => section?.context_type === "component_variant",
    ),
  };

  const cards = [];

  const canUseType = (type) => {
    if (!allowed) {
      return true;
    }

    return allowed.has(type);
  };

  const pushContext = (type, title, directToGroups) => {
    if (!canUseType(type)) {
      return;
    }

    const contextSections = grouped[type] || [];

    if (contextSections.length === 0) {
      return;
    }

    const info = getContextDescription(type, contextSections);

    const requirementSummary =
      contextRequirementSummaries?.[type] ||
      buildContextRequirementSummary(contextSections, {
        selectionMap,
        getCompliance,
      });

    cards.push({
      type,
      title,
      description: info.description,
      detail: info.detail,
      sections: contextSections,
      disabled: false,
      directToGroups,
      requirementSummary,
      requirementStatus: getRequirementStatus(
        requirementSummary,
        interactiveRequirements,
      ),
      requirementDetail: getRequirementDetail(
        requirementSummary,
        interactiveRequirements,
      ),
    });
  };

  pushContext("product", "PRODUCTO", true);
  pushContext("variant", "VARIANTES", false);
  pushContext("component", "COMPONENTES", false);
  pushContext("component_variant", "VARIANTES DE COMPONENTE", false);

  if (
    includeProductFallback &&
    cards.length > 0 &&
    canUseType("product") &&
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
      requirementSummary: buildRequirementSummary([]),
      requirementStatus: null,
      requirementDetail: "",
    });
  }

  return cards;
}

export function RequirementBadge({ status, summary }) {
  if (!status) {
    return null;
  }

  const completed = status === "completed";

  const label = completed ? "Completo" : "Obligatorio";
  const title = completed
    ? "Todos los grupos obligatorios están completos."
    : summary?.pendingRequiredGroupCount > 0
      ? `${summary.pendingRequiredGroupCount} grupo(s) obligatorio(s) pendiente(s).`
      : "Este elemento contiene grupos obligatorios.";

  return (
    <span
      title={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        minHeight: 24,
        padding: "4px 9px",
        borderRadius: 999,
        border: completed ? "1px solid #A7DCC0" : "1px solid #F0C27D",
        background: completed ? "#E7F7ED" : "#FFF1DC",
        color: completed ? "#147A48" : "#A85C00",
        fontSize: 10.5,
        fontWeight: 950,
        lineHeight: 1.15,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

export function ContextCard({ context, themeColor, onClick }) {
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
        position: "relative",
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
      {context?.requirementStatus ? (
        <Box
          component="span"
          sx={{
            position: "absolute",
            top: { xs: 8, sm: 10 },
            right: { xs: 8, sm: 10 },
            display: "inline-flex",
          }}
        >
          <RequirementBadge
            status={context.requirementStatus}
            summary={context.requirementSummary}
          />
        </Box>
      ) : null}

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
          px: context?.requirementStatus ? { xs: 0.5, sm: 1 } : 0,
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

      {context?.requirementDetail ? (
        <Typography
          sx={{
            maxWidth: 260,
            fontSize: 10.5,
            fontWeight: 850,
            lineHeight: 1.3,
            color:
              context?.requirementStatus === "completed"
                ? "#147A48"
                : "#A85C00",
          }}
        >
          {context.requirementDetail}
        </Typography>
      ) : null}
    </Box>
  );
}

export function EntityCard({
  section,
  themeColor,
  onClick,
  requirementSummary = null,
  interactiveRequirements = false,
}) {
  const safeThemeColor = getSafeModifierThemeColor(themeColor);
  const groupCount = getSectionGroupCount(section);
  const label = getEntityLabel(section);

  const effectiveRequirementSummary =
    requirementSummary || buildSectionRequirementSummary(section);

  const requirementStatus = getRequirementStatus(
    effectiveRequirementSummary,
    interactiveRequirements,
  );

  const requirementDetail = getRequirementDetail(
    effectiveRequirementSummary,
    interactiveRequirements,
  );

  return (
    <button
      type="button"
      onClick={() => onClick?.(section)}
      style={{
        width: "100%",
        minWidth: 0,
        minHeight: 112,
        boxSizing: "border-box",
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
        event.currentTarget.style.boxShadow = "0 8px 20px rgba(47,42,61,0.09)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform = "translateY(0)";
        event.currentTarget.style.boxShadow = "0 4px 15px rgba(47,42,61,0.055)";
      }}
    >
      <div
        style={{
          minWidth: 0,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div
          style={{
            minWidth: 0,
            fontSize: 14,
            fontWeight: 900,
            lineHeight: 1.3,
            wordBreak: "break-word",
          }}
        >
          {label}
        </div>

        <RequirementBadge
          status={requirementStatus}
          summary={effectiveRequirementSummary}
        />
      </div>

      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: "#6E6A6A",
          lineHeight: 1.35,
        }}
      >
        {groupCount} {pluralize(groupCount, "grupo de extras", "grupos de extras")}
      </div>

      {requirementDetail ? (
        <div
          style={{
            fontSize: 11,
            fontWeight: 850,
            color: requirementStatus === "completed" ? "#147A48" : "#A85C00",
            lineHeight: 1.35,
          }}
        >
          {requirementDetail}
        </div>
      ) : null}
    </button>
  );
}