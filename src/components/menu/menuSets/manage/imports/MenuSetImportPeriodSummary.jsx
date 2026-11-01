//src/components/menu/menuSets/manage/imports/MenuSetImportPeriodSummary.jsx
import {
  Box, Chip, CircularProgress, Paper, Stack, Typography,
} from "@mui/material";

import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";

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

function formatDate(value) {
  if (!value) return "No informada";

  const date = new Date(`${value}T12:00:00Z`);

  if (Number.isNaN(date.getTime())) return "No informada";

  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  }).format(date);
}

function formatTime(value, timezone) {
  if (!value) return "Sin hora límite configurada";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "No informada";

  try {
    return new Intl.DateTimeFormat("es-MX", {
      hour: "numeric", minute: "2-digit", hour12: true, timeZone: timezone,
    }).format(date);
  } catch {
    return "No informada";
  }
}

function getUpdateState(status) {
  if (status.has_exact_publication) {
    return { label: "Publicado", color: "success" };
  }

  if (status.is_update_overdue) {
    return { label: "Actualización vencida", color: "warning" };
  }

  if (status.is_update_due) {
    return { label: "Actualización pendiente", color: "warning" };
  }

  return { label: "Pendiente de publicación", color: "default" };
}

function getEffectiveSource(status) {
  if (status.effective_publication_id === null || status.effective_publication_id === undefined) {
    return "Configuración anterior conservada";
  }

  if (status.is_inherited) {
    return "Programación publicada anteriormente";
  }

  return "Programación publicada para este periodo";
}

function SummaryCard({ icon, label, value, description }) {
  return (
    <Box sx={{
      p: 1.75,
      minWidth: 0,
      height: "100%",
      border: "1px solid",
      borderColor: "divider",
      borderRadius: 1,
      bgcolor: "background.default",
      display: "flex",
      flexDirection: "column",
    }}>
      <Stack spacing={1.25} sx={{ flex: 1 }}>
        <Box sx={{
          width: 38, height: 38, borderRadius: 1,
          display: "grid", placeItems: "center",
          bgcolor: "rgba(214, 122, 58, 0.12)",
          color: "secondary.main",
        }}>
          {icon}
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 800, color: "text.secondary" }}>
            {label}
          </Typography>

          <Typography sx={{
            mt: 0.6, fontSize: 15, fontWeight: 800,
            color: "text.primary", lineHeight: 1.45, overflowWrap: "anywhere",
          }}>
            {value}
          </Typography>

          {description ? (
            <Typography sx={{ mt: 0.5, fontSize: 12, color: "text.secondary", lineHeight: 1.45 }}>
              {description}
            </Typography>
          ) : null}
        </Box>
      </Stack>
    </Box>
  );
}

export default function MenuSetImportPeriodSummary({
  status,
  checking = false,
  timezone = "America/Mexico_City",
}) {
  if (!status) return null;

  const updateState = getUpdateState(status);
  const effectiveMode = CAPACITY_LABELS[status.effective_capacity_mode] || "No informada";
  const nextMode = CAPACITY_LABELS[status.next_import_capacity_mode] || "No informada";

  const effectiveDescription = status.effective_publication_id !== null
    && status.effective_publication_id !== undefined
    && status.effective_revision !== null
    && status.effective_revision !== undefined
      ? `Revisión ${status.effective_revision}`
      : null;

  return (
    <Paper sx={panelSx}>
      <Stack spacing={2.25}>
        {/* Encabezado */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1.5}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
              Resumen del periodo comercial
            </Typography>

            <Typography sx={{ mt: 0.4, fontSize: 13, color: "text.secondary", lineHeight: 1.5 }}>
              Consulta la programación y las fechas correspondientes al periodo seleccionado.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            {checking ? <CircularProgress size={18} color="primary" /> : null}

            <Chip
              size="small"
              color={updateState.color}
              label={updateState.label}
              sx={{ fontWeight: 800 }}
            />
          </Stack>
        </Stack>

        {/* Periodo */}
        <Box sx={{
          p: { xs: 1.75, sm: 2 },
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          bgcolor: "background.default",
        }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{
              width: 44, height: 44, borderRadius: 1,
              display: "grid", placeItems: "center", flexShrink: 0,
              bgcolor: "rgba(214, 122, 58, 0.12)",
              color: "secondary.main",
            }}>
              <CalendarMonthOutlinedIcon />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 800, color: "text.secondary" }}>
                Periodo comercial seleccionado
              </Typography>

              <Typography sx={{
                mt: 0.3, fontSize: { xs: 16, sm: 19 },
                fontWeight: 800, color: "text.primary", lineHeight: 1.45,
              }}>
                {formatDate(status.target_week_start)} al {formatDate(status.target_week_end)}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Fechas y modalidades */}
        <Box sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(3, minmax(0, 1fr))",
          },
          gridAutoRows: "1fr",
          gap: 1.5,
        }}>
          <SummaryCard
            icon={<EventAvailableOutlinedIcon fontSize="small" />}
            label="Fecha de actualización"
            value={formatDate(status.update_date)}
          />

          <SummaryCard
            icon={<AccessTimeOutlinedIcon fontSize="small" />}
            label="Fecha límite"
            value={status.deadline_at
              ? `${formatDate(status.update_date)} · ${formatTime(status.deadline_at, timezone)}`
              : "Sin hora límite configurada"}
          />

          <SummaryCard
            icon={<HistoryOutlinedIcon fontSize="small" />}
            label="Configuración aplicada"
            value={getEffectiveSource(status)}
            description={effectiveDescription}
          />

          <SummaryCard
            icon={<Inventory2OutlinedIcon fontSize="small" />}
            label="Capacidad vigente para este periodo"
            value={effectiveMode}
          />

          <SummaryCard
            icon={<UploadFileOutlinedIcon fontSize="small" />}
            label="Capacidad de la próxima importación"
            value={nextMode}
          />

          <SummaryCard
            icon={<CalendarMonthOutlinedIcon fontSize="small" />}
            label="Publicación del periodo"
            value={status.has_exact_publication
              ? `Publicación registrada${status.effective_revision ? ` · Revisión ${status.effective_revision}` : ""}`
              : "Sin publicación propia"}
            description={!status.has_exact_publication && status.is_inherited
              ? "Se conserva una programación publicada anteriormente."
              : null}
          />
        </Box>

        {status.is_update_overdue && !status.has_exact_publication ? (
          <Typography sx={{ fontSize: 13, lineHeight: 1.5, color: "text.secondary" }}>
            La fecha límite ya pasó. Todavía puedes preparar y publicar la programación;
            el vencimiento se utiliza para dar seguimiento a las actualizaciones.
          </Typography>
        ) : null}
      </Stack>
    </Paper>
  );
}