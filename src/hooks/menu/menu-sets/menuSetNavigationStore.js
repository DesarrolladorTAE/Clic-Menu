// src/hooks/menu/menu-sets/menuSetNavigationStore.js
import { useCallback, useSyncExternalStore } from "react";;

const STORE_PREFIX = "menu-set-navigation:";
const MAX_CONTEXTS = 30;

const ALLOWED_CHANNELS = new Set([
  "publico",
  "mesero",
  "caja",
  "whatsapp",
  "pedido_en_linea",
  "vista_general",
]);

const EMPTY_SNAPSHOT = Object.freeze({
  revision: 0,
  cart: null,
  drafts: {},
  activeMenuSetId: null,
  returnPath: null,
});

const entries = new Map();
const listeners = new Map();

function stringValue(value) {
  return String(value ?? "").trim();
}

function positiveId(value) {
  if (value === null || value === undefined || value === "") return null;

  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

function cloneData(value) {
  if (value === null || value === undefined) return value;

  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    throw new Error("No se pudo conservar temporalmente tu selección.");
  }
}

function normalizeChannel(value) {
  const channel = stringValue(value).toLowerCase();
  return ALLOWED_CHANNELS.has(channel) ? channel : null;
}

function isSafeInternalPath(value) {
  const path = stringValue(value);
  return path.startsWith("/") && !path.startsWith("//") && !path.includes("\\");
}

/*
 * La identidad del contexto impide mezclar pedidos de canales distintos.
 * Solo se crea una clave si existe información suficiente para distinguirlos.
 */
export function createMenuSetNavigationKey(context) {
  const data = context && typeof context === "object" ? context : {};
  const channel = normalizeChannel(data.channel);

  if (!channel) return null;

  const identity = {
    channel,
    restaurantId: positiveId(data.restaurantId),
    branchId: positiveId(data.branchId),
    menuId: positiveId(data.menuId),
    token: stringValue(data.token) || null,
    tableId: positiveId(data.tableId),
    sessionId: stringValue(data.sessionId) || null,
    orderId: positiveId(data.orderId),
    saleId: positiveId(data.saleId),
  };

  if (["publico", "whatsapp", "pedido_en_linea", "vista_general"].includes(channel)) {
    if (!identity.token) return null;
  }

  if (channel === "mesero" && !identity.tableId) return null;

  if (channel === "caja") {
    if (!identity.branchId) return null;
    if (!identity.menuId && !identity.orderId && !identity.saleId) return null;
  }

  return `${STORE_PREFIX}${JSON.stringify(identity)}`;
}

function resolveKey(context) {
  if (typeof context === "string") {
    return context.startsWith(STORE_PREFIX) ? context : null;
  }

  return createMenuSetNavigationKey(context);
}

function emitChange(key) {
  const subscribers = listeners.get(key);
  if (!subscribers) return;

  subscribers.forEach((listener) => listener());
}

function enforceLimit() {
  while (entries.size > MAX_CONTEXTS) {
    const oldestKey = entries.keys().next().value;
    if (!oldestKey) break;

    entries.delete(oldestKey);
    emitChange(oldestKey);
  }
}

function getInternalSnapshot(key) {
  if (!key) return EMPTY_SNAPSHOT;
  return entries.get(key) || EMPTY_SNAPSHOT;
}

function updateEntry(context, updater) {
  const key = resolveKey(context);

  if (!key) {
    return {
      ok: false,
      message: "No se pudo identificar el pedido actual.",
    };
  }

  try {
    const previous = getInternalSnapshot(key);
    const updated = updater(previous);

    if (!updated || typeof updated !== "object") {
      return {
        ok: false,
        message: "No se pudo conservar la selección.",
      };
    }

    const next = {
      ...previous,
      ...updated,
      revision: previous.revision + 1,
    };

    entries.delete(key);
    entries.set(key, next);

    emitChange(key);
    enforceLimit();

    return {
      ok: true,
      state: cloneData(next),
    };
  } catch (error) {
    return {
      ok: false,
      message: error?.message || "No se pudo conservar la selección.",
    };
  }
}

export function getMenuSetNavigationState(context) {
  const key = resolveKey(context);
  if (!key) return null;

  return cloneData(getInternalSnapshot(key));
}

export function saveMenuSetNavigationState(context, updates = {}) {
  const data = updates && typeof updates === "object" ? updates : {};

  return updateEntry(context, (previous) => {
    const next = {};

    if (Object.prototype.hasOwnProperty.call(data, "cart")) {
      if (data.cart !== null && !Array.isArray(data.cart)) {
        throw new Error("El contenido del pedido no es válido.");
      }

      next.cart = cloneData(data.cart);
    }

    if (Object.prototype.hasOwnProperty.call(data, "activeMenuSetId")) {
      next.activeMenuSetId = positiveId(data.activeMenuSetId);
    }

    if (Object.prototype.hasOwnProperty.call(data, "returnPath")) {
      next.returnPath = isSafeInternalPath(data.returnPath)
        ? stringValue(data.returnPath)
        : null;
    }

    if (Object.prototype.hasOwnProperty.call(data, "drafts")) {
      if (!data.drafts || typeof data.drafts !== "object" || Array.isArray(data.drafts)) {
        throw new Error("Las selecciones guardadas no tienen un formato válido.");
      }

      next.drafts = {
        ...previous.drafts,
        ...cloneData(data.drafts),
      };
    }

    return next;
  });
}

export function saveMenuSetCart(context, cart) {
  return saveMenuSetNavigationState(context, { cart });
}

export function getMenuSetCart(context) {
  const state = getMenuSetNavigationState(context);
  return Array.isArray(state?.cart) ? state.cart : null;
}

export function saveMenuSetDraft(context, draft) {
  const menuSetId = positiveId(draft?.menuSetId ?? draft?.menu_set_id);

  if (!menuSetId) {
    return {
      ok: false,
      message: "No se pudo identificar el Conjunto.",
    };
  }

  if (!Array.isArray(draft?.selections)) {
    return {
      ok: false,
      message: "La selección del Conjunto no tiene un formato válido.",
    };
  }

  return updateEntry(context, (previous) => ({
    drafts: {
      ...previous.drafts,
      [menuSetId]: cloneData({
        menuSetId,
        currentStep: Number.isInteger(draft.currentStep)
          ? Math.max(0, draft.currentStep)
          : 0,
        selections: draft.selections,
      }),
    },
    activeMenuSetId: menuSetId,
  }));
}

export function getMenuSetDraft(context, menuSetId) {
  const id = positiveId(menuSetId);
  if (!id) return null;

  const state = getMenuSetNavigationState(context);
  return cloneData(state?.drafts?.[id] || null);
}

export function clearMenuSetDraft(context, menuSetId) {
  const id = positiveId(menuSetId);
  if (!id) return { ok: false };

  return updateEntry(context, (previous) => {
    const drafts = { ...previous.drafts };
    delete drafts[id];

    return {
      drafts,
      activeMenuSetId: previous.activeMenuSetId === id
        ? null
        : previous.activeMenuSetId,
    };
  });
}

export function saveMenuSetReturnPath(context, path, menuSetId = null) {
  if (!isSafeInternalPath(path)) {
    return {
      ok: false,
      message: "No se pudo identificar la pantalla de regreso.",
    };
  }

  return saveMenuSetNavigationState(context, {
    returnPath: path,
    activeMenuSetId: menuSetId,
  });
}

export function getMenuSetReturnPath(context) {
  const state = getMenuSetNavigationState(context);
  return state?.returnPath || null;
}

/*
 * Limpiar después de confirmar un pedido o abandonar el contexto.
 * También puede usarse para impedir que una nueva mesa herede
 * selecciones de la sesión anterior.
 */
export function clearMenuSetNavigationState(context) {
  const key = resolveKey(context);
  if (!key) return false;

  const existed = entries.delete(key);
  if (existed) emitChange(key);

  return existed;
}

export function subscribeMenuSetNavigation(context, listener) {
  const key = resolveKey(context);

  if (!key || typeof listener !== "function") {
    return () => {};
  }

  if (!listeners.has(key)) listeners.set(key, new Set());

  listeners.get(key).add(listener);

  return () => {
    const subscribers = listeners.get(key);
    if (!subscribers) return;

    subscribers.delete(listener);
    if (subscribers.size === 0) listeners.delete(key);
  };
}

export function useMenuSetNavigationState(context) {
  const key = resolveKey(context);

  const subscribe = useCallback(
    (listener) => subscribeMenuSetNavigation(key, listener),
    [key],
  );

  const getSnapshot = useCallback(
    () => getInternalSnapshot(key),
    [key],
  );

  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {
    ...state,
    contextKey: key,
    isValidContext: Boolean(key),
  };
}