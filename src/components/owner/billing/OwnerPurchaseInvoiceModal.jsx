import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box, Button, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton,
  MenuItem, Stack, TextField, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";

import { getTaxProfile } from "../../../services/owner/taxProfile.service";
import { createPlatformInvoice } from "../../../services/owner/platformBilling.service";

const CFDI_USES = [
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
  ["D05", "Intereses reales por créditos hipotecarios"],
  ["D06", "Aportaciones voluntarias al sistema de ahorro para el retiro"],
  ["D07", "Primas por seguros de gastos médicos"],
  ["D08", "Gastos de transportación escolar obligatoria"],
  ["D09", "Depósitos en cuentas para el ahorro y planes de pensiones"],
  ["D10", "Pagos por servicios educativos"],
  ["CP01", "Pagos"],
  ["CN01", "Nómina"],
  ["S01", "Sin efectos fiscales"],
];

export default function OwnerPurchaseInvoiceModal({
  open,
  purchase,
  onClose,
  onCompleted,
  onAlert,
  onEditTaxProfile,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const onAlertRef = useRef(onAlert);

  const [taxProfile, setTaxProfile] = useState(null);
  const [billingEmail, setBillingEmail] = useState("");
  const [usoCfdi, setUsoCfdi] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    onAlertRef.current = onAlert;
  }, [onAlert]);

  useEffect(() => {
    if (!open) return undefined;

    let active = true;

    const loadProfile = async () => {
      setUsoCfdi("");
      setTaxProfile(null);
      setBillingEmail("");
      setLoadingProfile(true);

      try {
        const res = await getTaxProfile();
        if (!active) return;

        setTaxProfile(res?.tax_profile || null);
        setBillingEmail(res?.billing_email || "");
      } catch (error) {
        if (!active) return;

        onAlertRef.current?.({
          severity: "error",
          title: "No se pudieron cargar los datos fiscales",
          message: getApiMessage(error, "Intenta nuevamente."),
        });
      } finally {
        if (active) setLoadingProfile(false);
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [open]);

  const profileComplete = useMemo(() => {
    return Boolean(
      taxProfile?.rfc &&
      taxProfile?.business_name &&
      taxProfile?.tax_regime &&
      taxProfile?.postal_code
    );
  }, [taxProfile]);

  const generate = async () => {
    if (!purchase?.source_type || !purchase?.source_id) return;

    if (!profileComplete) {
      onAlert?.({
        severity: "warning",
        title: "Datos fiscales incompletos",
        message: "Completa tus datos fiscales antes de generar la factura.",
      });
      return;
    }

    if (!usoCfdi) {
      onAlert?.({
        severity: "warning",
        title: "Selecciona el uso CFDI",
        message: "Debes seleccionar el uso que tendrá tu factura.",
      });
      return;
    }

    setBusy(true);

    try {
      const res = await createPlatformInvoice({
        source_type: purchase.source_type,
        source_id: Number(purchase.source_id),
        uso_cfdi: usoCfdi,
      });

      notifyOperation(res);
      await onCompleted?.(res);
      onClose?.();
    } catch (error) {
      const response = error?.response?.data;
      const invoiceCreated = Boolean(response?.data?.id);

      if (invoiceCreated) {
        notifyOperation(response);
        await onCompleted?.(response);
        onClose?.();
      } else {
        onAlert?.({
          severity: "error",
          title: "No se pudo generar la factura",
          message: getApiMessage(error, "Revisa la información e intenta nuevamente."),
        });
      }
    } finally {
      setBusy(false);
    }
  };

  const notifyOperation = (res) => {
    if (res?.ok === true && res?.status === "stamped") {
      onAlert?.({
        severity: "success",
        title: "Factura generada",
        message: res?.message || "La factura se timbró correctamente.",
      });
      return;
    }

    if (res?.status === "review_required") {
      onAlert?.({
        severity: "warning",
        title: "Factura en revisión",
        message: res?.message || "La factura requiere revisión antes de continuar.",
      });
      return;
    }

    if (res?.status === "processing") {
      onAlert?.({
        severity: "info",
        title: "Factura en proceso",
        message: res?.message || "La factura continúa en proceso.",
      });
      return;
    }

    onAlert?.({
      severity: "error",
      title: "No se pudo timbrar la factura",
      message: res?.message || "La factura no pudo generarse correctamente.",
    });
  };

  const editTaxProfile = () => {
    if (busy) return;
    onClose?.();
    onEditTaxProfile?.();
  };

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      fullScreen={isMobile}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: { xs: 0, sm: 1 },
            overflow: "hidden",
            bgcolor: "background.paper",
          },
        },
      }}
    >
      <DialogTitle sx={{ px: { xs: 2, sm: 3 }, py: 2, bgcolor: "#111111", color: "#fff" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: 20, sm: 24 }, color: "#fff" }}>
              Generar factura
            </Typography>

            <Typography sx={{ mt: 0.5, fontSize: 13, color: "rgba(255,255,255,0.82)" }}>
              Confirma la compra y selecciona el uso CFDI.
            </Typography>
          </Box>

          <IconButton
            onClick={onClose}
            disabled={busy}
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

      <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: "background.default" }}>
        {loadingProfile ? (
          <Box sx={{ minHeight: 280, display: "grid", placeItems: "center" }}>
            <Stack spacing={1.5} alignItems="center">
              <CircularProgress size={34} />
              <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                Cargando datos fiscales...
              </Typography>
            </Stack>
          </Box>
        ) : (
          <Stack spacing={2}>
            <Box sx={panelSx}>
              <Typography sx={sectionTitleSx}>Compra seleccionada</Typography>

              <Stack spacing={1.25} mt={1.5}>
                <InfoRow label="Concepto" value={purchase?.concept || "—"} />
                <InfoRow label="Restaurante" value={entityName(purchase?.restaurant)} />
                <InfoRow label="Sucursal" value={entityName(purchase?.branch)} />
                <InfoRow
                  label="Importe"
                  value={formatCurrency(purchase?.amount, purchase?.currency)}
                  strong
                />
              </Stack>
            </Box>

            <Box sx={panelSx}>
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1.5}>
                <Typography sx={sectionTitleSx}>Datos fiscales</Typography>

                <Button
                  variant="outlined"
                  startIcon={<EditRoundedIcon />}
                  onClick={editTaxProfile}
                  disabled={busy}
                >
                  Editar datos fiscales
                </Button>
              </Stack>

              {profileComplete ? (
                <Stack spacing={1.25} mt={1.5}>
                  <InfoRow label="RFC" value={taxProfile?.rfc} />
                  <InfoRow label="Razón social" value={taxProfile?.business_name} />
                  <InfoRow label="Régimen fiscal" value={taxProfile?.tax_regime} />
                  <InfoRow label="Código postal" value={taxProfile?.postal_code} />
                  <InfoRow label="Correo" value={billingEmail || "—"} />
                </Stack>
              ) : (
                <Typography sx={{ mt: 1.5, fontSize: 14, color: "warning.dark", fontWeight: 700 }}>
                  Completa tus datos fiscales antes de generar la factura.
                </Typography>
              )}
            </Box>

            <Box sx={panelSx}>
              <Typography sx={sectionTitleSx}>Uso CFDI</Typography>

              <TextField
                select
                fullWidth
                value={usoCfdi}
                onChange={(e) => setUsoCfdi(e.target.value)}
                disabled={!profileComplete || busy}
                sx={{ mt: 1.5 }}
              >
                <MenuItem value="">Selecciona una opción</MenuItem>

                {CFDI_USES.map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {value} · {label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Stack direction={{ xs: "column-reverse", sm: "row" }} justifyContent="flex-end" spacing={1.5}>
              <Button variant="outlined" onClick={onClose} disabled={busy}>
                Cancelar
              </Button>

              <Button
                variant="contained"
                startIcon={
                  busy
                    ? <CircularProgress size={17} color="inherit" />
                    : <ReceiptLongRoundedIcon />
                }
                onClick={generate}
                disabled={busy || !profileComplete || !usoCfdi}
                sx={{ fontWeight: 800 }}
              >
                {busy ? "Generando..." : "Generar factura"}
              </Button>
            </Stack>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({ label, value, strong = false }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography sx={{ fontSize: 13, color: "text.secondary" }}>{label}</Typography>
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: strong ? 900 : 700,
          color: "text.primary",
          textAlign: "right",
          wordBreak: "break-word",
        }}
      >
        {value || "—"}
      </Typography>
    </Stack>
  );
}

function entityName(value) {
  if (!value) return "—";
  if (typeof value === "string") return value;

  return value.trade_name || value.name || value.business_name || value.label || "—";
}

function formatCurrency(value, currency = "MXN") {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency || "MXN",
  }).format(number);
}

function getApiMessage(error, fallback) {
  const data = error?.response?.data;
  const firstError = data?.errors ? Object.values(data.errors).flat()?.[0] : null;
  return firstError || data?.message || fallback;
}

const panelSx = {
  p: { xs: 2, sm: 2.5 },
  bgcolor: "background.paper",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1,
};

const sectionTitleSx = {
  fontSize: 16,
  fontWeight: 800,
  color: "text.primary",
};