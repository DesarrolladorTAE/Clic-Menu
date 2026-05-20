// src/components/staff/casher/refunds/CashierRefundTicketWhatsappDialog.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert, Box, Button, Card, CardContent, Checkbox, Dialog, DialogContent, DialogTitle, FormControlLabel, IconButton,
  Stack, TextField, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";

export default function CashierRefundTicketWhatsappDialog({
  open = false,
  onClose,
  sale = null,
  onSend,
  sending = false,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const initialPhone = useMemo(() => {
    const contactPhone = sale?.contact_data?.phone || "";
    const customerPhone = sale?.customer?.phone || "";

    return contactPhone || customerPhone || "";
  }, [sale]);

  const hasFormalCustomer = Boolean(sale?.customer?.customer_id);
  const hasSimpleContact = Boolean(sale?.contact_data?.phone);

  const [phone, setPhone] = useState("");
  const [saveContact, setSaveContact] = useState(false);

  useEffect(() => {
    if (!open) return;

    setPhone(initialPhone);
    setSaveContact(false);
  }, [open, initialPhone]);

  const cleanPhone = String(phone || "").replace(/\D/g, "");

  const canSend =
    !!sale?.sale_id &&
    !!sale?.ticket?.id &&
    cleanPhone.length >= 10 &&
    !sending;

  const handlePhoneChange = (value) => {
    const cleanValue = String(value || "")
      .replace(/[^\d\s+\-()]/g, "")
      .slice(0, 30);

    setPhone(cleanValue);
  };

  const handleSend = () => {
    if (!canSend) return;

    onSend?.({
      sale,
      phone,
      save_contact: saveContact,
    });
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={sending ? undefined : onClose}
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
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 1.5,
                display: "grid",
                placeItems: "center",
                bgcolor: "#25D366",
                color: "#fff",
                flexShrink: 0,
              }}
            >
              <WhatsAppIcon />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: 20, sm: 24 },
                  lineHeight: 1.2,
                  color: "#fff",
                }}
              >
                Reenviar ticket
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.82)",
                  lineHeight: 1.45,
                }}
              >
                Envía nuevamente el PDF del ticket por WhatsApp.
              </Typography>
            </Box>
          </Stack>

          <IconButton
            onClick={onClose}
            disabled={sending}
            sx={{
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.08)",
              borderRadius: 1,
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.16)",
              },
            }}
          >
            <CloseIcon />
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
          {!sale?.ticket?.id ? (
            <Alert severity="warning" sx={{ borderRadius: 1 }}>
              Esta venta no tiene ticket disponible para reenviar.
            </Alert>
          ) : null}

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
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: 1.5,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: "rgba(255, 152, 0, 0.12)",
                      color: "primary.main",
                    }}
                  >
                    <ReceiptLongRoundedIcon fontSize="small" />
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        fontSize: 16,
                        fontWeight: 800,
                        color: "text.primary",
                      }}
                    >
                      Venta #{sale?.sale_id || "—"}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 13,
                        color: "text.secondary",
                      }}
                    >
                      {sale?.ticket_folio
                        ? `Folio ${sale.ticket_folio}`
                        : "Sin folio"}
                    </Typography>
                  </Box>
                </Stack>

                <Typography
                  sx={{
                    fontSize: 13,
                    color: "text.secondary",
                    lineHeight: 1.55,
                  }}
                >
                  Cliente:{" "}
                  <Box component="span" sx={{ fontWeight: 800, color: "text.primary" }}>
                    {sale?.customer_name || "Cliente sin nombre"}
                  </Box>
                </Typography>
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
                <Box>
                  <Typography
                    sx={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: "text.primary",
                    }}
                  >
                    Datos de envío
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: 13,
                      color: "text.secondary",
                      lineHeight: 1.55,
                    }}
                  >
                    {hasSimpleContact
                      ? "Se precargó el contacto simple guardado en la venta."
                      : hasFormalCustomer
                      ? "Se precargó el teléfono del cliente formal."
                      : "Escribe el número al que deseas reenviar el ticket."}
                  </Typography>
                </Box>

                <FieldBlock
                  label="Teléfono WhatsApp"
                  input={
                    <TextField
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="Ej. 7441234567"
                      fullWidth
                      disabled={sending || !sale?.ticket?.id}
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
                  help="Puedes usar el número guardado o escribir uno nuevo."
                />

                {!hasFormalCustomer && !hasSimpleContact ? (
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
                          disabled={sending}
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
                            Útil para futuros reenvíos del ticket.
                          </Typography>
                        </Box>
                      }
                      sx={{
                        alignItems: "flex-start",
                        m: 0,
                      }}
                    />
                  </Box>
                ) : null}

                <Stack
                  direction={{ xs: "column-reverse", sm: "row" }}
                  justifyContent="flex-end"
                  spacing={1.5}
                  pt={1}
                >
                  <Button
                    type="button"
                    onClick={onClose}
                    disabled={sending}
                    variant="outlined"
                    sx={{
                      minWidth: { xs: "100%", sm: 140 },
                      height: 44,
                      borderRadius: 2,
                    }}
                  >
                    Cancelar
                  </Button>

                  <Button
                    type="button"
                    onClick={handleSend}
                    disabled={!canSend}
                    variant="contained"
                    startIcon={<SendRoundedIcon />}
                    sx={{
                      minWidth: { xs: "100%", sm: 190 },
                      height: 44,
                      borderRadius: 2,
                      fontWeight: 800,
                      bgcolor: "#25D366",
                      "&:hover": {
                        bgcolor: "#1DA851",
                      },
                    }}
                  >
                    {sending ? "Enviando…" : "Enviar ticket"}
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

function FieldBlock({ label, input, help }) {
  return (
    <Box sx={{ flex: 1, width: "100%" }}>
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 800,
          color: "text.primary",
          mb: 1,
        }}
      >
        {label}
      </Typography>

      {input}

      {help ? (
        <Typography
          sx={{
            mt: 0.75,
            fontSize: 12,
            color: "text.secondary",
            lineHeight: 1.45,
          }}
        >
          {help}
        </Typography>
      ) : null}
    </Box>
  );
}