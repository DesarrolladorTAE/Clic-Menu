import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { handleFormApiError } from "../../utils/useFormApiHandler";
import {
  createTable,
  updateTable,
  getAvailableWaiters,
} from "../../services/floor/tables.service";

import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

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

const STATUS_OPTIONS = [
  { value: "available", label: "Disponible" },
  { value: "occupied", label: "Ocupado" },
  { value: "reserved", label: "Reservado" },
];

function makeRange(min, max) {
  const out = [];
  for (let i = min; i <= max; i++) out.push(i);
  return out;
}

function waiterLabel(w) {
  if (!w) return "";
  const parts = [w.name, w.last_name_paternal, w.last_name_maternal].filter(
    Boolean
  );
  const full = parts.join(" ").trim();
  const phone = w.phone ? ` · ${w.phone}` : "";
  return `${full}${phone}`.trim();
}

export default function TableModal({
  open,
  mode = "create",
  restaurantId,
  branchId,
  zones = [],
  settings = null,
  initialData = null,
  onClose,
  onSaved,
  showToast,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [saving, setSaving] = useState(false);
  const [waitersLoading, setWaitersLoading] = useState(false);
  const [waiters, setWaiters] = useState([]);

  const isAssignedWaiterMode =
    String(settings?.table_service_mode || "") === "assigned_waiter";
  const assignmentStrategy = String(
    settings?.assignment_strategy || "table_only"
  );
  const isZoneStrategy =
    isAssignedWaiterMode && assignmentStrategy === "zone";
  const isTableOnlyStrategy =
    isAssignedWaiterMode && assignmentStrategy === "table_only";

  const minSeats = Number(settings?.min_seats ?? 1);
  const maxSeats = Number(settings?.max_seats ?? 6);

  const seatOptions = useMemo(() => {
    const min = Number.isFinite(minSeats) ? minSeats : 1;
    const max = Number.isFinite(maxSeats) ? maxSeats : 6;
    return makeRange(min, max);
  }, [minSeats, maxSeats]);

  const defaultValues = useMemo(() => {
    const firstZoneId = zones?.[0]?.id ? String(zones[0].id) : "";
    const initialZoneId =
      initialData?.zone_id != null
        ? String(initialData.zone_id)
        : initialData?.zone?.id != null
        ? String(initialData.zone.id)
        : firstZoneId;

    const safeMin = seatOptions[0] ?? 1;
    const safeMax = seatOptions[seatOptions.length - 1] ?? 6;

    const initialSeats = Number(initialData?.seats);
    const seatsInRange =
      Number.isFinite(initialSeats) &&
      initialSeats >= safeMin &&
      initialSeats <= safeMax
        ? String(initialSeats)
        : String(safeMin);

    const initialAssignedWaiterId =
      initialData?.assigned_waiter_id != null &&
      initialData?.assigned_waiter_id !== ""
        ? String(initialData.assigned_waiter_id)
        : "";

    return {
      zone_id: initialZoneId,
      name: initialData?.name ?? "",
      seats: seatsInRange,
      status: initialData?.status ?? "available",
      assigned_waiter_id: initialAssignedWaiterId,
    };
  }, [initialData, zones, seatOptions]);

  const {
    control,
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues });

  const selectedZoneId = watch("zone_id");
  const currentSeats = watch("seats");

  const selectedZone = useMemo(() => {
    const zid = String(selectedZoneId ?? "");
    return (zones || []).find((z) => String(z.id) === zid) || null;
  }, [zones, selectedZoneId]);

  const zoneWaiterId = useMemo(() => {
    const id =
      selectedZone?.assigned_waiter_id ??
      initialData?.zone?.assigned_waiter_id ??
      null;
    return id ? Number(id) : null;
  }, [selectedZone, initialData]);

  const zoneWaiterLabel = useMemo(() => {
    if (!zoneWaiterId) return "Sin mesero asignado en esta zona";
    const found = (waiters || []).find(
      (w) => Number(w.id) === Number(zoneWaiterId)
    );
    return found ? waiterLabel(found) : `Mesero #${zoneWaiterId}`;
  }, [zoneWaiterId, waiters]);

  useEffect(() => {
    if (!open) return;

    reset(defaultValues);

    if (!isAssignedWaiterMode) {
      setValue("assigned_waiter_id", "");
      setWaiters([]);
    }

    if (isZoneStrategy) {
      setValue("assigned_waiter_id", "");
    }
  }, [
    open,
    reset,
    defaultValues,
    isAssignedWaiterMode,
    isZoneStrategy,
    setValue,
  ]);

  useEffect(() => {
    if (!open) return;
    if (!isAssignedWaiterMode) return;

    let alive = true;

    (async () => {
      setWaitersLoading(true);
      try {
        const list = await getAvailableWaiters(restaurantId, branchId, "");
        if (!alive) return;
        setWaiters(Array.isArray(list) ? list : []);
      } catch (e) {
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "No se pudieron cargar los meseros";
        if (showToast) showToast(msg, "error");
      } finally {
        if (alive) setWaitersLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [open, isAssignedWaiterMode, restaurantId, branchId, showToast]);

  if (!open) return null;

  const title = mode === "create" ? "Nueva mesa" : "Editar mesa";

  const onSubmit = async (form) => {
    setSaving(true);
    try {
      const payload = {
        zone_id: Number(form.zone_id),
        name: (form.name || "").trim(),
        seats: Number(form.seats),
        status: form.status || "available",
      };

      if (!isAssignedWaiterMode) {
        payload.assigned_waiter_id = null;
      } else if (isTableOnlyStrategy) {
        const raw = form.assigned_waiter_id;
        payload.assigned_waiter_id =
          raw === "" || raw === null || typeof raw === "undefined"
            ? null
            : Number(raw);
      } else if (isZoneStrategy) {
        // no enviar assigned_waiter_id
      }

      const saved =
        mode === "create"
          ? await createTable(restaurantId, branchId, payload)
          : await updateTable(restaurantId, branchId, initialData.id, payload);

      if (showToast) {
        showToast(
          mode === "create" ? "Mesa creada." : "Mesa actualizada.",
          "success"
        );
      }

      if (onSaved) onSaved(saved);
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
              Define zona, nombre, asientos, estado y, si aplica, el mesero asignado.
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
                  Datos de la mesa
                </Typography>

                <SectionTitle title="Información principal" />

                <FieldBlock
                  label="Zona"
                  input={
                    <Controller
                      name="zone_id"
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
                          {zones.map((z) => (
                            <MenuItem key={z.id} value={String(z.id)}>
                              {z.name}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  }
                  error={errors?.zone_id?.message}
                />

                <FieldBlock
                  label="Nombre"
                  input={
                    <TextField
                      fullWidth
                      {...register("name")}
                      placeholder='Ej. "M01"'
                    />
                  }
                  error={errors?.name?.message}
                />

                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  <FieldBlock
                    label="Asientos"
                    input={
                      <Controller
                        name="seats"
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
                            {seatOptions.map((n) => (
                              <MenuItem key={n} value={String(n)}>
                                {n}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    }
                    help={
                      <>
                        Rango permitido por sucursal:{" "}
                        <strong>{minSeats}</strong> a <strong>{maxSeats}</strong>.
                        Seleccionado: <strong>{Number(currentSeats)}</strong>.
                      </>
                    }
                    error={errors?.seats?.message}
                  />

                  <FieldBlock
                    label="Estatus"
                    input={
                      <Controller
                        name="status"
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
                            {STATUS_OPTIONS.map((o) => (
                              <MenuItem key={o.value} value={o.value}>
                                {o.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    }
                    error={errors?.status?.message}
                  />
                </Stack>

                {isAssignedWaiterMode ? (
                  <>
                    <SectionTitle title="Mesero asignado" />

                    <Box
                      sx={{
                        p: 1.75,
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: "divider",
                        backgroundColor: "background.default",
                      }}
                    >
                      <Stack spacing={1.5}>
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          justifyContent="space-between"
                          alignItems={{ xs: "flex-start", sm: "center" }}
                          spacing={1}
                        >
                          <Box>
                            <Typography
                              sx={{
                                fontSize: 14,
                                fontWeight: 800,
                                color: "text.primary",
                              }}
                            >
                              Asignación de personal
                            </Typography>

                            <Typography
                              sx={{
                                mt: 0.5,
                                fontSize: 12,
                                color: "text.secondary",
                                lineHeight: 1.45,
                              }}
                            >
                              {isZoneStrategy ? (
                                <>
                                  Estrategia: <strong>Zona</strong> (solo lectura).
                                </>
                              ) : (
                                <>
                                  Estrategia: <strong>Mesa</strong> (editable).
                                </>
                              )}
                            </Typography>
                          </Box>

                          <Typography
                            sx={{
                              fontSize: 12,
                              color: "text.secondary",
                              fontWeight: 700,
                            }}
                          >
                            {waitersLoading
                              ? "Cargando..."
                              : `${waiters.length} disponibles`}
                          </Typography>
                        </Stack>

                        {isZoneStrategy ? (
                          <Box>
                            <TextField
                              fullWidth
                              value={zoneWaiterLabel}
                              disabled
                            />

                            <HelperNote>
                              En modo <strong>Mesero por zona</strong> no puedes
                              asignar mesero desde la mesa. Debes hacerlo en la zona
                              con <strong> Asignar mesero</strong>.
                            </HelperNote>
                          </Box>
                        ) : (
                          <FieldBlock
                            label="Mesero"
                            input={
                              <Controller
                                name="assigned_waiter_id"
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    select
                                    fullWidth
                                    value={field.value ?? ""}
                                    onChange={field.onChange}
                                    disabled={waitersLoading || !isTableOnlyStrategy}
                                    SelectProps={{
                                      IconComponent: KeyboardArrowDownIcon,
                                    }}
                                  >
                                    <MenuItem value="">Sin mesero asignado</MenuItem>
                                    {waiters.map((w) => (
                                      <MenuItem key={w.id} value={String(w.id)}>
                                        {waiterLabel(w)}
                                      </MenuItem>
                                    ))}
                                  </TextField>
                                )}
                              />
                            }
                            help={
                              <>
                                Si el modo es <strong>Mesero asignado</strong>,
                                puedes asignarlo aquí. Si el modo cambia a{" "}
                                <strong>Libre</strong>, el sistema lo ignorará.
                              </>
                            }
                            error={errors?.assigned_waiter_id?.message}
                          />
                        )}
                      </Stack>
                    </Box>
                  </>
                ) : null}

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