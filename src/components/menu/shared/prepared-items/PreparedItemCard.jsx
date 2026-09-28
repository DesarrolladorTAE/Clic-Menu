import React, { useState } from "react";
import { alpha, useTheme } from "@mui/material/styles";

import {
  PillButton,
  ProductThumb,
} from "../../../../pages/public/publicMenu.ui";
import { money } from "../../../../hooks/public/publicMenu.utils";
import {
  getPreparedItemConfigurationSummary,
  getPreparedItemCurrentPrice,
  getPreparedItemDisplayName,
} from "../../../../hooks/menu/preparedItem.utils";

/*
 * Tarjeta visual compartida de una unidad física de Preparación rápida.
 *
 * Usa:
 * - publicMenu.ui.jsx, para reutilizar PillButton y ProductThumb.
 * - publicMenu.utils.js, para reutilizar el formateo monetario.
 *
 * La usan:
 * - PreparedItemsSection.jsx.
 *
 * No conoce endpoints, canales, carrito, inventario normal ni configuración editable.
 */

function isValidColor(color) {
  return /^#[0-9A-Fa-f]{6}$/.test(String(color || ""));
}

function getCardThemeColor(theme, themeColor) {
  if (isValidColor(themeColor)) return themeColor;

  const themePrimary = String(theme?.palette?.primary?.main || "");
  return isValidColor(themePrimary) ? themePrimary : "#FF7A00";
}

function getPreparedAgoMinutes(preparedItem) {
  const preparedAt = Date.parse(String(preparedItem?.prepared_at || ""));

  if (Number.isFinite(preparedAt)) {
    return Math.max(0, Math.floor((Date.now() - preparedAt) / 60000));
  }

  const directMinutes = Number(preparedItem?.prepared_ago_minutes);

  if (Number.isFinite(directMinutes)) {
    return Math.max(0, Math.floor(directMinutes));
  }

  const elapsedSeconds = Number(preparedItem?.prepared_elapsed_seconds);

  if (Number.isFinite(elapsedSeconds)) {
    return Math.max(0, Math.floor(elapsedSeconds / 60));
  }

  return null;
}

function getExpiresInMinutes(preparedItem) {
  const expiresAt = Date.parse(String(preparedItem?.expires_at || ""));

  if (Number.isFinite(expiresAt)) {
    return Math.max(0, Math.ceil((expiresAt - Date.now()) / 60000));
  }

  const directMinutes = Number(preparedItem?.expires_in_minutes);

  if (Number.isFinite(directMinutes)) {
    return Math.max(0, Math.ceil(directMinutes));
  }

  const expiresInSeconds = Number(preparedItem?.expires_in_seconds);

  if (Number.isFinite(expiresInSeconds)) {
    return Math.max(0, Math.ceil(expiresInSeconds / 60));
  }

  return null;
}

export default function PreparedItemCard({
  preparedItem,
  selected = false,
  disabled = false,
  themeColor,
  onSelect,
}) {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);

  const cardThemeColor = getCardThemeColor(theme, themeColor);

  const title = getPreparedItemDisplayName(preparedItem);
  const configurationSummary =
    getPreparedItemConfigurationSummary(preparedItem);
  const currentPrice = getPreparedItemCurrentPrice(preparedItem);

  const preparedAgoMinutes = getPreparedAgoMinutes(preparedItem);
  const expiresInMinutes = getExpiresInMinutes(preparedItem);

  const cardBorder = alpha(cardThemeColor, selected ? 0.5 : 0.2);
  const softSurface = alpha(cardThemeColor, 0.055);
  const softSurfaceStrong = alpha(cardThemeColor, 0.085);
  const softBorder = alpha(cardThemeColor, 0.18);
  const selectedSurface = alpha(cardThemeColor, 0.08);

  const normalShadow = selected
    ? `0 12px 28px ${alpha(cardThemeColor, 0.14)}`
    : "0 10px 26px rgba(47,42,61,0.075)";

  const hoverShadow = selected
    ? `0 17px 34px ${alpha(cardThemeColor, 0.2)}`
    : `0 17px 34px ${alpha(cardThemeColor, 0.16)}`;

  const timeLabels = [];

  if (preparedAgoMinutes !== null) {
    timeLabels.push(
      preparedAgoMinutes <= 0
        ? "Lista hace menos de 1 min"
        : `Lista hace ${preparedAgoMinutes} min`,
    );
  }

  if (expiresInMinutes !== null) {
    timeLabels.push(
      expiresInMinutes <= 0
        ? "Disponible menos de 1 min"
        : `Disponible ${expiresInMinutes} min`,
    );
  }

  const blocked = selected || disabled || typeof onSelect !== "function";

  const handleSelect = () => {
    if (blocked) return;
    onSelect?.(preparedItem);
  };

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        border: `3px solid ${cardBorder}`,
        borderRadius: 10,
        background: "#FFFFFF",
        overflow: "hidden",
        boxShadow: hovered ? hoverShadow : normalShadow,
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "transform 180ms ease, box-shadow 180ms ease",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: cardThemeColor,
          zIndex: 3,
        }}
      />

      <div
        style={{
          padding: "10px 10px 0",
          position: "relative",
        }}
      >
        <div className="preparedItemCardThumb">
          <ProductThumb
            imageUrl={preparedItem?.image_url || null}
            title={title}
          />
        </div>

        <div
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            right: 16,
            zIndex: 5,
            display: "flex",
            alignItems: "flex-start",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              maxWidth: "100%",
              padding: "5px 9px",
              borderRadius: 999,
              border: `1px solid ${cardThemeColor}`,
              background: cardThemeColor,
              color: "#FFFFFF",
              fontSize: 9.5,
              fontWeight: 950,
              lineHeight: 1.1,
              whiteSpace: "nowrap",
              boxShadow: `0 5px 14px ${alpha(cardThemeColor, 0.2)}`,
            }}
          >
            Entrega inmediata
          </span>
        </div>
      </div>

      <div
        style={{
          padding: "10px 11px",
          display: "grid",
          gap: 8,
          alignContent: "start",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 9,
            alignItems: "flex-start",
          }}
        >
          <div
            title={title}
            style={{
              minWidth: 0,
              color: theme.palette.text.primary,
              fontSize: 13.5,
              fontWeight: 900,
              lineHeight: 1.2,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {title}
          </div>

          <div
            style={{
              flexShrink: 0,
              paddingTop: 1,
              color: cardThemeColor,
              fontSize: 14,
              fontWeight: 950,
              lineHeight: 1.1,
              whiteSpace: "nowrap",
            }}
          >
            {currentPrice !== null ? money(currentPrice) : "—"}
          </div>
        </div>

        {configurationSummary.length > 0 ? (
          <div
            title={configurationSummary.join(" · ")}
            style={{
              padding: "7px 8px",
              borderRadius: 7,
              border: `1px solid ${softBorder}`,
              background: softSurface,
              color: theme.palette.text.secondary,
              fontSize: 10,
              fontWeight: 700,
              lineHeight: 1.35,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {configurationSummary.join(" · ")}
          </div>
        ) : null}

        {timeLabels.length > 0 ? (
          <div
            style={{
              padding: "8px 9px",
              borderRadius: 7,
              border: `1px solid ${softBorder}`,
              background: softSurfaceStrong,
              color: theme.palette.text.primary,
              fontSize: 10,
              fontWeight: 800,
              lineHeight: 1.35,
            }}
          >
            {timeLabels.join(" · ")}
          </div>
        ) : null}
      </div>

      <div style={{ padding: "0 11px 11px" }}>
        <PillButton
          tone={selected ? "default" : "orange"}
          themeColor={cardThemeColor}
          disabled={blocked}
          onClick={handleSelect}
          title={
            selected
              ? "Esta unidad ya está agregada"
              : "Agregar esta unidad"
          }
          style={{
            width: "100%",
            minHeight: 36,
            height: 36,
            borderRadius: 12,
            padding: "0 12px",
            fontSize: 12,
            ...(selected
              ? {
                  background: selectedSurface,
                  border: `1px solid ${softBorder}`,
                  color: cardThemeColor,
                }
              : {}),
          }}
        >
          {selected ? "Agregado" : "Agregar"}
        </PillButton>
      </div>
    </article>
  );
}