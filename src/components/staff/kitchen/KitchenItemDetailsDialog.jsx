import React, { useMemo } from "react";
import {
  Box, Button, Card, CardContent, Chip, Dialog, DialogContent,
  DialogTitle, IconButton, Stack, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import StickyNote2RoundedIcon from "@mui/icons-material/StickyNote2Rounded";

import {
  getKitchenEffectiveQuantity,
  groupItemModifiers,
  modifierLabel,
  prettyNotes,
  tItemStatus,
} from "./kitchen.helpers";

export default function KitchenItemDetailsDialog({
  open,
  item,
  context = null,
  onClose,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const productName = String(item?.product_name || "Producto").trim();
  const variantName = String(item?.variant_name || "").trim();
  const quantity = getKitchenEffectiveQuantity(item);

  const kitchenStatus = String(item?.kitchen_status || "").trim();
  const statusLabel = kitchenStatus ? tItemStatus(kitchenStatus) : null;

  const notes = prettyNotes(item?.notes).trim();
  const hasNotes = Boolean(notes && notes !== "{}" && notes !== "[]");

  const modifierGroups = useMemo(
    () => groupItemModifiers(item?.modifiers),
    [item?.modifiers]
  );

  const modifierCount = useMemo(
    () => modifierGroups.reduce((total, group) => total + group.items.length, 0),
    [modifierGroups]
  );

  const menuSetName = String(
    context?.menuSetName || item?.menu_set?.menu_set_name || ""
  ).trim();

  const stageName = String(
    context?.stageName || item?.menu_set?.stage_name || ""
  ).trim();

  const isCompositeParent = Boolean(item?.is_composite_parent);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={isMobile}
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
          color: "#fff",
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: { xs: 20, sm: 24 },
                fontWeight: 800,
                lineHeight: 1.2,
                color: "#fff",
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
              Consulta las indicaciones necesarias para su preparación.
            </Typography>
          </Box>

          <IconButton
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalles del producto"
            sx={{
              flexShrink: 0,
              color: "#fff",
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
            p: { xs: 2, sm: 3 },
            bgcolor: "background.default",
        }}
      >
        <Card
            sx={{
                borderRadius: 0,
                boxShadow: "none",
                backgroundColor: "#fff",
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

                {variantName ? (
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

                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  useFlexGap
                  flexWrap="wrap"
                  sx={{ mt: 1.25 }}
                >
                  <Chip
                    label={`Cantidad: ${quantity}`}
                    size="small"
                    sx={{
                      bgcolor: "#f3f4f6",
                      color: "#111827",
                      fontWeight: 800,
                    }}
                  />

                  {statusLabel ? (
                    <Chip
                      label={statusLabel}
                      size="small"
                      variant="outlined"
                      color={
                        kitchenStatus === "ready"
                          ? "success"
                          : kitchenStatus === "in_progress"
                          ? "info"
                          : "warning"
                      }
                      sx={{ fontWeight: 800 }}
                    />
                  ) : null}

                  {isCompositeParent ? (
                    <Chip
                      label="Producto compuesto"
                      size="small"
                      variant="outlined"
                      color="primary"
                      sx={{ fontWeight: 800 }}
                    />
                  ) : null}
                </Stack>
              </Box>

              {menuSetName ? (
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    border: "1px solid #bfdbfe",
                    bgcolor: "#eff6ff",
                  }}
                >
                  <Stack spacing={0.5}>
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: "#1e40af",
                        overflowWrap: "anywhere",
                      }}
                    >
                      Conjunto: {menuSetName}
                    </Typography>

                    {stageName ? (
                      <Typography
                        sx={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#1d4ed8",
                          overflowWrap: "anywhere",
                        }}
                      >
                        Etapa: {stageName}
                      </Typography>
                    ) : null}
                  </Stack>
                </Box>
              ) : null}

              {modifierCount > 0 ? (
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.25 }}>
                    <TuneRoundedIcon sx={{ fontSize: 20, color: "primary.main" }} />

                    <Typography
                      sx={{
                        fontSize: 16,
                        fontWeight: 800,
                        color: "text.primary",
                      }}
                    >
                      Extras
                    </Typography>

                    <Chip
                      label={modifierCount}
                      size="small"
                      color="primary"
                      sx={{ fontWeight: 800, minWidth: 27 }}
                    />
                  </Stack>

                  <Stack spacing={1.25}>
                    {modifierGroups.map((group) => (
                      <Box
                        key={group.groupName}
                        sx={{
                          p: { xs: 1.5, sm: 2 },
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 1.5,
                          bgcolor: "background.paper",
                        }}
                      >
                        <Typography
                          sx={{
                            mb: 1,
                            fontSize: 13,
                            fontWeight: 800,
                            color: "text.primary",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {group.groupName}
                        </Typography>

                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                          {group.items.map((modifier) => (
                            <Chip
                              key={modifier.id}
                              label={modifierLabel(modifier)}
                              size="small"
                              variant="outlined"
                              sx={{
                                height: "auto",
                                minHeight: 30,
                                maxWidth: "100%",
                                bgcolor: "#eff6ff",
                                borderColor: "#bfdbfe",
                                color: "#1e40af",
                                fontWeight: 700,
                                "& .MuiChip-label": {
                                  whiteSpace: "normal",
                                  py: 0.65,
                                  lineHeight: 1.35,
                                  overflowWrap: "anywhere",
                                },
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              ) : null}

              {hasNotes ? (
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.25 }}>
                    <StickyNote2RoundedIcon sx={{ fontSize: 20, color: "#c2410c" }} />

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
                      border: "1px solid #fed7aa",
                      borderRadius: 1.5,
                      bgcolor: "#fff7ed",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 600,
                        lineHeight: 1.65,
                        color: "#9a3412",
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {notes}
                    </Typography>
                  </Box>
                </Box>
              ) : null}

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