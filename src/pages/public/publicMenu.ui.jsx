// src/pages/public/publicMenu.ui.jsx
// Componentes UI puros (no conocen servicios ni lógica de negocio)

import React, { useEffect, useState } from "react";

export function Badge({ children, tone = "default", title }) {
  const map = {
    default: { bg: "#eef2ff", bd: "#cfcfff", fg: "#2d2d7a" },
    ok: { bg: "#e6ffed", bd: "#8ae99c", fg: "#0a7a2f" },
    warn: { bg: "#fff3cd", bd: "#ffe08a", fg: "#8a6d3b" },
    err: { bg: "#ffe5e5", bd: "#ffb3b3", fg: "#a10000" },
    dark: { bg: "#111827", bd: "#1f2937", fg: "#ffffff" },
  };
  const c = map[tone] || map.default;

  return (
    <span
      title={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 999,
        border: `1px solid ${c.bd}`,
        background: c.bg,
        color: c.fg,
        fontSize: 12,
        fontWeight: 900,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

export function SkeletonCard() {
  const row = (w) => (
    <div
      style={{
        height: 12,
        width: w,
        borderRadius: 8,
        background: "rgba(0,0,0,0.08)",
      }}
    />
  );

  return (
    <div
      style={{
        border: "1px solid rgba(0,0,0,0.10)",
        borderRadius: 16,
        padding: 14,
        background: "#fff",
        display: "grid",
        gap: 10,
      }}
    >
      <div
        style={{
          height: 120,
          borderRadius: 14,
          background: "rgba(0,0,0,0.06)",
        }}
      />
      {row("70%")}
      {row("45%")}
      {row("55%")}
    </div>
  );
}

export function PillButton({
  onClick,
  children,
  tone = "default",
  title,
  disabled,
  type = "button",
}) {
  const map = {
    default: { bg: "#fff", bd: "rgba(0,0,0,0.12)", fg: "#111" },
    soft: { bg: "#eef2ff", bd: "#cfcfff", fg: "#111" },
    dark: { bg: "#111827", bd: "#1f2937", fg: "#fff" },
    danger: { bg: "#ffe5e5", bd: "#ffb3b3", fg: "#a10000" },
    orange: { bg: "#ff7a00", bd: "#ff7a00", fg: "#fff" },
  };
  const c = map[tone] || map.default;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={!!disabled}
      title={title}
      style={{
        cursor: disabled ? "not-allowed" : "pointer",
        borderRadius: 12,
        border: `1px solid ${c.bd}`,
        background: c.bg,
        color: c.fg,
        padding: "10px 12px",
        fontWeight: 950,
        height: 40,
        opacity: disabled ? 0.55 : 1,
      }}
    >
      {children}
    </button>
  );
}

export function ProductThumb({ imageUrl, title }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [imageUrl]);

  const wrapStyle = {
    width: "100%",
    height: 130,
    borderRadius: 16,
    border: "1px solid rgba(0,0,0,0.10)",
    background: "#f3f4f6",
    overflow: "hidden",
    display: "grid",
    placeItems: "center",
  };

  const labelStyle = {
    fontSize: 12,
    fontWeight: 900,
    opacity: 0.75,
    textAlign: "center",
    padding: 10,
    lineHeight: 1.1,
  };

  if (!imageUrl) {
    return (
      <div style={wrapStyle} aria-label="Sin imagen">
        <div style={labelStyle}>Sin imagen</div>
      </div>
    );
  }

  if (failed) {
    return (
      <div style={wrapStyle} aria-label="Imagen no disponible">
        <div style={labelStyle}>Imagen no disponible</div>
      </div>
    );
  }

  return (
    <div style={wrapStyle}>
      <img
        src={imageUrl}
        alt={title}
        loading="lazy"
        onError={() => setFailed(true)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
    </div>
  );
}

export function CategoryChip({ active, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        cursor: "pointer",
        borderRadius: 999,
        border: `1px solid ${active ? "#ff7a00" : "rgba(0,0,0,0.12)"}`,
        background: active ? "#ff7a00" : "#fff",
        color: active ? "#fff" : "#111",
        padding: "10px 14px",
        fontWeight: 950,
        fontSize: 13,
        boxShadow: active ? "0 8px 18px rgba(255,122,0,0.22)" : "none",
        whiteSpace: "nowrap",
      }}
      title={label}
    >
      {label}
    </button>
  );
}

export function SearchBar({ value, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "center",
        border: "1px solid rgba(0,0,0,0.12)",
        borderRadius: 14,
        background: "#fff",
        padding: "10px 12px",
      }}
    >
      <span style={{ fontSize: 14, opacity: 0.6 }}>🔎</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar plato…"
        style={{
          border: "none",
          outline: "none",
          width: "100%",
          fontSize: 14,
          fontWeight: 700,
          background: "transparent",
        }}
      />
      {value ? (
        <button
          onClick={() => onChange("")}
          title="Limpiar"
          style={{
            cursor: "pointer",
            border: "1px solid rgba(0,0,0,0.12)",
            background: "#fff",
            borderRadius: 10,
            padding: "6px 10px",
            fontWeight: 900,
          }}
        >
          ✕
        </button>
      ) : null}
    </div>
  );
}

export function Collapse({ open, children }) {
  return (
    <div
      style={{
        maxHeight: open ? 900 : 0,
        overflow: "hidden",
        transition: "max-height 220ms ease",
      }}
    >
      <div style={{ paddingTop: open ? 10 : 0 }}>{children}</div>
    </div>
  );
}

// Overlay (no cambia tu layout, solo se superpone)
export function FullOverlay({ open, tone = "default", title, message, actions }) {
  if (!open) return null;

  const tones = {
    default: {
      bg: "rgba(17,24,39,0.55)",
      card: "#fff",
      bd: "rgba(0,0,0,0.12)",
    },
    warn: { bg: "rgba(255,122,0,0.20)", card: "#fff", bd: "#ffe08a" },
    err: {
      bg: "rgba(255,0,0,0.12)",
      card: "#fff",
      bd: "rgba(255,0,0,0.25)",
    },
  };

  const t = tones[tone] || tones.default;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        background: t.bg,
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "min(620px, 94vw)",
          background: t.card,
          borderRadius: 18,
          border: `1px solid ${t.bd}`,
          boxShadow: "0 18px 60px rgba(0,0,0,0.22)",
          padding: 14,
        }}
      >
        <div style={{ fontWeight: 950, fontSize: 16 }}>{title}</div>
        <div
          style={{
            marginTop: 8,
            fontSize: 13,
            opacity: 0.85,
            whiteSpace: "pre-line",
          }}
        >
          {message}
        </div>
        {actions ? (
          <div
            style={{
              marginTop: 12,
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Modal reutilizable con header/footer fijos y body scrolleable.
 * Mantiene compatibilidad con el uso actual.
 */
export function Modal({
  open,
  title,
  children,
  onClose,
  actions,
  width = "min(760px, 95vw)",
  maxHeight = "min(88vh, 920px)",
  bodyPadding = 14,
  contentStyle = {},
  bodyStyle = {},
  footerStyle = {},
  closeOnBackdrop = true,
}) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(17,24,39,0.55)",
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && closeOnBackdrop) onClose?.();
      }}
    >
      <div
        style={{
          width,
          maxWidth: "100%",
          maxHeight,
          background: "#FBF8F8",
          borderRadius: 18,
          border: "1px solid rgba(0,0,0,0.12)",
          boxShadow: "0 18px 60px rgba(0,0,0,0.25)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          ...contentStyle,
        }}
      >
        <div
          style={{
            padding: "14px 14px 12px 14px",
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            alignItems: "center",
            background: "#111111",
            color: "#fff",
            flexShrink: 0,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              fontWeight: 950,
              fontSize: 16,
              lineHeight: 1.2,
              minWidth: 0,
              wordBreak: "break-word",
            }}
          >
            {title}
          </div>

          <button
            onClick={onClose}
            style={{
              cursor: "pointer",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
              borderRadius: 10,
              padding: "6px 10px",
              fontWeight: 900,
              flexShrink: 0,
            }}
            title="Cerrar"
          >
            ✕
          </button>
        </div>

        <div
          style={{
            padding: bodyPadding,
            background: "#F3F1F1",
            overflowY: "auto",
            overflowX: "hidden",
            flex: 1,
            ...bodyStyle,
          }}
        >
          {children}
        </div>

        {actions ? (
          <div
            style={{
              padding: 14,
              borderTop: "1px solid rgba(0,0,0,0.10)",
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              flexWrap: "wrap",
              background: "#fff",
              flexShrink: 0,
              ...footerStyle,
            }}
          >
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}