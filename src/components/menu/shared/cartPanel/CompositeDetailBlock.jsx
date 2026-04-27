import React from "react";
import {
  formatComponentDetailLabel,
  safeNum,
} from "../../../../hooks/public/publicMenu.utils";
import ModifierGroupsBlock from "./ModifierGroupsBlock";

export default function CompositeDetailBlock({ details = [] }) {
  if (!Array.isArray(details) || !details.length) return null;

  return (
    <div
      style={{
        marginTop: 8,
        padding: "9px 10px",
        borderRadius: 14,
        background: "rgba(255,255,255,0.72)",
        border: "1px solid rgba(47,42,61,0.08)",
        display: "grid",
        gap: 8,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 950, color: "#3F3A52" }}>
        Componentes
      </div>

      {details.map((d, idx) => (
        <div
          key={`${d?.component_product_id || idx}-${idx}`}
          style={{
            fontSize: 12,
            color: "#6E6A6A",
            display: "grid",
            gap: 4,
            lineHeight: 1.35,
          }}
        >
          <div>
            • {formatComponentDetailLabel(d)} · Cantidad:{" "}
            <strong>{safeNum(d?.quantity, 1)}</strong>
            {d?.is_optional ? " · Opcional" : ""}
            {d?.apply_variant_price ? " · Ajusta precio" : ""}
          </div>

          <ModifierGroupsBlock
            groups={d?.modifier_groups_display || []}
            indent={12}
          />
        </div>
      ))}
    </div>
  );
}