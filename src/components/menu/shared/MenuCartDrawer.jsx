// src/components/menu/shared/MenuCartDrawer.jsx

import React from "react";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { money } from "../../../hooks/public/publicMenu.utils";
import { Badge, PillButton } from "../../../pages/public/publicMenu.ui";

export default function MenuCartDrawer({
  open = false,
  onClose,
  title = "Comanda",
  subtitle = "Revisa los productos seleccionados.",
  itemCount = 0,
  total = 0,
  children = null,
  disabledClose = false,
  closeOnBackdrop = true,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (!open) return null;

  const safeItemCount = Number(itemCount || 0);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1200,
        background: isMobile ? "rgba(17, 24, 39, 0.42)" : "rgba(17, 24, 39, 0.18)",
        backdropFilter: "none",
        display: "flex",
        justifyContent: isMobile ? "center" : "flex-end",
        alignItems: isMobile ? "flex-end" : "stretch",
        padding: 0,
      }}
      onMouseDown={(e) => {
        if (
          e.target === e.currentTarget &&
          closeOnBackdrop &&
          !disabledClose
        ) {
          onClose?.();
        }
      }}
    >
      <div
        style={{
          width: isMobile ? "100%" : 420,
          maxWidth: isMobile ? "100%" : "min(420px, 100vw)",
          height: isMobile ? "min(86vh, 760px)" : "100vh",
          maxHeight: isMobile ? "min(86vh, 760px)" : "100vh",
          background: theme.palette.background.paper,
          borderRadius: isMobile ? "28px 28px 0 0" : 0,
          border: "none",
          borderLeft: isMobile ? "none" : "1px solid rgba(47,42,61,0.12)",
          boxShadow: isMobile
            ? "0 -18px 50px rgba(17,24,39,0.24)"
            : "-12px 0 34px rgba(17,24,39,0.16)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "16px 16px 14px 16px",
            background: "#111827",
            color: "#FFFFFF",
            flexShrink: 0,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {isMobile ? (
            <div
              style={{
                width: 46,
                height: 5,
                borderRadius: 999,
                background: "rgba(255,255,255,0.32)",
                margin: "0 auto 12px auto",
              }}
            />
          ) : null}

          {/* HEADER CORREGIDO */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={disabledClose}
              title="Cerrar comanda"
              style={{
                cursor: disabledClose ? "not-allowed" : "pointer",
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.10)",
                color: "#FFFFFF",
                borderRadius: 14,
                padding: "8px 11px",
                fontWeight: 950,
                opacity: disabledClose ? 0.55 : 1,
                flexShrink: 0,
              }}
            >
              ✕
            </button>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 950,
                  lineHeight: 1.15,
                }}
              >
                {title}
              </div>

              {subtitle ? (
                <div
                  style={{
                    marginTop: 5,
                    fontSize: 13,
                    lineHeight: 1.35,
                    opacity: 0.82,
                  }}
                >
                  {subtitle}
                </div>
              ) : null}
            </div>
          </div>

          <div
            style={{
              marginTop: 12,
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Badge tone={safeItemCount > 0 ? "ok" : "warn"}>
              Items: <strong style={{ marginLeft: 6 }}>{safeItemCount}</strong>
            </Badge>

            <Badge tone="dark">
              Total: <strong style={{ marginLeft: 6 }}>{money(total)}</strong>
            </Badge>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: 14,
            background:
              "linear-gradient(180deg, #F8F5F1 0%, #F3F1F1 100%)",
          }}
        >
          {children ? (
            <div
              style={{
                display: "grid",
                gap: 12,
              }}
            >
              {children}
            </div>
          ) : (
            <div
              style={{
                border: `1px dashed ${theme.palette.divider}`,
                borderRadius: 20,
                background: "#FFFFFF",
                padding: 18,
                textAlign: "center",
                color: theme.palette.text.secondary,
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              Aún no hay productos en la comanda.
            </div>
          )}
        </div>

        <div
          style={{
            padding: 14,
            borderTop: "1px solid rgba(47,42,61,0.08)",
            background: "#FFFFFF",
            flexShrink: 0,
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          <PillButton
            tone="default"
            onClick={onClose}
            disabled={disabledClose}
            title="Cerrar y seguir viendo el menú"
          >
            Seguir viendo menú
          </PillButton>
        </div>
      </div>
    </div>
  );
}