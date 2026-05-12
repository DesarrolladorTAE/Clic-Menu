// src/components/owner/profile/OwnerProfileModal.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";

import { updateOwnerProfile } from "../../../services/owner/ownerProfile.service";
import { useAuth } from "../../../context/AuthContext";

export default function OwnerProfileModal({ open, onClose, onSaved }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { user, updateUser } = useAuth();

  const [busy, setBusy] = useState(false);
  const [serverMsg, setServerMsg] = useState("");

  const [form, setForm] = useState({
    name: "",
    last_name_paternal: "",
    last_name_maternal: "",
    phone: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  useEffect(() => {
    if (!open) return;

    setServerMsg("");
    setForm({
      name: user?.name || "",
      last_name_paternal: user?.last_name_paternal || "",
      last_name_maternal: user?.last_name_maternal || "",
      phone: user?.phone || "",
      email: user?.email || "",
      password: "",
      password_confirmation: "",
    });
  }, [open, user]);

  const normalizedPhone = useMemo(() => {
    const digits = String(form.phone || "").replace(/\D+/g, "");
    return digits.slice(-10);
  }, [form.phone]);

  const canSave = useMemo(() => {
    if (!form.name.trim()) return false;
    if (!form.last_name_paternal.trim()) return false;
    if (!form.email.trim()) return false;
    if (normalizedPhone.length !== 10) return false;

    if (form.password || form.password_confirmation) {
      if (form.password.length < 8) return false;
      if (form.password !== form.password_confirmation) return false;
    }

    return true;
  }, [form, normalizedPhone]);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const save = async () => {
    setServerMsg("");

    if (!canSave) {
      setServerMsg("Revisa los datos antes de guardar.");
      return;
    }

    setBusy(true);

    try {
      const payload = {
        name: form.name.trim(),
        last_name_paternal: form.last_name_paternal.trim(),
        last_name_maternal: form.last_name_maternal.trim() || null,
        phone: normalizedPhone,
        email: form.email.trim(),
      };

      if (form.password) {
        payload.password = form.password;
        payload.password_confirmation = form.password_confirmation;
      }

      const res = await updateOwnerProfile(payload);
      const nextUser = res?.data || null;

      if (nextUser) {
        updateUser(nextUser);
      }

      onSaved?.(res);
      onClose?.();
    } catch (e) {
      const errors = e?.response?.data?.errors;
      const firstError = errors
        ? Object.values(errors)?.flat()?.[0]
        : null;

      setServerMsg(
        firstError ||
          e?.response?.data?.message ||
          "No se pudo actualizar el perfil."
      );
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
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: { xs: 20, sm: 24 },
                lineHeight: 1.2,
                color: "#fff",
              }}
            >
              Editar perfil
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 13,
                color: "rgba(255,255,255,0.82)",
              }}
            >
              Actualiza tus datos de propietario.
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

      <DialogContent
        sx={{
          p: { xs: 2, sm: 3 },
          bgcolor: "background.default",
          overflowY: "auto",
        }}
      >
        <Stack spacing={2.5}>
          {serverMsg && (
            <Alert severity="error" sx={{ borderRadius: 1 }}>
              {serverMsg}
            </Alert>
          )}

          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 0,
            }}
          >
            <Stack spacing={2}>
              <FieldBlock
                label="Nombre *"
                input={
                  <TextField
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                    placeholder="Nombre"
                  />
                }
              />

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <FieldBlock
                  label="Apellido paterno *"
                  input={
                    <TextField
                      value={form.last_name_paternal}
                      onChange={(e) =>
                        setField("last_name_paternal", e.target.value)
                      }
                      placeholder="Apellido paterno"
                    />
                  }
                />

                <FieldBlock
                  label="Apellido materno"
                  input={
                    <TextField
                      value={form.last_name_maternal}
                      onChange={(e) =>
                        setField("last_name_maternal", e.target.value)
                      }
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
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    placeholder="7441234567"
                    inputProps={{ inputMode: "numeric" }}
                  />
                }
              />

              <FieldBlock
                label="Correo electrónico *"
                input={
                  <TextField
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    placeholder="correo@ejemplo.com"
                    type="email"
                  />
                }
              />

              <FieldBlock
                label="Nueva contraseña"
                help="Déjala vacía si no quieres cambiarla. Mínimo 8 caracteres."
                input={
                  <TextField
                    value={form.password}
                    onChange={(e) => setField("password", e.target.value)}
                    placeholder="Opcional"
                    type="password"
                  />
                }
              />

              <FieldBlock
                label="Confirmar contraseña"
                input={
                  <TextField
                    value={form.password_confirmation}
                    onChange={(e) =>
                      setField("password_confirmation", e.target.value)
                    }
                    placeholder="Opcional"
                    type="password"
                  />
                }
              />

              <Stack
                direction={{ xs: "column-reverse", sm: "row" }}
                justifyContent="flex-end"
                spacing={1.5}
                pt={1}
              >
                <Button
                  type="button"
                  onClick={onClose}
                  disabled={busy}
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
                  disabled={!canSave || busy}
                  variant="contained"
                  startIcon={<SaveIcon />}
                  sx={{
                    minWidth: { xs: "100%", sm: 180 },
                    height: 44,
                    borderRadius: 2,
                    fontWeight: 800,
                  }}
                >
                  {busy ? "Guardando..." : "Guardar"}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

function FieldBlock({ label, input, help }) {
  return (
    <Box sx={{ flex: 1, width: "100%" }}>
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 800,
          color: "text.primary",
          mb: 1,
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