import { useMemo, useState } from "react";

import {
  Autocomplete, Box, Button, Card, CardContent, CircularProgress,
  Dialog, DialogContent, DialogTitle, FormControlLabel, IconButton,
  Stack, Switch, TextField, Typography, useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

const DAYS = [
  { id: 1, short: "Lun", name: "Lunes" },
  { id: 2, short: "Mar", name: "Martes" },
  { id: 3, short: "Mié", name: "Miércoles" },
  { id: 4, short: "Jue", name: "Jueves" },
  { id: 5, short: "Vie", name: "Viernes" },
  { id: 6, short: "Sáb", name: "Sábado" },
  { id: 7, short: "Dom", name: "Domingo" },
];

const CAPACITY_LABELS = {
  none: "Sin límite",
  daily: "Capacidad diaria",
  weekly: "Capacidad semanal",
};

function normalizeDays(days) {
  if (!Array.isArray(days)) return [];

  return [...new Set(days.map(Number))]
    .filter((day) => Number.isInteger(day) && day >= 1 && day <= 7)
    .sort((a, b) => a - b);
}

function normalizeCapacities(capacities) {
  if (!capacities || typeof capacities !== "object") return {};

  return Object.fromEntries(
    Object.entries(capacities).map(([day, capacity]) => [
      String(day),
      capacity === null || capacity === undefined ? "" : String(capacity),
    ])
  );
}

function mapOptionToForm(option) {
  return {
    product_id: option ? String(option.product_id) : "",
    service_days: normalizeDays(option?.service_days),
    weekly_capacity: option?.weekly_capacity === null || option?.weekly_capacity === undefined
      ? "" : String(option.weekly_capacity),
    daily_capacities: normalizeCapacities(option?.daily_capacities),
    sort_order: String(option?.sort_order ?? 0),
    is_active: option ? Boolean(option.is_active) : true,
  };
}

function sameDays(first, second) {
  return JSON.stringify(normalizeDays(first)) === JSON.stringify(normalizeDays(second));
}

function getChanges(form, option, mode) {
  const payload = {
    sort_order: Number(form.sort_order),
    is_active: Boolean(form.is_active),
    service_days: normalizeDays(form.service_days),
  };

  if (mode === "weekly") {
    payload.weekly_capacity = Number(form.weekly_capacity);
  }

  if (mode === "daily") {
    payload.daily_capacities = Object.fromEntries(
      form.service_days.map((day) => [
        String(day),
        Number(form.daily_capacities[String(day)]),
      ])
    );
  }

  if (!option) {
    return { product_id: Number(form.product_id), ...payload };
  }

  const original = mapOptionToForm(option);
  const changes = {};

  if (form.sort_order !== original.sort_order) {
    changes.sort_order = payload.sort_order;
  }

  if (form.is_active !== original.is_active) {
    changes.is_active = form.is_active;
  }

  const daysChanged = !sameDays(form.service_days, original.service_days);

  if (daysChanged) {
    changes.service_days = payload.service_days;
  }

  if (mode === "weekly" && form.weekly_capacity !== original.weekly_capacity) {
    changes.weekly_capacity = payload.weekly_capacity;
  }

  if (mode === "daily") {
    const capacitiesChanged = form.service_days.some((day) => {
      return String(form.daily_capacities[String(day)] ?? "")
        !== String(original.daily_capacities[String(day)] ?? "");
    });

    if (daysChanged || capacitiesChanged) {
      changes.daily_capacities = payload.daily_capacities;
    }
  }

  return changes;
}

function validateForm(form, option, mode, allowedDays) {
  const errors = {};

  if (!option && !form.product_id) {
    errors.product_id = "Debes seleccionar un producto.";
  }

  if (!/^\d+$/.test(form.sort_order) || Number(form.sort_order) > 4294967295) {
    errors.sort_order = "Indica un orden válido entre 0 y 4294967295.";
  }

  if (form.service_days.some((day) => !allowedDays.includes(day))) {
    errors.service_days = "Selecciona únicamente días disponibles para el conjunto.";
  }

  if (form.is_active && form.service_days.length === 0) {
    errors.service_days = "Selecciona al menos un día para activar el producto.";
  }

  if (option?.can_remove_service_days === false) {
    const removed = normalizeDays(option.service_days)
      .some((day) => !form.service_days.includes(day));

    if (removed) {
      errors.service_days = option.remove_service_days_block_reason
        || "No puedes retirar días de servicio de este producto.";
    }
  }

  if (mode === "weekly") {
    const weekly = String(form.weekly_capacity);

    if (!/^\d+$/.test(weekly) || Number(weekly) > 4294967295) {
      errors.weekly_capacity = "Indica una capacidad semanal válida entre 0 y 4294967295.";
    }
  }

  if (mode === "daily") {
    form.service_days.forEach((day) => {
      const capacity = String(form.daily_capacities[String(day)] ?? "");

      if (!/^\d+$/.test(capacity) || !Number.isSafeInteger(Number(capacity))) {
        errors[`daily_capacities.${day}`] = "Indica una capacidad diaria válida.";
      }
    });
  }

  return errors;
}

function getErrorMessage(error) {
  const data = error?.response?.data;
  const fields = data?.errors && typeof data.errors === "object"
    ? Object.values(data.errors).flat()
    : [];

  return fields.find((message) => typeof message === "string")
    || data?.message || error?.message || "No se pudo guardar el producto.";
}

function FieldBlock({ label, help, children }) {
  return (
    <Box sx={{ flex: 1, width: "100%", minWidth: 0 }}>
      <Typography sx={{ mb: 1, fontSize: 14, fontWeight: 800, color: "text.primary" }}>
        {label}
      </Typography>

      {children}

      {help ? (
        <Typography sx={{ mt: 0.75, fontSize: 12, lineHeight: 1.5, color: "text.secondary" }}>
          {help}
        </Typography>
      ) : null}
    </Box>
  );
}

export default function MenuSetProductForm({
  open = false,
  option = null,
  menuSet,
  stage,
  products = [],
  saving = false,
  onSave,
  onCancel,
  onAlert,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const editing = Boolean(option);
  const mode = menuSet?.capacity_mode || "none";

  const [form, setForm] = useState(() => mapOptionToForm(option));
  const [errors, setErrors] = useState({});

  const allowedDays = useMemo(() => normalizeDays(menuSet?.service_days), [menuSet?.service_days]);

  const availableDays = DAYS.filter((day) => allowedDays.includes(day.id));

  const selectedProduct = useMemo(() => {
    return products.find((product) => String(product.id) === form.product_id) || null;
  }, [products, form.product_id]);

  const originalDays = useMemo(() => normalizeDays(option?.service_days), [option?.service_days]);

  const canEditCapacity = !editing || option.can_edit_capacity === true;
  const canEdit = !editing || option.can_edit === true;

  const canActivate = !editing || option.is_active || option.can_activate === true;
  const canDeactivate = !editing || !option.is_active || option.can_deactivate === true;

  const changes = useMemo(() => getChanges(form, option, mode), [form, option, mode]);

  const hasChanges = editing
    ? Object.keys(changes).length > 0
    : Boolean(form.product_id);

  const handleFieldChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));

    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleNumericChange = (field, value, maxLength = 10) => {
    handleFieldChange(field, value.replace(/\D/g, "").slice(0, maxLength));
  };

  const handleDayToggle = (day) => {
    if (saving || !canEdit) return;

    const selected = form.service_days.includes(day);
    const protectedDay = editing && originalDays.includes(day)
      && option.can_remove_service_days !== true;

    if (selected && protectedDay) return;

    const nextDays = selected
      ? form.service_days.filter((current) => current !== day)
      : normalizeDays([...form.service_days, day]);

    handleFieldChange("service_days", nextDays);
  };

  const handleDailyCapacityChange = (day, value) => {
    const normalized = value.replace(/\D/g, "").slice(0, 10);

    setForm((current) => ({
      ...current,
      daily_capacities: {
        ...current.daily_capacities,
        [String(day)]: normalized,
      },
    }));

    setErrors((current) => {
      const next = { ...current };
      delete next[`daily_capacities.${day}`];
      delete next.daily_capacities;
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!hasChanges || saving) return;

    const validationErrors = validateForm(form, option, mode, allowedDays);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      await onSave?.(changes, option);
    } catch (error) {
      const serverErrors = error?.response?.data?.errors;

      if (serverErrors && typeof serverErrors === "object") {
        const mapped = {};

        Object.entries(serverErrors).forEach(([field, messages]) => {
          mapped[field] = Array.isArray(messages) ? messages[0] : String(messages);
        });

        setErrors(mapped);
      }

      onAlert?.({
        severity: "error",
        title: "Error",
        message: getErrorMessage(error),
      });
    }
  };

  const title = editing ? "Editar producto" : "Agregar producto";

  const description = editing
    ? `Modifica la configuración de ${option.name || "este producto"}.`
    : `Selecciona un producto para la etapa ${stage?.name || "seleccionada"}.`;

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onCancel}
      fullWidth
      maxWidth="md"
      fullScreen={isMobile}
      scroll="paper"
      aria-labelledby="menu-set-product-dialog-title"
      slotProps={{
        paper: {
          sx: {
            borderRadius: { xs: 0, sm: 1 },
            overflow: "hidden",
            backgroundColor: "background.paper",
            height: { xs: "100dvh", sm: "min(780px, calc(100dvh - 48px))" },
            maxHeight: "none",
            display: "flex",
            flexDirection: "column",
          },
        },
      }}
    >
      {/* Encabezado */}
      <DialogTitle sx={{
        px: { xs: 2, sm: 3 }, py: 2,
        bgcolor: "#111111", color: "#fff", flexShrink: 0,
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              id="menu-set-product-dialog-title"
              sx={{
                fontWeight: 800, fontSize: { xs: 20, sm: 24 },
                lineHeight: 1.2, color: "#fff",
              }}
            >
              {title}
            </Typography>

            <Typography sx={{
              mt: 0.5, fontSize: 13,
              color: "rgba(255,255,255,0.82)", lineHeight: 1.5,
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
      <DialogContent sx={{
        p: { xs: 2, sm: 3 },
        pt: "0 !important",
        bgcolor: "background.default",
        flex: "1 1 auto",
        minHeight: 0,
        overflowY: "auto",
        overflowX: "hidden",
        overscrollBehavior: "contain",
        WebkitOverflowScrolling: "touch",
      }}>
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
          <CardContent sx={{
            p: { xs: 2, sm: 3 },
            flex: 1,
            display: "flex",
            flexDirection: "column",
            "&:last-child": { pb: { xs: 2, sm: 3 } },
          }}>
            <Stack spacing={2.5} sx={{ flex: 1 }}>
              <Typography sx={{
                fontWeight: 800, fontSize: { xs: 18, sm: 20 },
                color: "text.primary",
              }}>
                Datos del producto
              </Typography>

              {/* Producto */}
              <FieldBlock
                label="Producto *"
                help={editing
                  ? "El producto asignado no puede sustituirse. Puedes retirarlo y agregar otro cuando esté permitido."
                  : "Solo se muestran productos disponibles para esta sucursal y permitidos por tu plan."}
              >
                {editing ? (
                  <TextField
                    fullWidth
                    value={option.name || option.product?.name || ""}
                    disabled
                  />
                ) : (
                  <Autocomplete
                    options={products}
                    value={selectedProduct}
                    onChange={(_, product) => handleFieldChange(
                      "product_id",
                      product ? String(product.id) : ""
                    )}
                    getOptionLabel={(product) => product?.name || ""}
                    isOptionEqualToValue={(first, second) => Number(first.id) === Number(second.id)}
                    noOptionsText="No se encontraron productos disponibles"
                    disabled={saving}
                    autoHighlight
                    renderOption={(props, product) => {
                      const { key, ...otherProps } = props;

                      return (
                        <Box component="li" key={key} {...otherProps}>
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Inventory2OutlinedIcon
                              fontSize="small"
                              sx={{ color: "primary.main" }}
                            />
                            <Typography sx={{ fontSize: 14 }}>
                              {product.name}
                            </Typography>
                          </Stack>
                        </Box>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Buscar y seleccionar producto"
                        error={Boolean(errors.product_id)}
                        helperText={errors.product_id || ""}
                      />
                    )}
                  />
                )}
              </FieldBlock>

              {/* Modalidad */}
              <Box sx={{
                p: 1.75,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                bgcolor: "background.default",
              }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
                      Modalidad de capacidad
                    </Typography>

                    <Typography sx={{
                      mt: 0.5, fontSize: 12, lineHeight: 1.5,
                      color: "text.secondary",
                    }}>
                      La modalidad corresponde a la configuración general del conjunto.
                    </Typography>
                  </Box>

                  <Typography sx={{
                    fontSize: 14, fontWeight: 800,
                    color: "primary.main",
                  }}>
                    {CAPACITY_LABELS[mode] || "No configurada"}
                  </Typography>
                </Stack>
              </Box>

              {/* Días de servicio */}
              <FieldBlock
                label="Días de servicio"
                help="Selecciona los días en los que este producto estará disponible dentro del conjunto."
              >
                {availableDays.length === 0 ? (
                  <Box sx={{
                    p: 1.75,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    bgcolor: "background.default",
                  }}>
                    <Typography sx={{
                      fontSize: 13, color: "text.secondary", lineHeight: 1.5,
                    }}>
                      El conjunto todavía no tiene días de servicio configurados.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "repeat(4, minmax(0, 1fr))",
                      sm: "repeat(7, minmax(0, 1fr))",
                    },
                    gap: 1,
                  }}>
                    {availableDays.map((day) => {
                      const selected = form.service_days.includes(day.id);
                      const protectedDay = editing && selected
                        && originalDays.includes(day.id)
                        && option.can_remove_service_days !== true;

                      return (
                        <Button
                          key={day.id}
                          type="button"
                          variant={selected ? "contained" : "outlined"}
                          onClick={() => handleDayToggle(day.id)}
                          disabled={saving || !canEdit || protectedDay}
                          aria-label={`${selected ? "Quitar" : "Seleccionar"} ${day.name}`}
                          aria-pressed={selected}
                          sx={{
                            minWidth: 0,
                            height: 44,
                            fontSize: 13,
                            fontWeight: 800,
                            opacity: protectedDay ? 0.75 : 1,
                          }}
                        >
                          {day.short}
                        </Button>
                      );
                    })}
                  </Box>
                )}

                {errors.service_days ? (
                  <Typography sx={{ mt: 1, fontSize: 12, color: "error.main" }}>
                    {errors.service_days}
                  </Typography>
                ) : null}

                {editing && option.can_remove_service_days === false ? (
                  <Typography sx={{
                    mt: 1, fontSize: 12, color: "text.secondary", lineHeight: 1.5,
                  }}>
                    {option.remove_service_days_block_reason
                      || "Algunos días no pueden retirarse porque existen operaciones relacionadas."}
                  </Typography>
                ) : null}
              </FieldBlock>

              {/* Capacidad semanal */}
              {mode === "weekly" ? (
                <FieldBlock
                  label="Capacidad semanal *"
                  help="Cantidad máxima disponible para este producto durante una semana de servicio."
                >
                  <TextField
                    fullWidth
                    type="text"
                    value={form.weekly_capacity}
                    onChange={(event) => handleNumericChange(
                      "weekly_capacity", event.target.value
                    )}
                    placeholder="Ej. 30"
                    inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                    error={Boolean(errors.weekly_capacity)}
                    helperText={errors.weekly_capacity || ""}
                    disabled={saving || !canEditCapacity}
                  />
                </FieldBlock>
              ) : null}

              {/* Capacidad diaria */}
              {mode === "daily" && form.service_days.length > 0 ? (
                <Stack spacing={1.5}>
                  <Box>
                    <Typography sx={{
                      fontSize: 15, fontWeight: 800, color: "primary.main",
                    }}>
                      Capacidades diarias
                    </Typography>

                    <Typography sx={{
                      mt: 0.5, fontSize: 12,
                      lineHeight: 1.5, color: "text.secondary",
                    }}>
                      Establece cuántas unidades estarán disponibles en cada día seleccionado.
                    </Typography>
                  </Box>

                  <Box sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, minmax(0, 1fr))",
                    },
                    gap: 2,
                  }}>
                    {DAYS.filter((day) => form.service_days.includes(day.id)).map((day) => (
                      <FieldBlock key={day.id} label={`${day.name} *`}>
                        <TextField
                          fullWidth
                          type="text"
                          value={form.daily_capacities[String(day.id)] ?? ""}
                          onChange={(event) => handleDailyCapacityChange(
                            day.id, event.target.value
                          )}
                          placeholder="Ej. 20"
                          inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                          error={Boolean(
                            errors[`daily_capacities.${day.id}`] || errors.daily_capacities
                          )}
                          helperText={
                            errors[`daily_capacities.${day.id}`]
                            || errors.daily_capacities || ""
                          }
                          disabled={saving || !canEditCapacity}
                        />
                      </FieldBlock>
                    ))}
                  </Box>
                </Stack>
              ) : null}

              {/* Orden */}
              <FieldBlock
                label="Orden de presentación"
                help="Los productos con un número menor aparecerán primero dentro de esta etapa."
              >
                <TextField
                  fullWidth
                  type="text"
                  value={form.sort_order}
                  onChange={(event) => handleNumericChange("sort_order", event.target.value)}
                  inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                  error={Boolean(errors.sort_order)}
                  helperText={errors.sort_order || ""}
                  disabled={saving || !canEdit}
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
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
                      Estado del producto
                    </Typography>

                    <Typography sx={{
                      mt: 0.5, fontSize: 12,
                      color: "text.secondary", lineHeight: 1.5,
                    }}>
                      {form.is_active
                        ? "El producto estará habilitado dentro de esta etapa."
                        : "El producto permanecerá guardado sin estar habilitado."}
                    </Typography>

                    {errors.is_active ? (
                      <Typography sx={{ mt: 0.75, fontSize: 12, color: "error.main" }}>
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
                        onChange={(event) => handleFieldChange(
                          "is_active", event.target.checked
                        )}
                        disabled={saving || !canEdit
                          || (form.is_active && !canDeactivate)
                          || (!form.is_active && !canActivate)}
                      />
                    }
                    label={
                      <Typography sx={{
                        fontSize: 14, fontWeight: 800,
                        color: form.is_active ? "success.main" : "text.secondary",
                      }}>
                        {form.is_active ? "Activo" : "Inactivo"}
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
                    fontWeight: 800,
                  }}
                >
                  {saving
                    ? "Guardando…"
                    : editing ? "Guardar cambios" : "Agregar producto"}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}