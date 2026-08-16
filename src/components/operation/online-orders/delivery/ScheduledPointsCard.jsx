import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Dialog, DialogContent, DialogTitle, FormControlLabel, IconButton,
  Paper, Stack, Switch, TextField, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

import PaginationFooter from "../../../common/PaginationFooter";
import ScheduledPointTimeBlocksDialog from "./ScheduledPointTimeBlocksDialog";

import {
  createOnlineOrderScheduledPoint,
  deleteOnlineOrderScheduledPoint,
  getOnlineOrderScheduledPoints,
  updateOnlineOrderScheduledPoint,
} from "../../../../services/operation/online-orders/onlineOrders.service";

const ITEMS_PER_PAGE = 5;

const EMPTY_FORM = {
  name: "",
  address: "",
  description: "",
  delivery_fee: "",
  default_capacity: "",
  valid_from: "",
  valid_until: "",
  is_active: true,
  sort_order: "",
};

export default function ScheduledPointsCard({
  restaurantId,
  branchId,
  fulfillment,
  onAlert,
}) {
  const [points, setPoints] = useState([]);
  const [page, setPage] = useState(1);

  const [modal, setModal] = useState({
    open: false,
    mode: "create",
    point: null,
  });

  const [timePoint, setTimePoint] = useState(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!fulfillment?.id) {
        setPoints([]);
        return;
      }

      try {
        const rows = await getOnlineOrderScheduledPoints(
          restaurantId,
          branchId,
          fulfillment.id
        );

        if (!active) return;

        setPoints(rows);
        setPage(1);
      } catch (error) {
        if (!active) return;

        onAlert?.({
          severity: "error",
          title: "Error",
          message:
            error?.response?.data?.message ||
            error?.message ||
            "No se pudieron cargar los puntos programados.",
        });
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [restaurantId, branchId, fulfillment?.id, onAlert]);

  const totalPages = Math.max(1, Math.ceil(points.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * ITEMS_PER_PAGE;
  const visible = points.slice(start, start + ITEMS_PER_PAGE);

  const openCreate = () => {
    const nextOrder =
      points.length === 0
        ? 1
        : Math.max(...points.map((item) => Number(item.sort_order) || 0)) + 1;

    setModal({
      open: true,
      mode: "create",
      point: {
        ...EMPTY_FORM,
        sort_order: String(nextOrder),
      },
    });
  };

  const handleSaved = (saved, mode) => {
    setPoints((current) => {
      if (mode === "create") return [...current, saved].sort(sortByOrder);

      return current
        .map((item) => (Number(item.id) === Number(saved.id) ? saved : item))
        .sort(sortByOrder);
    });

    setModal({ open: false, mode: "create", point: null });
  };

  const remove = async (point) => {
    if (!window.confirm(`¿Deseas eliminar el punto "${point.name}"?`)) return;

    try {
      const response = await deleteOnlineOrderScheduledPoint(
        restaurantId,
        branchId,
        fulfillment.id,
        point.id
      );

      setPoints((current) =>
        current.filter((item) => Number(item.id) !== Number(point.id))
      );

      onAlert?.({
        severity: "success",
        title: "Hecho",
        message: response?.message || "El punto se eliminó correctamente.",
      });
    } catch (error) {
      const firstError = Object.values(error?.response?.data?.errors || {}).flat()?.[0];

      onAlert?.({
        severity: "error",
        title: "Error",
        message:
          firstError ||
          error?.response?.data?.message ||
          error?.message ||
          "No se pudo eliminar el punto programado.",
      });
    }
  };

  return (
    <>
      <Paper
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 1,
          backgroundColor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
        }}
      >
        <Stack spacing={2.5}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "flex-start" }}
            spacing={1.5}
          >
            <Box>
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
                Puntos programados
              </Typography>

              <Typography sx={{ mt: 0.6, fontSize: 13, color: "text.secondary", lineHeight: 1.55 }}>
                Administra puntos de entrega con capacidad, vigencia y horarios propios.
              </Typography>
            </Box>

            <Button
              type="button"
              variant="contained"
              startIcon={<AddOutlinedIcon />}
              onClick={openCreate}
              disabled={!fulfillment?.id}
              sx={{ minWidth: { xs: "100%", sm: 170 } }}
            >
              Agregar punto
            </Button>
          </Stack>

          {!fulfillment?.id ? (
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
              Guarda primero la modalidad Punto programado para comenzar a configurarla.
            </Typography>
          ) : visible.length === 0 ? (
            <Box
              sx={{
                p: 3,
                textAlign: "center",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                backgroundColor: "background.default",
              }}
            >
              <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
                Aún no hay puntos programados
              </Typography>

              <Typography sx={{ mt: 0.5, fontSize: 12.5, color: "text.secondary" }}>
                Agrega el primer punto para definir después sus horarios disponibles.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1}>
              {visible.map((point) => (
                <Box
                  key={point.id}
                  sx={{
                    p: 1.75,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    backgroundColor: "background.default",
                  }}
                >
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    spacing={1.5}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
                        {point.name}
                      </Typography>

                      <Typography sx={{ mt: 0.35, fontSize: 12.5, color: "text.secondary", lineHeight: 1.45 }}>
                        {point.address}
                      </Typography>

                      <Typography sx={{ mt: 0.6, fontSize: 12.5, color: "text.secondary" }}>
                        Costo: ${Number(point.delivery_fee || 0).toFixed(2)}
                        {" · "}
                        Capacidad: {point.default_capacity || "Sin límite definido"}
                        {" · "}
                        {point.is_active ? "Activo" : "Inactivo"}
                      </Typography>
                    </Box>

                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      sx={{ flexShrink: 0 }}
                    >
                      <Button
                        type="button"
                        variant="outlined"
                        startIcon={<ScheduleRoundedIcon />}
                        onClick={() => setTimePoint(point)}
                      >
                        Horarios
                      </Button>

                      <IconButton
                        onClick={() =>
                          setModal({
                            open: true,
                            mode: "edit",
                            point,
                          })
                        }
                      >
                        <EditOutlinedIcon />
                      </IconButton>

                      <IconButton color="error" onClick={() => remove(point)}>
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}

          {points.length > ITEMS_PER_PAGE ? (
            <PaginationFooter
              page={safePage}
              totalPages={totalPages}
              startItem={points.length === 0 ? 0 : start + 1}
              endItem={Math.min(start + ITEMS_PER_PAGE, points.length)}
              total={points.length}
              hasPrev={safePage > 1}
              hasNext={safePage < totalPages}
              onPrev={() => setPage(Math.max(1, safePage - 1))}
              onNext={() => setPage(Math.min(totalPages, safePage + 1))}
              itemLabel="puntos"
            />
          ) : null}
        </Stack>
      </Paper>

      <ScheduledPointModal
        open={modal.open}
        mode={modal.mode}
        point={modal.point}
        restaurantId={restaurantId}
        branchId={branchId}
        fulfillment={fulfillment}
        onClose={() => setModal({ open: false, mode: "create", point: null })}
        onSaved={handleSaved}
        onAlert={onAlert}
      />

      <ScheduledPointTimeBlocksDialog
        open={!!timePoint}
        point={timePoint}
        restaurantId={restaurantId}
        branchId={branchId}
        fulfillment={fulfillment}
        onClose={() => setTimePoint(null)}
        onAlert={onAlert}
      />
    </>
  );
}

function ScheduledPointModal({
  open,
  mode,
  point,
  restaurantId,
  branchId,
  fulfillment,
  onClose,
  onSaved,
  onAlert,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    setForm({
      name: point?.name || "",
      address: point?.address || "",
      description: point?.description || "",
      delivery_fee:
        point?.delivery_fee === null || point?.delivery_fee === undefined
          ? ""
          : String(point.delivery_fee),
      default_capacity:
        point?.default_capacity === null || point?.default_capacity === undefined
          ? ""
          : String(point.default_capacity),
      valid_from: point?.valid_from ? String(point.valid_from).slice(0, 10) : "",
      valid_until: point?.valid_until ? String(point.valid_until).slice(0, 10) : "",
      is_active: point?.is_active !== false,
      sort_order: point?.sort_order ? String(point.sort_order) : "",
    });
  }, [open, point]);

  const canSave = useMemo(() => {
    if (!form.name.trim() || !form.address.trim()) return false;
    if (form.delivery_fee === "" || !/^\d+(\.\d{1,2})?$/.test(form.delivery_fee)) return false;

    if (
      form.default_capacity !== "" &&
      (!/^\d+$/.test(form.default_capacity) || Number(form.default_capacity) < 1)
    ) {
      return false;
    }

    if (!/^\d+$/.test(form.sort_order) || Number(form.sort_order) < 1) return false;
    if (form.valid_from && form.valid_until && form.valid_until < form.valid_from) return false;

    return true;
  }, [form]);

  const save = async () => {
    if (!canSave || !fulfillment?.id) return;

    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        address: form.address.trim(),
        description: form.description.trim() || null,
        delivery_fee: Number(form.delivery_fee),
        default_capacity:
          form.default_capacity === "" ? null : Number(form.default_capacity),
        valid_from: form.valid_from || null,
        valid_until: form.valid_until || null,
        is_active: !!form.is_active,
        sort_order: Number(form.sort_order),
      };

      const response =
        mode === "edit"
          ? await updateOnlineOrderScheduledPoint(
              restaurantId,
              branchId,
              fulfillment.id,
              point.id,
              payload
            )
          : await createOnlineOrderScheduledPoint(
              restaurantId,
              branchId,
              fulfillment.id,
              payload
            );

      onSaved?.(response?.data, mode);

      onAlert?.({
        severity: "success",
        title: "Hecho",
        message:
          response?.message ||
          (mode === "edit"
            ? "El punto se actualizó correctamente."
            : "El punto se creó correctamente."),
      });
    } catch (error) {
      const firstError = Object.values(error?.response?.data?.errors || {}).flat()?.[0];

      onAlert?.({
        severity: "error",
        title: "Error",
        message:
          firstError ||
          error?.response?.data?.message ||
          error?.message ||
          "No se pudo guardar el punto programado.",
      });
    } finally {
      setSaving(false);
    }
  };

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
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: 20, sm: 24 }, color: "#fff" }}>
              {mode === "edit" ? "Editar punto programado" : "Nuevo punto programado"}
            </Typography>

            <Typography sx={{ mt: 0.5, fontSize: 13, color: "rgba(255,255,255,0.82)" }}>
              Define ubicación, costo, capacidad y vigencia.
            </Typography>
          </Box>

          <IconButton onClick={onClose} disabled={saving} sx={{ color: "#fff" }}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: "background.default" }}>
        <Paper
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderRadius: 1,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "none",
          }}
        >
          <Stack spacing={2}>
            <FieldBlock
              label="Nombre *"
              input={
                <TextField
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Ej. Acceso principal"
                />
              }
            />

            <FieldBlock
              label="Dirección *"
              input={
                <TextField
                  value={form.address}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, address: event.target.value }))
                  }
                  placeholder="Ej. Av. Costera 123"
                />
              }
            />

            <FieldBlock
              label="Descripción"
              input={
                <TextField
                  multiline
                  minRows={2}
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                />
              }
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FieldBlock
                label="Costo de entrega *"
                input={
                  <TextField
                    type="text"
                    value={form.delivery_fee}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        delivery_fee: cleanMoney(event.target.value),
                      }))
                    }
                    placeholder="Ej. 0.00"
                    inputProps={{ inputMode: "decimal" }}
                  />
                }
              />

              <FieldBlock
                label="Capacidad predeterminada"
                input={
                  <TextField
                    type="text"
                    value={form.default_capacity}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        default_capacity: cleanInteger(event.target.value),
                      }))
                    }
                    placeholder="Ej. 20"
                    inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                  />
                }
              />
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FieldBlock
                label="Válido desde"
                input={
                  <TextField
                    type="date"
                    value={form.valid_from}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        valid_from: event.target.value,
                      }))
                    }
                  />
                }
              />

              <FieldBlock
                label="Válido hasta"
                input={
                  <TextField
                    type="date"
                    value={form.valid_until}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        valid_until: event.target.value,
                      }))
                    }
                  />
                }
              />

              <FieldBlock
                label="Orden *"
                input={
                  <TextField
                    type="text"
                    value={form.sort_order}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        sort_order: cleanInteger(event.target.value),
                      }))
                    }
                    inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                  />
                }
              />
            </Stack>

            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary", mb: 1 }}>
                Estado *
              </Typography>

              <FormControlLabel
                sx={{ m: 0 }}
                control={
                  <Switch
                    checked={!!form.is_active}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        is_active: event.target.checked,
                      }))
                    }
                    color="primary"
                  />
                }
                label={
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: "text.primary" }}>
                    {form.is_active ? "Activo" : "Inactivo"}
                  </Typography>
                }
              />
            </Box>

            <Stack direction={{ xs: "column-reverse", sm: "row" }} justifyContent="flex-end" spacing={1.5}>
              <Button
                type="button"
                variant="outlined"
                onClick={onClose}
                disabled={saving}
                sx={{ minWidth: { xs: "100%", sm: 150 }, height: 44 }}
              >
                Cancelar
              </Button>

              <Button
                type="button"
                variant="contained"
                startIcon={<SaveOutlinedIcon />}
                onClick={save}
                disabled={!canSave || saving}
                sx={{ minWidth: { xs: "100%", sm: 180 }, height: 44 }}
              >
                {saving ? "Guardando…" : "Guardar"}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </DialogContent>
    </Dialog>
  );
}

function FieldBlock({ label, input }) {
  return (
    <Box sx={{ flex: 1, width: "100%" }}>
      <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary", mb: 1 }}>
        {label}
      </Typography>
      {input}
    </Box>
  );
}

function sortByOrder(a, b) {
  return Number(a?.sort_order || 0) - Number(b?.sort_order || 0);
}

function cleanMoney(value) {
  let result = String(value || "").replace(",", ".").replace(/[^\d.]/g, "");
  const firstDot = result.indexOf(".");

  if (firstDot >= 0) {
    result =
      result.slice(0, firstDot + 1) +
      result.slice(firstDot + 1).replace(/\./g, "");

    const [whole, decimal = ""] = result.split(".");
    result = `${whole}.${decimal.slice(0, 2)}`;
  }

  return result;
}

function cleanInteger(value) {
  return String(value || "").replace(/\D/g, "");
}
