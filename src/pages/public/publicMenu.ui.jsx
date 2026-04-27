// src/pages/public/publicMenu.ui.jsx
// Componentes UI puros (no conocen servicios ni lógica de negocio)

import React, { useEffect, useState } from "react";

const MENU_UI = {
  orange: "#FF7A00",
  orangeDark: "#E66D00",
  text: "#2F2A3D",
  muted: "#6E6A7A",
  border: "rgba(47,42,61,0.10)",
  softBorder: "rgba(47,42,61,0.08)",
  surface: "#FFFFFF",
  surfaceSoft: "#FBF8F8",
  bgSoft: "#F6F3EF",
};

export function Badge({ children, tone = "default", title }) {
  const map = {
    default: {
      bg: "rgba(99,102,241,0.10)",
      bd: "rgba(99,102,241,0.18)",
      fg: "#3730A3",
    },
    ok: {
      bg: "rgba(16,185,129,0.12)",
      bd: "rgba(16,185,129,0.22)",
      fg: "#047857",
    },
    warn: {
      bg: "rgba(245,158,11,0.14)",
      bd: "rgba(245,158,11,0.25)",
      fg: "#B45309",
    },
    err: {
      bg: "rgba(239,68,68,0.12)",
      bd: "rgba(239,68,68,0.22)",
      fg: "#B91C1C",
    },
    dark: {
      bg: "#111827",
      bd: "#1F2937",
      fg: "#FFFFFF",
    },
  };

  const c = map[tone] || map.default;

  return (
    <span
      title={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 10px",
        borderRadius: 999,
        border: `1px solid ${c.bd}`,
        background: c.bg,
        color: c.fg,
        fontSize: 12,
        fontWeight: 900,
        lineHeight: 1.15,
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
        borderRadius: 999,
        background:
          "linear-gradient(90deg, rgba(47,42,61,0.06), rgba(47,42,61,0.11), rgba(47,42,61,0.06))",
      }}
    />
  );

  return (
    <div
      style={{
        border: `1px solid ${MENU_UI.border}`,
        borderRadius: 24,
        padding: 12,
        background: MENU_UI.surface,
        display: "grid",
        gap: 12,
        boxShadow: "0 16px 38px rgba(47,42,61,0.06)",
      }}
    >
      <div
        style={{
          aspectRatio: "1 / 0.78",
          borderRadius: 22,
          background:
            "linear-gradient(135deg, rgba(255,122,0,0.08), rgba(99,102,241,0.08))",
        }}
      />
      {row("78%")}
      {row("48%")}
      {row("62%")}
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
    default: {
      bg: "#FFFFFF",
      bd: "rgba(47,42,61,0.12)",
      fg: MENU_UI.text,
      shadow: "0 8px 18px rgba(47,42,61,0.05)",
    },
    soft: {
      bg: "rgba(99,102,241,0.10)",
      bd: "rgba(99,102,241,0.18)",
      fg: "#3730A3",
      shadow: "0 8px 18px rgba(99,102,241,0.08)",
    },
    dark: {
      bg: "#111827",
      bd: "#111827",
      fg: "#FFFFFF",
      shadow: "0 12px 22px rgba(17,24,39,0.18)",
    },
    danger: {
      bg: "rgba(239,68,68,0.10)",
      bd: "rgba(239,68,68,0.22)",
      fg: "#B91C1C",
      shadow: "0 8px 18px rgba(239,68,68,0.08)",
    },
    orange: {
      bg: `linear-gradient(135deg, ${MENU_UI.orange}, #FF9F2F)`,
      bd: "rgba(255,122,0,0.85)",
      fg: "#FFFFFF",
      shadow: "0 14px 26px rgba(255,122,0,0.24)",
    },
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
        borderRadius: 16,
        border: `1px solid ${c.bd}`,
        background: c.bg,
        color: c.fg,
        padding: "0 14px",
        fontWeight: 950,
        minHeight: 42,
        height: 42,
        opacity: disabled ? 0.55 : 1,
        boxShadow: disabled ? "none" : c.shadow,
        transition:
          "transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease, background 160ms ease",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
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
    height: 230,
    borderRadius: 6,
    border: `1px solid ${MENU_UI.softBorder}`,
    background: "#FFFFFF",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  };

  const labelStyle = {
    fontSize: 13,
    fontWeight: 800,
    color: "rgba(47,42,61,0.55)",
    textAlign: "center",
    padding: 12,
    lineHeight: 1.2,
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
          objectFit: "contain",
          objectPosition: "center",
          display: "block",
          padding: 4,
          boxSizing: "border-box",
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
        border: `1px solid ${
          active ? "rgba(255,122,0,0.92)" : "rgba(47,42,61,0.10)"
        }`,
        background: active
          ? `linear-gradient(135deg, ${MENU_UI.orange}, #FF9F2F)`
          : "#FFFFFF",
        color: active ? "#FFFFFF" : MENU_UI.text,
        padding: "10px 15px",
        fontWeight: 950,
        fontSize: 13,
        boxShadow: active
          ? "0 14px 24px rgba(255,122,0,0.22)"
          : "0 8px 18px rgba(47,42,61,0.04)",
        whiteSpace: "nowrap",
        transition: "transform 160ms ease, box-shadow 160ms ease",
      }}
      title={label}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
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
        border: `1px solid ${MENU_UI.border}`,
        borderRadius: 18,
        background: "#FFFFFF",
        padding: "11px 13px",
        boxShadow: "0 10px 28px rgba(47,42,61,0.04)",
      }}
    >
      <span style={{ fontSize: 15, opacity: 0.62 }}>🔎</span>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar platillo, bebida o categoría…"
        style={{
          border: "none",
          outline: "none",
          width: "100%",
          fontSize: 14,
          fontWeight: 800,
          background: "transparent",
          color: MENU_UI.text,
          minWidth: 0,
        }}
      />

      {value ? (
        <button
          onClick={() => onChange("")}
          title="Limpiar"
          style={{
            cursor: "pointer",
            border: `1px solid ${MENU_UI.border}`,
            background: "#FFFFFF",
            borderRadius: 12,
            padding: "6px 10px",
            fontWeight: 950,
            color: MENU_UI.text,
            boxShadow: "0 6px 14px rgba(47,42,61,0.05)",
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
      bg: "rgba(17,24,39,0.58)",
      card: "#FFFFFF",
      bd: "rgba(255,255,255,0.50)",
      accent: "#6366F1",
    },
    warn: {
      bg: "rgba(255,122,0,0.22)",
      card: "#FFFFFF",
      bd: "rgba(255,224,138,0.75)",
      accent: MENU_UI.orange,
    },
    err: {
      bg: "rgba(127,29,29,0.16)",
      card: "#FFFFFF",
      bd: "rgba(239,68,68,0.26)",
      accent: "#EF4444",
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
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          width: "min(620px, 94vw)",
          background: t.card,
          borderRadius: 26,
          border: `1px solid ${t.bd}`,
          boxShadow: "0 24px 80px rgba(17,24,39,0.26)",
          padding: 18,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "0 auto 0 0",
            width: 5,
            background: t.accent,
          }}
        />

        <div
          style={{
            fontWeight: 950,
            fontSize: 18,
            color: MENU_UI.text,
            paddingLeft: 6,
          }}
        >
          {title}
        </div>

        <div
          style={{
            marginTop: 8,
            fontSize: 14,
            color: MENU_UI.muted,
            lineHeight: 1.55,
            whiteSpace: "pre-line",
            paddingLeft: 6,
          }}
        >
          {message}
        </div>

        {actions ? (
          <div
            style={{
              marginTop: 14,
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              paddingLeft: 6,
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
        background: "rgba(17,24,39,0.58)",
        display: "grid",
        placeItems: "center",
        padding: 16,
        backdropFilter: "blur(8px)",
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
          background: MENU_UI.surfaceSoft,
          borderRadius: 28,
          border: "1px solid rgba(255,255,255,0.55)",
          boxShadow: "0 28px 90px rgba(17,24,39,0.30)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          ...contentStyle,
        }}
      >
        <div
          style={{
            padding: "16px 16px 14px 18px",
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
            background:
              "linear-gradient(135deg, #15151F 0%, #252236 52%, #111827 100%)",
            color: "#FFFFFF",
            flexShrink: 0,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              fontWeight: 950,
              fontSize: 17,
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
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.10)",
              color: "#FFFFFF",
              borderRadius: 14,
              padding: "7px 11px",
              fontWeight: 950,
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
            background:
              "linear-gradient(180deg, #F8F5F1 0%, #F3F1F1 100%)",
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
              borderTop: "1px solid rgba(47,42,61,0.08)",
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              flexWrap: "wrap",
              background: "#FFFFFF",
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