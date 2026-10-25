//src/components/menu/shared/menu-sets/MenuCatalogModeLayout.jsx
//Interpreta el modo de catalogo: normal, conjunto o mixto. 
// En modalidad mixta coloca los Conjuntos primero y después el catálogo de productos normales, siguiendo las imágenes.
import React from "react";
import { alpha, useTheme } from "@mui/material/styles";

import { getCatalogModeVisibility } from "../../../../hooks/menu/menu-sets/menuSet.utils";
import MenuSetsSection from "./MenuSetsSection";

function getSafeColor(theme, color) {
  if (/^#[0-9A-Fa-f]{6}$/.test(String(color || ""))) return color;

  const primary = theme.palette.primary.main;
  return /^#[0-9A-Fa-f]{6}$/.test(primary) ? primary : "#FF7A00";
}

export default function MenuCatalogModeLayout({
  catalogMode,
  menuSets = [],
  normalContent = null,
  menuSetsContent = null,
  themeColor,
  onOpenMenuSet,
  loading = false,
  showNormalHeader = true,
  children,
}) {
  const theme = useTheme();
  const color = getSafeColor(theme, themeColor);
  const visibility = getCatalogModeVisibility(catalogMode);
  const normalCatalog = normalContent ?? children;

  if (!visibility.isValid) {
    if (loading) return null;

    return (
      <div
        role="status"
        style={{
          marginTop: 16,
          padding: 16,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 12,
          background: theme.palette.background.paper,
          color: theme.palette.text.secondary,
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        No se pudo determinar qué productos están disponibles en este menú.
      </div>
    );
  }

  return (
    <div className="cm-menu-catalog-layout" style={{ width: "100%", minWidth: 0 }}>
      <style>
        {`
          .cm-menu-catalog-layout,
          .cm-menu-catalog-layout * {
            box-sizing: border-box;
          }

          .cm-menu-catalog-normal {
            width: 100%;
            min-width: 0;
            padding: 18px;
            border-radius: 14px;
            background: var(--cm-catalog-surface);
            border: 1px solid var(--cm-catalog-border);
            box-shadow: 0 10px 28px rgba(47,42,61,0.045);
          }

          .cm-menu-catalog-normal-heading {
            margin: 0;
            font-size: 19px;
            font-weight: 950;
            line-height: 1.25;
            color: var(--cm-catalog-text);
            letter-spacing: -0.3px;
          }

          .cm-menu-catalog-normal-description {
            margin: 5px 0 15px;
            font-size: 12.5px;
            line-height: 1.5;
            color: var(--cm-catalog-secondary);
          }

          @media (max-width: 639px) {
            .cm-menu-catalog-normal {
              padding: 13px 11px;
              border-radius: 12px;
            }

            .cm-menu-catalog-normal-heading {
              font-size: 17px;
            }
          }
        `}
      </style>

      {visibility.showMenuSets ? (
        menuSetsContent ?? (
          <MenuSetsSection
            items={menuSets}
            loading={loading}
            themeColor={color}
            onOpenMenuSet={onOpenMenuSet}
          />
        )
      ) : null}

      {visibility.showNormalProducts && normalCatalog !== null ? (
        <section
          className="cm-menu-catalog-normal"
          aria-label="Productos a la carta"
          style={{
            marginTop: visibility.showMenuSets ? 18 : 14,
            "--cm-catalog-surface": theme.palette.background.paper,
            "--cm-catalog-border": alpha(color, 0.18),
            "--cm-catalog-text": theme.palette.text.primary,
            "--cm-catalog-secondary": theme.palette.text.secondary,
          }}
        >
          {showNormalHeader ? (
            <header>
              <h2 className="cm-menu-catalog-normal-heading">
                PRODUCTOS A LA CARTA
              </h2>
              <p className="cm-menu-catalog-normal-description">
                Explora nuestros platillos y bebidas.
              </p>
            </header>
          ) : null}

          {normalCatalog}
        </section>
      ) : null}
    </div>
  );
}