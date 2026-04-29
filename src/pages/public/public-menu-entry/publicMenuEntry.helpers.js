// Helpers internos de PublicMenuEntryPage para no mezclar utilidades con el render principal.

import { buildModifierContextSections } from "../../../hooks/public/publicMenu.utils";

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function buildComponentModifierKey(componentProductId, variantId = null) {
  return `${Number(componentProductId || 0)}:${variantId ? Number(variantId) : 0}`;
}

export function applyComponentModifierPayloadToComponents(
  components = [],
  componentModifiers = [],
) {
  const grouped = {};

  (Array.isArray(componentModifiers) ? componentModifiers : []).forEach(
    (group) => {
      const key = buildComponentModifierKey(
        group?.component_product_id,
        group?.component_variant_id,
      );

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(group);
    },
  );

  return (Array.isArray(components) ? components : []).map((component) => {
    const key = buildComponentModifierKey(
      component?.component_product_id,
      component?.variant_id,
    );

    return {
      ...component,
      modifiers: grouped[key] || [],
    };
  });
}

export function applyComponentDisplayGroupsToDetails(
  details = [],
  componentDisplayGroups = [],
) {
  const grouped = {};

  (Array.isArray(componentDisplayGroups) ? componentDisplayGroups : []).forEach(
    (group) => {
      const key = buildComponentModifierKey(
        group?.component_product_id,
        group?.component_variant_id,
      );

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(group);
    },
  );

  return (Array.isArray(details) ? details : []).map((detail) => {
    const key = buildComponentModifierKey(
      detail?.component_product_id,
      detail?.variant_id,
    );

    return {
      ...detail,
      modifier_groups_display: grouped[key] || [],
    };
  });
}

export function hasContextualModifiers(product, opts = {}) {
  return buildModifierContextSections(product, opts).length > 0;
}

export function isValidHexColor(color) {
  return /^#[0-9A-Fa-f]{6}$/.test(String(color || ""));
}