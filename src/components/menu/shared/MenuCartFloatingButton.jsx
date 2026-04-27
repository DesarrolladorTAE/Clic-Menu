// src/components/menu/shared/MenuCartFloatingButton.jsx

import React from "react";
import { useTheme } from "@mui/material/styles";
import { money } from "../../../hooks/public/publicMenu.utils";

export default function MenuCartFloatingButton({
  itemCount = 0,
  total = 0,
  disabled = false,
  onClick,
  label = "Ver comanda",
  title = "Abrir comanda",
  showTotal = true,
}) {
  const theme = useTheme();

  const safeItemCount = Number(itemCount || 0);
  const hasItems = safeItemCount > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        position: "fixed",
        right: 18,
        bottom: 18,
        zIndex: 850,
        cursor: disabled ? "not-allowed" : "pointer",
        border: "1px solid rgba(255,255,255,0.45)",
        borderRadius: 999,
        background: disabled
          ? "rgba(63,58,82,0.35)"
          : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
        color: "#FFFFFF",
        boxShadow: disabled
          ? "none"
          : "0 18px 40px rgba(255, 122, 0, 0.34)",
        padding: "10px 12px 10px 10px",
        minHeight: 58,
        maxWidth: "calc(100vw - 28px)",
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        opacity: disabled ? 0.65 : 1,
        transition:
          "transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease",
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <span
        style={{
          width: 42,
          height: 42,
          borderRadius: 999,
          background: "rgba(255,255,255,0.20)",
          display: "grid",
          placeItems: "center",
          fontSize: 20,
          flexShrink: 0,
          position: "relative",
        }}
      >
        🧾

        {hasItems ? (
          <span
            style={{
              position: "absolute",
              top: -5,
              right: -5,
              minWidth: 22,
              height: 22,
              padding: "0 6px",
              borderRadius: 999,
              background: "#111827",
              color: "#FFFFFF",
              border: "2px solid #FFFFFF",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 950,
              lineHeight: 1,
            }}
          >
            {safeItemCount > 99 ? "99+" : safeItemCount}
          </span>
        ) : null}
      </span>

      <span
        style={{
          display: "grid",
          gap: 2,
          textAlign: "left",
          minWidth: 0,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 950,
            lineHeight: 1.1,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>

        <span
          style={{
            fontSize: 12,
            fontWeight: 850,
            lineHeight: 1.1,
            opacity: 0.92,
            whiteSpace: "nowrap",
          }}
        >
          {safeItemCount} item{safeItemCount === 1 ? "" : "s"}
          {showTotal ? ` · ${money(total)}` : ""}
        </span>
      </span>
    </button>
  );
}