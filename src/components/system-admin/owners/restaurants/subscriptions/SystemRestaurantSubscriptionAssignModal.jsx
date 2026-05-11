import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Card, CardContent, Dialog, DialogContent, DialogTitle, FormControlLabel, IconButton, MenuItem, Stack, Switch,
  TextField, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";

import AppAlert from "../../../../common/AppAlert";
import { normalizeErr } from "../../../../../utils/err";

export default function SystemRestaurantSubscriptionAssignModal({
  open,
  plans = [],
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
  const [provider, setProvider] = useState("manual");
  const [providerRef, setProviderRef] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [autoRenew, setAutoRenew] = useState(false);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const selectedPlan = useMemo(() => {
    return plans.find((item) => String(item.id) === String(planId)) || null;
  }, [plans, planId]);

  useEffect(() => {
    if (!open) return;

    setPlanId("");
    setMonthsPaid("1");
    setMonthsGranted("1");
    setPaidPrice("");
    setProvider("manual");
    setProviderRef("");
    setStartsAt("");
    setAutoRenew(false);
  }, [open]);

  useEffect(() => {
    if (!selectedPlan) return;

    const price = Number(selectedPlan.monthly_price || 0);
    const months = Number(monthsPaid || 1);

    if (Number.isFinite(price) && Number.isFinite(months)) {
      setPaidPrice(String(price * months));
    }
  }, [selectedPlan, monthsPaid]);

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
      paid_price: paidPrice === "" ? null : Number(paidPrice),
      currency: selectedPlan?.currency || "MXN",
      provider: provider || "manual",
      provider_ref: providerRef.trim() || null,
      starts_at: startsAt || null,
      auto_renew: autoRenew,
      meta: {
        note: "Suscripción asignada desde panel administrador.",
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
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
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
                        {plans.map((plan) => (
                          <MenuItem key={plan.id} value={plan.id}>
                            {plan.name} · ${Number(plan.monthly_price || 0).toFixed(2)} {plan.currency || "MXN"}
                          </MenuItem>
                        ))}
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

                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <FieldBlock
                      label="Precio pagado"
                      input={
                        <TextField
                          value={paidPrice}
                          onChange={(e) => setPaidPrice(e.target.value)}
                          inputProps={{ inputMode: "decimal" }}
                          placeholder="0"
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
                      input={
                        <TextField
                          value={provider}
                          onChange={(e) => setProvider(e.target.value)}
                          placeholder="manual"
                        />
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
                    <Typography sx={fieldLabelSx}>Renovación automática</Typography>

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