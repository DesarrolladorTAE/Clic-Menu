import React from "react";

const DEFAULT_MODIFIER_THEME_COLOR = "#FF7A00";

export function isValidModifierColor(color) {
  return /^#[0-9A-Fa-f]{6}$/.test(String(color || ""));
}

export function getSafeModifierThemeColor(themeColor) {
  return isValidModifierColor(themeColor)
    ? String(themeColor)
    : DEFAULT_MODIFIER_THEME_COLOR;
}

export function modifierHexToRgba(hex, alpha = 1) {
  const safe = getSafeModifierThemeColor(hex).replace("#", "");
  const r = parseInt(safe.substring(0, 2), 16);
  const g = parseInt(safe.substring(2, 4), 16);
  const b = parseInt(safe.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function ModifierGroupCard({ themeColor, children, style = {} }) {
  const accentColor = getSafeModifierThemeColor(themeColor);

  return (
    <div
      style={{
        display: "grid",
        gap: 12,
        minWidth: 0,
        padding: 14,
        borderRadius: 10,
        border: `2px solid ${modifierHexToRgba(accentColor, 0.28)}`,
        borderTop: `3px solid ${accentColor}`,
        background: "#FFFFFF",
        boxShadow: `0 3px 12px ${modifierHexToRgba(accentColor, 0.055)}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function ModifierOptionCard({
  themeColor,
  selected = false,
  muted = false,
  children,
  style = {},
}) {
  const accentColor = getSafeModifierThemeColor(themeColor);

  return (
    <div
      style={{
        display: "grid",
        gap: 10,
        minWidth: 0,
        padding: 12,
        borderRadius: 10,
        border: `1px solid ${modifierHexToRgba(
          accentColor,
          selected ? 0.5 : 0.22,
        )}`,
        borderTop: `3px solid ${
          selected
            ? accentColor
            : modifierHexToRgba(accentColor, 0.55)
        }`,
        background: modifierHexToRgba(accentColor, selected ? 0.09 : 0.045),
        boxShadow: selected
          ? `0 3px 12px ${modifierHexToRgba(accentColor, 0.08)}`
          : "0 2px 8px rgba(47,42,61,0.035)",
        opacity: muted ? 0.72 : 1,
        transition:
          "border-color 160ms ease, background-color 160ms ease, box-shadow 160ms ease",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function ModifierOptionsArea({ children, style = {} }) {
  return (
    <div
      style={{
        display: "grid",
        gap: 10,
        minWidth: 0,
        padding: 0,
        border: "none",
        background: "transparent",
        boxShadow: "none",
        ...style,
      }}
    >
      {children}
    </div>
  );
}