import React from "react";
import { safeNum } from "../../../../hooks/public/publicMenu.utils";

export default function QtyControl({ item, onQtyChange }) {
  return (
    <div className="cm-qty">
      <button
        className="cm-qty-btn"
        onClick={() =>
          onQtyChange?.(item.key, Math.max(1, safeNum(item.quantity, 1) - 1))
        }
        title="Menos"
      >
        −
      </button>

      <input
        value={item.quantity}
        onChange={(e) => onQtyChange?.(item.key, e.target.value)}
        className="cm-qty-input"
      />

      <button
        className="cm-qty-btn"
        onClick={() =>
          onQtyChange?.(item.key, Math.min(99, safeNum(item.quantity, 1) + 1))
        }
        title="Más"
      >
        +
      </button>
    </div>
  );
}