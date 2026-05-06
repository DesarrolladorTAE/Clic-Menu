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

                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: 14,
                    color: "text.secondary",
                  }}
                >
                  {itemCount} producto{itemCount === 1 ? "" : "s"} ·{" "}
                  {formatCurrency(total)}
                </Typography>
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