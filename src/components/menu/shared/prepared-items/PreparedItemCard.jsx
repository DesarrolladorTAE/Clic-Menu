import React from "react";
import { useTheme } from "@mui/material/styles";

import { PillButton } from "../../../../pages/public/publicMenu.ui";
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
 * - publicMenu.ui.jsx, para reutilizar PillButton y conservar el diseño actual.
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
  if (Number.isFinite(directMinutes)) return Math.max(0, Math.floor(directMinutes));

  const elapsedSeconds = Number(preparedItem?.prepared_elapsed_seconds);
  if (Number.isFinite(elapsedSeconds)) return Math.max(0, Math.floor(elapsedSeconds / 60));

  return null;
}

function getExpiresInMinutes(preparedItem) {
  const expiresAt = Date.parse(String(preparedItem?.expires_at || ""));

  if (Number.isFinite(expiresAt)) {
    return Math.max(0, Math.ceil((expiresAt - Date.now()) / 60000));
  }

  const directMinutes = Number(preparedItem?.expires_in_minutes);
  if (Number.isFinite(directMinutes)) return Math.max(0, Math.ceil(directMinutes));

  const expiresInSeconds = Number(preparedItem?.expires_in_seconds);
  if (Number.isFinite(expiresInSeconds)) return Math.max(0, Math.ceil(expiresInSeconds / 60));

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
  const cardThemeColor = getCardThemeColor(theme, themeColor);

  const title = getPreparedItemDisplayName(preparedItem);
  const configurationSummary = getPreparedItemConfigurationSummary(preparedItem);
  const currentPrice = getPreparedItemCurrentPrice(preparedItem);

  const preparedAgoMinutes = getPreparedAgoMinutes(preparedItem);
  const expiresInMinutes = getExpiresInMinutes(preparedItem);

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
      style={{
        position: "relative",
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 10,
        background: selected ? theme.palette.action.hover : "#FFFFFF",
        overflow: "hidden",
        boxShadow: "0 10px 26px rgba(47,42,61,0.05)",
        display: "grid",
        gridTemplateRows: "1fr auto",
        minHeight: 210,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: selected ? theme.palette.divider : cardThemeColor,
        }}
      />

      <div
        style={{
          padding: "18px 14px 12px",
          display: "grid",
          gap: 10,
          alignContent: "start",
        }}
      >
        <div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "4px 9px",
              borderRadius: 999,
              border: `1px solid ${theme.palette.divider}`,
              background: "#FFFFFF",
              color: cardThemeColor,
              fontSize: 10,
              fontWeight: 900,
              lineHeight: 1.1,
            }}
          >
            Preparación rápida
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <div
            title={title}
            style={{
              minWidth: 0,
              color: theme.palette.text.primary,
              fontSize: 14,
              fontWeight: 900,
              lineHeight: 1.22,
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
            style={{
              padding: "9px 10px",
              borderRadius: 8,
              border: `1px solid ${theme.palette.divider}`,
              background: theme.palette.action.hover,
              color: theme.palette.text.secondary,
              fontSize: 11,
              fontWeight: 700,
              lineHeight: 1.45,
            }}
          >
            {configurationSummary.join(" · ")}
          </div>
        ) : null}

        {timeLabels.length > 0 ? (
          <div
            style={{
              color: theme.palette.text.secondary,
              fontSize: 10.5,
              fontWeight: 750,
              lineHeight: 1.35,
            }}
          >
            {timeLabels.join(" · ")}
          </div>
        ) : null}
      </div>

      <div style={{ padding: "0 14px 14px" }}>
        <PillButton
          tone={selected ? "default" : "orange"}
          themeColor={cardThemeColor}
          disabled={blocked}
          onClick={handleSelect}
          title={selected ? "Esta unidad ya está agregada" : "Agregar esta unidad"}
        >
          {selected ? "Agregado" : "Agregar"}
        </PillButton>
      </div>
    </article>
  );
}