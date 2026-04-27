import React, { useMemo } from "react";
import { useTheme } from "@mui/material/styles";
import { Badge, Modal, PillButton } from "../../../pages/public/publicMenu.ui";
import {
  formatAvailabilityCaption,
  formatAvailabilityShortLabel,
  getAvailabilityData,
  getAvailabilityTone,
  isAvailabilityBlocked,
  money,
} from "../../../hooks/public/publicMenu.utils";

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

  const tone = getAvailabilityTone(a?.status);
  const ui = getAvailabilityPalette(theme, tone);

  return (
    <span
      title={formatAvailabilityCaption(a)}
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
      {formatAvailabilityShortLabel(a)}
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
        fontSize: 12,
        lineHeight: 1.45,
        padding: "9px 11px",
        borderRadius: 14,
        border: blocked
          ? `1px solid rgba(242, 100, 42, 0.22)`
          : `1px solid rgba(46, 175, 46, 0.18)`,
        background: blocked ? "rgba(242, 100, 42, 0.08)" : "rgba(46, 175, 46, 0.08)",
        color: blocked ? theme.palette.error.main : theme.palette.success.main,
        fontWeight: 800,
      }}
    >
      {caption}
    </div>
  );
}

function VariantCard({
  product,
  variant,
  index,
  canSelect,
  showSelectBtn,
  onAddVariant,
  onClose,
}) {
  const theme = useTheme();

  const variantAvailability = getAvailabilityData(variant?.availability);
  const variantBlocked = canSelect && isAvailabilityBlocked(variantAvailability);

  const variantName =
    variant?.name || variant?.display_name || `Variante ${index + 1}`;

  const variantHasExtras =
    Array.isArray(variant?.modifier_groups) && variant.modifier_groups.length > 0;

  const handleSelect = () => {
    if (!canSelect || variantBlocked) return;
    onAddVariant?.(product, variant);
    onClose?.();
  };

  return (
    <div
      style={{
        display: "grid",
        gap: 10,
        padding: 14,
        borderRadius: 20,
        border: `1px solid ${
          variantBlocked
            ? "rgba(242, 100, 42, 0.18)"
            : "rgba(63, 58, 82, 0.10)"
        }`,
        background: "#FFFFFF",
        boxShadow: "0 12px 28px rgba(63, 58, 82, 0.06)",
        opacity: variantBlocked ? 0.82 : 1,
      }}
    >
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

            {variantHasExtras ? (
              <Badge tone="warn" title="Esta variante tiene extras configurables">
                ✨ Con extras
              </Badge>
            ) : null}
          </div>
        </div>

        <div
          style={{
            fontSize: 16,
            fontWeight: 950,
            color: theme.palette.primary.main,
            whiteSpace: "nowrap",
          }}
        >
          {money(variant?.price)}
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
          onClick={handleSelect}
          title={
            !canSelect
              ? "Solo lectura"
              : variantBlocked
              ? formatAvailabilityCaption(variantAvailability) || "No disponible"
              : "Agregar variante a comanda"
          }
          disabled={!canSelect || variantBlocked}
        >
          {variantBlocked ? "🚫 No disponible" : "➕ Seleccionar variante"}
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
  onClose,
  onAddVariant,
}) {
  const theme = useTheme();

  const title = product?.display_name || product?.name || "Producto";

  const variants = useMemo(() => {
    return Array.isArray(product?.variants) ? product.variants : [];
  }, [product]);

  if (!product) return null;

  return (
    <Modal
      open={open}
      title={`Variantes: ${title}`}
      onClose={onClose}
      width="min(760px, 96vw)"
      maxHeight="min(88vh, 920px)"
      bodyPadding={16}
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
            borderRadius: 20,
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

          <div
            style={{
              fontSize: 13,
              color: theme.palette.text.secondary,
              lineHeight: 1.5,
            }}
          >
            Las variantes se muestran aquí para no modificar el tamaño de las tarjetas del menú.
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Badge tone="default">
              Variantes: <strong style={{ marginLeft: 6 }}>{variants.length}</strong>
            </Badge>

            {!canSelect ? (
              <Badge tone="warn">Solo lectura</Badge>
            ) : null}
          </div>
        </div>

        {variants.length > 0 ? (
          <div
            style={{
              display: "grid",
              gap: 12,
              gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))",
            }}
          >
            {variants.map((variant, index) => (
              <VariantCard
                key={variant?.id || index}
                product={product}
                variant={variant}
                index={index}
                canSelect={canSelect}
                showSelectBtn={showSelectBtn}
                onAddVariant={onAddVariant}
                onClose={onClose}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              fontSize: 13,
              color: theme.palette.text.secondary,
              padding: 16,
              borderRadius: 18,
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