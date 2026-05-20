import { Box, Paper, Stack, TextField, Typography } from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import AlternateEmailOutlinedIcon from "@mui/icons-material/AlternateEmailOutlined";

export default function TicketWhatsappMessageSettingsCard({
  form,
  onChange,
  disabled = false,
}) {
  const handlePhoneChange = (value) => {
    const cleanValue = String(value || "")
      .replace(/[^\d\s+\-()]/g, "")
      .slice(0, 30);

    onChange("whatsapp_contact_phone", cleanValue);
  };

  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 1,
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
      }}
    >
      <Stack spacing={2.5}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 1.5,
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(37, 211, 102, 0.14)",
              color: "#25D366",
              flexShrink: 0,
            }}
          >
            <WhatsAppIcon />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              Mensaje de WhatsApp del ticket
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 13,
                color: "text.secondary",
                lineHeight: 1.55,
              }}
            >
              Estos datos aparecerán en el cuerpo del mensaje cuando se envíe el
              ticket por WhatsApp.
            </Typography>
          </Box>
        </Stack>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <FieldBlock
            label="Teléfono para dudas o aclaraciones"
            help="Este teléfono aparecerá en el mensaje del ticket. No tiene que ser el mismo número que envía WhatsApp."
            input={
              <TextField
                value={form.whatsapp_contact_phone || ""}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="Ej. 7441234567"
                fullWidth
                disabled={disabled}
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
                      <PhoneOutlinedIcon fontSize="small" />
                    </Box>
                  ),
                }}
              />
            }
          />

          <FieldBlock
            label="Correo para dudas o aclaraciones"
            help="Este correo aparecerá en el mensaje del ticket."
            input={
              <TextField
                value={form.whatsapp_contact_email || ""}
                onChange={(e) =>
                  onChange("whatsapp_contact_email", e.target.value)
                }
                placeholder="Ej. contacto@restaurante.com"
                fullWidth
                disabled={disabled}
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
                      <AlternateEmailOutlinedIcon fontSize="small" />
                    </Box>
                  ),
                }}
              />
            }
          />
        </Stack>

        <Box
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            backgroundColor: "background.default",
            p: 1.75,
          }}
        >
          <Typography
            sx={{
              fontSize: 13,
              color: "text.secondary",
              lineHeight: 1.6,
            }}
          >
            Ejemplo del mensaje: “Muchas gracias por tu compra. Te compartimos
            tu ticket.” Si agregas teléfono o correo, se añadirá una sección de
            dudas o aclaraciones debajo del mensaje principal.
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

function FieldBlock({ label, input, help }) {
  return (
    <Box sx={{ flex: 1, width: "100%" }}>
      <Typography sx={fieldLabelSx}>{label}</Typography>

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

const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
  mb: 1,
};