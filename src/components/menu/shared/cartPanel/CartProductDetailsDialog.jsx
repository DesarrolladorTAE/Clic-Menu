import React, { useMemo } from "react";
import {
  Box, Button, Card, CardContent, Chip, Dialog, DialogContent,
  DialogTitle, IconButton, Stack, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import StickyNote2RoundedIcon from "@mui/icons-material/StickyNote2Rounded";

import { money } from "../../../../hooks/public/publicMenu.utils";
import {
  getCartProductExtras,
  getCartProductNotes,
} from "./CartProductDetailIcons";

export default function CartProductDetailsDialog({
  open,
  item,
  option = null,
  section = "extras",
  themeColor = "",
  onClose,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const isNotes = section === "notes";

  const productName = String(
    item?.display_name ||
    item?.product_name ||
    item?.name ||
    option?.name ||
    "Producto"
  ).trim();

  const variantName = String(item?.variant_name || "").trim();
  const notes = getCartProductNotes(item);

  const extras = useMemo(
    () => getCartProductExtras(item, option),
    [item, option]
  );

  const extrasCount = extras.reduce(
    (total, group) => total + group.options.length, 0
  );

  const accentColor = /^#[0-9A-Fa-f]{6}$/.test(String(themeColor || ""))
    ? themeColor
    : "#FF9800";

  const rawQuantity = item?.effective_quantity ?? item?.quantity;
  const quantity = rawQuantity === null || rawQuantity === undefined
    ? null
    : Number(rawQuantity);

  const showQuantity = quantity !== null && Number.isFinite(quantity);

  const subtitle = isNotes
    ? "Consulta las indicaciones registradas para este producto."
    : "Consulta los extras seleccionados para este producto.";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={isMobile}
      aria-labelledby="cm-product-details-title"
      slotProps={{
        paper: {
          sx: {
            borderRadius: { xs: 0, sm: 1 },
            overflow: "hidden",
            bgcolor: "background.paper",
            maxHeight: { xs: "100dvh", sm: "90dvh" },
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          bgcolor: "#111111",
          color: "#FFFFFF",
        }}
      >
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              id="cm-product-details-title"
              sx={{
                fontSize: { xs: 20, sm: 24 },
                fontWeight: 800,
                lineHeight: 1.2,
                color: "#FFFFFF",
              }}
            >
              Detalles del producto
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 13,
                lineHeight: 1.45,
                color: "rgba(255,255,255,0.82)",
                overflowWrap: "anywhere",
              }}
            >
              {subtitle}
            </Typography>
          </Box>

          <IconButton
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalles del producto"
            sx={{
              flexShrink: 0,
              color: "#FFFFFF",
              bgcolor: "rgba(255,255,255,0.08)",
              borderRadius: 1,
              "&:hover": { bgcolor: "rgba(255,255,255,0.16)" },
            }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

    <DialogContent
        sx={{
            px: { xs: 2, sm: 3 },
            pt: 0,
            pb: { xs: 2, sm: 3 },
            bgcolor: "background.default",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            "&.MuiDialogContent-root": { pt: 0 },
        }}
    >
        <Card
            sx={{
                flex: "1 0 auto",
                display: "flex",
                flexDirection: "column",
                width: "100%",
                minWidth: 0,
                borderRadius: 0,
                boxShadow: "none",
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
            }}
        >
          <CardContent
            sx={{
              p: { xs: 2, sm: 3 },
              "&:last-child": { pb: { xs: 2, sm: 3 } },
            }}
          >
            <Stack spacing={2.5}>
              <Box>
                <Typography
                  sx={{
                    fontSize: { xs: 18, sm: 21 },
                    fontWeight: 800,
                    color: "text.primary",
                    lineHeight: 1.3,
                    overflowWrap: "anywhere",
                  }}
                >
                  {productName}
                </Typography>

                {variantName && !productName.includes(variantName) ? (
                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: 13,
                      color: "text.secondary",
                      overflowWrap: "anywhere",
                    }}
                  >
                    Variante: <strong>{variantName}</strong>
                  </Typography>
                ) : null}

                {showQuantity ? (
                  <Chip
                    label={`Cantidad: ${quantity}`}
                    size="small"
                    sx={{
                      mt: 1.25,
                      bgcolor: "#F3F4F6",
                      color: "#111827",
                      fontWeight: 800,
                    }}
                  />
                ) : null}
              </Box>

              {isNotes ? (
                <Box>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ mb: 1.25 }}
                  >
                    <StickyNote2RoundedIcon
                      sx={{ fontSize: 20, color: "#C2410C" }}
                    />

                    <Typography
                      sx={{
                        fontSize: 16,
                        fontWeight: 800,
                        color: "text.primary",
                      }}
                    >
                      Notas del producto
                    </Typography>
                  </Stack>

                  <Box
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      border: "1px solid #FED7AA",
                      borderRadius: 1.5,
                      bgcolor: "#FFF7ED",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#9A3412",
                        lineHeight: 1.65,
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {notes || "Este producto no tiene notas registradas."}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ mb: 1.25 }}
                  >
                    <TuneRoundedIcon
                      sx={{ fontSize: 20, color: accentColor }}
                    />

                    <Typography
                      sx={{
                        fontSize: 16,
                        fontWeight: 800,
                        color: "text.primary",
                      }}
                    >
                      Extras
                    </Typography>

                    {extrasCount > 0 ? (
                      <Chip
                        label={extrasCount}
                        size="small"
                        sx={{
                          minWidth: 28,
                          bgcolor: accentColor,
                          color: "#FFFFFF",
                          fontWeight: 800,
                        }}
                      />
                    ) : null}
                  </Stack>

                  {extras.length > 0 ? (
                    <Stack spacing={1.25}>
                      {extras.map((group, index) => (
                        <Box
                          key={`${group.name}-${index}`}
                          sx={{
                            p: { xs: 1.5, sm: 2 },
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1.5,
                            bgcolor: "background.paper",
                            minWidth: 0,
                          }}
                        >
                          <Stack
                            direction="row"
                            alignItems="flex-start"
                            justifyContent="space-between"
                            spacing={1}
                            sx={{ mb: 1.25 }}
                          >
                            <Typography
                              sx={{
                                flex: 1,
                                minWidth: 0,
                                fontSize: 13,
                                fontWeight: 800,
                                color: "text.primary",
                                overflowWrap: "anywhere",
                              }}
                            >
                              {group.name}
                            </Typography>

                            {group.total > 0 ? (
                              <Typography
                                sx={{
                                  flexShrink: 0,
                                  fontSize: 12,
                                  fontWeight: 800,
                                  color: "text.secondary",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {money(group.total)}
                              </Typography>
                            ) : null}
                          </Stack>

                          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                            {group.options.map((extra, extraIndex) => {
                              const price = extra.quantity > 1 && extra.totalPrice !== null
                                ? extra.totalPrice
                                : extra.unitPrice;

                              const label = [
                                extra.name,
                                extra.quantity > 1 ? `x${extra.quantity}` : "",
                                price > 0 ? money(price) : "",
                              ].filter(Boolean).join(" · ");

                              return (
                                <Chip
                                  key={`${extra.name}-${extraIndex}`}
                                  label={label}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    height: "auto",
                                    minHeight: 32,
                                    maxWidth: "100%",
                                    bgcolor: "#EFF6FF",
                                    borderColor: "#BFDBFE",
                                    color: "#1E40AF",
                                    fontWeight: 700,
                                    "& .MuiChip-label": {
                                      whiteSpace: "normal",
                                      py: 0.75,
                                      lineHeight: 1.35,
                                      overflowWrap: "anywhere",
                                    },
                                  }}
                                />
                              );
                            })}
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Box
                      sx={{
                        p: 2,
                        border: "1px dashed",
                        borderColor: "divider",
                        borderRadius: 1.5,
                        bgcolor: "background.paper",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 13,
                          color: "text.secondary",
                          lineHeight: 1.5,
                        }}
                      >
                        Este producto no tiene extras registrados.
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              <Stack
                direction={{ xs: "column-reverse", sm: "row" }}
                justifyContent="flex-end"
                spacing={1.5}
                sx={{ pt: 1 }}
              >
                <Button
                  type="button"
                  variant="contained"
                  onClick={onClose}
                  sx={{
                    minWidth: { xs: "100%", sm: 160 },
                    height: 44,
                    borderRadius: 2,
                    fontWeight: 800,
                  }}
                >
                  Cerrar
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}