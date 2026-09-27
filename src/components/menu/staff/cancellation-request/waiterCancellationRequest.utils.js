export const REASON_LABELS = {
  customer_changed_mind: "Cliente cambió de opinión",
  capture_error: "Error de captura",
  service_issue: "Incidencia de servicio",
  quality_issue: "Problema de calidad",
  preparation_incident: "Incidencia de preparación",
  courtesy_compensation: "Cortesía o compensación",
  other: "Otro",
};

export const REUSE_LABELS = {
  reuse: "Regresar a Preparación rápida",
  discard: "Descartar",
};

export const DELIVERY_NOT_DELIVERED = "not_delivered";
export const DELIVERY_DELIVERED = "delivered";

export const DELIVERY_LABELS = {
  [DELIVERY_NOT_DELIVERED]: "No entregado a la mesa",
  [DELIVERY_DELIVERED]: "Ya entregado a la mesa",
};

export const KITCHEN_STATUS_LABELS = {
  queued: "En espera",
  in_progress: "En preparación",
  ready: "Listo",
  picked_up: "Retirado de cocina",
};

export function getOrderItemId(item) {
  const id = Number(item?.order_item_id || item?.id || 0);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

export function getRequestedQuantity(item) {
  const quantity = Number(item?.requested_quantity ?? item?.quantity ?? 0);

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return 0;
  }

  return Math.floor(quantity);
}

export function getEffectiveQuantity(item) {
  const quantity = Number(item?.effective_quantity ?? item?.quantity ?? 0);

  if (!Number.isFinite(quantity) || quantity < 0) {
    return 0;
  }

  return Math.floor(quantity);
}

export function getItemLabel(item) {
  const productName = String(item?.product_name || item?.display_name || item?.name || "Producto").trim();
  const variantName = String(item?.variant_name || "").trim();

  if (variantName) {
    return `${productName} · ${variantName}`;
  }

  return productName || "Producto";
}

export function normalizePhysicalOptions(item, key) {
  const options = item?.physical_options?.[key];

  if (!Array.isArray(options)) {
    return [];
  }

  return options.map((value) => String(value || "").trim()).filter(Boolean);
}

export function getReasonLabel(code) {
  const normalized = String(code || "").trim();

  if (!normalized) {
    return "Motivo no especificado";
  }

  return REASON_LABELS[normalized] || normalized;
}

export function getKitchenStatusLabel(status) {
  const normalized = String(status || "").trim();

  if (!normalized) {
    return null;
  }

  return KITCHEN_STATUS_LABELS[normalized] || normalized;
}

export function formatRequestDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleString("es-MX", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function getAuthorizerUserId(authorizer) {
  const userId = Number(authorizer?.user_id ?? authorizer?.user?.id ?? 0);

  if (!Number.isInteger(userId) || userId <= 0) {
    return null;
  }

  return userId;
}

export function getAuthorizerLabel(authorizer) {
  const name = String(authorizer?.name || authorizer?.user?.name || "").trim();
  const email = String(authorizer?.email || authorizer?.user?.email || "").trim();

  if (name && email) {
    return `${name} · ${email}`;
  }

  if (name) {
    return name;
  }

  if (email) {
    return email;
  }

  const userId = getAuthorizerUserId(authorizer);

  return userId ? `Autorizador ${userId}` : "Autorizador";
}

export function buildRequestedItems(request, context) {
  const requestItems = Array.isArray(request?.items) ? request.items : [];
  const contextItems = Array.isArray(context?.items) ? context.items : [];
  const contextById = new Map();

  contextItems.forEach((item) => {
    const orderItemId = getOrderItemId(item);

    if (orderItemId) {
      contextById.set(orderItemId, item);
    }
  });

  return requestItems.map((requestedItem) => {
    const orderItemId = getOrderItemId(requestedItem);

    if (!orderItemId) {
      return null;
    }

    const currentItem = contextById.get(orderItemId) || null;
    const requestedQuantity = getRequestedQuantity(requestedItem);
    const effectiveQuantity = currentItem ? getEffectiveQuantity(currentItem) : 0;

    let stale = false;
    let staleMessage = "";

    if (!currentItem) {
      stale = true;
      staleMessage = "Este producto ya no aparece en el contexto actual de la comanda.";
    } else if (requestedQuantity <= 0) {
      stale = true;
      staleMessage = "La solicitud ya no tiene una cantidad válida para este producto.";
    } else if (currentItem?.can_cancel === false) {
      stale = true;
      staleMessage = "Este producto ya no se puede cancelar en su estado actual.";
    } else if (effectiveQuantity < requestedQuantity) {
      stale = true;
      staleMessage = "La cantidad disponible cambió desde que el cliente hizo la solicitud.";
    }

    return {
      ...requestedItem,
      ...(currentItem || {}),
      order_item_id: orderItemId,
      product_name: currentItem?.product_name || requestedItem?.product_name || null,
      variant_name: currentItem?.variant_name || requestedItem?.variant_name || null,
      requested_quantity: requestedQuantity,
      effective_quantity: effectiveQuantity,
      stale,
      stale_message: staleMessage,
    };
  }).filter(Boolean);
}

export function getPhysicalResolutionItems(items) {
  return (Array.isArray(items) ? items : []).filter((item) => {
    if (item?.stale) {
      return false;
    }

    const reuseOptions = normalizePhysicalOptions(item, "reuse_intents");
    const deliveryOptions = normalizePhysicalOptions(item, "delivery_states");

    return reuseOptions.length > 0 || deliveryOptions.length > 0;
  });
}

export function requiresReuseDecision(item, decision = {}) {
  const reuseOptions = normalizePhysicalOptions(item, "reuse_intents");
  const deliveryOptions = normalizePhysicalOptions(item, "delivery_states");

  if (deliveryOptions.length > 0) {
    return String(decision?.delivery_state || "").trim() === DELIVERY_NOT_DELIVERED;
  }

  return reuseOptions.length > 0;
}

export function requiresRequestAuthorization(request, context, items) {
  const isFull = String(request?.type || "").toLowerCase() === "full";

  if (isFull) {
    return Boolean(context?.order?.full_cancellation_requires_authorization);
  }

  return (Array.isArray(items) ? items : []).some((item) => {
    return !item?.stale && Boolean(item?.requires_authorization);
  });
}

export function normalizeAuthorizers(context) {
  return (Array.isArray(context?.authorizers) ? context.authorizers : [])
    .map((authorizer) => ({
      userId: getAuthorizerUserId(authorizer),
      label: getAuthorizerLabel(authorizer),
    }))
    .filter((authorizer) => authorizer.userId);
}

export function buildInitialItemDecisions(items) {
  const decisions = {};

  (Array.isArray(items) ? items : []).forEach((item) => {
    if (item?.stale) {
      return;
    }

    const orderItemId = getOrderItemId(item);

    if (!orderItemId) {
      return;
    }

    const reuseOptions = normalizePhysicalOptions(item, "reuse_intents");
    const deliveryOptions = normalizePhysicalOptions(item, "delivery_states");
    const decision = {};

    if (deliveryOptions.length === 1) {
      decision.delivery_state = deliveryOptions[0];
    }

    const reuseRequired =
      deliveryOptions.length === 0 ||
      decision.delivery_state === DELIVERY_NOT_DELIVERED;

    if (reuseRequired && reuseOptions.length === 1) {
      decision.reuse_intent = reuseOptions[0];
    }

    if (Object.keys(decision).length > 0) {
      decisions[orderItemId] = decision;
    }
  });

  return decisions;
}

export function buildApprovalPayload(items, decisions, requiresAuthorization, authorizerUserId, pin) {
  const decisionItems = (Array.isArray(items) ? items : []).map((item) => {
    const orderItemId = getOrderItemId(item);

    if (!orderItemId || item?.stale) {
      return null;
    }

    const decision = decisions?.[orderItemId] || {};
    const deliveryState = String(decision?.delivery_state || "").trim();
    const reuseIntent = String(decision?.reuse_intent || "").trim();
    const reuseRequired = requiresReuseDecision(item, decision);
    const payload = { order_item_id: orderItemId };

    if (deliveryState) {
      payload.delivery_state = deliveryState;
    }

    if (reuseRequired && reuseIntent) {
      payload.reuse_intent = reuseIntent;
    }

    if (!payload.delivery_state && !payload.reuse_intent) {
      return null;
    }

    return payload;
  }).filter(Boolean);

  const payload = {};

  if (decisionItems.length > 0) {
    payload.items = decisionItems;
  }

  if (requiresAuthorization) {
    payload.authorizer_user_id = Number(authorizerUserId);
    payload.pin = String(pin || "").trim();
  }

  return payload;
}