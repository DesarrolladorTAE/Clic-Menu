import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, CircularProgress, Dialog, DialogContent, DialogTitle, FormControlLabel,
  IconButton, MenuItem, Radio, RadioGroup, Stack, TextField, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";

import {
  createSystemPlatformInvoice,
  SYSTEM_INVOICE_MODES,
} from "../../../../services/system-admin/billing/platformBilling.service";

const USO_CFDI_OPTIONS = [
  ["G01", "Adquisición de mercancías"],
  ["G02", "Devoluciones, descuentos o bonificaciones"],
  ["G03", "Gastos en general"],
  ["I01", "Construcciones"],
  ["I02", "Mobiliario y equipo de oficina por inversiones"],
  ["I03", "Equipo de transporte"],
  ["I04", "Equipo de cómputo y accesorios"],
  ["I05", "Dados, troqueles, moldes, matrices y herramental"],
  ["I06", "Comunicaciones telefónicas"],
  ["I07", "Comunicaciones satelitales"],
  ["I08", "Otra maquinaria y equipo"],
  ["D01", "Honorarios médicos, dentales y gastos hospitalarios"],
  ["D02", "Gastos médicos por incapacidad o discapacidad"],
  ["D03", "Gastos funerales"],
  ["D04", "Donativos"],
  ["D05", "Intereses reales efectivamente pagados por créditos hipotecarios"],
  ["D06", "Aportaciones voluntarias al SAR"],
  ["D07", "Primas por seguros de gastos médicos"],
  ["D08", "Gastos de transportación escolar obligatoria"],
  ["D09", "Depósitos en cuentas para el ahorro y planes de pensiones"],
  ["D10", "Pagos por servicios educativos"],
  ["CP01", "Pagos"],
  ["CN01", "Nómina"],
  ["S01", "Sin efectos fiscales"],
];

export default function SystemPlatformInvoiceModal({
  open,
  purchases = [],
  compatibility,
  onClose,
  onCompleted,
  onAlert,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [mode, setMode] = useState("");
  const [usoCfdi, setUsoCfdi] = useState("G03");
  const [saving, setSaving] = useState(false);

  const owner = purchases?.[0]?.owner || null;

  const total = useMemo(() => {
    return purchases.reduce((sum, purchase) => sum + Number(purchase?.amount || 0), 0);
  }, [purchases]);

  useEffect(() => {
    if (!open) return;

    if (compatibility?.owner) setMode(SYSTEM_INVOICE_MODES.OWNER);
    else if (compatibility?.publicGeneral) setMode(SYSTEM_INVOICE_MODES.PUBLIC_GENERAL);
    else setMode("");

    setUsoCfdi("G03");
    setSaving(false);
  }, [open, compatibility?.owner, compatibility?.publicGeneral]);

  const canSubmit = useMemo(() => {
    if (!purchases.length || saving) return false;

    if (mode === SYSTEM_INVOICE_MODES.OWNER) {
      return compatibility?.owner === true && !!owner?.id && !!usoCfdi;
    }

    if (mode === SYSTEM_INVOICE_MODES.PUBLIC_GENERAL) {
      return compatibility?.publicGeneral === true;
    }

    return false;
  }, [purchases, saving, mode, compatibility, owner, usoCfdi]);

  const submit = async () => {
    if (!canSubmit) return;

    const payload = {
      mode,
      items: purchases.map((purchase) => ({
        source_type: purchase.source_type,
        source_id: Number(purchase.source_id),
      })),
    };

    if (mode === SYSTEM_INVOICE_MODES.OWNER) {
      payload.owner_id = Number(owner.id);
      payload.uso_cfdi = usoCfdi;
    }

    setSaving(true);

    try {
      const res = await createSystemPlatformInvoice(payload);
      await onCompleted?.(res);
      onClose?.();
    } catch (error) {
      const response = error?.response?.data;

      /*
       * Una factura fallida ya pudo quedar reservada aunque el servidor
       * responda 422. En ese caso actualizamos la pantalla para mostrar
       * su nuevo estado y evitar que se vuelva a facturar.
       */
      if (response?.data?.id) {
        await onCompleted?.(response);
        onClose?.();
      } else {
        onAlert?.({
          severity: "error",
          title: "No se pudo generar la factura",
          message: apiMessage(error, "Revisa la información e intenta nuevamente."),
        });
      }
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullScreen={isMobile}
      fullWidth={false}
      maxWidth={false}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100%", sm: 700 },
            maxHeight: { xs: "100%", sm: "90vh" },
            borderRadius: { xs: 0, sm: 1 },
            overflow: "hidden",
            bgcolor: "background.paper",
          },
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
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: { xs: 20, sm: 24 },
                fontWeight: 800,
                lineHeight: 1.2,
                color: "#fff",
              }}
            >
              Generar factura
            </Typography>

            <Typography sx={{ mt: 0.5, fontSize: 13, color: "rgba(255,255,255,0.82)" }}>
              Revisa el destino fiscal de los movimientos seleccionados.
            </Typography>
          </Box>

          <IconButton
            onClick={onClose}
            disabled={saving}
            aria-label="Cerrar"
            sx={{
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.08)",
              borderRadius: 1,
              "&:hover": { bgcolor: "rgba(255,255,255,0.16)" },
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
          overflowY: "auto",
        }}
      >
        <Stack spacing={2.5}>
          <Box
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              bgcolor: "background.paper",
            }}
          >
            <Typography sx={{ fontSize: 16, fontWeight: 800, color: "text.primary" }}>
              Resumen
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              spacing={1.5}
              sx={{ mt: 1.5 }}
            >
              <Box>
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  Movimientos seleccionados
                </Typography>

                <Typography sx={{ mt: 0.25, fontSize: 16, fontWeight: 800 }}>
                  {purchases.length}
                </Typography>
              </Box>

              <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  Importe total
                </Typography>

                <Typography sx={{ mt: 0.25, fontSize: 20, fontWeight: 900, color: "text.primary" }}>
                  {formatCurrency(total, purchases?.[0]?.currency)}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Box
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              bgcolor: "background.paper",
            }}
          >
            <Typography sx={{ mb: 1.5, fontSize: 16, fontWeight: 800, color: "text.primary" }}>
              Receptor de la factura
            </Typography>

            <RadioGroup value={mode} onChange={(e) => setMode(e.target.value)}>
              <Stack spacing={1.25}>
                <ModeOption
                  value={SYSTEM_INVOICE_MODES.OWNER}
                  checked={mode === SYSTEM_INVOICE_MODES.OWNER}
                  disabled={!compatibility?.owner}
                  title="Factura al propietario"
                  description={
                    compatibility?.owner
                      ? ownerName(owner)
                      : "Los movimientos seleccionados no pueden facturarse juntos a un propietario."
                  }
                />

                <ModeOption
                  value={SYSTEM_INVOICE_MODES.PUBLIC_GENERAL}
                  checked={mode === SYSTEM_INVOICE_MODES.PUBLIC_GENERAL}
                  disabled={!compatibility?.publicGeneral}
                  title="Público General"
                  description={
                    compatibility?.publicGeneral
                      ? "Genera la factura utilizando los datos fiscales generales configurados en Clic Menu."
                      : "Estos movimientos todavía no están disponibles para Público General."
                  }
                />
              </Stack>
            </RadioGroup>
          </Box>

          {mode === SYSTEM_INVOICE_MODES.OWNER ? (
            <Box
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                bgcolor: "background.paper",
              }}
            >
              <Typography sx={{ fontSize: 16, fontWeight: 800, color: "text.primary" }}>
                Factura del propietario
              </Typography>

              <Box
                sx={{
                  mt: 1.5,
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                  gap: 1.5,
                }}
              >
                <InfoBlock label="Propietario" value={ownerName(owner)} />
                <InfoBlock label="Correo" value={owner?.email || "—"} />
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography sx={fieldLabelSx}>Uso CFDI *</Typography>

                <TextField
                  select
                  fullWidth
                  value={usoCfdi}
                  disabled={saving}
                  onChange={(e) => setUsoCfdi(e.target.value)}
                >
                  {USO_CFDI_OPTIONS.map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {value} - {label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Typography sx={{ mt: 1.25, fontSize: 12, color: "text.secondary", lineHeight: 1.5 }}>
                Se utilizarán los datos fiscales registrados en la cuenta del propietario.
              </Typography>
            </Box>
          ) : null}

          <Stack
            direction={{ xs: "column-reverse", sm: "row" }}
            justifyContent="flex-end"
            spacing={1.5}
          >
            <Button
              variant="outlined"
              disabled={saving}
              onClick={onClose}
              sx={{ minWidth: { xs: "100%", sm: 150 }, height: 44 }}
            >
              Cancelar
            </Button>

            <Button
              variant="contained"
              disabled={!canSubmit}
              onClick={submit}
              startIcon={
                saving
                  ? <CircularProgress size={17} color="inherit" />
                  : <ReceiptLongRoundedIcon />
              }
              sx={{ minWidth: { xs: "100%", sm: 190 }, height: 44, fontWeight: 800 }}
            >
              {saving ? "Generando…" : "Generar factura"}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

function ModeOption({ value, checked, disabled, title, description }) {
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: checked ? "primary.main" : "divider",
        borderRadius: 1,
        bgcolor: checked ? "rgba(255,152,0,0.045)" : "#fff",
        opacity: disabled ? 0.55 : 1,
        transition: "border-color 0.18s ease, background-color 0.18s ease",
      }}
    >
      <FormControlLabel
        value={value}
        disabled={disabled}
        control={<Radio color="primary" />}
        sx={{
          m: 0,
          px: 1.25,
          py: 1,
          width: "100%",
          alignItems: "flex-start",
        }}
        label={
          <Box sx={{ pt: 0.45 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
              {title}
            </Typography>

            <Typography sx={{ mt: 0.25, fontSize: 12, color: "text.secondary", lineHeight: 1.45 }}>
              {description}
            </Typography>
          </Box>
        }
      />
    </Box>
  );
}

function InfoBlock({ label, value }) {
  return (
    <Box
      sx={{
        p: 1.4,
        borderRadius: 1,
        bgcolor: "rgba(0,0,0,0.025)",
      }}
    >
      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{label}</Typography>
      <Typography sx={{ mt: 0.25, fontSize: 13, fontWeight: 700, wordBreak: "break-word" }}>
        {value || "—"}
      </Typography>
    </Box>
  );
}

function ownerName(owner) {
  if (!owner) return "—";

  return owner.full_name || [owner.name, owner.last_name_paternal, owner.last_name_maternal]
    .filter(Boolean)
    .join(" ") || "—";
}

function formatCurrency(value, currency = "MXN") {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency || "MXN",
  }).format(number);
}

function apiMessage(error, fallback) {
  const data = error?.response?.data;
  const firstError = data?.errors ? Object.values(data.errors).flat()?.[0] : null;
  return firstError || data?.message || fallback;
}

const fieldLabelSx = {
  mb: 1,
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
};