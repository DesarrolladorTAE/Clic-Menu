import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { Badge, Modal, PillButton } from "../../../pages/public/publicMenu.ui";

/*
 * Resuelve los datos operativos de una cancelación iniciada por Mesero.
 *
 * Qué usa:
 * - StaffOrderCancellationController.php, mediante el contexto ya cargado por el hook.
 * - StoreOrderCancellationRequest.php, respetando reason_code, reason_note,
 *   reuse_intent, delivery_state, authorizer_user_id y pin.
 *
 * Qué archivo lo usa:
 * - src/pages/staff/waiter/StaffMenuEntryPage.jsx.
 *
 * No selecciona productos, no ejecuta requests y no calcula partial/full.
 * La selección ya fue resuelta previamente dentro del carrito.
 */

const REASON_OPTIONS = [
  { value: "customer_changed_mind", label: "Cliente cambió de opinión" },
  { value: "capture_error", label: "Error de captura" },
  { value: "service_issue", label: "Incidencia de servicio" },
  { value: "quality_issue", label: "Problema de calidad" },
  { value: "preparation_incident", label: "Incidencia de preparación" },
  { value: "courtesy_compensation", label: "Cortesía o compensación" },
  { value: "other", label: "Otro" },
];

const REUSE_LABELS = {
  reuse: "Regresar a Preparación rápida",
  discard: "Descartar",
};

const DELIVERY_LABELS = {
  not_delivered: "No entregado a la mesa",
  delivered: "Ya entregado a la mesa",
};

function getOrderItemId(item) {
  const id = Number(item?.order_item_id || 0);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function getItemLabel(item) {
  const productName = String(item?.product_name || item?.display_name || "Producto").trim();
  return productName || "Producto";
}

function normalizePhysicalOptions(item, key) {
  const options = item?.physical_options?.[key];
  return Array.isArray(options) ? options.map((value) => String(value || "").trim()).filter(Boolean) : [];
}

function buildInitialItemDecisions(items) {
  const decisions = {};

  (Array.isArray(items) ? items : []).forEach((item) => {
    const orderItemId = getOrderItemId(item);
    if (!orderItemId) return;

    const reuseOptions = normalizePhysicalOptions(item, "reuse_intents");
    const deliveryOptions = normalizePhysicalOptions(item, "delivery_states");
    const decision = {};

    if (reuseOptions.length === 1) decision.reuse_intent = reuseOptions[0];
    if (deliveryOptions.length === 1) decision.delivery_state = deliveryOptions[0];
    if (Object.keys(decision).length > 0) decisions[orderItemId] = decision;
  });

  return decisions;
}

function getAuthorizerUserId(authorizer) {
  const userId = Number(authorizer?.user_id ?? authorizer?.user?.id ?? 0);
  return Number.isInteger(userId) && userId > 0 ? userId : null;
}

function getAuthorizerLabel(authorizer) {
  const name = String(authorizer?.user?.name || "").trim();
  const email = String(authorizer?.user?.email || "").trim();

  if (name && email) return `${name} · ${email}`;
  if (name) return name;
  if (email) return email;

  const userId = getAuthorizerUserId(authorizer);
  return userId ? `Autorizador ${userId}` : "Autorizador";
}

export default function WaiterCancellationDialog({
  open,
  type = "partial",
  selectedItems = [],
  context = null,
  requiresAuthorization = false,
  loading = false,
  error = "",
  onClose,
  onConfirm,
}) {
  const theme = useTheme();

  const [reasonCode, setReasonCode] = useState("");
  const [reasonNote, setReasonNote] = useState("");
  const [authorizerUserId, setAuthorizerUserId] = useState("");
  const [pin, setPin] = useState("");
  const [itemDecisions, setItemDecisions] = useState({});
  const [localError, setLocalError] = useState("");

  const isFull = String(type || "").toLowerCase() === "full";

  const authorizers = useMemo(() => {
    return (Array.isArray(context?.authorizers) ? context.authorizers : [])
      .map((authorizer) => ({
        raw: authorizer,
        userId: getAuthorizerUserId(authorizer),
        label: getAuthorizerLabel(authorizer),
      }))
      .filter((authorizer) => authorizer.userId);
  }, [context]);

  useEffect(() => {
    if (!open) return;

    setReasonCode("");
    setReasonNote("");
    setAuthorizerUserId("");
    setPin("");
    setLocalError("");
    setItemDecisions(buildInitialItemDecisions(selectedItems));
  }, [open, selectedItems]);

  const missingPhysicalDecision = useMemo(() => {
    return (Array.isArray(selectedItems) ? selectedItems : []).some((item) => {
      const orderItemId = getOrderItemId(item);
      if (!orderItemId) return false;

      const decision = itemDecisions?.[orderItemId] || {};
      const reuseOptions = normalizePhysicalOptions(item, "reuse_intents");
      const deliveryOptions = normalizePhysicalOptions(item, "delivery_states");

      if (reuseOptions.length > 0 && !reuseOptions.includes(String(decision?.reuse_intent || ""))) return true;
      if (deliveryOptions.length > 0 && !deliveryOptions.includes(String(decision?.delivery_state || ""))) return true;

      return false;
    });
  }, [selectedItems, itemDecisions]);

  const canSubmit =
    selectedItems.length > 0 &&
    Boolean(reasonCode) &&
    !missingPhysicalDecision &&
    (!requiresAuthorization || (Number(authorizerUserId) > 0 && Boolean(String(pin || "").trim())));

  const fieldStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: `1px solid ${theme.palette.divider}`,
    outline: "none",
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
    fontSize: 13,
    fontWeight: 750,
    boxSizing: "border-box",
  };

  const updateDecision = (orderItemId, field, value) => {
    if (!orderItemId) return;

    setItemDecisions((previous) => {
      const next = { ...previous };
      const decision = { ...(next[orderItemId] || {}) };

      if (value) decision[field] = value;
      else delete decision[field];

      if (Object.keys(decision).length > 0) next[orderItemId] = decision;
      else delete next[orderItemId];

      return next;
    });
  };

  const handleConfirm = async () => {
    if (loading) return;

    if (!reasonCode) {
      setLocalError("Debes indicar el motivo de la cancelación.");
      return;
    }

    if (missingPhysicalDecision) {
      setLocalError("Debes resolver el destino físico de todos los productos que lo requieren.");
      return;
    }

    if (requiresAuthorization && !(Number(authorizerUserId) > 0)) {
      setLocalError("Debes seleccionar un autorizador operativo.");
      return;
    }

    if (requiresAuthorization && !String(pin || "").trim()) {
      setLocalError("Debes ingresar el PIN del autorizador operativo.");
      return;
    }

    const resolution = {
      reason_code: reasonCode,
      reason_note: String(reasonNote || "").trim() || null,
      item_decisions: itemDecisions,
    };

    if (requiresAuthorization) {
      resolution.authorizer_user_id = Number(authorizerUserId);
      resolution.pin = String(pin || "").trim();
    }

    setLocalError("");
    await onConfirm?.(resolution);
  };

  return (
    <Modal
      open={open}
      title={isFull ? "Cancelar comanda" : "Cancelar productos"}
      onClose={() => {
        if (!loading) onClose?.();
      }}
      actions={
        <>
          <PillButton tone="default" disabled={loading} onClick={onClose} title="Volver a la selección">
            Volver
          </PillButton>

          <PillButton
            tone="danger"
            disabled={loading || !canSubmit}
            onClick={handleConfirm}
            title={isFull ? "Confirmar cancelación de la comanda" : "Confirmar cancelación de productos"}
          >
            {loading ? "⏳ Procesando..." : isFull ? "Cancelar comanda" : "Cancelar productos"}
          </PillButton>
        </>
      }
    >
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <Badge tone={isFull ? "warn" : "default"}>
            {isFull ? "Cancelación total" : "Cancelación parcial"}
          </Badge>

          <Badge tone="dark">
            {selectedItems.length === 1 ? "1 partida seleccionada" : `${selectedItems.length} partidas seleccionadas`}
          </Badge>
        </div>

        <div style={{ display: "grid", gap: 7 }}>
          <label style={{ fontSize: 13, fontWeight: 900, color: theme.palette.text.primary }}>
            Motivo
          </label>

          <select
            value={reasonCode}
            onChange={(event) => setReasonCode(event.target.value)}
            disabled={loading}
            style={fieldStyle}
          >
            <option value="">Selecciona un motivo</option>
            {REASON_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "grid", gap: 7 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <label style={{ fontSize: 13, fontWeight: 900, color: theme.palette.text.primary }}>
              Nota
            </label>

            <span style={{ fontSize: 11, color: theme.palette.text.secondary }}>
              {reasonNote.length}/500
            </span>
          </div>

          <textarea
            value={reasonNote}
            onChange={(event) => setReasonNote(event.target.value.slice(0, 500))}
            disabled={loading}
            placeholder="Observación opcional"
            rows={3}
            style={{ ...fieldStyle, resize: "vertical", minHeight: 78 }}
          />
        </div>

        {selectedItems.some((item) => {
          return normalizePhysicalOptions(item, "reuse_intents").length > 0 ||
            normalizePhysicalOptions(item, "delivery_states").length > 0;
        }) ? (
          <div style={{ display: "grid", gap: 9 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 950, color: theme.palette.text.primary }}>
                Resolución física
              </div>

              <div style={{ marginTop: 3, fontSize: 11, color: theme.palette.text.secondary }}>
                Solo aparecen decisiones habilitadas por el contexto de la comanda.
              </div>
            </div>

            {selectedItems.map((item) => {
              const orderItemId = getOrderItemId(item);
              const reuseOptions = normalizePhysicalOptions(item, "reuse_intents");
              const deliveryOptions = normalizePhysicalOptions(item, "delivery_states");

              if (!orderItemId || (reuseOptions.length === 0 && deliveryOptions.length === 0)) return null;

              const decision = itemDecisions?.[orderItemId] || {};
              const selectedQuantity = Math.max(1, Number(item?.selected_quantity || 1));

              return (
                <div
                  key={`waiter-cancellation-resolution-${orderItemId}`}
                  style={{
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 14,
                    background: theme.palette.background.paper,
                    padding: 11,
                    display: "grid",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <strong style={{ minWidth: 0, fontSize: 13, color: theme.palette.text.primary }}>
                      {getItemLabel(item)}
                    </strong>

                    <Badge tone="default">Cant. {selectedQuantity}</Badge>
                  </div>

                  {reuseOptions.length > 0 ? (
                    <div style={{ display: "grid", gap: 6 }}>
                      <label style={{ fontSize: 12, fontWeight: 850, color: theme.palette.text.secondary }}>
                        Destino físico
                      </label>

                      <select
                        value={decision?.reuse_intent || ""}
                        disabled={loading || reuseOptions.length === 1}
                        onChange={(event) => updateDecision(orderItemId, "reuse_intent", event.target.value)}
                        style={fieldStyle}
                      >
                        {reuseOptions.length > 1 ? <option value="">Selecciona una opción</option> : null}
                        {reuseOptions.map((option) => (
                          <option key={option} value={option}>
                            {REUSE_LABELS[option] || option}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}

                  {deliveryOptions.length > 0 ? (
                    <div style={{ display: "grid", gap: 6 }}>
                      <label style={{ fontSize: 12, fontWeight: 850, color: theme.palette.text.secondary }}>
                        Estado de entrega
                      </label>

                      <select
                        value={decision?.delivery_state || ""}
                        disabled={loading || deliveryOptions.length === 1}
                        onChange={(event) => updateDecision(orderItemId, "delivery_state", event.target.value)}
                        style={fieldStyle}
                      >
                        {deliveryOptions.length > 1 ? <option value="">Selecciona una opción</option> : null}
                        {deliveryOptions.map((option) => (
                          <option key={option} value={option}>
                            {DELIVERY_LABELS[option] || option}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}

        {requiresAuthorization ? (
          <div
            style={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 14,
              padding: 12,
              background: theme.palette.action.hover,
              display: "grid",
              gap: 10,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 950, color: theme.palette.text.primary }}>
                Autorización operativa
              </div>

              <div style={{ marginTop: 3, fontSize: 11, color: theme.palette.text.secondary }}>
                Esta cancelación requiere autorización antes de aplicarse.
              </div>
            </div>

            {authorizers.length > 0 ? (
              <>
                <div style={{ display: "grid", gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 850, color: theme.palette.text.secondary }}>
                    Autorizador
                  </label>

                  <select
                    value={authorizerUserId}
                    onChange={(event) => setAuthorizerUserId(event.target.value)}
                    disabled={loading}
                    style={fieldStyle}
                  >
                    <option value="">Selecciona un autorizador</option>
                    {authorizers.map((authorizer) => (
                      <option key={authorizer.userId} value={String(authorizer.userId)}>
                        {authorizer.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "grid", gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 850, color: theme.palette.text.secondary }}>
                    PIN
                  </label>

                  <input
                    type="password"
                    value={pin}
                    onChange={(event) => setPin(event.target.value)}
                    disabled={loading}
                    autoComplete="off"
                    maxLength={50}
                    placeholder="PIN del autorizador"
                    style={fieldStyle}
                  />
                </div>
              </>
            ) : (
              <div
                role="alert"
                style={{
                  border: `1px solid ${theme.palette.warning.main}`,
                  borderRadius: 12,
                  padding: "9px 10px",
                  color: theme.palette.warning.dark,
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                No hay autorizadores operativos disponibles para esta sucursal.
              </div>
            )}
          </div>
        ) : null}

        {localError || error ? (
          <div
            role="alert"
            style={{
              border: `1px solid ${theme.palette.error.main}`,
              borderRadius: 12,
              padding: "9px 10px",
              color: theme.palette.error.main,
              fontSize: 12,
              fontWeight: 850,
              whiteSpace: "pre-line",
            }}
          >
            {localError || error}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}