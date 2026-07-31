import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Card, CardContent, Dialog, DialogContent, DialogTitle,
  FormControlLabel, IconButton, MenuItem, Stack, Switch, TextField,
  Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SaveIcon from "@mui/icons-material/Save";

const MIN_PIN_LENGTH = 4;
const MAX_PIN_LENGTH = 20;

const DEFAULT_FORM = {
  user_id: "",
  pin: "",
  can_self_authorize: false,
  is_active: true,
};

export default function OperationalAuthorizerUpsertModal({
  open,
  onClose,
  selectedBranch,
  candidates = [],
  editing,
  saving = false,
  onSave,
  showToast,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isEdit = !!editing?.id;

  const [form, setForm] = useState(DEFAULT_FORM);

  const availableCandidates = useMemo(
    () => candidates.filter((candidate) => !candidate?.already_authorizer),
    [candidates]
  );

  const selectedCandidate = useMemo(
    () =>
      candidates.find(
        (candidate) => Number(candidate.user_id) === Number(form.user_id)
      ),
    [candidates, form.user_id]
  );

  const editingUserLabel = useMemo(() => {
    if (!editing?.user) return "Usuario no disponible";

    return [
      editing.user.name || null,
      editing.user.email || null,
      editing.user.phone || null,
    ]
      .filter(Boolean)
      .join(" · ");
  }, [editing]);

  const canSave = useMemo(() => {
    const pin = String(form.pin || "").trim();

    if (!isEdit && !form.user_id) return false;
    if (!isEdit && !pin) return false;

    if (
      pin &&
      (!/^[0-9]+$/.test(pin) ||
        pin.length < MIN_PIN_LENGTH ||
        pin.length > MAX_PIN_LENGTH)
    ) {
      return false;
    }

    return true;
  }, [form, isEdit]);

  useEffect(() => {
    if (!open) return;

    if (isEdit) {
      setForm({
        user_id: editing?.user_id ? String(editing.user_id) : "",
        pin: "",
        can_self_authorize: !!editing?.can_self_authorize,
        is_active: !!editing?.is_active,
      });

      return;
    }

    setForm({
      ...DEFAULT_FORM,
      user_id: availableCandidates?.[0]?.user_id
        ? String(availableCandidates[0].user_id)
        : "",
    });
  }, [open, isEdit, editing, availableCandidates]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePinChange = (value) => {
    const pin = String(value || "")
      .replace(/\D/g, "")
      .slice(0, MAX_PIN_LENGTH);

    updateField("pin", pin);
  };

  const save = async () => {
    const pin = String(form.pin || "").trim();

    if (!isEdit && !form.user_id) {
      showToast?.("Debes seleccionar un usuario autorizador.", "warning");
      return;
    }

    if (!isEdit && !pin) {
      showToast?.("Debes ingresar un PIN para el autorizador.", "warning");
      return;
    }

    if (pin && !/^[0-9]+$/.test(pin)) {
      showToast?.("El PIN solo puede contener números.", "warning");
      return;
    }

    if (pin && pin.length < MIN_PIN_LENGTH) {
      showToast?.("El PIN debe tener al menos 4 dígitos.", "warning");
      return;
    }

    if (pin && pin.length > MAX_PIN_LENGTH) {
      showToast?.("El PIN no puede tener más de 20 dígitos.", "warning");
      return;
    }

    const payload = {
      can_self_authorize: !!form.can_self_authorize,
      is_active: !!form.is_active,
    };

    if (isEdit) {
      if (pin) payload.pin = pin;
    } else {
      payload.user_id = Number(form.user_id);
      payload.pin = pin;
    }

    await onSave?.(payload);
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="md"
      fullScreen={isMobile}
      slotProps={{
        paper: {
          sx: {
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
              {isEdit
                ? "Editar autorizador operativo"
                : "Nuevo autorizador operativo"}
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 13,
                color: "rgba(255,255,255,0.82)",
              }}
            >
              {isEdit
                ? "Actualiza el estado, la autoautorización o el PIN."
                : `Agrega un usuario para autorizar operaciones sensibles en ${
                    selectedBranch?.name || "esta sucursal"
                  }.`}
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

      <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: "background.default" }}>
        <Card
          sx={{
            borderRadius: 1,
            boxShadow: "none",
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={2.5}>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: 18, sm: 20 },
                  color: "text.primary",
                }}
              >
                Datos del autorizador
              </Typography>

              {isEdit ? (
                <FieldBlock
                  label="Usuario"
                  help="El usuario no se puede cambiar. Para elegir otro usuario, elimina este registro y crea uno nuevo."
                  input={<TextField value={editingUserLabel} disabled fullWidth />}
                />
              ) : (
                <FieldBlock
                  label="Usuario autorizador *"
                  help={
                    selectedCandidate?.role?.label
                      ? `Rol detectado: ${selectedCandidate.role.label}.`
                      : "Se muestran el propietario y personal operativo permitido para esta sucursal."
                  }
                  input={
                    <TextField
                      select
                      value={form.user_id}
                      onChange={(event) =>
                        updateField("user_id", event.target.value)
                      }
                      fullWidth
                      SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
                    >
                      {availableCandidates.map((candidate) => (
                        <MenuItem
                          key={candidate.user_id}
                          value={String(candidate.user_id)}
                        >
                          {candidate.name} ·{" "}
                          {candidate.role?.label || "Rol no disponible"}
                        </MenuItem>
                      ))}
                    </TextField>
                  }
                />
              )}

              <FieldBlock
                label={isEdit ? "Nuevo PIN" : "PIN *"}
                help={
                  isEdit
                    ? "Déjalo vacío para conservar el PIN actual. El PIN existente nunca se muestra."
                    : "Debe tener entre 4 y 20 números. Se solicitará al autorizar operaciones sensibles."
                }
                input={
                  <TextField
                    value={form.pin}
                    onChange={(event) => handlePinChange(event.target.value)}
                    placeholder={isEdit ? "Conservar PIN actual" : "Ej. 1234"}
                    type="password"
                    fullWidth
                    autoComplete="new-password"
                    inputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                      minLength: MIN_PIN_LENGTH,
                      maxLength: MAX_PIN_LENGTH,
                    }}
                  />
                }
              />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "repeat(2, minmax(0, 1fr))",
                  },
                  gap: 2,
                }}
              >
                <SwitchCard
                  title="Autoautorización"
                  description="Permite que este usuario autorice una operación que él mismo solicitó."
                  checked={form.can_self_authorize}
                  onChange={(value) =>
                    updateField("can_self_authorize", value)
                  }
                />

                <SwitchCard
                  title="Estado"
                  description="Si está inactivo, el usuario no podrá autorizar operaciones sensibles."
                  checked={form.is_active}
                  onChange={(value) => updateField("is_active", value)}
                />
              </Box>

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
                    width: { xs: "100%", sm: "auto" },
                    minWidth: { sm: 150 },
                    height: 44,
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
                    width: { xs: "100%", sm: "auto" },
                    minWidth: { sm: 180 },
                    height: 44,
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
  );
}

function FieldBlock({ label, input, help }) {
  return (
    <Box sx={{ width: "100%" }}>
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

      {help ? (
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
      ) : null}
    </Box>
  );
}

function SwitchCard({ title, description, checked, onChange }) {
  return (
    <Box
      sx={{
        minWidth: 0,
        minHeight: 150,
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        p: 1.75,
        backgroundColor: "background.default",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
        {title}
      </Typography>

      <Typography
        sx={{
          mt: 1,
          mb: 1.25,
          fontSize: 13,
          color: "text.secondary",
          lineHeight: 1.5,
          flex: 1,
        }}
      >
        {description}
      </Typography>

      <FormControlLabel
        sx={{ m: 0 }}
        control={
          <Switch
            checked={!!checked}
            onChange={(event) => onChange(event.target.checked)}
            color="primary"
          />
        }
        label={
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: "text.primary" }}>
            {checked ? "Activo" : "Inactivo"}
          </Typography>
        }
      />
    </Box>
  );
}
