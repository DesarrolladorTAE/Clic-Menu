import { useMemo, useState } from "react";

import {
  Box, Button, Card, CardContent, CircularProgress, Dialog,
  DialogContent, DialogTitle, FormControlLabel, IconButton,
  MenuItem, Portal, Stack, Switch, TextField, Typography, useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import AppAlert from "../../../../common/AppAlert";

const DAYS = [
  { id: 1, short: "Lun", name: "Lunes" },
  { id: 2, short: "Mar", name: "Martes" },
  { id: 3, short: "Mié", name: "Miércoles" },
  { id: 4, short: "Jue", name: "Jueves" },
  { id: 5, short: "Vie", name: "Viernes" },
  { id: 6, short: "Sáb", name: "Sábado" },
  { id: 7, short: "Dom", name: "Domingo" },
];

function normalizeDays(days) {
  if (!Array.isArray(days)) return [];

  return [...new Set(days.map(Number))]
    .filter((day) => Number.isInteger(day) && day >= 1 && day <= 7)
    .sort((a, b) => a - b);
}

function mapOptionToForm(option) {
  return {
    product_id: option ? String(option.product_id) : "",
    service_days: normalizeDays(option?.service_days),
    sort_order: String(option?.sort_order ?? 0),
    is_active: option ? Boolean(option.is_active) : true,
  };
}

function sameDays(first, second) {
  return JSON.stringify(normalizeDays(first)) === JSON.stringify(normalizeDays(second));
}

function getChanges(form, option) {
  const payload = {
    sort_order: Number(form.sort_order),
    is_active: Boolean(form.is_active),
    service_days: normalizeDays(form.service_days),
  };

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

  if (!sameDays(form.service_days, original.service_days)) {
    changes.service_days = payload.service_days;
  }

  return changes;
}

function validateForm(form, option, allowedDays) {
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

  return errors;
}

function getErrorMessage(error) {
  const data = error?.response?.data;

  const fields = data?.errors && typeof data.errors === "object"
    ? Object.values(data.errors).flat()
    : [];

  return fields.find((message) => typeof message === "string")
    || data?.message
    || "No se pudo guardar el producto. Inténtalo nuevamente.";
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
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const editing = Boolean(option);

  const [form, setForm] = useState(() => mapOptionToForm(option));

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const showAlert = ({
    severity = "error",
    title = "Error",
    message = "",
  }) => {
    setAlertState({ open: true, severity, title, message });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((current) => ({ ...current, open: false }));
  };

  const allowedDays = useMemo(() => normalizeDays(menuSet?.service_days), [menuSet?.service_days]);
  const availableDays = DAYS.filter((day) => allowedDays.includes(day.id));

  const originalDays = useMemo(() => normalizeDays(option?.service_days), [option?.service_days]);

  const canEdit = !editing || option.can_edit === true;

  const canActivate = !editing || option.is_active || option.can_activate === true;
  const canDeactivate = !editing || !option.is_active || option.can_deactivate === true;

  const changes = useMemo(() => getChanges(form, option), [form, option]);

  const hasChanges = editing
    ? Object.keys(changes).length > 0
    : Boolean(form.product_id);

  const handleFieldChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving || (editing && !hasChanges)) return;

    const validationErrors = validateForm(form, option, allowedDays);

    if (Object.keys(validationErrors).length > 0) {
      const firstError = Object.values(validationErrors)[0];

      showAlert({
        severity: "error",
        title: "Revisa la información",
        message: firstError,
      });

      return;
    }

    try {
      await onSave?.(changes, option);
    } catch (error) {
      showAlert({
        severity: "error",
        title: "No se pudo guardar",
        message: getErrorMessage(error),
      });
    }
  };

  const title = editing ? "Editar producto" : "Agregar producto";

  const description = editing
    ? `Modifica la configuración de ${option.name || "este producto"}.`
    : `Selecciona un producto para la etapa ${stage?.name || "seleccionada"}.`;

  return (
    <>
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
                    <TextField
                      select
                      fullWidth
                      value={form.product_id}
                      onChange={(event) => handleFieldChange("product_id", event.target.value)}
                      disabled={saving}
                      SelectProps={{
                        displayEmpty: true,
                        IconComponent: KeyboardArrowDownIcon,
                      }}
                      inputProps={{ "aria-label": "Producto" }}
                    >
                      <MenuItem value="" disabled>
                        <Typography sx={{ color: "text.secondary" }}>
                          Selecciona un producto
                        </Typography>
                      </MenuItem>

                      {products.map((product) => (
                        <MenuItem key={product.id} value={String(product.id)}>
                          {product.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                </FieldBlock>

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

                  {editing && option.can_remove_service_days === false ? (
                    <Typography sx={{
                      mt: 1, fontSize: 12, color: "text.secondary", lineHeight: 1.5,
                    }}>
                      {option.remove_service_days_block_reason
                        || "Algunos días no pueden retirarse porque existen operaciones relacionadas."}
                    </Typography>
                  ) : null}
                </FieldBlock>

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
                          color: "text.primary",
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
                    disabled={saving || (editing && !hasChanges)}
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

      {/* Alertas del formulario */}
      <Portal>
        <AppAlert
          open={alertState.open}
          onClose={closeAlert}
          severity={alertState.severity}
          title={alertState.title}
          message={alertState.message}
          autoHideDuration={3000}
        />
      </Portal>
    </>
  );
}