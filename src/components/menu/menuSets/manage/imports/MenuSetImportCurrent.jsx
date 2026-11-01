//src/components/menu/menuSets/manage/imports/MenuSetImportCurrent.jsx
import { useEffect, useRef, useState } from "react";

import {
  Box, Button, Chip, CircularProgress, MenuItem, Paper,
  Stack, TextField, Typography,
} from "@mui/material";

import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import {
  downloadMenuSetImportCurrent,
  getMenuSetImportCurrentStatus,
} from "../../../../../services/menu/menuSets/menuSetImport.service";

const panelSx = {
  p: { xs: 2, sm: 2.5 },
  borderRadius: 1,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  boxShadow: "none",
};

const CAPACITY_LABELS = {
  none: "Sin límite",
  daily: "Diaria",
  weekly: "Semanal",
};

function todayInTimezone(timezone) {
  try {
    const parts = new Intl.DateTimeFormat("es-MX", {
      year: "numeric", month: "2-digit", day: "2-digit", timeZone: timezone,
    }).formatToParts(new Date());

    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function periodStartForDate(dateValue, weekStartDay) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue || "")) return "";

  const startDay = Number(weekStartDay);
  if (!Number.isInteger(startDay) || startDay < 1 || startDay > 7) return "";

  const date = new Date(`${dateValue}T12:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== dateValue) return "";

  const isoDay = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() - ((isoDay - startDay + 7) % 7));

  return date.toISOString().slice(0, 10);
}

function getSource(status) {
  if (!status) return { label: "No disponible", color: "default", description: "" };

  if (status.management_mode === "manual") {
    return {
      label: "Configuración manual",
      color: "default",
      description: "Se utiliza la configuración manual del conjunto.",
    };
  }

  if (status.has_exact_publication) {
    return {
      label: "Publicación del periodo",
      color: "success",
      description: "Existe una publicación específica para la semana comercial de esta fecha.",
    };
  }

  if (status.is_inherited && status.effective_publication_id != null) {
    return {
      label: "Programación heredada",
      color: "info",
      description: "Se utiliza la última publicación aplicable de un periodo anterior del ciclo actual.",
    };
  }

  return {
    label: "Configuración manual de respaldo",
    color: "default",
    description: "Todavía no existe una publicación aplicable de la administración masiva actual.",
  };
}

function getErrorMessage(error, fallback) {
  const data = error?.response?.data;
  const fields = data?.errors && typeof data.errors === "object"
    ? Object.values(data.errors).flat() : [];

  return fields.find((value) => typeof value === "string")
    || data?.message || error?.message || fallback;
}

function saveDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function MenuSetImportCurrent({
  restaurantId,
  branchId,
  menuSet,
  management,
  refreshToken = 0,
  onAlert,
}) {
  const menuSetId = menuSet?.id;
  const timezone = menuSet?.branch?.timezone || "America/Mexico_City";
  const commercialStartDay = menuSet?.commercial_week_start_day
    ?? management?.commercial_week_start_day;

  const [serviceDate, setServiceDate] = useState(() => todayInTimezone(timezone));
  const [format, setFormat] = useState("xlsx");
  const [status, setStatus] = useState(null);
  const [checking, setChecking] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const downloadingRef = useRef(false);
  const downloadControllerRef = useRef(null);
  const alertRef = useRef(onAlert);

  useEffect(() => {
    alertRef.current = onAlert;
  }, [onAlert]);

  useEffect(() => {
    setServiceDate(todayInTimezone(timezone));
    setStatus(null);
  }, [menuSetId, timezone]);

  useEffect(() => {
    const controller = new AbortController();
    const weekStart = periodStartForDate(serviceDate, commercialStartDay);

    setStatus(null);
    setChecking(Boolean(restaurantId && branchId && menuSetId && weekStart));

    if (!restaurantId || !branchId || !menuSetId || !weekStart) {
      return () => controller.abort();
    }

    const load = async () => {
      try {
        const result = await getMenuSetImportCurrentStatus(
          restaurantId, branchId, menuSetId, weekStart, controller.signal
        );

        if (controller.signal.aborted) return;
        if (result?.target_week_start !== weekStart) {
          throw new Error("No se pudo identificar el periodo correspondiente a la fecha.");
        }

        setStatus(result);
      } catch (error) {
        if (controller.signal.aborted) return;

        alertRef.current?.({
          severity: "error",
          title: "Consulta no disponible",
          message: getErrorMessage(error, "No se pudo consultar la programación de esta fecha."),
        });
      } finally {
        if (!controller.signal.aborted) setChecking(false);
      }
    };

    load();
    return () => controller.abort();
  }, [
    restaurantId, branchId, menuSetId, serviceDate,
    commercialStartDay, refreshToken,
  ]);

  useEffect(() => {
    return () => downloadControllerRef.current?.abort();
  }, []);

  const handleDownload = async (event) => {
    event.preventDefault();
    if (downloadingRef.current || !serviceDate || !menuSetId) return;

    const controller = new AbortController();
    downloadControllerRef.current = controller;
    downloadingRef.current = true;
    setDownloading(true);

    try {
      const result = await downloadMenuSetImportCurrent(
        restaurantId, branchId, menuSetId, format, serviceDate, controller.signal
      );

      if (controller.signal.aborted) return;

      if (!(result?.blob instanceof Blob)) {
        throw new Error("No se recibió un archivo válido para descargar.");
      }

      saveDownload(result.blob, result.filename);
    } catch (error) {
      if (controller.signal.aborted) return;

      onAlert?.({
        severity: "error",
        title: "No se pudo descargar",
        message: getErrorMessage(error, "No fue posible descargar la programación seleccionada."),
      });
    } finally {
      downloadingRef.current = false;
      downloadControllerRef.current = null;
      if (!controller.signal.aborted) setDownloading(false);
    }
  };

  const source = getSource(status);
  const isWeekly = status?.effective_capacity_mode === "weekly";
  const validDate = Boolean(periodStartForDate(serviceDate, commercialStartDay));

  return (
    <Paper component="form" onSubmit={handleDownload} sx={panelSx}>
      <Stack spacing={2.5}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Box sx={{
            width: 44, height: 44, borderRadius: 1,
            display: "grid", placeItems: "center", flexShrink: 0,
            bgcolor: "rgba(214, 122, 58, 0.12)", color: "secondary.main",
          }}>
            <EventAvailableOutlinedIcon />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
              Configuración vigente por fecha
            </Typography>

            <Typography sx={{ mt: 0.4, fontSize: 13, color: "text.secondary", lineHeight: 1.55 }}>
              Consulta y descarga la programación que corresponde a una fecha de servicio.
              También puedes consultar fechas de periodos anteriores.
            </Typography>
          </Box>
        </Stack>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <Box sx={{ flex: 2, minWidth: 0 }}>
            <Typography sx={{ mb: 1, fontSize: 14, fontWeight: 800 }}>
              Fecha de servicio *
            </Typography>

            <TextField
              fullWidth
              type="date"
              value={serviceDate}
              onChange={(event) => setServiceDate(event.target.value)}
              disabled={downloading}
              inputProps={{ "aria-label": "Fecha de servicio" }}
            />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ mb: 1, fontSize: 14, fontWeight: 800 }}>
              Formato de descarga *
            </Typography>

            <TextField
              select
              fullWidth
              value={format}
              onChange={(event) => setFormat(event.target.value)}
              disabled={downloading}
              SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
            >
              <MenuItem value="xlsx">Excel (.xlsx)</MenuItem>
              <MenuItem value="csv">
                {isWeekly ? "CSV en archivo comprimido (.zip)" : "CSV (.csv)"}
              </MenuItem>
            </TextField>
          </Box>
        </Stack>

        <Box sx={{
          p: 1.75, borderRadius: 1, border: "1px solid",
          borderColor: "divider", bgcolor: "background.default",
        }}>
          <Stack spacing={1.25}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
              <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
                Origen de la programación
              </Typography>

              {checking ? <CircularProgress size={18} /> : null}
            </Stack>

            {status ? (
              <>
                <Box>
                  <Chip size="small" color={source.color} label={source.label} sx={{ fontWeight: 800 }} />
                </Box>

                <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.55 }}>
                  {source.description}
                </Typography>

                <Typography sx={{ fontSize: 13, color: "text.primary" }}>
                  Capacidad aplicable:{" "}
                  <Box component="span" sx={{ fontWeight: 800 }}>
                    {CAPACITY_LABELS[status.effective_capacity_mode] || "No informada"}
                  </Box>
                </Typography>

                {status.effective_revision != null && status.effective_publication_id != null ? (
                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                    Revisión de origen: {status.effective_revision}
                  </Typography>
                ) : null}
              </>
            ) : (
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                {checking
                  ? "Identificando la configuración aplicable…"
                  : "No se pudo determinar el origen de la programación para esta fecha."}
              </Typography>
            )}
          </Stack>
        </Box>

        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <InfoOutlinedIcon sx={{ color: "primary.main", fontSize: 20, flexShrink: 0 }} />
          <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.55 }}>
            La descarga utiliza la configuración correspondiente a la fecha seleccionada.
            No crea una nueva publicación ni modifica la programación.
          </Typography>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="flex-end">
          <Button
            type="submit"
            variant="contained"
            disabled={downloading || !validDate || !restaurantId || !branchId || !menuSetId}
            startIcon={downloading
              ? <CircularProgress size={18} color="inherit" />
              : <FileDownloadOutlinedIcon />}
            sx={{ minWidth: { xs: "100%", sm: 220 }, height: 44, fontWeight: 800 }}
          >
            {downloading ? "Preparando descarga…" : "Descargar configuración"}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}