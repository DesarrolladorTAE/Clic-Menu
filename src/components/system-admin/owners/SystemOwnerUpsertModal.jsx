import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Card, CardContent, Dialog, DialogContent, DialogTitle, FormControlLabel, IconButton, Stack, Switch, TextField,
  Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";

import AppAlert from "../../common/AppAlert";
import { normalizeErr } from "../../../utils/err";

export default function SystemOwnerUpsertModal({
  open,
  editing,
  onClose,
  onSave,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const isEdit = !!editing?.id;

  const [saving, setSaving] = useState(false);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const [name, setName] = useState("");
  const [lastNamePaternal, setLastNamePaternal] = useState("");
  const [lastNameMaternal, setLastNameMaternal] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("active");

  const title = useMemo(
    () => (isEdit ? "Editar propietario" : "Nuevo propietario"),
    [isEdit]
  );

  const showAlert = ({ severity = "error", title = "Error", message = "" }) => {
    setAlertState({ open: true, severity, title, message });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    if (!open) return;

    if (isEdit) {
      setName(editing?.name || "");
      setLastNamePaternal(editing?.last_name_paternal || "");
      setLastNameMaternal(editing?.last_name_maternal || "");
      setPhone(editing?.phone || "");
      setEmail(editing?.email || "");
      setPassword("");
      setStatus(editing?.status || "active");
    } else {
      setName("");
      setLastNamePaternal("");
      setLastNameMaternal("");
      setPhone("");
      setEmail("");
      setPassword("");
      setStatus("active");
    }
  }, [open, isEdit, editing]);

  const normalizedPhone = useMemo(() => {
    const digits = String(phone || "").replace(/\D+/g, "");
    return digits.slice(-10);
  }, [phone]);

  const canSave = useMemo(() => {
    if (!name.trim()) return false;
    if (!lastNamePaternal.trim()) return false;
    if (!email.trim()) return false;
    if (normalizedPhone.length !== 10) return false;
    if (!isEdit && password.length < 8) return false;
    if (isEdit && password && password.length < 8) return false;
    return true;
  }, [name, lastNamePaternal, email, normalizedPhone, password, isEdit]);

  const save = async () => {
    const payload = {
      name: name.trim(),
      last_name_paternal: lastNamePaternal.trim(),
      last_name_maternal: lastNameMaternal.trim() || null,
      phone: normalizedPhone,
      email: email.trim(),
      password: password || "",
      ...(isEdit ? {} : { status }),
    };

    if (!payload.name) {
      showAlert({ severity: "warning", title: "Nota", message: "El nombre es obligatorio." });
      return;
    }

    if (!payload.last_name_paternal) {
      showAlert({ severity: "warning", title: "Nota", message: "El apellido paterno es obligatorio." });
      return;
    }

    if (payload.phone.length !== 10) {
      showAlert({ severity: "warning", title: "Nota", message: "El teléfono debe tener 10 dígitos." });
      return;
    }

    if (!isEdit && payload.password.length < 8) {
      showAlert({ severity: "warning", title: "Nota", message: "La contraseña debe tener al menos 8 caracteres." });
      return;
    }

    setSaving(true);

    try {
      await onSave?.(payload, editing);
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message: normalizeErr(e, "No se pudo guardar el propietario."),
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
                {title}
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.82)",
                }}
              >
                {isEdit
                  ? "Actualiza los datos principales de la cuenta."
                  : "Crea una nueva cuenta de propietario."}
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
                  Datos de cuenta
                </Typography>

                <Stack spacing={2}>
                  <FieldBlock
                    label="Nombre *"
                    input={
                      <TextField
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nombre"
                      />
                    }
                  />

                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <FieldBlock
                      label="Apellido paterno *"
                      input={
                        <TextField
                          value={lastNamePaternal}
                          onChange={(e) => setLastNamePaternal(e.target.value)}
                          placeholder="Apellido paterno"
                        />
                      }
                    />

                    <FieldBlock
                      label="Apellido materno"
                      input={
                        <TextField
                          value={lastNameMaternal}
                          onChange={(e) => setLastNameMaternal(e.target.value)}
                          placeholder="Opcional"
                        />
                      }
                    />
                  </Stack>

                  <FieldBlock
                    label="Teléfono *"
                    help="Se guardarán solo los últimos 10 dígitos."
                    input={
                      <TextField
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="7441234567"
                        inputProps={{ inputMode: "numeric" }}
                      />
                    }
                  />

                  <FieldBlock
                    label="Correo electrónico *"
                    input={
                      <TextField
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="correo@ejemplo.com"
                        type="email"
                      />
                    }
                  />

                  <FieldBlock
                    label={isEdit ? "Nueva contraseña" : "Contraseña *"}
                    help={isEdit ? "Déjala vacía si no quieres cambiarla." : "Mínimo 8 caracteres."}
                    input={
                      <TextField
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={isEdit ? "Opcional" : "Contraseña"}
                        type="password"
                      />
                    }
                  />

                  {!isEdit && (
                    <Box sx={{ flex: 1, width: "100%" }}>
                      <Typography sx={fieldLabelSx}>Estado</Typography>

                      <FormControlLabel
                        sx={{ m: 0 }}
                        control={
                          <Switch
                            checked={status === "active"}
                            onChange={(e) =>
                              setStatus(e.target.checked ? "active" : "inactive")
                            }
                            color="primary"
                          />
                        }
                        label={
                          <Typography sx={switchLabelSx}>
                            {status === "active" ? "Activo" : "Inactivo"}
                          </Typography>
                        }
                      />
                    </Box>
                  )}
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
                      minWidth: { xs: "100%", sm: 180 },
                      height: 44,
                      borderRadius: 2,
                      fontWeight: 800,
                    }}
                  >
                    {saving ? "Guardando…" : "Guardar"}
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