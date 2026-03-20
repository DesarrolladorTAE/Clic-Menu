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
    }))
    .filter((c) => c.component_product_id > 0)
    .sort((a, b) => {
      if (a.component_product_id !== b.component_product_id) {
        return a.component_product_id - b.component_product_id;
      }
      return safeNum(a.variant_id, 0) - safeNum(b.variant_id, 0);
    });
}

export function buildCartKey(productId, variantId, components = []) {
  const base = makeKey(productId, variantId);
  const normalized = normalizeCompositeComponentsForKey(components);
  if (!normalized.length) return base;
  return `${base}:c:${safeHash(normalized)}`;
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

export function buildModifierContextSections(product) {
  if (!product || typeof product !== "object") return [];

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

  compositeItems.forEach((item, idx) => {
    const itemLabel =
      item?.component_product?.display_name ||
      item?.component_product?.name ||
      item?.name ||
      `Componente ${idx + 1}`;

    if (hasGroups(item?.modifier_groups)) {
      sections.push({
        key: `component-${product?.id || "x"}-${item?.component_product_id || idx}`,
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

      const optionLabel =
        option?.label ||
        option?.name ||
        option?.variant_name ||
        `Variante ${optionIdx + 1}`;

      sections.push({
        key: `component-variant-${product?.id || "x"}-${item?.component_product_id || idx}-${option?.variant_id || optionIdx}`,
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