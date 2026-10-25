// src/hooks/menu/menu-sets/menuSetPayload.utils.js

import { normalizeModifierGroupsForKey } from "../../public/publicMenu.utils";
import { MENU_SET_KIND } from "./menuSet.utils";

export class MenuSetPayloadError extends Error {
  constructor(message) {
    super(message);
    this.name = "MenuSetPayloadError";
  }
}

function invalid(message) {
  throw new MenuSetPayloadError(message);
}

function positiveId(value, label) {
  const number = Number(value);

  if (!Number.isSafeInteger(number) || number <= 0) {
    invalid(`No se pudo identificar ${label}.`);
  }

  return number;
}

function optionalPositiveId(value, label) {
  if (value === null || value === undefined || value === "") return null;
  return positiveId(value, label);
}

function positiveQuantity(value, label) {
  const number = Number(value);

  if (!Number.isSafeInteger(number) || number < 1) {
    invalid(`La cantidad de ${label} no es válida.`);
  }

  return number;
}

function normalizeNotes(value) {
  const notes = String(value ?? "").trim();
  return notes ? notes.slice(0, 500) : null;
}

function serializeModifierGroups(source) {
  const normalized = normalizeModifierGroupsForKey(
    Array.isArray(source) ? source : [],
  );

  const seenGroups = new Set();

  return normalized.map((group) => {
    const groupId = positiveId(
      group.modifier_group_id ?? group.id,
      "un grupo de extras",
    );

    if (seenGroups.has(groupId)) {
      invalid("Un grupo de extras aparece repetido.");
    }

    seenGroups.add(groupId);
    const seenOptions = new Set();

    const options = (Array.isArray(group.options) ? group.options : []).map((option) => {
      const optionId = positiveId(
        option.modifier_option_id ?? option.id,
        "una opción de extras",
      );

      if (seenOptions.has(optionId)) {
        invalid("Una opción de extras aparece repetida.");
      }

      seenOptions.add(optionId);

      return {
        modifier_option_id: optionId,
        quantity: positiveQuantity(option.quantity ?? 1, "los extras"),
      };
    });

    return {
      modifier_group_id: groupId,
      options,
    };
  }).filter((group) => group.options.length > 0);
}

function serializeComponents(source, depth = 0, ancestors = []) {
  if (!Array.isArray(source)) return [];

  if (depth >= 12) {
    invalid("El producto tiene demasiados niveles de componentes.");
  }

  const seenComponents = new Set();

  return source.map((component) => {
    const componentId = positiveId(
      component?.component_product_id,
      "un componente del producto",
    );

    if (seenComponents.has(componentId) || ancestors.includes(componentId)) {
      invalid("El producto contiene componentes repetidos o una selección circular.");
    }

    seenComponents.add(componentId);

    const result = {
      component_product_id: componentId,
    };

    const variantId = optionalPositiveId(
      component?.variant_id,
      "la variante de un componente",
    );

    if (variantId !== null) result.variant_id = variantId;

    if (component?.quantity !== null && component?.quantity !== undefined) {
      result.quantity = positiveQuantity(component.quantity, "un componente");
    }

    const modifiers = serializeModifierGroups(component?.modifiers);
    if (modifiers.length > 0) result.modifiers = modifiers;

    const children = serializeComponents(
      component?.components,
      depth + 1,
      [...ancestors, componentId],
    );

    if (children.length > 0) result.components = children;

    return result;
  });
}

export function serializeMenuSetOptionSelection(source) {
  const item = source && typeof source === "object" ? source : {};

  const optionId = positiveId(
    item.menuSetProductId ?? item.menu_set_product_id ?? item.option_id,
    "la opción seleccionada",
  );

  if (item.quantity !== undefined && Number(item.quantity) !== 1) {
    invalid("Cada opción de una etapa representa una sola unidad.");
  }

  const result = {
    menu_set_product_id: optionId,
  };

  const preparedItemId = optionalPositiveId(
    item.preparedItemId ?? item.prepared_item_id,
    "la preparación seleccionada",
  );

  if (preparedItemId !== null) {
    if (
      (Array.isArray(item.modifiers) && item.modifiers.length > 0) ||
      (Array.isArray(item.components) && item.components.length > 0) ||
      optionalPositiveId(item.variantId ?? item.variant_id, "la variante") !== null
    ) {
      invalid("Una preparación ya elaborada conserva su configuración original.");
    }

    result.prepared_item_id = preparedItemId;
  } else {
    const variantId = optionalPositiveId(
      item.variantId ?? item.variant_id,
      "la variante seleccionada",
    );

    if (variantId !== null) result.variant_id = variantId;

    const modifiers = serializeModifierGroups(item.modifiers);
    if (modifiers.length > 0) result.modifiers = modifiers;

    const components = serializeComponents(item.components);
    if (components.length > 0) result.components = components;
  }

  const notes = normalizeNotes(item.notes);
  if (notes !== null) result.notes = notes;

  return result;
}

export function serializeMenuSetStageSelection(source) {
  const stage = source && typeof source === "object" ? source : {};

  const stageDefinitionId = positiveId(
    stage.stageDefinitionId ??
    stage.menu_set_stage_definition_id ??
    stage.stage_definition_id,
    "la etapa del Conjunto",
  );

  const rawItems = Array.isArray(stage.items) ? stage.items : [];
  const seenOptions = new Set();

  const items = rawItems.map((item) => {
    const normalized = serializeMenuSetOptionSelection(item);
    const optionId = normalized.menu_set_product_id;

    if (seenOptions.has(optionId)) {
      invalid("No puedes repetir el mismo producto dentro de una etapa.");
    }

    seenOptions.add(optionId);
    return normalized;
  });

  return {
    menu_set_stage_definition_id: stageDefinitionId,
    items,
  };
}

/*
 * Formato de entrada de los pedidos:
 * menu_set_id + quantity=1 + selections[].
 *
 * La conversión de selections[] a stages[] pertenece al servidor.
 */
export function buildMenuSetSelectionPayload(source) {
  const data = source && typeof source === "object" ? source : {};

  const menuSetId = positiveId(
    data.menuSetId ?? data.menu_set_id ?? data.menuSet?.id,
    "el Conjunto",
  );

  const rawStages = Array.isArray(data.stages)
    ? data.stages
    : Array.isArray(data.selections)
      ? data.selections
      : [];

  const seenStages = new Set();

  const selections = rawStages.map(serializeMenuSetStageSelection).filter((stage) => {
    return stage.items.length > 0;
  });

  selections.forEach((stage) => {
    const id = stage.menu_set_stage_definition_id;

    if (seenStages.has(id)) {
      invalid("No puedes incluir dos veces la misma etapa.");
    }

    seenStages.add(id);
  });

  if (selections.length === 0) {
    invalid("Selecciona al menos un producto para completar tu Conjunto.");
  }

  return {
    menu_set_id: menuSetId,
    quantity: 1,
    selections,
  };
}

export function isMenuSetCartLine(item) {
  if (!item || typeof item !== "object") return false;

  return item.kind === MENU_SET_KIND ||
    item.commercial_type === MENU_SET_KIND ||
    (item.menu_set_id !== null && item.menu_set_id !== undefined);
}

function buildMenuSetDisplayStages(menuSet, draftStages, selections) {
  const catalogStages = Array.isArray(menuSet?.stages) ? menuSet.stages : [];
  const drafts = Array.isArray(draftStages) ? draftStages : [];

  return selections.map((selectedStage, stageIndex) => {
    const stageId = Number(selectedStage.menu_set_stage_definition_id);

    const catalogStage = catalogStages.find((stage) =>
      Number(stage?.stageDefinitionId ?? stage?.menu_set_stage_definition_id) === stageId
    );

    const draftStage = drafts.find((stage) =>
      Number(stage?.stageDefinitionId ?? stage?.menu_set_stage_definition_id) === stageId
    );

    const items = selectedStage.items.map((selectedItem) => {
      const optionId = Number(selectedItem.menu_set_product_id);

      const option = (Array.isArray(catalogStage?.options) ? catalogStage.options : []).find((row) =>
        Number(row?.menuSetProductId ?? row?.menu_set_product_id ?? row?.id) === optionId
      );

      const original = (Array.isArray(draftStage?.items) ? draftStage.items : []).find((row) =>
        Number(row?.menuSetProductId ?? row?.menu_set_product_id ?? row?.option_id) === optionId
      );

      const variant = (Array.isArray(option?.variants) ? option.variants : []).find((row) =>
        Number(row?.id) === Number(selectedItem?.variant_id || 0)
      );

      return {
        ...selectedItem,
        product_name: option?.name || "Producto seleccionado",
        variant_name: variant?.display_name || variant?.name || null,
        modifiers: Array.isArray(original?.modifiers) ? original.modifiers : selectedItem.modifiers || [],
        components: Array.isArray(original?.components) ? original.components : selectedItem.components || [],
        notes: original?.notes ?? selectedItem.notes ?? null,
      };
    });

    return {
      menu_set_stage_definition_id: stageId,
      menu_set_stage_name_snapshot: catalogStage?.name || `Etapa ${stageIndex + 1}`,
      items,
    };
  });
}

/*
 * Genera una partida local.
 * El importe definitivo será confirmado por el servidor.
 */
export function buildMenuSetCartLine({ menuSet, stages, key }) {
  const set = menuSet && typeof menuSet === "object" ? menuSet : {};

  const payload = buildMenuSetSelectionPayload({
    menuSetId: set.id ?? set.menu_set_id,
    stages,
  });

  if (!key || typeof key !== "string") {
    invalid("No se pudo identificar la selección del Conjunto.");
  }

  const rawPrice = set.price;
  const price = rawPrice === null || rawPrice === undefined
    ? null
    : Number(rawPrice);

    return {
        key,
        kind: MENU_SET_KIND,
        commercial_type: MENU_SET_KIND,
        menu_set_id: payload.menu_set_id,
        quantity: 1,
        name: String(set.name || "Conjunto"),
        image: set.image || null,
        unit_price: Number.isFinite(price) && price >= 0 ? price : null,
        price_is_estimated: true,
        requires_server_pricing: true,
        selections: payload.selections,
        display_stages: buildMenuSetDisplayStages(set, stages, payload.selections),
    };
}

/*
 * Integra Conjuntos con el serializador de productos normales.
 * Respeta el orden original del carrito y no altera Preparación rápida.
 *
 * serializeNormalItems debe recibir un arreglo y devolver otro arreglo.
 */
export function serializeCartItemsWithMenuSets(cart, serializeNormalItems) {
  if (typeof serializeNormalItems !== "function") {
    invalid("No se pudo preparar el contenido del pedido.");
  }

  const rows = Array.isArray(cart) ? cart : [];
  const normalItems = rows.filter((item) => !isMenuSetCartLine(item));
  const serializedNormal = serializeNormalItems(normalItems);

  if (!Array.isArray(serializedNormal) || serializedNormal.length !== normalItems.length) {
    invalid("No se pudo preparar correctamente el pedido.");
  }

  let normalIndex = 0;

  return rows.map((item) => {
    if (isMenuSetCartLine(item)) {
      return buildMenuSetSelectionPayload(item);
    }

    const serialized = serializedNormal[normalIndex];
    normalIndex += 1;

    if (!serialized || typeof serialized !== "object") {
      invalid("Uno de los productos del pedido no es válido.");
    }

    return serialized;
  });
}