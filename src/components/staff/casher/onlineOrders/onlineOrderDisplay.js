export function onlineOrderStatusLabel(value) {
  const status = String(value || "").toLowerCase();

  const labels = {
    pending_confirmation: "Pendiente de confirmación",
    pending_acceptance: "Pendiente de aceptación",
    accepted: "Aceptado",
    confirmed_for_preparation: "Confirmado para preparación",
    preparing: "En preparación",
    ready: "Listo",
    out_for_delivery: "En camino",
    arrived_at_destination: "Llegó al destino",
    delivered: "Entregado",
    completed: "Completado",
    rejected: "Rechazado",
    cancelled: "Cancelado",
  };

  return labels[status] || "Estado no disponible";
}

export function onlineOrderStatusColor(value) {
  const status = String(value || "").toLowerCase();

  if (["completed", "delivered"].includes(status)) return "success";
  if (status === "ready") return "success";
  if (["rejected", "cancelled"].includes(status)) return "error";
  if (["preparing", "confirmed_for_preparation", "out_for_delivery", "arrived_at_destination"].includes(status)) return "info";
  if (["pending_confirmation", "pending_acceptance", "accepted"].includes(status)) return "warning";

  return "default";
}

export function financialStatusLabel(value) {
  const status = String(value || "").toLowerCase();

  if (status === "paid") return "Pagado";
  if (status === "unpaid") return "Pendiente de pago";

  return "Estado de pago no disponible";
}

export function financialStatusColor(value) {
  return String(value || "").toLowerCase() === "paid" ? "success" : "warning";
}

export function fulfillmentLabel(value) {
  const type = String(value || "").toLowerCase();

  const labels = {
    pickup: "Recoger en sucursal",
    home_delivery: "Entrega a domicilio",
    internal_location: "Entrega en ubicación interna",
    scheduled_point: "Punto programado",
  };

  return labels[type] || "Forma de entrega no disponible";
}

export function timingLabel(value) {
  const type = String(value || "").toLowerCase();

  const labels = {
    asap: "Lo antes posible",
    scheduled: "Programado",
  };

  return labels[type] || "Horario no disponible";
}

export function paymentTypeLabel(value) {
  const type = String(value || "").toLowerCase();

  const labels = {
    cash: "Efectivo",
    transfer: "Transferencia",
    terminal: "Terminal",
  };

  return labels[type] || "Método no disponible";
}

export function kitchenFlowLabel(value) {
  const type = String(value || "").toLowerCase();

  if (type === "with_kitchen") return "Preparación en Cocina";
  if (type === "without_kitchen") return "Preparación desde Caja";

  return "Preparación no disponible";
}

export function ownershipLabel(value) {
  const type = String(value || "").toLowerCase();

  if (type === "mine") return "Asignado a esta caja";
  if (type === "unassigned") return "Disponible";
  if (type === "other") return "Asignado a otra caja";

  return "Asignación no disponible";
}

export function actorLabel(value) {
  const type = String(value || "").toLowerCase();

  const labels = {
    cashier: "Caja",
    kitchen: "Cocina",
    customer: "Cliente",
    public: "Cliente",
    system: "Sistema",
  };

  return labels[type] || "Sistema";
}

export function formatCurrency(value) {
  const safe = Number(value || 0);

  try {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    }).format(safe);
  } catch {
    return `$${safe.toFixed(2)}`;
  }
}

export function formatDateTime(value) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

export function formatDate(value) {
  if (!value) return "—";

  try {
    const date = String(value).includes("T") ? new Date(value) : new Date(`${value}T12:00:00`);

    return date.toLocaleDateString("es-MX", {
      dateStyle: "medium",
    });
  } catch {
    return "—";
  }
}