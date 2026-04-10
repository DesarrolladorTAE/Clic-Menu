import React from "react";
import {
  Modal,
  PillButton,
} from "../../../pages/public/publicMenu.ui";

function getAvailabilityTone(status = "") {
  const s = String(status || "").toLowerCase();

  if (s === "available") return "ok";
  if (s === "insufficient_stock") return "warn";
  if (
    s === "out_of_stock" ||
    s === "recipe_missing" ||
    s === "inventory_blocked"
  ) {
    return "danger";
  }

  return "default";
}

function getAvailabilityLabel(itemOrVariant) {
  const status = String(itemOrVariant?.availability?.status || "").toLowerCase();

  if (status === "available") return "Disponible";
  if (status === "out_of_stock") return "Agotado";
  if (status === "insufficient_stock") return "Stock insuficiente";
  if (status === "recipe_missing") return "Sin receta";
  if (status === "inventory_blocked") return "Bloqueado";

  const raw = String(itemOrVariant?.availability_label || "").trim();
  if (!raw) return "No disponible";

  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function getAvailabilityReason(itemOrVariant) {
  return String(itemOrVariant?.availability?.reason || "").trim();
}

function AvailabilityChip({ source }) {
  const availability = source?.availability || null;
  if (!availability) return null;

  const tone = getAvailabilityTone(availability?.status);

  const palette = {
    ok: {
      bg: "rgba(16, 185, 129, 0.12)",
      bd: "rgba(16, 185, 129, 0.25)",
      fg: "#047857",
    },
    warn: {
      bg: "rgba(245, 158, 11, 0.12)",
      bd: "rgba(245, 158, 11, 0.25)",
      fg: "#B45309",
    },
    danger: {
      bg: "rgba(239, 68, 68, 0.10)",
      bd: "rgba(239, 68, 68, 0.24)",
      fg: "#B91C1C",
    },
    default: {
      bg: "rgba(0,0,0,0.05)",
      bd: "rgba(0,0,0,0.10)",
      fg: "#374151",
    },
  };

  const ui = palette[tone] || palette.default;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        borderRadius: 999,
        border: `1px solid ${ui.bd}`,
        background: ui.bg,
        color: ui.fg,
        fontSize: 11,
        fontWeight: 900,
        lineHeight: 1.1,
        maxWidth: "100%",
      }}
      title={getAvailabilityReason(source) || getAvailabilityLabel(source)}
    >
      {getAvailabilityLabel(source)}
    </div>
  );
}

function AvailabilityNotice({ source }) {
  const reason = getAvailabilityReason(source);
  if (!reason) return null;

  const blocked = source?.is_available === false;

  return (
    <div
      style={{
        fontSize: 12,
        padding: "8px 10px",
        borderRadius: 12,
        border: blocked
          ? "1px solid rgba(239, 68, 68, 0.20)"
          : "1px solid rgba(16, 185, 129, 0.18)",
        background: blocked ? "#fff5f5" : "#f0fdf4",
        color: blocked ? "#B91C1C" : "#047857",
      }}
    >
      {reason}
    </div>
  );
}

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

  const hasBlockingRequiredUnavailable = (draft || []).some((c) => {
    if (c?.is_optional) return false;

    if (!c?.allow_variant) {
      return c?.is_available === false;
    }

    const variants = Array.isArray(c?.variants) ? c.variants : [];
    const hasAnyVariantAvailable = variants.some((v) => v?.is_available !== false);

    if (variants.length > 0) {
      return !hasAnyVariantAvailable;
    }

    return c?.is_available === false;
  });

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
            disabled={busy || hasBlockingRequiredUnavailable}
            title={
              hasBlockingRequiredUnavailable
                ? "Hay componentes requeridos sin disponibilidad"
                : "Guardar selección"
            }
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
          const included = c.included !== false;
          const selectedVariant = c.variant_id
            ? variants.find((v) => Number(v.id) === Number(c.variant_id))
            : null;

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
                opacity: !included ? 0.72 : 1,
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
                <div style={{ minWidth: 0, display: "grid", gap: 6 }}>
                  <div style={{ fontWeight: 900, fontSize: 14 }}>{c.name}</div>

                  <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>
                    Cantidad:{" "}
                    <strong>
                      {Number.isFinite(Number(c.quantity)) ? Number(c.quantity) : 1}
                    </strong>
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

                  {!canPickVariant ? <AvailabilityChip source={c} /> : null}

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
                      checked={included}
                      onChange={(e) => onToggleIncluded?.(cid, e.target.checked)}
                      style={{ transform: "scale(1.1)" }}
                    />
                    Incluir
                  </label>
                ) : null}
              </div>

              {!canPickVariant ? <AvailabilityNotice source={c} /> : null}

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
                    disabled={included === false}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "1px solid rgba(0,0,0,0.12)",
                      outline: "none",
                      fontWeight: 850,
                      background: "#fff",
                      opacity: included === false ? 0.65 : 1,
                    }}
                  >
                    {c.default_option ? (
                      <option
                        value=""
                        disabled={c.default_option?.is_available === false}
                      >
                        {c.name}
                        {c.default_option?.is_available === false ? " · Agotado" : ""}
                      </option>
                    ) : (
                      <option value="">(Sin variante)</option>
                    )}

                    {variants.map((v) => (
                      <option
                        key={v.id}
                        value={String(v.id)}
                        disabled={v?.is_available === false}
                      >
                        {v.name}
                        {Number(v.price_adjustment_preview || 0) > 0
                          ? ` (+$${Number(v.price_adjustment_preview).toFixed(2)})`
                          : ""}
                        {v?.is_available === false ? " · Agotado" : ""}
                      </option>
                    ))}
                  </select>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      alignItems: "center",
                    }}
                  >
                    {selectedVariant ? (
                      <AvailabilityChip source={selectedVariant} />
                    ) : c.default_option ? (
                      <AvailabilityChip source={c.default_option} />
                    ) : null}
                  </div>

                  {selectedVariant ? (
                    <AvailabilityNotice source={selectedVariant} />
                  ) : c.default_option ? (
                    <AvailabilityNotice source={c.default_option} />
                  ) : null}

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

        {hasBlockingRequiredUnavailable ? (
          <div
            style={{
              fontSize: 12,
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(239, 68, 68, 0.24)",
              background: "#fff5f5",
              color: "#B91C1C",
              fontWeight: 800,
            }}
          >
            Hay componentes requeridos sin disponibilidad. No puedes agregar este compuesto
            hasta elegir una opción disponible.
          </div>
        ) : null}
      </div>
    </Modal>
  );
}