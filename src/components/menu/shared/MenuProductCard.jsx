import React, { useState } from "react";
import {
  Collapse,
  PillButton,
  ProductThumb,
} from "../../../pages/public/publicMenu.ui";
import { money } from "../../../hooks/public/publicMenu.utils";

export default function MenuProductCard({
  product,
  categoryName = "Sin categoría",
  canSelect = true,
  showSelectBtn = true,
  onAddSimple,
  onAddVariant,
  onOpenComposite,
}) {
  const [variantsOpen, setVariantsOpen] = useState(false);

  const pid = Number(product?.id || 0);
  const title = product?.display_name || product?.name || "Producto";
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const hasVariants = variants.length > 0;

  const isComposite = String(product?.product_type || "simple") === "composite";
  const compositeItems = Array.isArray(product?.composite?.items)
    ? product.composite.items
    : [];
  const hasComposite = isComposite && compositeItems.length > 0;

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
          <div style={{ fontWeight: 950, fontSize: 14, lineHeight: 1.15 }}>{title}</div>
          <div style={{ fontWeight: 950, fontSize: 14, whiteSpace: "nowrap" }}>
            {money(product?.price)}
          </div>
        </div>

        <div style={{ fontSize: 12, opacity: 0.72 }}>
          Categoría: <strong>{categoryName}</strong>
        </div>

        {isComposite ? (
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            Tipo: <strong>Compuesto</strong>
          </div>
        ) : null}

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

        {showSelectBtn ? (
          <PillButton
            tone="default"
            onClick={() => {
              if (isComposite && hasComposite) {
                onOpenComposite?.(product);
                return;
              }
              onAddSimple?.(product);
            }}
            title={
              !canSelect
                ? "Solo lectura"
                : isComposite
                ? "Configurar producto compuesto"
                : "Agregar a comanda"
            }
            disabled={!canSelect}
          >
            {isComposite ? "⚙️ Configurar" : "➕ Seleccionar"}
          </PillButton>
        ) : null}

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
                        }}
                      >
                        <div style={{ fontWeight: 850, fontSize: 13, minWidth: 0 }}>
                          {v.name || v.display_name || `Variante ${idx + 1}`}
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

                      {showSelectBtn ? (
                        <PillButton
                          tone="default"
                          onClick={() => onAddVariant?.(product, v)}
                          title={!canSelect ? "Solo lectura" : "Agregar variante a comanda"}
                          disabled={!canSelect}
                        >
                          ➕ Seleccionar variante
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