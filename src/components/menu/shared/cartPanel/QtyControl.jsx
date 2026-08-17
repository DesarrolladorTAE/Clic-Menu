import React from "react";
import { safeNum } from "../../../../hooks/public/publicMenu.utils";

const GENERAL_MAX_QTY = 99;

function getMaxAvailableQty(item) {
  const rawMax = item?.availability?.max_available_qty;

  if (rawMax === null || rawMax === undefined || rawMax === "") {
    return GENERAL_MAX_QTY;
  }

  const maxAvailable = Number(rawMax);
  if (!Number.isFinite(maxAvailable)) return GENERAL_MAX_QTY;

  return Math.max(0, Math.min(GENERAL_MAX_QTY, Math.floor(maxAvailable)));
}

export default function QtyControl({ item, onQtyChange }) {
  const currentQty = Math.max(1, Math.floor(safeNum(item?.quantity, 1)));
  const maxQty = getMaxAvailableQty(item);

  const canIncrease = maxQty > 0 && currentQty < maxQty;

  const handleInputChange = (value) => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return;

    const requestedQty = Math.max(1, Math.floor(numericValue));

    if (maxQty <= 0) {
      onQtyChange?.(item.key, 1);
      return;
    }

    onQtyChange?.(item.key, Math.min(maxQty, requestedQty));
  };

  return (
    <div className="cm-qty">
      <button
        className="cm-qty-btn"
        onClick={() => onQtyChange?.(item.key, Math.max(1, currentQty - 1))}
        disabled={currentQty <= 1}
        title="Menos"
      >
        −
      </button>

      <input
        type="number"
        min={1}
        max={maxQty > 0 ? maxQty : 1}
        value={item.quantity}
        onChange={(e) => handleInputChange(e.target.value)}
        className="cm-qty-input"
      />

      <button
        className="cm-qty-btn"
        onClick={() => {
          if (!canIncrease) return;
          onQtyChange?.(item.key, Math.min(maxQty, currentQty + 1));
        }}
        disabled={!canIncrease}
        title={canIncrease ? "Más" : "Se alcanzó el máximo disponible"}
      >
        +
      </button>
    </div>
  );
}
