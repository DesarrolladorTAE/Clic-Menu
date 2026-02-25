// src/hooks/public/useCompositeDrafts.js
import { useCallback, useMemo, useState } from "react";

function normalizeCompositeDraftFromProduct(p) {
  const items = Array.isArray(p?.composite?.items) ? p.composite.items : [];
  return items.map((it) => {
    const cid = Number(it?.component_product_id || it?.component_product?.id || 0);
    const qty = it?.qty == null ? 1 : Number(it.qty);
    const allowVariant = !!it?.allow_variant;
    const isOptional = !!it?.is_optional;

    return {
      component_product_id: cid,
      variant_id: null,
      quantity: Number.isFinite(qty) ? qty : 1,
      included: !isOptional, // requeridos ON, opcionales OFF por default
      allow_variant: allowVariant,
      is_optional: isOptional,
      apply_variant_price: !!it?.apply_variant_price,
      name:
        it?.component_product?.display_name ||
        it?.component_product?.name ||
        "Componente",
      variants: Array.isArray(it?.component_product?.variants)
        ? it.component_product.variants
        : [],
      notes: it?.notes || "",
    };
  });
}

function draftToSubmitComponents(draft) {
  const arr = Array.isArray(draft) ? draft : [];
  return arr
    .filter((x) => x && x.included !== false)
    .map((x) => ({
      component_product_id: Number(x.component_product_id),
      variant_id: x.variant_id ? Number(x.variant_id) : null,
      quantity: x.quantity == null ? null : Number(x.quantity),
    }));
}

/**
 * Maneja drafts de componentes por producto compuesto.
 * Mantiene la misma lógica:
 * - init lazy por producto
 * - toggle included / variant
 * - sync al primer item del carrito si ya existe
 */
export function useCompositeDrafts({ cartOrder }) {
  // shape: { [productId]: DraftComponent[] }
  const [compositeDrafts, setCompositeDrafts] = useState({});

  const getOrInitCompositeDraft = useCallback((p) => {
    const pid = Number(p?.id || 0);
    if (!pid) return [];
    const existing = compositeDrafts[pid];
    if (Array.isArray(existing)) return existing;

    const init = normalizeCompositeDraftFromProduct(p);
    setCompositeDrafts((prev) => ({ ...prev, [pid]: init }));
    return init;
  }, [compositeDrafts]);

  const setDraftIncluded = useCallback((pid, component_product_id, included) => {
    setCompositeDrafts((prev) => {
      const cur = Array.isArray(prev[pid]) ? prev[pid] : [];
      const next = cur.map((x) =>
        Number(x.component_product_id) === Number(component_product_id)
          ? { ...x, included: !!included }
          : x
      );
      return { ...prev, [pid]: next };
    });
  }, []);

  const setDraftVariant = useCallback((pid, component_product_id, variant_id) => {
    setCompositeDrafts((prev) => {
      const cur = Array.isArray(prev[pid]) ? prev[pid] : [];
      const next = cur.map((x) =>
        Number(x.component_product_id) === Number(component_product_id)
          ? { ...x, variant_id: variant_id ? Number(variant_id) : null }
          : x
      );
      return { ...prev, [pid]: next };
    });
  }, []);

  const syncDraftToCartFirstItemIfExists = useCallback((pid) => {
    const it = cartOrder?.cart?.find((x) => Number(x.product_id) === Number(pid));
    if (!it) return false;

    const draft = compositeDrafts[pid];
    if (!Array.isArray(draft)) return false;

    cartOrder.setCartComponents(it.key, draftToSubmitComponents(draft));
    return true;
  }, [cartOrder, compositeDrafts]);

  const resetCompositeDrafts = useCallback(() => {
    setCompositeDrafts({});
  }, []);

  const api = useMemo(() => {
    return {
      compositeDrafts,
      setCompositeDrafts,
      resetCompositeDrafts,
      getOrInitCompositeDraft,
      setDraftIncluded,
      setDraftVariant,
      syncDraftToCartFirstItemIfExists,
      draftToSubmitComponents,
    };
  }, [
    compositeDrafts,
    resetCompositeDrafts,
    getOrInitCompositeDraft,
    setDraftIncluded,
    setDraftVariant,
    syncDraftToCartFirstItemIfExists,
  ]);

  return api;
}