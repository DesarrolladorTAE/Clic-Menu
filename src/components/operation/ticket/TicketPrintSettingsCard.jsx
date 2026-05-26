import { useMemo } from "react";

import {
  Box, Button, FormControl, FormControlLabel, InputLabel, MenuItem, Paper, Select, Stack, Switch, Typography,
} from "@mui/material";

import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

export default function TicketPrintSettingsCard({
  form,
  options = [],
  onChange,
  onSave,
  onReset,
  saving = false,
  disabled = false,
}) {
  const canSave = useMemo(() => {
    return !!form?.print_app_type_id;
  }, [form?.print_app_type_id]);

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
              bgcolor: "rgba(21, 101, 192, 0.14)",
              color: "#1565c0",
              flexShrink: 0,
            }}
          >
            <PrintOutlinedIcon />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              Impresión térmica
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 13,
                color: "text.secondary",
                lineHeight: 1.55,
              }}
            >
              Configura cómo se enviarán los tickets a la aplicación de
              impresión instalada en caja.
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
                  checked={!!form?.enabled}
                  onChange={(e) => onChange("enabled", e.target.checked)}
                  disabled={disabled || saving}
                  color="primary"
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
                  Habilitar impresión térmica para esta sucursal
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
              Si está desactivado, los cajeros no verán la opción de imprimir
              tickets térmicos.
            </Typography>
          </Stack>
        </Box>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <FieldBlock
            label="Tipo de aplicación"
            help="Selecciona el tipo de app que usará esta sucursal para imprimir."
            input={
              <FormControl
                fullWidth
                disabled={disabled || saving || !form?.enabled}
              >
                <InputLabel>Tipo de impresión</InputLabel>
                <Select
                  label="Tipo de impresión"
                  value={form?.print_app_type_id || ""}
                  onChange={(e) =>
                    onChange("print_app_type_id", e.target.value)
                  }
                >
                  {options.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            }
          />

          <FieldBlock
            label="Envío automático"
            help="Si está activo, el sistema intentará enviar el ticket a impresión al finalizar el pago."
            input={
              <Box
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  backgroundColor: "background.default",
                  px: 1.5,
                  py: 0.85,
                }}
              >
                <FormControlLabel
                  sx={{ m: 0 }}
                  control={
                    <Switch
                      checked={!!form?.auto_send_payload}
                      onChange={(e) =>
                        onChange("auto_send_payload", e.target.checked)
                      }
                      disabled={disabled || saving || !form?.enabled}
                      color="primary"
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
                      Autoimprimir al cobrar
                    </Typography>
                  }
                />
              </Box>
            }
          />
        </Stack>

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