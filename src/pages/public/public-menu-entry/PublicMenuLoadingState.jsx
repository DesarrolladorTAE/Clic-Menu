// Estado visual de carga inicial del menú público.

import React from "react";
import { Badge, SkeletonCard } from "../publicMenu.ui";

export default function PublicMenuLoadingState({ token }) {
  return (
    <div style={{ maxWidth: 1200, margin: "18px auto", padding: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: 18, fontWeight: 950 }}>Cargando menú…</div>
          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
            Token: <strong style={{ letterSpacing: 0.5 }}>{token}</strong>
          </div>
        </div>

        <Badge tone="default">Solo lectura</Badge>
      </div>

      <div
        style={{
          marginTop: 14,
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}