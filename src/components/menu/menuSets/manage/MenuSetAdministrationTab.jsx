//src/components/menu/menuSets/manage/MenuSetAdministrationTab.jsx
import { useEffect, useMemo, useRef, useState } from "react";

import {
  Box, Button, ButtonBase, Chip, CircularProgress, MenuItem,
  Paper, Stack, TextField, Typography,
} from "@mui/material";

import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";

import { updateMenuSetManagement } from "../../../../services/menu/menuSets/menuSetManagement.service";
import MenuSetManagementConfirmModal from "./MenuSetManagementConfirmModal";

const DAYS = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 7, label: "Domingo" },
];

const MODES = [
  {
    value: "manual",
    title: "Administración manual",
    description: "Configura los días, productos y capacidades desde sus respectivas pestañas. No requiere programar actualizaciones semanales.",
    icon: TuneOutlinedIcon,
  },
  {
    value: "mass_import",
    title: "Importación masiva",
    description: "Programa los productos por periodos comerciales mediante archivos y publicaciones.",
    icon: UploadFileOutlinedIcon,
  },
];

const CAPACITIES = [
  { value: "none", label: "Sin límite", description: "Sin límite de capacidad comercial." },
  { value: "daily", label: "Diaria", description: "Cantidades por producto y día." },
  { value: "weekly", label: "Semanal", description: "Cantidad semanal por producto." },
];

const panelSx = {
  p: { xs: 2, sm: 2.5 },
  borderRadius: 1,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  boxShadow: "none",
};

function normalizeTime(value) {
  const text = String(value ?? "");
  return /^\d{2}:\d{2}/.test(text) ? text.slice(0, 5) : "";
}

function toForm(management) {
  return {
    management_mode: management?.management_mode === "mass_import" ? "mass_import" : "manual",
    capacity_mode: management?.next_import_capacity_mode || management?.manual_capacity_mode || "none",
    import_update_day: management?.import_update_day == null ? "" : String(management.import_update_day),
    import_deadline_time: normalizeTime(management?.import_deadline_time),
  };
}

function validateForm(form) {
  const errors = {};

  if (!["manual", "mass_import"].includes(form.management_mode)) {
    errors.management_mode = "Selecciona una modalidad de administración válida.";
  }

  if (form.management_mode === "mass_import") {
    if (!["none", "daily", "weekly"].includes(form.capacity_mode)) {
      errors.capacity_mode = "Selecciona una modalidad de capacidad válida.";
    }

    if (!DAYS.some((day) => String(day.value) === form.import_update_day)) {
      errors.import_update_day = "Selecciona un día de actualización.";
    }

    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(form.import_deadline_time)) {
      errors.import_deadline_time = "Selecciona una hora límite válida.";
    }
  }

  return errors;
}

function getErrorMessage(error, fallback) {
  const data = error?.response?.data;
  const errors = data?.errors && typeof data.errors === "object"
    ? Object.values(data.errors).flat() : [];

  return errors.find((message) => typeof message === "string")
    || data?.message || error?.message || fallback;
}

function capacityLabel(value) {
  return CAPACITIES.find((item) => item.value === value)?.label || "No informada";
}

function sourceLabel(management) {
  if (management?.effective_source === "manual") {
    return "Configuración manual";
  }

  if (management?.effective_source === "manual_fallback") {
    return "Configuración manual de respaldo";
  }

  if (management?.effective_source === "publication") {
    return management?.has_exact_publication
      ? "Publicación del periodo" : "Publicación anterior aplicada";
  }

  return "No informada";
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(`${value}T12:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  }).format(date);
}

function SectionTitle({ title, description }) {
  return (
    <Box>
      <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
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

function FieldBlock({ label, children, help }) {
  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
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

export default function MenuSetAdministrationTab({
  restaurantId,
  branchId,
  menuSet,
  management,
  loading = false,
  onUpdated,
  onAlert,
}) {
  const [form, setForm] = useState(() => toForm(management));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const savingRef = useRef(false);

  useEffect(() => {
    setForm(toForm(management));
    setErrors({});
  }, [management]);

  const modeChanged = Boolean(management)
    && form.management_mode !== management.management_mode;

  const enteringMassImport = management?.management_mode !== "mass_import"
    && form.management_mode === "mass_import";

  const hasChanges = useMemo(() => {
    if (!management) {
      return false;
    }

    const original = toForm(management);

    if (form.management_mode !== original.management_mode) {
      return true;
    }

    if (form.management_mode !== "mass_import") {
      return false;
    }

    return form.capacity_mode !== original.capacity_mode
      || form.import_update_day !== original.import_update_day
      || form.import_deadline_time !== original.import_deadline_time;
  }, [form, management]);

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));

    setErrors((current) => {
      if (field === "management_mode") {
        return {};
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleDiscard = () => {
    setForm(toForm(management));
    setErrors({});
    setConfirmOpen(false);
  };

  const saveManagement = async () => {
    if (!management || !menuSet?.id || savingRef.current || !hasChanges) {
      return;
    }

    const validationErrors = validateForm(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setConfirmOpen(false);

      onAlert?.({
        severity: "error",
        title: "Revisa la configuración",
        message: Object.values(validationErrors)[0],
      });
      return;
    }

    const payload = { management_mode: form.management_mode };

    if (form.management_mode === "mass_import") {
      payload.capacity_mode = form.capacity_mode;
      payload.import_update_day = Number(form.import_update_day);
      payload.import_deadline_time = form.import_deadline_time;
    }

    savingRef.current = true;
    setSaving(true);

    try {
      const response = await updateMenuSetManagement(
        restaurantId, branchId, menuSet.id, payload
      );

      if (!response?.management) {
        throw new Error("No se recibió la administración actualizada del conjunto.");
      }

      setConfirmOpen(false);
      setErrors({});
      onUpdated?.(response.management);

      onAlert?.({
        severity: "success",
        title: "Hecho",
        message: response.message || "Administración del conjunto actualizada correctamente.",
      });
    } catch (error) {
      const serverErrors = error?.response?.data?.errors;

      if (serverErrors && typeof serverErrors === "object") {
        const mappedErrors = {};

        Object.entries(serverErrors).forEach(([field, messages]) => {
          mappedErrors[field] = Array.isArray(messages) ? messages[0] : String(messages);
        });

        setErrors(mappedErrors);
      }

      setConfirmOpen(false);

      onAlert?.({
        severity: "error",
        title: "No se pudieron guardar los cambios",
        message: getErrorMessage(error, "No se pudo actualizar la administración del conjunto."),
      });
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!management || !hasChanges || savingRef.current || saving) {
      return;
    }

    const validationErrors = validateForm(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      onAlert?.({
        severity: "error",
        title: "Revisa la configuración",
        message: "Completa los campos señalados antes de guardar los cambios.",
      });
      return;
    }

    if (modeChanged) {
      setConfirmOpen(true);
      return;
    }

    saveManagement();
  };

  if (loading) {
    return (
      <Paper sx={panelSx}>
        <Stack spacing={2} alignItems="center" sx={{ py: 5 }}>
          <CircularProgress />
          <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
            Consultando la administración del conjunto…
          </Typography>
        </Stack>
      </Paper>
    );
  }

  if (!management) {
    return (
      <Paper sx={panelSx}>
        <Typography sx={{ fontSize: 18, fontWeight: 800 }}>
          Administración no disponible
        </Typography>

        <Typography sx={{ mt: 1, fontSize: 14, color: "text.secondary" }}>
          No fue posible consultar la modalidad de administración de este conjunto.
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={3}>
          {/* Selección de modalidad */}
          <Paper sx={panelSx}>
            <Stack spacing={2.5}>
              <SectionTitle
                title="Modo de administración"
                description="Selecciona cómo se configurarán los días y las capacidades de los productos del conjunto."
              />

              <Box sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                gridAutoRows: "1fr",
                gap: 1.5,
              }}>
                {MODES.map((option) => {
                  const selected = form.management_mode === option.value;
                  const ModeIcon = option.icon;

                  return (
                    <ButtonBase
                      key={option.value}
                      type="button"
                      disabled={saving}
                      onClick={() => handleChange("management_mode", option.value)}
                      aria-pressed={selected}
                      sx={{
                        width: "100%", height: "100%", minHeight: 150,
                        p: 2, borderRadius: 1, border: "1px solid",
                        borderColor: selected ? "secondary.main" : "divider",
                        bgcolor: selected ? "rgba(214, 122, 58, 0.10)" : "background.default",
                        textAlign: "left", alignItems: "stretch",
                        "&:hover": {
                          borderColor: "secondary.main",
                          bgcolor: "rgba(214, 122, 58, 0.07)",
                        },
                      }}
                    >
                      <Stack spacing={1.5} sx={{ width: "100%" }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                          <Box sx={{
                            width: 38, height: 38, borderRadius: 1,
                            bgcolor: "rgba(214, 122, 58, 0.12)",
                            color: "secondary.main",
                            display: "grid", placeItems: "center",
                          }}>
                            <ModeIcon fontSize="small" />
                          </Box>

                          {selected ? (
                            <Chip label="Seleccionada" color="secondary" size="small" />
                          ) : null}
                        </Stack>

                        <Typography sx={{
                          fontSize: 16, fontWeight: 800,
                          color: selected ? "secondary.main" : "text.primary",
                        }}>
                          {option.title}
                        </Typography>

                        <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.55 }}>
                          {option.description}
                        </Typography>
                      </Stack>
                    </ButtonBase>
                  );
                })}
              </Box>

              {errors.management_mode ? (
                <Typography sx={{ fontSize: 12, color: "error.main" }}>
                  {errors.management_mode}
                </Typography>
              ) : null}
            </Stack>
          </Paper>

          {/* Configuración masiva */}
          {form.management_mode === "mass_import" ? (
            <Paper sx={panelSx}>
              <Stack spacing={3}>
                <SectionTitle
                  title="Actualización del menú por archivos"
                  description={
                    enteringMassImport
                      ? "Puedes activar la administración masiva cualquier día. Configura cuándo realizarás los cambios estructurales de las siguientes semanas comerciales. La hora límite se utiliza para recordatorios y no impide publicar archivos posteriormente."
                      : "Define el día autorizado para modificar la estructura de las siguientes semanas comerciales. La hora límite se utiliza para recordatorios y no impide publicar archivos posteriormente."
                  }
                />

                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  <FieldBlock
                    label="Día de actualización *"
                    help={
                      enteringMassImport
                        ? "Selecciona el día en que administrarás los cambios estructurales. Puedes cambiar a masivo hoy, aunque elijas otro día de la semana."
                        : "Para modificar esta configuración masiva, el Backend exige que sea el día de actualización previamente guardado. Esto no limita la publicación de archivos."
                    }
                  >
                    <TextField
                      select
                      fullWidth
                      value={form.import_update_day}
                      onChange={(event) => handleChange("import_update_day", event.target.value)}
                      disabled={saving}
                      error={Boolean(errors.import_update_day)}
                      helperText={errors.import_update_day || ""}
                    >
                      <MenuItem value="" disabled>Selecciona un día</MenuItem>

                      {DAYS.map((day) => (
                        <MenuItem key={day.value} value={String(day.value)}>
                          {day.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </FieldBlock>

                  <FieldBlock
                    label="Hora límite *"
                    help="Se interpreta con la zona horaria de la sucursal. Es informativa y se utiliza para los recordatorios de actualización."
                  >
                    <TextField
                      fullWidth
                      type="time"
                      value={form.import_deadline_time}
                      onChange={(event) => handleChange("import_deadline_time", event.target.value)}
                      disabled={saving}
                      inputProps={{ step: 60 }}
                      error={Boolean(errors.import_deadline_time)}
                      helperText={errors.import_deadline_time || ""}
                    />
                  </FieldBlock>
                </Stack>

                <SectionTitle
                  title="Capacidad de la próxima importación"
                  description="Selecciona cómo se definirán las cantidades al preparar la siguiente programación."
                />

                <Box sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
                  gridAutoRows: "1fr",
                  gap: 1.5,
                }}>
                  {CAPACITIES.map((option) => {
                    const selected = form.capacity_mode === option.value;

                    return (
                      <ButtonBase
                        key={option.value}
                        type="button"
                        disabled={saving}
                        onClick={() => handleChange("capacity_mode", option.value)}
                        aria-pressed={selected}
                        sx={{
                          p: 2, width: "100%", height: "100%", minHeight: 115,
                          borderRadius: 1, border: "1px solid",
                          borderColor: selected ? "secondary.main" : "divider",
                          bgcolor: selected ? "rgba(214, 122, 58, 0.10)" : "background.default",
                          textAlign: "left", alignItems: "stretch",
                          "&:hover": { borderColor: "secondary.main" },
                        }}
                      >
                        <Stack spacing={1} sx={{ width: "100%" }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography sx={{
                              fontSize: 15, fontWeight: 800,
                              color: selected ? "secondary.main" : "text.primary",
                            }}>
                              {option.label}
                            </Typography>

                            {selected ? <Chip label="Elegida" color="secondary" size="small" /> : null}
                          </Stack>

                          <Typography sx={{ fontSize: 12, color: "text.secondary", lineHeight: 1.5 }}>
                            {option.description}
                          </Typography>
                        </Stack>
                      </ButtonBase>
                    );
                  })}
                </Box>

                {errors.capacity_mode ? (
                  <Typography sx={{ fontSize: 12, color: "error.main" }}>
                    {errors.capacity_mode}
                  </Typography>
                ) : null}

                <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.55 }}>
                  La capacidad seleccionada se utilizará en la próxima programación que publiques.
                  No modifica la capacidad manual actual ni las publicaciones anteriores.
                </Typography>
              </Stack>
            </Paper>
          ) : null}

          {/* Configuración vigente */}
          {form.management_mode === "mass_import" ? (
            <Paper sx={panelSx}>
              <Stack spacing={2}>
                <SectionTitle
                  title="Programación actualmente en uso"
                  description={
                    enteringMassImport
                      ? "Estos datos corresponden a la configuración vigente antes de guardar el cambio. La configuración manual se conservará como respaldo hasta que exista una publicación masiva aplicable."
                      : "Muestra la configuración que se utiliza en este momento. Puede ser diferente de la próxima programación que estás preparando."
                  }
                />

                <Box sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                  gridAutoRows: "1fr",
                  gap: 1.5,
                }}>
                  {[
                    {
                      title: "Origen de la programación actual",
                      value: sourceLabel(management),
                    },
                    {
                      title: "Capacidad aplicada actualmente",
                      value: capacityLabel(management.effective_capacity_mode),
                    },
                    {
                      title: "Próxima semana a programar",
                      value: management.next_week_start && management.next_week_end
                        ? `${formatDate(management.next_week_start)} – ${formatDate(management.next_week_end)}`
                        : "No informado",
                    },
                    {
                      title: "Inicio de la semana comercial",
                      value: DAYS.find((day) =>
                        day.value === Number(management.commercial_week_start_day)
                      )?.label || "No informado",
                    },
                  ].map((item) => (
                    <Box key={item.title} sx={{
                      minWidth: 0, height: "100%", p: 1.75,
                      borderRadius: 1, border: "1px solid",
                      borderColor: "divider", bgcolor: "background.default",
                    }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 800, color: "text.secondary" }}>
                        {item.title}
                      </Typography>

                      <Typography sx={{
                        mt: 0.75, fontSize: 15, fontWeight: 800,
                        color: "text.primary", lineHeight: 1.45, overflowWrap: "anywhere",
                      }}>
                        {item.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Stack>
            </Paper>
          ) : null}

          {/* Acciones */}
          {(form.management_mode === "mass_import" || modeChanged) ? (
            <Paper sx={{ ...panelSx, p: { xs: 1.5, sm: 2 } }}>
              <Stack
                direction={{ xs: "column-reverse", sm: "row" }}
                justifyContent="flex-end"
                spacing={1.5}
              >
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<RestartAltRoundedIcon />}
                  onClick={handleDiscard}
                  disabled={!hasChanges || saving}
                  sx={{ minWidth: { xs: "100%", sm: 190 }, height: 44 }}
                >
                  Descartar cambios
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={!hasChanges || saving}
                  startIcon={saving
                    ? <CircularProgress size={18} color="inherit" />
                    : <SaveOutlinedIcon />}
                  sx={{
                    minWidth: { xs: "100%", sm: 190 },
                    height: 44, fontWeight: 800,
                  }}
                >
                  {saving ? "Guardando…" : "Guardar cambios"}
                </Button>
              </Stack>
            </Paper>
          ) : null}
        </Stack>
      </Box>

      {/* Modal de confirmación independiente */}
      <MenuSetManagementConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={saveManagement}
        managementMode={form.management_mode}
        saving={saving}
      />
    </>
  );
}