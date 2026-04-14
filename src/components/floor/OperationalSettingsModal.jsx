import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { handleFormApiError } from "../../utils/useFormApiHandler";
import {
  createOperationalSettings,
  updateOperationalSettings,
} from "../../services/floor/operationalSettings.service";

import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const SEAT_OPTIONS = Array.from({ length: 20 }, (_, i) => i + 1);

function FieldError({ message }) {
  if (!message) return null;

  return (
    <Typography
      sx={{
        mt: 0.75,
        fontSize: 12,
        color: "error.main",
        fontWeight: 700,
        lineHeight: 1.4,
      }}
    >
      {message}
    </Typography>
  );
}

function HelperNote({ children }) {
  if (!children) return null;

  return (
    <Typography
      sx={{
        mt: 0.75,
        fontSize: 12,
        color: "text.secondary",
        lineHeight: 1.45,
      }}
    >
      {children}
    </Typography>
  );
}

function FieldBlock({ label, input, help, error }) {
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

      {help ? <HelperNote>{help}</HelperNote> : null}
      <FieldError message={error} />
    </Box>
  );
}

function SectionTitle({ title }) {
  return (
    <Typography
      sx={{
        fontSize: 15,
        fontWeight: 800,
        color: "primary.main",
        pt: 0.5,
      }}
    >
      {title}
    </Typography>
  );
}

function SwitchInfoCard({ title, description, checked, children }) {
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        p: 1.75,
        backgroundColor: "background.default",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1.5}
      >
        <Box sx={{ minWidth: 0 }}>
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
              mt: 0.5,
              fontSize: 12,
              color: "text.secondary",
              lineHeight: 1.45,
            }}
          >
            {description}
          </Typography>
        </Box>

        {children || (
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 700,
              color: "text.primary",
              whiteSpace: "nowrap",
            }}
          >
            {checked ? "Sí" : "No"}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

export default function OperationalSettingsModal({
  open,
  mode = "create",
  restaurantId,
  branchId,
  initialData = null,
  onClose,
  onSaved,
  showToast,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [saving, setSaving] = useState(false);
  const [serverNotices, setServerNotices] = useState([]);

  const initial = useMemo(() => {
    if (!initialData) return null;
    if (initialData?.data && typeof initialData.data === "object") {
      return initialData.data;
    }
    return initialData;
  }, [initialData]);

  const initialNotices = useMemo(() => {
    if (!initialData) return [];
    if (Array.isArray(initialData?.notices)) return initialData.notices;
    return [];
  }, [initialData]);

  const showMissingConfigNotice = mode === "create" && !initial;

  const defaultValues = useMemo(
    () => ({
      ordering_mode: initial?.ordering_mode ?? "waiter_only",
      table_service_mode: initial?.table_service_mode ?? "free_for_all",
      is_qr_enabled: !!initial?.is_qr_enabled,
      assignment_strategy: initial?.assignment_strategy ?? "table_only",
      min_seats:
        initial?.min_seats != null ? String(initial.min_seats) : "1",
      max_seats:
        initial?.max_seats != null ? String(initial.max_seats) : "6",
    }),
    [initial]
  );

  const {
    control,
    handleSubmit,
    setError,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues });

  const orderingMode = watch("ordering_mode");
  const tableServiceMode = watch("table_service_mode");
  const assignmentStrategy = watch("assignment_strategy");
  const isQrEnabled = watch("is_qr_enabled");
  const minSeats = watch("min_seats");
  const maxSeats = watch("max_seats");

  useEffect(() => {
    if (!open) return;
    if (String(tableServiceMode) !== "assigned_waiter") {
      setValue("assignment_strategy", "table_only");
    }
  }, [open, tableServiceMode, setValue]);

  useEffect(() => {
    if (!open) return;
    reset(defaultValues);
    setServerNotices(initialNotices);
  }, [open, reset, defaultValues, initialNotices]);

  if (!open) return null;

  const title =
    mode === "create"
      ? "Configuración Operativa Inicial"
      : "Configuración Operativa";

  const orderingHelper =
    orderingMode === "waiter_only"
      ? "El cliente solo visualiza el menú. El mesero captura el pedido."
      : orderingMode === "customer_assisted"
      ? "El cliente puede seleccionar productos desde el QR y apoyar el flujo de pedido."
      : "";

  const tableServiceHelper =
    tableServiceMode === "assigned_waiter"
      ? "Las mesas se asignan a meseros específicos."
      : tableServiceMode === "free_for_all"
      ? "Cualquier mesero puede atender una mesa disponible."
      : "";

  const strategyHelper =
    assignmentStrategy === "zone"
      ? "Se asigna un mesero por zona y las mesas heredan esa asignación."
      : assignmentStrategy === "table_only"
      ? "Cada mesa puede tener un mesero distinto."
      : "";

  const onSubmit = async (form) => {
    setSaving(true);

    try {
      const effectiveTableServiceMode = form.table_service_mode || null;

      const payload = {
        ordering_mode: form.ordering_mode || null,
        table_service_mode: effectiveTableServiceMode,
        is_qr_enabled: !!form.is_qr_enabled,
        assignment_strategy:
          String(effectiveTableServiceMode) === "assigned_waiter"
            ? form.assignment_strategy || "table_only"
            : null,
        min_seats: Number(form.min_seats),
        max_seats: Number(form.max_seats),
      };

      const saved =
        mode === "create"
          ? await createOperationalSettings(restaurantId, branchId, payload)
          : await updateOperationalSettings(restaurantId, branchId, payload);

      setServerNotices(Array.isArray(saved?.notices) ? saved.notices : []);

      if (showToast) {
        showToast(saved?.message || "Guardado correctamente.", "success");
      }

      if (onSaved) await onSaved(saved);

      onClose();
    } catch (e) {
      const handled = handleFormApiError(e, setError, {
        onMessage: (msg) => (showToast ? showToast(msg, "error") : alert(msg)),
      });

      if (!handled) {
        const msg =
          e?.response?.data?.message || e?.message || "No se pudo guardar";
        if (showToast) showToast(msg, "error");
        else alert(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const showStrategy = String(tableServiceMode) === "assigned_waiter";

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
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
              Define cómo se operará la sucursal antes de usar zonas, mesas y QR.
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
        <form onSubmit={handleSubmit(onSubmit)}>
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
                  Datos operativos
                </Typography>

                {showMissingConfigNotice ? (
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "#F3D48B",
                      backgroundColor: "#FFF7E8",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: "#8A5A00",
                        mb: 0.5,
                      }}
                    >
                      Importante
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 13,
                        color: "#8A5A00",
                        lineHeight: 1.45,
                      }}
                    >
                      Primero configura la parte operativa para poder continuar.
                    </Typography>
                  </Box>
                ) : null}

                {serverNotices.length > 0 ? (
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                      backgroundColor: "#fff",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: "text.primary",
                        mb: 1,
                      }}
                    >
                      Avisos del sistema
                    </Typography>

                    <Stack spacing={0.75}>
                      {serverNotices.map((notice, index) => (
                        <Typography
                          key={`${notice}-${index}`}
                          sx={{
                            fontSize: 13,
                            color: "text.secondary",
                            lineHeight: 1.45,
                          }}
                        >
                          • {notice}
                        </Typography>
                      ))}
                    </Stack>
                  </Box>
                ) : null}

                <SectionTitle title="Operación de pedidos" />

                <FieldBlock
                  label="Modo de toma de pedidos"
                  input={
                    <Controller
                      name="ordering_mode"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          select
                          fullWidth
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          SelectProps={{
                            IconComponent: KeyboardArrowDownIcon,
                          }}
                        >
                          <MenuItem value="waiter_only">Solo mesero</MenuItem>
                          <MenuItem value="customer_assisted">
                            Cliente asistido
                          </MenuItem>
                        </TextField>
                      )}
                    />
                  }
                  help={orderingHelper}
                  error={errors?.ordering_mode?.message}
                />

                <FieldBlock
                  label="Modo de asignación de personal"
                  input={
                    <Controller
                      name="table_service_mode"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          select
                          fullWidth
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          SelectProps={{
                            IconComponent: KeyboardArrowDownIcon,
                          }}
                        >
                          <MenuItem value="free_for_all">Libre</MenuItem>
                          <MenuItem value="assigned_waiter">
                            Mesero asignado
                          </MenuItem>
                        </TextField>
                      )}
                    />
                  }
                  help={tableServiceHelper}
                  error={errors?.table_service_mode?.message}
                />

                {showStrategy ? (
                  <FieldBlock
                    label="Estrategia de asignación"
                    input={
                      <Controller
                        name="assignment_strategy"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            select
                            fullWidth
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            SelectProps={{
                              IconComponent: KeyboardArrowDownIcon,
                            }}
                          >
                            <MenuItem value="table_only">Mesa</MenuItem>
                            <MenuItem value="zone">Zona</MenuItem>
                          </TextField>
                        )}
                      />
                    }
                    help={strategyHelper}
                    error={errors?.assignment_strategy?.message}
                  />
                ) : null}

                <SectionTitle title="Acceso por QR" />

                <SwitchInfoCard
                  title="Habilitar QR"
                  description="Si está desactivado, no se debe permitir crear, administrar ni resolver códigos QR."
                  checked={isQrEnabled}
                >
                  <FormControlLabel
                    sx={{ m: 0 }}
                    control={
                      <Switch
                        checked={!!isQrEnabled}
                        onChange={(e) =>
                          setValue("is_qr_enabled", e.target.checked)
                        }
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
                        {isQrEnabled ? "Sí" : "No"}
                      </Typography>
                    }
                  />
                </SwitchInfoCard>

                <SectionTitle title="Capacidad de mesas" />

                <Box
                  sx={{
                    p: 1.75,
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "#fff",
                  }}
                >
                  <Stack spacing={2}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                      <FieldBlock
                        label="Mínimo"
                        input={
                          <Controller
                            name="min_seats"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                select
                                fullWidth
                                value={field.value ?? ""}
                                onChange={field.onChange}
                                SelectProps={{
                                  IconComponent: KeyboardArrowDownIcon,
                                }}
                              >
                                {SEAT_OPTIONS.map((n) => (
                                  <MenuItem key={n} value={String(n)}>
                                    {n}
                                  </MenuItem>
                                ))}
                              </TextField>
                            )}
                          />
                        }
                        error={errors?.min_seats?.message}
                      />

                      <FieldBlock
                        label="Máximo"
                        input={
                          <Controller
                            name="max_seats"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                select
                                fullWidth
                                value={field.value ?? ""}
                                onChange={field.onChange}
                                SelectProps={{
                                  IconComponent: KeyboardArrowDownIcon,
                                }}
                              >
                                {SEAT_OPTIONS.map((n) => (
                                  <MenuItem key={n} value={String(n)}>
                                    {n}
                                  </MenuItem>
                                ))}
                              </TextField>
                            )}
                          />
                        }
                        error={errors?.max_seats?.message}
                      />
                    </Stack>

                    <Typography
                      sx={{
                        fontSize: 12,
                        color: "text.secondary",
                        lineHeight: 1.45,
                      }}
                    >
                      No podrás crear mesas con menos de{" "}
                      <Typography
                        component="span"
                        sx={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: "text.primary",
                        }}
                      >
                        {Number(minSeats) || 1}
                      </Typography>{" "}
                      ni más de{" "}
                      <Typography
                        component="span"
                        sx={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: "text.primary",
                        }}
                      >
                        {Number(maxSeats) || 6}
                      </Typography>{" "}
                      asientos.
                    </Typography>
                  </Stack>
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
                      minWidth: { xs: "100%", sm: 150 },
                      height: 44,
                      borderRadius: 2,
                    }}
                  >
                    Cerrar
                  </Button>

                  <Button
                    type="submit"
                    disabled={saving}
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
        </form>
      </DialogContent>
    </Dialog>
  );
}