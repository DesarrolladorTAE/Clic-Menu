import React from "react";
import {
  btnDanger,
  btnGhost,
  btnPrimary,
  sub,
  title,
  topbar,
} from "./kitchen.helpers";

export default function KitchenTopbar({
  ctx,
  busy,
  refreshing,
  includeReady,
  onToggleIncludeReady,
  onRefresh,
  onExit,
}) {
  return (
    <div style={topbar}>
      <div>
        <div style={title}>Monitor de Cocina (KDS)</div>
        <div style={sub}>
          {ctx?.restaurant?.trade_name || ctx?.restaurant?.name || "—"}{" "}
          <span style={{ opacity: 0.6 }}>·</span> {ctx?.branch?.name || "—"}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          justifyContent: "flex-end",
        }}
      >
        <button
          style={btnGhost}
          onClick={onToggleIncludeReady}
          title="Mostrar u ocultar ítems listos (supervisión)"
          disabled={busy}
        >
          {includeReady ? "Mostrando listos" : "Ocultar listos"}
        </button>

        <button
          style={btnPrimary}
          onClick={onRefresh}
          disabled={busy || refreshing}
          title="Refrescar"
        >
          {refreshing ? "Actualizando…" : "Refrescar"}
        </button>

        <button style={btnDanger} onClick={onExit} title="Salir">
          Salir
        </button>
      </div>
    </div>
  );
}  