import { useMemo, useState } from "react";

import {
  Box, Button, Card, CardContent, CircularProgress, Dialog,
  DialogContent, DialogTitle, FormControlLabel, IconButton,
  Stack, Switch, TextField, Typography, useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

function mapDefinitionToForm(definition) {
  return {
    name: definition?.name || "",
    sort_order: String(definition?.sort_order ?? 0),
    is_active: definition ? Boolean(definition.is_active) : true,
  };
}

function getChanges(form, definition) {
  const name = form.name.trim();
  const sortOrder = Number(form.sort_order);

  if (!definition) {
    return {
      name,
      sort_order: sortOrder,
      is_active: form.is_active,
    };
  }

  const changes = {};

  if (name !== String(definition.name || "").trim()) {
    changes.name = name;
  }

  if (sortOrder !== Number(definition.sort_order ?? 0)) {
    changes.sort_order = sortOrder;
  }

  if (form.is_active !== Boolean(definition.is_active)) {
    changes.is_active = form.is_active;
  }

  return changes;
}

function validateForm(form, editing, definition) {
  const errors = {};
  const name = form.name.trim();
  const order = form.sort_order.trim();

  if (!name) {
    errors.name = "Debes escribir el nombre de la etapa.";
  } else if (name.length > 120) {
    errors.name = "El nombre no puede superar los 120 caracteres.";
  }

  if (
    !/^\d+$/.test(order) ||
    !Number.isSafeInteger(Number(order)) ||
    Number(order) > 4294967295
  ) {
    errors.sort_order = "Ingresa un orden válido entre 0 y 4294967295.";
  }

  if (editing && definition?.can_rename !== true && name !== String(definition.name || "").trim()) {
    errors.name = definition.rename_block_reason || "No puedes cambiar el nombre de esta etapa.";
  }

  if (editing && form.is_active !== Boolean(definition.is_active)) {
    const allowed = form.is_active
      ? definition.can_activate === true
      : definition.can_deactivate === true;

    if (!allowed) {
      errors.is_active = form.is_active
        ? definition.activate_block_reason || "No puedes activar esta etapa."
        : definition.deactivate_block_reason || "No puedes desactivar esta etapa.";
    }
  }

  return errors;
}

function FieldBlock({ label, help, children }) {
  return (
    <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
      <Typography sx={{ mb: 1, fontSize: 14, fontWeight: 800, color: "text.primary" }}>
        {label}
      </Typography>

      {children}

      {help ? (
        <Typography sx={{ mt: 0.75, fontSize: 12, color: "text.secondary", lineHeight: 1.5 }}>
          {help}
        </Typography>
      ) : null}
    </Box>
  );
}

export default function MenuSetStageDefinitionForm({
  open = false,
  definition = null,
  saving = false,
  onSave,
  onCancel,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const editing = Boolean(definition);

  const [form, setForm] = useState(() => mapDefinitionToForm(definition));
  const [errors, setErrors] = useState({});

  const canRename = !editing || definition.can_rename === true;

  const canChangeStatus = !editing || (
    form.is_active
      ? definition.can_deactivate === true || definition.is_active === false
      : definition.can_activate === true || definition.is_active === true
  );

  const statusReason = editing
    ? definition.is_active
      ? definition.deactivate_block_reason
      : definition.activate_block_reason
    : null;

  const changes = useMemo(() => getChanges(form, definition), [form, definition]);

  const hasChanges = editing
    ? Object.keys(changes).length > 0
    : Boolean(form.name.trim());

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));

    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleOrderChange = (value) => {
    const normalized = value.replace(/\D/g, "").slice(0, 10);
    handleChange("sort_order", normalized);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!hasChanges || saving) {
      return;
    }

    const validationErrors = validateForm(form, editing, definition);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      await onSave(changes, definition);
    } catch {
      // La página principal muestra el error correspondiente.
    }
  };

  const title = editing ? "Editar etapa personalizada" : "Nueva etapa personalizada";

  const description = editing
    ? `Modifica la configuración de ${definition.name}.`
    : "Crea un tipo de etapa que podrás utilizar en los Conjuntos de esta sucursal.";

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onCancel}
      fullWidth
      maxWidth="sm"
      fullScreen={isMobile}
      scroll="paper"
      aria-labelledby="menu-set-definition-dialog-title"
      slotProps={{
        paper: {
          sx: {
            borderRadius: { xs: 0, sm: 1 },
            overflow: "hidden",
            backgroundColor: "background.paper",
            height: {
              xs: "100dvh",
              sm: "min(600px, calc(100dvh - 48px))",
            },
            maxHeight: "none",
            display: "flex",
            flexDirection: "column",
          },
        },
      }}
    >
      {/* Encabezado */}
      <DialogTitle
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          bgcolor: "#111111",
          color: "#fff",
          flexShrink: 0,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              id="menu-set-definition-dialog-title"
              sx={{
                fontWeight: 800,
                fontSize: { xs: 20, sm: 24 },
                lineHeight: 1.2,
                color: "#fff",
              }}
            >
              {title}
            </Typography>

            <Typography sx={{
              mt: 0.5, fontSize: 13,
              color: "rgba(255,255,255,0.82)",
              lineHeight: 1.5,
            }}>
              {description}
            </Typography>
          </Box>

          <IconButton
            type="button"
            onClick={onCancel}
            disabled={saving}
            aria-label="Cerrar"
            sx={{
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.08)",
              borderRadius: 1,
              flexShrink: 0,
              "&:hover": { bgcolor: "rgba(255,255,255,0.16)" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      {/* Contenido con desplazamiento interno */}
      <DialogContent
        sx={{
          px: { xs: 2, sm: 3 },
          pt: "0 !important",
          pb: { xs: 2, sm: 3 },
          bgcolor: "background.default",
          flex: "1 1 auto",
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Contenedor blanco desde el borde superior */}
        <Card
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{
            borderRadius: 0,
            backgroundColor: "background.paper",
            minHeight: "100%",
            display: "flex",
            flexDirection: "column",
            boxShadow: "none",
          }}
        >
          <CardContent
            sx={{
              p: { xs: 2, sm: 3 },
              flex: 1,
              display: "flex",
              flexDirection: "column",
              "&:last-child": { pb: { xs: 2, sm: 3 } },
            }}
          >
            <Stack spacing={2.5} sx={{ flex: 1 }}>
              <Typography sx={{
                fontWeight: 800,
                fontSize: { xs: 18, sm: 20 },
                color: "text.primary",
              }}>
                Datos de la etapa
              </Typography>

              {/* Nombre */}
              <FieldBlock
                label="Nombre *"
                help={!canRename
                  ? definition.rename_block_reason || "El nombre no puede modificarse actualmente."
                  : "Utiliza un nombre que permita identificar esta etapa en tus Conjuntos."}
              >
                <TextField
                  fullWidth
                  value={form.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                  placeholder="Ej. Bebida especial"
                  inputProps={{ maxLength: 120 }}
                  error={Boolean(errors.name)}
                  helperText={errors.name || ""}
                  disabled={saving || !canRename}
                />
              </FieldBlock>

              {/* Orden */}
              <FieldBlock
                label="Orden de presentación"
                help="Las etapas con un número menor aparecerán primero entre los tipos disponibles."
              >
                <TextField
                  fullWidth
                  type="text"
                  value={form.sort_order}
                  onChange={(event) => handleOrderChange(event.target.value)}
                  placeholder="Ej. 0"
                  inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                  error={Boolean(errors.sort_order)}
                  helperText={errors.sort_order || ""}
                  disabled={saving}
                />
              </FieldBlock>

              {/* Estado */}
              <Box sx={{
                p: 1.75,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                bgcolor: "background.default",
              }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={1.5}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
                      {editing ? "Estado de la etapa" : "Estado inicial"}
                    </Typography>

                    <Typography sx={{
                      mt: 0.5, fontSize: 12,
                      color: "text.secondary", lineHeight: 1.5,
                    }}>
                      {editing && !canChangeStatus && statusReason
                        ? statusReason
                        : form.is_active
                          ? "Esta etapa estará disponible para utilizarse en los Conjuntos."
                          : "Esta etapa permanecerá guardada, pero no podrá agregarse a nuevos Conjuntos."}
                    </Typography>

                    {errors.is_active ? (
                      <Typography sx={{ mt: 0.5, fontSize: 12, color: "error.main" }}>
                        {errors.is_active}
                      </Typography>
                    ) : null}
                  </Box>

                  <FormControlLabel
                    sx={{ m: 0 }}
                    control={
                      <Switch
                        color="primary"
                        checked={form.is_active}
                        onChange={(event) => handleChange("is_active", event.target.checked)}
                        disabled={saving || !canChangeStatus}
                        inputProps={{ "aria-label": "Estado de la etapa" }}
                      />
                    }
                    label={
                      <Typography sx={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: form.is_active ? "success.main" : "text.secondary",
                      }}>
                        {form.is_active ? "Activa" : "Inactiva"}
                      </Typography>
                    }
                  />
                </Stack>
              </Box>

              {/* Acciones */}
              <Stack
                direction={{ xs: "column-reverse", sm: "row" }}
                justifyContent="flex-end"
                spacing={1.5}
                pt={1}
                sx={{ mt: "auto !important" }}
              >
                <Button
                  type="button"
                  variant="outlined"
                  onClick={onCancel}
                  disabled={saving}
                  sx={{ minWidth: { xs: "100%", sm: 150 }, height: 44 }}
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving || !hasChanges}
                  startIcon={saving
                    ? <CircularProgress size={18} color="inherit" />
                    : <SaveOutlinedIcon />}
                  sx={{
                    minWidth: { xs: "100%", sm: 190 },
                    height: 44,
                    fontWeight: 800,
                  }}
                >
                  {saving ? "Guardando…" : editing ? "Guardar cambios" : "Crear etapa"}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}