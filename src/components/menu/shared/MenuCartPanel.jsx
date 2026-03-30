import React, { useMemo } from "react";
import {
  formatComponentDetailLabel,
  money,
  safeNum,
} from "../../../hooks/public/publicMenu.utils";
import { Badge, PillButton } from "../../../pages/public/publicMenu.ui";

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

function ModifierGroupsBlock({ groups = [], indent = 0 }) {
  if (!Array.isArray(groups) || groups.length <= 0) return null;

  return (
    <div
      style={{
        marginTop: 8,
        marginLeft: indent,
        padding: "8px 10px",
        borderRadius: 12,
        background: "#fafafa",
        border: "1px solid rgba(0,0,0,0.08)",
        display: "grid",
        gap: 8,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.85 }}>
        Extras
      </div>

      {groups.map((group, idx) => (
        <div key={`${group?.group_name || "g"}-${idx}`} style={{ display: "grid", gap: 4 }}>
          <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.82 }}>
            {group?.group_name || "Grupo"}
            {Number(group?.group_total || 0) > 0 ? ` · ${money(group.group_total)}` : ""}
          </div>

          {(Array.isArray(group?.options) ? group.options : []).map((opt, optIdx) => {
            const qty = Number(opt?.quantity || 1);
            const unitPrice = Number(opt?.unit_price || 0);
            const totalPrice = Number(opt?.total_price || 0);

            return (
              <div
                key={`${opt?.modifier_option_id || opt?.id || optIdx}-${optIdx}`}
                style={{ fontSize: 12, opacity: 0.78 }}
              >
                • {opt?.name || "Extra"}
                {qty > 1 ? ` x${qty}` : ""}
                {unitPrice > 0 ? ` · ${money(unitPrice)}` : ""}
                {totalPrice > 0 && qty > 1 ? ` · ${money(totalPrice)}` : ""}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function CompositeDetailBlock({ details = [] }) {
  if (!Array.isArray(details) || !details.length) return null;

  return (
    <div
      style={{
        marginTop: 6,
        padding: "8px 10px",
        borderRadius: 12,
        background: "#fafafa",
        border: "1px solid rgba(0,0,0,0.08)",
        display: "grid",
        gap: 8,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.85 }}>
        Componentes
      </div>

      {details.map((d, idx) => (
        <div
          key={`${d?.component_product_id || idx}-${idx}`}
          style={{ fontSize: 12, opacity: 0.82, display: "grid", gap: 4 }}
        >
          <div>
            • {formatComponentDetailLabel(d)} · Cantidad:{" "}
            <strong>{safeNum(d?.quantity, 1)}</strong>
            {d?.is_optional ? " · Opcional" : ""}
            {d?.apply_variant_price ? " · Ajusta precio" : ""}
          </div>

          <ModifierGroupsBlock groups={d?.modifier_groups_display || []} indent={14} />
        </div>
      ))}
    </div>
  );
}

function buildOldItemsTree(items = []) {
  const arr = Array.isArray(items) ? items : [];

  const parents = arr.filter((it) => !it?.parent_order_item_id);
  const childrenByParent = new Map();

  arr.forEach((it) => {
    const pid = it?.parent_order_item_id;
    if (!pid) return;

    if (!childrenByParent.has(pid)) {
      childrenByParent.set(pid, []);
    }

    childrenByParent.get(pid).push(it);
  });

  return parents.map((parent) => ({
    ...parent,
    children: childrenByParent.get(parent.id) || [],
  }));
}

function OldChildRow({ item }) {
  const label = item?.variant_name
    ? `${item.product_name} · ${item.variant_name}`
    : item.product_name || `Producto #${item.product_id}`;

  const subtotal = safeNum(
    item?.line_total,
    safeNum(item?.unit_price, 0) * safeNum(item?.quantity, 1),
  );

  const hideMoney =
    safeNum(item?.unit_price, 0) <= 0 && safeNum(subtotal, 0) <= 0;

  return (
    <tr>
      <td
        style={{
          padding: "8px 8px 8px 26px",
          borderTop: "1px dashed rgba(0,0,0,0.07)",
          background: "rgba(0,0,0,0.02)",
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 12, opacity: 0.88 }}>
          ↳ {label}
        </div>

        <ModifierGroupsBlock groups={item?.modifier_groups_display || []} indent={14} />

        {item?.notes ? (
          <div
            style={{
              fontSize: 11,
              opacity: 0.7,
              marginTop: 4,
              whiteSpace: "pre-line",
            }}
          >
            • {renderNotes(item.notes)}
          </div>
        ) : null}
      </td>

      <td
        style={{
          padding: "8px 8px",
          borderTop: "1px dashed rgba(0,0,0,0.07)",
          background: "rgba(0,0,0,0.02)",
          textAlign: "right",
          fontWeight: 800,
          fontSize: 12,
          opacity: hideMoney ? 0.45 : 0.85,
        }}
      >
        {hideMoney ? "Incluido" : money(item?.unit_price)}
      </td>

      <td
        style={{
          padding: "8px 8px",
          borderTop: "1px dashed rgba(0,0,0,0.07)",
          background: "rgba(0,0,0,0.02)",
          textAlign: "center",
          fontWeight: 800,
          fontSize: 12,
        }}
      >
        {item?.quantity}
      </td>

      <td
        style={{
          padding: "8px 8px",
          borderTop: "1px dashed rgba(0,0,0,0.07)",
          background: "rgba(0,0,0,0.02)",
          textAlign: "right",
          fontWeight: 900,
          fontSize: 12,
          opacity: hideMoney ? 0.45 : 0.9,
        }}
      >
        {hideMoney ? "Incluido" : money(subtotal)}
      </td>
    </tr>
  );
}

function OldRow({ item }) {
  const label = item?.variant_name
    ? `${item.product_name} · ${item.variant_name}`
    : item.product_name || `Producto #${item.product_id}`;

  const subtotal = safeNum(
    item?.line_total,
    safeNum(item?.unit_price, 0) * safeNum(item?.quantity, 1),
  );

  const isCompositeParent =
    !!item?.is_composite_parent ||
    (Array.isArray(item?.children) && item.children.length > 0);

  return (
    <tr>
      <td
        style={{
          padding: "10px 8px",
          borderTop: "1px solid rgba(0,0,0,0.08)",
          background: isCompositeParent
            ? "rgba(249, 168, 37, 0.08)"
            : "transparent",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 13 }}>{label}</div>

          {isCompositeParent ? (
            <span
              style={{
                fontSize: 10,
                fontWeight: 900,
                padding: "4px 8px",
                borderRadius: 999,
                background: "rgba(249, 168, 37, 0.16)",
                border: "1px solid rgba(249, 168, 37, 0.35)",
                color: "#9a6700",
              }}
            >
              Combo
            </span>
          ) : null}
        </div>

        <ModifierGroupsBlock groups={item?.modifier_groups_display || []} />
        <CompositeDetailBlock details={item?.components_detail || []} />

        {item?.notes ? (
          <div
            style={{
              fontSize: 12,
              opacity: 0.75,
              marginTop: 6,
              whiteSpace: "pre-line",
            }}
          >
            • {renderNotes(item.notes)}
          </div>
        ) : null}
      </td>

      <td
        style={{
          padding: "10px 8px",
          borderTop: "1px solid rgba(0,0,0,0.08)",
          textAlign: "right",
          fontWeight: 900,
          background: isCompositeParent
            ? "rgba(249, 168, 37, 0.08)"
            : "transparent",
        }}
      >
        {money(item?.unit_price)}
      </td>

      <td
        style={{
          padding: "10px 8px",
          borderTop: "1px solid rgba(0,0,0,0.08)",
          textAlign: "center",
          fontWeight: 900,
          background: isCompositeParent
            ? "rgba(249, 168, 37, 0.08)"
            : "transparent",
        }}
      >
        {item?.quantity}
      </td>

      <td
        style={{
          padding: "10px 8px",
          borderTop: "1px solid rgba(0,0,0,0.08)",
          textAlign: "right",
          fontWeight: 950,
          background: isCompositeParent
            ? "rgba(249, 168, 37, 0.08)"
            : "transparent",
        }}
      >
        {money(subtotal)}
      </td>
    </tr>
  );
}

function NewRow({
  item,
  onQtyChange,
  onNotesChange,
  onRemove,
}) {
  const subtotal = safeNum(item?.unit_price, 0) * safeNum(item?.quantity, 1);
  const label = item?.variant_name
    ? `${item.name} · ${item.variant_name}`
    : item.name;

  return (
    <tr key={item.key}>
      <td
        style={{
          padding: "10px 8px",
          borderTop: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 13 }}>{label}</div>

        <ModifierGroupsBlock groups={item?.modifier_groups_display || []} />
        <CompositeDetailBlock details={item?.components_detail || []} />
      </td>

      <td
        style={{
          padding: "10px 8px",
          borderTop: "1px solid rgba(0,0,0,0.08)",
          textAlign: "right",
          fontWeight: 900,
        }}
      >
        {money(item?.unit_price)}
      </td>

      <td
        style={{
          padding: "10px 8px",
          borderTop: "1px solid rgba(0,0,0,0.08)",
          textAlign: "center",
        }}
      >
        <div style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() =>
              onQtyChange?.(
                item.key,
                Math.max(1, safeNum(item.quantity, 1) - 1),
              )
            }
            style={{
              cursor: "pointer",
              border: "1px solid rgba(0,0,0,0.12)",
              background: "#fff",
              borderRadius: 10,
              padding: "6px 10px",
              fontWeight: 950,
            }}
            title="Menos"
          >
            −
          </button>

          <input
            value={item.quantity}
            onChange={(e) => onQtyChange?.(item.key, e.target.value)}
            style={{
              width: 54,
              padding: "6px 8px",
              borderRadius: 10,
              border: "1px solid rgba(0,0,0,0.12)",
              outline: "none",
              textAlign: "center",
              fontWeight: 900,
            }}
          />

          <button
            onClick={() =>
              onQtyChange?.(
                item.key,
                Math.min(99, safeNum(item.quantity, 1) + 1),
              )
            }
            style={{
              cursor: "pointer",
              border: "1px solid rgba(0,0,0,0.12)",
              background: "#fff",
              borderRadius: 10,
              padding: "6px 10px",
              fontWeight: 950,
            }}
            title="Más"
          >
            +
          </button>
        </div>
      </td>

      <td
        style={{
          padding: "10px 8px",
          borderTop: "1px solid rgba(0,0,0,0.08)",
          textAlign: "right",
          fontWeight: 950,
        }}
      >
        {money(subtotal)}
      </td>

      <td
        style={{
          padding: "10px 8px",
          borderTop: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <input
          value={item.notes || ""}
          onChange={(e) => onNotesChange?.(item.key, e.target.value)}
          placeholder="Ej: sin cebolla"
          maxLength={500}
          style={{
            width: "min(420px, 70vw)",
            padding: "8px 10px",
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.12)",
            outline: "none",
            fontWeight: 750,
          }}
        />
      </td>

      <td
        style={{
          padding: "10px 8px",
          borderTop: "1px solid rgba(0,0,0,0.08)",
          textAlign: "right",
        }}
      >
        <button
          onClick={() => onRemove?.(item.key)}
          style={{
            cursor: "pointer",
            border: "1px solid rgba(0,0,0,0.12)",
            background: "#fff",
            borderRadius: 12,
            padding: "8px 10px",
            fontWeight: 950,
          }}
          title="Quitar"
        >
          🗑️
        </button>
      </td>
    </tr>
  );
}

export default function MenuCartPanel({
  title = "Comanda",
  subtitle = "",
  customerName = "",
  total = 0,
  oldItems = [],
  newItems = [],
  sendToast = "",
  sending = false,
  canAppend = false,
  canSubmit = false,
  showPaymentMessage = false,

  statusBadges = [],
  extraTopActions = null,

  onEmpty,
  onSubmit,
  onQtyChange,
  onNotesChange,
  onRemove,

  requestBillBlock = null,
}) {
  const hasOld = Array.isArray(oldItems) && oldItems.length > 0;
  const hasNew = Array.isArray(newItems) && newItems.length > 0;
  const oldItemsTree = useMemo(() => buildOldItemsTree(oldItems), [oldItems]);

  if (!hasOld && !hasNew) return null;

  return (
    <div
      style={{
        border: "1px solid rgba(0,0,0,0.12)",
        borderRadius: 18,
        background: "#fff",
        padding: 14,
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        width: 380,
        maxWidth: "92vw",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontWeight: 950 }}>{title}</div>
          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>
            {subtitle}
          </div>

          {customerName ? (
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
              A nombre de: <strong>{customerName}</strong>
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Badge tone="default">
            Total: <strong style={{ marginLeft: 6 }}>{money(total)}</strong>
          </Badge>

          <PillButton
            tone="danger"
            onClick={onEmpty}
            title="Vaciar items nuevos"
            disabled={sending || !hasNew}
          >
            🗑️ Vaciar
          </PillButton>

          <PillButton
            tone="orange"
            onClick={onSubmit}
            disabled={!canSubmit || sending}
            title={
              canAppend
                ? "Agregar productos a la orden abierta"
                : "Enviar comanda"
            }
          >
            {sending ? "⏳ Enviando..." : canAppend ? "➕ Agregar" : "📤 Enviar"}
          </PillButton>

          {extraTopActions}
        </div>
      </div>

      {showPaymentMessage ? (
        <div
          style={{
            marginTop: 12,
            border: "1px solid #facc15",
            background: "#fef3c7",
            color: "#92400e",
            borderRadius: 12,
            padding: 10,
            fontSize: 13,
            fontWeight: 800,
          }}
        >
          💳 Cuenta en proceso de pago. Un mesero está procesando tu cuenta.
        </div>
      ) : null}

      {statusBadges?.length ? (
        <div
          style={{
            marginTop: 10,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {statusBadges.map((b, idx) => (
            <Badge
              key={`${b?.label || idx}-${idx}`}
              tone={b?.tone || "default"}
              title={b?.title}
            >
              {b?.label}
            </Badge>
          ))}
        </div>
      ) : null}

      {requestBillBlock ? (
        <div style={{ marginTop: 12 }}>{requestBillBlock}</div>
      ) : null}

      {hasOld ? (
        <div style={{ marginTop: 12, overflowX: "auto" }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 950,
              opacity: 0.85,
              marginBottom: 8,
            }}
          >
            Items ya enviados
          </div>

          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: 0,
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: "left",
                    padding: "10px 8px",
                    fontSize: 12,
                    opacity: 0.8,
                  }}
                >
                  Producto
                </th>
                <th
                  style={{
                    textAlign: "right",
                    padding: "10px 8px",
                    fontSize: 12,
                    opacity: 0.8,
                  }}
                >
                  Precio
                </th>
                <th
                  style={{
                    textAlign: "center",
                    padding: "10px 8px",
                    fontSize: 12,
                    opacity: 0.8,
                  }}
                >
                  Cant
                </th>
                <th
                  style={{
                    textAlign: "right",
                    padding: "10px 8px",
                    fontSize: 12,
                    opacity: 0.8,
                  }}
                >
                  Subtotal
                </th>
              </tr>
            </thead>

            <tbody>
              {oldItemsTree.map((it) => (
                <React.Fragment key={`old-${it?.id}`}>
                  <OldRow item={it} />
                  {Array.isArray(it?.children) && it.children.length > 0
                    ? it.children.map((child) => (
                        <OldChildRow
                          key={`old-child-${child?.id}`}
                          item={child}
                        />
                      ))
                    : null}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ marginTop: 12, fontSize: 13, opacity: 0.75 }}>
          No hay historial cargado.
        </div>
      )}

      {hasNew ? (
        <div style={{ marginTop: 12, overflowX: "auto" }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 950,
              opacity: 0.85,
              marginBottom: 8,
            }}
          >
            Items nuevos por {canAppend ? "agregar" : "enviar"}
          </div>

          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: 0,
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: "left",
                    padding: "10px 8px",
                    fontSize: 12,
                    opacity: 0.8,
                  }}
                >
                  Producto
                </th>
                <th
                  style={{
                    textAlign: "right",
                    padding: "10px 8px",
                    fontSize: 12,
                    opacity: 0.8,
                  }}
                >
                  Precio
                </th>
                <th
                  style={{
                    textAlign: "center",
                    padding: "10px 8px",
                    fontSize: 12,
                    opacity: 0.8,
                  }}
                >
                  Cantidad
                </th>
                <th
                  style={{
                    textAlign: "right",
                    padding: "10px 8px",
                    fontSize: 12,
                    opacity: 0.8,
                  }}
                >
                  Subtotal
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "10px 8px",
                    fontSize: 12,
                    opacity: 0.8,
                  }}
                >
                  Notas
                </th>
                <th
                  style={{
                    textAlign: "right",
                    padding: "10px 8px",
                    fontSize: 12,
                    opacity: 0.8,
                  }}
                >
                  {" "}
                </th>
              </tr>
            </thead>

            <tbody>
              {newItems.map((it) => (
                <NewRow
                  key={it.key}
                  item={it}
                  onQtyChange={onQtyChange}
                  onNotesChange={onNotesChange}
                  onRemove={onRemove}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {sendToast ? (
        <div
          style={{
            marginTop: 10,
            border: "1px solid rgba(0,0,0,0.10)",
            borderRadius: 14,
            padding: 10,
            background: "#fff",
            fontSize: 13,
            fontWeight: 850,
            whiteSpace: "pre-line",
          }}
        >
          {sendToast}
        </div>
      ) : null}
    </div>
  );
}