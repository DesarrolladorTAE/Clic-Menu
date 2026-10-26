//src/components/menu/shared/menu-sets/MenuSetStageProductCard.jsx
import React, { useState } from "react";
import {
  Box, Chip, Dialog, DialogContent, DialogTitle, Divider, IconButton,
  Stack, Typography, useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import StickyNote2OutlinedIcon from "@mui/icons-material/StickyNote2Outlined";

import { PillButton, ProductThumb } from "../../../../pages/public/publicMenu.ui";
import { normalizeMenuSetOption } from "../../../../hooks/menu/menu-sets/menuSet.utils";

function getSafeColor(theme, color) {
  if (/^#[0-9A-Fa-f]{6}$/.test(String(color || ""))) return color;

  const primary = theme.palette.primary.main;
  return /^#[0-9A-Fa-f]{6}$/.test(primary) ? primary : "#FF7A00";
}

function getAvailabilityChipSx(theme, { isSelected, unavailable, requiresPrepared, isAvailable }) {
  if (isSelected) {
    return {
      bgcolor: "rgba(46,175,46,0.10)",
      borderColor: "rgba(46,175,46,0.22)",
      color: theme.palette.success.dark,
    };
  }

  if (unavailable) {
    return {
      bgcolor: "rgba(239,68,68,0.08)",
      borderColor: "rgba(239,68,68,0.18)",
      color: theme.palette.error.dark,
    };
  }

  if (requiresPrepared) {
    return {
      bgcolor: "rgba(255,152,0,0.10)",
      borderColor: "rgba(255,152,0,0.24)",
      color: theme.palette.warning.dark,
    };
  }

  if (isAvailable === true) {
    return {
      bgcolor: "rgba(46,175,46,0.10)",
      borderColor: "rgba(46,175,46,0.22)",
      color: theme.palette.success.dark,
    };
  }

  return {
    bgcolor: "rgba(63,58,82,0.05)",
    borderColor: "rgba(63,58,82,0.12)",
    color: theme.palette.text.secondary,
  };
}

export default function MenuSetStageProductCard({
  option,
  selected = false,
  selection = null,
  canSelect = true,
  themeColor,
  onSelect,
  onRemove,
  onOpenVariants,
  onViewDetails,
  onConfigure,
  onNotes,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const color = getSafeColor(theme, themeColor);
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (!option) return null;

  const product = option.kind === "menu_set_option" && "menuSetProductId" in option
    ? option : normalizeMenuSetOption(option);

  const title = product.name || "Producto";
  const description = product.description || "";
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const modifierGroups = Array.isArray(product.modifierGroups) ? product.modifierGroups : [];
  const compositeItems = Array.isArray(product.composite?.items) ? product.composite.items : [];

  const hasVariants = variants.length > 0;
  const hasExtras = modifierGroups.length > 0 || variants.some(
    (variant) => Array.isArray(variant?.modifier_groups) && variant.modifier_groups.length > 0,
  );
  const hasComponents = product.productType === "composite" && compositeItems.length > 0;

  const availability = product.availability || {};
  const requiresPrepared = availability.requiresPreparedSelection === true;
  const preparedChoices = Array.isArray(availability.preparedChoices)
    ? availability.preparedChoices : [];

  const hasPreparedAlternative = requiresPrepared && preparedChoices.length > 0;
  const unavailable = product.isActive === false
    || (availability.isAvailable === false && !hasPreparedAlternative);

  const isSelected = selected || selection !== null;
  const canChoose = canSelect && !unavailable && typeof onSelect === "function";
  const canRemove = canSelect && typeof onRemove === "function";
  const blocked = isSelected ? !canRemove : !canChoose;
  const showVariantsButton = canSelect && hasVariants && typeof onOpenVariants === "function";
  const variantsBlocked = unavailable || requiresPrepared;

  const statusLabel = isSelected
    ? "Seleccionado"
    : unavailable
      ? "No disponible"
      : requiresPrepared
        ? "Preparación disponible"
        : availability.isAvailable === true ? "Disponible" : "Consultar";

  const statusColor = unavailable ? theme.palette.text.secondary : color;

  const availabilityChipSx = getAvailabilityChipSx(theme, {
    isSelected,
    unavailable,
    requiresPrepared,
    isAvailable: availability.isAvailable,
  });

  const openDetails = () => {
    if (typeof onViewDetails === "function") {
      onViewDetails(product);
      return;
    }

    setDetailsOpen(true);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
  };

  const handleSelection = () => {
    if (blocked || !canSelect) return;

    if (isSelected) {
      onRemove(product);
      return;
    }

    // Selecciona el producto original. Las variantes tienen su propio botón.
    onSelect(product);
  };

  const handleOpenVariants = () => {
    if (!showVariantsButton || variantsBlocked) return;
    onOpenVariants(product);
  };

  return (
    <>
      <article
        className={`cm-set-stage-product-card${isSelected ? " is-selected" : ""}`}
        style={{
          "--cm-stage-product-color": color,
          "--cm-stage-product-soft": alpha(color, 0.07),
          "--cm-stage-product-border": alpha(color, 0.2),
          "--cm-stage-product-shadow": alpha(color, 0.13),
          "--cm-stage-product-text": theme.palette.text.primary,
          "--cm-stage-product-muted": theme.palette.text.secondary,
          "--cm-stage-product-surface": theme.palette.background.paper,
          opacity: unavailable ? 0.83 : 1,
        }}
      >
        <style>
          {`
            .cm-set-stage-product-card,
            .cm-set-stage-product-card * {
              box-sizing: border-box;
            }

            .cm-set-stage-product-card {
              display: grid;
              grid-template-rows: auto minmax(0, 1fr) auto;
              flex: 1 1 auto;
              width: 100%;
              min-width: 0;
              max-width: 100%;
              height: 100%;
              padding: 10px;
              border: 1px solid var(--cm-stage-product-border);
              border-top: 3px solid var(--cm-stage-product-color);
              border-radius: 11px;
              background: var(--cm-stage-product-surface);
              box-shadow: 0 8px 22px rgba(47,42,61,0.055);
              overflow: hidden;
              transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
            }

            .cm-set-stage-product-card:hover {
              transform: translateY(-3px);
              box-shadow: 0 15px 30px var(--cm-stage-product-shadow);
            }

            .cm-set-stage-product-card.is-selected {
              border-color: var(--cm-stage-product-color);
              background: var(--cm-stage-product-surface);
            }

            .cm-set-stage-product-image {
              position: relative;
              isolation: isolate;
              width: 100%;
              min-width: 0;
              max-width: 100%;
              overflow: visible;
            }

            .cm-set-stage-product-image-media {
              position: relative;
              z-index: 0;
              isolation: isolate;
              width: 100%;
              min-width: 0;
              max-width: 100%;
              aspect-ratio: 4 / 3;
              overflow: hidden;
              border-radius: 9px;
              background: var(--cm-stage-product-surface);
            }

            .cm-set-stage-product-image-media > * {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 100% !important;
              height: 100% !important;
              min-width: 0;
              max-width: 100%;
              max-height: 100%;
              border-radius: 9px !important;
              overflow: hidden;
            }

            .cm-set-stage-product-image-media img,
            .cm-set-stage-product-image-media picture img {
              display: block;
              width: 100% !important;
              height: 100% !important;
              max-width: 100% !important;
              max-height: 100% !important;
              object-fit: contain !important;
              object-position: center !important;
            }

            .cm-set-stage-product-image-media [style*="background-image"] {
              background-size: contain !important;
              background-repeat: no-repeat !important;
              background-position: center !important;
            }

            .cm-set-stage-product-status {
              position: absolute;
              top: 8px;
              left: 8px;
              z-index: 20;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              gap: 4px;
              width: max-content;
              max-width: calc(100% - 70px);
              padding: 5px 8px;
              border: 1px solid var(--cm-stage-product-status-border);
              border-radius: 999px;
              background: rgba(255,255,255,0.97);
              color: var(--cm-stage-product-status-color);
              font-size: 10px;
              font-weight: 900;
              line-height: 1.2;
              white-space: normal;
              overflow-wrap: anywhere;
              text-align: center;
              box-shadow: 0 4px 12px rgba(0,0,0,0.08);
              pointer-events: none;
            }

            .cm-set-stage-product-status svg { flex-shrink: 0; }

            .cm-set-stage-product-body {
              display: grid;
              align-content: start;
              gap: 7px;
              padding: 11px 2px 13px;
              min-width: 0;
              max-width: 100%;
            }

            .cm-set-stage-product-name {
              margin: 0;
              color: var(--cm-stage-product-text);
              font-size: 14px;
              font-weight: 900;
              line-height: 1.3;
              min-height: 18px;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
              overflow-wrap: anywhere;
            }

            .cm-set-stage-product-description {
              margin: 0;
              color: var(--cm-stage-product-muted);
              font-size: 11.5px;
              line-height: 1.45;
              min-height: 33px;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }

            .cm-set-stage-product-tags {
              display: flex;
              align-items: center;
              flex-wrap: wrap;
              gap: 6px;
              min-width: 0;
            }

            .cm-set-stage-product-tag {
              display: inline-flex;
              align-items: center;
              max-width: 100%;
              padding: 4px 8px;
              border: 1px solid var(--cm-stage-product-border);
              border-radius: 999px;
              background: var(--cm-stage-product-soft);
              color: var(--cm-stage-product-muted);
              font-size: 10px;
              font-weight: 800;
              line-height: 1.2;
              overflow-wrap: anywhere;
            }

            .cm-set-stage-product-actions {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(min(100%, 138px), 1fr));
              align-items: stretch;
              gap: 8px;
              width: 100%;
              min-width: 0;
              padding: 0 2px 1px;
            }

            .cm-set-stage-product-actions.is-read-only {
              grid-template-columns: minmax(0, 1fr);
            }

            .cm-set-stage-product-actions > button {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              width: 100%;
              min-width: 0 !important;
              max-width: 100%;
              min-height: 39px;
              height: auto;
              padding: 9px 8px;
              white-space: normal !important;
              overflow-wrap: anywhere;
              line-height: 1.35;
              text-align: center;
              font-size: 12px;
            }

            .cm-set-stage-product-variants-action {
              grid-column: 1 / -1;
              width: 100%;
              min-width: 0;
            }

            .cm-set-stage-product-variants-action > button {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              width: 100%;
              min-width: 0;
              max-width: 100%;
              min-height: 39px;
              height: auto;
              padding: 9px 8px;
              white-space: normal;
              line-height: 1.35;
              text-align: center;
              font-size: 12px;
            }

            /*
             * La fila de edición existe también cuando la tarjeta
             * no está seleccionada, para reservar la misma altura.
             */
            .cm-set-stage-product-edit-actions {
              grid-column: 1 / -1;
              display: flex;
              justify-content: flex-end;
              align-items: center;
              gap: 8px;
              width: 100%;
              min-width: 0;
              min-height: 40px;
              padding: 0 2px;
            }

            .cm-set-stage-product-edit-actions > button {
              flex: 0 0 40px;
              width: 40px;
              height: 40px;
            }

            @media (max-width: 639px) {
              .cm-set-stage-product-card { padding: 9px; }
              .cm-set-stage-product-name { font-size: 13.5px; }
              .cm-set-stage-product-image-media { aspect-ratio: 4 / 3; }
            }

            @media (max-width: 359px) {
              .cm-set-stage-product-actions { grid-template-columns: minmax(0, 1fr); }
              .cm-set-stage-product-actions > button,
              .cm-set-stage-product-variants-action > button { font-size: 11.5px; }
            }
          `}
        </style>

        <div className="cm-set-stage-product-image">
          <div className="cm-set-stage-product-image-media">
            <ProductThumb imageUrl={product.image || null} title={title} height={220} />
          </div>

          <span
            className="cm-set-stage-product-status"
            title={availability.reason || statusLabel}
            style={{
              "--cm-stage-product-status-color": statusColor,
              "--cm-stage-product-status-border": alpha(statusColor, 0.2),
            }}
          >
            {isSelected ? <CheckCircleRoundedIcon sx={{ fontSize: 13 }} /> : null}
            {statusLabel}
          </span>

          <IconButton
            type="button"
            onClick={openDetails}
            title={`Ver detalles de ${title}`}
            aria-label={`Ver detalles de ${title}`}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 21,
              width: 34,
              height: 34,
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.97)",
              color: theme.palette.text.primary,
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              "&:hover": {
                bgcolor: alpha(color, 0.08),
                color,
                borderColor: alpha(color, 0.3),
              },
              "&:focus-visible": {
                outline: `2px solid ${color}`,
                outlineOffset: 2,
              },
            }}
          >
            <InfoOutlinedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </div>

        <div className="cm-set-stage-product-body">
          <h4 className="cm-set-stage-product-name" title={title}>{title}</h4>

          <p className="cm-set-stage-product-description" title={description}>
            {description || "Forma parte de este menú."}
          </p>

          {hasVariants || hasExtras || hasComponents ? (
            <div className="cm-set-stage-product-tags">
              {hasVariants ? (
                <span className="cm-set-stage-product-tag">
                  {variants.length} {variants.length === 1 ? "variante" : "variantes"}
                </span>
              ) : null}

              {hasExtras ? (
                <span className="cm-set-stage-product-tag">Con extras</span>
              ) : null}

              {hasComponents ? (
                <span className="cm-set-stage-product-tag">Con componentes</span>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className={`cm-set-stage-product-actions${!canSelect ? " is-read-only" : ""}`}>
          {canSelect ? (
            <PillButton
              tone={isSelected ? "soft" : "orange"}
              themeColor={color}
              disabled={blocked}
              onClick={handleSelection}
              title={
                unavailable
                  ? availability.reason || "Producto no disponible"
                  : isSelected
                    ? "Quitar este producto de la etapa"
                    : requiresPrepared
                      ? "Elegir una preparación disponible"
                      : "Seleccionar el producto original"
              }
            >
              {isSelected
                ? "Quitar"
                : unavailable
                  ? "No disponible"
                  : requiresPrepared
                    ? "Elegir"
                    : "Seleccionar"}
            </PillButton>
          ) : null}

          {showVariantsButton ? (
            <div className="cm-set-stage-product-variants-action">
              <PillButton
                tone="default"
                themeColor={color}
                disabled={variantsBlocked}
                onClick={handleOpenVariants}
                title={
                  requiresPrepared
                    ? "Esta preparación conserva su configuración original"
                    : unavailable
                      ? availability.reason || "Producto no disponible"
                      : `Elegir una de las ${variants.length} variantes de ${title}`
                }
              >
                Variantes ({variants.length})
              </PillButton>
            </div>
          ) : null}

          {canSelect ? (
            <div className="cm-set-stage-product-edit-actions">
              {isSelected && typeof onConfigure === "function" ? (
                <IconButton
                  type="button"
                  onClick={() => onConfigure(product)}
                  title="Editar configuración"
                  aria-label={`Editar configuración de ${title}`}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    color: "text.primary",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                    "&:hover": {
                      bgcolor: alpha(color, 0.08),
                      borderColor: color,
                      color,
                    },
                    "&:focus-visible": {
                      outline: `2px solid ${color}`,
                      outlineOffset: 2,
                    },
                  }}
                >
                  <EditRoundedIcon sx={{ fontSize: 19 }} />
                </IconButton>
              ) : null}

              {isSelected && typeof onNotes === "function" ? (
                <IconButton
                  type="button"
                  onClick={() => onNotes(product)}
                  title="Agregar o editar nota"
                  aria-label={`Agregar o editar nota de ${title}`}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    color: "text.primary",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                    "&:hover": {
                      bgcolor: alpha(color, 0.08),
                      borderColor: color,
                      color,
                    },
                    "&:focus-visible": {
                      outline: `2px solid ${color}`,
                      outlineOffset: 2,
                    },
                  }}
                >
                  <StickyNote2OutlinedIcon sx={{ fontSize: 20 }} />
                </IconButton>
              ) : null}
            </div>
          ) : null}
        </div>
      </article>

      {/* Modal de información con el diseño compartido de ProductInfoModal */}
      <Dialog
        open={detailsOpen}
        onClose={closeDetails}
        fullScreen={isMobile}
        maxWidth={false}
        aria-labelledby="cm-set-stage-product-dialog-title"
        slotProps={{
          paper: {
            sx: {
              width: { xs: "100%", sm: "min(960px, calc(100vw - 48px))" },
              maxWidth: { xs: "100%", sm: "960px" },
              height: { xs: "100dvh", sm: "min(530px, calc(100dvh - 48px))" },
              maxHeight: { xs: "100dvh", sm: "calc(100dvh - 48px)" },
              m: { xs: 0, sm: 2 },
              borderRadius: { xs: 0, sm: 2 },
              overflow: "hidden",
              bgcolor: "background.paper",
              display: "flex",
              flexDirection: "column",
            },
          },
        }}
      >
        <DialogTitle
          id="cm-set-stage-product-dialog-title"
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            bgcolor: "#111111",
            color: "#fff",
            borderBottom: `3px solid ${color}`,
            flexShrink: 0,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: 20, sm: 24 },
                  lineHeight: 1.2,
                  color: "#fff",
                  wordBreak: "break-word",
                }}
              >
                {title}
              </Typography>

              <Typography
                sx={{
                  mt: 0.45,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.72)",
                  lineHeight: 1.4,
                }}
              >
                Información del producto
              </Typography>
            </Box>

            <IconButton
              onClick={closeDetails}
              aria-label="Cerrar información del producto"
              sx={{
                width: 40,
                height: 40,
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 1.5,
                flexShrink: 0,
                "&:hover": { bgcolor: "rgba(255,255,255,0.16)" },
              }}
            >
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent
          sx={{
            p: 0,
            bgcolor: "background.default",
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <Box
            sx={{
              width: "100%",
              minHeight: "100%",
              px: { xs: 1.5, sm: 2.5 },
              pb: { xs: 1.5, sm: 2.5 },
              pt: 0,
              boxSizing: "border-box",
            }}
          >
            <Box
              sx={{
                width: "100%",
                minHeight: "100%",
                p: { xs: 1.5, sm: 2 },
                bgcolor: "background.paper",
                border: "1px solid",
                borderTop: "none",
                borderColor: "divider",
                borderRadius: { xs: "0 0 6px 6px", sm: "0 0 8px 8px" },
                boxShadow: "0 10px 30px rgba(47,42,61,0.05)",
                boxSizing: "border-box",
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "minmax(0, 44%) 1px minmax(0, 56%)",
                },
                columnGap: { xs: 0, md: 2.5 },
                rowGap: { xs: 2, md: 0 },
                alignItems: "stretch",
              }}
            >
              {/* Imagen del producto */}
              <Box
                sx={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  alignSelf: "start",
                  minWidth: 0,
                  p: 1,
                  bgcolor: "#FFFFFF",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1.5,
                  overflow: "hidden",
                  boxSizing: "border-box",
                  "& img": {
                    display: "block",
                    width: "100% !important",
                    height: "100% !important",
                    maxWidth: "100% !important",
                    maxHeight: "100% !important",
                    objectFit: "contain !important",
                    objectPosition: "center !important",
                  },
                  '& [style*="background-image"]': {
                    backgroundSize: "contain !important",
                    backgroundRepeat: "no-repeat !important",
                    backgroundPosition: "center !important",
                  },
                }}
              >
                <ProductThumb
                  imageUrl={product.image || null}
                  title={title}
                  height="100%"
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    borderRadius: 8,
                    background: "#FFFFFF",
                  }}
                />
              </Box>

              {/* Separador de escritorio */}
              <Box
                aria-hidden="true"
                sx={{
                  display: { xs: "none", md: "block" },
                  width: "1px",
                  height: "100%",
                  alignSelf: "stretch",
                  bgcolor: "divider",
                }}
              />

              {/* Separador de móvil y tableta */}
              <Box
                aria-hidden="true"
                sx={{
                  display: { xs: "block", md: "none" },
                  width: "100%",
                  height: "1px",
                  bgcolor: "divider",
                }}
              />

              {/* Información del producto */}
              <Box
                sx={{
                  minWidth: 0,
                  px: { xs: 0.5, sm: 1, md: 0.5 },
                  py: { xs: 0.5, md: 1 },
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Stack spacing={2.25}>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 900,
                        color: "text.primary",
                        mb: 0.75,
                      }}
                    >
                      Descripción
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 14,
                        lineHeight: 1.65,
                        color: description ? "text.primary" : "text.secondary",
                        fontWeight: description ? 500 : 600,
                        whiteSpace: "pre-line",
                        wordBreak: "break-word",
                      }}
                    >
                      {description || "Este producto forma parte del menú seleccionado."}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 900,
                        color: "text.primary",
                        mb: 0.75,
                      }}
                    >
                      Características
                    </Typography>

                    <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                      {hasVariants ? (
                        <Chip
                          label={`${variants.length} ${variants.length === 1 ? "opción" : "opciones"}`}
                          size="small"
                          sx={{
                            height: 28,
                            px: 0.25,
                            bgcolor: "#111827",
                            color: "#fff",
                            fontSize: 12,
                            fontWeight: 800,
                          }}
                        />
                      ) : null}

                      {hasExtras ? (
                        <Chip
                          label="Con extras"
                          size="small"
                          sx={{
                            height: 28,
                            px: 0.25,
                            bgcolor: "#111827",
                            color: "#fff",
                            fontSize: 12,
                            fontWeight: 800,
                          }}
                        />
                      ) : null}

                      {hasComponents ? (
                        <Chip
                          label="Con componentes"
                          size="small"
                          sx={{
                            height: 28,
                            px: 0.25,
                            bgcolor: "#111827",
                            color: "#fff",
                            fontSize: 12,
                            fontWeight: 800,
                          }}
                        />
                      ) : null}

                      {!hasVariants && !hasExtras && !hasComponents ? (
                        <Typography sx={{ fontSize: 14, color: "text.secondary", lineHeight: 1.65 }}>
                          Producto del menú seleccionado.
                        </Typography>
                      ) : null}
                    </Stack>
                  </Box>

                  {hasVariants ? (
                    <>
                      <Divider />

                      <Box>
                        <Typography
                          sx={{
                            fontSize: 14,
                            fontWeight: 900,
                            color: "text.primary",
                            mb: 0.75,
                          }}
                        >
                          Variantes del producto
                        </Typography>

                        <Stack spacing={0.65}>
                          {variants.map((variant, index) => (
                            <Typography
                              key={variant?.id || index}
                              sx={{
                                fontSize: 13,
                                lineHeight: 1.6,
                                color: "text.secondary",
                                wordBreak: "break-word",
                              }}
                            >
                              • {variant?.display_name || variant?.name || `Variante ${index + 1}`}
                            </Typography>
                          ))}
                        </Stack>
                      </Box>
                    </>
                  ) : null}

                  {hasComponents ? (
                    <>
                      <Divider />

                      <Box>
                        <Typography
                          sx={{
                            fontSize: 14,
                            fontWeight: 900,
                            color: "text.primary",
                            mb: 0.75,
                          }}
                        >
                          Componentes
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: 13,
                            lineHeight: 1.6,
                            color: "text.secondary",
                          }}
                        >
                          Este producto incluye otros componentes que forman parte de su configuración.
                        </Typography>
                      </Box>
                    </>
                  ) : null}

                  {hasExtras ? (
                    <>
                      <Divider />

                      <Box>
                        <Typography
                          sx={{
                            fontSize: 14,
                            fontWeight: 900,
                            color: "text.primary",
                            mb: 0.75,
                          }}
                        >
                          Extras
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: 13,
                            lineHeight: 1.6,
                            color: "text.secondary",
                          }}
                        >
                          {canSelect
                            ? "Puedes personalizar este producto con sus extras disponibles."
                            : "Este producto cuenta con opciones de personalización mediante extras."}
                        </Typography>
                      </Box>
                    </>
                  ) : null}

                  <Divider />

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    spacing={1}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 900, color: "text.primary" }}>
                        Disponibilidad
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.25,
                          fontSize: 12,
                          color: "text.secondary",
                          lineHeight: 1.4,
                        }}
                      >
                        Estado actual del producto.
                      </Typography>
                    </Box>

                    <Chip
                      label={statusLabel}
                      size="small"
                      variant="outlined"
                      sx={{
                        height: "auto",
                        minHeight: 28,
                        maxWidth: "100%",
                        px: 0.25,
                        bgcolor: availabilityChipSx.bgcolor,
                        borderColor: availabilityChipSx.borderColor,
                        color: availabilityChipSx.color,
                        fontSize: 12,
                        fontWeight: 900,
                        "& .MuiChip-label": {
                          whiteSpace: "normal",
                          overflowWrap: "anywhere",
                          textAlign: "center",
                          py: 0.5,
                        },
                      }}
                    />
                  </Stack>

                  {unavailable && availability.reason ? (
                    <Typography
                      sx={{
                        fontSize: 12,
                        lineHeight: 1.5,
                        color: "text.secondary",
                        wordBreak: "break-word",
                      }}
                    >
                      {availability.reason}
                    </Typography>
                  ) : null}
                </Stack>
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}