import { useCallback, useEffect, useRef, useState } from "react";
import { getPreparedItemId } from "./preparedItem.utils";

/**
 * Administra la colección visible de Preparación rápida.
 *
 * Usa:
 * - src/hooks/menu/preparedItem.utils.js, para reconocer la identidad física.
 * - initialItems, normalmente provenientes de quick_preparation del menú.
 * - loader, inyectado por Mesero, Público o Caja para refrescar el pool.
 *
 * Lo usarán:
 * - src/pages/staff/waiter/StaffMenuEntryPage.jsx
 * - src/pages/public/PublicMenuEntryPage.jsx
 * - src/pages/staff/casher/CashierDirectOrderPage.jsx
 *
 * No conoce endpoints, no toca el carrito y no reconcilia PreparedItems
 * seleccionados. Solo mantiene el pool visible del contexto actual.
 */

function toPositiveInt(value) {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    return null;
  }

  return Math.trunc(number);
}

function toMoney(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function collectModifierNames(modifiers, lines) {
  const rows = Array.isArray(modifiers) ? modifiers : [];

  rows.forEach((modifier) => {
    if (!modifier || typeof modifier !== "object") {
      return;
    }

    const name = String(modifier?.name || "").trim();

    if (!name) {
      return;
    }

    const quantity = Math.max(1, Number(modifier?.quantity || 1));
    lines.push(quantity > 1 ? `${name} x${quantity}` : name);
  });
}

function collectComponentModifierNames(components, lines) {
  const rows = Array.isArray(components) ? components : [];

  rows.forEach((component) => {
    if (!component || typeof component !== "object") {
      return;
    }

    collectModifierNames(component?.modifiers, lines);
    collectComponentModifierNames(component?.components, lines);
  });
}

/*
 * PublicMenuResolver entrega `configuration`, mientras los endpoints
 * dedicados ya entregan `configuration_summary`.
 *
 * Esta normalización mantiene una sola representación para el Front.
 */
function normalizeConfigurationSummary(item) {
  if (Array.isArray(item?.configuration_summary)) {
    return Array.from(
      new Set(
        item.configuration_summary
          .map((value) => String(value || "").trim())
          .filter(Boolean),
      ),
    );
  }

  const configuration =
    item?.configuration &&
    typeof item.configuration === "object" &&
    !Array.isArray(item.configuration)
      ? item.configuration
      : null;

  if (!configuration) {
    return [];
  }

  const lines = [];

  collectModifierNames(configuration?.modifiers, lines);
  collectComponentModifierNames(configuration?.components, lines);

  return Array.from(new Set(lines));
}

function normalizePreparedItem(item) {
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    return null;
  }

  const preparedItemId = getPreparedItemId(item);
  const productId = toPositiveInt(item?.product_id);

  if (!preparedItemId || !productId) {
    return null;
  }

  const configuration =
    item?.configuration &&
    typeof item.configuration === "object" &&
    !Array.isArray(item.configuration)
      ? item.configuration
      : null;

  const variantId = toPositiveInt(
    item?.variant_id ?? configuration?.variant_id,
  );

  const productName = String(
    item?.product_name ??
      item?.name ??
      "",
  ).trim();

  const pricing =
    item?.pricing &&
    typeof item.pricing === "object" &&
    !Array.isArray(item.pricing)
      ? { ...item.pricing }
      : null;

  return {
    ...item,
    prepared_item_id: preparedItemId,
    product_id: productId,
    product_name: productName || "Producto",
    variant_id: variantId,
    configuration_summary: normalizeConfigurationSummary(item),
    current_price: toMoney(
      item?.current_price ??
        item?.price ??
        pricing?.unit_price,
    ),
    pricing,
    prepared_at: item?.prepared_at || null,
    expires_at: item?.expires_at || null,
  };
}

function getExpirationTimestamp(item) {
  const value = item?.expires_at;

  if (!value) {
    return null;
  }

  const timestamp = Date.parse(value);

  if (!Number.isFinite(timestamp)) {
    return null;
  }

  return timestamp;
}

function normalizeVisibleItems(source, now = Date.now()) {
  const rows = Array.isArray(source) ? source : [];

  return rows
    .map(normalizePreparedItem)
    .filter(Boolean)
    .filter((item) => {
      const expiresAt = getExpirationTimestamp(item);

      if (expiresAt === null) {
        return true;
      }

      return expiresAt > now;
    });
}

/*
 * El loader puede devolver directamente items o conservar la estructura
 * habitual de los servicios/API. El hook sigue sin conocer ningún endpoint.
 */
function extractLoaderItems(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  if (Array.isArray(response?.data?.items)) {
    return response.data.items;
  }

  if (Array.isArray(response?.data?.data?.items)) {
    return response.data.data.items;
  }

  return [];
}

export function usePreparedItemsCollection({
  initialItems = null,
  loader = null,
  enabled = true,
  contextKey = "",
} = {}) {
  const [items, setItems] = useState(() =>
    enabled && Array.isArray(initialItems)
      ? normalizeVisibleItems(initialItems)
      : [],
  );

  const [loading, setLoading] = useState(
    enabled && !Array.isArray(initialItems) && typeof loader === "function",
  );

  const [error, setError] = useState(null);

  const itemsRef = useRef(items);
  const loaderRef = useRef(loader);
  const enabledRef = useRef(enabled);
  const initialItemsRef = useRef(initialItems);
  const contextKeyRef = useRef(contextKey);
  const requestSequenceRef = useRef(0);

  loaderRef.current = loader;
  enabledRef.current = enabled;
  initialItemsRef.current = initialItems;

  const replaceItems = useCallback((nextItems) => {
    itemsRef.current = nextItems;
    setItems(nextItems);
  }, []);

  const loadCollection = useCallback(
    async ({ showLoading = false } = {}) => {
      if (!enabledRef.current || typeof loaderRef.current !== "function") {
        return itemsRef.current;
      }

      const requestId = ++requestSequenceRef.current;
      const requestContextKey = contextKeyRef.current;

      if (showLoading) {
        setLoading(true);
      }

      setError(null);

      try {
        const response = await loaderRef.current();

        if (
          requestId !== requestSequenceRef.current ||
          requestContextKey !== contextKeyRef.current ||
          !enabledRef.current
        ) {
          return itemsRef.current;
        }

        const nextItems = normalizeVisibleItems(
          extractLoaderItems(response),
        );

        replaceItems(nextItems);
        return nextItems;
      } catch (nextError) {
        if (
          requestId === requestSequenceRef.current &&
          requestContextKey === contextKeyRef.current &&
          enabledRef.current
        ) {
          setError(nextError);
        }

        return itemsRef.current;
      } finally {
        if (
          requestId === requestSequenceRef.current &&
          requestContextKey === contextKeyRef.current &&
          enabledRef.current
        ) {
          setLoading(false);
        }
      }
    },
    [replaceItems],
  );

  const refetch = useCallback(() => {
    return loadCollection({
      showLoading: itemsRef.current.length === 0,
    });
  }, [loadCollection]);

  /*
   * Cambiar menú, mesa u orden invalida cualquier consulta anterior.
   *
   * Si quick_preparation ya vino dentro del menú, se utiliza de inmediato
   * y no se hace otra petición duplicada. El endpoint dedicado queda para
   * refetch por realtime, expiración u otras resincronizaciones.
   */
  useEffect(() => {
    requestSequenceRef.current += 1;
    contextKeyRef.current = contextKey;

    setError(null);
    setLoading(false);

    if (!enabled) {
      replaceItems([]);
      return;
    }

    if (Array.isArray(initialItemsRef.current)) {
      replaceItems(
        normalizeVisibleItems(initialItemsRef.current),
      );
      return;
    }

    replaceItems([]);

    if (typeof loaderRef.current === "function") {
      void loadCollection({ showLoading: true });
    }
  }, [
    enabled,
    contextKey,
    loadCollection,
    replaceItems,
  ]);

  /*
   * Cuando vence la unidad más próxima:
   * 1. desaparece inmediatamente del Front;
   * 2. se resincroniza el pool mediante el loader disponible.
   */
  useEffect(() => {
    if (!enabled || items.length === 0) {
      return undefined;
    }

    const now = Date.now();

    const expirations = items
      .map(getExpirationTimestamp)
      .filter(
        (timestamp) =>
          timestamp !== null &&
          timestamp > now,
      );

    if (expirations.length === 0) {
      return undefined;
    }

    const nearestExpiration = Math.min(...expirations);
    const delay = Math.max(0, nearestExpiration - now + 50);

    const timeoutId = window.setTimeout(() => {
      replaceItems(
        normalizeVisibleItems(itemsRef.current),
      );

      if (typeof loaderRef.current === "function") {
        void loadCollection({ showLoading: false });
      }
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    enabled,
    items,
    loadCollection,
    replaceItems,
  ]);

  return {
    items,
    loading,
    error,
    refetch,
  };
}