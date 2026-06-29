import { useEffect, useMemo, useState } from "react";
import {
  Alert, Box, Button, CircularProgress, MenuItem, Paper, Stack, TextField, Typography,
} from "@mui/material";

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

function isValidRfc(value) {
  const rfc = clean(value).toUpperCase();

  if (!rfc) return false;

  if (![12, 13].includes(rfc.length)) {
    return false;
  }

  if (!/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/u.test(rfc)) {
    return false;
  }

  const dateStart = rfc.length === 12 ? 3 : 4;
  const datePart = rfc.slice(dateStart, dateStart + 6);

  const year = Number(datePart.slice(0, 2));
  const month = Number(datePart.slice(2, 4));
  const day = Number(datePart.slice(4, 6));

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return false;
  }

  if (month < 1 || month > 12) {
    return false;
  }

  if (day < 1 || day > 31) {
    return false;
  }

  const testDate = new Date(2000 + year, month - 1, day);

  return (
    testDate.getFullYear() === 2000 + year &&
    testDate.getMonth() === month - 1 &&
    testDate.getDate() === day
  );
}

function isKnownOption(options, value) {
  const cleanValue = clean(value);

  return options.some((option) => option.value === cleanValue);
}

function validate(form, invoiceMode) {
  const errors = {};

  const clienteRFC = clean(form.clienteRFC).toUpperCase();
  const nombre = clean(form.Nombre);
  const regimenFiscal = clean(form.RegimenFiscalReceptor);
  const codigoPostal = clean(form.DomicilioFiscalReceptor);
  const usoCfdi = clean(form.usoCfdi).toUpperCase();
  const correo = clean(form.clienteCorreo);
  const billingMode = clean(form.billing_mode);

  if (!clienteRFC) {
    errors.clienteRFC = "Debes ingresar el RFC.";
  } else if (![12, 13].includes(clienteRFC.length)) {
    errors.clienteRFC = "El RFC debe tener 12 o 13 caracteres.";
  } else if (!isValidRfc(clienteRFC)) {
    errors.clienteRFC =
      "El RFC no tiene un formato válido. Revisa letras iniciales, fecha y homoclave.";
  }

  if (!nombre) {
    errors.Nombre = "Debes ingresar la razón social o nombre fiscal.";
  } else if (nombre.length > 255) {
    errors.Nombre = "El nombre fiscal no puede exceder 255 caracteres.";
  }

  if (!regimenFiscal) {
    errors.RegimenFiscalReceptor = "Debes seleccionar el régimen fiscal.";
  } else if (!isKnownOption(REGIMEN_OPTIONS, regimenFiscal)) {
    errors.RegimenFiscalReceptor = "El régimen fiscal seleccionado no es válido.";
  }

  if (!codigoPostal) {
    errors.DomicilioFiscalReceptor = "Debes ingresar el código postal fiscal.";
  } else if (!/^[0-9]{5}$/.test(codigoPostal)) {
    errors.DomicilioFiscalReceptor =
      "El código postal fiscal debe contener solo números y tener 5 dígitos.";
  }

  if (!usoCfdi) {
    errors.usoCfdi = "Debes seleccionar el uso CFDI.";
  } else if (!isKnownOption(USO_CFDI_OPTIONS, usoCfdi)) {
    errors.usoCfdi = "El uso CFDI seleccionado no es válido.";
  }

  if (correo && !isValidEmail(correo)) {
    errors.clienteCorreo = "El correo no tiene un formato válido.";
  }

  if (correo.length > 190) {
    errors.clienteCorreo = "El correo no puede exceder 190 caracteres.";
  }

  if (invoiceMode === "both" && !billingMode) {
    errors.billing_mode = "Debes seleccionar el modo de facturación.";
  } else if (
    invoiceMode === "both" &&
    !isKnownOption(BILLING_MODE_OPTIONS, billingMode)
  ) {
    errors.billing_mode = "El modo de facturación seleccionado no es válido.";
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
      Nombre: clean(form.Nombre).replace(/\s+/g, " "),
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

                  <FieldBlock
                    label="Modo de facturación *"
                    input={
                      <TextField
                        select
                        value={form.billing_mode}
                        disabled={submitting}
                        onChange={(e) => setField("billing_mode", e.target.value)}
                        error={!!getError(mergedErrors, "billing_mode")}
                        helperText={getError(mergedErrors, "billing_mode")}
                      >
                        <MenuItem value="">Selecciona una opción</MenuItem>
                        {BILLING_MODE_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    }
                  />
                </Stack>
              </Box>
            ) : null}

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <FieldBlock
                label="RFC *"
                help={
                  !getError(mergedErrors, "clienteRFC")
                    ? "Debe tener 12 o 13 caracteres, con fecha y homoclave."
                    : ""
                }
                input={
                  <TextField
                    value={form.clienteRFC}
                    disabled={submitting}
                    placeholder="Ej. XAXX010101000"
                    onChange={(e) =>
                      setField(
                        "clienteRFC",
                        e.target.value
                          .toUpperCase()
                          .replace(/\s/g, "")
                          .slice(0, 13)
                      )
                    }
                    error={!!getError(mergedErrors, "clienteRFC")}
                    helperText={getError(mergedErrors, "clienteRFC")}
                  />
                }
              />

              <FieldBlock
                label="Código postal fiscal *"
                help={
                  !getError(mergedErrors, "DomicilioFiscalReceptor")
                    ? "Debe contener exactamente 5 dígitos."
                    : ""
                }
                input={
                  <TextField
                    value={form.DomicilioFiscalReceptor}
                    disabled={submitting}
                    placeholder="Ej. 39300"
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
                    helperText={getError(mergedErrors, "DomicilioFiscalReceptor")}
                  />
                }
              />
            </Stack>

            <FieldBlock
              label="Razón social / Nombre fiscal *"
              input={
                <TextField
                  value={form.Nombre}
                  disabled={submitting}
                  placeholder="Ej. TECNOLOGIAS ADMINISTRATIVAS"
                  onChange={(e) => setField("Nombre", e.target.value)}
                  error={!!getError(mergedErrors, "Nombre")}
                  helperText={getError(mergedErrors, "Nombre")}
                />
              }
            />

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <FieldBlock
                label="Régimen fiscal *"
                input={
                  <TextField
                    select
                    value={form.RegimenFiscalReceptor}
                    disabled={submitting}
                    onChange={(e) =>
                      setField("RegimenFiscalReceptor", e.target.value)
                    }
                    error={!!getError(mergedErrors, "RegimenFiscalReceptor")}
                    helperText={getError(mergedErrors, "RegimenFiscalReceptor")}
                  >
                    <MenuItem value="">Selecciona régimen fiscal</MenuItem>
                    {REGIMEN_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                }
              />

              <FieldBlock
                label="Uso CFDI *"
                input={
                  <TextField
                    select
                    value={form.usoCfdi}
                    disabled={submitting}
                    onChange={(e) => setField("usoCfdi", e.target.value)}
                    error={!!getError(mergedErrors, "usoCfdi")}
                    helperText={getError(mergedErrors, "usoCfdi")}
                  >
                    <MenuItem value="">Selecciona uso CFDI</MenuItem>
                    {USO_CFDI_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                }
              />
            </Stack>

            <FieldBlock
              label="Correo electrónico"
              help={
                !getError(mergedErrors, "clienteCorreo")
                  ? "Opcional. Lo usaremos solo como referencia del timbrado."
                  : ""
              }
              input={
                <TextField
                  value={form.clienteCorreo}
                  disabled={submitting}
                  placeholder="Ej. correo@dominio.com"
                  inputProps={{
                    inputMode: "email",
                  }}
                  onChange={(e) =>
                    setField("clienteCorreo", e.target.value.toLowerCase())
                  }
                  error={!!getError(mergedErrors, "clienteCorreo")}
                  helperText={getError(mergedErrors, "clienteCorreo")}
                />
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
                Antes de timbrar, revisa que RFC, nombre fiscal, régimen fiscal,
                código postal y uso CFDI coincidan con tu constancia fiscal. Si
                algún dato es incorrecto, el SAT o el PAC pueden rechazar el
                timbrado.
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