// Selector de canal web cuando el menú público tiene varios canales disponibles.

import React from "react";

export default function PublicMenuWebChannelSelector({
  show,
  activeWebChannelId,
  webChannels,
  onChange,
}) {
  if (!show) return null;

  return (
    <div
      style={{
        marginTop: 12,
        border: "1px solid rgba(47,42,61,0.08)",
        background: "#FFFFFF",
        padding: 14,
        display: "grid",
        gap: 6,
        boxShadow: "0 12px 28px rgba(47,42,61,0.05)",
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.85 }}>
        Canal a visualizar
      </div>

      <select
        value={activeWebChannelId}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 12,
          border: "1px solid rgba(0,0,0,0.12)",
          outline: "none",
          fontWeight: 850,
          background: "#fff",
        }}
      >
        {(webChannels || []).map((ch) => (
          <option key={ch.id} value={String(ch.id)}>
            {ch.name}
          </option>
        ))}
      </select>
    </div>
  );
}