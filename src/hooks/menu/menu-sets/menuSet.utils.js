// src/hooks/menu/menu-sets/menuSet.utils.js

/*
 * Normalización compartida de Conjuntos.
 * No calcula precios, inventario ni capacidad comercial.
 * Conserva los datos originales para no perder información del servidor.
 */

export const MENU_SET_KIND = "menu_set";
export const MENU_SET_PAGE_SIZE = 5;

export const CATALOG_MODE_NORMAL = "normal";
export const CATALOG_MODE_SETS = "sets";
export const CATALOG_MODE_MIXED = "mixed";

const CATALOG_MODES = new Set([
  CATALOG_MODE_NORMAL,
  CATALOG_MODE_SETS,
  CATALOG_MODE_MIXED,
]);

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function positiveId(value) {
  if (value === null || value === undefined || value === "") return null;

  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

function nonNegativeInteger(value) {
  if (value === null || value === undefined || value === "") return null;

  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : null;
}

function optionalBoolean(value) {
  if (value === true || value === 1 || value === "1") return true;
  if (value === false || value === 0 || value === "0") return false;
  return null;
}

function text(value, fallback = "") {
  const result = String(value ?? "").trim();
  return result || fallback;
}

function imageValue(value) {
  if (typeof value !== "string") return null;
  return value.trim() || null;
}

function orderByPosition(rows) {
  return [...rows].sort((a, b) => {
    const left = a.sortOrder;
    const right = b.sortOrder;

    if (left === null && right === null) return a.originalIndex - b.originalIndex;
    if (left === null) return 1;
    if (right === null) return -1;

    return left - right || a.originalIndex - b.originalIndex;
  });
}

export function normalizeCatalogMode(value) {
  const mode = text(value).toLowerCase();
  return CATALOG_MODES.has(mode) ? mode : null;
}

export function getCatalogModeVisibility(value) {
  const mode = normalizeCatalogMode(value);

  return {
    mode,
    showNormalProducts: mode === CATALOG_MODE_NORMAL || mode === CATALOG_MODE_MIXED,
    showMenuSets: mode === CATALOG_MODE_SETS || mode === CATALOG_MODE_MIXED,
    isValid: mode !== null,
  };
}

export function getMenuSetAvailability(source) {
  const item = asObject(source);
  const availability = asObject(item.availability);
  const receivedStatus = text(
    availability.status ?? item.status,
    ).toLowerCase();

  const availabilityStatuses = [
    "available",
    "capacity_exhausted",
    "inventory_exhausted",
    "both_exhausted",
    "configuration_unavailable",
    "out_of_stock",
    "insufficient_stock",
    "recipe_missing",
    "inventory_blocked",
    "unavailable_by_schedule",
    "no_longer_sellable",
    ];

  const status = availabilityStatuses.includes(receivedStatus)
    ? receivedStatus
    : "";

  const explicitAvailable = optionalBoolean(
    item.is_available ?? availability.is_available,
  );

  const explicitlySellable = optionalBoolean(
    item.is_sellable ?? availability.is_sellable,
  );

  const isAvailable = explicitlySellable === false
    ? false
    : explicitAvailable !== null
      ? explicitAvailable
      : status === "available"
        ? true
        : status
          ? false
          : null;

  const preparedChoices = asArray(
    availability.prepared_choices ?? item.prepared_choices,
  ).map((choice) => ({
    preparedItemId: positiveId(choice?.prepared_item_id),
    variantId: positiveId(choice?.variant_id),
    source: choice,
  })).filter((choice) => choice.preparedItemId !== null);

  const requiresPreparedSelection = optionalBoolean(
    availability.prepared_selection_required ?? item.prepared_selection_required,
  ) === true;

  const availableViaPreparedItem = optionalBoolean(
    availability.available_via_prepared_item ?? item.available_via_prepared_item,
  ) === true;

  const reason = text(
    item.reason ?? availability.reason,
    isAvailable === false ? "Esta opción no está disponible." : "",
  );

  return {
    status,
    isAvailable,
    isSellable: explicitlySellable,
    reason,
    requiresPreparedSelection,
    availableViaPreparedItem,
    preparedChoices,
    source: availability,
  };
}

export function normalizeMenuSetOption(source, index = 0) {
  const option = asObject(source);
  const product = asObject(option.product);
  const availability = getMenuSetAvailability(option);

  const optionId = positiveId(
    option.menu_set_product_id ?? option.option_id ?? option.id,
  );

  const productId = positiveId(
    option.product_id ?? product.id,
  );

  const variants = asArray(option.variants ?? product.variants);

  return {
    kind: "menu_set_option",
    id: optionId,
    menuSetProductId: optionId,
    productId,
    name: text(
      option.product_name ?? option.display_name ??
      product.display_name ?? product.name ?? option.name,
      "Producto",
    ),
    description: text(option.description ?? product.description),
    productType: text(option.product_type ?? product.product_type, "simple"),
    isActive: optionalBoolean(option.is_active),
    isAvailable: availability.isAvailable,
    availability,
    variants,
    modifierGroups: asArray(option.modifier_groups ?? product.modifier_groups),
    composite: option.composite ?? product.composite ?? null,
    image: imageValue(
      option.image_url ?? product.image_url ??
      option.image ?? product.image,
    ),
    sortOrder: nonNegativeInteger(option.sort_order),
    originalIndex: index,
    source: option,
    productSource: product,
  };
}

export function normalizeMenuSetStage(source, index = 0) {
  const stage = asObject(source);
  const definition = asObject(stage.stage_definition);

  const stageDefinitionId = positiveId(
    stage.menu_set_stage_definition_id ??
    stage.stage_definition_id ??
    definition.id,
  );

  const rawOptions = asArray(
    stage.options ?? stage.menu_set_products,
  );

  const options = orderByPosition(
    rawOptions.map(normalizeMenuSetOption).filter((option) => option.id !== null),
  );

  const required = optionalBoolean(stage.required) === true;
  const minSelections = nonNegativeInteger(stage.min_selections);
  const maxSelections = nonNegativeInteger(stage.max_selections);

  return {
    id: positiveId(stage.stage_id ?? stage.id),
    stageDefinitionId,
    name: text(
      stage.name ?? stage.stage_name ?? definition.name,
      "Etapa",
    ),
    description: text(stage.description ?? definition.description),
    required,
    minSelections,
    maxSelections,
    isActive: optionalBoolean(stage.is_active),
    isSatisfied: optionalBoolean(stage.is_satisfied),
    reason: text(stage.reason),
    options,
    availableOptions: nonNegativeInteger(stage.available_options),
    sortOrder: nonNegativeInteger(stage.sort_order),
    originalIndex: index,
    source: stage,
  };
}

export function normalizeMenuSet(source, index = 0) {
  const set = asObject(source);
  const rawAvailability = asObject(set.availability);
  const availability = getMenuSetAvailability(set);

  const stages = orderByPosition(
    asArray(set.stages)
      .map(normalizeMenuSetStage)
      .filter((stage) => stage.stageDefinitionId !== null && stage.isActive !== false),
  );

  const rawPrice = set.price;
  const numericPrice = rawPrice === null || rawPrice === undefined || rawPrice === ""
    ? null
    : Number(rawPrice);

  const price = Number.isFinite(numericPrice) && numericPrice >= 0
    ? numericPrice
    : null;

  const isActive = optionalBoolean(set.is_active);

  return {
    kind: MENU_SET_KIND,
    id: positiveId(set.menu_set_id ?? set.id),
    name: text(set.name, "Conjunto"),
    billingName: text(set.billing_name ?? set.name, "Conjunto"),
    description: text(set.description),
    price,
    image: imageValue(set.image_url ?? set.image),
    isActive,
    isSellable: optionalBoolean(
      set.is_sellable ?? rawAvailability.is_sellable,
    ),
    availability,
    stages,
    sortOrder: nonNegativeInteger(set.sort_order),
    originalIndex: index,
    source: set,
  };
}

export function normalizeMenuSetCatalog(payload) {
  const wrapper = asObject(payload);
  const data = asObject(wrapper.data);
  const body = Object.keys(data).length > 0 ? data : wrapper;

  const rawSets = Array.isArray(payload)
    ? payload
    : asArray(body.menu_sets ?? body.sets ?? body.data?.menu_sets);

  const menuSets = orderByPosition(
    rawSets.map(normalizeMenuSet).filter((set) => set.id !== null),
  );

  const catalogMode = normalizeCatalogMode(
    body.catalog_mode ?? wrapper.catalog_mode,
  );

  return {
    catalogMode,
    visibility: getCatalogModeVisibility(catalogMode),
    menuSets,
    total: menuSets.length,
    source: payload,
  };
}

export function getMenuSetById(menuSets, menuSetId) {
  const id = positiveId(menuSetId);
  if (!id) return null;

  return asArray(menuSets).find((set) => {
    return positiveId(set?.id ?? set?.menu_set_id) === id;
  }) || null;
}

export function getMenuSetStageByDefinitionId(menuSet, stageDefinitionId) {
  const id = positiveId(stageDefinitionId);
  if (!id) return null;

  return asArray(menuSet?.stages).find((stage) => {
    return positiveId(
      stage?.stageDefinitionId ?? stage?.menu_set_stage_definition_id,
    ) === id;
  }) || null;
}

export function getMenuSetOptionById(stage, menuSetProductId) {
  const id = positiveId(menuSetProductId);
  if (!id) return null;

  return asArray(stage?.options).find((option) => {
    return positiveId(
      option?.menuSetProductId ?? option?.menu_set_product_id ?? option?.id,
    ) === id;
  }) || null;
}

export function isMenuSetOptionSelectable(option, preparedItemId = null) {
  if (!option || option.isActive === false) return false;

  const availability = option.availability?.isAvailable !== undefined
    ? option.availability
    : getMenuSetAvailability(option);

  if (availability.isAvailable === false) return false;

  if (availability.requiresPreparedSelection) {
    const id = positiveId(preparedItemId);
    return id !== null && availability.preparedChoices.some(
      (choice) => choice.preparedItemId === id,
    );
  }

  return true;
}

export function getMenuSetPage(items, page = 1) {
  const rows = asArray(items);
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / MENU_SET_PAGE_SIZE));
  const requestedPage = Number(page);
  const currentPage = Number.isFinite(requestedPage)
    ? Math.max(1, Math.min(totalPages, Math.floor(requestedPage)))
    : 1;

  const start = (currentPage - 1) * MENU_SET_PAGE_SIZE;

  return {
    items: rows.slice(start, start + MENU_SET_PAGE_SIZE),
    page: currentPage,
    pageSize: MENU_SET_PAGE_SIZE,
    total,
    totalPages,
    hasPrevious: currentPage > 1,
    hasNext: currentPage < totalPages,
  };
}