//src/components/menu/menuSets/manage/MenuSetProgrammingTab.jsx
import {
  Box, Chip, CircularProgress, Paper, Stack, Typography,
} from "@mui/material";

import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import MenuSetCapacityTab from "./capacities/MenuSetCapacityTab";
import MenuSetMassImportTab from "./imports/MenuSetMassImportTab";

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
  if (!value) {
    return "No informado";
  }

  const date = new Date(`${value}T12:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  }).format(date);
}

function getEffectiveSource(management) {
  if (management?.effective_source === "manual_fallback") {
    return "Configuración manual de respaldo";
  }

  if (management?.effective_source === "manual") {
    return "Configuración manual";
  }

  if (management?.effective_source === "publication") {
    return management?.has_exact_publication
      ? "Publicación del periodo"
      : "Publicación anterior aplicada";
  }

  return "No informado";
}

function SummaryCard({ title, value, icon }) {
  return (
    <Box sx={{
      p: 1.75, minWidth: 0, height: "100%",
      borderRadius: 1, border: "1px solid",
      borderColor: "divider", bgcolor: "background.default",
    }}>
      <Stack spacing={1.25} sx={{ height: "100%" }}>
        <Box sx={{
          width: 38, height: 38, borderRadius: 1,
          display: "grid", placeItems: "center",
          bgcolor: "rgba(214, 122, 58, 0.12)",
          color: "secondary.main",
        }}>
          {icon}
        </Box>

        <Typography sx={{ fontSize: 12, color: "text.secondary", fontWeight: 800 }}>
          {title}
        </Typography>

        <Typography sx={{
          mt: "auto !important",
          fontSize: 16, fontWeight: 800,
          color: "text.primary", lineHeight: 1.45,
          overflowWrap: "anywhere",
        }}>
          {value}
        </Typography>
      </Stack>
    </Box>
  );
}

export default function MenuSetProgrammingTab({
  restaurantId,
  branchId,
  menuSet,
  management,
  loading = false,
  onUpdated,
  onAlert,
}) {
  if (loading) {
    return (
      <Paper sx={panelSx}>
        <Stack spacing={2} alignItems="center" sx={{ py: 5 }}>
          <CircularProgress />

          <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
            Consultando la programación del conjunto…
          </Typography>
        </Stack>
      </Paper>
    );
  }

  if (!management) {
    return (
      <Paper sx={panelSx}>
        <Typography sx={{ fontSize: 18, fontWeight: 800 }}>
          Programación no disponible
        </Typography>

        <Typography sx={{ mt: 1, fontSize: 14, color: "text.secondary" }}>
          No fue posible consultar cómo se administra la programación de este conjunto.
        </Typography>
      </Paper>
    );
  }

  if (management.management_mode === "manual") {
    return (
      <MenuSetCapacityTab
        key={`${branchId}-${menuSet.id}`}
        restaurantId={restaurantId}
        branchId={branchId}
        menuSet={menuSet}
        onUpdated={onUpdated}
        onAlert={onAlert}
      />
    );
  }

  if (management.management_mode !== "mass_import") {
    return (
      <Paper sx={panelSx}>
        <Typography sx={{ fontSize: 18, fontWeight: 800 }}>
          Modalidad no disponible
        </Typography>

        <Typography sx={{ mt: 1, fontSize: 14, color: "text.secondary" }}>
          No se pudo identificar la modalidad de administración del conjunto.
        </Typography>
      </Paper>
    );
  }

  const nextPeriod = management.next_week_start && management.next_week_end
    ? `${formatDate(management.next_week_start)} al ${formatDate(management.next_week_end)}`
    : "No informado";

  return (
    <Stack spacing={3}>
      {/* Encabezado */}
      <Paper sx={panelSx}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1.5}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{
                width: 44, height: 44, borderRadius: 1,
                display: "grid", placeItems: "center",
                bgcolor: "rgba(214, 122, 58, 0.12)",
                color: "secondary.main", flexShrink: 0,
              }}>
                <UploadFileOutlinedIcon />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
                  Programación masiva
                </Typography>

                <Typography sx={{ mt: 0.35, fontSize: 13, color: "text.secondary" }}>
                  Programación comercial por periodos mediante archivos.
                </Typography>
              </Box>
            </Stack>

            <Chip
              size="small"
              label="Administración masiva"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 800 }}
            />
          </Stack>

          <Box sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },
            gridAutoRows: "1fr",
            gap: 1.5,
          }}>
            <SummaryCard
              title="Próximo periodo comercial"
              value={nextPeriod}
              icon={<CalendarMonthOutlinedIcon fontSize="small" />}
            />

            <SummaryCard
              title="Capacidad vigente"
              value={CAPACITY_LABELS[management.effective_capacity_mode] || "No informada"}
              icon={<Inventory2OutlinedIcon fontSize="small" />}
            />

            <SummaryCard
              title="Capacidad de la próxima importación"
              value={CAPACITY_LABELS[management.next_import_capacity_mode] || "No informada"}
              icon={<UploadFileOutlinedIcon fontSize="small" />}
            />
          </Box>
        </Stack>
      </Paper>

      {/* Configuración aplicada */}
      <Paper sx={panelSx}>
        <Stack spacing={2}>
          <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
            Configuración aplicada
          </Typography>

          <Box sx={{
            p: 1.75, borderRadius: 1, border: "1px solid",
            borderColor: "divider", bgcolor: "background.default",
          }}>
            <Typography sx={{ fontSize: 13, fontWeight: 800, color: "text.secondary" }}>
              Origen de la programación
            </Typography>

            <Typography sx={{ mt: 0.5, fontSize: 15, fontWeight: 800, color: "text.primary" }}>
              {getEffectiveSource(management)}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <InfoOutlinedIcon sx={{ color: "primary.main", fontSize: 20, flexShrink: 0 }} />

            <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.6 }}>
              Las cantidades y los días de la siguiente programación se definirán mediante
              una importación. La configuración vigente se conserva hasta que exista una
              publicación aplicable. No se permite modificarla desde el editor manual.
            </Typography>
                    </Stack>
        </Stack>
      </Paper>

      {/* Periodos comerciales y descarga de plantillas */}
      <MenuSetMassImportTab
        restaurantId={restaurantId}
        branchId={branchId}
        menuSet={menuSet}
        management={management}
        onUpdated={onUpdated}
        onAlert={onAlert}
      />
    </Stack>
  );
}