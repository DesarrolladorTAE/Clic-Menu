export const ESTADO_ITEM_ES = {
  queued: "Pendiente",
  in_progress: "Preparando",
  ready: "Listo",
  picked_up: "Recogido",
};

export const ESTADO_ORDEN_ES = {
  pending_approval: "Pendiente de aprobación",
  active: "Activa",
  open: "Abierta",
  ready: "Lista",
  paying: "En cobro",
  paid: "Pagada",
  canceled: "Cancelada",
  cancelled: "Cancelada",
};

export function tItemStatus(st) {
  const key = String(st || "").trim();
  return ESTADO_ITEM_ES[key] || (key ? "Desconocido" : "—");
}

export function tOrderStatus(st) {
  const key = String(st || "").trim();
  return ESTADO_ORDEN_ES[key] || (key ? "Desconocido" : "—");
}

export function prettyNotes(notes) {
  if (!notes) return "";
  if (typeof notes === "string") return notes;
  try {
    return JSON.stringify(notes);
  } catch {
    return String(notes);
  }
}

export function formatWhen(value) {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString();
  } catch {
    return String(value);
  }
}

export function formatElapsed(createdAt) {
  if (!createdAt) return "—";
  try {
    const d = new Date(createdAt);
    const ms = Date.now() - d.getTime();
    if (!Number.isFinite(ms) || ms < 0) return "—";

    const total = Math.floor(ms / 1000);
    const mm = Math.floor(total / 60);
    const ss = total % 60;

    const mm2 = String(mm).padStart(2, "0");
    const ss2 = String(ss).padStart(2, "0");
    return `${mm2}:${ss2}`;
  } catch {
    return "—";
  }
}

export function pill(status) {
  const s = String(status || "");
  if (s === "queued") {
    return {
      ...pillBase,
      background: "#fff7ed",
      borderColor: "#fed7aa",
      color: "#9a3412",
    };
  }
  if (s === "in_progress") {
    return {
      ...pillBase,
      background: "#eff6ff",
      borderColor: "#bfdbfe",
      color: "#1d4ed8",
    };
  }
  if (s === "ready") {
    return {
      ...pillBase,
      background: "#ecfdf5",
      borderColor: "#bbf7d0",
      color: "#166534",
    };
  }
  if (s === "picked_up") {
    return {
      ...pillBase,
      background: "#f3f4f6",
      borderColor: "#d1d5db",
      color: "#374151",
    };
  }
  return {
    ...pillBase,
    background: "#f3f4f6",
    borderColor: "#e5e7eb",
    color: "#374151",
  };
}

export function recalcOrderDerived(order, includeReady) {
  const rawItems = Array.isArray(order?.items) ? order.items : [];

  const nonReadyCount = rawItems.filter((it) => {
    const st = String(it?.kitchen_status || "");
    return st !== "ready" && st !== "picked_up";
  }).length;

  const readyUnpickedCount = rawItems.filter(
    (it) => String(it?.kitchen_status || "") === "ready"
  ).length;

  const allReady = nonReadyCount === 0;
  const readyNoticeSent = !!order?.ready_notice_sent;

  const visibleItems = includeReady
    ? rawItems.filter((it) => {
        const st = String(it?.kitchen_status || "");
        return st === "queued" || st === "in_progress" || st === "ready";
      })
    : rawItems.filter((it) => {
        const st = String(it?.kitchen_status || "");
        return st !== "ready" && st !== "picked_up";
      });

  return {
    ...order,
    items: visibleItems,
    all_ready: allReady,
    non_ready_count: nonReadyCount,
    ready_unpicked_count: readyUnpickedCount,
    actions: {
      ...(order?.actions || {}),
      can_notify_ready: allReady && readyUnpickedCount > 0 && !readyNoticeSent,
    },
  };
}

export function groupItemModifiers(modifiers) {
  const arr = Array.isArray(modifiers) ? modifiers : [];
  const map = new Map();

  arr.forEach((m) => {
    const groupName =
      String(m?.group_name_snapshot || "Extras").trim() || "Extras";
    const itemName =
      String(m?.name_snapshot || "Modificador").trim() || "Modificador";
    const qty = Number(m?.quantity || 1);

    if (!map.has(groupName)) {
      map.set(groupName, []);
    }

    map.get(groupName).push({
      id: m?.id || `${groupName}-${itemName}`,
      name: itemName,
      quantity: qty > 0 ? qty : 1,
    });
  });

  return Array.from(map.entries()).map(([groupName, items]) => ({
    groupName,
    items,
  }));
}

export function modifierLabel(mod) {
  const qty = Number(mod?.quantity || 1);
  return qty > 1 ? `${mod?.name} x${qty}` : `${mod?.name}`;
}

export function buildKitchenItemsView(items = []) {
  const arr = Array.isArray(items) ? items : [];
  const independent = [];
  const compositeMap = new Map();

  arr.forEach((item) => {
    const parentId = Number(item?.parent_order_item_id || 0);

    if (!parentId) {
      independent.push({
        type: "single",
        item,
      });
      return;
    }

    if (!compositeMap.has(parentId)) {
      compositeMap.set(parentId, {
        type: "composite",
        parentId,
        items: [],
      });
    }

    compositeMap.get(parentId).items.push(item);
  });

  const composites = Array.from(compositeMap.values()).sort(
    (a, b) => a.parentId - b.parentId
  );

  const combined = [...independent, ...composites];

  combined.sort((a, b) => {
    const getFirstId = (entry) => {
      if (entry?.type === "single") return Number(entry?.item?.id || 0);
      return Number(entry?.items?.[0]?.id || 0);
    };
    return getFirstId(a) - getFirstId(b);
  });

  return combined;
}

export function buildConsumptionUi(result) {
  const inventory = result?.data?.inventory_consumption || null;
  const baseMessage = String(
    result?.message || "Ítem enviado a preparación."
  ).trim();

  if (!inventory) {
    return {
      toast: baseMessage,
      badge: null,
    };
  }

  const warehouseText = inventory?.warehouse_id
    ? `almacén #${inventory.warehouse_id}`
    : "almacén efectivo";

  const already = !!inventory?.already;
  const type = String(inventory?.consumption_type || "").trim();

  if (already) {
    return {
      toast: `${baseMessage} El consumo de inventario ya existía previamente.`,
      badge: {
        kind: "already",
        text: "Consumo ya existía",
      },
    };
  }

  if (type === "ingredients") {
    const ingredientMovements = Array.isArray(inventory?.ingredient_movements)
      ? inventory.ingredient_movements
      : [];

    const ingredientCount = ingredientMovements.length;

    return {
      toast:
        ingredientCount > 0
          ? `${baseMessage} Se descontaron ${ingredientCount} ingrediente(s) del ${warehouseText}.`
          : `${baseMessage} Se aplicó consumo por ingredientes en el ${warehouseText}.`,
      badge: {
        kind: "applied",
        text: "Consumo aplicado",
      },
    };
  }

  if (type === "product") {
    const productMovement = inventory?.product_movement || null;
    const qty = Math.abs(Number(productMovement?.quantity || 0));

    return {
      toast:
        qty > 0
          ? `${baseMessage} Se descontó ${qty} unidad(es) del producto en el ${warehouseText}.`
          : `${baseMessage} Se aplicó consumo de producto directo en el ${warehouseText}.`,
      badge: {
        kind: "applied",
        text: "Consumo aplicado",
      },
    };
  }

  if (type === "none") {
    return {
      toast: `${baseMessage} Este producto no consume inventario.`,
      badge: {
        kind: "neutral",
        text: "Sin consumo",
      },
    };
  }

  if (type === "composite_parent_skipped") {
    return {
      toast: `${baseMessage} El padre compuesto no consume inventario directamente.`,
      badge: {
        kind: "neutral",
        text: "Consumo omitido",
      },
    };
  }

  return {
    toast: baseMessage,
    badge: null,
  };
}

export function buildKitchenInventoryError(e) {
  const responseData = e?.response?.data || {};
  const code = String(
    responseData?.code || responseData?.inventory?.code || ""
  ).trim();
  const fallbackMessage = String(
    responseData?.message || "No se pudo iniciar el ítem."
  ).trim();

  const map = {
    EFFECTIVE_WAREHOUSE_NOT_FOUND:
      "No se pudo iniciar porque no hay un almacén efectivo activo para este pedido.",
    RECIPE_INGREDIENT_NOT_FOUND:
      "No se pudo iniciar porque falta un ingrediente de la receta.",
    RECIPE_INGREDIENT_NOT_STOCK_ITEM:
      "No se pudo iniciar porque uno de los ingredientes no es inventariable.",
    RECIPE_INGREDIENT_INACTIVE:
      "No se pudo iniciar porque uno de los ingredientes está inactivo.",
    PRODUCT_NOT_FOUND_FOR_ORDER_ITEM:
      "No se pudo iniciar porque no se encontró el producto del ítem.",
    PRODUCT_INACTIVE_FOR_ORDER_ITEM:
      "No se pudo iniciar porque el producto está inactivo.",
    PRODUCT_TYPE_NOT_SUPPORTED_FOR_DIRECT_CONSUMPTION:
      "No se pudo iniciar porque ese tipo de producto no soporta consumo directo desde cocina.",
    MISSING_RECIPE_FOR_ORDER_ITEM:
      "No se pudo iniciar porque el producto no tiene receta activa para consumir inventario.",
    INGREDIENT_NOT_STOCK_ITEM:
      "No se pudo iniciar porque el ingrediente no es inventariable.",
    INGREDIENT_INACTIVE:
      "No se pudo iniciar porque el ingrediente está inactivo.",
    PRODUCT_NOT_DIRECT_STOCK:
      "No se pudo descontar producto directo porque el producto no usa stock directo.",
    PRODUCT_INACTIVE:
      "No se pudo descontar producto directo porque el producto está inactivo.",
    INSUFFICIENT_STOCK:
      "No se pudo iniciar porque no hay existencia suficiente.",
    STOCK_NOT_FOUND:
      "No se pudo iniciar porque no existe registro de stock para este ítem.",
    INVALID_TRANSITION: fallbackMessage,
    ALREADY_READY: fallbackMessage,
    ALREADY_PICKED_UP: fallbackMessage,
    NO_VALID_WAREHOUSE_FOR_ORDER_ITEM:
      responseData?.inventory?.message ||
      "No existe ningún almacén válido que pueda surtir este ítem en este momento.",
    WAREHOUSE_SELECTION_REQUIRED_FOR_ITEM:
      responseData?.inventory?.message ||
      "Hay varios almacenes válidos para este ítem. Cocina debe elegir uno.",
    INVALID_SELECTED_WAREHOUSE_FOR_ITEM:
      responseData?.inventory?.message ||
      "El almacén seleccionado no puede surtir este ítem.",
  };

  return map[code] || fallbackMessage;
}

export function extractWarehouseResolutionError(e) {
  const responseData = e?.response?.data || {};
  const inventory = responseData?.inventory || null;
  const code = String(responseData?.code || inventory?.code || "").trim();

  if (
    code !== "WAREHOUSE_SELECTION_REQUIRED_FOR_ITEM" &&
    code !== "NO_VALID_WAREHOUSE_FOR_ORDER_ITEM" &&
    code !== "INVALID_SELECTED_WAREHOUSE_FOR_ITEM"
  ) {
    return null;
  }

  return {
    code,
    message: String(inventory?.message || responseData?.message || "").trim(),
    data: inventory?.data || null,
  };
}

export const wrap = {
  maxWidth: 1180,
  margin: "18px auto",
  padding: 14,
};

export const topbar = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  marginBottom: 12,
};

export const title = { fontSize: 20, fontWeight: 1000, letterSpacing: 0.2 };
export const sub = { fontSize: 12, opacity: 0.75, marginTop: 4 };

export const note = {
  padding: 12,
  border: "1px solid #eee",
  borderRadius: 12,
  background: "#fff",
};

export const empty = {
  padding: 16,
  borderRadius: 14,
  border: "1px dashed #e5e7eb",
  background: "#fff",
};

export const grid = {
  display: "grid",
  gap: 14,
  justifyContent: "start",
  width: "fit-content",
  maxWidth: "100%",
  marginLeft: 0,
  marginRight: "auto",
  gridTemplateColumns: "repeat(2, minmax(460px, 1fr))",
};

export const ticketCard = {
  border: "1px solid #eaeaea",
  borderRadius: 16,
  overflow: "hidden",
  background: "#fff",
  boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
  display: "flex",
  flexDirection: "column",
};

export const ticketHead = {
  background: "#fbbf24",
  padding: 12,
};

export const ticketHeadTop = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
};

export const ticketMesaText = {
  fontWeight: 1000,
  fontSize: 14,
  color: "#111827",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const ticketTimePill = {
  fontSize: 12,
  fontWeight: 900,
  color: "#111827",
  background: "rgba(255,255,255,0.55)",
  border: "1px solid rgba(17,24,39,0.15)",
  padding: "4px 8px",
  borderRadius: 999,
  flexShrink: 0,
};

export const ticketHeadBottom = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  marginTop: 6,
};

export const ticketFolioText = {
  fontSize: 12,
  fontWeight: 900,
  color: "rgba(17,24,39,0.85)",
};

export const ticketBadges = {
  display: "flex",
  gap: 8,
  alignItems: "center",
  flexWrap: "wrap",
  justifyContent: "flex-end",
};

export const badgeOk2 = {
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 10px",
  borderRadius: 999,
  border: "1px solid rgba(22,101,52,0.25)",
  background: "rgba(236,253,245,0.85)",
  color: "#166534",
  fontWeight: 950,
  fontSize: 12,
};

export const badgeWarn2 = {
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 10px",
  borderRadius: 999,
  border: "1px solid rgba(154,52,18,0.18)",
  background: "rgba(255,247,237,0.85)",
  color: "#9a3412",
  fontWeight: 950,
  fontSize: 12,
};

export const badgeDark2 = {
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 10px",
  borderRadius: 999,
  border: "1px solid rgba(17,24,39,0.25)",
  background: "rgba(17,24,39,0.9)",
  color: "#fff",
  fontWeight: 950,
  fontSize: 12,
};

export const ticketCustomer = {
  marginTop: 8,
  fontSize: 12,
  fontWeight: 900,
  color: "rgba(17,24,39,0.9)",
};

export const ticketMeta = {
  marginTop: 4,
  fontSize: 11,
  opacity: 0.75,
  color: "#111827",
};

export const ticketBody = {
  padding: 10,
  maxHeight: 230,
  overflowY: "auto",
  overflowX: "hidden",
  scrollbarGutter: "stable",
  minHeight: 72,
};

export const emptyItemsBox = {
  border: "1px dashed #d1d5db",
  background: "#f9fafb",
  borderRadius: 12,
  padding: 12,
};

export const emptyItemsTitle = {
  fontSize: 13,
  fontWeight: 950,
  color: "#111827",
};

export const emptyItemsText = {
  marginTop: 6,
  fontSize: 12,
  lineHeight: 1.45,
  color: "#4b5563",
};

export const ticketFooter = {
  borderTop: "1px solid #f1f5f9",
  padding: "10px 12px 12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  flexWrap: "wrap",
};

export const ticketFooterLeft = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
};

export const ticketFooterRight = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
};

export const noticeSentPill = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid #bfdbfe",
  background: "#eff6ff",
  color: "#1d4ed8",
  fontWeight: 950,
  fontSize: 12,
};

export const noticePendingPill = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid #e5e7eb",
  background: "#f9fafb",
  color: "#374151",
  fontWeight: 900,
  fontSize: 12,
};

export const ticketItemRow = {
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: 12,
  padding: "10px 0",
  borderTop: "1px solid #f1f5f9",
};

export const ticketLeft = { minWidth: 0 };

export const ticketItemTop = {
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  gap: 10,
  alignItems: "flex-start",
};

export const qtyDot = {
  width: 26,
  height: 26,
  borderRadius: 999,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 1000,
  fontSize: 12,
  color: "#111827",
  background: "#f3f4f6",
  border: "1px solid #e5e7eb",
  flexShrink: 0,
};

export const ticketItemName = {
  fontWeight: 1000,
  fontSize: 13,
  color: "#111827",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const ticketNotes = {
  marginTop: 4,
  fontSize: 12,
  color: "rgba(17,24,39,0.75)",
  whiteSpace: "pre-wrap",
};

export const ticketItemMeta = {
  marginTop: 6,
  display: "flex",
  gap: 8,
  alignItems: "center",
  flexWrap: "wrap",
  fontSize: 11,
  color: "rgba(17,24,39,0.7)",
};

export const metaDot = {
  opacity: 0.8,
};

export const consumptionRow = {
  marginTop: 8,
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
};

export const consumptionBadgeApplied = {
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 10px",
  borderRadius: 999,
  border: "1px solid #bbf7d0",
  background: "#ecfdf5",
  color: "#166534",
  fontWeight: 950,
  fontSize: 11,
};

export const consumptionBadgeAlready = {
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 10px",
  borderRadius: 999,
  border: "1px solid #bfdbfe",
  background: "#eff6ff",
  color: "#1d4ed8",
  fontWeight: 950,
  fontSize: 11,
};

export const consumptionBadgeNeutral = {
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 10px",
  borderRadius: 999,
  border: "1px solid #e5e7eb",
  background: "#f9fafb",
  color: "#374151",
  fontWeight: 950,
  fontSize: 11,
};

export const ticketModifiersBlock = {
  marginTop: 10,
  display: "grid",
  gap: 8,
};

export const ticketModifiersTitle = {
  fontSize: 11,
  fontWeight: 1000,
  letterSpacing: 0.2,
  color: "#92400e",
  textTransform: "uppercase",
};

export const ticketModifierGroups = {
  display: "grid",
  gap: 8,
};

export const ticketModifierGroupCard = {
  display: "grid",
  gap: 6,
  padding: "8px 10px",
  borderRadius: 12,
  border: "1px solid #fde68a",
  background: "#fffbeb",
};

export const ticketModifierGroupName = {
  fontSize: 11,
  fontWeight: 1000,
  color: "#92400e",
};

export const ticketModifiers = {
  display: "flex",
  gap: 6,
  flexWrap: "wrap",
};

export const chipModifier = {
  fontSize: 11,
  fontWeight: 900,
  padding: "3px 8px",
  borderRadius: 999,
  border: "1px solid #fcd34d",
  background: "#fff",
  color: "#92400e",
};

export const compositeGroupWrap = {
  marginTop: 10,
  border: "1px solid rgba(249, 168, 37, 0.35)",
  borderRadius: 14,
  background: "rgba(255, 247, 237, 0.75)",
  overflow: "hidden",
};

export const compositeGroupHeader = {
  padding: "10px 12px",
  borderBottom: "1px solid rgba(249, 168, 37, 0.22)",
  background: "rgba(254, 243, 199, 0.7)",
};

export const compositeGroupTitle = {
  fontSize: 12,
  fontWeight: 1000,
  color: "#9a3412",
  textTransform: "uppercase",
  letterSpacing: 0.25,
};

export const compositeGroupSub = {
  marginTop: 4,
  fontSize: 11,
  color: "#92400e",
  opacity: 0.8,
};

export const compositeGroupBody = {
  padding: "4px 12px 10px",
  display: "grid",
  gap: 8,
};

export const compositeChildRow = {
  borderTop: "1px dashed rgba(249, 168, 37, 0.22)",
  paddingTop: 8,
};

export const ticketRight = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  alignItems: "flex-end",
  justifyContent: "center",
};

export const btnPrimary = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #d1fae5",
  background: "#ecfdf5",
  cursor: "pointer",
  fontWeight: 1000,
};

export const btnGhost = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  background: "#fff",
  cursor: "pointer",
  fontWeight: 950,
};

export const btnDanger = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ffb4b4",
  background: "#ffe5e5",
  cursor: "pointer",
  fontWeight: 950,
  color: "#7a0010",
};

export const btnAction = (enabled) => ({
  width: 110,
  padding: "8px 10px",
  borderRadius: 999,
  border: `1px solid ${enabled ? "#c7d2fe" : "#e5e7eb"}`,
  background: enabled ? "#eef2ff" : "#f9fafb",
  cursor: enabled ? "pointer" : "not-allowed",
  fontWeight: 1000,
  color: "#1f2a7a",
  opacity: enabled ? 1 : 0.55,
});

export const btnActionOk = (enabled) => ({
  width: 110,
  padding: "8px 10px",
  borderRadius: 999,
  border: `1px solid ${enabled ? "#bbf7d0" : "#e5e7eb"}`,
  background: enabled ? "#ecfdf5" : "#f9fafb",
  cursor: enabled ? "pointer" : "not-allowed",
  fontWeight: 1000,
  color: "#166534",
  opacity: enabled ? 1 : 0.55,
});

export const btnNotifyReady = (enabled) => ({
  minWidth: 158,
  padding: "10px 14px",
  borderRadius: 999,
  border: `1px solid ${enabled ? "#f59e0b" : "#e5e7eb"}`,
  background: enabled ? "#fbbf24" : "#f9fafb",
  color: enabled ? "#111827" : "#6b7280",
  cursor: enabled ? "pointer" : "not-allowed",
  fontWeight: 1000,
  opacity: enabled ? 1 : 0.65,
});

export const pillBase = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "2px 8px",
  borderRadius: 999,
  border: "1px solid",
  fontWeight: 900,
  fontSize: 11,
};

export const msgErr = {
  background: "#ffe5e5",
  border: "1px solid #ffb4b4",
  padding: 10,
  borderRadius: 10,
  marginBottom: 10,
  color: "#7a0010",
  fontWeight: 900,
};

export const msgOk = {
  background: "#ecfdf5",
  border: "1px solid #bbf7d0",
  padding: 10,
  borderRadius: 10,
  marginBottom: 10,
  color: "#166534",
  fontWeight: 900,
};
