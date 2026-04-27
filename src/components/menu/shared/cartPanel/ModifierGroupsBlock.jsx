import React from "react";
import { money } from "../../../../hooks/public/publicMenu.utils";

export default function ModifierGroupsBlock({ groups = [], indent = 0 }) {
  if (!Array.isArray(groups) || groups.length <= 0) return null;

  return (
    <div
      style={{
        marginTop: 8,
        marginLeft: indent,
        padding: "9px 10px",
        borderRadius: 14,
        background: "rgba(255,255,255,0.72)",
        border: "1px solid rgba(47,42,61,0.08)",
        display: "grid",
        gap: 8,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 950, color: "#3F3A52" }}>
        Extras
      </div>

      {groups.map((group, idx) => (
        <div
          key={`${group?.group_name || "g"}-${idx}`}
          style={{ display: "grid", gap: 4 }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 900,
              color: "#3F3A52",
              opacity: 0.82,
            }}
          >
            {group?.group_name || "Grupo"}
            {Number(group?.group_total || 0) > 0
              ? ` · ${money(group.group_total)}`
              : ""}
          </div>

          {(Array.isArray(group?.options) ? group.options : []).map(
            (opt, optIdx) => {
              const qty = Number(opt?.quantity || 1);
              const unitPrice = Number(opt?.unit_price || 0);
              const totalPrice = Number(opt?.total_price || 0);

              return (
                <div
                  key={`${opt?.modifier_option_id || opt?.id || optIdx}-${optIdx}`}
                  style={{ fontSize: 12, color: "#6E6A6A", lineHeight: 1.35 }}
                >
                  • {opt?.name || "Extra"}
                  {qty > 1 ? ` x${qty}` : ""}
                  {unitPrice > 0 ? ` · ${money(unitPrice)}` : ""}
                  {totalPrice > 0 && qty > 1 ? ` · ${money(totalPrice)}` : ""}
                </div>
              );
            },
          )}
        </div>
      ))}
    </div>
  );
}