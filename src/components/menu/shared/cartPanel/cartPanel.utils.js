export function renderNotes(n) {
  if (!n) return "";
  if (typeof n === "string") return n;

  if (typeof n === "object") {
    try {
      return JSON.stringify(n);
    } catch {
      return "";
    }
  }

  return String(n);
}

function hasOwn(source, key) {
  return (
    source != null &&
    typeof source === "object" &&
    Object.prototype.hasOwnProperty.call(source, key)
  );
}

function normalizeOrderItemQuantity(value, fallback = 0) {
  const quantity = Number(value);

  if (!Number.isFinite(quantity)) {
    return Math.max(0, Math.trunc(Number(fallback) || 0));
  }

  return Math.max(0, Math.trunc(quantity));
}

export function resolveOrderItemCancellationState(item) {
  const originalQuantity = normalizeOrderItemQuantity(
    hasOwn(item, "original_quantity") ? item?.original_quantity : item?.quantity,
  );

  const cancelledQuantity = Math.min(
    originalQuantity,
    normalizeOrderItemQuantity(item?.cancelled_quantity),
  );

  const effectiveQuantity = hasOwn(item, "effective_quantity")
    ? Math.min(originalQuantity, normalizeOrderItemQuantity(item?.effective_quantity))
    : Math.max(0, originalQuantity - cancelledQuantity);

  const cancellations = Array.isArray(item?.cancellations) ? item.cancellations : [];

  const hasCancellation =
    Boolean(item?.is_cancelled) ||
    cancelledQuantity > 0 ||
    cancellations.length > 0;

  return {
    originalQuantity,
    cancelledQuantity,
    effectiveQuantity,
    cancellations,
    hasCancellation,
    fullyCancelled: hasCancellation && effectiveQuantity <= 0,
    partiallyCancelled: hasCancellation && effectiveQuantity > 0,
  };
}

export function classifyOrderHistoryItems(items = []) {
  const rows = Array.isArray(items) ? items : [];

  return rows.reduce(
    (groups, item) => {
      const cancellation = resolveOrderItemCancellationState(item);

      if (cancellation.fullyCancelled) {
        groups.cancelledItems.push(item);
      } else {
        groups.sentItems.push(item);
      }

      return groups;
    },
    {
      sentItems: [],
      cancelledItems: [],
    },
  );
}

export function getToastStyles(sendToast = "") {
  const msg = String(sendToast || "");

  if (msg.includes("✅")) {
    return {
      border: "1px solid rgba(16, 185, 129, 0.28)",
      background: "#f0fdf4",
      color: "#047857",
    };
  }

  if (
    msg.toLowerCase().includes("disponibilidad") ||
    msg.toLowerCase().includes("solo hay disponibilidad") ||
    msg.toLowerCase().includes("stock") ||
    msg.toLowerCase().includes("inventario")
  ) {
    return {
      border: "1px solid rgba(239, 68, 68, 0.24)",
      background: "#fff5f5",
      color: "#B91C1C",
    };
  }

  if (msg.includes("⚠️")) {
    return {
      border: "1px solid rgba(245, 158, 11, 0.26)",
      background: "#fff7ed",
      color: "#B45309",
    };
  }

  return {
    border: "1px solid rgba(47,42,61,0.10)",
    background: "#fff",
    color: "#111827",
  };
}

export function buildOldItemsTree(items = []) {
  const arr = Array.isArray(items) ? items : [];
  const parents = arr.filter((it) => !it?.parent_order_item_id);
  const childrenByParent = new Map();

  arr.forEach((it) => {
    const pid = it?.parent_order_item_id;
    if (!pid) return;
    if (!childrenByParent.has(pid)) childrenByParent.set(pid, []);
    childrenByParent.get(pid).push(it);
  });

  return parents.map((parent) => {
    const nestedChildren = childrenByParent.get(parent.id);

    return {
      ...parent,
      children: Array.isArray(nestedChildren)
        ? nestedChildren
        : Array.isArray(parent?.children)
          ? parent.children
          : [],
    };
  });
}