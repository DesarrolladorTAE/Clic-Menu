import React from "react";
import {
  Badge,
  CategoryChip,
  PillButton,
  SearchBar,
} from "../../../pages/public/publicMenu.ui";

export default function MenuHeaderCard({
  title,
  subtitle,
  badges = [],
  extraInfo = null,
  rightActions = null,
  categoryOptions = [],
  categoryFilter = "all",
  onCategoryChange,
  q = "",
  onSearchChange,
  totalVisible = 0,
  extraFilterActions = null,
  children = null,
}) {
  return (
    <div
      style={{
        border: "1px solid rgba(0,0,0,0.12)",
        borderRadius: 18,
        background: "#fff",
        padding: 14,
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "grid", gap: 4 }}>
          <div style={{ fontSize: 18, fontWeight: 950 }}>{title}</div>
          <div style={{ fontSize: 13, opacity: 0.85 }}>{subtitle}</div>

          {badges?.length ? (
            <div
              style={{
                marginTop: 6,
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {badges.map((b, idx) => (
                <Badge
                  key={`${b?.label || idx}-${idx}`}
                  tone={b?.tone || "default"}
                  title={b?.title}
                >
                  {b?.label}
                </Badge>
              ))}
            </div>
          ) : null}

          {extraInfo ? (
            <div style={{ marginTop: 6, fontSize: 12, opacity: 0.85 }}>
              {extraInfo}
            </div>
          ) : null}

          {children}
        </div>

        {rightActions ? (
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "start",
              flexWrap: "wrap",
            }}
          >
            {rightActions}
          </div>
        ) : null}
      </div>

      <div style={{ marginTop: 14 }}>
        {categoryOptions?.length ? (
          <div
            style={{
              display: "flex",
              gap: 10,
              overflowX: "auto",
              paddingBottom: 6,
              WebkitOverflowScrolling: "touch",
            }}
          >
            {categoryOptions.map((c) => (
              <CategoryChip
                key={c.value}
                label={c.label}
                active={categoryFilter === c.value}
                onClick={() => onCategoryChange?.(c.value)}
              />
            ))}
          </div>
        ) : null}

        <div style={{ marginTop: categoryOptions?.length ? 10 : 0 }}>
          <SearchBar value={q} onChange={onSearchChange} />
        </div>

        <div
          style={{
            marginTop: 10,
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

          {(categoryFilter !== "all" || q) && (
            <PillButton
              onClick={() => {
                onCategoryChange?.("all");
                onSearchChange?.("");
              }}
              title="Limpiar filtros"
            >
              🧹 Limpiar
            </PillButton>
          )}
        </div>
      </div>
    </div>
  );
}