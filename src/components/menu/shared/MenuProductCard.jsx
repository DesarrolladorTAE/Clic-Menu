// src/components/menu/shared/MenuProductCard.jsx
import React from "react";
import { useTheme } from "@mui/material/styles";
import {
  Badge,
  PillButton,
  ProductThumb,
} from "../../../pages/public/publicMenu.ui";
import {
  formatAvailabilityCaption,
  getAvailabilityData,
  getAvailabilityTone,
  hasAnyModifierGroups,
  isAvailabilityBlocked,
  money,
} from "../../../hooks/public/publicMenu.utils";

function isValidColor(color) {
  return /^#[0-9A-Fa-f]{6}$/.test(String(color || ""));
}

function getCardThemeColor(themeColor) {
  return isValidColor(themeColor) ? themeColor : "#FF7A00";
}

function getAvailabilityLabel(availability) {
  const status = String(availability?.status || "").toLowerCase();

  if (
    status.includes("available") ||
    status.includes("ok") ||
    status.includes("success") ||
    status.includes("disponible")
  ) {
    return "Disponible";
  }

  if (
    status.includes("sold") ||
    status.includes("out") ||
    status.includes("blocked") ||
    status.includes("agotado") ||
    status.includes("unavailable")
  ) {
    return "Agotado";
  }

  return isAvailabilityBlocked(availability) ? "Agotado" : "Disponible";
}

function getAvailabilityPalette(theme, tone) {
  const map = {
    ok: {
      bg: "rgba(46, 175, 46, 0.10)",
      bd: "rgba(46, 175, 46, 0.22)",
      fg: theme.palette.success.main,
    },
    warn: {
      bg: "rgba(255, 152, 0, 0.10)",
      bd: "rgba(255, 152, 0, 0.24)",
      fg: theme.palette.primary.dark,
    },
    danger: {
      bg: "rgba(63, 58, 82, 0.06)",
      bd: "rgba(63, 58, 82, 0.14)",
      fg: theme.palette.text.secondary,
    },
    default: {
      bg: "rgba(63, 58, 82, 0.05)",
      bd: "rgba(63, 58, 82, 0.12)",
      fg: theme.palette.text.secondary,
    },
  };

  return map[tone] || map.default;
}

function AvailabilityPill({ availability }) {
  const theme = useTheme();
  const a = getAvailabilityData(availability);

  if (!a) return null;

  const tone = getAvailabilityTone(a?.status);
  const ui = getAvailabilityPalette(theme, tone);

  return (
    <span
      title={formatAvailabilityCaption(a)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 9px",
        borderRadius: 999,
        border: `1px solid ${ui.bd}`,
        background: ui.bg,
        color: ui.fg,
        fontSize: 10,
        fontWeight: 800,
        lineHeight: 1.1,
        whiteSpace: "nowrap",
      }}
    >
      {getAvailabilityLabel(a)}
    </span>
  );
}

function AvailabilityNotice({ availability }) {
  const theme = useTheme();
  const a = getAvailabilityData(availability);

  if (!a) return null;

  const caption = formatAvailabilityCaption(a);
  if (!caption) return null;

  const blocked = isAvailabilityBlocked(a);

  return (
    <div
      style={{
        fontSize: 11,
        lineHeight: 1.35,
        padding: "7px 9px",
        borderRadius: 8,
        border: blocked
          ? "1px solid rgba(63, 58, 82, 0.14)"
          : "1px solid rgba(255, 152, 0, 0.22)",
        background: blocked
          ? "rgba(63, 58, 82, 0.04)"
          : "rgba(255, 152, 0, 0.07)",
        color: blocked ? theme.palette.text.secondary : theme.palette.primary.dark,
        fontWeight: 700,
      }}
    >
      {caption}
    </div>
  );
}

export default function MenuProductCard({
  product,
  categoryName = "Sin categoría",
  canSelect = true,
  showSelectBtn = true,
  themeColor,
  onAddSimple,
  onAddVariant,
  onOpenComposite,
  onOpenExtras,
  onOpenVariants,
}) {
  const theme = useTheme();
  const cardThemeColor = getCardThemeColor(themeColor);

  const title = product?.display_name || product?.name || "Producto";
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const hasVariants = variants.length > 0;

  const isComposite = String(product?.product_type || "simple") === "composite";
  const compositeItems = Array.isArray(product?.composite?.items)
    ? product.composite.items
    : [];

  const hasComposite = isComposite && compositeItems.length > 0;
  const hasExtras = hasAnyModifierGroups(product);

  const productAvailability = getAvailabilityData(product?.availability);
  const productBlocked = canSelect && isAvailabilityBlocked(productAvailability);

  const canChooseMain =
    showSelectBtn &&
    canSelect &&
    !productBlocked &&
    !(isComposite && hasComposite);

  const handleMainAction = () => {
    if (productBlocked || !canSelect) return;

    if (isComposite && hasComposite) {
      onOpenComposite?.(product);
      return;
    }

    onAddSimple?.(product);
  };

  const handleOpenVariants = () => {
    if (!hasVariants) return;
    onOpenVariants?.(product);
  };

  return (
    <article
      style={{
        position: "relative",
        border: `1px solid ${
          productBlocked ? "rgba(255, 152, 0, 0.25)" : theme.palette.divider
        }`,
        borderRadius: 10,
        background: "#FFFFFF",
        overflow: "hidden",
        boxShadow: "0 10px 26px rgba(47,42,61,0.05)",
        display: "grid",
        gridTemplateRows: "auto 1fr",
        minHeight: "100%",
        opacity: productBlocked ? 0.86 : 1,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: productBlocked
            ? "rgba(63,58,82,0.12)"
            : cardThemeColor,
        }}
      />

      <div style={{ padding: "12px 12px 8px", position: "relative" }}>
        <ProductThumb imageUrl={product?.image_url || null} title={title} />

        <div
          style={{
            position: "absolute",
            top: 18,
            left: 18,
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            maxWidth: "calc(100% - 36px)",
          }}
        >
          {isComposite ? (
            <Badge tone="dark" title="Producto compuesto">
              Combo
            </Badge>
          ) : hasVariants ? (
            <Badge tone="default" title="Producto con variantes">
              {variants.length} opciones
            </Badge>
          ) : null}
        </div>
      </div>

      <div
        style={{
          padding: "8px 12px 12px",
          display: "grid",
          gap: 9,
          alignContent: "space-between",
        }}
      >
        <div style={{ display: "grid", gap: 7 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                minWidth: 0,
                fontWeight: 800,
                fontSize: 13,
                lineHeight: 1.18,
                color: theme.palette.text.primary,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
              title={title}
            >
              {title}
            </div>

            <div
              style={{
                fontWeight: 900,
                fontSize: 13,
                lineHeight: 1,
                color: cardThemeColor,
                whiteSpace: "nowrap",
                paddingTop: 2,
              }}
            >
              {money(product?.price)}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 6,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                maxWidth: "100%",
                padding: "4px 9px",
                borderRadius: 999,
                background: "#FFFFFF",
                border: `1px solid ${theme.palette.divider}`,
                color: theme.palette.text.secondary,
                fontSize: 10,
                fontWeight: 800,
                lineHeight: 1.1,
              }}
              title={categoryName}
            >
              {categoryName}
            </span>

            <AvailabilityPill availability={productAvailability} />
          </div>

          <AvailabilityNotice availability={productAvailability} />

          {hasComposite ? (
            <div
              style={{
                fontSize: 10.5,
                lineHeight: 1.35,
                padding: "8px 9px",
                borderRadius: 8,
                background: "#FFFFFF",
                border: `1px solid ${theme.palette.divider}`,
                color: theme.palette.text.secondary,
                fontWeight: 700,
              }}
            >
              Incluye <strong>{compositeItems.length}</strong> componente(s).
            </div>
          ) : null}

          {hasExtras ? (
            <div
              style={{
                fontSize: 10.5,
                lineHeight: 1.35,
                padding: "8px 9px",
                borderRadius: 8,
                background: "rgba(255, 152, 0, 0.07)",
                border: "1px solid rgba(255, 152, 0, 0.20)",
                color: "#A75A00",
                fontWeight: 750,
              }}
            >
              ✨ Extras disponibles
            </div>
          ) : null}
        </div>

        <div style={{ display: "grid", gap: 7 }}>
          {showSelectBtn ? (
            <PillButton
              tone={productBlocked ? "danger" : "orange"}
              themeColor={cardThemeColor}
              onClick={handleMainAction}
              title={
                !canSelect
                  ? "Solo lectura"
                  : productBlocked
                  ? formatAvailabilityCaption(productAvailability) || "No disponible"
                  : isComposite && hasComposite
                  ? "Configurar producto compuesto"
                  : hasVariants
                  ? "Agregar producto base a comanda"
                  : "Agregar a comanda"
              }
              disabled={!canSelect || productBlocked}
            >
              {productBlocked
                ? "No disponible"
                : isComposite && hasComposite
                ? "Configurar"
                : "＋ Seleccionar"}
            </PillButton>
          ) : null}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                hasVariants && hasExtras ? "1fr 1fr" : "1fr",
              gap: 7,
            }}
          >
            {hasVariants && !isComposite ? (
              <PillButton
                tone="default"
                onClick={handleOpenVariants}
                title="Ver variantes disponibles"
                disabled={!onOpenVariants}
              >
                Variantes ({variants.length})
              </PillButton>
            ) : null}

            {hasExtras ? (
              <PillButton
                tone="soft"
                onClick={() => onOpenExtras?.(product)}
                title="Ver extras disponibles de este producto"
              >
                Extras
              </PillButton>
            ) : null}
          </div>

          {canChooseMain ? (
            <span
              style={{
                fontSize: 10,
                color: theme.palette.text.secondary,
                textAlign: "center",
                fontWeight: 700,
              }}
            >
              Se agregará el producto base a la comanda
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}