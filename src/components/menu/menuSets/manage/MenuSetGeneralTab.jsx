import { useEffect, useMemo, useRef, useState } from "react";

import {
  Box, Button, ButtonBase, Chip, CircularProgress,
  FormControlLabel, InputAdornment, Paper, Stack,
  Switch, TextField, Tooltip, Typography,
} from "@mui/material";

import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import PowerSettingsNewRoundedIcon from "@mui/icons-material/PowerSettingsNewRounded";
import RestaurantMenuRoundedIcon from "@mui/icons-material/RestaurantMenuRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { updateMenuSet } from "../../../../services/menu/menuSets/menuSet.service";

const DAYS = [
  { value: 1, label: "Lunes", short: "Lun" },
  { value: 2, label: "Martes", short: "Mar" },
  { value: 3, label: "Miércoles", short: "Mié" },
  { value: 4, label: "Jueves", short: "Jue" },
  { value: 5, label: "Viernes", short: "Vie" },
  { value: 6, label: "Sábado", short: "Sáb" },
  { value: 7, label: "Domingo", short: "Dom" },
];

const CAPACITY_OPTIONS = [
  {
    value: "none",
    label: "Sin límite",
    description: "Los productos no tendrán límites de capacidad comercial.",
  },
  {
    value: "daily",
    label: "Diaria",
    description: "Define una cantidad disponible para cada producto y día.",
  },
  {
    value: "weekly",
    label: "Semanal",
    description: "Define una cantidad semanal disponible para cada producto.",
  },
];

const CAPACITY_LABELS = {
  none: "Sin límite",
  daily: "Diaria",
  weekly: "Semanal",
};

const panelSx = {
  p: { xs: 2, sm: 2.5 },
  borderRadius: 1,
  backgroundColor: "background.paper",
  border: "1px solid",
  borderColor: "divider",
  boxShadow: "none",
};

function normalizeDays(days) {
  return [...new Set(
    (Array.isArray(days) ? days : [])
      .map((day) => Number(day))
      .filter((day) => Number.isInteger(day) && day >= 1 && day <= 7)
  )].sort((a, b) => a - b);
}

function mapMenuSetToForm(menuSet) {
  return {
    name: menuSet?.name ?? "",
    billing_name: menuSet?.billing_name ?? menuSet?.name ?? "",
    price: String(menuSet?.price ?? ""),
    sort_order: String(menuSet?.sort_order ?? 0),
    service_days: normalizeDays(menuSet?.service_days),
    capacity_mode: menuSet?.capacity_mode ?? "none",
    sat_product_service: menuSet?.sat?.sat_product_service ?? "",
    sat_unit: menuSet?.sat?.sat_unit ?? "",
    is_active: Boolean(menuSet?.is_active),
  };
}

function getOptions(menuSet) {
  const stages = Array.isArray(menuSet?.stages) ? menuSet.stages : [];

  return stages.flatMap((stage) => {
    const products = Array.isArray(stage.menu_set_products) ? stage.menu_set_products : [];

    return products.map((option) => {
      const days = Array.isArray(option.service_days) ? option.service_days : [];

      return {
        id: Number(option.id),
        name: option.product?.name || "Producto sin nombre",
        stageName: stage.stage_definition?.name || "Etapa",
        days: normalizeDays(days.map((day) => day.day_of_week)),
      };
    });
  }).filter((option) => Number.isInteger(option.id) && option.id > 0);
}

function normalizePrice(value) {
  return String(value ?? "").trim().replace(",", ".");
}

function getChanges(form, menuSet) {
  const original = mapMenuSetToForm(menuSet);
  const changes = {};

  if (form.name.trim() !== original.name.trim()) {
    changes.name = form.name.trim();
  }

  if (form.billing_name.trim() !== original.billing_name.trim()) {
    changes.billing_name = form.billing_name.trim() || null;
  }

  const price = normalizePrice(form.price);

  if (price === "" || !Number.isFinite(Number(price)) || Number(price) !== Number(original.price)) {
    changes.price = price;
  }

  if (form.sort_order.trim() !== original.sort_order) {
    changes.sort_order = form.sort_order.trim();
  }

  if (JSON.stringify(normalizeDays(form.service_days)) !== JSON.stringify(original.service_days)) {
    changes.service_days = normalizeDays(form.service_days);
  }

  if (form.capacity_mode !== original.capacity_mode) {
    changes.capacity_mode = form.capacity_mode;
  }

  const satProduct = form.sat_product_service.trim();
  const satUnit = form.sat_unit.trim();

  if (
    satProduct !== original.sat_product_service.trim() ||
    satUnit !== original.sat_unit.trim()
  ) {
    changes.sat = {
      sat_product_service: satProduct || null,
      sat_unit: satUnit || null,
    };
  }

  if (form.is_active !== original.is_active) {
    changes.is_active = form.is_active;
  }

  return changes;
}

function validateForm(form, changes, options, limits) {
  const errors = {};

  if (Object.prototype.hasOwnProperty.call(changes, "name")) {
    if (!form.name.trim()) {
      errors.name = "Debes escribir el nombre del Conjunto.";
    } else if (form.name.trim().length > 150) {
      errors.name = "El nombre no puede superar los 150 caracteres.";
    }
  }

  if (form.billing_name.trim().length > 150) {
    errors.billing_name = "El nombre para cobro no puede superar los 150 caracteres.";
  }

  if (Object.prototype.hasOwnProperty.call(changes, "price")) {
    const price = normalizePrice(form.price);

    if (!/^\d+(\.\d{1,2})?$/.test(price) || !Number.isFinite(Number(price))) {
      errors.price = "Ingresa un precio válido con un máximo de dos decimales.";
    }
  }

  if (Object.prototype.hasOwnProperty.call(changes, "sort_order")) {
    const order = form.sort_order.trim();

    if (!/^\d+$/.test(order) || !Number.isSafeInteger(Number(order))) {
      errors.sort_order = "El orden debe ser un número entero igual o mayor que cero.";
    }
  }

  if (
    form.sat_product_service.trim().length > 20 ||
    form.sat_unit.trim().length > 20
  ) {
    errors.sat = "Las claves SAT no pueden superar los 20 caracteres.";
  } else if (
    Boolean(form.sat_product_service.trim()) !== Boolean(form.sat_unit.trim())
  ) {
    errors.sat = "Debes completar ambas claves de facturación o dejar las dos vacías.";
  }

  if (Object.prototype.hasOwnProperty.call(changes, "capacity_mode")) {
    if (form.capacity_mode === "weekly") {
      for (const option of options) {
        const value = String(limits[option.id]?.weekly_capacity ?? "").trim();

        if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value))) {
          errors.capacity_limits = "Debes indicar una capacidad semanal válida para cada producto.";
          break;
        }
      }
    }

    if (form.capacity_mode === "daily") {
      for (const option of options) {
        for (const day of option.days) {
          const value = String(limits[option.id]?.daily_capacities?.[day] ?? "").trim();

          if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value))) {
            errors.capacity_limits = "Debes indicar una capacidad diaria válida para cada producto y día.";
            break;
          }
        }

        if (errors.capacity_limits) {
          break;
        }
      }
    }
  }

  return errors;
}

function buildCapacityLimits(mode, options, limits) {
  const result = {};

  if (mode === "none") {
    return result;
  }

  options.forEach((option) => {
    if (mode === "weekly") {
      result[option.id] = {
        weekly_capacity: Number(limits[option.id]?.weekly_capacity),
      };
    }

    if (mode === "daily") {
      const dailyCapacities = {};

      option.days.forEach((day) => {
        dailyCapacities[day] = Number(limits[option.id]?.daily_capacities?.[day]);
      });

      result[option.id] = {
        daily_capacities: dailyCapacities,
      };
    }
  });

  return result;
}

function SectionTitle({ title, description }) {
  return (
    <Box>
      <Typography sx={{ fontSize: 15, fontWeight: 800, color: "primary.main" }}>
        {title}
      </Typography>

      {description ? (
        <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary", lineHeight: 1.55 }}>
          {description}
        </Typography>
      ) : null}
    </Box>
  );
}

function FieldBlock({ label, help, reason, children }) {
  return (
    <Box sx={{ flex: 1, width: "100%", minWidth: 0 }}>
      <Typography sx={{ mb: 1, fontSize: 14, fontWeight: 800, color: "text.primary" }}>
        {label}
      </Typography>

      {children}

      {reason ? (
        <Typography sx={{ mt: 0.75, fontSize: 12, color: "text.secondary", lineHeight: 1.5 }}>
          {reason}
        </Typography>
      ) : help ? (
        <Typography sx={{ mt: 0.75, fontSize: 12, color: "text.secondary", lineHeight: 1.5 }}>
          {help}
        </Typography>
      ) : null}
    </Box>
  );
}

function ContextCard({ icon, title, value, chipLabel, chipColor = "default" }) {
  return (
    <Box sx={{
      p: 1.75,
      minWidth: 0,
      height: "100%",
      border: "1px solid",
      borderColor: "divider",
      borderRadius: 1,
      backgroundColor: "background.default",
    }}>
      <Stack spacing={1} height="100%">
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{
            width: 34, height: 34, borderRadius: 1,
            display: "grid", placeItems: "center",
            bgcolor: "rgba(255, 152, 0, 0.12)",
            color: "primary.main", flexShrink: 0,
          }}>
            {icon}
          </Box>

          <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
            {title}
          </Typography>
        </Stack>

        <Typography sx={{
          fontSize: 14, color: "text.primary",
          lineHeight: 1.45, overflowWrap: "anywhere",
        }}>
          {value}
        </Typography>

        <Box sx={{ mt: "auto", pt: 1 }}>
          <Chip
            label={chipLabel}
            size="small"
            color={chipColor}
            variant={chipColor === "default" ? "outlined" : "filled"}
          />
        </Box>
      </Stack>
    </Box>
  );
}

function CapacityLimitsEditor({ mode, options, limits, saving, onChange, error }) {
  if (mode === "none" || options.length === 0) {
    return null;
  }

  return (
    <Stack spacing={2}>
      <SectionTitle
        title="Capacidades de los productos"
        description="Configura las nuevas cantidades antes de guardar el cambio de modalidad."
      />

      <Box sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "repeat(2, minmax(0, 1fr))",
        },
        gridAutoRows: "1fr",
        gap: 1.5,
      }}>
        {options.map((option) => (
          <Box key={option.id} sx={{
            p: 2,
            height: "100%",
            minWidth: 0,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            backgroundColor: "background.default",
          }}>
            <Stack spacing={2}>
              <Box>
                <Typography sx={{
                  fontSize: 15, fontWeight: 800,
                  color: "text.primary", overflowWrap: "anywhere",
                }}>
                  {option.name}
                </Typography>

                <Typography sx={{ mt: 0.35, fontSize: 12, color: "text.secondary" }}>
                  Etapa: {option.stageName}
                </Typography>
              </Box>

              {mode === "weekly" ? (
                <FieldBlock label="Capacidad semanal">
                  <TextField
                    fullWidth
                    type="text"
                    value={limits[option.id]?.weekly_capacity ?? ""}
                    onChange={(event) => {
                      const value = event.target.value;

                      if (/^\d*$/.test(value)) {
                        onChange(option.id, "weekly_capacity", value);
                      }
                    }}
                    placeholder="Ej. 50"
                    inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                    disabled={saving}
                  />
                </FieldBlock>
              ) : (
                <>
                  {option.days.length === 0 ? (
                    <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.5 }}>
                      Este producto todavía no tiene días de servicio configurados.
                    </Typography>
                  ) : (
                    <Box sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      gap: 1.25,
                    }}>
                      {option.days.map((day) => (
                        <FieldBlock key={day} label={DAYS[day - 1].label}>
                          <TextField
                            fullWidth
                            type="text"
                            value={limits[option.id]?.daily_capacities?.[day] ?? ""}
                            onChange={(event) => {
                              const value = event.target.value;

                              if (/^\d*$/.test(value)) {
                                onChange(option.id, "daily_capacity", value, day);
                              }
                            }}
                            placeholder="0"
                            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                            disabled={saving}
                          />
                        </FieldBlock>
                      ))}
                    </Box>
                  )}
                </>
              )}
            </Stack>
          </Box>
        ))}
      </Box>

      {error ? (
        <Typography sx={{ fontSize: 12, color: "error.main" }}>
          {error}
        </Typography>
      ) : null}
    </Stack>
  );
}

export default function MenuSetGeneralTab({
  restaurantId,
  branchId,
  menuSet,
  onUpdated,
  onAlert,
}) {
  const [form, setForm] = useState(() => mapMenuSetToForm(menuSet));
  const [limits, setLimits] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  useEffect(() => {
    setForm(mapMenuSetToForm(menuSet));
    setLimits({});
    setErrors({});
  }, [menuSet]);

  const options = useMemo(() => getOptions(menuSet), [menuSet]);
  const changes = useMemo(() => getChanges(form, menuSet), [form, menuSet]);
  const hasChanges = Object.keys(changes).length > 0;

  const canEditCommercial = menuSet?.can_edit_commercial_data === true;
  const canChangeCapacity = menuSet?.can_change_capacity_mode === true;
  const canEditSat = menuSet?.can_edit_sat === true;
  const canRemoveDays = menuSet?.can_remove_service_days === true;
  const canEditOrder = menuSet?.can_edit === true;

  const canChangeStatus = menuSet?.is_active
    ? menuSet?.can_deactivate === true
    : menuSet?.can_activate === true;

  const statusReason = menuSet?.is_active
    ? menuSet?.deactivate_block_reason
    : menuSet?.activate_block_reason;

  const selectedDays = normalizeDays(form.service_days);
  const capacityChanged = form.capacity_mode !== menuSet?.capacity_mode;

  const contextItems = [
    {
      title: "Sucursal",
      value: menuSet?.branch?.name || "Sucursal seleccionada",
      chipLabel: "Seleccionada",
      chipColor: "primary",
      icon: <StorefrontRoundedIcon fontSize="small" />,
    },
    {
      title: "Estado actual",
      value: menuSet?.is_active
        ? "El conjunto está habilitado"
        : "El conjunto todavía no está habilitado",
      chipLabel: menuSet?.is_active ? "Activo" : "Inactivo",
      chipColor: menuSet?.is_active ? "success" : "default",
      icon: <PowerSettingsNewRoundedIcon fontSize="small" />,
    },
    {
      title: "Menús asociados",
      value: `${menuSet?.assigned_menus_count || 0} ${
        Number(menuSet?.assigned_menus_count) === 1 ? "menú" : "menús"
      }`,
      chipLabel: Number(menuSet?.assigned_menus_count) > 0 ? "Asignado" : "Sin asignar",
      chipColor: Number(menuSet?.assigned_menus_count) > 0 ? "primary" : "default",
      icon: <RestaurantMenuRoundedIcon fontSize="small" />,
    },
  ];

  const handleFieldChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));

    setErrors((current) => {
      const next = { ...current };
      delete next[field];

      if (field === "sat_product_service" || field === "sat_unit") {
        delete next.sat;
      }

      return next;
    });
  };

  const handleToggleDay = (day) => {
    const selected = selectedDays.includes(day);

    if (selected && !canRemoveDays) {
      return;
    }

    handleFieldChange(
      "service_days",
      selected
        ? selectedDays.filter((value) => value !== day)
        : normalizeDays([...selectedDays, day])
    );
  };

  const handleCapacityModeChange = (mode) => {
    if (!canChangeCapacity || saving) {
      return;
    }

    setForm((current) => ({ ...current, capacity_mode: mode }));
    setLimits({});
    setErrors((current) => {
      const next = { ...current };
      delete next.capacity_mode;
      delete next.capacity_limits;
      return next;
    });
  };

  const handleLimitChange = (optionId, field, value, day = null) => {
    setLimits((current) => {
      const previous = current[optionId] || {};

      if (field === "weekly_capacity") {
        return {
          ...current,
          [optionId]: { ...previous, weekly_capacity: value },
        };
      }

      return {
        ...current,
        [optionId]: {
          ...previous,
          daily_capacities: {
            ...(previous.daily_capacities || {}),
            [day]: value,
          },
        },
      };
    });

    setErrors((current) => {
      const next = { ...current };
      delete next.capacity_limits;
      return next;
    });
  };

  const handleDiscard = () => {
    setForm(mapMenuSetToForm(menuSet));
    setLimits({});
    setErrors({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!hasChanges || savingRef.current || saving) {
      return;
    }

    const validationErrors = validateForm(form, changes, options, limits);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const payload = { ...changes };

    if (Object.prototype.hasOwnProperty.call(payload, "price")) {
      payload.price = Number(normalizePrice(form.price));
    }

    if (Object.prototype.hasOwnProperty.call(payload, "sort_order")) {
      payload.sort_order = Number(form.sort_order);
    }

    if (capacityChanged && form.capacity_mode !== "none" && options.length > 0) {
      payload.capacity_limits = buildCapacityLimits(form.capacity_mode, options, limits);
    }

    savingRef.current = true;
    setSaving(true);

    try {
      const response = await updateMenuSet(
        restaurantId,
        branchId,
        menuSet.id,
        payload
      );

      const updatedSet = response?.menu_set;

      if (!updatedSet?.id) {
        throw new Error("No se recibió la información actualizada del Conjunto.");
      }

      onUpdated?.(updatedSet);
      setErrors({});

      onAlert?.({
        severity: "success",
        title: "Hecho",
        message: response?.message || "Conjunto actualizado correctamente.",
      });
    } catch (error) {
      const serverErrors = error?.response?.data?.errors;

      if (serverErrors && typeof serverErrors === "object") {
        const mappedErrors = {};

        Object.entries(serverErrors).forEach(([field, messages]) => {
          const message = Array.isArray(messages) ? messages[0] : String(messages);
          const key = field.startsWith("sat.")
            ? field.replace("sat.", "")
            : field.startsWith("capacity_limits.")
              ? "capacity_limits"
              : field;

          mappedErrors[key] = message;
        });

        setErrors(mappedErrors);

        const hasVisibleErrors = Object.keys(mappedErrors).some((field) => (
          field === "name" ||
          field === "billing_name" ||
          field === "price" ||
          field === "sort_order" ||
          field === "capacity_mode" ||
          field === "capacity_limits" ||
          field === "sat" ||
          field === "sat_product_service" ||
          field === "sat_unit" ||
          field === "service_days" ||
          field === "is_active"
        ));

        if (!hasVisibleErrors) {
          onAlert?.({
            severity: "error",
            title: "Error",
            message: error?.response?.data?.message || "No se pudieron guardar los cambios.",
          });
        }
      } else {
        onAlert?.({
          severity: "error",
          title: "Error",
          message: error?.response?.data?.message || error?.message || "No se pudieron guardar los cambios.",
        });
      }
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <Stack spacing={3}>
      {/* Contexto actual */}
      <Paper sx={panelSx}>
        <Stack spacing={2}>
          <Typography sx={{ fontSize: 16, fontWeight: 800, color: "text.primary" }}>
            Contexto actual
          </Typography>

          <Box sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(3, minmax(0, 1fr))",
            },
            gridAutoRows: "1fr",
            gap: 1.5,
          }}>
            {contextItems.map((item) => (
              <ContextCard key={item.title} {...item} />
            ))}
          </Box>
        </Stack>
      </Paper>

      {/* Configuración */}
      <Paper component="form" onSubmit={handleSubmit} sx={panelSx}>
        <Stack spacing={3}>
          <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
            Configuración general
          </Typography>

          {/* Datos generales */}
          <SectionTitle title="Datos generales" />

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FieldBlock
              label="Nombre del conjunto *"
              help="Nombre con el que se identifica este conjunto."
              reason={!canEditCommercial ? menuSet?.edit_commercial_data_block_reason : null}
            >
              <TextField
                fullWidth
                value={form.name}
                onChange={(event) => handleFieldChange("name", event.target.value)}
                inputProps={{ maxLength: 150 }}
                error={Boolean(errors.name)}
                helperText={errors.name || ""}
                disabled={saving || !canEditCommercial}
              />
            </FieldBlock>

            <FieldBlock
              label="Nombre para cobro"
              help="Si lo dejas vacío, se utilizará el nombre del conjunto."
            >
              <TextField
                fullWidth
                value={form.billing_name}
                onChange={(event) => handleFieldChange("billing_name", event.target.value)}
                inputProps={{ maxLength: 150 }}
                error={Boolean(errors.billing_name)}
                helperText={errors.billing_name || ""}
                disabled={saving || !canEditCommercial}
              />
            </FieldBlock>
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FieldBlock
              label="Precio del conjunto *"
              help="Precio correspondiente al conjunto completo."
            >
              <TextField
                fullWidth
                type="text"
                value={form.price}
                onChange={(event) => {
                  const value = event.target.value.replace(",", ".");

                  if (/^\d*(\.\d{0,2})?$/.test(value)) {
                    handleFieldChange("price", value);
                  }
                }}
                inputProps={{ inputMode: "decimal" }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  endAdornment: <InputAdornment position="end">MXN</InputAdornment>,
                }}
                error={Boolean(errors.price)}
                helperText={errors.price || ""}
                disabled={saving || !canEditCommercial}
              />
            </FieldBlock>

            <FieldBlock
              label="Orden de presentación"
              help="Los conjuntos con un número menor aparecerán primero."
            >
              <TextField
                fullWidth
                type="text"
                value={form.sort_order}
                onChange={(event) => {
                  const value = event.target.value;

                  if (/^\d*$/.test(value)) {
                    handleFieldChange("sort_order", value);
                  }
                }}
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                error={Boolean(errors.sort_order)}
                helperText={errors.sort_order || ""}
                disabled={saving || !canEditOrder}
              />
            </FieldBlock>
          </Stack>

          {/* Días de servicio */}
          <SectionTitle
            title="Días de servicio"
            description="Selecciona los días en los que deseas ofrecer este conjunto."
          />

          <Box sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, minmax(0, 1fr))",
              sm: "repeat(4, minmax(0, 1fr))",
              md: "repeat(7, minmax(0, 1fr))",
            },
            gap: 1.25,
          }}>
            {DAYS.map((day) => {
              const selected = selectedDays.includes(day.value);
              const blocked = selected && !canRemoveDays;

              return (
                <Tooltip
                  key={day.value}
                  title={blocked ? menuSet?.remove_service_days_block_reason || "" : ""}
                  arrow
                  enterTouchDelay={0}
                >
                  <Box>
                    <ButtonBase
                      type="button"
                      disabled={saving || blocked}
                      onClick={() => handleToggleDay(day.value)}
                      aria-pressed={selected}
                      aria-label={day.label}
                      sx={{
                        width: "100%",
                        minHeight: 54,
                        p: 1.25,
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: selected ? "secondary.main" : "divider",
                        backgroundColor: selected ? "rgba(214, 122, 58, 0.10)" : "background.default",
                        transition: "border-color 0.18s ease, background-color 0.18s ease",
                        "&:hover": {
                          borderColor: "secondary.main",
                          backgroundColor: "rgba(214, 122, 58, 0.07)",
                        },
                      }}
                    >
                      <Typography sx={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: selected ? "secondary.main" : "text.primary",
                      }}>
                        {day.short}
                      </Typography>
                    </ButtonBase>
                  </Box>
                </Tooltip>
              );
            })}
          </Box>

          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            {selectedDays.length === 0
              ? "No hay días seleccionados."
              : `${selectedDays.length} ${selectedDays.length === 1 ? "día seleccionado" : "días seleccionados"}.`}
          </Typography>

          {!canRemoveDays && menuSet?.remove_service_days_block_reason ? (
            <Typography sx={{ fontSize: 12, color: "text.secondary", lineHeight: 1.5 }}>
              {menuSet.remove_service_days_block_reason}
            </Typography>
          ) : null}

          {errors.service_days ? (
            <Typography sx={{ fontSize: 12, color: "error.main" }}>
              {errors.service_days}
            </Typography>
          ) : null}

          {/* Capacidad */}
          <SectionTitle
            title="Modalidad de capacidad"
            description="Define cómo se controlarán las cantidades disponibles de los productos del conjunto."
          />

          <Box sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(3, minmax(0, 1fr))",
            },
            gridAutoRows: "1fr",
            gap: 1.5,
          }}>
            {CAPACITY_OPTIONS.map((option) => {
              const selected = form.capacity_mode === option.value;

              return (
                <ButtonBase
                  key={option.value}
                  type="button"
                  disabled={saving || !canChangeCapacity}
                  onClick={() => handleCapacityModeChange(option.value)}
                  aria-pressed={selected}
                  sx={{
                    width: "100%",
                    minHeight: 130,
                    p: 2,
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: selected ? "secondary.main" : "divider",
                    backgroundColor: selected ? "rgba(214, 122, 58, 0.10)" : "background.default",
                    textAlign: "left",
                    alignItems: "stretch",
                    transition: "border-color 0.18s ease, background-color 0.18s ease",
                    "&:hover": {
                      borderColor: "secondary.main",
                      backgroundColor: "rgba(214, 122, 58, 0.07)",
                    },
                  }}
                >
                  <Stack spacing={1} sx={{ width: "100%" }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                      <Typography sx={{
                        fontSize: 16,
                        fontWeight: 800,
                        color: selected ? "secondary.main" : "text.primary",
                      }}>
                        {option.label}
                      </Typography>

                      {selected ? <Chip size="small" label="Seleccionada" color="secondary" /> : null}
                    </Stack>

                    <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.5 }}>
                      {option.description}
                    </Typography>
                  </Stack>
                </ButtonBase>
              );
            })}
          </Box>

          {!canChangeCapacity && menuSet?.capacity_mode_block_reason ? (
            <Typography sx={{ fontSize: 12, color: "text.secondary", lineHeight: 1.5 }}>
              {menuSet.capacity_mode_block_reason}
            </Typography>
          ) : null}

          {errors.capacity_mode ? (
            <Typography sx={{ fontSize: 12, color: "error.main" }}>
              {errors.capacity_mode}
            </Typography>
          ) : null}

          {capacityChanged && options.length > 0 && form.capacity_mode !== "none" ? (
            <CapacityLimitsEditor
              mode={form.capacity_mode}
              options={options}
              limits={limits}
              saving={saving}
              onChange={handleLimitChange}
              error={errors.capacity_limits}
            />
          ) : null}

          {capacityChanged && form.capacity_mode === "none" && options.length > 0 ? (
            <Box sx={{
              p: 1.75, border: "1px solid", borderColor: "divider",
              borderRadius: 1, backgroundColor: "background.default",
            }}>
              <Stack direction="row" spacing={1.25} alignItems="flex-start">
                <InfoOutlinedIcon sx={{ color: "primary.main", fontSize: 20, flexShrink: 0 }} />

                <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.55 }}>
                  Al guardar esta modalidad, se retirarán los límites de capacidad configurados para los productos.
                </Typography>
              </Stack>
            </Box>
          ) : null}

          {/* Datos de facturación */}
          <SectionTitle
            title="Datos de facturación"
            description="Las claves SAT son opcionales, pero deben registrarse juntas."
          />

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FieldBlock label="Clave SAT de producto o servicio">
              <TextField
                fullWidth
                value={form.sat_product_service}
                onChange={(event) => handleFieldChange("sat_product_service", event.target.value)}
                inputProps={{ maxLength: 20 }}
                error={Boolean(errors.sat_product_service || errors.sat)}
                helperText={errors.sat_product_service || ""}
                disabled={saving || !canEditSat}
              />
            </FieldBlock>

            <FieldBlock label="Clave SAT de unidad">
              <TextField
                fullWidth
                value={form.sat_unit}
                onChange={(event) => handleFieldChange("sat_unit", event.target.value)}
                inputProps={{ maxLength: 20 }}
                error={Boolean(errors.sat_unit || errors.sat)}
                helperText={errors.sat_unit || ""}
                disabled={saving || !canEditSat}
              />
            </FieldBlock>
          </Stack>

          {!canEditSat && menuSet?.sat_block_reason ? (
            <Typography sx={{ fontSize: 12, color: "text.secondary", lineHeight: 1.5 }}>
              {menuSet.sat_block_reason}
            </Typography>
          ) : null}

          {errors.sat ? (
            <Typography sx={{ fontSize: 12, color: "error.main" }}>
              {errors.sat}
            </Typography>
          ) : null}

          {/* Estado */}
          <SectionTitle
            title="Estado del conjunto"
            description="Un conjunto activo puede utilizarse cuando su configuración cumple los requisitos necesarios."
          />

          <Box sx={{
            p: 1.75,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            backgroundColor: "background.default",
          }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={1.5}
            >
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
                  {form.is_active ? "Conjunto activo" : "Conjunto inactivo"}
                </Typography>

                {!canChangeStatus && statusReason ? (
                  <Typography sx={{
                    mt: 0.5, fontSize: 12,
                    color: "text.secondary", lineHeight: 1.5,
                  }}>
                    {statusReason}
                  </Typography>
                ) : null}

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
                  />
                }
                label={
                  <Typography sx={{
                    fontSize: 14,
                    fontWeight: 800,
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
          >
            <Button
              type="button"
              variant="outlined"
              startIcon={<RestartAltRoundedIcon />}
              onClick={handleDiscard}
              disabled={!hasChanges || saving}
              sx={{ minWidth: { xs: "100%", sm: 190 }, height: 44, fontWeight: 800 }}
            >
              Descartar cambios
            </Button>

            <Button
              type="submit"
              variant="contained"
              startIcon={saving
                ? <CircularProgress size={18} color="inherit" />
                : <SaveOutlinedIcon />}
              disabled={!hasChanges || saving}
              sx={{ minWidth: { xs: "100%", sm: 190 }, height: 44, fontWeight: 800 }}
            >
              {saving ? "Guardando…" : "Guardar cambios"}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}