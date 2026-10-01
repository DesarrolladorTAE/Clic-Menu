// src/components/menu/shared/ProductVariantsModal.jsx

import React, { useMemo, useState } from "react";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import {
  Badge, Modal, PillButton, ProductThumb,
} from "../../../pages/public/publicMenu.ui";

import {
  AVAILABILITY_STATUS_UNAVAILABLE_BY_SCHEDULE,
  getAvailabilityData,
  getAvailabilityTone,
  getPublicAvailabilityPresentation,
  isAvailabilityBlocked,
  money,
  normalizePromotionPresentation,
} from "../../../hooks/public/publicMenu.utils";

import usePagination from "../../../hooks/usePagination";
import PaginationFooter from "../../common/PaginationFooter";

function isValidColor(color) {
  return /^#[0-9A-Fa-f]{6}$/.test(String(color || ""));
}

function getSafeThemeColor(themeColor) {
  return isValidColor(themeColor) ? themeColor : "#FF7A00";
}

const PAGE_SIZE = 4;

function resolveVariantImageUrl(variant) {
  const image = variant?.effective_image || variant?.variant_image || null;

  if (!image) {
    return null;
  }

  if (typeof image === "string") {
    return image.trim() || null;
  }

  if (typeof image !== "object") {
    return null;
  }

  return (
    image.thumbnail_public_url ||
    image.medium_public_url ||
    image.best_public_url ||
    image.public_url ||
    image.thumbnail_url ||
    image.medium_url ||
    image.url ||
    null
  );
}

function resolveVariantAvailability(product, variant) {
  const productAvailability = getAvailabilityData(product);
  const variantAvailability = getAvailabilityData(variant);

  const productStatus = String(productAvailability?.status || "").trim().toLowerCase();
  const productSource = String(productAvailability?.source || "").trim().toLowerCase();

  const productBlockedBySchedule =
    productStatus === AVAILABILITY_STATUS_UNAVAILABLE_BY_SCHEDULE ||
    (productSource === "schedule" && productAvailability?.is_available_now === false);

  if (productBlockedBySchedule) return productAvailability;

  return variantAvailability || productAvailability;
}

function getAvailabilityPalette(theme, tone) {
  const map = {
    ok: {
      bg: "rgba(46, 175, 46, 0.10)",
      bd: "rgba(46, 175, 46, 0.22)",
      fg: theme.palette.success.main,
    },
    warn: {
      bg: "rgba(245, 124, 0, 0.10)",
      bd: "rgba(245, 124, 0, 0.22)",
      fg: theme.palette.warning.main,
    },
    danger: {
      bg: "rgba(242, 100, 42, 0.10)",
      bd: "rgba(242, 100, 42, 0.22)",
      fg: theme.palette.error.main,
    },
    default: {
      bg: "rgba(63, 58, 82, 0.06)",
      bd: "rgba(63, 58, 82, 0.12)",
      fg: theme.palette.text.primary,
    },
  };

  return map[tone] || map.default;
}

function AvailabilityPill({ availability }) {
  const theme = useTheme();
  const a = getAvailabilityData(availability);

  if (!a) return null;

  const presentation = getPublicAvailabilityPresentation(a);
  const tone = getAvailabilityTone(a?.status);
  const ui = getAvailabilityPalette(theme, tone);

  if (!presentation.label) return null;

  return (
    <span
      title={presentation.caption}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "5px 10px",
        borderRadius: 999,
        border: `1px solid ${ui.bd}`,
        background: ui.bg,
        color: ui.fg,
        fontSize: 11,
        fontWeight: 900,
        lineHeight: 1.1,
        whiteSpace: "nowrap",
      }}
    >
      {presentation.label}
    </span>
  );
}

function AvailabilityNotice({ availability }) {
  const theme = useTheme();
  const a = getAvailabilityData(availability);

  if (!a) return null;

  const presentation = getPublicAvailabilityPresentation(a);
  if (!presentation.caption) return null;

  const blocked = isAvailabilityBlocked(a);

  return (
    <div
      style={{
        fontSize: 12,
        lineHeight: 1.45,
        padding: "9px 11px",
        borderRadius: 10,
        border: blocked
          ? `1px solid rgba(242, 100, 42, 0.22)`
          : `1px solid rgba(46, 175, 46, 0.18)`,
        background: blocked
          ? "rgba(242, 100, 42, 0.08)"
          : "rgba(46, 175, 46, 0.08)",
        color: blocked ? theme.palette.error.main : theme.palette.success.main,
        fontWeight: 800,
      }}
    >
      {presentation.caption}
    </div>
  );
}

function VariantCard({
  product,
  variant,
  index,
  canSelect,
  showSelectBtn,
  themeColor,
  onAddVariant,
  onClose,
}) {
  const theme = useTheme();
  const safeThemeColor = getSafeThemeColor(themeColor);
  const [hovered, setHovered] = useState(false);

  const variantAvailability = resolveVariantAvailability(product, variant);
  const variantBlocked = isAvailabilityBlocked(variantAvailability);

  const variantAvailabilityUi =
    getPublicAvailabilityPresentation(variantAvailability);

  const variantAvailabilityLabel =
    variantAvailabilityUi.label || "No disponible";

  const variantAvailabilityCaption =
    variantAvailabilityUi.caption || "No disponible";

  const variantName =
    variant?.display_name || variant?.name || `Variante ${index + 1}`;

  const variantImageUrl = resolveVariantImageUrl(variant);
  const variantPromotion = normalizePromotionPresentation(variant);

  const showPromotionalPrice =
    variantPromotion.hasActivePromotion &&
    !variantPromotion.isQuantityPromotion &&
    variantPromotion.hasImmediatePricePreview;

  const showPromotionBadge =
    variantPromotion.hasActivePromotion &&
    Boolean(variantPromotion.promotionLabel);

  const variantHasExtras =
    Array.isArray(variant?.modifier_groups) &&
    variant.modifier_groups.length > 0;

  const handleSelect = () => {
    if (!canSelect || variantBlocked) return;
    onAddVariant?.(product, variant);
    onClose?.();
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid",
        gridTemplateRows: "auto 1fr",
        gap: 10,
        height: "100%",
        padding: 10,
        borderRadius: 10,
        border: `1px solid ${
          variantBlocked
            ? "rgba(242, 100, 42, 0.18)"
            : "rgba(63, 58, 82, 0.10)"
        }`,
        background: "#FFFFFF",
        boxShadow: hovered
          ? `0 17px 34px ${safeThemeColor}24`
          : "0 10px 26px rgba(47,42,61,0.07)",
        opacity: variantBlocked ? 0.82 : 1,
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "transform 180ms ease, box-shadow 180ms ease",
      }}
    >
      <ProductThumb
        imageUrl={variantImageUrl}
        title={variantName}
        height={145}
        style={{
          background: "#FFFFFF",
          borderRadius: 7,
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 14,
          alignItems: "flex-start",
        }}
      >
        <div style={{ minWidth: 0, display: "grid", gap: 7 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 950,
              lineHeight: 1.2,
              color: theme.palette.text.primary,
            }}
          >
            {variantName}
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <AvailabilityPill availability={variantAvailability} />

            {showPromotionBadge ? (
              <span
                title={
                  variantPromotion.promotionName
                    ? `${variantPromotion.promotionName}: ${variantPromotion.promotionLabel}`
                    : variantPromotion.promotionLabel
                }
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  maxWidth: "100%",
                  padding: "5px 10px",
                  borderRadius: 999,
                  border: variantPromotion.isQuantityPromotion
                    ? "1px solid rgba(109, 40, 217, 0.22)"
                    : "1px solid rgba(15, 118, 110, 0.22)",
                  background: variantPromotion.isQuantityPromotion
                    ? "rgba(109, 40, 217, 0.09)"
                    : "rgba(15, 118, 110, 0.09)",
                  color: variantPromotion.isQuantityPromotion
                    ? "#6D28D9"
                    : "#0F766E",
                  fontSize: 11,
                  fontWeight: 950,
                  lineHeight: 1.1,
                  wordBreak: "break-word",
                }}
              >
                {variantPromotion.promotionLabel}
              </span>
            ) : null}

            {variantHasExtras ? (
              <Badge tone="warn" title="Esta variante tiene extras configurables">
                ✨ Con extras
              </Badge>
            ) : null}
          </div>

        </div>

        <div
          style={{
            display: "grid",
            justifyItems: "end",
            gap: 4,
            flexShrink: 0,
          }}
        >
          {showPromotionalPrice ? (
            <>
              <span
                style={{
                  color: theme.palette.text.secondary,
                  fontSize: 12,
                  fontWeight: 800,
                  lineHeight: 1,
                  textDecoration: "line-through",
                  textDecorationThickness: "1.5px",
                  whiteSpace: "nowrap",
                }}
              >
                {money(variantPromotion.originalPrice)}
              </span>

              <span
                style={{
                  color: safeThemeColor,
                  fontSize: 17,
                  fontWeight: 950,
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                }}
              >
                {money(variantPromotion.displayPrice)}
              </span>
            </>
          ) : (
            <span
              style={{
                color: safeThemeColor,
                fontSize: 16,
                fontWeight: 950,
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              {money(variantPromotion.originalPrice)}
            </span>
          )}
        </div>
      </div>

      <AvailabilityNotice availability={variantAvailability} />

      {variant?.description ? (
        <div
          style={{
            fontSize: 12,
            lineHeight: 1.45,
            color: theme.palette.text.secondary,
          }}
        >
          {variant.description}
        </div>
      ) : null}

      {showSelectBtn ? (
        <PillButton
          tone={variantBlocked ? "danger" : "orange"}
          themeColor={safeThemeColor}
          onClick={handleSelect}
          title={
            !canSelect
              ? "Solo lectura"
              : variantBlocked
                ? variantAvailabilityCaption
                : "Agregar variante a comanda"
          }
          disabled={!canSelect || variantBlocked}
        >
          {variantBlocked
            ? variantAvailabilityLabel
            : "➕ Seleccionar variante"}
        </PillButton>
      ) : null}
    </div>
  );
}

export default function ProductVariantsModal({
  open,
  product,
  canSelect = true,
  showSelectBtn = true,
  themeColor,
  onClose,
  onAddVariant,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const safeThemeColor = getSafeThemeColor(themeColor);

  const title = product?.display_name || product?.name || "Producto";

  const variants = useMemo(() => {
    return Array.isArray(product?.variants) ? product.variants : [];
  }, [product]);

  const {
    page,
    nextPage,
    prevPage,
    total,
    totalPages,
    startItem,
    endItem,
    hasPrev,
    hasNext,
    paginatedItems,
  } = usePagination({
    items: variants,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
    resetKey: `${product?.id || 0}:${open ? "open" : "closed"}`,
  });

  if (!product) {
    return null;
  }

  return (
    <Modal
      open={open}
      title={`Variantes: ${title}`}
      onClose={onClose}
      width="min(760px, 96vw)"
      maxHeight="min(88vh, 920px)"
      bodyPadding={16}
      backdropBlur={false}
      fullScreenMobile
      actions={
        <PillButton tone="default" onClick={onClose} title="Cerrar">
          Cerrar
        </PillButton>
      }
    >
      <div style={{ display: "grid", gap: 14 }}>
        <div
          style={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 12,
            background: theme.palette.background.paper,
            padding: 14,
            display: "grid",
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 950,
              color: theme.palette.text.primary,
              lineHeight: 1.2,
            }}
          >
            Elige una opción
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Badge tone="default">
              Variantes:{" "}
              <strong style={{ marginLeft: 6 }}>{variants.length}</strong>
            </Badge>

            {!canSelect ? <Badge tone="warn">Solo lectura</Badge> : null}
          </div>
        </div>

        {variants.length > 0 ? (
          <div style={{ display: "grid", gap: 12 }}>
            <div
              style={{
                display: "grid",
                gap: 12,
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : "repeat(2, minmax(0, 1fr))",
                alignItems: "stretch",
              }}
            >
              {paginatedItems.map((variant, index) => {
                const absoluteIndex = (page - 1) * PAGE_SIZE + index;

                return (
                  <VariantCard
                    key={variant?.id || absoluteIndex}
                    product={product}
                    variant={variant}
                    index={absoluteIndex}
                    canSelect={canSelect}
                    showSelectBtn={showSelectBtn}
                    themeColor={safeThemeColor}
                    onAddVariant={onAddVariant}
                    onClose={onClose}
                  />
                );
              })}
            </div>

            {total > PAGE_SIZE ? (
              <div
                style={{
                  overflow: "hidden",
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 12,
                }}
              >
                <PaginationFooter
                  page={page}
                  totalPages={totalPages}
                  startItem={startItem}
                  endItem={endItem}
                  total={total}
                  hasPrev={hasPrev}
                  hasNext={hasNext}
                  onPrev={prevPage}
                  onNext={nextPage}
                  itemLabel="variantes"
                />
              </div>
            ) : null}
          </div>
        ) : (
          <div
            style={{
              fontSize: 13,
              color: theme.palette.text.secondary,
              padding: 16,
              borderRadius: 12,
              border: "1px dashed rgba(63, 58, 82, 0.16)",
              background: "#FFFFFF",
            }}
          >
            Este producto no tiene variantes visibles en este canal.
          </div>
        )}
      </div>
    </Modal>
  );
}