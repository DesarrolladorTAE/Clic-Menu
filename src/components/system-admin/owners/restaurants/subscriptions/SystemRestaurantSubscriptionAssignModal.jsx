import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Card, CardContent, Dialog, DialogContent, DialogTitle, FormControlLabel, IconButton, MenuItem, Stack, Switch, TextField,
  Typography, useMediaQuery, Alert, Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";

import AppAlert from "../../../../common/AppAlert";
import { normalizeErr } from "../../../../../utils/err";

const PROVIDERS = [
  { value: "internal", label: "Interno / pruebas" },
  { value: "manual", label: "Manual" },
];

export default function SystemRestaurantSubscriptionAssignModal({
  open,
  plans = [],
  owner = null,
  subscriptions = [],
  onClose,
  onSave,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [saving, setSaving] = useState(false);

  const [planId, setPlanId] = useState("");
  const [monthsPaid, setMonthsPaid] = useState("1");
  const [monthsGranted, setMonthsGranted] = useState("1");
  const [paidPrice, setPaidPrice] = useState("");
  const [provider, setProvider] = useState("internal");
  const [providerRef, setProviderRef] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [autoRenew, setAutoRenew] = useState(false);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const isInternalProvider = provider === "internal";
  const hasReferralCode = Boolean(owner?.referred_by_code);

  const hasPreviousPaidSubscription = useMemo(() => {
    return subscriptions.some((item) => {
      const providerValue = String(item.provider || "");
      const paidValue = Number(item.paid_price || 0);

      return providerValue !== "internal" && paidValue > 0;
    });
  }, [subscriptions]);

  const canApplyReferralDiscount =
    hasReferralCode && !hasPreviousPaidSubscription && !isInternalProvider;

  const selectedPlan = useMemo(() => {
    return plans.find((item) => String(item.id) === String(planId)) || null;
  }, [plans, planId]);

  const pricePreview = useMemo(() => {
    const price = Number(selectedPlan?.monthly_price || 0);
    const months = Number(monthsPaid || 1);

    if (!selectedPlan || !Number.isFinite(price) || !Number.isFinite(months)) {
      return {
        subtotal: 0,
        discount: 0,
        total: 0,
      };
    }

    const subtotal = price * Math.max(1, months);
    const discount = canApplyReferralDiscount ? subtotal * 0.05 : 0;
    const total = isInternalProvider ? 0 : subtotal - discount;

    return {
      subtotal,
      discount,
      total,
    };
  }, [selectedPlan, monthsPaid, canApplyReferralDiscount, isInternalProvider]);

  useEffect(() => {
    if (!open) return;

    setPlanId("");
    setMonthsPaid("1");
    setMonthsGranted("1");
    setPaidPrice("");
    setProvider("internal");
    setProviderRef("");
    setStartsAt("");
    setAutoRenew(false);
  }, [open]);

  useEffect(() => {
    if (!selectedPlan) return;

    if (isInternalProvider) {
      setPaidPrice("0.00");
      return;
    }

    setPaidPrice(pricePreview.total.toFixed(2));
  }, [selectedPlan, pricePreview.total, isInternalProvider]);

  const showAlert = ({ severity = "error", title = "Error", message = "" }) => {
    setAlertState({ open: true, severity, title, message });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const canSave = useMemo(() => {
    if (!planId) return false;

    const paid = Number(monthsPaid);
    const granted = Number(monthsGranted);

    if (!Number.isFinite(paid) || paid < 1) return false;
    if (!Number.isFinite(granted) || granted < 1) return false;

    return true;
  }, [planId, monthsPaid, monthsGranted]);

  const save = async () => {
    if (!planId) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "Selecciona un plan.",
      });
      return;
    }

    const payload = {
      plan_id: Number(planId),
      months_paid: Number(monthsPaid || 1),
      months_granted: Number(monthsGranted || monthsPaid || 1),
      paid_price: isInternalProvider
        ? 0
        : paidPrice === ""
          ? null
          : Number(paidPrice),
      currency: selectedPlan?.currency || "MXN",
      provider: provider || "internal",
      provider_ref: providerRef.trim() || null,
      starts_at: startsAt || null,
      auto_renew: autoRenew,
      meta: {
        note: isInternalProvider
          ? "Suscripción interna asignada desde panel administrador."
          : "Suscripción asignada desde panel administrador.",
        frontend_referral_discount_preview: canApplyReferralDiscount,
        frontend_referral_code: owner?.referred_by_code || null,
        frontend_base_price: pricePreview.subtotal,
        frontend_discount_amount: isInternalProvider ? 0 : pricePreview.discount,
        frontend_final_price: isInternalProvider ? 0 : pricePreview.total,
        frontend_provider_type: provider || "internal",
      },
    };

    setSaving(true);

    try {
      await onSave?.(payload);
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message: normalizeErr(e, "No se pudo asignar la suscripción."),
      });
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={saving ? undefined : onClose}
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
              backgroundColor: "background.paper",
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
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={2}
          >
            <Box>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: 20, sm: 24 },
                  lineHeight: 1.2,
                  color: "#fff",
                }}
              >
                Asignar suscripción
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.82)",
                }}
              >
                Selecciona el plan y la vigencia para este restaurante.
              </Typography>
            </Box>

            <IconButton
              onClick={onClose}
              disabled={saving}
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
          <Card sx={{ borderRadius: 0, backgroundColor: "background.paper" }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack spacing={2.5}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: 18, sm: 20 },
                    color: "text.primary",
                  }}
                >
                  Datos de suscripción
                </Typography>

                {canApplyReferralDiscount && (
                  <Alert severity="success" sx={{ borderRadius: 2 }}>
                    Este propietario tiene código referido y aún no tiene una
                    compra pagada previa. Se mostrará el 5% de descuento en esta
                    primera compra.
                  </Alert>
                )}

                {!canApplyReferralDiscount && hasReferralCode && (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    Este propietario tiene código referido, pero esta operación
                    se tomará como renovación o compra posterior sin descuento.
                  </Alert>
                )}

                {isInternalProvider && (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    Esta suscripción se registrará como acceso interno o de pruebas. No contará
                    como venta, no generará comisión y el importe pagado será $0.00.
                  </Alert>
                )}

                <Stack spacing={2}>
                  <FieldBlock
                    label="Plan *"
                    input={
                      <TextField
                        select
                        value={planId}
                        onChange={(e) => setPlanId(e.target.value)}
                      >
                        <MenuItem value="">Selecciona un plan</MenuItem>

                        {plans.map((plan) => {
                          const price = Number(plan.monthly_price || 0);
                          const discount = canApplyReferralDiscount
                            ? price * 0.05
                            : 0;
                          const finalPrice = price - discount;

                          return (
                            <MenuItem key={plan.id} value={plan.id}>
                              {plan.name} · ${finalPrice.toFixed(2)}{" "}
                              {plan.currency || "MXN"}
                              {canApplyReferralDiscount
                                ? " · 5% referido"
                                : ""}
                            </MenuItem>
                          );
                        })}
                      </TextField>
                    }
                  />

                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <FieldBlock
                      label="Meses pagados *"
                      input={
                        <TextField
                          value={monthsPaid}
                          onChange={(e) => setMonthsPaid(e.target.value)}
                          inputProps={{ inputMode: "numeric" }}
                          placeholder="1"
                        />
                      }
                    />

                    <FieldBlock
                      label="Meses otorgados *"
                      input={
                        <TextField
                          value={monthsGranted}
                          onChange={(e) => setMonthsGranted(e.target.value)}
                          inputProps={{ inputMode: "numeric" }}
                          placeholder="1"
                        />
                      }
                    />
                  </Stack>

                  {selectedPlan && (
                    <Box
                      sx={{
                        p: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        bgcolor: "background.default",
                      }}
                    >
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography sx={summaryLabelSx}>Subtotal</Typography>
                          <Typography sx={summaryValueSx}>
                            ${pricePreview.subtotal.toFixed(2)}{" "}
                            {selectedPlan.currency || "MXN"}
                          </Typography>
                        </Stack>

                        <Stack direction="row" justifyContent="space-between">
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography sx={summaryLabelSx}>
                              Descuento referido
                            </Typography>
                            {canApplyReferralDiscount && (
                              <Chip
                                size="small"
                                label="5%"
                                color="success"
                                sx={{ height: 22, fontWeight: 800 }}
                              />
                            )}
                          </Stack>

                          <Typography sx={summaryValueSx}>
                            -${pricePreview.discount.toFixed(2)}{" "}
                            {selectedPlan.currency || "MXN"}
                          </Typography>
                        </Stack>

                        <Box
                          sx={{
                            borderTop: "1px solid",
                            borderColor: "divider",
                            pt: 1,
                            mt: 0.5,
                          }}
                        >
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                          >
                            <Typography
                              sx={{
                                ...summaryLabelSx,
                                fontSize: 16,
                                fontWeight: 900,
                                color: "text.primary",
                              }}
                            >
                              Total a pagar
                            </Typography>

                            <Typography
                              sx={{
                                ...summaryValueSx,
                                fontSize: 18,
                                fontWeight: 900,
                                color: "text.primary",
                              }}
                            >
                              ${pricePreview.total.toFixed(2)}{" "}
                              {selectedPlan.currency || "MXN"}
                            </Typography>
                          </Stack>
                        </Box>
                      </Stack>
                    </Box>
                  )}

                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <FieldBlock
                      label="Precio pagado"
                      help={
                        isInternalProvider
                          ? "En accesos internos se enviará $0.00 y no contará como venta."
                          : "El backend vuelve a calcular el precio real y valida si aplica referido."
                      }
                      input={
                        <TextField
                          value={isInternalProvider ? "0.00" : paidPrice}
                          onChange={(e) => setPaidPrice(e.target.value)}
                          inputProps={{ inputMode: "decimal" }}
                          placeholder="0"
                          disabled={isInternalProvider}
                        />
                      }
                    />

                    <FieldBlock
                      label="Inicio"
                      help="Déjalo vacío para iniciar hoy."
                      input={
                        <TextField
                          type="date"
                          value={startsAt}
                          onChange={(e) => setStartsAt(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      }
                    />
                  </Stack>

                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <FieldBlock
                      label="Proveedor"
                      help={
                        isInternalProvider
                          ? "Úsalo para cuentas propias, pruebas internas o accesos sin cobro."
                          : "Úsalo cuando el cliente pagó y el administrador registra la suscripción manualmente."
                      }
                      input={
                        <TextField
                          select
                          value={provider}
                          onChange={(e) => setProvider(e.target.value)}
                        >
                          {PROVIDERS.map((item) => (
                            <MenuItem key={item.value} value={item.value}>
                              {item.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      }
                    />

                    <FieldBlock
                      label="Referencia"
                      input={
                        <TextField
                          value={providerRef}
                          onChange={(e) => setProviderRef(e.target.value)}
                          placeholder="Opcional"
                        />
                      }
                    />
                  </Stack>

                  <Box>
                    <Typography sx={fieldLabelSx}>
                      Renovación automática
                    </Typography>

                    <FormControlLabel
                      sx={{ m: 0 }}
                      control={
                        <Switch
                          checked={autoRenew}
                          onChange={(e) => setAutoRenew(e.target.checked)}
                          color="primary"
                        />
                      }
                      label={
                        <Typography sx={switchLabelSx}>
                          {autoRenew ? "Activada" : "Desactivada"}
                        </Typography>
                      }
                    />
                  </Box>
                </Stack>

                <Stack
                  direction={{ xs: "column-reverse", sm: "row" }}
                  justifyContent="flex-end"
                  spacing={1.5}
                  pt={1}
                >
                  <Button
                    type="button"
                    onClick={onClose}
                    disabled={saving}
                    variant="outlined"
                    sx={{
                      minWidth: { xs: "100%", sm: 150 },
                      height: 44,
                      borderRadius: 2,
                    }}
                  >
                    Cancelar
                  </Button>

                  <Button
                    type="button"
                    onClick={save}
                    disabled={!canSave || saving}
                    variant="contained"
                    startIcon={<SaveIcon />}
                    sx={{
                      minWidth: { xs: "100%", sm: 190 },
                      height: 44,
                      borderRadius: 2,
                      fontWeight: 800,
                    }}
                  >
                    {saving ? "Guardando…" : "Asignar"}
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={alertState.severity}
        title={alertState.title}
        message={alertState.message}
        autoHideDuration={3000}
      />
    </>
  );
}

function FieldBlock({ label, input, help }) {
  return (
    <Box sx={{ flex: 1, width: "100%" }}>
      <Typography sx={fieldLabelSx}>{label}</Typography>
      {input}

      {help && (
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
      )}
    </Box>
  );
}

const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
  mb: 1,
};

const switchLabelSx = {
  fontSize: 14,
  fontWeight: 700,
  color: "text.primary",
};

const summaryLabelSx = {
  fontSize: 14,
  fontWeight: 700,
  color: "text.secondary",
};

const summaryValueSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
};