import React from "react";
import { Badge } from "../../../../pages/public/publicMenu.ui";
import { money, safeNum } from "../../../../hooks/public/publicMenu.utils";
import { renderNotes } from "./cartPanel.utils";
import ModifierGroupsBlock from "./ModifierGroupsBlock";
import CompositeDetailBlock from "./CompositeDetailBlock";

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
      <td className="cm-td cm-child">
        <div style={{ fontWeight: 850, fontSize: 12, color: "#3F3A52" }}>
          ↳ {label}
        </div>

        <ModifierGroupsBlock
          groups={item?.modifier_groups_display || []}
          indent={12}
        />

        {item?.notes ? (
          <div className="cm-note">• {renderNotes(item.notes)}</div>
        ) : null}
      </td>

      <td className="cm-td cm-right cm-child">
        {hideMoney ? "Incluido" : money(item?.unit_price)}
      </td>

      <td className="cm-td cm-center cm-child">{item?.quantity}</td>

      <td className="cm-td cm-right cm-child cm-bold">
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
      <td className={`cm-td ${isCompositeParent ? "cm-combo" : ""}`}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontWeight: 950, fontSize: 13, color: "#3F3A52" }}>
            {label}
          </div>

          {isCompositeParent ? (
            <span className="cm-combo-badge">Combo</span>
          ) : null}
        </div>

        <ModifierGroupsBlock groups={item?.modifier_groups_display || []} />
        <CompositeDetailBlock details={item?.components_detail || []} />

        {item?.notes ? (
          <div className="cm-note">• {renderNotes(item.notes)}</div>
        ) : null}
      </td>

      <td className={`cm-td cm-right ${isCompositeParent ? "cm-combo" : ""}`}>
        {money(item?.unit_price)}
      </td>

      <td className={`cm-td cm-center ${isCompositeParent ? "cm-combo" : ""}`}>
        {item?.quantity}
      </td>

      <td
        className={`cm-td cm-right cm-bold ${
          isCompositeParent ? "cm-combo" : ""
        }`}
      >
        {money(subtotal)}
      </td>
    </tr>
  );
}

function OldItemCard({ item }) {
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
    <div className="cm-mobile-card">
      <div className="cm-mobile-card-head">
        <div>
          <div className="cm-mobile-title">{label}</div>
          <div className="cm-mobile-sub">
            Cantidad: <strong>{item?.quantity}</strong> · Precio:{" "}
            <strong>{money(item?.unit_price)}</strong>
          </div>
        </div>

        <div className="cm-mobile-price">{money(subtotal)}</div>
      </div>

      {isCompositeParent ? <span className="cm-combo-badge">Combo</span> : null}

      <ModifierGroupsBlock groups={item?.modifier_groups_display || []} />
      <CompositeDetailBlock details={item?.components_detail || []} />

      {item?.notes ? (
        <div className="cm-note">• {renderNotes(item.notes)}</div>
      ) : null}

      {Array.isArray(item?.children) && item.children.length > 0 ? (
        <div className="cm-children-list">
          {item.children.map((child) => {
            const childLabel = child?.variant_name
              ? `${child.product_name} · ${child.variant_name}`
              : child.product_name || `Producto #${child.product_id}`;

            const childSubtotal = safeNum(
              child?.line_total,
              safeNum(child?.unit_price, 0) * safeNum(child?.quantity, 1),
            );

            const childHideMoney =
              safeNum(child?.unit_price, 0) <= 0 &&
              safeNum(childSubtotal, 0) <= 0;

            return (
              <div
                key={`old-mobile-child-${child?.id}`}
                className="cm-child-card"
              >
                <div className="cm-mobile-title">↳ {childLabel}</div>

                <div className="cm-mobile-sub">
                  Cantidad: <strong>{child?.quantity}</strong> ·{" "}
                  {childHideMoney ? "Incluido" : money(childSubtotal)}
                </div>

                <ModifierGroupsBlock
                  groups={child?.modifier_groups_display || []}
                />

                {child?.notes ? (
                  <div className="cm-note">• {renderNotes(child.notes)}</div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default function OldItemsSection({ oldItems = [], oldItemsTree = [] }) {
  return (
    <div className="cm-section">
      <div className="cm-section-title">
        <span>Items ya enviados</span>
        <Badge tone="dark">{oldItems.length}</Badge>
      </div>

      <div className="cm-table-wrap">
        <table className="cm-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th style={{ textAlign: "right" }}>Precio</th>
              <th style={{ textAlign: "center" }}>Cant</th>
              <th style={{ textAlign: "right" }}>Subtotal</th>
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

      <div className="cm-mobile-list">
        {oldItemsTree.map((it) => (
          <OldItemCard key={`old-mobile-${it?.id}`} item={it} />
        ))}
      </div>
    </div>
  );
}