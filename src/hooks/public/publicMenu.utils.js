export const PUBLIC_QR_DISABLED_MSG =
  "Menú digital temporalmente fuera de servicio. Por favor, solicita una carta física";

export const PUBLIC_QR_WRONG_MODE_MSG =
  "Este QR ya no es válido para el modo actual de toma de pedidos. Solicita que generen un QR nuevo.";

export function money(n) {
  const num = Number(n || 0);
  try {
    return num.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
  } catch {
    return `$${num.toFixed(2)}`;
  }
}

export function translateStatus(value) {
  const v = String(value || "").toLowerCase();
  const map = {
    active: "Activo",
    inactive: "Inactivo",
    disabled: "Deshabilitado",
    suspended: "Suspendido",
    deleted: "Eliminado",
    pending: "Pendiente",
  };
  return map[v] || (value ? String(value) : "—");
}

export function translateOrderingMode(value) {
  const v = String(value || "").toLowerCase();
  const map = {
    waiter_only: "Solo mesero",
    customer_assisted: "Cliente asistido",
  };
  return map[v] || (value ? String(value) : "—");
}

export function translateTableServiceMode(value) {
  const v = String(value || "").toLowerCase();
  const map = {
    assigned_waiter: "Mesero asignado",
    free_for_all: "Libre",
  };
  return map[v] || (value ? String(value) : "—");
}

export function isQrDisabledPublicError(e) {
  const status = e?.response?.status;
  if (status !== 403) return false;

  const msg = String(
    e?.response?.data?.message || e?.response?.data?.error || e?.message || "",
  ).toLowerCase();

  return (
    msg.includes("qr desactivado") ||
    msg.includes("no está habilitado") ||
    msg.includes("servicio por qr") ||
    msg.includes("no está habilitado aquí") ||
    msg.includes("desactivado")
  );
}

export function isQrWrongModeError(e) {
  const status = e?.response?.status;
  if (status !== 403) return false;

  const msg = String(
    e?.response?.data?.message || e?.response?.data?.error || e?.message || "",
  ).toLowerCase();

  return (
    msg.includes("qr no válido") ||
    msg.includes("modo actual") ||
    msg.includes("toma de pedidos") ||
    msg.includes("genera un qr nuevo")
  );
}

export function fmtMMSS(totalSeconds) {
  const s = Math.max(0, Number(totalSeconds || 0));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(Math.floor(s % 60)).padStart(2, "0");
  return `${mm}:${ss}`;
}

export function makeKey(productId, variantId) {
  return variantId ? `v:${productId}:${variantId}` : `p:${productId}`;
}

export function safeNum(v, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

export function safeHash(obj) {
  try {
    const s = JSON.stringify(obj || []);
    return `${s.length}:${s.slice(0, 160)}`;
  } catch {
    return String(Date.now());
  }
}

export function makeComponentModifierKey(componentProductId, componentVariantId = null) {
  return `${Number(componentProductId || 0)}:${componentVariantId ? Number(componentVariantId) : 0}`;
}

export function getModifierSelectionCount(group, selectedMap = {}) {
  const mode = String(group?.selection_mode || "").toLowerCase();
  const values = Object.values(selectedMap || {}).map((v) => Number(v || 0)).filter((v) => v > 0);

  if (!values.length) return 0;

  if (mode === "quantity") {
    return values.reduce((acc, n) => acc + n, 0);
  }

  return values.length;
}

export function normalizeModifierGroupsForKey(groups) {
  const arr = Array.isArray(groups) ? groups : [];

  return arr
    .map((g) => ({
      modifier_group_id: Number(g?.modifier_group_id || g?.id || 0),
      applies_to_level: String(g?.applies_to_level || "order_item"),
      component_product_id: g?.component_product_id ? Number(g.component_product_id) : null,
      component_variant_id: g?.component_variant_id ? Number(g.component_variant_id) : null,
      options: (Array.isArray(g?.options) ? g.options : [])
        .map((o) => ({
          modifier_option_id: Number(o?.modifier_option_id || o?.id || 0),
          quantity: Number(o?.quantity || 1),
        }))
        .filter((o) => o.modifier_option_id > 0 && o.quantity > 0)
        .sort((a, b) => a.modifier_option_id - b.modifier_option_id),
    }))
    .filter((g) => g.modifier_group_id > 0 && g.options.length > 0)
    .sort((a, b) => {
      if (a.applies_to_level !== b.applies_to_level) {
        return String(a.applies_to_level).localeCompare(String(b.applies_to_level));
      }
      if (safeNum(a.component_product_id, 0) !== safeNum(b.component_product_id, 0)) {
        return safeNum(a.component_product_id, 0) - safeNum(b.component_product_id, 0);
      }
      if (safeNum(a.component_variant_id, 0) !== safeNum(b.component_variant_id, 0)) {
        return safeNum(a.component_variant_id, 0) - safeNum(b.component_variant_id, 0);
      }
      return a.modifier_group_id - b.modifier_group_id;
    });
}

export function buildModifierDisplayGroupsFromApiGroups(groups) {
  const arr = Array.isArray(groups) ? groups : [];
  const map = {};

  arr.forEach((group) => {
    const groupName = String(group?.group_name_snapshot || group?.name || "Extras");
    const appliesToLevel = String(group?.applies_to_level || "order_item");
    const componentProductId = group?.component_product_id ? Number(group.component_product_id) : null;
    const componentVariantId = group?.component_variant_id ? Number(group.component_variant_id) : null;

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

    const opts = Array.isArray(group?.options) ? group.options : [];
    opts.forEach((opt) => {
      const totalPrice = Number(opt?.total_price || 0);

      map[key].options.push({
        id: Number(opt?.id || 0),
        modifier_group_id: Number(opt?.modifier_group_id || group?.modifier_group_id || group?.id || 0),
        modifier_option_id: Number(opt?.modifier_option_id || opt?.id || 0),
        name: String(opt?.name || opt?.name_snapshot || "Extra"),
        quantity: Number(opt?.quantity || 1),
        unit_price: Number(opt?.unit_price || 0),
        total_price: totalPrice,
        affects_total: !!opt?.affects_total,
      });

      map[key].group_total = Number(map[key].group_total || 0) + totalPrice;
    });
  });

  return Object.values(map).map((g) => ({
    ...g,
    group_total: Math.round(Number(g.group_total || 0) * 100) / 100,
  }));
}

export function normalizeCompositeComponentsForKey(components) {
  const arr = Array.isArray(components) ? components : [];
  return arr
    .map((c) => ({
      component_product_id: Number(c?.component_product_id || 0),
      variant_id: c?.variant_id ? Number(c.variant_id) : null,
      quantity:
        c?.quantity == null || c?.quantity === ""
          ? null
          : Number(c.quantity),
      modifiers: normalizeModifierGroupsForKey(c?.modifiers || []),
    }))
    .filter((c) => c.component_product_id > 0)
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

export function buildCartKey(productId, variantId, components = [], modifiers = []) {
  const base = makeKey(productId, variantId);
  const normalizedComponents = normalizeCompositeComponentsForKey(components);
  const normalizedModifiers = normalizeModifierGroupsForKey(modifiers);

  const chunks = [base];

  if (normalizedComponents.length) {
    chunks.push(`c:${safeHash(normalizedComponents)}`);
  }

  if (normalizedModifiers.length) {
    chunks.push(`m:${safeHash(normalizedModifiers)}`);
  }

  return chunks.join(":");
}

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
    .filter((r) => r && r.included !== false)
    .map((r) => {
      const variant = Array.isArray(r.variants)
        ? r.variants.find((v) => Number(v.id) === Number(r.variant_id))
        : null;

      return {
        component_product_id: Number(r.component_product_id),
        component_name: r.name || "Componente",
        component_display_name: r.name || "Componente",
        variant_id: r.variant_id ? Number(r.variant_id) : null,
        variant_name: variant?.name || null,
        quantity:
          r.quantity == null || r.quantity === ""
            ? 1
            : Number(r.quantity),
        is_optional: !!r.is_optional,
        allow_variant: !!r.allow_variant,
        apply_variant_price: !!r.apply_variant_price,
        modifier_groups_display: [],
      };
    });
}

export function getSelectionModeLabel(value) {
  const v = String(value || "").toLowerCase();
  const map = {
    single: "Selección única",
    multiple: "Selección múltiple",
    quantity: "Cantidad",
  };
  return map[v] || (value ? String(value) : "Configuración libre");
}

export function formatModifierGroupMeta(group) {
  if (!group || typeof group !== "object") return "";

  const parts = [];

  parts.push(group?.is_required ? "Obligatorio" : "Opcional");

  if (group?.selection_mode) {
    parts.push(getSelectionModeLabel(group.selection_mode));
  }

  const min = Number(group?.min_select || 0);
  const max =
    group?.max_select == null || group?.max_select === ""
      ? null
      : Number(group.max_select);

  if (min > 0 || max !== null) {
    if (max !== null) {
      parts.push(`Mín. ${min} · Máx. ${max}`);
    } else {
      parts.push(`Mín. ${min}`);
    }
  }

  return parts.join(" · ");
}

function hasGroups(arr) {
  return Array.isArray(arr) && arr.length > 0;
}

export function hasAnyModifierGroups(product) {
  if (!product || typeof product !== "object") return false;

  if (hasGroups(product?.modifier_groups)) return true;

  const variants = Array.isArray(product?.variants) ? product.variants : [];
  if (variants.some((v) => hasGroups(v?.modifier_groups))) return true;

  const compositeItems = Array.isArray(product?.composite?.items)
    ? product.composite.items
    : [];

  if (compositeItems.some((item) => hasGroups(item?.modifier_groups))) return true;

  for (const item of compositeItems) {
    const options = Array.isArray(item?.selector?.options)
      ? item.selector.options
      : [];
    if (options.some((opt) => hasGroups(opt?.modifier_groups))) return true;
  }

  return false;
}

export function buildModifierContextSections(product, opts = {}) {
  if (!product || typeof product !== "object") return [];

  const {
    variantId = null,
    compositeDraft = null,
  } = opts || {};

  const sections = [];
  const title = product?.display_name || product?.name || "Producto";

  if (hasGroups(product?.modifier_groups)) {
    sections.push({
      key: `product-${product.id || "x"}`,
      context_type: "product",
      title: "Extras del producto",
      subtitle: title,
      groups: product.modifier_groups,
    });
  }

  const variants = Array.isArray(product?.variants) ? product.variants : [];
  variants.forEach((variant, idx) => {
    if (variantId != null && Number(variant?.id) !== Number(variantId)) return;
    if (!hasGroups(variant?.modifier_groups)) return;

    sections.push({
      key: `variant-${variant?.id || idx}`,
      context_type: "variant",
      title: "Extras por variante",
      subtitle: `${title} · ${variant?.name || `Variante ${idx + 1}`}`,
      groups: variant.modifier_groups,
      variant,
    });
  });

  const compositeItems = Array.isArray(product?.composite?.items)
    ? product.composite.items
    : [];

  const draftMap = Array.isArray(compositeDraft)
    ? compositeDraft.reduce((acc, row) => {
        const cid = Number(row?.component_product_id || 0);
        if (cid > 0) acc[cid] = row;
        return acc;
      }, {})
    : {};

  compositeItems.forEach((item, idx) => {
    const itemLabel =
      item?.component_product?.display_name ||
      item?.component_product?.name ||
      item?.name ||
      `Componente ${idx + 1}`;

    const componentProductId = Number(item?.component_product_id || 0);
    const draftRow = draftMap[componentProductId] || null;

    if (compositeDraft && draftRow && draftRow.included === false) {
      return;
    }

    if (hasGroups(item?.modifier_groups)) {
      sections.push({
        key: `component-${product?.id || "x"}-${componentProductId || idx}`,
        context_type: "component",
        title: "Extras por componente",
        subtitle: `${title} · ${itemLabel}`,
        groups: item.modifier_groups,
        component: item,
      });
    }

    const options = Array.isArray(item?.selector?.options)
      ? item.selector.options
      : [];

    options.forEach((option, optionIdx) => {
      if (!hasGroups(option?.modifier_groups)) return;

      const optionVariantId = Number(option?.variant_id || 0);
      const optionLabel =
        option?.label ||
        option?.name ||
        option?.variant_name ||
        `Variante ${optionIdx + 1}`;

      if (compositeDraft) {
        const selectedVariantId = draftRow?.variant_id ? Number(draftRow.variant_id) : null;
        if (!selectedVariantId || selectedVariantId !== optionVariantId) {
          return;
        }
      }

      sections.push({
        key: `component-variant-${product?.id || "x"}-${componentProductId || idx}-${optionVariantId || optionIdx}`,
        context_type: "component_variant",
        title: "Extras por variante del componente",
        subtitle: `${title} · ${itemLabel} · ${optionLabel}`,
        groups: option.modifier_groups,
        component: item,
        option,
      });
    });
  });

  return sections;
}