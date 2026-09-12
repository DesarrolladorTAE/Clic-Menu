import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, FormControlLabel, Stack, Switch, TextField, Typography,
} from "@mui/material";

import SaveIcon from "@mui/icons-material/Save";

import { normalizeErr } from "../../../../utils/err";

export default function SystemOwnerAccountTab({
  editing,
  onClose,
  onSave,
  onSaved,
  onError,
  onBusyChange,
}) {
  const isEdit = !!editing?.id;

  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [lastNamePaternal, setLastNamePaternal] = useState("");
  const [lastNameMaternal, setLastNameMaternal] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("active");

  useEffect(() => {
    if (isEdit) {
      setName(editing?.name || "");
      setLastNamePaternal(editing?.last_name_paternal || "");
      setLastNameMaternal(editing?.last_name_maternal || "");
      setPhone(editing?.phone || "");
      setEmail(editing?.email || "");
      setPassword("");
      setStatus(editing?.status || "active");
      return;
    }

    setName("");
    setLastNamePaternal("");
    setLastNameMaternal("");
    setPhone("");
    setEmail("");
    setPassword("");
    setStatus("active");
  }, [isEdit, editing]);

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
      onError?.("El nombre es obligatorio.");
      return;
    }

    if (!payload.last_name_paternal) {
      onError?.("El apellido paterno es obligatorio.");
      return;
    }

    if (payload.phone.length !== 10) {
      onError?.("El teléfono debe tener 10 dígitos.");
      return;
    }

    if (!isEdit && payload.password.length < 8) {
      onError?.("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (isEdit && payload.password && payload.password.length < 8) {
      onError?.("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setSaving(true);
    onBusyChange?.(true);

    try {
      await onSave?.(payload, editing);

      setSaving(false);
      onBusyChange?.(false);
      onSaved?.();
    } catch (e) {
      setSaving(false);
      onBusyChange?.(false);
      onError?.(normalizeErr(e, "No se pudo guardar el propietario."));
    }
  };

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
            Datos de la cuenta
          </Typography>

          <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}>
            Administra la información principal de la cuenta del propietario.
          </Typography>
        </Box>

        <Stack spacing={2}>
          <FieldBlock
            label="Nombre *"
            input={
              <TextField
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre"
                disabled={saving}
              />
            }
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FieldBlock
              label="Apellido paterno *"
              input={
                <TextField
                  fullWidth
                  value={lastNamePaternal}
                  onChange={(e) => setLastNamePaternal(e.target.value)}
                  placeholder="Apellido paterno"
                  disabled={saving}
                />
              }
            />

            <FieldBlock
              label="Apellido materno"
              input={
                <TextField
                  fullWidth
                  value={lastNameMaternal}
                  onChange={(e) => setLastNameMaternal(e.target.value)}
                  placeholder="Opcional"
                  disabled={saving}
                />
              }
            />
          </Stack>

          <FieldBlock
            label="Teléfono *"
            help="Se guardarán solo los últimos 10 dígitos."
            input={
              <TextField
                fullWidth
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="7441234567"
                disabled={saving}
                inputProps={{ inputMode: "numeric" }}
              />
            }
          />

          <FieldBlock
            label="Correo electrónico *"
            input={
              <TextField
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                type="email"
                disabled={saving}
              />
            }
          />

          <FieldBlock
            label={isEdit ? "Nueva contraseña" : "Contraseña *"}
            help={isEdit ? "Déjala vacía si no quieres cambiarla." : "Mínimo 8 caracteres."}
            input={
              <TextField
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEdit ? "Opcional" : "Contraseña"}
                type="password"
                disabled={saving}
              />
            }
          />

          {!isEdit ? (
            <Box sx={{ width: "100%" }}>
              <Typography sx={fieldLabelSx}>Estado</Typography>

              <FormControlLabel
                sx={{ m: 0 }}
                control={
                  <Switch
                    checked={status === "active"}
                    onChange={(e) => setStatus(e.target.checked ? "active" : "inactive")}
                    color="primary"
                    disabled={saving}
                  />
                }
                label={
                  <Typography sx={switchLabelSx}>
                    {status === "active" ? "Activo" : "Inactivo"}
                  </Typography>
                }
              />
            </Box>
          ) : null}
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
            disabled={!canSave || saving}
            variant="contained"
            startIcon={<SaveIcon />}
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

const switchLabelSx = {
  fontSize: 14,
  fontWeight: 700,
  color: "text.primary",
};