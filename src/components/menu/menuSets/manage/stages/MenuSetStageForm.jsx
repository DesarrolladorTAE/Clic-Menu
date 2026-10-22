import { useMemo, useState } from "react";

import {
  Box, Button, Card, CardContent, CircularProgress, Dialog,
  DialogContent, DialogTitle, FormControlLabel, IconButton,
  MenuItem, Stack, Switch, TextField, Typography, useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloseIcon from "@mui/icons-material/Close";

function mapStageToForm(stage) {
  return {
    stage_definition_id: stage ? String(stage.stage_definition_id) : "",
    required: Boolean(stage?.required),
    min_selections: String(stage?.min_selections ?? 0),
    max_selections: String(stage?.max_selections ?? 1),
    sort_order: String(stage?.sort_order ?? 0),
    is_active: Boolean(stage?.is_active),
  };
}

function getChanges(form, stage) {
  if (!stage) {
    return {
      stage_definition_id: Number(form.stage_definition_id),
      required: form.required,
      min_selections: Number(form.min_selections),
      max_selections: Number(form.max_selections),
      sort_order: Number(form.sort_order),
      is_active: form.is_active,
    };
  }

  const original = mapStageToForm(stage);
  const changes = {};

  if (form.required !== original.required) {
    changes.required = form.required;
  }

  if (form.min_selections !== original.min_selections) {
    changes.min_selections = Number(form.min_selections);
  }

  if (form.max_selections !== original.max_selections) {
    changes.max_selections = Number(form.max_selections);
  }

  if (form.sort_order !== original.sort_order) {
    changes.sort_order = Number(form.sort_order);
  }

  if (form.is_active !== original.is_active) {
    changes.is_active = form.is_active;
  }

  return changes;
}

function validateForm(form, editing) {
  const errors = {};

  if (!editing && !form.stage_definition_id) {
    errors.stage_definition_id = "Debes seleccionar un tipo de etapa.";
  }

  const min = form.min_selections.trim();
  const max = form.max_selections.trim();
  const order = form.sort_order.trim();

  if (!/^\d+$/.test(min) || Number(min) > 65535) {
    errors.min_selections = "Ingresa una cantidad mínima válida entre 0 y 65535.";
  }

  if (!/^\d+$/.test(max) || Number(max) < 1 || Number(max) > 65535) {
    errors.max_selections = "Ingresa una cantidad máxima válida entre 1 y 65535.";
  }

  if (!errors.min_selections && !errors.max_selections) {
    if (Number(min) > Number(max)) {
      errors.min_selections = "La cantidad mínima no puede superar la máxima.";
    }

    if (form.required && Number(min) < 1) {
      errors.min_selections = "Una etapa obligatoria debe exigir al menos una selección.";
    }

    if (!form.required && Number(min) !== 0) {
      errors.min_selections = "Una etapa opcional debe tener una cantidad mínima de cero.";
    }
  }

  if (
    !/^\d+$/.test(order) ||
    !Number.isSafeInteger(Number(order)) ||
    Number(order) > 4294967295
  ) {
    errors.sort_order = "Ingresa un orden válido entre 0 y 4294967295.";
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

export default function MenuSetStageForm({
  open = false,
  stage = null,
  menuSet,
  definitions = [],
  usedDefinitionIds = [],
  saving = false,
  onSave,
  onCancel,
  onAlert,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const editing = Boolean(stage);

  const [form, setForm] = useState(() => mapStageToForm(stage));
  const [errors, setErrors] = useState({});

  const canEditRules = !editing || stage.can_edit_selection_rules === true;
  const canEditOrder = !editing || stage.can_edit === true;

  const canChangeStatus = editing
    ? stage.is_active
      ? stage.can_deactivate === true
      : stage.can_activate === true
    : !menuSet?.is_active;

  const statusReason = editing
    ? stage.is_active
      ? stage.deactivate_block_reason
      : stage.activate_block_reason
    : menuSet?.is_active
      ? "Primero agrega la etapa y configura sus productos antes de activarla."
      : null;

  const availableDefinitions = useMemo(() => {
    return definitions.filter((definition) => {
      return Boolean(definition.is_active)
        && !usedDefinitionIds.includes(Number(definition.id));
    });
  }, [definitions, usedDefinitionIds]);

  const systemDefinitions = availableDefinitions.filter(
    (definition) => Boolean(definition.is_system)
  );

  const customDefinitions = availableDefinitions.filter(
    (definition) => !definition.is_system
  );

  const changes = useMemo(() => getChanges(form, stage), [form, stage]);

  const hasChanges = editing
    ? Object.keys(changes).length > 0
    : Boolean(form.stage_definition_id);

  const handleFieldChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));

    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleRequiredChange = (checked) => {
    setForm((current) => ({
      ...current,
      required: checked,
      min_selections: checked ? "1" : "0",
    }));

    setErrors((current) => {
      const next = { ...current };
      delete next.required;
      delete next.min_selections;
      return next;
    });
  };

  const handleNumericChange = (field, value, maxLength = 10) => {
    const normalized = value.replace(/\D/g, "").slice(0, maxLength);
    handleFieldChange(field, normalized);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!hasChanges || saving) {
      return;
    }

    const validationErrors = validateForm(form, editing);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      await onSave(changes, stage);
    } catch (error) {
      const serverErrors = error?.response?.data?.errors;

      if (serverErrors && typeof serverErrors === "object") {
        const mappedErrors = {};

        Object.entries(serverErrors).forEach(([field, messages]) => {
          mappedErrors[field] = Array.isArray(messages) ? messages[0] : String(messages);
        });

        setErrors(mappedErrors);
      }

      onAlert?.({
        severity: "error",
        title: "Error",
        message: Object.values(serverErrors || {}).flat()[0]
          || error?.response?.data?.message
          || error?.message
          || "No se pudo guardar la etapa.",
      });
    }
  };

  const title = editing ? "Editar etapa" : "Agregar etapa";

  const description = editing
    ? `Modifica la configuración de ${stage.name || "esta etapa"}.`
    : "Selecciona un tipo de etapa y establece sus reglas de selección.";

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onCancel}
      fullWidth
      maxWidth="md"
      fullScreen={isMobile}
      scroll="paper"
      aria-labelledby="menu-set-stage-dialog-title"
      slotProps={{
        paper: {
          sx: {
            borderRadius: { xs: 0, sm: 1 },
            overflow: "hidden",
            backgroundColor: "background.paper",
            height: {
              xs: "100dvh",
              sm: "min(780px, calc(100dvh - 48px))",
            },
            maxHeight: "none",
            display: "flex",
            flexDirection: "column",
          },
        },
      }}
    >
      {/* Encabezado negro */}
      <DialogTitle
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          bgcolor: "#111111",
          color: "#fff",
          flexShrink: 0,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              id="menu-set-stage-dialog-title"
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
                lineHeight: 1.5,
              }}
            >
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
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.16)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      {/* Contenido con desplazamiento interno */}
      <DialogContent
        sx={{
            p: { xs: 2, sm: 3 },
            pt: "0 !important",
            bgcolor: "background.default",
            flex: "1 1 auto",
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Contenedor blanco del formulario */}
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
          }}
        >
          <CardContent
            sx={{
              p: { xs: 2, sm: 3 },
              flex: 1,
              display: "flex",
              flexDirection: "column",
              "&:last-child": {
                pb: { xs: 2, sm: 3 },
              },
            }}
          >
            <Stack spacing={2.5} sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: 18, sm: 20 },
                  color: "text.primary",
                }}
              >
                Datos de la etapa
              </Typography>

              {/* Tipo de etapa */}
              <FieldBlock
                label="Tipo de etapa *"
                help={editing
                  ? "El tipo de etapa no puede sustituirse. Puedes agregar otra etapa si lo necesitas."
                  : "Selecciona una de las etapas disponibles para esta sucursal."}
              >
                {editing ? (
                  <TextField
                    fullWidth
                    value={stage.name || stage.stage_definition?.name || ""}
                    disabled
                  />
                ) : (
                  <TextField
                    fullWidth
                    select
                    value={form.stage_definition_id}
                    onChange={(event) => handleFieldChange("stage_definition_id", event.target.value)}
                    SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
                    error={Boolean(errors.stage_definition_id)}
                    helperText={errors.stage_definition_id || ""}
                    disabled={saving}
                  >
                    <MenuItem value="" disabled>
                      Selecciona un tipo de etapa
                    </MenuItem>

                    {systemDefinitions.length > 0 ? (
                      <MenuItem
                        disabled
                        sx={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: "primary.main !important",
                          opacity: "1 !important",
                        }}
                      >
                        Etapas predeterminadas
                      </MenuItem>
                    ) : null}

                    {systemDefinitions.map((definition) => (
                      <MenuItem key={definition.id} value={String(definition.id)}>
                        {definition.name}
                      </MenuItem>
                    ))}

                    {customDefinitions.length > 0 ? (
                      <MenuItem
                        disabled
                        sx={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: "primary.main !important",
                          opacity: "1 !important",
                        }}
                      >
                        Etapas personalizadas
                      </MenuItem>
                    ) : null}

                    {customDefinitions.map((definition) => (
                      <MenuItem key={definition.id} value={String(definition.id)}>
                        {definition.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              </FieldBlock>

              {/* Obligatoriedad */}
              <Box
                sx={{
                  p: 1.75,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  backgroundColor: "background.default",
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={1.5}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
                      Etapa obligatoria
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.5,
                        fontSize: 12,
                        color: "text.secondary",
                        lineHeight: 1.5,
                      }}
                    >
                      {form.required
                        ? "El cliente deberá seleccionar al menos un producto de esta etapa."
                        : "El cliente podrá continuar sin seleccionar productos de esta etapa."}
                    </Typography>
                  </Box>

                  <FormControlLabel
                    sx={{ m: 0 }}
                    control={
                      <Switch
                        color="primary"
                        checked={form.required}
                        onChange={(event) => handleRequiredChange(event.target.checked)}
                        disabled={saving || !canEditRules}
                        inputProps={{ "aria-label": "Etapa obligatoria" }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
                        {form.required ? "Sí" : "No"}
                      </Typography>
                    }
                  />
                </Stack>
              </Box>

              {!canEditRules && stage?.edit_selection_rules_block_reason ? (
                <Typography sx={{ fontSize: 12, color: "text.secondary", lineHeight: 1.5 }}>
                  {stage.edit_selection_rules_block_reason}
                </Typography>
              ) : null}

              {/* Cantidades */}
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <FieldBlock
                  label="Selecciones mínimas *"
                  help="Cantidad mínima de productos que deberá seleccionar el cliente."
                >
                  <TextField
                    fullWidth
                    type="text"
                    value={form.min_selections}
                    onChange={(event) => handleNumericChange("min_selections", event.target.value, 5)}
                    inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                    error={Boolean(errors.min_selections)}
                    helperText={errors.min_selections || ""}
                    disabled={saving || !canEditRules || !form.required}
                  />
                </FieldBlock>

                <FieldBlock
                  label="Selecciones máximas *"
                  help="Cantidad máxima de productos que podrá seleccionar el cliente."
                >
                  <TextField
                    fullWidth
                    type="text"
                    value={form.max_selections}
                    onChange={(event) => handleNumericChange("max_selections", event.target.value, 5)}
                    inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                    error={Boolean(errors.max_selections)}
                    helperText={errors.max_selections || ""}
                    disabled={saving || !canEditRules}
                  />
                </FieldBlock>
              </Stack>

              {/* Orden */}
              <FieldBlock
                label="Orden de presentación"
                help="Las etapas con un número menor aparecerán primero dentro del conjunto."
              >
                <TextField
                  fullWidth
                  type="text"
                  value={form.sort_order}
                  onChange={(event) => handleNumericChange("sort_order", event.target.value)}
                  inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                  error={Boolean(errors.sort_order)}
                  helperText={errors.sort_order || ""}
                  disabled={saving || !canEditOrder}
                />
              </FieldBlock>

              {/* Estado */}
              <Box
                sx={{
                  p: 1.75,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  backgroundColor: "background.default",
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={1.5}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
                      Estado de la etapa
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.5,
                        fontSize: 12,
                        color: "text.secondary",
                        lineHeight: 1.5,
                      }}
                    >
                      {statusReason && !canChangeStatus
                        ? statusReason
                        : "Define si esta etapa estará habilitada dentro del conjunto."}
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
                        onChange={(event) => handleFieldChange("is_active", event.target.checked)}
                        disabled={saving || !canChangeStatus}
                        inputProps={{ "aria-label": "Estado de la etapa" }}
                      />
                    }
                    label={
                      <Typography
                        sx={{
                          fontSize: 14,
                          fontWeight: 800,
                          color: form.is_active ? "success.main" : "text.secondary",
                        }}
                      >
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
                  sx={{
                    minWidth: { xs: "100%", sm: 150 },
                    height: 44,
                    borderRadius: 2,
                  }}
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
                    borderRadius: 2,
                    fontWeight: 800,
                  }}
                >
                  {saving
                    ? "Guardando…"
                    : editing ? "Guardar cambios" : "Agregar etapa"}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}