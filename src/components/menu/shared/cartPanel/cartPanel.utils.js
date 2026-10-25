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

export function isOldMenuSetRoot(item) {
  if (!item || typeof item !== "object") return false;
  if (item.is_menu_set_product === true) return false;

  const parentId = Number(item.parent_order_item_id || 0);
  const productId = Number(item.product_id || 0);

  if (parentId > 0 || productId > 0) return false;

  return (
    item.is_menu_set_root === true ||
    item.commercial_type === "menu_set" ||
    item.item_kind === "menu_set" ||
    (Number(item.menu_set_id || 0) > 0 && item.product_id == null)
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
  const source = Array.isArray(items) ? items : [];
  const records = new Map();
  const order = [];
  const visitedReferences = new WeakSet();
  let anonymousId = 0;

  const getId = (value) => {
    if (value === null || value === undefined || value === "") return null;
    const id = Number(value);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
  };

  const register = (item, nestedParentKey = null, depth = 0) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return;
    if (depth > 20 || visitedReferences.has(item)) return;

    visitedReferences.add(item);

    const id = getId(item.id ?? item.order_item_id);
    const key = id !== null ? `item:${id}` : `anonymous:${++anonymousId}`;
    const explicitParentId = getId(item.parent_order_item_id);
    const parentKey = explicitParentId !== null
      ? `item:${explicitParentId}`
      : nestedParentKey;

    const previous = records.get(key);

    if (!previous) {
      order.push(key);
      records.set(key, {
        data: { ...item, children: [] },
        parentKey: parentKey !== key ? parentKey : null,
      });
    } else {
      records.set(key, {
        data: { ...previous.data, ...item, children: [] },
        parentKey: parentKey && parentKey !== key ? parentKey : previous.parentKey,
      });
    }

    const children = Array.isArray(item.children) ? item.children : [];
    children.forEach((child) => register(child, key, depth + 1));
  };

  source.forEach((item) => register(item));

  const childrenByParent = new Map();
  const rootKeys = [];

  order.forEach((key) => {
    const parentKey = records.get(key)?.parentKey;

    if (!parentKey || !records.has(parentKey) || parentKey === key) {
      rootKeys.push(key);
      return;
    }

    if (!childrenByParent.has(parentKey)) childrenByParent.set(parentKey, []);
    childrenByParent.get(parentKey).push(key);
  });

  const completed = new Set();
  const active = new Set();

  const assemble = (key) => {
    if (completed.has(key) || active.has(key)) return null;

    const record = records.get(key);
    if (!record) return null;

    active.add(key);

    const children = (childrenByParent.get(key) || [])
      .map(assemble)
      .filter(Boolean);

    active.delete(key);
    completed.add(key);

    const node = { ...record.data, children };

    if (isOldMenuSetRoot(node)) {
      const historicalStages = Array.isArray(node.stages) ? node.stages : [];

      if (children.length > 0) {
        const groups = new Map();

        const stageKey = (stageId, stageName) => {
          const id = getId(stageId);
          return id !== null
            ? `stage:${id}`
            : `name:${String(stageName || "Sin etapa")}`;
        };

        historicalStages.forEach((stage) => {
          const key = stageKey(
            stage.menu_set_stage_definition_id,
            stage.menu_set_stage_name_snapshot ?? stage.name,
          );

          if (!groups.has(key)) {
            groups.set(key, { ...stage, items: [] });
          }
        });

        children.forEach((child) => {
          const stageId = getId(child.menu_set_stage_definition_id);
          const stageName = child.menu_set_stage_name_snapshot || "Productos del Conjunto";
          const key = stageKey(stageId, stageName);

          if (!groups.has(key)) {
            groups.set(key, {
              menu_set_stage_definition_id: stageId,
              menu_set_stage_name_snapshot: stageName,
              items: [],
            });
          }

          groups.get(key).items.push(child);
        });

        node.stages = Array.from(groups.values()).filter(
          (stage) => stage.items.length > 0,
        );
      } else {
        node.stages = historicalStages;
      }
    }

    return node;
  };

  const tree = rootKeys.map(assemble).filter(Boolean);

  // Conserva partidas con referencias incompletas sin perderlas silenciosamente.
  order.forEach((key) => {
    if (completed.has(key)) return;

    const node = assemble(key);
    if (node) tree.push(node);
  });

  return tree;
}