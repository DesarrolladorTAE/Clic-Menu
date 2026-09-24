import React, { useEffect, useState } from "react";
import { Modal, PillButton } from "../publicMenu.ui";

/*
 * Modal público para solicitar una cancelación desde QR de mesa.
 */

const REASON_OPTIONS = [
  { value: "customer_changed_mind", label: "Cambié de opinión" },
  { value: "capture_error", label: "Error en el pedido" },
  { value: "service_issue", label: "Incidencia de servicio" },
  { value: "quality_issue", label: "Problema de calidad" },
  { value: "preparation_incident", label: "Incidencia de preparación" },
  { value: "courtesy_compensation", label: "Cortesía o compensación" },
  { value: "other", label: "Otro" },
];

function getItemLabel(item) {
  const productName = String(
    item?.product_name ||
    item?.display_name ||
    item?.name ||
    "Producto",
  ).trim();

  const variantName = String(item?.variant_name || "").trim();

  if (productName && variantName) {
    return `${productName} · ${variantName}`;
  }

  return productName || "Producto";
}

function getSelectedQuantity(item) {
  const quantity = Number(item?.selected_quantity || 0);

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return 1;
  }

  return Math.max(1, Math.floor(quantity));
}

function getQuantityLabel(quantity) {
  return quantity === 1 ? "1 unidad" : `${quantity} unidades`;
}

export default function PublicCancellationRequestDialog({
  open,
  type = "partial",
  selectedItems = [],
  loading = false,
  error = "",
  themeColor,
  onClose,
  onConfirm,
}) {
  const [reasonCode, setReasonCode] = useState("");
  const [reasonNote, setReasonNote] = useState("");
  const [localError, setLocalError] = useState("");

  const items = Array.isArray(selectedItems) ? selectedItems : [];
  const isFull = String(type || "").trim().toLowerCase() === "full";
  const accentColor = String(themeColor || "#FF7A00").trim() || "#FF7A00";

  useEffect(() => {
    if (!open) {
      return;
    }

    setReasonCode("");
    setReasonNote("");
    setLocalError("");
  }, [open]);

  const canSubmit = items.length > 0 && Boolean(reasonCode) && !loading;

  const fieldStyle = {
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    border: "1px solid rgba(47,42,61,0.12)",
    borderRadius: 14,
    background: "#FFFFFF",
    color: "#2F2A3D",
    padding: "10px 12px",
    fontSize: 13,
    fontWeight: 750,
    lineHeight: 1.4,
    outlineColor: accentColor,
  };

  const handleClose = () => {
    if (loading) {
      return;
    }

    setLocalError("");
    onClose?.();
  };

  const handleConfirm = async () => {
    if (loading) {
      return;
    }

    if (items.length === 0) {
      setLocalError("Selecciona al menos un producto para solicitar la cancelación.");
      return;
    }

    if (!reasonCode) {
      setLocalError("Debes indicar el motivo de la solicitud.");
      return;
    }

    setLocalError("");

    const result = await onConfirm?.({
      reason_code: reasonCode,
      reason_note: String(reasonNote || "").trim() || null,
    });

    if (result?.ok === false && result?.message) {
      setLocalError(String(result.message));
    }
  };

  return (
    <Modal
      open={open}
      title={isFull ? "Solicitar cancelar la comanda" : "Solicitar cancelación"}
      onClose={handleClose}
      closeOnBackdrop={!loading}
      width="min(620px, 95vw)"
      actions={
        <>
          <PillButton
            tone="default"
            disabled={loading}
            onClick={handleClose}
            title="Volver a la selección"
          >
            Volver
          </PillButton>

          <PillButton
            tone="orange"
            themeColor={accentColor}
            disabled={!canSubmit}
            onClick={handleConfirm}
            title="Enviar solicitud de cancelación"
          >
            {loading ? "⏳ Enviando..." : "Enviar solicitud"}
          </PillButton>
        </>
      }
    >
      <div style={{ display: "grid", gap: 16 }}>
        {isFull ? (
          <div
            style={{
              border: "1px solid rgba(47,42,61,0.10)",
              borderRadius: 16,
              background: "#FFFFFF",
              padding: "13px 14px",
              color: "#2F2A3D",
              fontSize: 13,
              lineHeight: 1.55,
              boxShadow: "0 8px 20px rgba(47,42,61,0.04)",
            }}
          >
            <strong style={{ display: "block", marginBottom: 4 }}>
              Cancelación total
            </strong>

            <span style={{ color: "#6E6A7A" }}>
              Se solicitará la cancelación de todos los productos vigentes.
            </span>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 900,
                color: "#6E6A7A",
              }}
            >
              Productos seleccionados
            </div>

            <div
              style={{
                border: "1px solid rgba(47,42,61,0.10)",
                borderRadius: 16,
                background: "#FFFFFF",
                overflow: "hidden",
                boxShadow: "0 8px 20px rgba(47,42,61,0.04)",
              }}
            >
              {items.map((item, index) => {
                const quantity = getSelectedQuantity(item);
                const orderItemId = Number(item?.order_item_id || item?.id || 0);

                return (
                  <div
                    key={orderItemId > 0 ? orderItemId : `public-cancellation-item-${index}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      padding: "11px 13px",
                      borderTop: index > 0 ? "1px solid rgba(47,42,61,0.07)" : "none",
                    }}
                  >
                    <span
                      style={{
                        minWidth: 0,
                        color: "#2F2A3D",
                        fontSize: 13,
                        fontWeight: 850,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {getItemLabel(item)}
                    </span>

                    <span
                      style={{
                        flexShrink: 0,
                        color: "#6E6A7A",
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      {getQuantityLabel(quantity)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ display: "grid", gap: 7 }}>
          <label
            htmlFor="public-cancellation-reason"
            style={{ fontSize: 13, fontWeight: 900, color: "#2F2A3D" }}
          >
            Motivo
          </label>

          <select
            id="public-cancellation-reason"
            value={reasonCode}
            onChange={(event) => {
              setReasonCode(event.target.value);
              setLocalError("");
            }}
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
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <label
              htmlFor="public-cancellation-note"
              style={{ fontSize: 13, fontWeight: 900, color: "#2F2A3D" }}
            >
              Nota
            </label>

            <span style={{ fontSize: 11, fontWeight: 750, color: "#6E6A7A" }}>
              {reasonNote.length}/500
            </span>
          </div>

          <textarea
            id="public-cancellation-note"
            value={reasonNote}
            onChange={(event) => setReasonNote(event.target.value.slice(0, 500))}
            disabled={loading}
            placeholder="Puedes agregar una observación"
            rows={3}
            maxLength={500}
            style={{
              ...fieldStyle,
              resize: "vertical",
              minHeight: 82,
            }}
          />
        </div>

        {localError || error ? (
          <div
            role="alert"
            style={{
              border: "1px solid rgba(239,68,68,0.24)",
              borderRadius: 14,
              background: "rgba(239,68,68,0.06)",
              color: "#B91C1C",
              padding: "10px 12px",
              fontSize: 12,
              fontWeight: 850,
              lineHeight: 1.45,
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