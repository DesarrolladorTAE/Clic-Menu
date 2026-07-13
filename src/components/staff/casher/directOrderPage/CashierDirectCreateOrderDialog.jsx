import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Card, CardContent, Dialog, DialogContent, DialogTitle, IconButton, MenuItem, Stack, TextField,
  Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PointOfSaleRoundedIcon from "@mui/icons-material/PointOfSaleRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import KitchenRoundedIcon from "@mui/icons-material/KitchenRounded";

export default function CashierDirectCreateOrderDialog({
  open,
  onClose,
  onConfirm,
  customerName = "",
  onCustomerNameChange,
  kitchenFlow = "",
  onKitchenFlowChange,
  cart = [],
  total = 0,
  pricingSummary = null,
  saving = false,
  canChooseKitchenFlow = false,
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [localName, setLocalName] = useState("");
  const [localKitchenFlow, setLocalKitchenFlow] = useState("");

  useEffect(() => {
    if (!open) return;

    setLocalName(customerName || "");
    setLocalKitchenFlow(kitchenFlow || "");
  }, [open, customerName, kitchenFlow]);

  const itemCount = useMemo(() => {
    return (Array.isArray(cart) ? cart : []).reduce(
      (acc, item) => acc + Number(item?.quantity || 1),
      0
    );
  }, [cart]);

  const pricingPreview = useMemo(() => {
    const summary =
      pricingSummary && typeof pricingSummary === "object"
        ? pricingSummary
        : {};

    const pending =
      summary?.pending && typeof summary.pending === "object"
        ? summary.pending
        : summary;

    const subtotalReference = Number(
      pending?.grossSubtotalReference ?? total ?? 0
    );

    const promotionDiscountPreview = Number(
      pending?.promotionDiscountPreview ?? 0
    );

    const approximateTotal = Number(
      pending?.totalApproximate ??
        summary?.displayTotal ??
        total ??
        0
    );

    const hasQuantityPromotion = Boolean(
      pending?.hasUnresolvedQuantityPromotions ??
        summary?.hasUnresolvedQuantityPromotions
    );

    return {
      subtotalReference: Number.isFinite(subtotalReference)
        ? subtotalReference
        : 0,

      promotionDiscountPreview: Number.isFinite(
        promotionDiscountPreview
      )
        ? promotionDiscountPreview
        : 0,

      approximateTotal: Number.isFinite(approximateTotal)
        ? approximateTotal
        : 0,

      hasQuantityPromotion,
    };
  }, [pricingSummary, total]);

  const handleNameChange = (value) => {
    setLocalName(value);
    onCustomerNameChange?.(value);
  };

  const handleKitchenFlowChange = (value) => {
    setLocalKitchenFlow(value);
    onKitchenFlowChange?.(value);
  };

  const handleConfirm = () => {
    const nextName = String(localName || "").trim();

    onConfirm?.({
      customer_name: nextName,
      kitchen_flow: localKitchenFlow || undefined,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={fullScreen}
      slotProps={{
        paper: {
          sx: {
            borderRadius: { xs: 0, sm: 1 },
            overflow: "hidden",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "#111111",
          color: "#fff",
          px: { xs: 2, sm: 3 },
          py: 2,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
        >
          <Box>
            <Typography
              sx={{
                fontSize: { xs: 22, sm: 26 },
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1.15,
              }}
            >
              Crear venta directa
            </Typography>

            <Typography
              sx={{
                mt: 0.75,
                fontSize: 13,
                color: "rgba(255,255,255,0.82)",
                lineHeight: 1.5,
              }}
            >
              Confirma el cliente y los productos antes de enviar la venta a caja.
            </Typography>
          </Box>

          <IconButton
            onClick={onClose}
            disabled={saving}
            sx={{
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.08)",
              borderRadius: 1,
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.16)",
              },
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
            borderRadius: 1,
            boxShadow: "none",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={2.25}>
              <Box>
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "text.primary",
                  }}
                >
                  Resumen
                </Typography>

                <Box
                  sx={{
                    mt: 1.25,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    backgroundColor: "#FCFCFC",
                    p: 1.5,
                  }}
                >
                  <Stack spacing={1}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      spacing={2}
                    >
                      <Typography
                        sx={{
                          fontSize: 13,
                          color: "text.secondary",
                        }}
                      >
                        Productos
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: 800,
                        }}
                      >
                        {itemCount}
                      </Typography>
                    </Stack>

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      spacing={2}
                    >
                      <Typography
                        sx={{
                          fontSize: 13,
                          color: "text.secondary",
                        }}
                      >
                        Subtotal de referencia
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: 800,
                        }}
                      >
                        {formatCurrency(
                          pricingPreview.subtotalReference
                        )}
                      </Typography>
                    </Stack>

                    {pricingPreview.promotionDiscountPreview > 0 ? (
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        spacing={2}
                      >
                        <Typography
                          sx={{
                            fontSize: 13,
                            color: "success.main",
                            fontWeight: 700,
                          }}
                        >
                          Promoción visual
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: 13,
                            color: "success.main",
                            fontWeight: 800,
                          }}
                        >
                          −
                          {formatCurrency(
                            pricingPreview.promotionDiscountPreview
                          )}
                        </Typography>
                      </Stack>
                    ) : null}

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      spacing={2}
                      sx={{
                        pt: 1,
                        borderTop: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 14,
                          fontWeight: 800,
                          color: "warning.dark",
                        }}
                      >
                        Importe aproximado
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 15,
                          fontWeight: 900,
                          color: "warning.dark",
                        }}
                      >
                        {formatCurrency(
                          pricingPreview.approximateTotal
                        )}
                      </Typography>
                    </Stack>

                    {pricingPreview.hasQuantityPromotion ? (
                      <Box
                        sx={{
                          border: "1px solid",
                          borderColor: "warning.light",
                          borderRadius: 1,
                          bgcolor: "warning.50",
                          p: 1.25,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 12,
                            color: "warning.dark",
                            fontWeight: 700,
                            lineHeight: 1.5,
                          }}
                        >
                          Incluye una promoción por cantidad. El descuento exacto se
                          confirmará al crear la venta.
                        </Typography>
                      </Box>
                    ) : null}

                    <Typography
                      sx={{
                        fontSize: 12,
                        color: "text.secondary",
                        lineHeight: 1.5,
                      }}
                    >
                      Los importes mostrados son una vista previa.
                    </Typography>
                  </Stack>
                </Box>
              </Box>

              <Box
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  backgroundColor: "#FCFCFC",
                  p: 1.5,
                }}
              >
                <Typography sx={fieldLabelSx}>Nombre del cliente</Typography>

                <TextField
                  fullWidth
                  value={localName}
                  onChange={(event) => handleNameChange(event.target.value)}
                  placeholder="Ej. Pedro, Ana, mesa rápida..."
                  disabled={saving}
                  inputProps={{
                    maxLength: 120,
                  }}
                />
              </Box>

              {canChooseKitchenFlow ? (
                <Box
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    backgroundColor: "#FCFCFC",
                    p: 1.5,
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <KitchenRoundedIcon color="primary" />
                    <Typography sx={fieldLabelSxNoMargin}>
                      Flujo de cocina
                    </Typography>
                  </Stack>

                  <TextField
                    select
                    fullWidth
                    value={localKitchenFlow}
                    onChange={(event) =>
                      handleKitchenFlowChange(event.target.value)
                    }
                    disabled={saving}
                    sx={{ mt: 1 }}
                  >
                    <MenuItem value="">Usar configuración de sucursal</MenuItem>
                    <MenuItem value="with_kitchen">Enviar a cocina</MenuItem>
                    <MenuItem value="without_kitchen">
                      Directo sin cocina
                    </MenuItem>
                  </TextField>
                </Box>
              ) : null}

              <Box
                sx={{
                  border: "1px dashed",
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 1.5,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 13,
                    color: "text.secondary",
                    lineHeight: 1.55,
                  }}
                >
                  Al confirmar, se creará una orden y una venta, ligada a tu
                  caja abierta.
                </Typography>
              </Box>

              <Stack
                direction={{ xs: "column-reverse", sm: "row" }}
                spacing={1.5}
                justifyContent="flex-end"
              >
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={onClose}
                  disabled={saving}
                  sx={{
                    minWidth: { xs: "100%", sm: 140 },
                    height: 44,
                    borderRadius: 2,
                    fontWeight: 800,
                  }}
                >
                  Cancelar
                </Button>

                <Button
                  variant="contained"
                  onClick={handleConfirm}
                  disabled={saving || itemCount <= 0}
                  startIcon={
                    saving ? <PointOfSaleRoundedIcon /> : <SaveRoundedIcon />
                  }
                  sx={{
                    minWidth: { xs: "100%", sm: 190 },
                    height: 44,
                    borderRadius: 2,
                    fontWeight: 800,
                  }}
                >
                  {saving ? "Creando…" : "Crear venta"}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}

const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
  mb: 1,
};

const fieldLabelSxNoMargin = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
};

function formatCurrency(value) {
  const safe = Number(value || 0);

  try {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    }).format(safe);
  } catch {
    return `$${safe.toFixed(2)}`;
  }
}