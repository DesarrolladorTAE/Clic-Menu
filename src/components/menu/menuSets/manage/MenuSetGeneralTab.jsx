import { useEffect, useMemo, useRef, useState } from "react";

import {
  Box, Button, ButtonBase, CircularProgress, InputAdornment,
  Paper, Stack, TextField, Tooltip, Typography,
} from "@mui/material";

import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import PowerSettingsNewRoundedIcon from "@mui/icons-material/PowerSettingsNewRounded";
import RestaurantMenuRoundedIcon from "@mui/icons-material/RestaurantMenuRounded";

import { updateMenuSet } from "../../../../services/menu/menuSets/menuSet.service";
import ContextOverview from "../../../common/ContextOverview";

const DAYS = [
  { value: 1, label: "Lunes", short: "Lun" },
  { value: 2, label: "Martes", short: "Mar" },
  { value: 3, label: "Miércoles", short: "Mié" },
  { value: 4, label: "Jueves", short: "Jue" },
  { value: 5, label: "Viernes", short: "Vie" },
  { value: 6, label: "Sábado", short: "Sáb" },
  { value: 7, label: "Domingo", short: "Dom" },
];

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
    sat_product_service: menuSet?.sat?.sat_product_service ?? "",
    sat_unit: menuSet?.sat?.sat_unit ?? "",
  };
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

  return changes;
}

function validateForm(form, changes) {
  const errors = {};

  if (Object.prototype.hasOwnProperty.call(changes, "name")) {
    if (!form.name.trim()) {
      errors.name = "Debes escribir el nombre del conjunto.";
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

  return errors;
}

function SectionTitle({ title, description }) {
  return (
    <Box>
      <Typography sx={{ fontSize: 15, fontWeight: 800, color: "primary.main" }}>
        {title}
      </Typography>

      {description ? (
        <Typography sx={{
          mt: 0.5, fontSize: 13,
          color: "text.secondary", lineHeight: 1.55,
        }}>
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
        <Typography sx={{
          mt: 0.75, fontSize: 12,
          color: "text.secondary", lineHeight: 1.5,
        }}>
          {reason}
        </Typography>
      ) : help ? (
        <Typography sx={{
          mt: 0.75, fontSize: 12,
          color: "text.secondary", lineHeight: 1.5,
        }}>
          {help}
        </Typography>
      ) : null}
    </Box>
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
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  useEffect(() => {
    setForm(mapMenuSetToForm(menuSet));
    setErrors({});
  }, [menuSet]);

  const changes = useMemo(() => getChanges(form, menuSet), [form, menuSet]);
  const hasChanges = Object.keys(changes).length > 0;

  const canEditCommercial = menuSet?.can_edit_commercial_data === true;
  const canEditSat = menuSet?.can_edit_sat === true;
  const canEditOrder = menuSet?.can_edit === true;

  const originalDays = normalizeDays(menuSet?.service_days);
  const selectedDays = normalizeDays(form.service_days);

  const removableDays = normalizeDays(menuSet?.removable_service_days);
  const availableDaysToAdd = normalizeDays(menuSet?.available_service_days_to_add);
  const removalReasons = menuSet?.service_day_removal_block_reasons ?? {};

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
    const original = originalDays.includes(day);

    const blockedRemoval = selected && original && !removableDays.includes(day);
    const blockedAddition = !selected && !original && !availableDaysToAdd.includes(day);

    if (blockedRemoval || blockedAddition) {
      return;
    }

    handleFieldChange(
      "service_days",
      selected
        ? selectedDays.filter((value) => value !== day)
        : normalizeDays([...selectedDays, day])
    );
  };

  const handleDiscard = () => {
    setForm(mapMenuSetToForm(menuSet));
    setErrors({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!hasChanges || savingRef.current || saving) return;

    const validationErrors = validateForm(form, changes);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      onAlert?.({
        severity: "error",
        title: "Revisa la información",
        message: Object.values(validationErrors)[0],
      });
      return;
    }

    const payload = { ...changes };

    if (Object.prototype.hasOwnProperty.call(payload, "price")) {
      payload.price = Number(normalizePrice(form.price));
    }

    if (Object.prototype.hasOwnProperty.call(payload, "sort_order")) {
      payload.sort_order = Number(form.sort_order);
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
        throw new Error("No se recibió la información actualizada del conjunto.");
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
          const key = field.startsWith("sat.") ? field.replace("sat.", "") : field;

          mappedErrors[key] = message;
        });

        setErrors(mappedErrors);
      }

      const firstError = serverErrors && typeof serverErrors === "object"
        ? Object.values(serverErrors).flat().find((message) => typeof message === "string")
        : null;

      onAlert?.({
        severity: "error",
        title: "Error",
        message: firstError || error?.response?.data?.message
          || error?.message || "No se pudieron guardar los cambios.",
      });
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <Stack spacing={3}>
      {/* Contexto actual */}
      <ContextOverview items={contextItems} />

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
            description="Selecciona los días generales del conjunto. Después podrás configurar los productos y capacidades correspondientes."
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
              const original = originalDays.includes(day.value);

              const blockedRemoval = selected && original
                && !removableDays.includes(day.value);

              const blockedAddition = !selected && !original
                && !availableDaysToAdd.includes(day.value);

              const blocked = blockedRemoval || blockedAddition;

              const reason = blockedRemoval
                ? removalReasons[day.value] || menuSet?.remove_service_days_block_reason || ""
                : blockedAddition
                  ? menuSet?.add_service_days_block_reason || "No puedes agregar este día."
                  : "";

              return (
                <Tooltip
                  key={day.value}
                  title={blocked ? reason : ""}
                  arrow
                  enterTouchDelay={0}
                >
                  <Box sx={{ minWidth: 0 }}>
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
                        bgcolor: selected ? "rgba(214, 122, 58, 0.10)" : "background.default",
                        transition: "border-color 0.18s ease, background-color 0.18s ease",
                        "&:hover": {
                          borderColor: "secondary.main",
                          bgcolor: "rgba(214, 122, 58, 0.07)",
                        },
                        "&.Mui-disabled": { opacity: 0.65 },
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

          {errors.service_days ? (
            <Typography sx={{ fontSize: 12, color: "error.main" }}>
              {errors.service_days}
            </Typography>
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
            <Typography sx={{
              fontSize: 12,
              color: "text.secondary",
              lineHeight: 1.5,
            }}>
              {menuSet.sat_block_reason}
            </Typography>
          ) : null}

          {errors.sat ? (
            <Typography sx={{ fontSize: 12, color: "error.main" }}>
              {errors.sat}
            </Typography>
          ) : null}

          {errors.sat ? (
            <Typography sx={{ fontSize: 12, color: "error.main" }}>
              {errors.sat}
            </Typography>
          ) : null}

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
              sx={{
                minWidth: { xs: "100%", sm: 190 },
                height: 44,
                fontWeight: 800,
              }}
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
              sx={{
                minWidth: { xs: "100%", sm: 190 },
                height: 44,
                fontWeight: 800,
              }}
            >
              {saving ? "Guardando…" : "Guardar cambios"}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}