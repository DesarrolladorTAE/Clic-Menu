import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";

const REGIMEN_OPTIONS = [
  { value: "601", label: "601 - General de Ley Personas Morales" },
  { value: "603", label: "603 - Personas Morales con Fines no Lucrativos" },
  { value: "605", label: "605 - Sueldos y Salarios e Ingresos Asimilados" },
  { value: "606", label: "606 - Arrendamiento" },
  { value: "607", label: "607 - Régimen de Enajenación o Adquisición de Bienes" },
  { value: "608", label: "608 - Demás ingresos" },
  { value: "610", label: "610 - Residentes en el Extranjero" },
  { value: "611", label: "611 - Ingresos por Dividendos" },
  { value: "612", label: "612 - Personas Físicas con Actividades Empresariales" },
  { value: "614", label: "614 - Ingresos por intereses" },
  { value: "615", label: "615 - Obtención de premios" },
  { value: "616", label: "616 - Sin obligaciones fiscales" },
  { value: "621", label: "621 - Incorporación Fiscal" },
  { value: "622", label: "622 - Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras" },
  { value: "623", label: "623 - Opcional para Grupos de Sociedades" },
  { value: "624", label: "624 - Coordinados" },
  { value: "625", label: "625 - Plataformas Tecnológicas" },
  { value: "626", label: "626 - Régimen Simplificado de Confianza" },
];

const USO_CFDI_OPTIONS = [
  { value: "G01", label: "G01 - Adquisición de mercancías" },
  { value: "G02", label: "G02 - Devoluciones, descuentos o bonificaciones" },
  { value: "G03", label: "G03 - Gastos en general" },
  { value: "I01", label: "I01 - Construcciones" },
  { value: "I02", label: "I02 - Mobiliario y equipo de oficina" },
  { value: "I03", label: "I03 - Equipo de transporte" },
  { value: "I04", label: "I04 - Equipo de cómputo" },
  { value: "I05", label: "I05 - Dados, troqueles, moldes, matrices y herramental" },
  { value: "I06", label: "I06 - Comunicaciones telefónicas" },
  { value: "I07", label: "I07 - Comunicaciones satelitales" },
  { value: "I08", label: "I08 - Otra maquinaria y equipo" },
  { value: "D01", label: "D01 - Honorarios médicos, dentales y gastos hospitalarios" },
  { value: "D02", label: "D02 - Gastos médicos por incapacidad o discapacidad" },
  { value: "D03", label: "D03 - Gastos funerales" },
  { value: "D04", label: "D04 - Donativos" },
  { value: "D05", label: "D05 - Intereses reales por créditos hipotecarios" },
  { value: "D06", label: "D06 - Aportaciones voluntarias al SAR" },
  { value: "D07", label: "D07 - Primas por seguros de gastos médicos" },
  { value: "D08", label: "D08 - Gastos de transportación escolar" },
  { value: "D09", label: "D09 - Depósitos en cuentas para el ahorro" },
  { value: "D10", label: "D10 - Pagos por servicios educativos" },
  { value: "CP01", label: "CP01 - Pagos" },
  { value: "CN01", label: "CN01 - Nómina" },
  { value: "S01", label: "S01 - Sin efectos fiscales" },
];

const BILLING_MODE_OPTIONS = [
  { value: "global", label: "Facturación global" },
  { value: "per_product", label: "Facturación por producto" },
];

const DEFAULT_FORM = {
  clienteRFC: "",
  Nombre: "",
  RegimenFiscalReceptor: "",
  DomicilioFiscalReceptor: "",
  usoCfdi: "",
  clienteCorreo: "",
  billing_mode: "",
};

function clean(value) {
  return String(value || "").trim();
}

function getError(errors, field) {
  const value = errors?.[field];

  if (!value) return "";

  if (Array.isArray(value)) return value[0] || "";

  return String(value);
}

function isValidEmail(value) {
  if (!value) return true;

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validate(form, invoiceMode) {
  const errors = {};

  if (!clean(form.clienteRFC)) {
    errors.clienteRFC = "Debes ingresar el RFC.";
  } else if (clean(form.clienteRFC).length > 13) {
    errors.clienteRFC = "El RFC no puede exceder 13 caracteres.";
  }

  if (!clean(form.Nombre)) {
    errors.Nombre = "Debes ingresar la razón social o nombre fiscal.";
  } else if (clean(form.Nombre).length > 255) {
    errors.Nombre = "El nombre fiscal no puede exceder 255 caracteres.";
  }

  if (!clean(form.RegimenFiscalReceptor)) {
    errors.RegimenFiscalReceptor = "Debes seleccionar el régimen fiscal.";
  }

  if (!clean(form.DomicilioFiscalReceptor)) {
    errors.DomicilioFiscalReceptor = "Debes ingresar el código postal fiscal.";
  } else if (clean(form.DomicilioFiscalReceptor).length !== 5) {
    errors.DomicilioFiscalReceptor =
      "El código postal fiscal debe tener 5 caracteres.";
  }

  if (!clean(form.usoCfdi)) {
    errors.usoCfdi = "Debes seleccionar el uso CFDI.";
  }

  if (clean(form.clienteCorreo) && !isValidEmail(clean(form.clienteCorreo))) {
    errors.clienteCorreo = "El correo no tiene un formato válido.";
  }

  if (invoiceMode === "both" && !clean(form.billing_mode)) {
    errors.billing_mode = "Debes seleccionar el modo de facturación.";
  }

  return errors;
}

export default function PublicInvoiceForm({
  invoiceMode,
  onSubmit,
  submitting = false,
  apiErrors = {},
  generalError = "",
}) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [localErrors, setLocalErrors] = useState({});

  const needsBillingMode = invoiceMode === "both";

  const mergedErrors = useMemo(() => {
    return {
      ...apiErrors,
      ...localErrors,
    };
  }, [apiErrors, localErrors]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      billing_mode: invoiceMode === "both" ? prev.billing_mode : "",
    }));
    setLocalErrors({});
  }, [invoiceMode]);

  const setField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setLocalErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = validate(form, invoiceMode);
    setLocalErrors(errors);

    if (Object.keys(errors).length > 0) return;

    const payload = {
      clienteRFC: clean(form.clienteRFC).toUpperCase(),
      Nombre: clean(form.Nombre),
      RegimenFiscalReceptor: clean(form.RegimenFiscalReceptor),
      DomicilioFiscalReceptor: clean(form.DomicilioFiscalReceptor),
      usoCfdi: clean(form.usoCfdi).toUpperCase(),
      clienteCorreo: clean(form.clienteCorreo) || null,
    };

    if (needsBillingMode) {
      payload.billing_mode = clean(form.billing_mode);
    }

    await onSubmit(payload);
  };

  return (
    <Paper
      sx={{
        width: "100%",
        p: 0,
        overflow: "hidden",
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        boxShadow: "none",
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
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
              flexShrink: 0,
            }}
          >
            <BadgeOutlinedIcon />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 900,
                color: "text.primary",
              }}
            >
              Datos fiscales
            </Typography>

            <Typography
              sx={{
                mt: 0.25,
                fontSize: 13,
                color: "text.secondary",
                lineHeight: 1.45,
              }}
            >
              Captura tus datos tal como aparecen en tu constancia fiscal.
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2.25}>
            {generalError ? (
              <Alert
                severity="error"
                sx={{
                  borderRadius: 1,
                  alignItems: "flex-start",
                  whiteSpace: "pre-line",
                }}
              >
                <Typography variant="body2">{generalError}</Typography>
              </Alert>
            ) : null}

            {needsBillingMode ? (
              <Box
                sx={{
                  p: 1.75,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  borderLeft: "5px solid",
                  borderLeftColor: "primary.main",
                  backgroundColor: "background.default",
                }}
              >
                <Stack spacing={1.5}>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 15,
                        fontWeight: 900,
                        color: "primary.main",
                      }}
                    >
                      Modo de facturación
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.5,
                        fontSize: 13,
                        color: "text.secondary",
                        lineHeight: 1.5,
                      }}
                    >
                      El restaurante permite elegir cómo se generará la factura.
                    </Typography>
                  </Box>

                  <TextField
                    select
                    fullWidth
                    label="Modo de facturación"
                    value={form.billing_mode}
                    disabled={submitting}
                    onChange={(e) => setField("billing_mode", e.target.value)}
                    error={!!getError(mergedErrors, "billing_mode")}
                    helperText={getError(mergedErrors, "billing_mode")}
                    SelectProps={{
                      IconComponent: KeyboardArrowDownIcon,
                    }}
                  >
                    <MenuItem value="">Selecciona una opción</MenuItem>
                    {BILLING_MODE_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
              </Box>
            ) : null}

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                fullWidth
                label="RFC"
                value={form.clienteRFC}
                disabled={submitting}
                onChange={(e) =>
                  setField(
                    "clienteRFC",
                    e.target.value.toUpperCase().slice(0, 13)
                  )
                }
                error={!!getError(mergedErrors, "clienteRFC")}
                helperText={
                  getError(mergedErrors, "clienteRFC") ||
                  "Máximo 13 caracteres."
                }
              />

              <TextField
                fullWidth
                label="Código postal fiscal"
                value={form.DomicilioFiscalReceptor}
                disabled={submitting}
                inputProps={{
                  inputMode: "numeric",
                  maxLength: 5,
                }}
                onChange={(e) =>
                  setField(
                    "DomicilioFiscalReceptor",
                    e.target.value.replace(/\D/g, "").slice(0, 5)
                  )
                }
                error={!!getError(mergedErrors, "DomicilioFiscalReceptor")}
                helperText={
                  getError(mergedErrors, "DomicilioFiscalReceptor") ||
                  "Debe contener 5 dígitos."
                }
              />
            </Stack>

            <TextField
              fullWidth
              label="Razón social / Nombre fiscal"
              value={form.Nombre}
              disabled={submitting}
              onChange={(e) => setField("Nombre", e.target.value)}
              error={!!getError(mergedErrors, "Nombre")}
              helperText={getError(mergedErrors, "Nombre")}
            />

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                select
                fullWidth
                label="Régimen fiscal"
                value={form.RegimenFiscalReceptor}
                disabled={submitting}
                onChange={(e) =>
                  setField("RegimenFiscalReceptor", e.target.value)
                }
                error={!!getError(mergedErrors, "RegimenFiscalReceptor")}
                helperText={getError(mergedErrors, "RegimenFiscalReceptor")}
                SelectProps={{
                  IconComponent: KeyboardArrowDownIcon,
                }}
              >
                <MenuItem value="">Selecciona régimen fiscal</MenuItem>
                {REGIMEN_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                label="Uso CFDI"
                value={form.usoCfdi}
                disabled={submitting}
                onChange={(e) => setField("usoCfdi", e.target.value)}
                error={!!getError(mergedErrors, "usoCfdi")}
                helperText={getError(mergedErrors, "usoCfdi")}
                SelectProps={{
                  IconComponent: KeyboardArrowDownIcon,
                }}
              >
                <MenuItem value="">Selecciona uso CFDI</MenuItem>
                {USO_CFDI_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <TextField
              fullWidth
              label="Correo electrónico opcional"
              value={form.clienteCorreo}
              disabled={submitting}
              inputProps={{
                inputMode: "email",
              }}
              onChange={(e) =>
                setField("clienteCorreo", e.target.value.toLowerCase())
              }
              error={!!getError(mergedErrors, "clienteCorreo")}
              helperText={
                getError(mergedErrors, "clienteCorreo") ||
                "Lo usaremos solo como referencia del timbrado."
              }
            />

            <Alert
              severity="info"
              sx={{
                borderRadius: 1,
                alignItems: "flex-start",
              }}
            >
              <Typography variant="body2">
                Antes de timbrar, revisa que RFC, nombre fiscal, régimen y
                código postal coincidan con tu constancia fiscal.
              </Typography>
            </Alert>

            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              startIcon={
                submitting ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <SendOutlinedIcon />
                )
              }
              sx={{
                height: 46,
                fontWeight: 900,
              }}
            >
              {submitting ? "Timbrando…" : "Timbrar factura"}
            </Button>
          </Stack>
        </form>
      </Box>
    </Paper>
  );
}