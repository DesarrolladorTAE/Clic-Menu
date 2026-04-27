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

  return parents.map((parent) => ({
    ...parent,
    children: childrenByParent.get(parent.id) || [],
  }));
}