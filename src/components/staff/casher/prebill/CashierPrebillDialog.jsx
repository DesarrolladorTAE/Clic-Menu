import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Card, CardContent, Checkbox, Dialog, DialogContent, DialogTitle,
  FormControlLabel, IconButton, Stack, TextField, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";

/*
 * Modal operativo de PRECUENTA.
 *
 * Muestra únicamente las acciones útiles para caja:
 * - enviar PDF por WhatsApp;
 * - imprimir PRECUENTA térmica;
 * - cerrar.
 *
 * Lo usa:
 * - CashierSaleDetailPage.jsx.
 */

export default function CashierPrebillDialog({
  open = false,
  onClose,
  customerSummary = null,
  onSendWhatsapp,
  sendingWhatsapp = false,
  onThermalPrint,
  thermalPrinting = false,
  disabled = false,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const contactPhone = customerSummary?.contact_data?.phone || "";
  const customerPhone = customerSummary?.customer?.phone || "";

  const hasSimpleContact = Boolean(String(contactPhone || "").trim());
  const hasFormalCustomer = Boolean(
    customerSummary?.customer?.customer_id ||
    customerSummary?.customer?.id
  );

  const initialPhone = useMemo(() => {
    if (hasSimpleContact) return contactPhone;
    if (hasFormalCustomer && customerPhone) return customerPhone;
    return "";
  }, [contactPhone, customerPhone, hasFormalCustomer, hasSimpleContact]);

  const [phone, setPhone] = useState("");
  const [saveContact, setSaveContact] = useState(false);

  const busy = sendingWhatsapp || thermalPrinting;
  const cleanPhone = String(phone || "").replace(/\D/g, "");

  const showSaveContact = !hasSimpleContact && !hasFormalCustomer;
  const canSendWhatsapp = cleanPhone.length >= 10 && !disabled && !busy;
  const canThermalPrint = !disabled && !busy;

  useEffect(() => {
    if (!open) return;

    setPhone(initialPhone);
    setSaveContact(false);
  }, [open, initialPhone]);

  const handlePhoneChange = (value) => {
    setPhone(
      String(value || "")
        .replace(/[^\d\s+\-()]/g, "")
        .slice(0, 30)
    );
  };

  const handleSendWhatsapp = () => {
    if (!canSendWhatsapp) return;

    onSendWhatsapp?.({
      phone,
      save_contact: showSaveContact ? saveContact : false,
    });
  };

  const handleThermalPrint = () => {
    if (!canThermalPrint) return;
    onThermalPrint?.();
  };

  const handleClose = () => {
    if (busy) return;
    onClose?.();
  };

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason === "backdropClick" || busy) return;
        handleClose();
      }}
      fullWidth
      maxWidth="sm"
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 1 },
          overflow: "hidden",
          backgroundColor: "background.paper",
          boxShadow: "none",
          border: "1px solid",
          borderColor: "divider",
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
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 1.5,
                display: "grid",
                placeItems: "center",
                bgcolor: "primary.main",
                color: "#fff",
                flexShrink: 0,
              }}
            >
              <ReceiptLongRoundedIcon />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: 20, sm: 24 },
                  lineHeight: 1.2,
                  color: "#fff",
                }}
              >
                Precuenta
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.82)",
                  lineHeight: 1.45,
                }}
              >
                Documento informativo. No es comprobante de pago.
              </Typography>
            </Box>
          </Stack>

          <IconButton
            onClick={handleClose}
            disabled={busy}
            sx={{
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
        <Stack spacing={2.5}>
          <Card
            sx={{
              borderRadius: 0,
              backgroundColor: "background.paper",
              boxShadow: "none",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: 1.5,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: "rgba(37, 211, 102, 0.14)",
                      color: "#25D366",
                      flexShrink: 0,
                    }}
                  >
                    <WhatsAppIcon fontSize="small" />
                  </Box>

                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
                      Enviar por WhatsApp
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.35,
                        fontSize: 13,
                        color: "text.secondary",
                        lineHeight: 1.55,
                      }}
                    >
                      {hasSimpleContact
                        ? "Se usará el contacto guardado en esta venta."
                        : hasFormalCustomer && customerPhone
                        ? "Se cargó el teléfono del cliente asociado."
                        : "Escribe el número al que deseas enviar la precuenta."}
                    </Typography>
                  </Box>
                </Stack>

                <FieldBlock
                  label="Teléfono WhatsApp"
                  input={
                    <TextField
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="Ej. 7441234567"
                      fullWidth
                      disabled={disabled || busy}
                      InputProps={{
                        startAdornment: (
                          <Box
                            sx={{
                              mr: 1,
                              display: "grid",
                              placeItems: "center",
                              color: "text.secondary",
                            }}
                          >
                            <PhoneRoundedIcon fontSize="small" />
                          </Box>
                        ),
                      }}
                    />
                  }
                  help="Puedes usar el número guardado o escribir uno diferente."
                />

                {showSaveContact ? (
                  <Box
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      backgroundColor: "background.default",
                      px: 1.5,
                      py: 1,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={saveContact}
                          onChange={(e) => setSaveContact(e.target.checked)}
                          disabled={disabled || busy}
                        />
                      }
                      label={
                        <Box>
                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: "text.primary",
                              lineHeight: 1.3,
                            }}
                          >
                            Guardar este número como contacto de la venta
                          </Typography>

                          <Typography
                            sx={{
                              mt: 0.25,
                              fontSize: 12,
                              color: "text.secondary",
                              lineHeight: 1.45,
                            }}
                          >
                            Podrá utilizarse después para otros envíos asociados a esta venta.
                          </Typography>
                        </Box>
                      }
                      sx={{ alignItems: "flex-start", m: 0 }}
                    />
                  </Box>
                ) : null}

                <Button
                  type="button"
                  variant="contained"
                  startIcon={<SendRoundedIcon />}
                  onClick={handleSendWhatsapp}
                  disabled={!canSendWhatsapp}
                  sx={{
                    height: 44,
                    borderRadius: 2,
                    fontWeight: 800,
                    bgcolor: "#25D366",
                    "&:hover": { bgcolor: "#1DA851" },
                  }}
                >
                  {sendingWhatsapp ? "Enviando…" : "Enviar por WhatsApp"}
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Card
            sx={{
              borderRadius: 0,
              backgroundColor: "background.paper",
              boxShadow: "none",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: 1.5,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: "rgba(21, 101, 192, 0.14)",
                      color: "#1565c0",
                      flexShrink: 0,
                    }}
                  >
                    <PrintRoundedIcon fontSize="small" />
                  </Box>

                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
                      Imprimir precuenta
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.35,
                        fontSize: 13,
                        color: "text.secondary",
                        lineHeight: 1.55,
                      }}
                    >
                      Envía la precuenta a la impresora térmica configurada para esta sucursal.
                    </Typography>
                  </Box>
                </Stack>

                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<ReceiptLongRoundedIcon />}
                  onClick={handleThermalPrint}
                  disabled={!canThermalPrint}
                  sx={{
                    height: 44,
                    borderRadius: 2,
                    fontWeight: 800,
                  }}
                >
                  {thermalPrinting ? "Enviando…" : "Imprimir térmico"}
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Stack direction={{ xs: "column-reverse", sm: "row" }} justifyContent="flex-end">
            <Button
              type="button"
              variant="outlined"
              onClick={handleClose}
              disabled={busy}
              sx={{
                minWidth: { xs: "100%", sm: 140 },
                height: 44,
                borderRadius: 2,
              }}
            >
              Cerrar
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

function FieldBlock({ label, input, help }) {
  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary", mb: 1 }}>
        {label}
      </Typography>

      {input}

      {help ? (
        <Typography sx={{ mt: 0.75, fontSize: 12, color: "text.secondary", lineHeight: 1.45 }}>
          {help}
        </Typography>
      ) : null}
    </Box>
  );
}