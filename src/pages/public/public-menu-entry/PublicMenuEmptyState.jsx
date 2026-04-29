// Estado visual defensivo cuando no existe data válida del menú público.

import React from "react";

export default function PublicMenuEmptyState() {
  return (
    <div style={{ maxWidth: 1200, margin: "18px auto", padding: 16 }}>
      <div
        style={{
          border: "1px solid rgba(0,0,0,0.12)",
          background: "#fff",
          borderRadius: 16,
          padding: 14,
        }}
      >
        <div style={{ fontWeight: 950 }}>Sin data</div>
        <div style={{ fontSize: 13, opacity: 0.8, marginTop: 6 }}>
          Esto no debería pasar… pero aquí estamos.
        </div>
      </div>
    </div>
  );
}