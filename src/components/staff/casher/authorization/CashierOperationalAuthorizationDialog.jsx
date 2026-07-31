import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";

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
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setAuthorizationUserId("");
    setAuthorizationPin("");
    setReason("");
    setError("");
  }, [open]);

  const safeAuthorizers = useMemo(
    () => (Array.isArray(authorizers) ? authorizers : []),
    [authorizers]
  );

  const canSubmit =
    Number(authorizationUserId) > 0 &&
    authorizationPin.trim() !== "" &&
    reason.trim() !== "" &&
    !loadingAuthorizers &&
    !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) {
      setError(
        "Selecciona un autorizador, ingresa su PIN y escribe el motivo."
      );
      return;
    }

    setError("");

    try {
      await onSubmit?.({
        authorization_user_id: Number(authorizationUserId),
        authorization_pin: authorizationPin.trim(),
        reason: reason.trim(),
      });
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "No se pudo procesar la autorización."
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ pb: 1.25 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 1,
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(255, 152, 0, 0.12)",
              color: "primary.main",
              flexShrink: 0,
            }}
          >
            <AdminPanelSettingsRoundedIcon />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 21,
                fontWeight: 800,
                color: "text.primary",
                lineHeight: 1.2,
              }}
            >
              {title}
            </Typography>

            <Typography
              sx={{
                mt: 0.35,
                fontSize: 13,
                color: "text.secondary",
                lineHeight: 1.45,
              }}
            >
              {description}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          {error ? <Alert severity="error">{error}</Alert> : null}

          {loadingAuthorizers ? (
            <Box
              sx={{
                minHeight: 110,
                display: "grid",
                placeItems: "center",
              }}
            >
              <Stack alignItems="center" spacing={1}>
                <CircularProgress size={28} />
                <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                  Cargando autorizadores…
                </Typography>
              </Stack>
            </Box>
          ) : (
            <>
              <FormControl fullWidth>
                <InputLabel id="cashier-operational-authorizer-label">
                  Autorizador
                </InputLabel>

                <Select
                  labelId="cashier-operational-authorizer-label"
                  label="Autorizador"
                  value={authorizationUserId}
                  onChange={(event) => {
                    setAuthorizationUserId(event.target.value);
                    setError("");
                  }}
                  disabled={submitting}
                >
                  {safeAuthorizers.map((authorizer) => (
                    <MenuItem
                      key={authorizer.user_id}
                      value={authorizer.user_id}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: "text.primary",
                          }}
                        >
                          {authorizer.name || `Usuario #${authorizer.user_id}`}
                        </Typography>

                        {authorizer.email ? (
                          <Typography
                            sx={{
                              fontSize: 12,
                              color: "text.secondary",
                            }}
                          >
                            {authorizer.email}
                          </Typography>
                        ) : null}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {safeAuthorizers.length === 0 ? (
                <Alert severity="warning">
                  No hay autorizadores operativos activos para esta sucursal.
                </Alert>
              ) : null}

              <TextField
                label="PIN"
                type="password"
                value={authorizationPin}
                onChange={(event) => {
                  setAuthorizationPin(event.target.value.slice(0, 20));
                  setError("");
                }}
                inputProps={{ maxLength: 20 }}
                autoComplete="off"
                disabled={submitting}
                fullWidth
              />

              <TextField
                label="Motivo"
                value={reason}
                onChange={(event) => {
                  setReason(event.target.value.slice(0, 255));
                  setError("");
                }}
                inputProps={{ maxLength: 255 }}
                helperText={`${reason.length}/255`}
                minRows={3}
                multiline
                disabled={submitting}
                fullWidth
              />
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          color="inherit"
          onClick={onClose}
          disabled={submitting}
          sx={{ fontWeight: 800 }}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!canSubmit}
          startIcon={
            submitting ? (
              <CircularProgress size={17} color="inherit" />
            ) : (
              <AdminPanelSettingsRoundedIcon />
            )
          }
          sx={{
            minWidth: 140,
            fontWeight: 800,
            borderRadius: 2,
          }}
        >
          {submitting ? "Validando…" : "Autorizar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
