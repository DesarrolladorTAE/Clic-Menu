import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Card, CardContent, Dialog, DialogContent, DialogTitle, FormControlLabel, IconButton, MenuItem, Stack, Switch, TextField,
  Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const DEFAULT_FORM = {
  user_id: "",
  pin: "",
  can_authorize_exceeded_discount: true,
  can_self_authorize: false,
  is_active: true,
};

export default function DiscountAuthorizerUpsertModal({
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

  const title = useMemo(
    () => (isEdit ? "Editar autorizador" : "Nuevo autorizador"),
    [isEdit]
  );

  const availableCandidates = useMemo(() => {
    return candidates.filter((candidate) => !candidate?.already_authorizer);
  }, [candidates]);

  const selectedCandidate = useMemo(() => {
    return candidates.find(
      (candidate) => Number(candidate.user_id) === Number(form.user_id)
    );
  }, [candidates, form.user_id]);

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

    if (pin && !/^[0-9]{4,8}$/.test(pin)) return false;

    return true;
  }, [form, isEdit]);

  useEffect(() => {
    if (!open) return;

    if (isEdit) {
      setForm({
        user_id: editing?.user_id ? String(editing.user_id) : "",
        pin: "",
        can_authorize_exceeded_discount:
          !!editing?.can_authorize_exceeded_discount,
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
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePinChange = (value) => {
    const onlyNumbers = String(value || "")
      .replace(/\D/g, "")
      .slice(0, 8);

    updateField("pin", onlyNumbers);
  };

  const save = async () => {
    const pin = String(form.pin || "").trim();

    if (!isEdit && !form.user_id) {
      showToast?.("Selecciona un usuario autorizador.", "warning");
      return;
    }

    if (!isEdit && !pin) {
      showToast?.("El PIN es obligatorio para crear un autorizador.", "warning");
      return;
    }

    if (pin && !/^[0-9]{4,8}$/.test(pin)) {
      showToast?.("El PIN debe tener entre 4 y 8 números.", "warning");
      return;
    }

    const payload = {
      can_authorize_exceeded_discount:
        !!form.can_authorize_exceeded_discount,
      can_self_authorize: !!form.can_self_authorize,
      is_active: !!form.is_active,
    };

    if (isEdit) {
      if (pin) {
        payload.pin = pin;
      }
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
                ? "Actualiza permisos, estado o PIN del autorizador."
                : `Agrega un usuario para autorizar descuentos en ${
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
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.16)",
              },
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
        }}
      >
        <Card
          sx={{
            borderRadius: 0,
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

              <Stack spacing={2}>
                {isEdit ? (
                  <FieldBlock
                    label="Usuario"
                    help="El usuario no se puede cambiar. Si elegiste uno incorrecto, elimina el autorizador y crea uno nuevo."
                    input={
                      <TextField
                        value={editingUserLabel}
                        disabled
                        fullWidth
                      />
                    }
                  />
                ) : (
                  <FieldBlock
                    label="Usuario autorizador *"
                    help={
                      selectedCandidate?.role?.label
                        ? `Rol detectado: ${selectedCandidate.role.label}.`
                        : "Solo se muestran propietario, cajeros o meseros activos de esta sucursal."
                    }
                    input={
                      <TextField
                        select
                        value={form.user_id}
                        onChange={(e) => updateField("user_id", e.target.value)}
                        fullWidth
                        SelectProps={{
                          IconComponent: KeyboardArrowDownIcon,
                        }}
                      >
                        {availableCandidates.map((candidate) => (
                          <MenuItem
                            key={candidate.user_id}
                            value={String(candidate.user_id)}
                          >
                            {candidate.name} · {candidate.role?.label || "Rol no disponible"}
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
                      ? "Déjalo vacío si quieres conservar el PIN actual. El PIN no se muestra por seguridad."
                      : "Debe tener entre 4 y 8 números. Este PIN se solicitará en caja."
                  }
                  input={
                    <TextField
                      value={form.pin}
                      onChange={(e) => handlePinChange(e.target.value)}
                      placeholder={isEdit ? "Conservar PIN actual" : "Ej. 1234"}
                      type="password"
                      fullWidth
                      autoComplete="new-password"
                      inputProps={{
                        inputMode: "numeric",
                        maxLength: 8,
                      }}
                    />
                  }
                />

                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  useFlexGap
                  flexWrap="wrap"
                >
                  <SwitchCard
                    title="Autorizar excedidos"
                    description="Permite aprobar descuentos que superan los límites de la política."
                    checked={form.can_authorize_exceeded_discount}
                    onChange={(val) =>
                      updateField("can_authorize_exceeded_discount", val)
                    }
                  />

                  <SwitchCard
                    title="Autoautorización"
                    description="Permite que el mismo usuario autorice descuentos que él capturó."
                    checked={form.can_self_authorize}
                    onChange={(val) => updateField("can_self_authorize", val)}
                  />

                  <SwitchCard
                    title="Estado"
                    description="Si está inactivo, no podrá autorizar descuentos en caja."
                    checked={form.is_active}
                    onChange={(val) => updateField("is_active", val)}
                  />
                </Stack>
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
        flex: "1 1 240px",
        minWidth: 220,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        p: 1.75,
        backgroundColor: "background.default",
      }}
    >
      <Stack spacing={1.25}>
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 800,
            color: "text.primary",
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            fontSize: 13,
            color: "text.secondary",
            lineHeight: 1.5,
            minHeight: 40,
          }}
        >
          {description}
        </Typography>

        <FormControlLabel
          sx={{ m: 0 }}
          control={
            <Switch
              checked={!!checked}
              onChange={(e) => onChange(e.target.checked)}
              color="primary"
            />
          }
          label={
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 700,
                color: "text.primary",
              }}
            >
              {checked ? "Activo" : "Inactivo"}
            </Typography>
          }
        />
      </Stack>
    </Box>
  );
}
