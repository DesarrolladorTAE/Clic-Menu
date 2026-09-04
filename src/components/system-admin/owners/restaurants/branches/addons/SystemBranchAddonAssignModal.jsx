import { useEffect, useMemo, useState } from "react";
import {
  Alert, Box, Button, Card, CardContent, Dialog, DialogContent, DialogTitle,
  IconButton, MenuItem, Stack, TextField, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";

import AppAlert from "../../../../../common/AppAlert";
import { normalizeErr } from "../../../../../../utils/err";

export default function SystemBranchAddonAssignModal({
  open,
  branch,
  addons = [],
  onClose,
  onSave,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [saving, setSaving] = useState(false);
  const [addonId, setAddonId] = useState("");
  const [source, setSource] = useState("manual");
  const [monthsPaid, setMonthsPaid] = useState("1");
  const [monthsGranted, setMonthsGranted] = useState("1");

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const selectableAddons = useMemo(
    () => addons.filter((item) => item.active && item.scope === "branch"),
    [addons]
  );

  const selectedAddon = useMemo(
    () => addons.find((item) => Number(item.id) === Number(addonId)) || null,
    [addons, addonId]
  );

  const isRenewal = !!selectedAddon?.assignment;
  const estimatedAmount = source === "manual"
    ? Number(selectedAddon?.monthly_price || 0) * Number(monthsPaid || 0)
    : 0;

  const canSave = useMemo(() => {
    if (!selectedAddon?.id) return false;

    const granted = Number(monthsGranted);
    if (!Number.isInteger(granted) || granted < 1 || granted > 240) return false;

    if (source === "manual") {
      const paid = Number(monthsPaid);
      if (!Number.isInteger(paid) || paid < 1 || paid > 240) return false;
    }

    return true;
  }, [selectedAddon, source, monthsPaid, monthsGranted]);

  const showAlert = ({ severity = "error", title = "Error", message = "" }) => {
    setAlertState({ open: true, severity, title, message });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    if (!open) return;

    setAddonId("");
    setSource("manual");
    setMonthsPaid("1");
    setMonthsGranted("1");
  }, [open]);

  useEffect(() => {
    if (source === "internal") setMonthsPaid("0");
    else if (Number(monthsPaid) < 1) setMonthsPaid("1");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  const save = async () => {
    if (!selectedAddon?.id) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "Selecciona el complemento que deseas asignar o renovar.",
      });
      return;
    }

    const granted = Number(monthsGranted);
    const paid = source === "internal" ? 0 : Number(monthsPaid);

    if (!Number.isInteger(granted) || granted < 1 || granted > 240) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "Los meses otorgados deben ser un número entre 1 y 240.",
      });
      return;
    }

    if (source === "manual" && (!Number.isInteger(paid) || paid < 1 || paid > 240)) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "Los meses pagados deben ser un número entre 1 y 240.",
      });
      return;
    }

    setSaving(true);

    try {
      await onSave?.(selectedAddon, {
        branch_ids: [Number(branch.id)],
        source,
        months_paid: paid,
        months_granted: granted,
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message: normalizeErr(e, "No se pudo guardar el complemento."),
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
              width: { xs: "100%", sm: 720 },
              height: { xs: "100%", sm: "auto" },
              maxHeight: { xs: "100%", sm: "90vh" },
              borderRadius: { xs: 0, sm: 1 },
              overflow: "hidden",
              backgroundColor: "background.paper",
            },
          },
        }}
      >
        <DialogTitle sx={{ px: { xs: 2, sm: 3 }, py: 2, bgcolor: "#111111", color: "#fff" }}>
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
                Asignar / renovar complemento
              </Typography>

              <Typography sx={{ mt: 0.5, fontSize: 13, color: "rgba(255,255,255,0.82)" }}>
                Configura un complemento para {branch?.name || "esta sucursal"}.
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
          <Stack spacing={2.5}>
            <Card sx={{ borderRadius: 0, backgroundColor: "background.paper" }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack spacing={2.5}>
                  <Typography sx={{ fontWeight: 800, fontSize: { xs: 18, sm: 20 }, color: "text.primary" }}>
                    Complemento
                  </Typography>

                  <FieldBlock
                    label="Sucursal"
                    input={<TextField value={branch?.name || ""} disabled />}
                  />

                  <FieldBlock
                    label="Complemento *"
                    input={
                      <TextField
                        select
                        value={addonId}
                        onChange={(e) => setAddonId(e.target.value)}
                        disabled={saving}
                      >
                        <MenuItem value="">Selecciona un complemento</MenuItem>

                        {selectableAddons.map((item) => (
                          <MenuItem key={item.id} value={item.id}>
                            {item.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    }
                  />

                  {selectedAddon ? (
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "#F6F4F6",
                      }}
                    >
                      <Stack spacing={0.75}>
                        <Typography sx={{ fontSize: 15, fontWeight: 800, color: "text.primary" }}>
                          {isRenewal ? "Renovación" : "Nueva asignación"}
                        </Typography>

                        <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.5 }}>
                          {isRenewal
                            ? `Este complemento ya fue asignado a ${branch?.name || "la sucursal"}. La nueva vigencia se aplicará automáticamente.`
                            : "Este complemento todavía no ha sido asignado a esta sucursal."}
                        </Typography>

                        {selectedAddon.assignment?.ends_at ? (
                          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                            Vigencia actual hasta: <strong>{formatDate(selectedAddon.assignment.ends_at)}</strong>
                          </Typography>
                        ) : null}

                        <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                          Precio mensual: <strong>{formatCurrency(selectedAddon.monthly_price, selectedAddon.currency)}</strong>
                        </Typography>
                      </Stack>
                    </Box>
                  ) : null}
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 0, backgroundColor: "background.paper" }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack spacing={2.5}>
                  <Typography sx={{ fontWeight: 800, fontSize: { xs: 18, sm: 20 }, color: "text.primary" }}>
                    Modalidad
                  </Typography>

                  <FieldBlock
                    label="Tipo de asignación *"
                    input={
                      <TextField
                        select
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        disabled={saving}
                      >
                        <MenuItem value="manual">Manual</MenuItem>
                        <MenuItem value="internal">Interno / pruebas</MenuItem>
                      </TextField>
                    }
                  />

                  {source === "internal" ? (
                    <Alert severity="info" sx={{ borderRadius: 1 }}>
                      Esta asignación otorgará vigencia al complemento, pero no se contabilizará como una venta.
                    </Alert>
                  ) : null}

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <FieldBlock
                      label="Meses pagados *"
                      input={
                        <TextField
                          type="number"
                          value={monthsPaid}
                          onChange={(e) => setMonthsPaid(e.target.value)}
                          disabled={saving || source === "internal"}
                          inputProps={{ min: 0, max: 240, step: 1 }}
                        />
                      }
                    />

                    <FieldBlock
                      label="Meses otorgados *"
                      input={
                        <TextField
                          type="number"
                          value={monthsGranted}
                          onChange={(e) => setMonthsGranted(e.target.value)}
                          disabled={saving}
                          inputProps={{ min: 1, max: 240, step: 1 }}
                        />
                      }
                    />
                  </Stack>

                  {selectedAddon ? (
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: source === "internal" ? "#F6F4F6" : "#FFF8ED",
                      }}
                    >
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        spacing={1}
                      >
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: "text.secondary" }}>
                          {source === "internal" ? "Importe" : "Importe aproximado"}
                        </Typography>

                        <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
                          {formatCurrency(estimatedAmount, selectedAddon.currency)}
                        </Typography>
                      </Stack>

                      {source === "manual" ? (
                        <Typography sx={{ mt: 1, fontSize: 12, color: "text.secondary" }}>
                          El importe definitivo será confirmado al guardar la operación.
                        </Typography>
                      ) : null}
                    </Box>
                  ) : null}
                </Stack>
              </CardContent>
            </Card>

            <Stack
              direction={{ xs: "column-reverse", sm: "row" }}
              justifyContent="flex-end"
              spacing={1.5}
            >
              <Button
                type="button"
                onClick={onClose}
                variant="outlined"
                disabled={saving}
                sx={{ minWidth: { xs: "100%", sm: 150 }, height: 44, borderRadius: 2 }}
              >
                Cancelar
              </Button>

              <Button
                type="button"
                onClick={save}
                variant="contained"
                disabled={!canSave || saving}
                startIcon={<AddIcon />}
                sx={{
                  minWidth: { xs: "100%", sm: 190 },
                  height: 44,
                  borderRadius: 2,
                  fontWeight: 800,
                }}
              >
                {saving ? "Guardando…" : isRenewal ? "Renovar" : "Asignar"}
              </Button>
            </Stack>
          </Stack>
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

function FieldBlock({ label, input }) {
  return (
    <Box sx={{ flex: 1, width: "100%" }}>
      <Typography sx={fieldLabelSx}>{label}</Typography>
      {input}
    </Box>
  );
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatCurrency(value, currency = "MXN") {
  const amount = Number(value || 0);

  try {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: currency || "MXN",
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
  mb: 1,
};