import { useMemo } from "react";

import {
  Box, Button, FormControlLabel, Paper, Stack, Switch, TextField, Typography,
} from "@mui/material";

import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";

export default function TicketWhasapoSettingsCard({
  form,
  onChange,
  onSave,
  onReset,
  saving = false,
  disabled = false,
}) {
  const canSave = useMemo(() => {
    if (!form?.use_custom_token) {
      return true;
    }

    return String(form?.custom_token || "").trim() !== "";
  }, [form]);

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
              Conexión de WhatsApp
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 13,
                color: "text.secondary",
                lineHeight: 1.55,
              }}
            >
              Puedes conectar tu propia cuenta de Whasapo para enviar tickets desde tu número.
            </Typography>
          </Box>
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
          <Stack spacing={1}>
            <FormControlLabel
              sx={{ m: 0 }}
              control={
                <Switch
                  checked={!!form?.use_custom_token}
                  onChange={(e) =>
                    onChange("use_custom_token", e.target.checked)
                  }
                  disabled={disabled || saving}
                  color="success"
                />
              }
              label={
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "text.primary",
                  }}
                >
                  Usar token personalizado
                </Typography>
              }
            />

            <Typography
              sx={{
                fontSize: 12,
                color: "text.secondary",
                lineHeight: 1.6,
              }}
            >
              Si está desactivado, se utilizará el WhatsApp principal del sistema.
            </Typography>
          </Stack>
        </Box>

        {form?.use_custom_token ? (
          <FieldBlock
            label="Token de Whasapo"
            help="Pega aquí el token que te proporciona Whasapo para tu conexión."
            input={
              <TextField
                value={form?.custom_token || ""}
                onChange={(e) => onChange("custom_token", e.target.value)}
                placeholder="Ej. ey1457878787878787878..."
                fullWidth
                multiline
                minRows={4}
                disabled={disabled || saving}
                InputProps={{
                  startAdornment: (
                    <Box
                      sx={{
                        mr: 1,
                        mt: 1,
                        display: "grid",
                        placeItems: "center",
                        color: "text.secondary",
                      }}
                    >
                      <KeyOutlinedIcon fontSize="small" />
                    </Box>
                  ),
                }}
              />
            }
          />
        ) : null}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button
            variant="contained"
            startIcon={<SaveOutlinedIcon />}
            disabled={!canSave || disabled || saving}
            onClick={onSave}
            sx={{
              height: 44,
              borderRadius: 2,
              fontWeight: 800,
              minWidth: { xs: "100%", sm: 220 },
            }}
          >
            {saving ? "Guardando..." : "Guardar configuración"}
          </Button>

          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteOutlineOutlinedIcon />}
            disabled={disabled || saving}
            onClick={onReset}
            sx={{
              height: 44,
              borderRadius: 2,
              fontWeight: 800,
              minWidth: { xs: "100%", sm: 220 },
            }}
          >
            Restablecer
          </Button>
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
              fontSize: 12.5,
              color: "text.secondary",
              lineHeight: 1.7,
            }}
          >
            Importante: si tu sesión de WhatsApp se desconecta en Whasapo,
            deberás volver a escanear el QR desde tu cuenta de Whasapo. El token
            normalmente seguirá siendo el mismo.
          </Typography>
        </Box>
      </Stack>
    </Paper>
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