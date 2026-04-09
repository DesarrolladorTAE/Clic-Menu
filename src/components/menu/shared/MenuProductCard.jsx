import React, { useState } from "react";
import {
  Collapse,
  PillButton,
  ProductThumb,
} from "../../../pages/public/publicMenu.ui";
import {
  formatAvailabilityCaption,
  formatAvailabilityShortLabel,
  getAvailabilityData,
  getAvailabilityTone,
  hasAnyModifierGroups,
  isAvailabilityBlocked,
  money,
} from "../../../hooks/public/publicMenu.utils";

function AvailabilityPill({ availability }) {
  const a = getAvailabilityData(availability);
  if (!a) return null;

  const tone = getAvailabilityTone(a?.status);

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
      title={formatAvailabilityCaption(a)}
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
    >
      {formatAvailabilityShortLabel(a)}
    </div>
  );
}

function AvailabilityNotice({ availability }) {
  const a = getAvailabilityData(availability);
  if (!a) return null;

  const caption = formatAvailabilityCaption(a);
  if (!caption) return null;

  const blocked = isAvailabilityBlocked(a);

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
      {caption}
    </div>
  );
}

export default function MenuProductCard({
  product,
  categoryName = "Sin categoría",
  canSelect = true,
  showSelectBtn = true,
  onAddSimple,
  onAddVariant,
  onOpenComposite,
  onOpenExtras,
}) {
  const [variantsOpen, setVariantsOpen] = useState(false);

  const title = product?.display_name || product?.name || "Producto";
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const hasVariants = variants.length > 0;

  const isComposite = String(product?.product_type || "simple") === "composite";
  const compositeItems = Array.isArray(product?.composite?.items)
    ? product.composite.items
    : [];
  const hasComposite = isComposite && compositeItems.length > 0;
  const hasExtras = hasAnyModifierGroups(product);

  const productAvailability = getAvailabilityData(product?.availability);
  const productBlocked = canSelect && isAvailabilityBlocked(productAvailability);

  return (
    <div
      style={{
        border: "1px solid rgba(0,0,0,0.10)",
        borderRadius: 18,
        background: "#fff",
        overflow: "hidden",
        boxShadow: "0 10px 26px rgba(0,0,0,0.05)",
        display: "grid",
      }}
    >
      <div style={{ padding: 10 }}>
        <ProductThumb imageUrl={product?.image_url || null} title={title} />
      </div>

      <div style={{ padding: "0 12px 12px 12px", display: "grid", gap: 8 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            alignItems: "start",
          }}
        >
          <div style={{ fontWeight: 950, fontSize: 14, lineHeight: 1.15 }}>
            {title}
          </div>
          <div style={{ fontWeight: 950, fontSize: 14, whiteSpace: "nowrap" }}>
            {money(product?.price)}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.72 }}>
            Categoría: <strong>{categoryName}</strong>
          </div>

          <AvailabilityPill availability={productAvailability} />
        </div>

        {isComposite ? (
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            Tipo: <strong>Compuesto</strong>
          </div>
        ) : null}

        <AvailabilityNotice availability={productAvailability} />

        {hasComposite ? (
          <div
            style={{
              fontSize: 12,
              opacity: 0.78,
              padding: "8px 10px",
              borderRadius: 12,
              background: "#fafafa",
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            Incluye <strong>{compositeItems.length}</strong> componente(s).
          </div>
        ) : null}

        {hasExtras ? (
          <div
            style={{
              fontSize: 12,
              opacity: 0.8,
              padding: "8px 10px",
              borderRadius: 12,
              background: "#fff7ed",
              border: "1px solid rgba(255,122,0,0.18)",
              color: "#9a4a00",
            }}
          >
            Extras disponibles según contexto.
          </div>
        ) : null}

        <div style={{ display: "grid", gap: 8 }}>
          {showSelectBtn ? (
            <PillButton
              tone={productBlocked ? "danger" : "default"}
              onClick={() => {
                if (productBlocked || !canSelect) return;

                if (isComposite && hasComposite) {
                  onOpenComposite?.(product);
                  return;
                }

                onAddSimple?.(product);
              }}
              title={
                !canSelect
                  ? "Solo lectura"
                  : productBlocked
                  ? formatAvailabilityCaption(productAvailability) || "No disponible"
                  : isComposite
                  ? "Configurar producto compuesto"
                  : "Agregar a comanda"
              }
              disabled={!canSelect || productBlocked}
            >
              {productBlocked
                ? "🚫 No disponible"
                : isComposite
                ? "⚙️ Configurar"
                : "➕ Seleccionar"}
            </PillButton>
          ) : null}

          {hasExtras ? (
            <PillButton
              tone="soft"
              onClick={() => onOpenExtras?.(product)}
              title="Ver extras disponibles de este producto"
            >
              ✨ Extras
            </PillButton>
          ) : null}
        </div>

        {!isComposite && hasVariants ? (
          <div style={{ marginTop: 2 }}>
            <button
              onClick={() => setVariantsOpen((v) => !v)}
              style={{
                cursor: "pointer",
                width: "100%",
                borderRadius: 14,
                border: "1px solid rgba(0,0,0,0.12)",
                background: "#fafafa",
                padding: "10px 12px",
                fontWeight: 950,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
              title="Ver variantes"
            >
              <span>Variantes ({variants.length})</span>
              <span style={{ opacity: 0.75 }}>{variantsOpen ? "▲" : "▼"}</span>
            </button>

            <Collapse open={variantsOpen}>
              <div style={{ display: "grid", gap: 8 }}>
                {variants.map((v, idx) => {
                  const vid = v.id || idx;
                  const variantHasExtras =
                    Array.isArray(v?.modifier_groups) &&
                    v.modifier_groups.length > 0;

                  const variantAvailability = getAvailabilityData(v?.availability);
                  const variantBlocked = canSelect && isAvailabilityBlocked(variantAvailability);

                  return (
                    <div
                      key={vid}
                      style={{
                        display: "grid",
                        gap: 8,
                        padding: "10px 12px",
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
                          <div style={{ fontWeight: 850, fontSize: 13 }}>
                            {v.name || v.display_name || `Variante ${idx + 1}`}
                          </div>

                          <div
                            style={{
                              marginTop: 6,
                              display: "flex",
                              gap: 8,
                              flexWrap: "wrap",
                              alignItems: "center",
                            }}
                          >
                            <AvailabilityPill availability={variantAvailability} />
                          </div>
                        </div>

                        <div
                          style={{
                            fontWeight: 950,
                            fontSize: 13,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {money(v.price)}
                        </div>
                      </div>

                      <AvailabilityNotice availability={variantAvailability} />

                      {variantHasExtras ? (
                        <div style={{ fontSize: 12, opacity: 0.75, color: "#9a4a00" }}>
                          Esta variante tiene extras disponibles.
                        </div>
                      ) : null}

                      {showSelectBtn ? (
                        <PillButton
                          tone={variantBlocked ? "danger" : "default"}
                          onClick={() => {
                            if (!canSelect || variantBlocked) return;
                            onAddVariant?.(product, v);
                          }}
                          title={
                            !canSelect
                              ? "Solo lectura"
                              : variantBlocked
                              ? formatAvailabilityCaption(variantAvailability) || "No disponible"
                              : "Agregar variante a comanda"
                          }
                          disabled={!canSelect || variantBlocked}
                        >
                          {variantBlocked ? "🚫 No disponible" : "➕ Seleccionar variante"}
                        </PillButton>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </Collapse>
          </div>
        ) : null}
      </div>
    </div>
  );
}
