//Modal de productos compuestos 

import React from "react";
import {
  Modal,
  PillButton,
} from "../../../pages/public/publicMenu.ui";

export default function CompositeProductModal({
  open,
  product,
  draft = [],
  onClose,
  onToggleIncluded,
  onVariantChange,
  onConfirm,
  confirmLabel = "Agregar compuesto",
  busy = false,
}) {
  if (!product) return null;

  const title = product?.display_name || product?.name || "Producto compuesto";

  return (
    <Modal
      open={open}
      title={`Configurar: ${title}`}
      onClose={onClose}
      actions={
        <>
          <PillButton tone="default" onClick={onClose} disabled={busy} title="Cancelar">
            Cancelar
          </PillButton>

          <PillButton
            tone="orange"
            onClick={onConfirm}
            disabled={busy}
            title="Guardar selección"
          >
            {busy ? "⏳ Guardando..." : confirmLabel}
          </PillButton>
        </>
      }
    >
      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ fontSize: 13, opacity: 0.8 }}>
          Configura los componentes del producto. Aquí sí va lo opcional, variantes,
          avisos de precio y demás civilización mínima.
        </div>

        {(draft || []).map((c) => {
          const cid = Number(c.component_product_id);
          const variants = Array.isArray(c.variants) ? c.variants : [];
          const canPickVariant = !!c.allow_variant && variants.length > 0;

          return (
            <div
              key={cid}
              style={{
                display: "grid",
                gap: 8,
                padding: "12px",
                borderRadius: 14,
                border: "1px solid rgba(0,0,0,0.10)",
                background: "#fff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  alignItems: "start",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 900, fontSize: 14 }}>{c.name}</div>

                  <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>
                    Cantidad: <strong>{Number.isFinite(Number(c.quantity)) ? Number(c.quantity) : 1}</strong>
                    {c.is_optional ? (
                      <>
                        {" "}· <strong>Opcional</strong>
                      </>
                    ) : (
                      <>
                        {" "}· <strong>Requerido</strong>
                      </>
                    )}
                  </div>

                  {c.notes ? (
                    <div
                      style={{
                        fontSize: 12,
                        opacity: 0.75,
                        marginTop: 2,
                        whiteSpace: "pre-line",
                      }}
                    >
                      {String(c.notes)}
                    </div>
                  ) : null}
                </div>

                {c.is_optional ? (
                  <label
                    style={{
                      display: "inline-flex",
                      gap: 8,
                      alignItems: "center",
                      fontSize: 12,
                      fontWeight: 900,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={c.included !== false}
                      onChange={(e) => onToggleIncluded?.(cid, e.target.checked)}
                      style={{ transform: "scale(1.1)" }}
                    />
                    Incluir
                  </label>
                ) : null}
              </div>

              {canPickVariant ? (
                <div style={{ display: "grid", gap: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.85 }}>
                    Variante del componente
                  </div>

                  <select
                    value={c.variant_id ? String(c.variant_id) : ""}
                    onChange={(e) =>
                      onVariantChange?.(cid, e.target.value ? Number(e.target.value) : null)
                    }
                    disabled={c.included === false}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "1px solid rgba(0,0,0,0.12)",
                      outline: "none",
                      fontWeight: 850,
                      background: "#fff",
                      opacity: c.included === false ? 0.65 : 1,
                    }}
                  >
                    <option value="">(Sin variante)</option>
                    {variants.map((v) => (
                      <option key={v.id} value={String(v.id)}>
                        {v.name}
                        {Number(v.price_adjustment_preview || 0) > 0
                          ? ` (+$${Number(v.price_adjustment_preview).toFixed(2)})`
                          : ""}
                      </option>
                    ))}
                  </select>

                  <div style={{ fontSize: 12, opacity: 0.72 }}>
                    {c.apply_variant_price
                      ? "La variante puede modificar el precio del compuesto."
                      : "La variante es solo elección visual, sin ajuste de precio."}
                  </div>
                </div>
              ) : c.allow_variant ? (
                <div style={{ fontSize: 12, opacity: 0.72 }}>
                  Este componente permite variante, pero no hay variantes disponibles en este canal.
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}