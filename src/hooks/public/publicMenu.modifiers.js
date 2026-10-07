// src/hooks/public/publicMenu.modifiers.js

export function safeNum(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function safeHash(value) {
  try {
    const serialized = JSON.stringify(value || []);
    return `${serialized.length}:${serialized.slice(0, 160)}`;
  } catch {
    return String(Date.now());
  }
}

export function makeKey(productId, variantId) {
  return variantId ? `v:${productId}:${variantId}` : `p:${productId}`;
}

function normalizeBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  return ["1", "true", "yes", "on"].includes(
    String(value || "").trim().toLowerCase(),
  );
}

function normalizeNonNegativeInt(value, fallback = 0) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.max(0, Math.floor(number));
}

function normalizeNullableNonNegativeInt(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return Math.max(0, Math.floor(number));
}

function hasGroups(groups) {
  return Array.isArray(groups) && groups.length > 0;
}

function getProductLabel(product) {
  return product?.display_name || product?.name || "Producto";
}

function getComponentLabel(item, index = 0) {
  return (
    item?.component_product?.display_name ||
    item?.component_product?.name ||
    item?.name ||
    `Componente ${index + 1}`
  );
}

function getComponentVariantLabel(option, index = 0) {
  return (
    option?.label ||
    option?.name ||
    option?.variant_name ||
    `Variante ${index + 1}`
  );
}

/* =========================
   Modifier contract
========================= */

export function normalizeModifierOptionDefinition(option) {
  const source = option && typeof option === "object" ? option : {};

  const maxQuantity = Math.max(
    1,
    normalizeNonNegativeInt(
      source?.max_quantity_per_selection ?? source?.max_quantity ?? 1,
      1,
    ),
  );

  return {
    ...source,
    id: Number(source?.id || source?.modifier_option_id || 0),
    modifier_option_id: Number(source?.modifier_option_id || source?.id || 0),
    price: safeNum(source?.price, 0),
    affects_total: normalizeBoolean(source?.affects_total),
    track_inventory: normalizeBoolean(source?.track_inventory),
    is_default: normalizeBoolean(source?.is_default),
    max_quantity: maxQuantity,
    max_quantity_per_selection: maxQuantity,
  };
}

export function normalizeModifierGroupDefinition(group) {
  const source = group && typeof group === "object" ? group : {};

  const required = normalizeBoolean(
    source?.required ?? source?.is_required ?? false,
  );

  const minSelect = normalizeNonNegativeInt(
    source?.min_selections ?? source?.min_select ?? 0,
    0,
  );

  const maxSelect = normalizeNullableNonNegativeInt(
    source?.max_selections ?? source?.max_select ?? null,
  );

  return {
    ...source,
    id: Number(source?.id || source?.modifier_group_id || 0),
    modifier_group_id: Number(source?.modifier_group_id || source?.id || 0),
    required,
    is_required: required,
    min_selections: minSelect,
    min_select: minSelect,
    max_selections: maxSelect,
    max_select: maxSelect,
    selection_mode: String(source?.selection_mode || "").trim().toLowerCase(),
    options: (Array.isArray(source?.options) ? source.options : []).map(
      normalizeModifierOptionDefinition,
    ),
  };
}

function normalizeModifierDefinitions(groups) {
  return (Array.isArray(groups) ? groups : []).map(
    normalizeModifierGroupDefinition,
  );
}

/*
 * Backend cuenta min_select / max_select por unidades seleccionadas,
 * no por número de opciones distintas.
 */
export function getModifierSelectionCount(group, selectedMap = {}) {
  return Object.values(selectedMap || {}).reduce((total, value) => {
    const quantity = Number(value || 0);
    return Number.isFinite(quantity) && quantity > 0 ? total + quantity : total;
  }, 0);
}

export function getModifierDistinctSelectionCount(selectedMap = {}) {
  return Object.values(selectedMap || {}).filter((value) => {
    const quantity = Number(value || 0);
    return Number.isFinite(quantity) && quantity > 0;
  }).length;
}

/* =========================
   Cart modifier identity
========================= */

export function makeComponentModifierKey(
  componentProductId,
  componentVariantId = null,
) {
  return `${Number(componentProductId || 0)}:${
    componentVariantId ? Number(componentVariantId) : 0
  }`;
}

/*
 * Se conserva el contrato actual.
 * Esta función ya es utilizada por Público, Mesero y Caja.
 */
export function normalizeModifierGroupsForKey(groups) {
  const arr = Array.isArray(groups) ? groups : [];

  return arr
    .map((group) => ({
      modifier_group_id: Number(
        group?.modifier_group_id || group?.id || 0,
      ),
      applies_to_level: String(group?.applies_to_level || "order_item"),
      component_product_id: group?.component_product_id
        ? Number(group.component_product_id)
        : null,
      component_variant_id: group?.component_variant_id
        ? Number(group.component_variant_id)
        : null,
      options: (Array.isArray(group?.options) ? group.options : [])
        .map((option) => ({
          modifier_option_id: Number(
            option?.modifier_option_id || option?.id || 0,
          ),
          quantity: Number(option?.quantity || 1),
        }))
        .filter(
          (option) =>
            option.modifier_option_id > 0 &&
            option.quantity > 0,
        )
        .sort(
          (a, b) =>
            a.modifier_option_id - b.modifier_option_id,
        ),
    }))
    .filter(
      (group) =>
        group.modifier_group_id > 0 &&
        group.options.length > 0,
    )
    .sort((a, b) => {
      if (a.applies_to_level !== b.applies_to_level) {
        return String(a.applies_to_level).localeCompare(
          String(b.applies_to_level),
        );
      }

      if (
        safeNum(a.component_product_id, 0) !==
        safeNum(b.component_product_id, 0)
      ) {
        return (
          safeNum(a.component_product_id, 0) -
          safeNum(b.component_product_id, 0)
        );
      }

      if (
        safeNum(a.component_variant_id, 0) !==
        safeNum(b.component_variant_id, 0)
      ) {
        return (
          safeNum(a.component_variant_id, 0) -
          safeNum(b.component_variant_id, 0)
        );
      }

      return a.modifier_group_id - b.modifier_group_id;
    });
}

export function buildModifierDisplayGroupsFromApiGroups(groups) {
  const arr = Array.isArray(groups) ? groups : [];
  const map = {};

  arr.forEach((group) => {
    const groupName = String(
      group?.group_name_snapshot || group?.name || "Extras",
    );

    const appliesToLevel = String(
      group?.applies_to_level || "order_item",
    );

    const componentProductId = group?.component_product_id
      ? Number(group.component_product_id)
      : null;

    const componentVariantId = group?.component_variant_id
      ? Number(group.component_variant_id)
      : null;

    const key = [
      groupName,
      appliesToLevel,
      componentProductId || 0,
      componentVariantId || 0,
    ].join("|");

    if (!map[key]) {
      map[key] = {
        group_name: groupName,
        applies_to_level: appliesToLevel,
        component_product_id: componentProductId,
        component_variant_id: componentVariantId,
        context_label: group?.context_label || null,
        context_source: group?.context_source || null,
        group_total: 0,
        options: [],
      };
    }

    (Array.isArray(group?.options) ? group.options : []).forEach((option) => {
      const totalPrice = Number(option?.total_price || 0);

      map[key].options.push({
        id: Number(option?.id || 0),
        modifier_group_id: Number(
          option?.modifier_group_id ||
            group?.modifier_group_id ||
            group?.id ||
            0,
        ),
        modifier_option_id: Number(
          option?.modifier_option_id || option?.id || 0,
        ),
        name: String(
          option?.name || option?.name_snapshot || "Extra",
        ),
        quantity: Number(option?.quantity || 1),
        unit_price: Number(option?.unit_price || 0),
        total_price: totalPrice,
        affects_total: !!option?.affects_total,
      });

      map[key].group_total =
        Number(map[key].group_total || 0) + totalPrice;
    });
  });

  return Object.values(map).map((group) => ({
    ...group,
    group_total: Math.round(Number(group.group_total || 0) * 100) / 100,
  }));
}

export function normalizeCompositeComponentsForKey(components) {
  const arr = Array.isArray(components) ? components : [];

  return arr
    .map((component) => ({
      component_product_id: Number(
        component?.component_product_id || 0,
      ),
      variant_id: component?.variant_id
        ? Number(component.variant_id)
        : null,
      quantity:
        component?.quantity == null || component?.quantity === ""
          ? null
          : Number(component.quantity),
      modifiers: normalizeModifierGroupsForKey(
        component?.modifiers || [],
      ),
    }))
    .filter((component) => component.component_product_id > 0)
    .sort((a, b) => {
      if (a.component_product_id !== b.component_product_id) {
        return a.component_product_id - b.component_product_id;
      }

      if (safeNum(a.variant_id, 0) !== safeNum(b.variant_id, 0)) {
        return safeNum(a.variant_id, 0) - safeNum(b.variant_id, 0);
      }

      return safeHash(a.modifiers).localeCompare(safeHash(b.modifiers));
    });
}

export function buildCartKey(
  productId,
  variantId,
  components = [],
  modifiers = [],
) {
  const chunks = [makeKey(productId, variantId)];

  const normalizedComponents =
    normalizeCompositeComponentsForKey(components);

  const normalizedModifiers =
    normalizeModifierGroupsForKey(modifiers);

  if (normalizedComponents.length) {
    chunks.push(`c:${safeHash(normalizedComponents)}`);
  }

  if (normalizedModifiers.length) {
    chunks.push(`m:${safeHash(normalizedModifiers)}`);
  }

  return chunks.join(":");
}

/* =========================
   Composite presentation
========================= */

export function formatComponentDetailLabel(detail) {
  const base =
    detail?.component_display_name ||
    detail?.component_name ||
    (detail?.component_product_id
      ? `Componente #${detail.component_product_id}`
      : "Componente");

  const variant =
    detail?.variant_name ||
    detail?.selected_variant_name ||
    detail?.variant_label ||
    "";

  return variant ? `${base} · ${variant}` : base;
}

export function buildCompositeDetailsFromDraft(product, draftRows = []) {
  const rows = Array.isArray(draftRows) ? draftRows : [];

  return rows
    .filter((row) => row && row.included !== false)
    .map((row) => {
      const variant = Array.isArray(row.variants)
        ? row.variants.find(
            (item) => Number(item.id) === Number(row.variant_id),
          )
        : null;

      return {
        component_product_id: Number(row.component_product_id),
        component_name: row.name || "Componente",
        component_display_name: row.name || "Componente",
        variant_id: row.variant_id ? Number(row.variant_id) : null,
        variant_name: variant?.name || null,
        quantity:
          row.quantity == null || row.quantity === ""
            ? 1
            : Number(row.quantity),
        is_optional: !!row.is_optional,
        allow_variant: !!row.allow_variant,
        apply_variant_price: !!row.apply_variant_price,
        modifier_groups_display: [],
      };
    });
}

/* =========================
   Modifier presentation
========================= */

export function getSelectionModeLabel(value) {
  const normalized = String(value || "").trim().toLowerCase();

  const map = {
    single: "Selección única",
    multiple: "Selección múltiple",
    quantity: "Cantidad",
  };

  return map[normalized] || (value ? String(value) : "Configuración libre");
}

export function formatModifierGroupMeta(group) {
  if (!group || typeof group !== "object") {
    return "";
  }

  const normalized = normalizeModifierGroupDefinition(group);
  const parts = [
    normalized.is_required ? "Obligatorio" : "Opcional",
  ];

  if (normalized.selection_mode) {
    parts.push(getSelectionModeLabel(normalized.selection_mode));
  }

  if (normalized.min_select > 0 || normalized.max_select !== null) {
    if (normalized.max_select !== null) {
      parts.push(
        `Mín. ${normalized.min_select} · Máx. ${normalized.max_select}`,
      );
    } else {
      parts.push(`Mín. ${normalized.min_select}`);
    }
  }

  return parts.join(" · ");
}

export function hasAnyModifierGroups(product) {
  if (!product || typeof product !== "object") {
    return false;
  }

  if (hasGroups(product?.modifier_groups)) {
    return true;
  }

  const variants = Array.isArray(product?.variants) ? product.variants : [];

  if (variants.some((variant) => hasGroups(variant?.modifier_groups))) {
    return true;
  }

  const compositeItems = Array.isArray(product?.composite?.items)
    ? product.composite.items
    : [];

  if (compositeItems.some((item) => hasGroups(item?.modifier_groups))) {
    return true;
  }

  for (const item of compositeItems) {
    const options = Array.isArray(item?.selector?.options)
      ? item.selector.options
      : [];

    if (options.some((option) => hasGroups(option?.modifier_groups))) {
      return true;
    }
  }

  return false;
}

/* =========================
   Modifier contexts
========================= */

function buildProductSection(product, allowEmpty = false) {
  const groups = normalizeModifierDefinitions(product?.modifier_groups);

  if (!allowEmpty && groups.length === 0) {
    return null;
  }

  const label = getProductLabel(product);

  return {
    key: `product-${product?.id || "x"}`,
    context_type: "product",
    title: "Extras del producto",
    subtitle: label,
    entity_label: label,
    entity_id: Number(product?.id || 0) || null,
    groups,
    group_count: groups.length,
    has_groups: groups.length > 0,
  };
}

function buildVariantSection(product, variant, index) {
  const groups = normalizeModifierDefinitions(variant?.modifier_groups);

  if (groups.length === 0) {
    return null;
  }

  const productLabel = getProductLabel(product);
  const variantLabel = variant?.name || `Variante ${index + 1}`;

  return {
    key: `variant-${variant?.id || index}`,
    context_type: "variant",
    title: "Extras por variante",
    subtitle: `${productLabel} · ${variantLabel}`,
    entity_label: variantLabel,
    entity_id: Number(variant?.id || 0) || null,
    groups,
    group_count: groups.length,
    has_groups: true,
    variant,
  };
}

function buildComponentSection(product, item, index) {
  const groups = normalizeModifierDefinitions(item?.modifier_groups);

  if (groups.length === 0) {
    return null;
  }

  const productLabel = getProductLabel(product);
  const componentLabel = getComponentLabel(item, index);
  const componentProductId =
    Number(item?.component_product_id || 0) || null;

  return {
    key: `component-${product?.id || "x"}-${componentProductId || index}`,
    context_type: "component",
    title: "Extras por componente",
    subtitle: `${productLabel} · ${componentLabel}`,
    entity_label: componentLabel,
    entity_id: componentProductId,
    component_product_id: componentProductId,
    groups,
    group_count: groups.length,
    has_groups: true,
    component: item,
  };
}

function buildComponentVariantSection(
  product,
  item,
  itemIndex,
  option,
  optionIndex,
) {
  const groups = normalizeModifierDefinitions(option?.modifier_groups);

  if (groups.length === 0) {
    return null;
  }

  const productLabel = getProductLabel(product);
  const componentLabel = getComponentLabel(item, itemIndex);
  const variantLabel = getComponentVariantLabel(option, optionIndex);

  const componentProductId =
    Number(item?.component_product_id || 0) || null;

  const componentVariantId =
    Number(option?.variant_id || 0) || null;

  return {
    key:
      `component-variant-${product?.id || "x"}-` +
      `${componentProductId || itemIndex}-${componentVariantId || optionIndex}`,
    context_type: "component_variant",
    title: "Extras por variante del componente",
    subtitle: `${productLabel} · ${componentLabel} · ${variantLabel}`,
    entity_label: `${componentLabel} · ${variantLabel}`,
    component_label: componentLabel,
    variant_label: variantLabel,
    entity_id: componentVariantId,
    component_product_id: componentProductId,
    component_variant_id: componentVariantId,
    groups,
    group_count: groups.length,
    has_groups: true,
    component: item,
    option,
  };
}

function buildCompositeDraftMap(compositeDraft) {
  if (!Array.isArray(compositeDraft)) {
    return {};
  }

  return compositeDraft.reduce((map, row) => {
    const componentProductId = Number(row?.component_product_id || 0);

    if (componentProductId > 0) {
      map[componentProductId] = row;
    }

    return map;
  }, {});
}

function findSelectedComponentVariantOption(item, variantId) {
  if (!variantId) {
    return null;
  }

  const options = Array.isArray(item?.selector?.options)
    ? item.selector.options
    : [];

  return (
    options.find(
      (option) =>
        Number(option?.variant_id || 0) === Number(variantId),
    ) || null
  );
}

/*
 * Solo vista:
 * - muestra todos los contextos reales;
 * - variantes/componentes vacíos no generan entidad;
 * - Producto sí puede generarse vacío desde buildModifierContextSections()
 *   para que el navegador muestre su card deshabilitado.
 */
function appendReadOnlyCompositeSections(
  sections,
  product,
  compositeItems,
  compositeDraft,
) {
  const draftMap = buildCompositeDraftMap(compositeDraft);
  const hasDraft = Array.isArray(compositeDraft);

  compositeItems.forEach((item, itemIndex) => {
    const componentProductId = Number(
      item?.component_product_id || 0,
    );

    const draftRow = draftMap[componentProductId] || null;

    if (hasDraft && draftRow && draftRow.included === false) {
      return;
    }

    const componentSection = buildComponentSection(
      product,
      item,
      itemIndex,
    );

    if (componentSection) {
      sections.push(componentSection);
    }

    const selectedVariantId =
      hasDraft && draftRow?.variant_id
        ? Number(draftRow.variant_id)
        : null;

    const options = Array.isArray(item?.selector?.options)
      ? item.selector.options
      : [];

    options.forEach((option, optionIndex) => {
      const optionVariantId = Number(option?.variant_id || 0);

      if (
        selectedVariantId &&
        selectedVariantId !== optionVariantId
      ) {
        return;
      }

      const section = buildComponentVariantSection(
        product,
        item,
        itemIndex,
        option,
        optionIndex,
      );

      if (section) {
        sections.push(section);
      }
    });
  });
}

/*
 * Compra real de un compuesto:
 * - producto padre conserva sus propios extras si existen;
 * - variante seleccionada del componente reemplaza el contexto base;
 * - sin variante se utiliza item.modifier_groups;
 * - nunca se suman ambos.
 */
function appendSelectedCompositeSections(
  sections,
  product,
  compositeItems,
  compositeDraft,
) {
  const hasDraft = Array.isArray(compositeDraft);
  const draftMap = buildCompositeDraftMap(compositeDraft);

  compositeItems.forEach((item, itemIndex) => {
    const componentProductId = Number(
      item?.component_product_id || 0,
    );

    const draftRow = draftMap[componentProductId] || null;

    if (hasDraft && !draftRow) {
      return;
    }

    if (draftRow && draftRow.included === false) {
      return;
    }

    const selectedVariantId = draftRow?.variant_id
      ? Number(draftRow.variant_id)
      : null;

    if (selectedVariantId) {
      const selectedOption = findSelectedComponentVariantOption(
        item,
        selectedVariantId,
      );

      if (!selectedOption) {
        return;
      }

      const options = Array.isArray(item?.selector?.options)
        ? item.selector.options
        : [];

      const optionIndex = Math.max(
        0,
        options.findIndex(
          (option) =>
            Number(option?.variant_id || 0) === selectedVariantId,
        ),
      );

      const section = buildComponentVariantSection(
        product,
        item,
        itemIndex,
        selectedOption,
        optionIndex,
      );

      if (section) {
        sections.push(section);
      }

      return;
    }

    const section = buildComponentSection(
      product,
      item,
      itemIndex,
    );

    if (section) {
      sections.push(section);
    }
  });
}

export function buildModifierContextSections(product, opts = {}) {
  if (!product || typeof product !== "object") {
    return [];
  }

  const {
    variantId = null,
    compositeDraft = null,
    selectionScope = "all",
  } = opts || {};

  const scope = String(selectionScope || "all").trim().toLowerCase();
  const sections = [];

  /*
   * Solo vista.
   *
   * Producto aparece incluso vacío cuando existe al menos algún modifier
   * en otro contexto. Así puede mostrarse:
   *
   * PRODUCTO
   * Sin extras
   *
   * sin provocar que un producto completamente sin extras parezca tenerlos.
   */
  if (scope === "all" && hasAnyModifierGroups(product)) {
    const productSection = buildProductSection(product, true);

    if (productSection) {
      sections.push(productSection);
    }
  }

  /*
   * Selección del producto base o compuesto.
   */
  if (scope === "product_only" || scope === "composite_only") {
    const productSection = buildProductSection(product);

    if (productSection) {
      sections.push(productSection);
    }
  }

  /*
   * Variante real del producto.
   *
   * variant.modifier_groups es la configuración efectiva completa.
   * No se agregan product.modifier_groups.
   */
  if (scope === "all" || scope === "variant_only") {
    const variants = Array.isArray(product?.variants)
      ? product.variants
      : [];

    variants.forEach((variant, index) => {
      if (
        variantId != null &&
        Number(variant?.id) !== Number(variantId)
      ) {
        return;
      }

      const section = buildVariantSection(
        product,
        variant,
        index,
      );

      if (section) {
        sections.push(section);
      }
    });
  }

  if (scope !== "all" && scope !== "composite_only") {
    return sections;
  }

  const compositeItems = Array.isArray(product?.composite?.items)
    ? product.composite.items
    : [];

  if (compositeItems.length === 0) {
    return sections;
  }

  if (scope === "all") {
    appendReadOnlyCompositeSections(
      sections,
      product,
      compositeItems,
      compositeDraft,
    );

    return sections;
  }

  appendSelectedCompositeSections(
    sections,
    product,
    compositeItems,
    compositeDraft,
  );

  return sections;
}