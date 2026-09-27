// src/components/menu/shared/ProductInfoModal.jsx

import React from "react";
import {
  Box, Chip, Dialog, DialogContent, DialogTitle, Divider, IconButton, Stack,
  Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import { ProductThumb } from "../../../pages/public/publicMenu.ui";
import {
  getAvailabilityData,
  getAvailabilityTone,
  getPublicAvailabilityPresentation,
  money,
  normalizePromotionPresentation,
} from "../../../hooks/public/publicMenu.utils";

function isValidColor(color) {
  return /^#[0-9A-Fa-f]{6}$/.test(String(color || ""));
}

function getAvailabilityChipSx(theme, tone) {
  const map = {
    ok: {
      bgcolor: "rgba(46,175,46,0.10)",
      borderColor: "rgba(46,175,46,0.22)",
      color: theme.palette.success.dark,
    },
    warn: {
      bgcolor: "rgba(255,152,0,0.10)",
      borderColor: "rgba(255,152,0,0.24)",
      color: theme.palette.warning.dark,
    },
    danger: {
      bgcolor: "rgba(239,68,68,0.08)",
      borderColor: "rgba(239,68,68,0.18)",
      color: theme.palette.error.dark,
    },
    default: {
      bgcolor: "rgba(63,58,82,0.05)",
      borderColor: "rgba(63,58,82,0.12)",
      color: theme.palette.text.secondary,
    },
  };

  return map[tone] || map.default;
}

export default function ProductInfoModal({
  open,
  product,
  categoryName = "Sin categoría",
  themeColor,
  onClose,
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const accentColor = isValidColor(themeColor) ? themeColor : "#FF7A00";
  const title = product?.display_name || product?.name || "Producto";
  const description = String(product?.description || "").trim();
  const categoryLabel = String(categoryName || "").trim() || "Sin categoría";
  const imageUrl = product?.image_medium_url || product?.image_url || null;

  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const isComposite = String(product?.product_type || "simple") === "composite";

  const productKindLabel = isComposite
    ? "Combo"
    : variants.length > 0
      ? `${variants.length} ${variants.length === 1 ? "opción" : "opciones"}`
      : "";

  const promotion = normalizePromotionPresentation(product);

  const showPromotionalPrice =
    promotion.hasActivePromotion &&
    !promotion.isQuantityPromotion &&
    promotion.hasImmediatePricePreview;

  const showPromotionLabel =
    promotion.hasActivePromotion &&
    Boolean(promotion.promotionLabel);

  const productAvailability = getAvailabilityData(product);
  const availabilityPresentation =
    getPublicAvailabilityPresentation(productAvailability);

  const availabilityTone = getAvailabilityTone(productAvailability?.status);
  const availabilityChipSx = getAvailabilityChipSx(theme, availabilityTone);
  const availabilityLabel = availabilityPresentation?.label || "";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth={false}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100%", sm: "min(960px, calc(100vw - 48px))" },
            maxWidth: { xs: "100%", sm: "960px" },
            height: { xs: "100dvh", sm: "min(720px, calc(100dvh - 48px))" },
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
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          bgcolor: "#111111",
          color: "#fff",
          borderBottom: `3px solid ${accentColor}`,
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
            onClick={onClose}
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
            <Box
              sx={{
                height: { xs: 300, sm: 420, md: 520 },
                minWidth: 0,
                minHeight: 0,
                p: 1,
                bgcolor: "#fff",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1.5,
                overflow: "hidden",
              }}
            >
              <ProductThumb
                imageUrl={imageUrl}
                title={title}
                height="100%"
                style={{
                  border: "none",
                  borderRadius: 8,
                  background: "#FFFFFF",
                }}
              />
            </Box>

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

            <Box
              aria-hidden="true"
              sx={{
                display: { xs: "block", md: "none" },
                width: "100%",
                height: "1px",
                bgcolor: "divider",
              }}
            />

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
                    Precio
                  </Typography>

                  {showPromotionalPrice ? (
                    <Stack direction="row" spacing={1.25} alignItems="flex-end" useFlexGap flexWrap="wrap">
                      <Typography
                        sx={{
                          pb: 0.25,
                          fontSize: 15,
                          fontWeight: 700,
                          color: "text.secondary",
                          textDecoration: "line-through",
                          textDecorationThickness: "1.5px",
                        }}
                      >
                        {money(promotion.originalPrice)}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: { xs: 28, sm: 32 },
                          fontWeight: 950,
                          lineHeight: 1,
                          color: accentColor,
                          letterSpacing: "-0.03em",
                        }}
                      >
                        {money(promotion.displayPrice)}
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography
                      sx={{
                        fontSize: { xs: 28, sm: 32 },
                        fontWeight: 950,
                        lineHeight: 1,
                        color: accentColor,
                        letterSpacing: "-0.03em",
                      }}
                    >
                      {money(promotion.originalPrice)}
                    </Typography>
                  )}

                  {showPromotionLabel ? (
                    <Box
                      sx={{
                        mt: 1.5,
                        px: 1.4,
                        py: 1.15,
                        border: "1px solid",
                        borderColor: promotion.isQuantityPromotion
                          ? "rgba(109,40,217,0.18)"
                          : "rgba(15,118,110,0.18)",
                        borderRadius: 1.5,
                        bgcolor: promotion.isQuantityPromotion
                          ? "rgba(109,40,217,0.06)"
                          : "rgba(15,118,110,0.06)",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: "text.secondary",
                          mb: 0.25,
                        }}
                      >
                        Promoción
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: 900,
                          lineHeight: 1.4,
                          color: promotion.isQuantityPromotion ? "#6D28D9" : "#0F766E",
                        }}
                      >
                        {promotion.promotionLabel}
                      </Typography>
                    </Box>
                  ) : null}
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
                    Categoría
                  </Typography>

                  <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                    <Typography
                      sx={{
                        fontSize: 14,
                        lineHeight: 1.65,
                        color: "text.primary",
                        fontWeight: 500,
                        wordBreak: "break-word",
                      }}
                    >
                      {categoryLabel}
                    </Typography>

                    {productKindLabel ? (
                      <Chip
                        label={productKindLabel}
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
                  </Stack>
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
                    {description || "Sin descripción disponible."}
                  </Typography>
                </Box>

                {availabilityLabel ? (
                  <>
                    <Divider />

                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      spacing={1}
                    >
                      <Box>
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
                        label={availabilityLabel}
                        size="small"
                        variant="outlined"
                        sx={{
                          height: 28,
                          px: 0.25,
                          bgcolor: availabilityChipSx.bgcolor,
                          borderColor: availabilityChipSx.borderColor,
                          color: availabilityChipSx.color,
                          fontSize: 12,
                          fontWeight: 900,
                        }}
                      />
                    </Stack>
                  </>
                ) : null}
              </Stack>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}