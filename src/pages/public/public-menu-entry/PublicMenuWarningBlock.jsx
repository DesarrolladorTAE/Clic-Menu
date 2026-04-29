// Aviso de warning enviado por el payload activo del menú público.

import React from "react";

export default function PublicMenuWarningBlock({ warning }) {
  if (!warning) return null;

  return (
    <div
      style={{
        marginTop: 12,
        border: "1px solid #ffe08a",
        background: "#fff3cd",
        borderRadius: 16,
        padding: 12,
        color: "#8a6d3b",
        fontWeight: 800,
        whiteSpace: "pre-line",
      }}
    >
      {warning}
    </div>
  );
}