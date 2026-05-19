import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";

export default function CashierTicketWhatsappCard({
  ticketAvailable = false,
  customerSummary = null,
  onSendWhatsapp,
  busy = false,
  disabled = false,
}) {
  const contactPhone = customerSummary?.contact_data?.phone || "";
  const customerPhone = customerSummary?.customer?.phone || "";

  const hasSimpleContactPhone = Boolean(String(contactPhone || "").trim());
  const hasFormalCustomerPhone = Boolean(String(customerPhone || "").trim());

  const initialPhone = useMemo(() => {
    if (hasSimpleContactPhone) {
      return contactPhone;
    }

    return "";
  }, [hasSimpleContactPhone, contactPhone]);

  const [phone, setPhone] = useState(initialPhone);
  const [saveContact, setSaveContact] = useState(false);

  React.useEffect(() => {
    setPhone(initialPhone);
    setSaveContact(false);
  }, [initialPhone]);

  const showSaveContact = !hasSimpleContactPhone;

  const helperText = useMemo(() => {
    if (hasSimpleContactPhone) {
      return "Se usará el contacto simple guardado.";
    }

    if (hasFormalCustomerPhone) {
      return "La venta tiene cliente formal asociado. Escribe el número al que deseas enviar el ticket.";
    }

    return "Escribe el número de WhatsApp del cliente para enviar el PDF del ticket.";
  }, [hasSimpleContactPhone, hasFormalCustomerPhone]);

  const cleanPreviewPhone = String(phone || "").replace(/\D/g, "");
  const canSend =
    ticketAvailable &&
    !disabled &&
    !busy &&
    cleanPreviewPhone.length >= 10;

  const handlePhoneChange = (value) => {
    const allowed = String(value || "")
      .replace(/[^\d\s+\-()]/g, "")
      .slice(0, 30);

    setPhone(allowed);
  };

  const handleSend = () => {
    if (!canSend) return;

    onSendWhatsapp?.({
      phone,
      save_contact: showSaveContact ? saveContact : false,
      body: "Muchas gracias por tu compra. Te compartimos tu ticket.",
    });
  };

  return (
    <Card
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        boxShadow: "none",
        backgroundColor: "background.paper",
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2,
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
                    fontSize: 21,
                    fontWeight: 800,
                    color: "text.primary",
                    lineHeight: 1.1,
                  }}
                >
                  Enviar por WhatsApp
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: 14,
                    color: "text.secondary",
                    lineHeight: 1.5,
                  }}
                >
                  Envía el PDF del ticket al número del cliente.
                </Typography>
              </Box>
            </Stack>
          </Stack>

          {!ticketAvailable ? (
            <Alert severity="warning" sx={{ borderRadius: 1 }}>
              El ticket aún no está disponible para enviarse por WhatsApp.
            </Alert>
          ) : null}

          {ticketAvailable ? (
            <Alert
              severity={hasSimpleContactPhone ? "info" : "warning"}
              sx={{
                borderRadius: 1,
                alignItems: "flex-start",
              }}
            >
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 800,
                  lineHeight: 1.35,
                }}
              >
                {helperText}
              </Typography>
            </Alert>
          ) : null}

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FieldBlock
              label="Teléfono"
              input={
                <TextField
                  fullWidth
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="Ej. 7441234567"
                  disabled={disabled || busy || !ticketAvailable}
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
            />

            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: { xs: "flex-start", md: "flex-end" },
              }}
            >
              <Button
                fullWidth
                variant="contained"
                startIcon={<SendRoundedIcon />}
                onClick={handleSend}
                disabled={!canSend}
                sx={{
                  height: 44,
                  borderRadius: 2,
                  fontWeight: 800,
                  bgcolor: "#25D366",
                  "&:hover": {
                    bgcolor: "#1DA851",
                  },
                }}
              >
                {busy ? "Enviando…" : "Enviar ticket"}
              </Button>
            </Box>
          </Stack>

          {showSaveContact ? (
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                backgroundColor: "#FCFCFC",
                px: 1.5,
                py: 1,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={saveContact}
                    onChange={(e) => setSaveContact(e.target.checked)}
                    disabled={disabled || busy || !ticketAvailable}
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
                      Útil para reenviar el ticket o consultar el contacto después.
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
        </Stack>
      </CardContent>
    </Card>
  );
}

function FieldBlock({ label, input }) {
  return (
    <Box sx={{ flex: 1, width: "100%" }}>
      <Typography sx={fieldLabelSx}>{label}</Typography>
      {input}
    </Box>
  );
}

const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
  mb: 1,
};