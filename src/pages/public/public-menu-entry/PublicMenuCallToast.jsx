// Aviso visual del resultado al llamar al mesero.

import React from "react";

export default function PublicMenuCallToast({ message }) {
  if (!message) return null;

  return (
    <div
      style={{
        marginTop: 12,
        border: "1px solid rgba(0,0,0,0.10)",
        background: "#fff",
        borderRadius: 14,
        padding: 10,
        fontSize: 13,
        fontWeight: 850,
      }}
    >
      {message}
    </div>
  );
}