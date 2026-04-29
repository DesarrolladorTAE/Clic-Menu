//Card 4: Llamar al mesero, buscador, etc
import React from "react";
import {
  Badge,
  PillButton,
  SearchBar,
} from "../../../pages/public/publicMenu.ui";

function isValidColor(color) {
  return /^#[0-9A-Fa-f]{6}$/.test(String(color || ""));
}

export default function PublicMenuOrderActionsCard({
  publicMenu,
  rightActions = null,
  q = "",
  onSearchChange,
  totalVisible = 0,
  extraFilterActions = null,
}) {
  const themeColor = isValidColor(publicMenu?.theme_color)
    ? publicMenu.theme_color
    : "#FF7A00";

  return (
    <section
      style={{
        border: "1px solid rgba(47,42,61,0.08)",
        background: "#FFFFFF",
        borderRadius: 0,
        boxShadow: "0 14px 34px rgba(47,42,61,0.07)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: themeColor,
          color: "#FFFFFF",
          padding: "14px 16px",
          textAlign: "center",
          fontSize: "clamp(18px, 3vw, 25px)",
          fontWeight: 950,
          lineHeight: 1.1,
          letterSpacing: "0.08em",
          fontFamily:
            "Nunito, Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          textTransform: "uppercase",
        }}
      >
        ¿Listo para pedir?
      </div>

      <div
        style={{
          padding: "16px clamp(14px, 3vw, 26px)",
          display: "grid",
          gap: 14,
        }}
      >
        {rightActions ? (
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {rightActions}
          </div>
        ) : null}

        <SearchBar value={q} onChange={onSearchChange} />

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Badge tone="default">
            Mostrando: <strong style={{ marginLeft: 6 }}>{totalVisible}</strong>
          </Badge>

          {extraFilterActions}

          {q ? (
            <PillButton onClick={() => onSearchChange?.("")} title="Limpiar búsqueda">
              🧹 Limpiar
            </PillButton>
          ) : null}
        </div>
      </div>
    </section>
  );
}