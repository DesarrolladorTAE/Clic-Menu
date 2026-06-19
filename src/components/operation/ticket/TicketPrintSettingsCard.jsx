import { useMemo } from "react";

import {
  Box, Button, Chip, Divider, FormControl, FormControlLabel, InputLabel, MenuItem, Paper, Select, Stack, Switch, Typography,
} from "@mui/material";

import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import DesktopWindowsOutlinedIcon from "@mui/icons-material/DesktopWindowsOutlined";
import AndroidOutlinedIcon from "@mui/icons-material/AndroidOutlined";

const WINDOWS_PRINTER_APP_URL =
  "https://clicmenu.com.mx/downloads/ClicMenuPrinter_Setup_v1.0.0.exe";

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
        
        <Divider />

        <Box
          sx={{
            border: "1px solid",
            borderColor: "rgba(199,102,24,0.18)",
            borderRadius: 0,
            bgcolor: "#FFF7F3",
            p: { xs: 1.75, sm: 2 },
          }}
        >
          <Stack spacing={2}>
            <Box>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: 15,
                      fontWeight: 900,
                      color: "text.primary",
                    }}
                  >
                    Aplicaciones necesarias
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: 12.5,
                      color: "text.secondary",
                      lineHeight: 1.55,
                      maxWidth: 760,
                    }}
                  >
                    Para imprimir tickets térmicos, instala la app correspondiente al
                    tipo de impresión que elegiste para esta sucursal.
                  </Typography>
                </Box>

                <Chip
                  label="Después de guardar"
                  size="small"
                  sx={{
                    fontWeight: 800,
                    color: "#9A4F1A",
                    bgcolor: "rgba(199,102,24,0.12)",
                    borderRadius: 1,
                  }}
                />
              </Stack>
            </Box>

            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
              <PrinterAppDownloadItem
                icon={<DesktopWindowsOutlinedIcon />}
                title="Clic Menu Printer Windows"
                subtitle="Para cajas o computadoras con impresoras térmicas USB o TCP/IP."
                status="Disponible"
                buttonText="Descargar app Windows"
                href={WINDOWS_PRINTER_APP_URL}
                disabled={disabled}
              />

              <PrinterAppDownloadItem
                icon={<AndroidOutlinedIcon />}
                title="Clic Menu Printer Android"
                subtitle="Para tablets o celulares compatibles con USB OTG."
                status="Próximamente"
                buttonText="Próximamente"
                disabled
              />
            </Stack>
          </Stack>
        </Box>



      </Stack>
    </Paper>
  );
}


function PrinterAppDownloadItem({
  icon,
  title,
  subtitle,
  status,
  buttonText,
  href,
  disabled = false,
}) {
  const available = Boolean(href) && !disabled;

  return (
    <Box
      sx={{
        flex: 1,
        border: "1px solid",
        borderColor: available ? "rgba(199,102,24,0.24)" : "divider",
        borderRadius: 2,
        bgcolor: "background.paper",
        p: 1.5,
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 1.5,
              display: "grid",
              placeItems: "center",
              bgcolor: available
                ? "rgba(199,102,24,0.12)"
                : "rgba(0,0,0,0.05)",
              color: available ? "#9A4F1A" : "text.disabled",
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
            >
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 900,
                  color: "text.primary",
                }}
              >
                {title}
              </Typography>

              <Chip
                label={status}
                size="small"
                sx={{
                  height: 22,
                  fontSize: 11,
                  fontWeight: 800,
                  color: available ? "#9A4F1A" : "text.secondary",
                  bgcolor: available
                    ? "rgba(199,102,24,0.12)"
                    : "rgba(0,0,0,0.06)",
                }}
              />
            </Stack>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 12,
                color: "text.secondary",
                lineHeight: 1.45,
              }}
            >
              {subtitle}
            </Typography>
          </Box>
        </Stack>

        <Button
          variant={available ? "contained" : "outlined"}
          startIcon={<DownloadOutlinedIcon />}
          disabled={!available}
          onClick={() => {
            if (!href) return;
            window.open(href, "_blank", "noopener,noreferrer");
          }}
          sx={{
            alignSelf: { xs: "stretch", sm: "flex-start" },
            height: 38,
            borderRadius: 2,
            fontWeight: 800,
            px: 2,
            ...(available && {
              bgcolor: "#B65F2A",
              color: "#fff",
              boxShadow: "none",
              "&:hover": {
                bgcolor: "#9A4F1A",
                boxShadow: "none",
              },
            }),
          }}
        >
          {buttonText}
        </Button>
      </Stack>
    </Box>
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