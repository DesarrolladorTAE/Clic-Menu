import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box, Button, CircularProgress, Stack, TextField, Typography,
} from "@mui/material";

import SaveIcon from "@mui/icons-material/Save";

import {
  getSystemOwnerTaxProfile,
  updateSystemOwnerTaxProfile,
} from "../../../../services/system-admin/systemOwnerTaxProfile.service";

const EMPTY_FORM = {
  rfc: "",
  business_name: "",
  tax_regime: "",
  postal_code: "",
};

function firstApiError(error) {
  const errors = error?.response?.data?.errors;
  if (errors) {
    const first = Object.values(errors).flat()?.[0];
    if (first) return first;
  }

  return error?.response?.data?.message || "No se pudieron procesar los datos fiscales.";
}

export default function SystemOwnerTaxProfileTab({
  ownerId,
  active,
  onClose,
  onSaved,
  onError,
  onBusyChange,
}) {
  const loadedOwnerRef = useRef(null);
  const onErrorRef = useRef(onError);

  const [form, setForm] = useState(EMPTY_FORM);
  const [billingEmail, setBillingEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [attemptedSave, setAttemptedSave] = useState(false);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const errors = useMemo(() => {
    const rfc = form.rfc.trim().toUpperCase();
    const businessName = form.business_name.trim();
    const taxRegime = form.tax_regime.trim();
    const postalCode = form.postal_code.trim();

    return {
      rfc: !rfc
        ? "El RFC es obligatorio."
        : !/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/u.test(rfc)
          ? "Ingresa un RFC válido."
          : "",

      business_name: !businessName
        ? "La razón social o nombre fiscal es obligatorio."
        : businessName.length > 255
          ? "No puede superar los 255 caracteres."
          : "",

      tax_regime: !taxRegime
        ? "El régimen fiscal es obligatorio."
        : !/^[0-9]{3}$/.test(taxRegime)
          ? "Ingresa una clave SAT de 3 dígitos."
          : "",

      postal_code: !postalCode
        ? "El código postal fiscal es obligatorio."
        : !/^[0-9]{5}$/.test(postalCode)
          ? "Ingresa un código postal de 5 dígitos."
          : "",
    };
  }, [form]);

  const canSave = loaded && !loading && !saving && !Object.values(errors).some(Boolean);

  useEffect(() => {
    if (!active || !ownerId) return;
    if (Number(loadedOwnerRef.current) === Number(ownerId)) return;

    let alive = true;

    const load = async () => {
      setLoading(true);
      setLoaded(false);
      setAttemptedSave(false);

      try {
        const res = await getSystemOwnerTaxProfile(ownerId);
        if (!alive) return;

        const payload = res?.data || {};
        const profile = payload?.tax_profile || null;

        setForm({
          rfc: profile?.rfc || "",
          business_name: profile?.business_name || "",
          tax_regime: profile?.tax_regime || "",
          postal_code: profile?.postal_code || "",
        });

        setBillingEmail(payload?.billing_email || "");
        loadedOwnerRef.current = ownerId;
        setLoaded(true);
      } catch (error) {
        if (!alive) return;

        setForm(EMPTY_FORM);
        setBillingEmail("");
        onErrorRef.current?.(firstApiError(error));
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();

    return () => {
      alive = false;
    };
  }, [active, ownerId]);

  const setField = (field, value) => {
    let nextValue = value;

    if (field === "rfc") nextValue = value.toUpperCase().replace(/\s+/g, "").slice(0, 13);
    if (field === "tax_regime") nextValue = value.replace(/\D+/g, "").slice(0, 3);
    if (field === "postal_code") nextValue = value.replace(/\D+/g, "").slice(0, 5);

    setForm((prev) => ({ ...prev, [field]: nextValue }));
  };

  const save = async () => {
    setAttemptedSave(true);
    if (!canSave) return;

    const payload = {
      rfc: form.rfc.trim().toUpperCase(),
      business_name: form.business_name.trim(),
      tax_regime: form.tax_regime.trim(),
      postal_code: form.postal_code.trim(),
    };

    setSaving(true);
    onBusyChange?.(true);

    try {
      const res = await updateSystemOwnerTaxProfile(ownerId, payload);
      const data = res?.data || {};
      const profile = data?.tax_profile || null;

      setForm({
        rfc: profile?.rfc || payload.rfc,
        business_name: profile?.business_name || payload.business_name,
        tax_regime: profile?.tax_regime || payload.tax_regime,
        postal_code: profile?.postal_code || payload.postal_code,
      });

      setBillingEmail(data?.billing_email || billingEmail);
      setSaving(false);
      onBusyChange?.(false);
      onSaved?.(res);
    } catch (error) {
      setSaving(false);
      onBusyChange?.(false);
      onErrorRef.current?.(firstApiError(error));
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 360,
          display: "grid",
          placeItems: "center",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          bgcolor: "background.paper",
        }}
      >
        <Stack spacing={1.5} alignItems="center">
          <CircularProgress size={32} />

          <Typography sx={{ fontSize: 14, fontWeight: 600, color: "text.secondary" }}>
            Cargando datos fiscales...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.paper",
      }}
    >
      <Stack spacing={2.5}>
        <Box>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: { xs: 18, sm: 20 },
              color: "text.primary",
            }}
          >
            Datos fiscales
          </Typography>

          <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}>
            Información utilizada para emitir las facturas correspondientes a este propietario.
          </Typography>
        </Box>

        <Stack spacing={2}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FieldBlock
              label="RFC *"
              input={
                <TextField
                  fullWidth
                  value={form.rfc}
                  onChange={(e) => setField("rfc", e.target.value)}
                  placeholder="Ej. SANL020522T16"
                  disabled={saving || !loaded}
                  error={attemptedSave && Boolean(errors.rfc)}
                  helperText={
                    attemptedSave
                      ? errors.rfc
                      : "Debe coincidir con la información registrada ante el SAT."
                  }
                  inputProps={{ maxLength: 13, autoCapitalize: "characters" }}
                />
              }
            />

            <FieldBlock
              label="Código postal fiscal *"
              input={
                <TextField
                  fullWidth
                  value={form.postal_code}
                  onChange={(e) => setField("postal_code", e.target.value)}
                  placeholder="Ej. 39810"
                  disabled={saving || !loaded}
                  error={attemptedSave && Boolean(errors.postal_code)}
                  helperText={
                    attemptedSave
                      ? errors.postal_code
                      : "Código postal registrado ante el SAT."
                  }
                  inputProps={{ inputMode: "numeric", maxLength: 5 }}
                />
              }
            />
          </Stack>

          <FieldBlock
            label="Razón social o nombre fiscal *"
            input={
              <TextField
                fullWidth
                value={form.business_name}
                onChange={(e) => setField("business_name", e.target.value)}
                placeholder="Razón social o nombre fiscal"
                disabled={saving || !loaded}
                error={attemptedSave && Boolean(errors.business_name)}
                helperText={
                  attemptedSave
                    ? errors.business_name
                    : "Debe coincidir con la información registrada ante el SAT."
                }
                inputProps={{ maxLength: 255 }}
              />
            }
          />

          <FieldBlock
            label="Régimen fiscal *"
            input={
              <TextField
                fullWidth
                value={form.tax_regime}
                onChange={(e) => setField("tax_regime", e.target.value)}
                placeholder="Ej. 605"
                disabled={saving || !loaded}
                error={attemptedSave && Boolean(errors.tax_regime)}
                helperText={
                  attemptedSave
                    ? errors.tax_regime
                    : "Ingresa la clave SAT de 3 dígitos."
                }
                inputProps={{ inputMode: "numeric", maxLength: 3 }}
              />
            }
          />

          <FieldBlock
            label="Correo de facturación"
            help="Corresponde al correo de la cuenta del propietario. Se modifica desde Datos de la cuenta."
            input={
              <TextField
                fullWidth
                value={billingEmail}
                placeholder="Sin correo registrado"
                type="email"
                disabled
                sx={{
                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: "rgba(0,0,0,0.72)",
                  },
                }}
              />
            }
          />
        </Stack>

        <Stack
          direction={{ xs: "column-reverse", sm: "row" }}
          justifyContent="flex-end"
          spacing={1.5}
          pt={0.5}
        >
          <Button
            type="button"
            onClick={onClose}
            disabled={saving}
            variant="outlined"
            sx={{ minWidth: { xs: "100%", sm: 150 }, height: 44 }}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            onClick={save}
            disabled={!loaded || loading || saving}
            variant="contained"
            startIcon={saving ? <CircularProgress size={17} color="inherit" /> : <SaveIcon />}
            sx={{ minWidth: { xs: "100%", sm: 180 }, height: 44, fontWeight: 800 }}
          >
            {saving ? "Guardando…" : "Guardar"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

function FieldBlock({ label, input, help }) {
  return (
    <Box sx={{ flex: 1, width: "100%", minWidth: 0 }}>
      <Typography sx={fieldLabelSx}>{label}</Typography>
      {input}

      {help ? (
        <Typography sx={{ mt: 0.75, fontSize: 12, color: "text.secondary", lineHeight: 1.45 }}>
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