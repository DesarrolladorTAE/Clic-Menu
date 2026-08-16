import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box, Button, CircularProgress, Dialog, DialogContent, DialogTitle,
  IconButton, Paper, Stack, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

import ScheduledPointDaySchedule, {
  getScheduleBlockKey,
} from "./ScheduledPointDaySchedule";

import {
  createOnlineOrderTimeBlock,
  deleteOnlineOrderTimeBlock,
  getOnlineOrderTimeBlocks,
  updateOnlineOrderTimeBlock,
} from "../../../../services/operation/online-orders/onlineOrders.service";

const DAYS = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 7, label: "Domingo" },
];

const ITEMS_PER_DAY = 2;

function createInitialPages() {
  return DAYS.reduce((result, day) => {
    result[day.value] = 1;
    return result;
  }, {});
}

function isActiveValue(value) {
  return value === true || value === 1 || value === "1";
}

function normalizeBlock(block) {
  return {
    id: block?.id || null,
    local_id: block?.id ? `guardado-${block.id}` : block?.local_id || "",
    day_of_week: Number(block?.day_of_week || 0),
    start_time: String(block?.start_time || "").slice(0, 5),
    end_time: String(block?.end_time || "").slice(0, 5),
    capacity_override:
      block?.capacity_override === null || block?.capacity_override === undefined
        ? ""
        : String(block.capacity_override),
    is_active: isActiveValue(block?.is_active),
    sort_order: Number(block?.sort_order || 0),
  };
}

function buildPayload(block) {
  return {
    day_of_week: Number(block.day_of_week),
    start_time: String(block.start_time || "").slice(0, 5),
    end_time: String(block.end_time || "").slice(0, 5),
    capacity_override:
      block.capacity_override === "" ||
      block.capacity_override === null ||
      block.capacity_override === undefined
        ? null
        : Number(block.capacity_override),
    is_active: !!block.is_active,
    sort_order: Number(block.sort_order),
  };
}

function sameBlock(a, b) {
  return JSON.stringify(buildPayload(a)) === JSON.stringify(buildPayload(b));
}

function validTime(value) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(String(value || ""));
}

function buildValidationErrors(blocks) {
  const errors = {};

  const addError = (block, field, message) => {
    const key = getScheduleBlockKey(block);

    errors[key] = {
      ...(errors[key] || {}),
      [field]: errors[key]?.[field] || message,
    };
  };

  blocks.forEach((block) => {
    if (!validTime(block.start_time)) {
      addError(block, "start_time", "La hora inicial es obligatoria.");
    }

    if (!validTime(block.end_time)) {
      addError(block, "end_time", "La hora final es obligatoria.");
    }

    if (
      validTime(block.start_time) &&
      validTime(block.end_time) &&
      block.end_time <= block.start_time
    ) {
      addError(
        block,
        "end_time",
        "La hora final debe ser posterior a la hora inicial."
      );
    }

    if (
      block.capacity_override !== "" &&
      (!/^\d+$/.test(String(block.capacity_override)) ||
        Number(block.capacity_override) < 1)
    ) {
      addError(
        block,
        "capacity_override",
        "La capacidad debe ser un número entero mayor a cero."
      );
    }
  });

  DAYS.forEach((day) => {
    const dayBlocks = blocks.filter(
      (block) => Number(block.day_of_week) === day.value
    );

    for (let firstIndex = 0; firstIndex < dayBlocks.length; firstIndex += 1) {
      const first = dayBlocks[firstIndex];

      if (!validTime(first.start_time) || !validTime(first.end_time)) continue;
      if (first.end_time <= first.start_time) continue;

      for (let secondIndex = firstIndex + 1; secondIndex < dayBlocks.length; secondIndex += 1) {
        const second = dayBlocks[secondIndex];

        if (!validTime(second.start_time) || !validTime(second.end_time)) continue;
        if (second.end_time <= second.start_time) continue;

        const overlaps =
          first.start_time < second.end_time &&
          first.end_time > second.start_time;

        if (!overlaps) continue;

        addError(
          first,
          "start_time",
          "Este horario se cruza con otro horario del mismo día."
        );

        addError(
          second,
          "start_time",
          "Este horario se cruza con otro horario del mismo día."
        );
      }
    }
  });

  return errors;
}

function getBackendError(error, fallback) {
  const errors = error?.response?.data?.errors || {};
  const firstError = Object.values(errors).flat()?.[0];

  return (
    firstError ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

export default function ScheduledPointTimeBlocksDialog({
  open,
  point,
  restaurantId,
  branchId,
  fulfillment,
  onClose,
  onAlert,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [originalBlocks, setOriginalBlocks] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [pages, setPages] = useState(() => createInitialPages());

  const loadBlocks = useCallback(async (
    showLoading = true,
    notifyError = true
  ) => {
    if (!open || !point?.id || !fulfillment?.id) return [];

    if (showLoading) setLoading(true);

    try {
      const rows = await getOnlineOrderTimeBlocks(
        restaurantId,
        branchId,
        fulfillment.id,
        point.id
      );

      const normalized = rows.map(normalizeBlock);

      setOriginalBlocks(normalized);
      setBlocks(normalized);
      setPages(createInitialPages());
      setDirty(false);

      return normalized;
    } catch (error) {
      setOriginalBlocks([]);
      setBlocks([]);
      setPages(createInitialPages());
      setDirty(false);

      if (notifyError) {
        onAlert?.({
          severity: "error",
          title: "Error",
          message: getBackendError(
            error,
            "No se pudieron cargar los horarios del punto programado."
          ),
        });
      }

      return [];
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [
    open,
    point?.id,
    fulfillment?.id,
    restaurantId,
    branchId,
    onAlert,
  ]);

  useEffect(() => {
    if (!open || !point?.id || !fulfillment?.id) return;
    loadBlocks(true, true);
  }, [open, point?.id, fulfillment?.id, loadBlocks]);

  const validationErrors = useMemo(
    () => buildValidationErrors(blocks),
    [blocks]
  );

  const hasValidationErrors = Object.keys(validationErrors).length > 0;

  const blocksByDay = useMemo(() => {
    return DAYS.reduce((result, day) => {
      result[day.value] = blocks.filter(
        (block) => Number(block.day_of_week) === day.value
      );

      return result;
    }, {});
  }, [blocks]);

  const addBlock = (day) => {
    const nextOrder =
      blocks.length === 0
        ? 1
        : Math.max(...blocks.map((block) => Number(block.sort_order) || 0)) + 1;

    const localId = `nuevo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const newBlock = {
      id: null,
      local_id: localId,
      day_of_week: Number(day),
      start_time: "09:00",
      end_time: "18:00",
      capacity_override: "",
      is_active: true,
      sort_order: nextOrder,
    };

    const nextDayCount = (blocksByDay[day]?.length || 0) + 1;
    const nextPage = Math.max(1, Math.ceil(nextDayCount / ITEMS_PER_DAY));

    setBlocks((current) => [...current, newBlock]);
    setPages((current) => ({ ...current, [day]: nextPage }));
    setDirty(true);
  };

  const updateBlock = (blockKey, field, value) => {
    setBlocks((current) =>
      current.map((block) =>
        getScheduleBlockKey(block) === blockKey
          ? { ...block, [field]: value }
          : block
      )
    );

    setDirty(true);
  };

  const removeBlock = (blockKey) => {
    setBlocks((current) =>
      current.filter((block) => getScheduleBlockKey(block) !== blockKey)
    );

    setDirty(true);
  };

  const save = async () => {
    if (!dirty || saving) return;

    if (hasValidationErrors) {
      onAlert?.({
        severity: "warning",
        title: "Revisa los horarios",
        message:
          "Corrige los horarios marcados antes de guardar la configuración.",
      });

      return;
    }

    const originalById = new Map(
      originalBlocks
        .filter((block) => block.id)
        .map((block) => [Number(block.id), block])
    );

    const currentPersistedIds = new Set(
      blocks
        .filter((block) => block.id)
        .map((block) => Number(block.id))
    );

    const blocksToUpdate = blocks.filter((block) => {
      if (!block.id) return false;

      const original = originalById.get(Number(block.id));
      if (!original) return false;

      return !sameBlock(block, original);
    });

    const blocksToCreate = blocks.filter((block) => !block.id);

    const blocksToDelete = originalBlocks.filter(
      (block) => block.id && !currentPersistedIds.has(Number(block.id))
    );

    if (
      blocksToUpdate.length === 0 &&
      blocksToCreate.length === 0 &&
      blocksToDelete.length === 0
    ) {
      setDirty(false);
      return;
    }

    setSaving(true);

    try {
      for (const block of blocksToUpdate) {
        await updateOnlineOrderTimeBlock(
          restaurantId,
          branchId,
          fulfillment.id,
          point.id,
          block.id,
          buildPayload(block)
        );
      }

      for (const block of blocksToCreate) {
        await createOnlineOrderTimeBlock(
          restaurantId,
          branchId,
          fulfillment.id,
          point.id,
          buildPayload(block)
        );
      }

      for (const block of blocksToDelete) {
        await deleteOnlineOrderTimeBlock(
          restaurantId,
          branchId,
          fulfillment.id,
          point.id,
          block.id
        );
      }

      await loadBlocks(false, false);

      onAlert?.({
        severity: "success",
        title: "Hecho",
        message: "Los horarios del punto programado se guardaron correctamente.",
      });

      onClose?.();
    } catch (error) {
      await loadBlocks(false, false);

      onAlert?.({
        severity: "error",
        title: "Error",
        message: getBackendError(
          error,
          "No se pudieron guardar los horarios del punto programado."
        ),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (saving) return;
    onClose?.();
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : handleClose}
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
              Horario del punto
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 13,
                color: "rgba(255,255,255,0.82)",
              }}
            >
              {point?.name || "Punto programado"}
            </Typography>
          </Box>

          <IconButton
            onClick={handleClose}
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
          {loading ? (
            <Box
              sx={{
                minHeight: 260,
                display: "grid",
                placeItems: "center",
              }}
            >
              <Stack spacing={2} alignItems="center">
                <CircularProgress color="primary" />

                <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                  Cargando horarios…
                </Typography>
              </Stack>
            </Box>
          ) : (
            <Stack spacing={2.5}>
              <Box>
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "text.primary",
                  }}
                >
                  Horarios disponibles
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: 13,
                    color: "text.secondary",
                    lineHeight: 1.55,
                  }}
                >
                  Configura uno o más horarios por día. Los cambios se aplicarán
                  únicamente cuando presiones Guardar horario.
                </Typography>
              </Box>

              {DAYS.map((day) => (
                <ScheduledPointDaySchedule
                  key={day.value}
                  day={day}
                  blocks={blocksByDay[day.value] || []}
                  page={pages[day.value] || 1}
                  disabled={saving}
                  defaultCapacity={point?.default_capacity || null}
                  validationErrors={validationErrors}
                  onPageChange={(nextPage) =>
                    setPages((current) => ({
                      ...current,
                      [day.value]: nextPage,
                    }))
                  }
                  onAdd={addBlock}
                  onChange={updateBlock}
                  onRemove={removeBlock}
                />
              ))}

              <Stack
                direction={{ xs: "column-reverse", sm: "row" }}
                justifyContent="flex-end"
                spacing={1.5}
                pt={1}
              >
                <Button
                  type="button"
                  variant="outlined"
                  onClick={handleClose}
                  disabled={saving}
                  sx={{
                    minWidth: { xs: "100%", sm: 150 },
                    height: 44,
                  }}
                >
                  Cancelar
                </Button>

                <Button
                  type="button"
                  variant="contained"
                  startIcon={<SaveOutlinedIcon />}
                  onClick={save}
                  disabled={!dirty || hasValidationErrors || saving}
                  sx={{
                    minWidth: { xs: "100%", sm: 190 },
                    height: 44,
                    fontWeight: 800,
                  }}
                >
                  {saving ? "Guardando…" : "Guardar horario"}
                </Button>
              </Stack>
            </Stack>
          )}
        </Paper>
      </DialogContent>
    </Dialog>
  );
}