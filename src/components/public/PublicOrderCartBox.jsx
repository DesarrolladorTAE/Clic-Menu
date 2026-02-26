// src/components/public/PublicOrderCartBox.jsx
import React, { useMemo } from "react";
import { money, safeNum } from "../../hooks/public/publicMenu.utils";
import { Badge, PillButton } from "../../pages/public/publicMenu.ui";

function normalizeTitle(it) {
  const base =
    it?.product_name ||
    it?.name ||
    it?.display_name ||
    (it?.product_id ? `Producto #${it.product_id}` : "Producto");
  const v = it?.variant_name || (it?.variant_id ? `Variante #${it.variant_id}` : "");
  return v ? `${base} · ${v}` : base;
}

function renderNotes(n) {
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

function OrderItemRow({ item, tone = "new" }) {
  const title = normalizeTitle(item);
  const qty = safeNum(item?.quantity, 1);
  const unit = safeNum(item?.unit_price, safeNum(item?.price, 0));
  const line =
    typeof item?.line_total === "number"
      ? item.line_total
      : Math.round(unit * qty * 100) / 100;

  const notes = renderNotes(item?.notes);

  const styles =
    tone === "old"
      ? {
          bg: "rgba(255,255,255,0.06)",
          bd: "rgba(255,255,255,0.12)",
          fg: "rgba(255,255,255,0.92)",
        }
      : {
          bg: "rgba(99,102,241,0.14)",
          bd: "rgba(99,102,241,0.25)",
          fg: "rgba(255,255,255,0.92)",
        };

  return (
    <div
      style={{
        border: `1px solid ${styles.bd}`,
        background: styles.bg,
        color: styles.fg,
        borderRadius: 14,
        padding: 10,
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 10,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontWeight: 950,
            fontSize: 13,
            lineHeight: 1.2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={title}
        >
          {title}
        </div>

        <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, opacity: 0.85 }}>
            Cantidad: <b>{qty}</b>
          </span>
          <span style={{ fontSize: 12, opacity: 0.85 }}>
            Precio: <b>{money(unit)}</b>
          </span>
        </div>

        {notes ? (
          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              opacity: 0.85,
              whiteSpace: "pre-line",
              lineHeight: 1.25,
            }}
          >
            • {notes}
          </div>
        ) : null}
      </div>

      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 12, opacity: 0.75 }}>Importe</div>
        <div style={{ fontWeight: 950 }}>{money(line)}</div>
      </div>
    </div>
  );
}

export default function PublicOrderCartBox({
  orderName = "",
  oldItems = [],
  newItems = [],
  total = 0, // total global (old + new o lo que tú decidas)
  busy = false,

  canVaciar = true,
  canEnviar = true,

  onVaciar,
  onEnviar,
}) {
  const hasOld = Array.isArray(oldItems) && oldItems.length > 0;
  const hasNew = Array.isArray(newItems) && newItems.length > 0;

  const oldCount = hasOld ? oldItems.length : 0;
  const newCount = hasNew ? newItems.length : 0;

  const totalLabel = useMemo(() => money(total), [total]);

  return (
    <aside
      style={{
        width: 380,
        maxWidth: "92vw",
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(17,24,39,0.82)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
        color: "#fff",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ padding: 14, borderBottom: "1px solid rgba(255,255,255,0.10)" }}>
        <div style={{ fontSize: 12, opacity: 0.8 }}>Comanda:</div>
        <div style={{ fontSize: 14, fontWeight: 950, minHeight: 18 }}>
          {orderName ? orderName : ""}
        </div>

        <div
          style={{
            marginTop: 10,
            display: "grid",
            gridTemplateColumns: "1fr auto auto",
            gap: 8,
            alignItems: "center",
          }}
        >
          <div style={{ fontWeight: 950 }}>
            Total <span style={{ opacity: 0.6, fontWeight: 800 }}>|</span>{" "}
            <span style={{ fontWeight: 950 }}>{totalLabel}</span>
          </div>

          <PillButton
            tone="soft"
            disabled={busy || !canVaciar || !hasNew}
            onClick={onVaciar}
            title={!hasNew ? "No hay items nuevos" : "Vaciar items nuevos"}
          >
            Vaciar
          </PillButton>

          <PillButton
            tone="orange"
            disabled={busy || !canEnviar || !hasNew}
            onClick={onEnviar}
            title={!hasNew ? "Agrega productos para enviar" : "Enviar comanda / agregar productos"}
          >
            Enviar
          </PillButton>
        </div>

        <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {hasOld ? (
            <Badge tone="dark" title="Items ya registrados en la orden (solo lectura)">
              Viejos: <strong style={{ marginLeft: 6 }}>{oldCount}</strong>
            </Badge>
          ) : null}
          <Badge tone={hasNew ? "ok" : "warn"} title="Items nuevos por enviar">
            Nuevos: <strong style={{ marginLeft: 6 }}>{newCount}</strong>
          </Badge>
        </div>
      </div>

      {/* Scroll body */}
      <div
        style={{
          maxHeight: "calc(100vh - 240px)",
          overflowY: "auto",
          padding: 14,
        }}
      >
        {/* Panel viejo (oculto si no hay) */}
        {hasOld ? (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 950, opacity: 0.85, marginBottom: 8 }}>
              Items ya enviados
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              {oldItems.map((it) => (
                <OrderItemRow
                  key={`old-${it?.id ?? `${it?.product_id}-${it?.variant_id ?? 0}-${Math.random()}`}`}
                  item={it}
                  tone="old"
                />
              ))}
            </div>
          </div>
        ) : null}

        {/* Separador si hay old */}
        {hasOld ? (
          <div
            style={{
              height: 1,
              background: "rgba(255,255,255,0.12)",
              margin: "10px 0 12px",
            }}
          />
        ) : null}

        {/* Panel nuevo */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 950, opacity: 0.85, marginBottom: 8 }}>
            Items nuevos por agregar
          </div>

          {hasNew ? (
            <div style={{ display: "grid", gap: 8 }}>
              {newItems.map((it, idx) => (
                <OrderItemRow
                  key={`new-${it?.key ?? `${it?.product_id}-${it?.variant_id ?? 0}-${idx}`}`}
                  item={it}
                  tone="new"
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                border: "1px dashed rgba(255,255,255,0.18)",
                borderRadius: 14,
                padding: 14,
                fontSize: 13,
                opacity: 0.8,
              }}
            >
              Selecciona productos y se irán acumulando aquí.
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}