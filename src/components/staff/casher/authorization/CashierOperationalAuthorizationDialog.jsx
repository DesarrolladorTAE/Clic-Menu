// src/components/staff/casher/authorization/CashierOperationalAuthorizationDialog.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Card, CardContent, CircularProgress, MenuItem, Stack, TextField, Typography } from "@mui/material";

import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";

import AppAlert from "../../../common/AppAlert";
import CashierDialogShell from "../shared/CashierDialogShell";

export default function CashierOperationalAuthorizationDialog({
  open,
  title = "Autorización operativa",
  description = "Selecciona un autorizador e ingresa sus datos para continuar.",
  authorizers = [],
  loadingAuthorizers = false,
  submitting = false,
  onClose,
  onSubmit,
}) {
  const [authorizationUserId, setAuthorizationUserId] = useState("");
  const [authorizationPin, setAuthorizationPin] = useState("");
  const [reason, setReason] = useState("");
  const [alertState, setAlertState] = useState({ open: false, severity: "error", title: "", message: "" });

  const safeAuthorizers = useMemo(() => (Array.isArray(authorizers) ? authorizers : []), [authorizers]);

  useEffect(() => {
    if (!open) return;

    setAuthorizationUserId("");
    setAuthorizationPin("");
    setReason("");
    setAlertState((previous) => ({ ...previous, open: false }));
  }, [open]);

  const canSubmit =
    Number(authorizationUserId) > 0 &&
    authorizationPin.trim() !== "" &&
    reason.trim() !== "" &&
    safeAuthorizers.length > 0 &&
    !loadingAuthorizers &&
    !submitting;

  const showAlert = ({ severity = "error", title: alertTitle = "Error", message }) => {
    if (!message) return;
    setAlertState({ open: true, severity, title: alertTitle, message });
  };

  const closeAlert = (_, closeReason) => {
    if (closeReason === "clickaway") return;
    setAlertState((previous) => ({ ...previous, open: false }));
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      showAlert({
        severity: "warning",
        title: "Datos incompletos",
        message: "Selecciona un autorizador, ingresa su PIN y escribe el motivo.",
      });
      return;
    }

    try {
      await onSubmit?.({
        authorization_user_id: Number(authorizationUserId),
        authorization_pin: authorizationPin.trim(),
        reason: reason.trim(),
      });
    } catch (error) {
      showAlert({
        severity: "error",
        title: "Autorización rechazada",
        message: error?.response?.data?.message || error?.message || "No se pudo procesar la autorización.",
      });
    }
  };

  return (
    <>
      <CashierDialogShell
        open={open}
        title={title}
        description={description}
        icon={<AdminPanelSettingsRoundedIcon />}
        busy={submitting}
        maxWidth="sm"
        onClose={onClose}
      >
        <Card sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, boxShadow: "none" }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 }, "&:last-child": { pb: { xs: 2, sm: 3 } } }}>
            {loadingAuthorizers ? (
              <Box sx={{ minHeight: 260, display: "grid", placeItems: "center" }}>
                <Stack alignItems="center" spacing={1.25}>
                  <CircularProgress size={30} />
                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>Cargando autorizadores…</Typography>
                </Stack>
              </Box>
            ) : (
              <Stack spacing={2.5}>
                <Box>
                  <Typography sx={{ fontSize: { xs: 18, sm: 20 }, fontWeight: 800, color: "text.primary" }}>
                    Datos del autorizador
                  </Typography>

                  <Typography sx={{ mt: 0.5, fontSize: 13, lineHeight: 1.5, color: "text.secondary" }}>
                    El PIN se valida exclusivamente en el servidor y no se almacena en esta pantalla.
                  </Typography>
                </Box>

                {safeAuthorizers.length === 0 ? (
                  <Alert severity="warning" variant="outlined" sx={{ minWidth: 0 }}>
                    No hay autorizadores operativos activos para esta sucursal.
                  </Alert>
                ) : null}

                <FieldBlock
                  label="Autorizador *"
                  input={
                    <TextField
                      select
                      value={authorizationUserId}
                      onChange={(event) => setAuthorizationUserId(event.target.value)}
                      disabled={submitting || safeAuthorizers.length === 0}
                    >
                      {safeAuthorizers.map((authorizer) => (
                        <MenuItem key={authorizer.user_id} value={authorizer.user_id}>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
                              {authorizer.name || `Usuario #${authorizer.user_id}`}
                            </Typography>

                            {authorizer.email ? (
                              <Typography sx={{ mt: 0.2, fontSize: 12, color: "text.secondary" }}>
                                {authorizer.email}
                              </Typography>
                            ) : null}
                          </Box>
                        </MenuItem>
                      ))}
                    </TextField>
                  }
                />

                <FieldBlock
                  label="PIN *"
                  input={
                    <TextField
                      type="password"
                      value={authorizationPin}
                      onChange={(event) => setAuthorizationPin(event.target.value.slice(0, 20))}
                      inputProps={{ maxLength: 20 }}
                      autoComplete="off"
                      disabled={submitting}
                      placeholder="Ingresa el PIN del autorizador"
                    />
                  }
                />

                <FieldBlock
                  label="Motivo *"
                  help={`${reason.length}/255`}
                  input={
                    <TextField
                      value={reason}
                      onChange={(event) => setReason(event.target.value.slice(0, 255))}
                      inputProps={{ maxLength: 255 }}
                      multiline
                      minRows={3}
                      disabled={submitting}
                      placeholder="Describe por qué se requiere esta operación"
                    />
                  }
                />

                <Stack
                  direction={{ xs: "column-reverse", sm: "row" }}
                  justifyContent="flex-end"
                  spacing={1.5}
                  pt={0.5}
                >
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={onClose}
                    disabled={submitting}
                    sx={{ width: { xs: "100%", sm: "auto" }, minWidth: { sm: 140 } }}
                  >
                    Cancelar
                  </Button>

                  <Button
                    type="button"
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    startIcon={
                      submitting
                        ? <CircularProgress size={17} color="inherit" />
                        : <AdminPanelSettingsRoundedIcon />
                    }
                    sx={{ width: { xs: "100%", sm: "auto" }, minWidth: { sm: 170 } }}
                  >
                    {submitting ? "Validando…" : "Autorizar"}
                  </Button>
                </Stack>
              </Stack>
            )}
          </CardContent>
        </Card>
      </CashierDialogShell>

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
    <Box sx={{ width: "100%" }}>
      <Typography sx={{ mb: 1, fontSize: 14, fontWeight: 800, color: "text.primary" }}>{label}</Typography>
      {input}

      {help ? (
        <Typography sx={{ mt: 0.75, fontSize: 12, lineHeight: 1.45, color: "text.secondary" }}>
          {help}
        </Typography>
      ) : null}
    </Box>
  );
}
