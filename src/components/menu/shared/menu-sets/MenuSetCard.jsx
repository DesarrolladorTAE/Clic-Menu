//src/components/menu/shared/menu-sets/MenuSetCard.jsx
//Tarjeta de conjuntos
import React from "react";
import { alpha, useTheme } from "@mui/material/styles";

import { PillButton, ProductThumb } from "../../../../pages/public/publicMenu.ui";
import { normalizeMenuSet } from "../../../../hooks/menu/menu-sets/menuSet.utils";

function getSafeColor(theme, color) {
  if (/^#[0-9A-Fa-f]{6}$/.test(String(color || ""))) return color;

  const primary = theme.palette.primary.main;
  return /^#[0-9A-Fa-f]{6}$/.test(primary) ? primary : "#FF7A00";
}

export default function MenuSetCard({
  menuSet,
  themeColor,
  onOpenMenuSet,
}) {
  const theme = useTheme();
  const color = getSafeColor(theme, themeColor);

  if (!menuSet) return null;

  const set = menuSet.kind === "menu_set" && "isSellable" in menuSet
    ? menuSet
    : normalizeMenuSet(menuSet);

  const title = set.name || "Conjunto";
  const description = set.description || "Elige tus productos y personaliza tu menú.";
  const available = set.isSellable ?? set.availability?.isAvailable ?? null;
  const inactive = set.isActive === false;
  const isUnavailable = inactive || available === false;

  const statusLabel = inactive
    ? "Inactivo"
    : available === false
      ? "No disponible"
      : available === true
        ? "Disponible"
        : "Consultar";

  const canOpen = !!set.id && typeof onOpenMenuSet === "function";

  return (
    <article
      className="cm-menu-set-card"
      style={{
        "--cm-menu-set-card-color": color,
        "--cm-menu-set-card-border": alpha(color, 0.17),
        "--cm-menu-set-card-hover": alpha(color, 0.14),
        "--cm-menu-set-card-text": theme.palette.text.primary,
        "--cm-menu-set-card-muted": theme.palette.text.secondary,
        "--cm-menu-set-card-surface": theme.palette.background.paper,
      }}
    >
      <style>
        {`
          .cm-menu-set-card {
            position: relative;
            display: grid;
            grid-template-rows: auto 1fr auto;
            width: 100%;
            min-width: 0;
            height: 100%;
            overflow: hidden;
            padding: 11px;
            background: var(--cm-menu-set-card-surface);
            border: 1px solid var(--cm-menu-set-card-border);
            border-radius: 12px;
            box-shadow: 0 8px 22px rgba(47,42,61,0.055);
            transition: transform 180ms ease, box-shadow 180ms ease;
            box-sizing: border-box;
          }

          .cm-menu-set-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 14px 30px var(--cm-menu-set-card-hover);
          }

          .cm-menu-set-card * {
            box-sizing: border-box;
          }

          .cm-menu-set-card-image {
            position: relative;
            min-width: 0;
          }

          .cm-menu-set-card-image > div {
            width: 100%;
            height: 166px !important;
            border-radius: 10px !important;
            overflow: hidden;
          }

          .cm-menu-set-card-info {
            display: grid;
            align-content: start;
            gap: 6px;
            min-width: 0;
            padding: 12px 2px 13px;
          }

          .cm-menu-set-card-name {
            margin: 0;
            color: var(--cm-menu-set-card-text);
            font-size: 15px;
            font-weight: 900;
            line-height: 1.3;
            min-height: 39px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            overflow-wrap: anywhere;
          }

          .cm-menu-set-card-description {
            margin: 0;
            min-height: 37px;
            color: var(--cm-menu-set-card-muted);
            font-size: 12px;
            line-height: 1.5;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .cm-menu-set-card-action {
            display: grid;
            padding: 0 2px 1px;
          }

          @media (max-width: 639px) {
            .cm-menu-set-card { padding: 9px; }
            .cm-menu-set-card-image > div { height: 155px !important; }
            .cm-menu-set-card-name { font-size: 14px; }
          }
        `}
      </style>

      <div className="cm-menu-set-card-image">
        <ProductThumb
          imageUrl={set.image || null}
          title={title}
          height={166}
        />

        <span
          title={set.availability?.reason || statusLabel}
          style={{
            position: "absolute",
            top: 9,
            right: 9,
            maxWidth: "calc(100% - 18px)",
            padding: "5px 9px",
            borderRadius: 999,
            border: `1px solid ${isUnavailable ? alpha("#64748B", 0.25) : alpha(color, 0.2)}`,
            background: "rgba(255,255,255,0.96)",
            color: isUnavailable ? theme.palette.text.secondary : color,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            fontSize: 10,
            fontWeight: 900,
            lineHeight: 1.2,
            textAlign: "center",
          }}
        >
          {statusLabel}
        </span>
      </div>

      <div className="cm-menu-set-card-info">
        <h3 className="cm-menu-set-card-name" title={title}>
          {title}
        </h3>

        <p className="cm-menu-set-card-description" title={description}>
          {description}
        </p>
      </div>

      <div className="cm-menu-set-card-action">
        <PillButton
          tone="orange"
          themeColor={color}
          disabled={!canOpen}
          onClick={() => onOpenMenuSet?.(set)}
          title={canOpen ? `Abrir ${title}` : "No se puede abrir este menú"}
          style={{ width: "100%", minHeight: 37, fontWeight: 850 }}
        >
          Abrir menú
        </PillButton>
      </div>
    </article>
  );
}