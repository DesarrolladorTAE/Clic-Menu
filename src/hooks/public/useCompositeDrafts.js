import { useCallback, useMemo, useState } from "react";
import { buildCompositeDetailsFromDraft } from "./publicMenu.utils";

function normalizeVariantOption(v) {
  if (!v) return null;

  return {
    id: Number(v.variant_id ?? v.id ?? 0),
    name: v.label || v.name || "Variante",
    price: Number(v.price_reference ?? v.price ?? 0),
    price_adjustment_preview: Number(v.price_adjustment_preview || 0),
    availability: v.availability || null,
    is_available:
      typeof v.is_available === "boolean"
        ? v.is_available
        : String(v?.availability?.status || "") === "available",
    availability_label:
      v.availability_label ||
      (String(v?.availability?.status || "") === "available"
        ? "Disponible"
        : "Agotado"),
    reason: v?.availability?.reason || "",
    selectable_warehouse_ids: Array.isArray(v?.availability?.selectable_warehouse_ids)
      ? v.availability.selectable_warehouse_ids
      : [],
    valid_warehouse_ids: Array.isArray(v?.availability?.valid_warehouse_ids)
      ? v.availability.valid_warehouse_ids
      : [],
  };
}

function normalizeCompositeDraftFromProduct(p) {
  const items = Array.isArray(p?.composite?.items) ? p.composite.items : [];

  return items.map((it) => {
    const selector = it?.selector || {};
    const cid = Number(it?.component_product_id || it?.component_product?.id || 0);
    const qty = it?.qty == null ? 1 : Number(it.qty);

    const options = Array.isArray(selector?.options) ? selector.options : [];
    const variantOptions = options
      .filter((o) => o?.option_type === "variant")
      .map(normalizeVariantOption)
      .filter(Boolean);

    const baseAvailability =
      selector?.default_option?.availability ||
      it?.component_product?.availability ||
      null;

    const baseIsAvailable =
      typeof selector?.default_option?.is_available === "boolean"
        ? selector.default_option.is_available
        : typeof it?.component_product?.is_available === "boolean"
        ? it.component_product.is_available
        : String(baseAvailability?.status || "") === "available";

    const baseAvailabilityLabel =
      selector?.default_option?.availability_label ||
      it?.component_product?.availability_label ||
      (baseIsAvailable ? "Disponible" : "Agotado");

    return {
      component_product_id: cid,
      variant_id: null,
      quantity: Number.isFinite(qty) ? qty : 1,
      included: !it?.is_optional,
      allow_variant: !!it?.allow_variant,
      is_optional: !!it?.is_optional,
      apply_variant_price: !!it?.apply_variant_price,
      name:
        it?.component_product?.display_name ||
        it?.component_product?.name ||
        "Componente",
      variants: variantOptions,
      notes: it?.notes || "",
      selection_kind: selector?.selection_kind || it?.selection_kind || "fixed",
      required: !!selector?.required || !it?.is_optional,
      can_skip: !!selector?.can_skip || !!it?.is_optional,
      base_price: Number(
        selector?.base_price || it?.component_product?.base_price || 0
      ),

      availability: baseAvailability,
      is_available: baseIsAvailable,
      availability_label: baseAvailabilityLabel,
      availability_reason: baseAvailability?.reason || "",

      default_option: selector?.default_option
        ? {
            option_type: selector.default_option.option_type || "base",
            product_id: Number(selector.default_option.product_id || cid),
            variant_id: selector.default_option.variant_id
              ? Number(selector.default_option.variant_id)
              : null,
            availability: selector.default_option.availability || baseAvailability,
            is_available:
              typeof selector.default_option.is_available === "boolean"
                ? selector.default_option.is_available
                : baseIsAvailable,
            availability_label:
              selector.default_option.availability_label || baseAvailabilityLabel,
          }
        : null,
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

export function useCompositeDrafts() {
  const [compositeDrafts, setCompositeDrafts] = useState({});

  const getOrInitCompositeDraft = useCallback(
    (p) => {
      const pid = Number(p?.id || 0);
      if (!pid) return [];

      const existing = compositeDrafts[pid];
      if (Array.isArray(existing)) return existing;

      const init = normalizeCompositeDraftFromProduct(p);
      setCompositeDrafts((prev) => ({ ...prev, [pid]: init }));
      return init;
    },
    [compositeDrafts],
  );

  const resetDraftForProduct = useCallback((p) => {
    const pid = Number(p?.id || 0);
    if (!pid) return [];
    const init = normalizeCompositeDraftFromProduct(p);
    setCompositeDrafts((prev) => ({ ...prev, [pid]: init }));
    return init;
  }, []);

  const setDraftIncluded = useCallback((pid, componentProductId, included) => {
    setCompositeDrafts((prev) => {
      const cur = Array.isArray(prev[pid]) ? prev[pid] : [];
      return {
        ...prev,
        [pid]: cur.map((x) =>
          Number(x.component_product_id) === Number(componentProductId)
            ? { ...x, included: !!included }
            : x,
        ),
      };
    });
  }, []);

  const setDraftVariant = useCallback((pid, componentProductId, variantId) => {
    setCompositeDrafts((prev) => {
      const cur = Array.isArray(prev[pid]) ? prev[pid] : [];
      return {
        ...prev,
        [pid]: cur.map((x) =>
          Number(x.component_product_id) === Number(componentProductId)
            ? { ...x, variant_id: variantId ? Number(variantId) : null }
            : x,
        ),
      };
    });
  }, []);

  const buildSubmitComponentsFromProduct = useCallback(
    (product) => {
      const pid = Number(product?.id || 0);
      if (!pid) return [];
      const draft = Array.isArray(compositeDrafts[pid])
        ? compositeDrafts[pid]
        : getOrInitCompositeDraft(product);
      return draftToSubmitComponents(draft);
    },
    [compositeDrafts, getOrInitCompositeDraft],
  );

  const buildDetailsFromProduct = useCallback(
    (product) => {
      const pid = Number(product?.id || 0);
      if (!pid) return [];
      const draft = Array.isArray(compositeDrafts[pid])
        ? compositeDrafts[pid]
        : getOrInitCompositeDraft(product);
      return buildCompositeDetailsFromDraft(product, draft);
    },
    [compositeDrafts, getOrInitCompositeDraft],
  );

  const resetCompositeDrafts = useCallback(() => {
    setCompositeDrafts({});
  }, []);

  return useMemo(
    () => ({
      compositeDrafts,
      setCompositeDrafts,
      getOrInitCompositeDraft,
      resetDraftForProduct,
      setDraftIncluded,
      setDraftVariant,
      buildSubmitComponentsFromProduct,
      buildDetailsFromProduct,
      draftToSubmitComponents,
      resetCompositeDrafts,
    }),
    [
      compositeDrafts,
      getOrInitCompositeDraft,
      resetDraftForProduct,
      setDraftIncluded,
      setDraftVariant,
      buildSubmitComponentsFromProduct,
      buildDetailsFromProduct,
      resetCompositeDrafts,
    ],
  );
}