import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box, Button, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton, Stack, TextField, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";

import {
  getTaxProfile,
  updateTaxProfile,
} from "../../../services/owner/taxProfile.service";

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

  return (
    error?.response?.data?.message ||
    "Ocurrió un problema al procesar los datos fiscales."
  );
}

export default function OwnerTaxProfileModal({
  open,
  onClose,
  onSaved,
  onError,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const onErrorRef = useRef(onError);

  const [form, setForm] = useState(EMPTY_FORM);
  const [billingEmail, setBillingEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
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
          ? "Ingresa una clave de 3 dígitos."
          : "",

      postal_code: !postalCode
        ? "El código postal es obligatorio."
        : !/^[0-9]{5}$/.test(postalCode)
          ? "Ingresa un código postal de 5 dígitos."
          : "",
    };
  }, [form]);

  const canSave =
    loaded &&
    !loading &&
    !busy &&
    !Object.values(errors).some(Boolean);

  useEffect(() => {
    if (!open) return undefined;

    let active = true;

    const loadTaxProfile = async () => {
      setLoading(true);
      setLoaded(false);
      setBusy(false);
      setAttemptedSave(false);
      setForm(EMPTY_FORM);
      setBillingEmail("");

      try {
        const res = await getTaxProfile();
        if (!active) return;

        const profile = res?.tax_profile || null;

        setForm({
          rfc: profile?.rfc || "",
          business_name: profile?.business_name || "",
          tax_regime: profile?.tax_regime || "",
          postal_code: profile?.postal_code || "",
        });

        setBillingEmail(res?.billing_email || "");
        setLoaded(true);
      } catch (error) {
        if (!active) return;
        onErrorRef.current?.(firstApiError(error));
      } finally {
        if (active) setLoading(false);
      }
    };

    loadTaxProfile();

    return () => {
      active = false;
    };
  }, [open]);

  const setField = (field, value) => {
    let nextValue = value;

    if (field === "rfc") {
      nextValue = value.toUpperCase().replace(/\s+/g, "").slice(0, 13);
    }

    if (field === "tax_regime") {
      nextValue = value.replace(/\D+/g, "").slice(0, 3);
    }

    if (field === "postal_code") {
      nextValue = value.replace(/\D+/g, "").slice(0, 5);
    }

    setForm((prev) => ({ ...prev, [field]: nextValue }));
  };

  const save = async () => {
    setAttemptedSave(true);

    if (!canSave) return;

    setBusy(true);

    try {
      const payload = {
        rfc: form.rfc.trim().toUpperCase(),
        business_name: form.business_name.trim(),
        tax_regime: form.tax_regime.trim(),
        postal_code: form.postal_code.trim(),
      };

      const res = await updateTaxProfile(payload);
      const profile = res?.tax_profile || null;

      setForm({
        rfc: profile?.rfc || payload.rfc,
        business_name: profile?.business_name || payload.business_name,
        tax_regime: profile?.tax_regime || payload.tax_regime,
        postal_code: profile?.postal_code || payload.postal_code,
      });

      setBillingEmail(res?.billing_email || billingEmail);

      onSaved?.(res);
      onClose?.();
    } catch (error) {
      onErrorRef.current?.(firstApiError(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      fullScreen={isMobile}
      fullWidth={false}
      maxWidth={false}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100%", sm: 680 },
            height: { xs: "100%", sm: "auto" },
            maxHeight: { xs: "100%", sm: "88vh" },
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
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ minWidth: 0 }}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
                borderRadius: 1,
                bgcolor: "rgba(255,152,0,0.16)",
                color: "primary.main",
              }}
            >
              <AccountBalanceRoundedIcon />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: 20, sm: 24 },
                  lineHeight: 1.2,
                  color: "#fff",
                }}
              >
                Datos fiscales
              </Typography>

              <Typography
                sx={{
                  mt: 0.4,
                  fontSize: 13,
                  lineHeight: 1.4,
                  color: "rgba(255,255,255,0.78)",
                }}
              >
                Información que utilizaremos para generar tus facturas de Clic Menu.
              </Typography>
            </Box>
          </Stack>

          <IconButton
            onClick={onClose}
            disabled={busy}
            aria-label="Cerrar"
            sx={{
              color: "#fff",
              flexShrink: 0,
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
        {loading ? (
          <Box
            sx={{
              minHeight: { xs: 280, sm: 330 },
              display: "grid",
              placeItems: "center",
            }}
          >
            <Stack spacing={1.5} alignItems="center">
              <CircularProgress size={34} />

              <Typography
                sx={{
                  fontSize: 14,
                  color: "text.secondary",
                  fontWeight: 600,
                }}
              >
                Cargando tus datos fiscales...
              </Typography>
            </Stack>
          </Box>
        ) : (
          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            <Stack spacing={2.2}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <FieldBlock
                  label="RFC *"
                  input={
                    <TextField
                      fullWidth
                      value={form.rfc}
                      onChange={(e) => setField("rfc", e.target.value)}
                      placeholder="Ej. SANL020522T16"
                      error={attemptedSave && Boolean(errors.rfc)}
                      helperText={
                        attemptedSave
                          ? errors.rfc
                          : "Escríbelo tal como aparece en tu constancia fiscal."
                      }
                      inputProps={{
                        maxLength: 13,
                        autoCapitalize: "characters",
                      }}
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
                      error={attemptedSave && Boolean(errors.postal_code)}
                      helperText={
                        attemptedSave
                          ? errors.postal_code
                          : "Código postal registrado ante el SAT."
                      }
                      inputProps={{
                        inputMode: "numeric",
                        maxLength: 5,
                      }}
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
                    onChange={(e) =>
                      setField("business_name", e.target.value)
                    }
                    placeholder="Nombre o razón social"
                    error={
                      attemptedSave &&
                      Boolean(errors.business_name)
                    }
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
                    onChange={(e) =>
                      setField("tax_regime", e.target.value)
                    }
                    placeholder="Ej. 605"
                    error={
                      attemptedSave &&
                      Boolean(errors.tax_regime)
                    }
                    helperText={
                      attemptedSave
                        ? errors.tax_regime
                        : "Ingresa la clave de 3 dígitos de tu régimen fiscal."
                    }
                    inputProps={{
                      inputMode: "numeric",
                      maxLength: 3,
                    }}
                  />
                }
              />

              <FieldBlock
                label="Correo de facturación"
                input={
                    <TextField
                    fullWidth
                    value={billingEmail}
                    placeholder="Sin correo registrado"
                    type="email"
                    disabled
                    />
                }
                help="Este correo corresponde a tu cuenta de propietario. Si necesitas cambiarlo, hazlo desde Editar perfil."
              />

              <Stack
                direction={{ xs: "column-reverse", sm: "row" }}
                justifyContent="flex-end"
                spacing={1.5}
                pt={0.5}
              >
                <Button
                  type="button"
                  onClick={onClose}
                  disabled={busy}
                  variant="outlined"
                  sx={{
                    minWidth: { xs: "100%", sm: 150 },
                    height: 44,
                  }}
                >
                  Cancelar
                </Button>

                <Button
                  type="button"
                  onClick={save}
                  disabled={!loaded || loading || busy}
                  variant="contained"
                  startIcon={
                    busy
                      ? <CircularProgress size={17} color="inherit" />
                      : <SaveIcon />
                  }
                  sx={{
                    minWidth: { xs: "100%", sm: 190 },
                    height: 44,
                    fontWeight: 800,
                  }}
                >
                  {busy ? "Guardando..." : "Guardar cambios"}
                </Button>
              </Stack>
            </Stack>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

function FieldBlock({ label, input, help }) {
  return (
    <Box sx={{ flex: 1, width: "100%", minWidth: 0 }}>
      <Typography
        sx={{
          mb: 1,
          fontSize: 14,
          fontWeight: 800,
          color: "text.primary",
        }}
      >
        {label}
      </Typography>

      {input}

      {help && (
        <Typography
          sx={{
            mt: 0.75,
            fontSize: 12,
            lineHeight: 1.45,
            color: "text.secondary",
          }}
        >
          {help}
        </Typography>
      )}
    </Box>
  );
}